import { musicConfig } from '../../config/music';
import { withBase } from '../../lib/content';

type Mode = 'list' | 'one' | 'shuffle' | 'order';
const storageKey = 'asymptotic-freedom-music-session';
const modes: Mode[] = ['list', 'one', 'shuffle', 'order'];
const time = (seconds: number) => {
  const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
};

export function setupPlaylist(root: HTMLElement, audio: HTMLAudioElement, controls: {
  play: () => void; pause: () => void; title: (title: string) => void;
}) {
  const seek = root.querySelector<HTMLInputElement>('[data-seek]')!;
  const elapsed = root.querySelector<HTMLOutputElement>('[data-elapsed]')!;
  const duration = root.querySelector<HTMLOutputElement>('[data-duration]')!;
  const modeSelect = root.querySelector<HTMLSelectElement>('[data-play-mode]')!;
  const sleep = root.querySelector<HTMLSelectElement>('[data-sleep]')!;
  const sleepStatus = root.querySelector<HTMLElement>('[data-sleep-status]')!;
  const mute = root.querySelector<HTMLButtonElement>('[data-mute]')!;
  const indices = musicConfig.tracks.flatMap((track, index) => track.source.kind === 'self-hosted' ? [index] : []);
  let index = indices[0];
  let mode: Mode = 'list';
  let pendingPosition = 0;
  let loaded = false;
  let lastSaved = 0;
  let timer = 0;
  let deadline = 0;
  let bag: number[] = [];
  const history: number[] = [];

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      const found = indices.find(i => musicConfig.tracks[i].id === saved.id);
      if (found !== undefined) index = found;
      if (modes.includes(saved.mode)) mode = saved.mode;
      if (found !== undefined && Number.isFinite(saved.position) && saved.position >= 0) pendingPosition = saved.position;
      audio.muted = saved.muted === true;
    }
  } catch { /* Storage is optional, including in private browsing. */ }

  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        id: musicConfig.tracks[index].id, mode, muted: audio.muted,
        position: loaded ? (audio.ended ? 0 : audio.currentTime) : pendingPosition,
      }));
    } catch { /* Playback does not depend on storage. */ }
  };
  const updateProgress = () => {
    const valid = loaded && Number.isFinite(audio.duration) && audio.duration > 0;
    seek.disabled = !valid;
    seek.max = valid ? String(audio.duration) : '0';
    seek.value = valid ? String(audio.currentTime) : '0';
    elapsed.value = time(loaded ? audio.currentTime : pendingPosition);
    duration.value = valid ? time(audio.duration) : '--:--';
    seek.setAttribute('aria-valuetext', `${elapsed.value} / ${duration.value}`);
    if ('mediaSession' in navigator && valid) {
      try {
        navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate,
          position: Math.min(audio.duration, Math.max(0, audio.currentTime)) });
      } catch { /* Some browsers expose only part of Media Session. */ }
    }
  };
  const updateTrack = () => {
    const track = musicConfig.tracks[index];
    controls.title(track.title);
    root.dataset.trackTitle = track.title;
    root.setAttribute('aria-label', `${track.title}音乐播放器`);
    root.querySelector('[data-music-toggle]')?.setAttribute('aria-label', `播放${track.title}`);
    for (const [selector, text] of [
      ['.track-title', track.title], ['.track-kicker', track.kicker],
      ['.track-subtitle', track.subtitle], ['.track-description', track.description],
      ['.source-note > span', track.sourceNote],
    ]) {
      const element = root.querySelector(selector);
      if (element) element.textContent = text;
    }
    const link = root.querySelector<HTMLAnchorElement>('.source-note a');
    if (link) {
      link.hidden = !track.sourceUrl;
      link.href = track.sourceUrl || '#';
      link.textContent = track.sourceLabel || '来源页面';
    }
    root.querySelectorAll<HTMLButtonElement>('[data-select-track]').forEach(button => {
      button.setAttribute('aria-current', String(Number(button.dataset.selectTrack) === index));
    });
    if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, album: '渐近自由 · 书房音乐' });
    }
    updateProgress();
  };
  const select = (next: number, play: boolean, record = true) => {
    if (!indices.includes(next)) return;
    controls.pause();
    if (record && next !== index) history.push(index);
    if (history.length > 100) history.shift();
    index = next;
    pendingPosition = 0;
    loaded = false;
    const track = musicConfig.tracks[index];
    if (track.source.kind !== 'self-hosted') return;
    audio.src = withBase(track.source.src);
    updateTrack();
    save();
    if (play) controls.play();
  };
  const next = (automatic = false) => {
    if (automatic && mode === 'one') { select(index, true, false); return; }
    if (mode === 'shuffle') {
      if (!bag.length) bag = indices.filter(i => i !== index);
      const choice = Math.floor(Math.random() * bag.length);
      select(bag.length ? bag.splice(choice, 1)[0] : index, true);
      return;
    }
    const position = indices.indexOf(index);
    if (automatic && mode === 'order' && position === indices.length - 1) { save(); return; }
    select(indices[(position + 1) % indices.length], true);
  };
  const previous = () => {
    if (loaded && audio.currentTime > 3) { audio.currentTime = 0; updateProgress(); save(); return; }
    const prior = history.pop();
    select(prior ?? indices[(indices.indexOf(index) - 1 + indices.length) % indices.length], true, false);
    bag = [];
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
  });
  document.addEventListener('visibilitychange', () => { checkTimer(); save(); });
  seek.addEventListener('input', () => seekTo(Number(seek.value)));
  modeSelect.value = mode;
  modeSelect.addEventListener('change', () => { mode = modeSelect.value as Mode; bag = []; save(); });
  root.querySelector('[data-next]')?.addEventListener('click', () => next());
  root.querySelector('[data-previous]')?.addEventListener('click', previous);
  root.querySelectorAll<HTMLButtonElement>('[data-select-track]').forEach(button => {
    button.addEventListener('click', () => { bag = []; select(Number(button.dataset.selectTrack), true); });
  });
  const updateMute = () => {
    mute.setAttribute('aria-pressed', String(audio.muted));
    mute.textContent = audio.muted ? '取消静音' : '静音';
  };
  mute.addEventListener('click', () => { audio.muted = !audio.muted; updateMute(); save(); });
  root.querySelector('[data-music-volume]')?.addEventListener('input', () => { audio.muted = false; updateMute(); save(); });
  audio.addEventListener('loadedmetadata', () => {
    loaded = true;
    if (pendingPosition > 0 && Number.isFinite(audio.duration)) {
      audio.currentTime = pendingPosition < audio.duration ? pendingPosition : 0;
      pendingPosition = 0;
    }
    updateProgress();
  });
  audio.addEventListener('durationchange', updateProgress);
  audio.addEventListener('timeupdate', () => {
    updateProgress(); checkTimer();
    if (Date.now() - lastSaved > 3000) { save(); lastSaved = Date.now(); }
  });
  audio.addEventListener('pause', save);
  audio.addEventListener('playing', () => {
    if (!deadline && sleep.value === '0') sleepStatus.textContent = '';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  });
  audio.addEventListener('pause', () => {
    if ('mediaSession' in navigator && audio.paused) navigator.mediaSession.playbackState = 'paused';
  });
  if ('mediaSession' in navigator) {
    const actions: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: controls.play, pause: controls.pause, previoustrack: previous, nexttrack: () => next(),
      seekto: details => seekTo(details.seekTime ?? audio.currentTime),
      seekbackward: details => seekTo(audio.currentTime - (details.seekOffset ?? 10)),
      seekforward: details => seekTo(audio.currentTime + (details.seekOffset ?? 10)),
    };
    for (const [action, handler] of Object.entries(actions)) {
      try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler!); } catch { /* Unsupported action. */ }
    }
  }
  const track = musicConfig.tracks[index];
  if (index !== indices[0] && track.source.kind === 'self-hosted') audio.src = withBase(track.source.src);
  audio.loop = false;
  updateTrack();
  updateMute();
  return {
    save, clearTimer,
    ended: () => {
      if (sleep.value === 'end' || (deadline && Date.now() >= deadline)) {
        clearTimer(); controls.pause(); sleepStatus.textContent = '已定时停止'; save(); return;
      }
      next(true);
    },
  };
}
