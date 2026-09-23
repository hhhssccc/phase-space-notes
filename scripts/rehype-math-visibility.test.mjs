import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { fromHtml } from 'hast-util-from-html';
import { rehypeMathVisibility } from '../src/plugins/rehype-math-visibility.mjs';

function render(tex, displayMode = true) {
  return fromHtml(katex.renderToString(tex, { displayMode }), { fragment: true });
}

test('ordinary, fraction, matrix and aligned math retain all rendered content', () => {
  const formulas = ['x=1', String.raw`\frac{a}{b}`, String.raw`\begin{pmatrix}a&b\\c&d\end{pmatrix}`, String.raw`\begin{aligned}a&=b\\c&=d\end{aligned}`];
  const heights = [];
  for (const tex of formulas) {
    const tree = render(tex);
    const before = structuredClone(tree);
    rehypeMathVisibility()(tree);
    const wrapper = tree.children[0];
    assert.ok(wrapper.properties.className.includes('math-deferred'));
    const height = Number(wrapper.properties.style.match(/--math-height:([\d.]+)em/)[1]);
    assert.ok(Number.isFinite(height) && height > 0);
    heights.push(height);
    wrapper.properties.className = wrapper.properties.className.filter(name => name !== 'math-deferred');
    delete wrapper.properties.style;
    assert.deepEqual(tree, before, 'HTML, MathML, TeX and accessibility attributes must be unchanged');
  }
  assert.ok(heights[2] > heights[0], 'a matrix needs more reserved height than a single line');
  assert.ok(heights[3] > heights[0], 'aligned derivations must reserve multiple lines');
});

test('inline math and unsupported tagged/explicit-line-break layouts remain untouched', () => {
  for (const [tex, display] of [['x=1', false], [String.raw`x=1\tag{1}`, true], [String.raw`a=b\\c=d`, true]]) {
    const tree = render(tex, display);
    const before = structuredClone(tree);
    rehypeMathVisibility()(tree);
    assert.deepEqual(tree, before);
  }
});
