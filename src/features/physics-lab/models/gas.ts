export function occupation(energy: number, temperature: number, chemicalPotential: number) {
  if (temperature <= 0 || energy < 0 || chemicalPotential >= 0) throw new RangeError('Comparison requires T > 0 and mu below the ground state');
  const x = (energy - chemicalPotential) / temperature;
  return { be: 1 / Math.expm1(x), fd: 1 / (Math.exp(x) + 1), mb: Math.exp(-x) };
}
