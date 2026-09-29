import type { MusicTrack } from '../../../config/music';
export function mediaTrack(track: MusicTrack) {
  if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, album: '渐近自由 · 书房音乐' });
  }
}
export function mediaProgress(audio: HTMLAudioElement) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.setPositionState({
      duration: audio.duration, playbackRate: audio.playbackRate,
      position: Math.min(audio.duration, Math.max(0, audio.currentTime))
    });
  } catch { /* Partial support. */ }
}
export function bindMediaActions(actions: Partial<Record<MediaSessionAction, MediaSessionActionHandler>>) {
  if (!('mediaSession' in navigator)) return () => { };
  for (const [action, handler] of Object.entries(actions)) {
    try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler!); } catch { /* Partial support. */ }
  }
  return () => {
    for (const action of Object.keys(actions)) {
      try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, null); } catch { /* Partial support. */ }
    }
  };
}
