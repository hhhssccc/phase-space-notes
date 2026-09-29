import { groverState } from '../models/grover.ts';
const fixed = (n: number) => n.toFixed(2);
export function groverSvg(size: number, iterations: number) {
  const { marked, unmarked } = groverState(size, iterations);
  const x = 170 + 112 * unmarked; const y = 160 - 112 * marked;
  return `<svg viewBox="0 0 360 320" role="img" aria-label="Grover 状态在目标态和非目标均匀态平面上的投影"><circle cx="170" cy="160" r="112" fill="none" stroke="currentColor" opacity=".25"/><path d="M32 160H314M170 22V295" stroke="currentColor" opacity=".4"/><path d="M170 160L${fixed(x)} ${fixed(y)}" stroke="#946633" stroke-width="4"/><circle cx="${fixed(x)}" cy="${fixed(y)}" r="6" fill="#946633"/><text x="178" y="24">目标态</text><text x="186" y="310">非目标均匀态</text><text x="289" y="180">1</text><text x="150" y="51">1</text><text x="40" y="180">−1</text><text x="144" y="280">−1</text></svg>`;
}
