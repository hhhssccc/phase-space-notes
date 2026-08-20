export type SynthVoice = 'felt' | 'glass' | 'pad' | 'bass';

export interface ScoreNote {
  /** Zero-based sequencer step within the loop. */
  step: number;
  /** MIDI note number, converted to hertz by the player engine. */
  midi: number;
  /** Note length measured in sequencer steps. */
  length: number;
  /** Quiet normalized level for this note before the master volume. */
  velocity: number;
  voice: SynthVoice;
}

export interface GeneratedTrackSource {
  kind: 'generated';
  bpm: number;
  stepBeats: number;
  loopSteps: number;
  score: readonly ScoreNote[];
}

/**
 * Boundary for a rights-cleared file stored in this site's own public
 * directory. The generated default never renders or requests this source.
 */
export interface SelfHostedTrackSource {
  kind: 'self-hosted';
  /** Site-root-relative path to a rights-cleared file in public/. */
  src: `/${string}`;
  mimeType: `audio/${string}`;
  loop?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  kicker: string;
  subtitle: string;
  description: string;
  sourceNote: string;
  source: GeneratedTrackSource | SelfHostedTrackSource;
}

export interface MusicConfig {
  defaultVolume: number;
  volumeStorageKey: string;
  /** Maximum time an explicit play request may remain pending. */
  startupTimeoutMs: number;
  scheduler: {
    intervalMs: number;
    lookAheadSeconds: number;
    startDelaySeconds: number;
  };
  tracks: readonly MusicTrack[];
}

const nightDerivationScore = [
  // A slow, original D-minor/add-nine loop. The four pad entries define the
  // harmonic page; sparse felt and glass notes leave room for reading.
  { step: 0, midi: 50, length: 7.5, velocity: 0.075, voice: 'pad' },
  { step: 0, midi: 57, length: 7.5, velocity: 0.052, voice: 'pad' },
  { step: 0, midi: 60, length: 7.5, velocity: 0.044, voice: 'pad' },
  { step: 0, midi: 64, length: 7.5, velocity: 0.038, voice: 'pad' },
  { step: 8, midi: 46, length: 7.5, velocity: 0.075, voice: 'pad' },
  { step: 8, midi: 53, length: 7.5, velocity: 0.052, voice: 'pad' },
  { step: 8, midi: 57, length: 7.5, velocity: 0.044, voice: 'pad' },
  { step: 8, midi: 62, length: 7.5, velocity: 0.038, voice: 'pad' },
  { step: 16, midi: 41, length: 7.5, velocity: 0.075, voice: 'pad' },
  { step: 16, midi: 48, length: 7.5, velocity: 0.052, voice: 'pad' },
  { step: 16, midi: 55, length: 7.5, velocity: 0.044, voice: 'pad' },
  { step: 16, midi: 57, length: 7.5, velocity: 0.038, voice: 'pad' },
  { step: 24, midi: 48, length: 7.5, velocity: 0.075, voice: 'pad' },
  { step: 24, midi: 55, length: 7.5, velocity: 0.052, voice: 'pad' },
  { step: 24, midi: 62, length: 7.5, velocity: 0.044, voice: 'pad' },
  { step: 24, midi: 64, length: 7.5, velocity: 0.038, voice: 'pad' },

  { step: 0, midi: 38, length: 3.2, velocity: 0.115, voice: 'bass' },
  { step: 4, midi: 45, length: 2.7, velocity: 0.072, voice: 'bass' },
  { step: 8, midi: 34, length: 3.2, velocity: 0.11, voice: 'bass' },
  { step: 12, midi: 41, length: 2.7, velocity: 0.068, voice: 'bass' },
  { step: 16, midi: 41, length: 3.2, velocity: 0.105, voice: 'bass' },
  { step: 20, midi: 36, length: 2.7, velocity: 0.066, voice: 'bass' },
  { step: 24, midi: 36, length: 3.2, velocity: 0.105, voice: 'bass' },
  { step: 28, midi: 43, length: 2.7, velocity: 0.066, voice: 'bass' },

  { step: 1, midi: 69, length: 2.4, velocity: 0.14, voice: 'felt' },
  { step: 5, midi: 72, length: 1.7, velocity: 0.105, voice: 'felt' },
  { step: 9, midi: 65, length: 2.6, velocity: 0.13, voice: 'felt' },
  { step: 13, midi: 69, length: 1.7, velocity: 0.1, voice: 'felt' },
  { step: 17, midi: 64, length: 2.4, velocity: 0.13, voice: 'felt' },
  { step: 21, midi: 67, length: 1.7, velocity: 0.1, voice: 'felt' },
  { step: 25, midi: 62, length: 2.6, velocity: 0.125, voice: 'felt' },
  { step: 29, midi: 64, length: 1.6, velocity: 0.095, voice: 'felt' },

  { step: 6, midi: 76, length: 3.6, velocity: 0.055, voice: 'glass' },
  { step: 14, midi: 74, length: 3.6, velocity: 0.052, voice: 'glass' },
  { step: 22, midi: 72, length: 3.6, velocity: 0.052, voice: 'glass' },
  { step: 30, midi: 71, length: 3.6, velocity: 0.05, voice: 'glass' },
] as const satisfies readonly ScoreNote[];

export const musicConfig: MusicConfig = {
  defaultVolume: 28,
  volumeStorageKey: 'asymptotic-freedom-music-volume',
  startupTimeoutMs: 10_000,
  scheduler: {
    intervalMs: 25,
    lookAheadSeconds: 0.12,
    startDelaySeconds: 0.06,
  },
  tracks: [
    {
      id: 'night-derivation',
      title: '夜间推导',
      kicker: 'ORIGINAL STUDY SOUND',
      subtitle: 'NOCTURNAL DERIVATION',
      description: '稀疏键音、玻璃余音与低频铺底组成的安静循环。',
      sourceNote: '可替换的原创默认声景 · 浏览器内实时合成 · 无外部音频请求',
      source: {
        kind: 'generated',
        bpm: 58,
        stepBeats: 0.5,
        loopSteps: 32,
        score: nightDerivationScore,
      },
    },
  ],
};
