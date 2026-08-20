import type { CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

export function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || '/';
}

export function entryUrl(entry: ArticleEntry) {
  const path = entry.data.type === 'note'
    ? `/notes/${entry.id}/`
    : `/articles/${entry.id}/`;
  return withBase(path);
}

export function byNewest(a: ArticleEntry, b: ArticleEntry) {
  return b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id);
}

/** Sort activity feeds by the latest substantive date without moving archives. */
export function byRecentlyChanged(a: ArticleEntry, b: ArticleEntry) {
  const effectiveDifference = (b.data.updated ?? b.data.date).valueOf()
    - (a.data.updated ?? a.data.date).valueOf();
  return effectiveDifference || byNewest(a, b);
}

export function readingMinutes(body: string) {
  const chinese = (body.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (body.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.ceil(chinese / 360 + words / 220));
}

export function formatDate(date: Date, includeYear = true) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: includeYear ? 'numeric' : undefined,
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date).replaceAll('/', '·');
}

export function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`$|\[\]{}()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
