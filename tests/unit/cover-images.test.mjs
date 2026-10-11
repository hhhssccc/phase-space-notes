import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromHtml } from 'hast-util-from-html';
import { coverPath, visitCoverImages } from '../../src/lib/build/cover-images.mjs';
import { rehypeCoverImages } from '../../src/plugins/rehype-cover-images.mjs';

test('covers use empty alt and responsive assets at root and subpaths; scientific figures retain descriptions', () => {
  const covers = { '/figures/demo/lead.png': { width: 1600, height: 1000, variants: [640, 960, 1440].map(width => ({ width, src: `/_covers/demo-${width}.webp` })) } };
  const html = '<figure class="lead-figure"><img src="../../figures/demo/lead.png?v=1" alt="旧题图描述"></figure><figure><img src="plot.svg" alt="概率曲线"></figure>';
  for (const base of ['/', '/phase-space-notes', '/preview/site']) {
    for (const raw of [true, false]) {
      const tree = raw ? { type: 'root', children: [{ type: 'raw', value: html }] } : fromHtml(html, { fragment: true });
      rehypeCoverImages({ base, covers })(tree);
      const fragment = raw ? fromHtml(tree.children[0].value, { fragment: true }) : tree;
      const prefix = base === '/' ? '' : base;
      let image;
      visitCoverImages(fragment, node => { image = node.properties; });
      assert.equal(image.alt, '');
      assert.equal(image.src, `${prefix}/_covers/demo-960.webp`);
      assert.match(image.srcSet, /640w.*960w.*1440w/);
      assert.equal(image.dataFullsizeSrc || image['data-fullsize-src'], `${prefix}/figures/demo/lead.png`);
      assert.equal(image.fetchPriority, 'high');
      assert.equal(fragment.children[1].children[0].properties.alt, '概率曲线');
    }
  }
  assert.equal(coverPath('/phase-space-notes/figures/demo/lead.png?v=2'), '/figures/demo/lead.png');
  assert.throws(() => coverPath('https://other.test/figures/a.png'), /local/);
  assert.throws(() => coverPath('/figures/../../secret'), /Invalid/);
  assert.throws(() => rehypeCoverImages()({ type: 'raw', value: html }), /not prepared/);
});
