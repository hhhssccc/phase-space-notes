import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContentIndex } from '../../src/lib/content/references.ts';
import { analyzeArticle, scanHeadings } from '../../src/lib/content/analysis.ts';
import { sourceSections, searchEntries } from '../../src/lib/section-search.ts';
import { siteUrl } from '../../src/lib/urls.mjs';
import { remarkWikiLinks } from '../../src/plugins/remark-wikilinks.mjs';
import { rehypeSiteUrls } from '../../src/plugins/rehype-site-urls.mjs';
const entry = (id, data = {}) => ({ id, data: { draft: false, related: [], backlinks: [], ...data } });
test('references reject missing, draft, self, duplicate and invalid editorial targets', () => {
  assert.throws(() => createContentIndex([entry('a', { related: ['missing'] })], []), /missing public/);
  assert.throws(() => createContentIndex([entry('a'), entry('b', { draft: true })], [{ id: 'route', steps: [{ id: 'b' }] }]), /missing public/);
  assert.throws(() => createContentIndex([entry('a', { backlinks: ['a'] })], []), /itself/);
  assert.throws(() => createContentIndex([entry('a'), entry('a')], []), /Duplicate content/);
  assert.throws(() => createContentIndex([entry('a')], [], ['b']), /Symbol guide/);
  assert.throws(() => createContentIndex([entry('a')], [], [], ['b']), /Physics lab/);
  const valid = createContentIndex([entry('a', { related: ['b'] }), entry('b')], [{ id: 'r', steps: [{ id: 'a' }, { id: 'b' }] }]);
  assert.equal(valid.requireEntry('b').id, 'b');
});
test('shared heading scanner ignores fences and preserves real rendered slugs', () => {
  const source = '## One\r\n~~~md\r\n## Fake\r\n~~~\r\n### $E$ ###\r\ntext';
  assert.deepEqual(scanHeadings(source).map(h => h.text), ['One', '$E$']);
  const headings = [{depth:2,slug:'one',text:'One'},{depth:3,slug:'e',text:'E'}];
  assert.deepEqual(sourceSections(source, headings, s => s.trim()).map(s => s.slug), ['', 'one', 'e']);
  assert.throws(() => sourceSections(source, [], s => s), /do not match/);
  assert.equal(analyzeArticle('普通的纯文字文章。').displayMathCount, 0);
  assert.equal(analyzeArticle('普通的纯文字文章。').mathDisplay, 'ruled');
  assert.equal(analyzeArticle(Array(6).fill('$$\nx=y\n$$').join('\n')).mathDisplay, 'plain');
});
test('site URLs work at the root and any subpath without double prefixes', () => {
  for (const base of ['/', '/phase-space-notes', '/preview/site/']) {
    for (const url of ['/assets/a.webp', '/notes/a/#eq-x', '/audio/a.m4a?v=1', '/paths/']) {
      assert.equal(siteUrl(siteUrl(url, base), base), siteUrl(url, base));
    }
    for (const url of ['#eq-a','https://example.test/a','//example.test/a','relative.webp']) assert.equal(siteUrl(url,base),url);
  }
  const tree = {type:'element',properties:{src:'/figures/a.png'},children:[]};
  rehypeSiteUrls({base:'/preview'})(tree); assert.equal(tree.properties.src,'/preview/figures/a.png');
});
test('bare WikiLinks resolve note types and fail on unknown targets', () => {
  const routes = new Map([['note-a','/notes/note-a/']]);
  const tree = {children:[{type:'text',value:'[[note-a|笔记]]'}]};
  remarkWikiLinks({base:'/preview',routes})(tree); assert.equal(tree.children[0].url,'/preview/notes/note-a/');
  assert.throws(() => remarkWikiLinks({routes})({children:[{type:'text',value:'[[missing]]'}]}), /not a public/);
});
test('search normalizes fullwidth input and permits ordinary prose-only content', () => {
  const entry = {title:'Markov', description:'example',category:'数学',tags:[],url:'/a/',text:'Markov',sections:[]};
  assert.equal(searchEntries([entry], 'Ｍａｒｋｏｖ').length, 1);
  assert.equal(searchEntries([entry], '').length, 1);
  assert.equal(searchEntries([entry], '<script>alert(1)</script>').length, 0);
});
