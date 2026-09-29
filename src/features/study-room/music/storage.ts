import { readStorage, writeStorage } from '../../../lib/browser/storage';
export function readVolume(key: string, fallback: number) {
  const raw = readStorage(key);
  if (raw === null || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 100 ? value : fallback;
}
export const saveVolume = (key: string, value: number) => writeStorage(key, String(value));
const sessionKey = 'asymptotic-freedom-music-session';
export function readMusicSession(): { id?: string; mode?: string; muted?: boolean; position?: number } | null {
  try { const value = JSON.parse(readStorage(sessionKey) || 'null'); return value && typeof value === 'object' ? value : null; } catch { return null; }
}
export function saveMusicSession(value: { id: string; mode: string; muted: boolean; position: number }) {
  writeStorage(sessionKey, JSON.stringify(value));
}
