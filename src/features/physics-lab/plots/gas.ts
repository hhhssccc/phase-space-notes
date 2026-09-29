import { occupation } from '../models/gas.ts';
const fixed = (n: number) => n.toFixed(2);
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
