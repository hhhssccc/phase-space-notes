import { createMusicSession } from './session';
const sessions = new WeakMap<HTMLElement, ReturnType<typeof createMusicSession>>();
/** The persisted drawer owns one session for the entire document lifetime. */
export function initializeMusic() {
  const player = document.querySelector<HTMLElement>('[data-music-player]');
  if (!player || sessions.has(player)) return;
  sessions.set(player, createMusicSession(player));
}
