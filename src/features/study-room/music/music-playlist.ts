import { createPlaylistState } from './playlist-state';
import { readMusicSession, saveMusicSession } from './storage';
import { mediaTrack, mediaProgress, bindMediaActions } from './media-session';
import { renderTrack } from './playlist-view';
import { musicConfig } from '../../../config/music';
import { withBase } from '../../../lib/content';

const time = (seconds: number) => {
  const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
};

export function setupPlaylist(root: HTMLElement, audio: HTMLAudioElement, controls: {
  play: () => void; pause: () => void; title: (title: string) => void;
}) {
  const lifetime = new AbortController(); const lifetimeSignal = lifetime.signal;
  const seek = root.querySelector<HTMLInputElement>('[data-seek]')!;
  const elapsed = root.querySelector<HTMLOutputElement>('[data-elapsed]')!;
  const duration = root.querySelector<HTMLOutputElement>('[data-duration]')!;
  const modeSelect = root.querySelector<HTMLSelectElement>('[data-play-mode]')!;
  const sleep = root.querySelector<HTMLSelectElement>('[data-sleep]')!;
  const sleepStatus = root.querySelector<HTMLElement>('[data-sleep-status]')!;
  const mute = root.querySelector<HTMLButtonElement>('[data-mute]')!;
  const indices = musicConfig.tracks.flatMap((track, index) => track.source.kind === 'self-hosted' ? [index] : []);
  const state = createPlaylistState(indices);
  let pendingPosition = 0;
  let loaded = false;
  let lastSaved = 0;
  let timer = 0;
  let deadline = 0;
  const saved = readMusicSession();
  if (saved) {
    const found = indices.find(i => musicConfig.tracks[i].id === saved.id);
    if (found !== undefined) state.select(found, false);
    state.setMode(saved.mode || 'list');
    if (found !== undefined && typeof saved.position === 'number' && Number.isFinite(saved.position) && saved.position >= 0) pendingPosition = saved.position;
    audio.muted = saved.muted === true;
  }
  const save = () => saveMusicSession({
    id: musicConfig.tracks[state.index].id, mode: state.mode, muted: audio.muted,
    position: loaded ? (audio.ended ? 0 : audio.currentTime) : pendingPosition
  });
  const updateProgress = () => {
    const valid = loaded && Number.isFinite(audio.duration) && audio.duration > 0;
    seek.disabled = !valid;
    seek.max = valid ? String(audio.duration) : '0';
    seek.value = valid ? String(audio.currentTime) : '0';
    elapsed.value = time(loaded ? audio.currentTime : pendingPosition);
    duration.value = valid ? time(audio.duration) : '--:--';
    seek.setAttribute('aria-valuetext', `${elapsed.value} / ${duration.value}`);
    if (valid) mediaProgress(audio);
  };
  const updateTrack = () => {
    const track = musicConfig.tracks[state.index];
    controls.title(track.title); renderTrack(root, track, state.index);
    mediaTrack(track);
    updateProgress();
  };
  const select = (next: number, play: boolean, record = true) => {
    if (!indices.includes(next)) return;
    controls.pause();
    state.select(next, record);
    pendingPosition = 0;
    loaded = false;
    const track = musicConfig.tracks[state.index];
    if (track.source.kind !== 'self-hosted') return;
    audio.src = withBase(track.source.src);
    updateTrack();
    save();
    if (play) controls.play();
  };
  const next = (automatic = false) => {
    const chosen = state.next(automatic);
    if (chosen === null) { save(); return; }
    select(chosen, true, !(automatic && state.mode === 'one'));
  };
  const previous = () => {
    if (loaded && audio.currentTime > 3) { audio.currentTime = 0; updateProgress(); save(); return; }
    select(state.previous(), true, false);
  };
  const seekTo = (value: number) => {
    if (!loaded || !Number.isFinite(audio.duration) || !Number.isFinite(value)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, value));
    updateProgress();
    save();
  };
  const clearTimer = () => {
    window.clearInterval(timer);
    timer = 0;
    deadline = 0;
    sleep.value = '0';
    sleepStatus.textContent = '';
  };
  const checkTimer = () => {
    if (!deadline) return;
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      clearTimer(); controls.pause();
      sleepStatus.textContent = '已定时停止';
    } else sleepStatus.textContent = `${time(Math.ceil(remaining / 1000))} 后停止`;
  };
  sleep.addEventListener('change', () => {
    const value = sleep.value;
    clearTimer();
    sleep.value = value;
    if (value === 'end') { sleepStatus.textContent = '本曲结束后停止'; return; }
    if (Number(value) > 0) {
      deadline = Date.now() + Number(value) * 60_000;
      timer = window.setInterval(checkTimer, 1000);
      checkTimer();
    }
  }, { signal: lifetimeSignal });
  document.addEventListener('visibilitychange', () => { checkTimer(); save(); }, { signal: lifetimeSignal });
  seek.addEventListener('input', () => seekTo(Number(seek.value)), { signal: lifetimeSignal });
  modeSelect.value = state.mode;
  modeSelect.addEventListener('change', () => { state.setMode(modeSelect.value); save(); }, { signal: lifetimeSignal });
  root.querySelector('[data-next]')?.addEventListener('click', () => next(), { signal: lifetimeSignal });
  root.querySelector('[data-previous]')?.addEventListener('click', previous, { signal: lifetimeSignal });
  root.querySelectorAll<HTMLButtonElement>('[data-select-track]').forEach(button => {
    button.addEventListener('click', () => { state.resetShuffle(); select(Number(button.dataset.selectTrack), true); }, { signal: lifetimeSignal });
  });
  const updateMute = () => {
    mute.setAttribute('aria-pressed', String(audio.muted));
    mute.textContent = audio.muted ? '取消静音' : '静音';
  };
  mute.addEventListener('click', () => { audio.muted = !audio.muted; updateMute(); save(); }, { signal: lifetimeSignal });
  root.querySelector('[data-music-volume]')?.addEventListener('input', () => { audio.muted = false; updateMute(); save(); }, { signal: lifetimeSignal });
  audio.addEventListener('loadedmetadata', () => {
    loaded = true;
    if (pendingPosition > 0 && Number.isFinite(audio.duration)) {
      audio.currentTime = pendingPosition < audio.duration ? pendingPosition : 0;
      pendingPosition = 0;
    }
    updateProgress();
  }, { signal: lifetimeSignal });
  audio.addEventListener('durationchange', updateProgress, { signal: lifetimeSignal });
  audio.addEventListener('timeupdate', () => {
    updateProgress(); checkTimer();
    if (Date.now() - lastSaved > 3000) { save(); lastSaved = Date.now(); }
  }, { signal: lifetimeSignal });
  audio.addEventListener('pause', save, { signal: lifetimeSignal });
  audio.addEventListener('playing', () => {
    if (!deadline && sleep.value === '0') sleepStatus.textContent = '';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  }, { signal: lifetimeSignal });
  audio.addEventListener('pause', () => {
    if ('mediaSession' in navigator && audio.paused) navigator.mediaSession.playbackState = 'paused';
  }, { signal: lifetimeSignal });
  const actions: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
    play: controls.play, pause: controls.pause, previoustrack: previous, nexttrack: () => next(),
    seekto: details => seekTo(details.seekTime ?? audio.currentTime),
    seekbackward: details => seekTo(audio.currentTime - (details.seekOffset ?? 10)),
    seekforward: details => seekTo(audio.currentTime + (details.seekOffset ?? 10)),
  };
  const releaseMedia = bindMediaActions(actions);
  const track = musicConfig.tracks[state.index];
  if (state.index !== indices[0] && track.source.kind === 'self-hosted') audio.src = withBase(track.source.src);
  audio.loop = false;
  updateTrack();
  updateMute();
  return {
    save, clearTimer, dispose: () => { save(); clearTimer(); lifetime.abort(); releaseMedia(); },
    ended: () => {
      if (sleep.value === 'end' || (deadline && Date.now() >= deadline)) {
        clearTimer(); controls.pause(); sleepStatus.textContent = '已定时停止'; save(); return;
      }
      next(true);
    },
  };
}
