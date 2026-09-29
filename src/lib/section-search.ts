export interface SearchSection { title: string; slug: string; text: string; prose?: string }
export interface SearchEntry { title: string; description: string; category: string; tags: string[]; url: string; text: string; sections: SearchSection[] }
export const normalizeSearch = (value: string) => value.toLocaleLowerCase('zh-CN').normalize('NFKC');

export function sourceSections(source: string, headings: { depth: number; slug: string; text: string }[], plain: (s: string) => string): SearchSection[] {
  headings = headings.filter(heading => heading.slug !== 'footnote-label');
  const sections: SearchSection[] = [{ title: '文章开头', slug: '', text: '' }];
  let current = sections[0]; let index = 0; let fence = ''; let fenceLength = 0;
  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) { fence = marker[1][0]; fenceLength = marker[1].length; }
      else if (fence === marker[1][0] && marker[1].length >= fenceLength) fence = '';
      current.text += `${line}\n`; continue;
    }
    const heading = !fence && line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const actual = headings[index++];
      if (!actual || actual.depth !== heading[1].length) throw new Error('Search headings do not match the rendered article');
      current = { title: plain(heading[2]), slug: actual.slug, text: '' }; sections.push(current);
    } else current.text += `${line}\n`;
  }
  if (index !== headings.length) throw new Error('Unindexed article headings');
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
