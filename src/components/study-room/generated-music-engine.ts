import { musicConfig, type SynthVoice } from '../../config/music';

interface VoiceEnvelope {
  attack: number;
  release: number;
  cutoff: number;
  partials: readonly {
    type: OscillatorType;
    ratio: number;
    level: number;
    detune?: number;
  }[];
}

export interface GeneratedMusicEngine {
  readonly context: AudioContext;
  start(volumePercent: number): void;
  pause(): Promise<void>;
  setVolume(volumePercent: number): void;
  close(): Promise<void>;
}

const voiceEnvelopes: Record<SynthVoice, VoiceEnvelope> = {
  felt: {
    attack: 0.018,
    release: 0.82,
    cutoff: 3200,
    partials: [
      { type: 'triangle', ratio: 1, level: 0.82 },
      { type: 'sine', ratio: 2.01, level: 0.16, detune: -3 },
    ],
  },
  glass: {
    attack: 0.035,
    release: 1.35,
    cutoff: 5600,
    partials: [
      { type: 'sine', ratio: 1, level: 0.72 },
      { type: 'sine', ratio: 2.005, level: 0.2, detune: 4 },
      { type: 'sine', ratio: 3.01, level: 0.08, detune: -5 },
    ],
  },
  pad: {
    attack: 0.46,
    release: 1.25,
    cutoff: 1750,
    partials: [
      { type: 'sine', ratio: 1, level: 0.76 },
      { type: 'triangle', ratio: 0.5, level: 0.2, detune: -4 },
    ],
  },
  bass: {
    attack: 0.06,
    release: 0.9,
    cutoff: 720,
    partials: [
      { type: 'sine', ratio: 1, level: 0.86 },
      { type: 'triangle', ratio: 2, level: 0.12 },
    ],
  },
};

const masterGainFor = (percent: number) => (Math.max(0, Math.min(100, percent)) / 100) * 0.74;
const midiToHertz = (midi: number) => 440 * (2 ** ((midi - 69) / 12));

/**
 * Build the generated score graph after an explicit play interaction.
 * The caller creates and resumes the AudioContext synchronously in the click
 * handler so Safari and other strict user-activation implementations remain
 * reliable while this module is fetched lazily.
 */
export function createGeneratedMusicEngine(
  context: AudioContext,
  onUnexpectedSuspend: () => void,
): GeneratedMusicEngine {
  const track = musicConfig.tracks[0];
  if (!track || track.source.kind !== 'generated') {
    throw new Error('The configured track is not a generated score.');
  }

  const source = track.source;
  const input = context.createGain();
  const tone = context.createBiquadFilter();
  const delay = context.createDelay(1.5);
  const feedback = context.createGain();
  const wet = context.createGain();
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const activeSources = new Set<OscillatorNode>();
  let currentStep = 0;
  let nextStepAt = 0;
  let schedulerId: number | undefined;
  let playing = false;

  input.gain.value = 0.86;
  tone.type = 'lowpass';
  tone.frequency.value = 5200;
  tone.Q.value = 0.32;
  delay.delayTime.value = 0.39;
  feedback.gain.value = 0.19;
  wet.gain.value = 0.16;
  master.gain.value = 0;
  compressor.threshold.value = -21;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.32;

  input.connect(tone);
  tone.connect(master);
  tone.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);

  const stopScheduler = () => {
    if (schedulerId !== undefined) window.clearInterval(schedulerId);
    schedulerId = undefined;
  };

  const silenceSources = () => {
    if (context.state !== 'closed') {
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0, now);
      activeSources.forEach((oscillator) => {
        try {
          oscillator.stop(now);
        } catch {
          // The oscillator may already have naturally ended.
        }
      });
    }
    activeSources.clear();
  };

  const scheduleNote = (
    voice: SynthVoice,
    midi: number,
    velocity: number,
    when: number,
    duration: number,
  ) => {
    const profile = voiceEnvelopes[voice];
    const noteGain = context.createGain();
    const filter = context.createBiquadFilter();
    const attackEnd = when + profile.attack;
    const noteEnd = when + Math.max(profile.attack + 0.04, duration);
    const releaseStart = Math.max(attackEnd, noteEnd - profile.release);
    const stopAt = noteEnd + 0.08;

    noteGain.gain.setValueAtTime(0.0001, when);
    noteGain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity), attackEnd);
    noteGain.gain.setValueAtTime(Math.max(0.0002, velocity * 0.82), releaseStart);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(profile.cutoff, when);
    filter.Q.value = voice === 'felt' ? 0.7 : 0.35;
    noteGain.connect(filter);
    filter.connect(input);

    profile.partials.forEach((partial) => {
      const oscillator = context.createOscillator();
      const partialGain = context.createGain();
      oscillator.type = partial.type;
      oscillator.frequency.setValueAtTime(midiToHertz(midi) * partial.ratio, when);
      oscillator.detune.setValueAtTime(partial.detune ?? 0, when);
      partialGain.gain.value = partial.level;
      oscillator.connect(partialGain);
      partialGain.connect(noteGain);
      activeSources.add(oscillator);
      oscillator.addEventListener('ended', () => activeSources.delete(oscillator), { once: true });
      oscillator.start(when);
      oscillator.stop(stopAt);
    });
  };

  const scheduleCurrentStep = (when: number) => {
    const stepDuration = (60 / source.bpm) * source.stepBeats;
    source.score.forEach((note) => {
      if (note.step !== currentStep) return;
      scheduleNote(note.voice, note.midi, note.velocity, when, note.length * stepDuration);
    });
    currentStep = (currentStep + 1) % source.loopSteps;
    nextStepAt += stepDuration;
  };

  const schedulerTick = () => {
    if (!playing || context.state !== 'running') return;
    const stepDuration = (60 / source.bpm) * source.stepBeats;
    if (nextStepAt < context.currentTime - stepDuration) nextStepAt = context.currentTime + 0.02;
    while (nextStepAt < context.currentTime + musicConfig.scheduler.lookAheadSeconds) {
      scheduleCurrentStep(Math.max(nextStepAt, context.currentTime + 0.006));
    }
  };

  const startScheduler = () => {
    nextStepAt = context.currentTime + musicConfig.scheduler.startDelaySeconds;
    schedulerTick();
    schedulerId = window.setInterval(schedulerTick, musicConfig.scheduler.intervalMs);
  };

  const handleStateChange = () => {
    if (!playing || context.state !== 'suspended') return;
    playing = false;
    stopScheduler();
    silenceSources();
    onUnexpectedSuspend();
  };
  context.addEventListener('statechange', handleStateChange);

  return {
    context,
    start(volumePercent) {
      if (context.state !== 'running') throw new Error('AudioContext is not running.');
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(masterGainFor(volumePercent), now);
      playing = true;
      startScheduler();
    },
    async pause() {
      playing = false;
      stopScheduler();
      silenceSources();
      if (context.state === 'running') {
        try {
          await context.suspend();
        } catch {
          // The document may become inactive while suspend() is settling.
        }
      }
    },
    setVolume(volumePercent) {
      if (!playing || context.state !== 'running') return;
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(masterGainFor(volumePercent), now, 0.018);
    },
    async close() {
      playing = false;
      stopScheduler();
      silenceSources();
      context.removeEventListener('statechange', handleStateChange);
      if (context.state !== 'closed') {
        try {
          await context.close();
        } catch {
          // Closing is best-effort during page teardown.
        }
      }
    },
  };
}
