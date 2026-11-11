import { linkFor, type ReadingStore } from './store';
interface ShelfEntry { title?: string; category?: string; preview?: string; }
let catalogNode: Element | null;
let catalog: Record<string, ShelfEntry> = {};
const svg = (path: string, className = '') => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('stroke-width', '1.5');
  icon.setAttribute('aria-hidden', 'true'); if (className) icon.setAttribute('class', className);
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line.setAttribute('d', path); icon.append(line); return icon;
};
function readCatalog() {
  const node = document.querySelector('[data-reading-catalog]');
  if (node === catalogNode) return;
  catalogNode = node;
  try { catalog = JSON.parse(node?.textContent || '{}'); } catch { catalog = {}; }
}
export function renderShelf(store: ReadingStore) {
  readCatalog();
  for (const kind of ['history', 'bookmarks'] as const) {
    const list = document.querySelector<HTMLOListElement>(`[data-reading-${kind}]`);
    if (!list) continue;
    list.replaceChildren();
    const records = kind === 'history' ? store.shelf.history.slice(0, 5) : store.shelf.bookmarks;
    records.forEach((position, index) => {
      const entry = catalog[position.path];
      const title = typeof entry?.title === 'string' ? entry.title : position.title;
      const li = document.createElement('li'); li.className = 'shelf-record';
      const a = document.createElement('a'); a.href = linkFor(position);
      if (kind === 'history') {
        const cover = document.createElement('span'); cover.className = 'shelf-cover'; cover.setAttribute('aria-hidden', 'true');
        if (typeof entry?.preview === 'string' && entry.preview.startsWith('/') && !entry.preview.startsWith('//')) {
          const image = document.createElement('img'); image.src = entry.preview;
          image.alt = ''; image.width = 640; image.height = 400; image.loading = 'lazy'; image.decoding = 'async'; cover.append(image);
        } else cover.append(svg('M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5Z'));
        a.append(cover);
      } else a.append(svg('M6 3h12v18l-6-4-6 4V3Z', 'shelf-bookmark-icon'));
      const copy = document.createElement('span'); copy.className = 'shelf-copy';
      if (kind === 'history' && entry?.category) {
        const category = document.createElement('span'); category.className = 'shelf-category';
        category.textContent = `${index === 0 ? '上次阅读 · ' : ''}${entry.category}`; copy.append(category);
      }
      const heading = document.createElement('span'); heading.className = 'shelf-record-title'; heading.textContent = title;
      const section = document.createElement('span'); section.className = 'shelf-section'; section.textContent = position.label;
      const progressRow = document.createElement('span'); progressRow.className = 'shelf-progress';
      const progress = document.createElement('progress'); progress.max = 1; progress.value = position.offset;
      const percent = Math.round(position.offset * 100);
      progress.setAttribute('aria-label', `${position.label}，本节进度 ${percent}%`);
      const amount = document.createElement('small'); amount.textContent = `本节 ${percent}%`;
      progressRow.append(progress, amount); copy.append(heading, section, progressRow); a.append(copy);
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'shelf-remove'; remove.append(svg('m6 6 12 12M18 6 6 18'));
      remove.dataset.readingRemove = kind; remove.dataset.recordIndex = String(index);
      remove.setAttribute('aria-label', `移除${kind === 'history' ? '阅读记录' : '书签'}：${position.title} · ${position.label}`);
      li.append(a, remove); list.append(li);
    });
    if (!records.length) {
      const empty = document.createElement('li'); empty.className = 'shelf-empty';
      empty.textContent = kind === 'history' ? '读过文章后，会在这里留下位置。' : '在文章中点“夹一枚书签”，保存当前读到的地方。';
      if (kind === 'history') {
        const href = list.closest<HTMLElement>('[data-reading-browse-url]')?.dataset.readingBrowseUrl;
        if (href) { const link = document.createElement('a'); link.href = href; link.textContent = '找一篇文章开始'; empty.append(link); }
      }
      list.append(empty);
    }
  }
  const count = document.querySelector('[data-bookmark-count]'); if (count) count.textContent = String(store.shelf.bookmarks.length);
  const clear = document.querySelector<HTMLButtonElement>('[data-clear-reading]'); if (clear) clear.hidden = !store.shelf.history.length;
  const note = document.querySelector('[data-reading-storage-note]');
  if (note) note.textContent = store.available ? '阅读位置与书签只保存在当前浏览器。' : '浏览器未允许保存；本次浏览期间仍可使用书签。';
}
