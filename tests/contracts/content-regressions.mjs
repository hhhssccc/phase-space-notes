import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { searchEntries } from '../../src/lib/section-search.ts';
const distRoot = path.resolve(process.env.RENDER_OUTPUT_DIR || 'dist');
const html = await readFile(path.join(distRoot, 'search/index.html'), 'utf8');
const index = JSON.parse(html.match(/<script[^>]+id="search-index"[^>]*>([\s\S]*?)<\/script>/)[1]);
const notePath = path.join(distRoot, 'notes', 'laurent-expansion-from-orthogonality', 'index.html');
const noteHtml = await readFile(notePath, 'utf8');
const noteChecks = {
  plainMathMode: noteHtml.includes('class="article-prose" data-math-display="plain"'),
  questionCallout: noteHtml.includes('class="callout callout-question"'),
  boxedFormula: noteHtml.includes('class="stretchy fbox"'),
  captionRemoved: !noteHtml.includes('用户提供的插图'),
};

for (const [name, passed] of Object.entries(noteChecks)) {
  if (!passed) throw new Error(`Laurent note render contract failed: ${name}`);
}

const essayPath = path.join(distRoot, 'articles', 'information-entropy-and-everything', 'index.html');
const essayHtml = await readFile(essayPath, 'utf8');
if (!essayHtml.includes('class="article-prose" data-math-display="ruled"')) {
  throw new Error('Prose-heavy essay should retain ruled display math');
}

const markov = searchEntries(index, 'Markov');
assert.equal(markov[0].entry.title, 'Jones 多项式：从辫群到纽结不变量');
assert.ok(markov[0].section.slug.includes('markov'));
assert.ok(searchEntries(index, 'Ｍａｒｋｏｖ').length > 0);
assert.equal(searchEntries(index, '<script>alert(1)</script>').length, 0);
assert.equal(searchEntries(index, '不存在的词xyz123').length, 0);
assert.equal(searchEntries(index, '').length, 3);
console.log('CONTENT_REGRESSIONS_PASS: Laurent, entropy and Jones fixtures');
