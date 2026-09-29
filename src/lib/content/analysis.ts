export interface SourceHeading { depth: number; text: string; line: number }

/** One scanner for source headings; rendered slugs remain Astro's authority. */
export function scanHeadings(source: string): SourceHeading[] {
  const headings: SourceHeading[] = [];
  let character = ''; let length = 0;
  source.replace(/\r\n?/g, '\n').split('\n').forEach((line, index) => {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (!character) { character = fence[1][0]; length = fence[1].length; }
      else if (fence[1][0] === character && fence[1].length >= length && !fence[2].trim()) character = '';
      return;
    }
    if (character) return;
    const match = line.match(/^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*$/);
    if (match) headings.push({ depth: match[1].length, text: match[2].replace(/[ \t]+#+[ \t]*$/, '').trim(), line: index });
  });
  return headings;
}

export function plainText(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`$|\[\]{}()-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function analyzeArticle(source: string) {
  const body = source.replace(/\r\n?/g, '\n');
  const headings = scanHeadings(body);
  const displayMathCount = Math.floor((body.match(/(?:^|\n)\s*\$\$\s*(?=\n|$)/g)?.length || 0) / 2);
  const proseCharacters = Array.from(body.replace(/(?:^|\n)\s*\$\$[\s\S]*?\$\$(?=\n|$)/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[\s#>*_`~|{}\[\]()-]+/g, '')).length;
  return {
    body, headings, displayMathCount, proseCharacters, text: plainText(body),
    mathDisplay: displayMathCount >= 6 && proseCharacters / displayMathCount <= 180 ? 'plain' as const : 'ruled' as const
  };
}
