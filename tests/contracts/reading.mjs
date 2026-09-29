import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readingPaths } from '../../src/config/reading-paths.ts';
import { articleLabs } from '../../src/features/physics-lab/registry.ts';
const output = process.env.RENDER_OUTPUT_DIR || 'dist';
const searchHtml = await readFile(`${output}/search/index.html`, 'utf8');
const index = JSON.parse(searchHtml.match(/<script[^>]+id="search-index"[^>]*>([\s\S]*?)<\/script>/)[1]);
const files = new Map();
for (const entry of index) {
  const path = new URL(entry.url, 'https://example.test').pathname.replace(/^.*?\/(articles|notes)\//, '$1/');
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
for (const [slug, kind] of Object.entries(articleLabs)) {
  const html = [...files.entries()].find(([url]) => url.endsWith(`/${slug}/`))[1];
  assert.ok(html.includes(`data-physics-lab="${kind}"`));
  assert.ok(html.includes('data-static-plot') && html.includes('<svg') && html.includes('data-lab-start'));
  assert.ok(html.includes('本文符号与约定'));
}
const home = await readFile(`${output}/index.html`, 'utf8');
assert.ok(home.includes('最近发布') && home.includes(index[0].url));
console.log('READING_TOOLS_PASS: search anchors, reading controls, unique equation IDs, routes, registered labs, static fallbacks and latest article.');
