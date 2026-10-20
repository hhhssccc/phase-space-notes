import assert from 'node:assert/strict';
import { formulaCopyText, formulaMatches, isFormulaTap, normalizeFormulaSearch } from '../../src/features/reading/formula-data.ts';

const tex = String.raw`H(X)=\langle I(x)\rangle=-\sum_i p_i\log p_i.`;
const url = 'https://hhhssccc.github.io/phase-space-notes/articles/example/#eq-123';
assert.equal(formulaCopyText('tex', tex, url, '信息', '熵'), tex);
assert.equal(formulaCopyText('link', tex, url, '信息', '熵'), url);
const note = formulaCopyText('note', tex, url, '信息 [修订]', '平均信息量');
assert.ok(note.startsWith(`$$\n${tex}\n$$\n\n`));
assert.ok(note.endsWith(`来源：[信息 \\[修订\\] · 平均信息量](<${url}>)`));
const indexed = normalizeFormulaSearch(`${tex} H(X) 平均信息量 α`);
assert.equal(formulaMatches(indexed, 'sum 平均'), true);
assert.equal(formulaMatches(indexed, String.raw`\sum_{i}`), true);
assert.equal(formulaMatches(indexed, 'Ｈ（Ｘ）'), true);
assert.equal(formulaMatches(indexed, 'α'), true);
assert.equal(formulaMatches(indexed, '[.*'), false, 'queries are literal, not regular expressions');
assert.equal(formulaMatches(indexed, 'sum 不存在'), false);
assert.equal(formulaMatches(indexed, '  '), true);
const tap = { moved: false, elapsed: 140, scrollDelta: 0, selection: false };
assert.equal(isFormulaTap(tap), true);
for (const delta of [{ moved: true }, { elapsed: 550 }, { scrollDelta: 8 }, { selection: true }]) {
  assert.equal(isFormulaTap({ ...tap, ...delta }), false);
}
