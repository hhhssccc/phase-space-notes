interface Position { path: string; title: string; section: string; label: string; offset: number; updated: number }
interface Shelf { history: Position[]; bookmarks: Position[] }
const key = 'asymptotic-freedom-reading-v1';
let shelf: Shelf = { history: [], bookmarks: [] };
let storageAvailable = true;
const valid = (item: unknown): item is Position => {
  if (!item || typeof item !== 'object') return false;
  const p = item as Position;
  return typeof p.path === 'string' && p.path.startsWith(import.meta.env.BASE_URL)
    && /^\/(?:[a-z0-9-]+\/)*(?:articles|notes)\/[a-z0-9-]+\/$/.test(p.path)
    && ['title', 'section', 'label'].every(k => typeof (p as unknown as Record<string, unknown>)[k] === 'string')
    && Number.isFinite(p.offset) && p.offset >= 0 && p.offset <= 1 && Number.isFinite(p.updated);
};
try {
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  shelf = { history: (Array.isArray(saved.history) ? saved.history : []).filter(valid).slice(0, 40), bookmarks: (Array.isArray(saved.bookmarks) ? saved.bookmarks : []).filter(valid) };
} catch { storageAvailable = false; }
const persist = () => {
  try { localStorage.setItem(key, JSON.stringify(shelf)); storageAvailable = true; } catch { storageAvailable = false; }
};
const linkFor = (p: Position) => `${p.path}?read=${p.offset.toFixed(4)}#${encodeURIComponent(p.section)}`;
function renderShelf() {
  for (const kind of ['history', 'bookmarks'] as const) {
    const list = document.querySelector<HTMLOListElement>(`[data-reading-${kind}]`);
    if (!list) continue;
    list.replaceChildren();
    const records = kind === 'history' ? shelf.history.slice(0, 5) : shelf.bookmarks;
    for (const p of records) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = linkFor(p); a.textContent = p.title;
      const label = document.createElement('small'); label.textContent = p.label;
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'text-control'; remove.textContent = '移除';
      remove.setAttribute('aria-label', `移除${kind === 'history' ? '阅读记录' : '书签'}：${p.title} · ${p.label}`);
      remove.addEventListener('click', () => {
        shelf[kind] = shelf[kind].filter(item => item !== p); persist(); renderShelf();
        document.querySelector<HTMLElement>('[data-shelf-status]')!.textContent = '已移除。';
      });
      li.append(a, label, remove); list.append(li);
    }
    if (!records.length) {
      const empty = document.createElement('li'); empty.className = 'shelf-empty';
      empty.textContent = kind === 'history' ? '读过文章后，会在这里留下位置。' : '在文章中点“夹一枚书签”，保存当前读到的地方。'; list.append(empty);
    }
  }
  const count = document.querySelector('[data-bookmark-count]'); if (count) count.textContent = `(${shelf.bookmarks.length})`;
  const clear = document.querySelector<HTMLButtonElement>('[data-clear-reading]'); if (clear) clear.hidden = !shelf.history.length;
  const note = document.querySelector('[data-reading-storage-note]');
  if (note) note.textContent = storageAvailable ? '阅读位置与书签只保存在当前浏览器。' : '浏览器未允许保存；本次浏览期间仍可使用书签。';
}
let cleanup = () => {};
document.addEventListener('astro:before-swap', () => cleanup());
document.addEventListener('astro:page-load', () => {
  cleanup(); renderShelf();
  const controller = new AbortController(); const { signal } = controller;
  const article = document.querySelector<HTMLElement>('[data-reading-article]');
  const shelfButton = document.querySelector<HTMLButtonElement>('[data-shelf-bookmark]');
  if (shelfButton) shelfButton.hidden = !article;
  let moved = false; let suppressSave = false; let timer = 0;
  const headings = article ? [...article.querySelectorAll<HTMLElement>('.article-prose h2[id], .article-prose h3[id]')] : [];
  const position = (): Position | null => {
    if (!article) return null;
    const y = window.scrollY + 110;
    let target: HTMLElement = article;
    let end = article.getBoundingClientRect().bottom + scrollY;
    for (const h of headings) {
      const top = h.getBoundingClientRect().top + scrollY;
      if (top <= y) target = h; else { end = top; break; }
    }
    const top = target.getBoundingClientRect().top + scrollY;
    return { path: location.pathname, title: article.dataset.readingTitle || '', section: target.id,
      label: target === article ? '文章开头' : target.textContent?.trim() || '正文',
      offset: Math.min(1, Math.max(0, (y - top) / Math.max(1, end - top))), updated: Date.now() };
  };
  const save = () => {
    if (!moved || suppressSave) return;
    const p = position(); if (!p) return;
    shelf.history = [p, ...shelf.history.filter(item => item.path !== p.path)].slice(0, 40);
    persist(); renderShelf(); moved = false;
  };
  const restore = (section: string, offset: number) => {
    const target = document.getElementById(section); if (!target || !article?.contains(target) && target !== article) return;
    const index = headings.indexOf(target);
    const end = (index < 0 ? headings[0] : headings[index + 1]) || article;
    const top = target.getBoundingClientRect().top + scrollY;
    const bottom = end === article ? article.getBoundingClientRect().bottom + scrollY : end.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: Math.max(0, top + offset * (bottom - top) - 110), behavior: 'instant' });
  };
  const last = shelf.history.find(item => item.path === location.pathname);
  const resume = document.querySelector<HTMLAnchorElement>('[data-resume-reading]');
  if (resume && last) { resume.href = linkFor(last); resume.textContent = `继续上次：${last.label}`; resume.hidden = false; }
  document.querySelectorAll('[data-add-bookmark]').forEach(button => button.addEventListener('click', () => {
    const p = position(); if (!p) return;
    const duplicate = shelf.bookmarks.some(item => item.path === p.path && item.section === p.section && Math.abs(item.offset - p.offset) < .015);
    if (!duplicate) { shelf.bookmarks = [p, ...shelf.bookmarks]; persist(); renderShelf(); }
    document.querySelectorAll('[data-reading-status]').forEach(status => { status.textContent = duplicate ? '这个位置已有书签。' : `已夹好书签：${p.label}。可在书房查看。`; });
  }, { signal }));
  document.querySelector('[data-clear-reading]')?.addEventListener('click', () => {
    shelf.history = []; persist(); renderShelf(); moved = false; suppressSave = true;
    if (resume) resume.hidden = true;
  }, { signal });
  // Handle same-page links too: Astro does not swap a page for fragment navigation.
  document.addEventListener('click', event => {
    const a = (event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
    if (!a || (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey) return;
    const url = new URL(a.href); const offset = Number(url.searchParams.get('read'));
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.searchParams.has('read') || !Number.isFinite(offset)) return;
    event.preventDefault();
    document.querySelector<HTMLButtonElement>('[data-study-close]')?.click();
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
  cleanup = () => { save(); controller.abort(); clearTimeout(timer); };
});
window.addEventListener('storage', event => {
  if (event.key !== key) return;
  try { const next = JSON.parse(event.newValue || '{}'); shelf = { history: (next.history || []).filter(valid).slice(0, 40), bookmarks: (next.bookmarks || []).filter(valid) }; renderShelf(); } catch { /* Ignore malformed data from another tab. */ }
});
