export function groverState(size: number, iterations: number) {
  if (!Number.isInteger(size) || size < 2 || !Number.isInteger(iterations) || iterations < 0) throw new RangeError('Invalid Grover parameters');
  const theta = Math.asin(1 / Math.sqrt(size));
  const angle = (2 * iterations + 1) * theta;
  return { theta, angle, marked: Math.sin(angle), unmarked: Math.cos(angle), probability: Math.sin(angle) ** 2,
    firstPeak: Math.round(Math.PI / (4 * theta) - .5) };
}
export function occupation(energy: number, temperature: number, chemicalPotential: number) {
  if (temperature <= 0 || energy < 0 || chemicalPotential >= 0) throw new RangeError('Comparison requires T > 0 and mu below the ground state');
  const x = (energy - chemicalPotential) / temperature;
  return { be: 1 / Math.expm1(x), fd: 1 / (Math.exp(x) + 1), mb: Math.exp(-x) };
}
const fixed = (n: number) => n.toFixed(2);
export function groverSvg(size: number, iterations: number) {
  const { marked, unmarked } = groverState(size, iterations);
  const x = 170 + 112 * unmarked; const y = 160 - 112 * marked;
  return `<svg viewBox="0 0 360 320" role="img" aria-label="Grover 状态在目标态和非目标均匀态平面上的投影"><circle cx="170" cy="160" r="112" fill="none" stroke="currentColor" opacity=".25"/><path d="M32 160H314M170 22V295" stroke="currentColor" opacity=".4"/><path d="M170 160L${fixed(x)} ${fixed(y)}" stroke="#946633" stroke-width="4"/><circle cx="${fixed(x)}" cy="${fixed(y)}" r="6" fill="#946633"/><text x="178" y="24">目标态</text><text x="186" y="310">非目标均匀态</text><text x="289" y="180">1</text><text x="150" y="51">1</text><text x="40" y="180">−1</text><text x="144" y="280">−1</text></svg>`;
}
export function gasSvg(temperature: number, chemicalPotential: number) {
  const maximum = occupation(0, temperature, chemicalPotential).be;
  const ceiling = [1, 2, 5, 10, 20, 50, 100].find(n => n >= maximum) || Math.ceil(maximum);
  const paths = (['be', 'fd', 'mb'] as const).map((kind, k) => {
    const points = Array.from({ length: 181 }, (_, i) => {
      const e = i / 30; return `${i ? 'L' : 'M'}${fixed(54 + e * 47)} ${fixed(256 - occupation(e, temperature, chemicalPotential)[kind] / ceiling * 205)}`;
    }).join(' ');
    return `<path d="${points}" fill="none" stroke="${['#946633', '#407a91', '#8063a0'][k]}" stroke-width="2.5" ${k === 2 ? 'stroke-dasharray="6 4"' : k === 1 ? 'stroke-dasharray="2 3"' : ''}/>`;
  }).join('');
  const ticks = [0, .5, 1].map(p => `<path d="M50 ${256 - p * 205}H336" stroke="currentColor" opacity=".12"/><text x="44" y="${261 - p * 205}" text-anchor="end">${Number((ceiling * p).toFixed(1))}</text>`).join('');
  return `<svg viewBox="0 0 360 320" role="img" aria-label="Bose–Einstein、Fermi–Dirac 与 Maxwell–Boltzmann 平均占据数随单粒子能量的变化"><text x="15" y="22">平均占据数 n</text>${ticks}<path d="M54 42V256H338" stroke="currentColor" fill="none"/>${paths}<text x="54" y="279">0</text><text x="143" y="279">2</text><text x="237" y="279">4</text><text x="330" y="279">6</text><text x="215" y="309">能量 ε / E₀</text></svg>`;
}
