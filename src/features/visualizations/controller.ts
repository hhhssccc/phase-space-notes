import { registerPageFeature } from '../../lib/browser/lifecycle';
registerPageFeature('visualizations', signal => {
  const observers: MutationObserver[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  document.querySelectorAll<HTMLElement>('[data-visualization]').forEach(root => {
    const frame = root.querySelector<HTMLIFrameElement>('[data-viz-frame]')!;
    const start = root.querySelector<HTMLButtonElement>('[data-viz-start]')!;
    const reset = root.querySelector<HTMLButtonElement>('[data-viz-reset]')!;
    const preview = root.querySelector<HTMLElement>('[data-viz-preview]')!;
    const status = root.querySelector<HTMLElement>('[data-viz-status]')!;
    let ready = false;
    const theme = () => {
      const preference = document.documentElement.dataset.theme;
      const dark = preference === 'dark' || (preference !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
      frame.contentWindow?.postMessage({ type: 'visualization-theme', theme: dark ? 'dark' : 'light' }, '*');
    };
    const open = () => {
      ready = false;
      start.disabled = true;
      status.textContent = '正在载入图解…';
      frame.hidden = false;
      frame.src = frame.dataset.src!;
      timers.push(setTimeout(() => {
        if (!ready && !signal.aborted) { start.disabled = false; start.hidden = false; start.textContent = '重新载入'; status.textContent = '图解未能载入，请重试或下载后打开。'; }
      }, 12000));
    };
    start.addEventListener('click', open, { signal });
    reset.addEventListener('click', open, { signal });
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || !event.data) return;
      if (event.data.type === 'visualization-size' && Number.isFinite(event.data.height)) frame.style.height = `${Math.max(120, Math.min(5000, event.data.height))}px`;
      if (event.data.type === 'visualization-ready') {
        ready = true; start.disabled = false; start.hidden = true; start.setAttribute('aria-expanded', 'true'); reset.hidden = false; preview.hidden = true; status.textContent = ''; theme(); reset.focus({ preventScroll: true });
      }
    }, { signal });
    const observer = new MutationObserver(theme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] }); observers.push(observer);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', theme, { signal });
  });
  return () => { observers.forEach(observer => observer.disconnect()); timers.forEach(clearTimeout); };
});
