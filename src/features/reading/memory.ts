import { registerPageFeature } from '../../lib/browser/lifecycle';
import { closeStudyRoom } from '../study-room/drawer-api';
import { createReadingStore, readingStorageKey, linkFor } from './store';
import { renderShelf } from './shelf';
import { articlePosition } from './position';
let storage: Storage | undefined;
try { storage = localStorage; } catch { /* Memory-only shelf. */ }
const store = createReadingStore(storage, import.meta.env.BASE_URL);
registerPageFeature('reading-memory', signal => {
  renderShelf(store);
  const article = document.querySelector<HTMLElement>('[data-reading-article]');
  const shelfButton = document.querySelector<HTMLButtonElement>('[data-shelf-bookmark]');
  if (shelfButton) shelfButton.hidden = !article;
  let moved = false; let suppressSave = false; let timer = 0;
  const { position, restore } = articlePosition(article);
  const save = () => {
    if (!moved || suppressSave) return;
    const p = position(); if (!p) return;
    store.remember(p); renderShelf(store); moved = false;
  };
  const last = store.shelf.history.find(item => item.path === location.pathname);
  const resume = document.querySelector<HTMLAnchorElement>('[data-resume-reading]');
  if (resume && last) { resume.href = linkFor(last); resume.textContent = `继续上次：${last.label}`; resume.hidden = false; }
  document.querySelectorAll('[data-add-bookmark]').forEach(button => button.addEventListener('click', () => {
    const p = position(); if (!p) return;
    const duplicate = !store.bookmark(p); renderShelf(store);
    document.querySelectorAll('[data-reading-status]').forEach(status => { status.textContent = duplicate ? '这个位置已有书签。' : `已夹好书签：${p.label}。可在书房查看。`; });
  }, { signal }));
  document.querySelector('[data-clear-reading]')?.addEventListener('click', () => {
    store.clearHistory(); renderShelf(store); moved = false; suppressSave = true;
    if (resume) resume.hidden = true;
  }, { signal });
  // Handle same-page links too: Astro does not swap a page for fragment navigation.
  document.addEventListener('click', event => {
    const a = (event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
    if (!a || (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey) return;
    const url = new URL(a.href); const offset = Number(url.searchParams.get('read'));
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.searchParams.has('read') || !Number.isFinite(offset)) return;
    event.preventDefault();
    closeStudyRoom();
    restore(decodeURIComponent(url.hash.slice(1)), Math.min(1, Math.max(0, offset)));
    moved = true; save();
  }, { signal });
  if (article) {
    const record = () => { moved = true; suppressSave = false; save(); };
    if (Reflect.has(window, 'onscrollend')) window.addEventListener('scrollend', record, { passive: true, signal });
    else window.addEventListener('scroll', () => { moved = true; suppressSave = false; clearTimeout(timer); timer = window.setTimeout(save, 700); }, { passive: true, signal });
    window.addEventListener('pagehide', save, { signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); }, { signal });
    const requested = new URLSearchParams(location.search).get('read');
    if (requested !== null && Number.isFinite(Number(requested))) {
      document.fonts.ready.then(() => { if (!signal.aborted) restore(decodeURIComponent(location.hash.slice(1)), Math.min(1, Math.max(0, Number(requested)))); });
    }
  }
  document.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('[data-reading-remove]');
    if (!button) return;
    const kind = button.dataset.readingRemove;
    if (kind !== 'history' && kind !== 'bookmarks') return;
    store.remove(kind, Number(button.dataset.recordIndex)); renderShelf(store);
    const status = document.querySelector('[data-shelf-status]'); if (status) status.textContent = '已移除。';
  }, { signal });
  return () => { save(); clearTimeout(timer); };
});
window.addEventListener('storage', event => {
  if (event.key !== readingStorageKey) return;
  store.reload(event.newValue); renderShelf(store);
});
