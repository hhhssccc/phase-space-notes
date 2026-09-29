export function mountProgress(signal: AbortSignal) {
  // Modern browsers drive the indicator without JS scroll/layout work.
  // Keep the ordinary full-document layout and a frame-coalesced fallback.
  const progress = document.querySelector('[data-reading-progress]');
  if (!(progress instanceof HTMLElement)) return;
  // Check the delivered CSS, not just API support: malformed/minified CSS
  // must also take the fallback instead of silently losing the indicator.
  const nativeProgress = progress instanceof HTMLElement
    && getComputedStyle(progress).getPropertyValue('animation-timeline') === '--article-reading';
  if (!nativeProgress) {
    if (progress instanceof HTMLElement) progress.style.animation = 'none';
    const article = document.querySelector('.article-main');
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      if (!(progress instanceof HTMLElement) || !(article instanceof HTMLElement)) return;
      const start = article.offsetTop;
      const total = article.offsetHeight - window.innerHeight;
      const amount = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(total, 1)));
      progress.style.transform = `scaleX(${amount})`;
    };
    const scheduleProgress = () => {
      if (!signal.aborted && !frame) frame = requestAnimationFrame(updateProgress);
    };
    signal.addEventListener('abort', () => cancelAnimationFrame(frame), { once: true });
    scheduleProgress();
    addEventListener('scroll', scheduleProgress, { passive: true, signal });
    addEventListener('resize', scheduleProgress, { signal });
    addEventListener('load', scheduleProgress, { once: true, signal });
    document.fonts.ready.then(scheduleProgress);
  }

}
