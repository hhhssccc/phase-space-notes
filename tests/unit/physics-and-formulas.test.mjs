import assert from 'node:assert/strict';
import { groverState, occupation } from '../../src/lib/physics-models.ts';
import { sourceSections } from '../../src/lib/section-search.ts';
import { equationId, rehypeEquationLinks } from '../../src/plugins/rehype-equation-links.mjs';
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
const old = { children: [equation('E=mc^2')] }; rehypeEquationLinks({ tools: false })(old);
const revised = { children: [equation('x=y'), equation('E=mc^2'), equation('E=mc^2')] }; rehypeEquationLinks({ tools: false })(revised);
assert.equal(old.children[0].properties.id, revised.children[1].properties.id);
assert.notEqual(revised.children[1].properties.id, revised.children[2].properties.id);
assert.equal(equationId(' x\r\ny '), equationId('x\ny'));
const interactive = { children: [equation('E=mc^2')] };
rehypeEquationLinks()(interactive);
const wrapper = interactive.children[0];
assert.deepEqual(wrapper.properties.className, ['equation-block']);
assert.equal(wrapper.children[0].properties.id, old.children[0].properties.id);
assert.equal(wrapper.children[1].properties['data-formula-toggle'], old.children[0].properties.id);
assert.equal(wrapper.children[0].children.length, 1, 'Controls remain outside KaTeX and its scroller');
assert.equal(sourceSections('## One\n```md\n## Fake\n```\n## Two\ntext', [{ depth: 2, slug: 'one', text: 'One' }, { depth: 2, slug: 'two', text: 'Two' }], s => s.trim()).length, 3);
