export function groverState(size: number, iterations: number) {
  if (!Number.isInteger(size) || size < 2 || !Number.isInteger(iterations) || iterations < 0) throw new RangeError('Invalid Grover parameters');
  const theta = Math.asin(1 / Math.sqrt(size));
  const angle = (2 * iterations + 1) * theta;
  return {
    theta, angle, marked: Math.sin(angle), unmarked: Math.cos(angle), probability: Math.sin(angle) ** 2,
    firstPeak: Math.round(Math.PI / (4 * theta) - .5)
  };
}
