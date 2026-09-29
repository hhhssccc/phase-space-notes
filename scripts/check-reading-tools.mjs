import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { groverState, occupation } from '../src/lib/physics-models.ts';
import { searchEntries, sourceSections } from '../src/lib/section-search.ts';
import { equationId, rehypeEquationLinks } from '../src/plugins/rehype-equation-links.mjs';
import { readingPaths } from '../src/config/reading-paths.ts';

// Compare the closed-form display against independent, explicit oracle and
// inversion-about-the-mean operations on a full state vector.
for (const size of [4, 16, 64, 256]) {
  let amplitudes = Array(size).fill(1 / Math.sqrt(size));
  for (let k = 0; k <= 24; k++) {
    assert.ok(Math.abs(amplitudes[0] ** 2 - groverState(size, k).probability) < 1e-11);
    amplitudes[0] *= -1;
    const average = amplitudes.reduce((a, b) => a + b, 0) / size;
    amplitudes = amplitudes.map(value => 2 * average - value);
  }
}
assert.ok(Math.abs(groverState(4, 1).probability - 1) < 1e-12);
for (const t of [.25, 1, 2]) for (const mu of [-3, -.5, -.05]) for (const e of [0, 1, 6]) {
  const { be, fd, mb } = occupation(e, t, mu);
  assert.ok(be > mb && mb > fd && fd > 0 && fd < 1);
  assert.ok(Number.isFinite(be));
}
assert.throws(() => occupation(0, 1, 0));
const dilute = occupation(6, .25, -3);
assert.ok(Math.abs(dilute.be / dilute.mb - 1) < 1e-12);

const equation = tex => ({ type: 'element', tagName: 'span', properties: { className: ['katex-display'] }, children: [{ type: 'element', tagName: 'annotation', properties: { encoding: 'application/x-tex' }, children: [{ type: 'text', value: tex }] }] });
const old = { children: [equation('E=mc^2')] }; rehypeEquationLinks()(old);
const revised = { children: [equation('x=y'), equation('E=mc^2'), equation('E=mc^2')] }; rehypeEquationLinks()(revised);
assert.equal(old.children[0].properties.id, revised.children[1].properties.id);
assert.notEqual(revised.children[1].properties.id, revised.children[2].properties.id);
assert.equal(equationId(' x\r\ny '), equationId('x\ny'));
assert.equal(sourceSections('## One\n```md\n## Fake\n```\n## Two\ntext', [{ depth: 2, slug: 'one', text: 'One' }, { depth: 2, slug: 'two', text: 'Two' }], s => s.trim()).length, 3);

const searchHtml = await readFile('dist/search/index.html', 'utf8');
const index = JSON.parse(searchHtml.match(/<script[^>]+id="search-index"[^>]*>([\s\S]*?)<\/script>/)[1]);
const files = new Map();
for (const entry of index) {
  const path = new URL(entry.url, 'https://example.test').pathname.replace(/^.*?\/(articles|notes)\//, '$1/');
  const html = await readFile(`dist/${path}index.html`, 'utf8'); files.set(entry.url, html);
  for (const section of entry.sections) if (section.slug) assert.ok(html.includes(`id="${section.slug}"`), `${entry.title}: ${section.slug}`);
  assert.ok(html.includes('data-reading-article') && html.includes('data-add-bookmark'));
  assert.ok(html.includes('data-reading-history') && html.includes('data-reading-bookmarks'));
  const ids = [...html.matchAll(/id="(eq-[^"]+)"/g)].map(m => m[1]);
  assert.ok(ids.length > 0); assert.equal(ids.length, new Set(ids).size);
  assert.ok(/<button[^>]*data-formula-toggle/.test(html), 'Equation controls must be server-rendered to avoid anchor shifts');
}
const markov = searchEntries(index, 'Markov');
assert.equal(markov[0].entry.title, 'Jones 多项式：从辫群到纽结不变量');
assert.ok(markov[0].section.slug.includes('markov'));
assert.ok(searchEntries(index, 'Ｍａｒｋｏｖ').length > 0);
assert.equal(searchEntries(index, '<script>alert(1)</script>').length, 0);
assert.equal(searchEntries(index, '不存在的词xyz123').length, 0);
assert.equal(searchEntries(index, '').length, 3);
const pathsHtml = await readFile('dist/paths/index.html', 'utf8');
for (const route of readingPaths) {
  assert.ok(pathsHtml.includes(`id="${route.id}"`));
  for (const step of route.steps) assert.ok(index.some(entry => entry.url.endsWith(`/${step.id}/`)));
}
for (const [slug, kind] of [['grover-algorithm-original-motivation', 'grover'], ['quantum-gas', 'gas']]) {
  const html = [...files.entries()].find(([url]) => url.endsWith(`/${slug}/`))[1];
  assert.ok(html.includes(`data-physics-lab="${kind}"`));
  assert.ok(html.includes('data-static-plot') && html.includes('<svg') && html.includes('data-lab-start'));
  assert.ok(html.includes('本文符号与约定'));
}
const home = await readFile('dist/index.html', 'utf8');
assert.ok(home.includes('最近发布') && home.includes(index[0].url));
console.log('READING_TOOLS_PASS: full-state Grover comparison; gas limits; stable equation links; every search section anchor; routes; reading controls; static lab fallbacks; latest article.');
