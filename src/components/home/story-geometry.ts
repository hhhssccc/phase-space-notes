/** Original editorial figures built from the mathematics in the linked notes. */
type Point = [number, number];
const tau = 2 * Math.PI;
const number = (value: number) => value.toFixed(2);
const point = (value: Point) => value.map(number).join(' ');
const trace = (fn: (value: number) => Point, from = 0, to = tau, samples = 180) =>
  Array.from({ length: samples + 1 }, (_, index) => `${index ? 'L' : 'M'}${point(fn(from + (to - from) * index / samples))}`).join('');

function knotPoint(t: number, offset = 0): Point {
  // The (2,3) torus knot: three crossings in the XY projection. At each
  // crossing sin(3t) selects the strand nearer the viewer.
  const evaluate = (angle: number): Point => [
    660 + 190 * (2 + Math.cos(3 * angle)) * Math.cos(2 * angle),
    285 + 78 * (2 + Math.cos(3 * angle)) * Math.sin(2 * angle),
  ];
  const current = evaluate(t);
  if (!offset) return current;
  const before = evaluate(t - 0.0001);
  const after = evaluate(t + 0.0001);
  const dx = after[0] - before[0], dy = after[1] - before[1];
  const length = Math.hypot(dx, dy);
  return [current[0] - offset * dy / length, current[1] + offset * dx / length];
}

export const knotArt = {
  outline: `${trace(t => knotPoint(t), 0, tau, 660)}Z`,
  filaments: [-14, -7, 0, 7, 14].map(offset => `${trace(t => knotPoint(t, offset), 0, tau, 660)}Z`),
  crossings: [0, 2, 4].map(index => {
    const t = Math.PI / 6 + index * Math.PI / 3;
    return {
      center: knotPoint(t),
      occlusion: trace(angle => knotPoint(angle), t - 0.13, t + 0.13, 40),
      outline: trace(angle => knotPoint(angle), t - 0.29, t + 0.29, 76),
      filaments: [-14, -7, 0, 7, 14].map(offset => trace(angle => knotPoint(angle, offset), t - 0.29, t + 0.29, 76)),
    };
  }),
  marker: knotPoint(Math.PI / 6 + 0.10, -17),
};

const size = 512;
const cellSize = 32;
const plotCellSize = 8;
const density = new Uint8Array(size * size);
for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
  const inside = ((x / size - 0.44) / 0.21) ** 2 + ((y / size - 0.47) / 0.34) ** 2 < 1;
  density[y * size + x] = Number(inside);
}
let evolved = density;
for (let step = 0; step < 3; step += 1) {
  const next = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    // Inverse of the area-preserving torus map [[2,1],[1,1]]. This is an
    // invertible permutation at this resolution, so no fine information is lost.
    const sourceX = (x - y + size) % size;
    const sourceY = (-x + 2 * y + 2 * size) % size;
    next[y * size + x] = evolved[sourceY * size + sourceX];
  }
  evolved = next;
}

// Exact continuous image of the original ellipse under A^3, wrapped on the
// unit torus. The cell averages below are quadrature of this same density.
const fineEllipses: string[] = [];
for (let x = 5; x <= 13; x += 1) for (let y = 3; y <= 8; y += 1) {
  fineEllipses.push(`matrix(13 8 8 5 ${-128 * x} ${-128 * y})`);
}
const cellsPerSide = size / cellSize;
const coarseCells: { x: number; y: number; count: number }[] = [];
const bands = new Map<number, string>();
for (let y = 0; y < cellsPerSide; y += 1) for (let x = 0; x < cellsPerSide; x += 1) {
  let count = 0;
  for (let dy = 0; dy < cellSize; dy += 1) for (let dx = 0; dx < cellSize; dx += 1) {
    count += evolved[(y * cellSize + dy) * size + x * cellSize + dx];
  }
  coarseCells.push({ x: x * plotCellSize, y: y * plotCellSize, count });
  if (count) bands.set(count, (bands.get(count) || '') + `M${x * plotCellSize} ${y * plotCellSize}h8v8h-8Z`);
}
const mass = density.reduce((sum, value) => sum + value, 0);
const evolvedMass = evolved.reduce((sum, value) => sum + value, 0);
const fineEntropy = Math.log2(mass);
const coarseEntropy = coarseCells.reduce((sum, cell) => {
  if (!cell.count) return sum;
  const probabilityPerPixel = cell.count / (cellSize * cellSize * mass);
  return sum - cell.count / mass * Math.log2(probabilityPerPixel);
}, 0);
let grid = '';
for (let index = 1; index < cellsPerSide; index += 1) grid += `M${index * plotCellSize} 0V128M0 ${index * plotCellSize}H128`;

export const entropyArt = {
  size: 128, fineEllipses, grid,
  bands: [...bands].map(([count, d]) => ({ d, opacity: count / (cellSize * cellSize) })),
  selectedCell: coarseCells[8 * cellsPerSide + 6],
  // Kept as evidence for the illustration, never presented as experimental data.
  statistics: { mass, evolvedMass, fineEntropy, coarseEntropy },
};

const theta = 0.72;
const radius = 168;
export const laurentArt = {
  phasePoint: [radius * Math.cos(theta), -radius * Math.sin(theta)] as Point,
  phaseLine: `M0 0L${number(radius * Math.cos(theta))} ${number(-radius * Math.sin(theta))}`,
  direction: trace(t => [radius * Math.cos(t), -radius * Math.sin(t)], 1.80, 2.14, 18),
  directionTip: (() => {
    const angle = 2.14;
    const p: Point = [radius * Math.cos(angle), -radius * Math.sin(angle)];
    const tangent: Point = [-Math.sin(angle), -Math.cos(angle)];
    const normal: Point = [-tangent[1], tangent[0]];
    return `M${point([p[0] - 11 * tangent[0] + 5 * normal[0], p[1] - 11 * tangent[1] + 5 * normal[1]])}L${point(p)}L${point([p[0] - 11 * tangent[0] - 5 * normal[0], p[1] - 11 * tangent[1] - 5 * normal[1]])}`;
  })(),
  modes: [1, 2, 3].map((frequency, index) => {
    const center = (index - 1) * 130;
    return {
      center,
      real: trace(t => [420 * t / tau, center - 40 * Math.cos(frequency * t)], 0, tau, 180),
      imaginary: trace(t => [420 * t / tau, center - 40 * Math.sin(frequency * t)], 0, tau, 180),
      sample: [420 * theta / tau, center - 40 * Math.cos(frequency * theta)] as Point,
    };
  }),
};
