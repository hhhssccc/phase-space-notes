import { occupation } from '../models/gas';
import { gasSvg } from '../plots/gas';
import { findControl, bindControls } from './shared';
export function activate(lab: HTMLElement, signal: AbortSignal) {
  const find = <T extends HTMLElement>(name: string) => findControl<T>(lab, name);
  bindControls(lab, signal, 'gas', () => {
    const temperature = Number(find<HTMLInputElement>('lab-temperature').value);
    const mu = Number(find<HTMLInputElement>('lab-chemical').value);
    const ground = occupation(0, temperature, mu);
    find('temperature-value').textContent = temperature.toFixed(2);
    find('chemical-value').textContent = mu.toFixed(2);
    find('live-plot').innerHTML = gasSvg(temperature, mu);
    find('lab-result').textContent = `基态平均占据数：B–E ${ground.be.toFixed(3)} · F–D ${ground.fd.toFixed(3)} · M–B ${ground.mb.toFixed(3)}。`;
  });
}
