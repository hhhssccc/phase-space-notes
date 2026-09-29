import type { MusicTrack } from '../../../config/music';
export function renderTrack(root: HTMLElement, track: MusicTrack, index: number) {
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
}
