export interface Position { path: string; title: string; section: string; label: string; offset: number; updated: number }
export interface Shelf { history: Position[]; bookmarks: Position[] }
export const readingStorageKey = 'asymptotic-freedom-reading-v1';
export const linkFor = (position: Position) => `${position.path}?read=${position.offset.toFixed(4)}#${encodeURIComponent(position.section)}`;

export function parseShelf(raw: string | null, base: string): Shelf {
  const valid = (item: unknown): item is Position => {
    if (!item || typeof item !== 'object') return false;
    const p = item as Position;
    return typeof p.path === 'string' && p.path.startsWith(base)
      && /^\/(?:[a-z0-9-]+\/)*(?:articles|notes)\/[a-z0-9-]+\/$/.test(p.path)
      && ['title', 'section', 'label'].every(key => typeof (p as unknown as Record<string, unknown>)[key] === 'string')
      && Number.isFinite(p.offset) && p.offset >= 0 && p.offset <= 1 && Number.isFinite(p.updated);
  };
  try {
    const data = JSON.parse(raw || '{}');
    return {
      history: (Array.isArray(data?.history) ? data.history : []).filter(valid).slice(0, 40),
      bookmarks: (Array.isArray(data?.bookmarks) ? data.bookmarks : []).filter(valid)
    };
  } catch { return { history: [], bookmarks: [] }; }
}

export function createReadingStore(storage: Pick<Storage, 'getItem' | 'setItem'> | undefined, base: string) {
  let shelf: Shelf = { history: [], bookmarks: [] };
  let available = !!storage;
  try { shelf = parseShelf(storage?.getItem(readingStorageKey) ?? null, base); } catch { available = false; }
  const persist = () => {
    try { storage?.setItem(readingStorageKey, JSON.stringify(shelf)); available = !!storage; } catch { available = false; }
  };
  return {
    get shelf() { return shelf; },
    get available() { return available; },
    reload(raw: string | null) { shelf = parseShelf(raw, base); },
    remember(position: Position) { shelf.history = [position, ...shelf.history.filter(item => item.path !== position.path)].slice(0, 40); persist(); },
    bookmark(position: Position) {
      const duplicate = shelf.bookmarks.some(item => item.path === position.path && item.section === position.section && Math.abs(item.offset - position.offset) < .015);
      if (!duplicate) { shelf.bookmarks = [position, ...shelf.bookmarks]; persist(); }
      return !duplicate;
    },
    remove(kind: keyof Shelf, index: number) { shelf[kind] = shelf[kind].filter((_, i) => i !== index); persist(); },
    clearHistory() { shelf.history = []; persist(); },
  };
}
export type ReadingStore = ReturnType<typeof createReadingStore>;
