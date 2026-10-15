import { defineConfig } from 'astro/config';
import { rehypeEquationLinks } from './src/plugins/rehype-equation-links.mjs';
import { katexOptions } from './src/lib/katex-options.mjs';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkObsidianCallouts } from './src/plugins/remark-obsidian-callouts.mjs';
import { remarkWikiLinks } from './src/plugins/remark-wikilinks.mjs';
import { rehypeSiteUrls } from './src/plugins/rehype-site-urls.mjs';
import { fileURLToPath } from 'node:url';
import { prepareCoverImages } from './src/lib/build/cover-images.mjs';
import { rehypeCoverImages } from './src/plugins/rehype-cover-images.mjs';

const site = process.env.SITE_URL || 'https://hhhssccc.github.io';
const base = process.env.BASE_PATH || '/';
const covers = await prepareCoverImages(fileURLToPath(new URL('.', import.meta.url)));

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [sitemap({
    // The local search UI is intentionally noindex and should not be advertised
    // as a content page in the sitemap.
    filter: (page) => !new URL(page).pathname.endsWith('/search/') && !new URL(page).pathname.includes('/lab/embed/'),
  })],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkGfm,
        remarkMath,
        remarkObsidianCallouts,
        [remarkWikiLinks, { base }],
      ],
      rehypePlugins: [[rehypeKatex, katexOptions], [rehypeEquationLinks, { tools: true }], [rehypeCoverImages, { base, covers }], [rehypeSiteUrls, { base }]],
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
