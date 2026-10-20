export type FormulaCopyKind = 'tex' | 'note' | 'link';

/** Search literal commands and rendered symbols alike; never interpret a query as a regex. */
export function normalizeFormulaSearch(text: string): string {
  return text.normalize('NFKC').toLocaleLowerCase().replace(/[\\{}\s]/g, '');
}

export function formulaMatches(haystack: string, query: string): boolean {
  const terms = query.trim().split(/\s+/).map(normalizeFormulaSearch).filter(Boolean);
  return terms.every(term => haystack.includes(term));
}

export function formulaCopyText(kind: FormulaCopyKind, tex: string, url: string, title: string, section: string): string {
  if (kind === 'tex') return tex;
  if (kind === 'link') return url;
  const label = [title, section].filter(Boolean).join(' · ').replace(/[\\[\]]/g, '\\$&');
  return `$$\n${tex}\n$$\n\n来源：[${label}](<${url}>)`;
}

export function isFormulaTap(gesture: { moved: boolean; elapsed: number; scrollDelta: number; selection: boolean }): boolean {
  return !gesture.moved && gesture.elapsed < 450 && Math.abs(gesture.scrollDelta) < 4 && !gesture.selection;
}
