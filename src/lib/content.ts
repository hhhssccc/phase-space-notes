import type { CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

export function entryUrl(entry: ArticleEntry) {
  return entry.data.type === 'note'
    ? `/notes/${entry.id}/`
    : `/articles/${entry.id}/`;
}

export function byNewest(a: ArticleEntry, b: ArticleEntry) {
  return b.data.date.valueOf() - a.data.date.valueOf();
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
