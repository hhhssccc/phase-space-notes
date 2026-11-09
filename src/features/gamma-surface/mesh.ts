/** Pure geometry shared by the server poster and the interactive renderer. */
export type GammaViewName = 'oblique' | 'top' | 'side';
export type Vec3 = [number, number, number];
export interface GammaView {
  azimuth: number;
  elevation: number;
  distance: number;
  target: Vec3;
}
export interface GammaMesh {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
  bounds: { min: Vec3; max: Vec3 };
  center: Vec3;
  radius: number;
}

export const GAMMA_VIEWS: Record<GammaViewName, GammaView> = {
  oblique: { azimuth: -0.5, elevation: 0.47, distance: 8.4, target: [0, 0.82, 0] },
  top: { azimuth: -0.18, elevation: 1.42, distance: 9.8, target: [0, 0.5, 0] },
  side: { azimuth: -0.08, elevation: 0.15, distance: 9.1, target: [0, 1.0, 0] },
};

/** Sparse reference levels in the same displayed Y units as the geometry. */
export const GAMMA_CONTOURS = [0.18, 0.42, 0.76, 1.16, 1.60, 2.05, 2.47] as const;
export const GAMMA_CONTOUR_OPACITY = 0.24;

const coefficients = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

export function logAbsGamma(x: number, y: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI)
      - Math.log(Math.hypot(Math.sin(Math.PI * x), Math.sinh(Math.PI * y)))
      - logAbsGamma(1 - x, -y);
  }
  let real = coefficients[0];
  let imaginary = 0;
  for (let index = 1; index < coefficients.length; index += 1) {
    const denominatorReal = x + index - 1;
    const denominator = denominatorReal ** 2 + y ** 2;
    real += coefficients[index] * denominatorReal / denominator;
    imaginary -= coefficients[index] * y / denominator;
  }
  const tReal = x + 6.5;
  return 0.5 * Math.log(2 * Math.PI)
    + (x - 0.5) * Math.log(Math.hypot(tReal, y))
    - y * Math.atan2(y, tReal) - tReal
    + Math.log(Math.hypot(real, imaginary));
}

/**
 * Height follows ln(1 + |Gamma|). A smooth finite ceiling is used only very
 * close to a pole. Its level follows |res Gamma(-n)| = 1/n! at a common
 * radius 0.055, so smaller residues naturally give smaller displayed peaks.
 * These finite display caps do not represent finite values of Gamma at poles.
 * DLMF 5.2: https://dlmf.nist.gov/5.2
 */
export function gammaHeight(real: number, imaginary: number): number {
  const poleIndex = Math.min(3, Math.max(0, Math.round(-real)));
  const residues = [1, 1, 0.5, 1 / 6];
  const ceiling = Math.log1p(residues[poleIndex] / 0.055);
  const atPole = real <= 0 && Math.abs(imaginary) < 1e-11 && Math.abs(real - Math.round(real)) < 1e-11;
  if (atPole) return ceiling * 0.9;
  const logarithm = logAbsGamma(real, imaginary);
  const raw = logarithm > 20 ? logarithm : Math.log1p(Math.exp(logarithm));
  const softness = 0.085;
  const difference = (ceiling - raw) / softness;
  const capped = difference > 35 ? raw : ceiling - softness * Math.log1p(Math.exp(difference));
  return Math.max(0, capped) * 0.9;
}

const domain = { minReal: -3.35, maxReal: 2.4, minImaginary: -2.15, maxImaginary: 2.15 };
const realCenter = (domain.minReal + domain.maxReal) / 2;
const normalize = (x: number, y: number, z: number): Vec3 => {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (min: number, max: number, value: number) => {
  const amount = clamp((value - min) / (max - min));
  return amount * amount * (3 - 2 * amount);
};
const unique = (values: number[]) => [...new Set(values.map((value) => Number(value.toFixed(6))))].sort((a, b) => a - b);

function color(height: number, real: number): Vec3 {
  const stone: Vec3 = [0.64, 0.65, 0.66];
  const ivory: Vec3 = [0.78, 0.76, 0.73];
  const residues = [1, 1, 0.5, 1 / 6];
  const pole = Math.min(3, Math.max(0, Math.round(-real)));
  const localMaximum = 0.9 * Math.log1p(residues[pole] / 0.055);
  const amount = smoothstep(0.83, 0.99, height / localMaximum);
  return stone.map((channel, index) => channel + (ivory[index] - channel) * amount) as Vec3;
}

export function createGammaMesh({ resolution = 138 }: { resolution?: number } = {}): GammaMesh {
  const count = Math.max(48, Math.min(180, Math.round(resolution)));
  const offsets = [-0.2, -0.11, -0.06, -0.03, -0.012, 0, 0.012, 0.03, 0.06, 0.11, 0.2];
  const real = unique([
    ...Array.from({ length: count + 1 }, (_, index) => domain.minReal + (domain.maxReal - domain.minReal) * index / count),
    ...[-3, -2, -1, 0].flatMap((pole) => offsets.map((offset) => pole + offset)),
  ]);
  const imaginary = unique([
    ...Array.from({ length: count + 1 }, (_, index) => domain.minImaginary + (domain.maxImaginary - domain.minImaginary) * index / count),
    ...offsets,
  ]);
  const width = real.length;
  const depth = imaginary.length;
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];

  function vertex(position: Vec3, normal: Vec3, material: Vec3): number {
    const index = positions.length / 3;
    positions.push(...position);
    normals.push(...normal);
    colors.push(...material);
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], position[axis]);
      max[axis] = Math.max(max[axis], position[axis]);
    }
    return index;
  }

  for (const sampleZ of imaginary) for (const sampleX of real) {
    // A smooth square-to-ellipse map gives a continuous oval domain instead
    // of a rectangular plotting slab. Values still use actual complex z.
    const u = (sampleX - realCenter) / ((domain.maxReal - domain.minReal) / 2);
    const v = sampleZ / domain.maxImaginary;
    const x = realCenter + (sampleX - realCenter) * Math.sqrt(1 - v * v / 2);
    const z = sampleZ * Math.sqrt(1 - u * u / 2);
    const height = gammaHeight(x, z);
    const delta = 0.0003;
    const dx = (gammaHeight(x + delta, z) - gammaHeight(x - delta, z)) / (2 * delta);
    const dz = (gammaHeight(x, z + delta) - gammaHeight(x, z - delta)) / (2 * delta);
    vertex([x - realCenter, height, z], normalize(-dx, 1, -dz), color(height, x));
  }
  for (let z = 0; z < depth - 1; z += 1) for (let x = 0; x < width - 1; x += 1) {
    const a = z * width + x;
    const b = a + 1;
    const c = a + width;
    const d = c + 1;
    indices.push(a, c, b, b, c, d);
  }

  // Close the sheet with a thin solid rim and a bottom: orbiting never reveals
  // a transparent cut-out, and all pixels can be resolved by a depth buffer.
  const rim: number[] = [
    ...Array.from({ length: width }, (_, index) => index),
    ...Array.from({ length: depth - 1 }, (_, index) => (index + 1) * width + width - 1),
    ...Array.from({ length: width - 1 }, (_, index) => (depth - 1) * width + width - 2 - index),
    ...Array.from({ length: depth - 2 }, (_, index) => (depth - 2 - index) * width),
  ];
  const floor = -0.045;
  for (let index = 0; index < rim.length; index += 1) {
    const first = rim[index] * 3;
    const second = rim[(index + 1) % rim.length] * 3;
    const ax = positions[first];
    const az = positions[first + 2];
    const bx = positions[second];
    const bz = positions[second + 2];
    const normal = normalize(bz - az, 0, ax - bx);
    const material: Vec3 = [0.36, 0.37, 0.38];
    const a = vertex([ax, positions[first + 1], az], normal, material);
    const b = vertex([bx, positions[second + 1], bz], normal, material);
    const c = vertex([ax, floor, az], normal, material);
    const d = vertex([bx, floor, bz], normal, material);
    indices.push(a, b, c, b, d, c);
  }
  const bottomCenter = vertex([0, floor, 0], [0, -1, 0], [0.25, 0.26, 0.27]);
  const bottomRim = rim.map((index) => vertex(
    [positions[index * 3], floor, positions[index * 3 + 2]], [0, -1, 0], [0.25, 0.26, 0.27],
  ));
  for (let index = 0; index < bottomRim.length; index += 1) {
    indices.push(bottomCenter, bottomRim[index], bottomRim[(index + 1) % bottomRim.length]);
  }
  if (positions.length / 3 > 65535) throw new Error('Gamma mesh exceeds the Uint16 vertex limit.');
  const center = min.map((value, axis) => (value + max[axis]) / 2) as Vec3;
  const radius = Math.hypot(...min.map((value, axis) => max[axis] - value)) / 2;
  return {
    positions: new Float32Array(positions), normals: new Float32Array(normals), colors: new Float32Array(colors),
    indices: new Uint16Array(indices), bounds: { min, max }, center, radius,
  };
}
