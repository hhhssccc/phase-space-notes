import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkObsidianCallouts } from './src/plugins/remark-obsidian-callouts.mjs';
import { remarkWikiLinks } from './src/plugins/remark-wikilinks.mjs';

const site = process.env.SITE_URL || 'https://hhhssccc.github.io';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [sitemap({
    // The local search UI is intentionally noindex and should not be advertised
    // as a content page in the sitemap.
    filter: (page) => !new URL(page).pathname.endsWith('/search/'),
  })],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkGfm,
        remarkMath,
        remarkObsidianCallouts,
        [remarkWikiLinks, { base }],
      ],
      rehypePlugins: [rehypeKatex],
    }),
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
  build: {
    format: 'directory',
  },
  vite: {
    build: { chunkSizeWarningLimit: 750 },
  },
});
