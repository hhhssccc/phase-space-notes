import { scanHeadings } from './content/analysis.ts';
export interface SearchSection { title: string; slug: string; text: string; prose?: string }
export interface SearchEntry { title: string; description: string; category: string; tags: string[]; url: string; text: string; sections: SearchSection[] }
export const normalizeSearch = (value: string) => value.toLocaleLowerCase('zh-CN').normalize('NFKC');

export function sourceSections(source: string, headings: { depth: number; slug: string; text: string }[], plain: (s: string) => string): SearchSection[] {
  headings = headings.filter(heading => heading.slug !== 'footnote-label');
  const sourceHeadings = scanHeadings(source);
  if (sourceHeadings.length !== headings.length || sourceHeadings.some((h, i) => h.depth !== headings[i].depth)) {
    throw new Error('Search headings do not match the rendered article');
  }
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const sections: SearchSection[] = [{ title: '文章开头', slug: '', text: lines.slice(0, sourceHeadings[0]?.line ?? lines.length).join('\n') }];
  sourceHeadings.forEach((heading, i) => sections.push({ title: plain(heading.text), slug: headings[i].slug,
    text: lines.slice(heading.line + 1, sourceHeadings[i + 1]?.line ?? lines.length).join('\n') }));
  return sections.map(section => ({ ...section, text: plain(section.text),
    prose: plain(section.text.replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\$[^$\n]+\$/g, ' ')) }));
}

export function searchEntries(entries: SearchEntry[], query: string) {
  const terms = normalizeSearch(query.trim()).split(/\s+/).filter(Boolean);
  if (!terms.length) return entries.slice(0, 3).map(entry => ({ entry, section: undefined as SearchSection | undefined, score: 0 }));
  return entries.flatMap(entry => {
    const haystack = normalizeSearch([entry.title, entry.description, entry.category, entry.tags.join(' '), entry.text].join(' '));
    if (!terms.every(term => haystack.includes(term))) return [];
    const ranked = entry.sections.map(section => ({ section, score: terms.reduce((sum, term) => sum + (normalizeSearch(section.title).includes(term) ? 20 : 0) + (normalizeSearch(section.text).includes(term) ? 5 : 0), 0) })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const titleScore = terms.reduce((sum, term) => sum + (normalizeSearch(entry.title).includes(term) ? 100 : 0), 0);
    return [{ entry, section: best?.score ? best.section : undefined, score: titleScore + (best?.score || 0) }];
  }).sort((a, b) => b.score - a.score);
}

export function excerpt(text: string, query: string) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const lower = normalizeSearch(text);
  const hit = terms.map(term => lower.indexOf(term)).filter(index => index >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, hit - 42); const end = Math.min(text.length, start + 155);
  return `${start ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}
