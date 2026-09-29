import { linkFor, type ReadingStore } from './store';
export function renderShelf(store: ReadingStore) {
  for (const kind of ['history', 'bookmarks'] as const) {
    const list = document.querySelector<HTMLOListElement>(`[data-reading-${kind}]`);
    if (!list) continue;
    list.replaceChildren();
    const records = kind === 'history' ? store.shelf.history.slice(0, 5) : store.shelf.bookmarks;
    records.forEach((position, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a'); a.href = linkFor(position); a.textContent = position.title;
      const label = document.createElement('small'); label.textContent = position.label;
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'text-control'; remove.textContent = '移除';
      remove.dataset.readingRemove = kind; remove.dataset.recordIndex = String(index);
      remove.setAttribute('aria-label', `移除${kind === 'history' ? '阅读记录' : '书签'}：${position.title} · ${position.label}`);
      li.append(a, label, remove); list.append(li);
    });
    if (!records.length) {
      const empty = document.createElement('li'); empty.className = 'shelf-empty';
      empty.textContent = kind === 'history' ? '读过文章后，会在这里留下位置。' : '在文章中点“夹一枚书签”，保存当前读到的地方。'; list.append(empty);
    }
  }
  const count = document.querySelector('[data-bookmark-count]'); if (count) count.textContent = `(${store.shelf.bookmarks.length})`;
  const clear = document.querySelector<HTMLButtonElement>('[data-clear-reading]'); if (clear) clear.hidden = !store.shelf.history.length;
  const note = document.querySelector('[data-reading-storage-note]');
  if (note) note.textContent = store.available ? '阅读位置与书签只保存在当前浏览器。' : '浏览器未允许保存；本次浏览期间仍可使用书签。';
}
