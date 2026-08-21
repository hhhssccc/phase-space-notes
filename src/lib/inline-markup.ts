import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

interface SourceHeading {
  depth: 2 | 3;
  text: string;
}

const inlineProcessor = createMarkdownProcessor({
  syntaxHighlight: false,
  smartypants: false,
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
});

export async function renderInlineMarkup(source: string): Promise<string> {
  const normalized = source.replace(/\s*\r?\n+\s*/g, ' ').trim();
  if (!normalized) return '';

  const renderer = await inlineProcessor;
  const { code } = await renderer.render(normalized);
  const html = code.trim();
  const paragraph = html.match(/^<p>([\s\S]*)<\/p>$/);
  return paragraph?.[1] ?? html;
}

export function extractSourceHeadings(source: string): SourceHeading[] {
  const headings: SourceHeading[] = [];
  let fenceCharacter = '';
  let fenceLength = 0;

  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1];
      if (!fenceCharacter) {
        fenceCharacter = marker[0];
        fenceLength = marker.length;
      } else if (marker[0] === fenceCharacter && marker.length >= fenceLength) {
        fenceCharacter = '';
        fenceLength = 0;
      }
      continue;
    }
    if (fenceCharacter) continue;

    const heading = line.match(/^ {0,3}(#{2,3})[ \t]+(.+?)[ \t]*$/);
    if (!heading) continue;
    const text = heading[2].replace(/[ \t]+#+[ \t]*$/, '').trim();
    if (!text) continue;
    headings.push({ depth: heading[1].length as 2 | 3, text });
  }

  return headings;
}
