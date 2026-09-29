import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { katexOptions } from './katex-options.mjs';

import { scanHeadings } from './content/analysis';

const inlineProcessor = createMarkdownProcessor({
  syntaxHighlight: false,
  smartypants: false,
  remarkPlugins: [remarkMath],
  rehypePlugins: [[rehypeKatex, katexOptions]],
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

export const extractSourceHeadings = (source: string) => scanHeadings(source).filter(h => h.depth === 2 || h.depth === 3);
