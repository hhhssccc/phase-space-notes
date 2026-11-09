import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { readingPaths } from '../../src/config/reading-paths.ts';
import { articleLabs } from '../../src/features/physics-lab/registry.ts';
const output = process.env.RENDER_OUTPUT_DIR || 'dist';
const searchHtml = await readFile(`${output}/search/index.html`, 'utf8');
const index = JSON.parse(searchHtml.match(/<script[^>]+id="search-index"[^>]*>([\s\S]*?)<\/script>/)[1]);
const files = new Map();
for (const entry of index) {
  const path = new URL(entry.url, 'https://example.test').pathname.replace(/^.*?\/(articles|notes|reflections|lab)\//, '$1/');
  const html = await readFile(`${output}/${path}index.html`, 'utf8'); files.set(entry.url, html);
  for (const section of entry.sections) if (section.slug) assert.ok(html.includes(`id="${section.slug}"`), `${entry.title}: ${section.slug}`);
  assert.ok(html.includes('data-reading-article') && html.includes('data-add-bookmark'));
  assert.ok(html.includes('data-reading-history') && html.includes('data-reading-bookmarks'));
  const ids = [...html.matchAll(/id="(eq-[^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  if (ids.length) assert.ok(/<button[^>]*data-formula-toggle/.test(html), 'Equation controls must be server-rendered to avoid anchor shifts');
}
const pathsHtml = await readFile(`${output}/paths/index.html`, 'utf8');
for (const route of readingPaths) {
  assert.ok(pathsHtml.includes(`id="${route.id}"`));
  for (const step of route.steps) assert.ok(index.some(entry => entry.url.endsWith(`/${step.id}/`)));
}
for (const slug of Object.keys(articleLabs)) {
  const html = [...files.entries()].find(([url]) => url.endsWith(`/${slug}/`))[1];
  assert.ok(!html.includes('data-physics-lab'), 'Legacy article-end visualizations must remain removed');
  assert.ok(html.includes('本文符号与约定'));
}
const home = await readFile(`${output}/index.html`, 'utf8');
let expectedLead;
for (const entry of index) {
  const slug = entry.url.split('/').filter(Boolean).at(-1);
  const source = await readFile(`content/${slug}.md`, 'utf8');
  if (parseFrontmatter(source).frontmatter.homeLeadEligible !== false) {
    expectedLead = entry.url;
    break;
  }
}
const displayedLead = home.match(/id="lead-title"[^>]*>\s*<a[^>]*href="([^"]+)"/)?.[1];
assert.equal(displayedLead, expectedLead, 'The homepage leads with the newest eligible public entry');
console.log('READING_TOOLS_PASS: search anchors, reading controls, unique equation IDs, routes, legacy article-end labs absent and eligible homepage lead.');
