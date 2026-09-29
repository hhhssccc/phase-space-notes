import { resolvedDark } from '../../lib/browser/preferences';
export function mountComments(signal: AbortSignal) {
  document.querySelector('[data-load-comments]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLElement)) return;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.repo = button.dataset.repo || '';
    script.dataset.repoId = button.dataset.repoId || '';
    script.dataset.category = 'Announcements';
    script.dataset.categoryId = button.dataset.categoryId || '';
    script.dataset.mapping = 'pathname';
    script.dataset.strict = '0';
    script.dataset.reactionsEnabled = '1';
    script.dataset.emitMetadata = '0';
    script.dataset.inputPosition = 'top';
    script.dataset.theme = resolvedDark() ? 'dark' : 'light';
    script.dataset.lang = 'zh-CN';
    document.querySelector('[data-comments-root]')?.append(script);
    button.remove();
  }, { once: true, signal });

}
