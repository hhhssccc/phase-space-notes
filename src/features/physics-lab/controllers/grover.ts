import { groverState } from '../models/grover';
import { groverSvg } from '../plots/grover';
import { findControl, bindControls } from './shared';
export function activate(lab: HTMLElement, signal: AbortSignal) {
  const find = <T extends HTMLElement>(name: string) => findControl<T>(lab, name);
  bindControls(lab, signal, 'grover', () => {
    const size = Number(find<HTMLSelectElement>('lab-size').value);
    const iterations = Number(find<HTMLInputElement>('lab-iterations').value);
    const state = groverState(size, iterations);
    find('iteration-value').textContent = String(iterations);
    find('live-plot').innerHTML = groverSvg(size, iterations);
    const amplitude = (value: number) => (Math.abs(value) < .0005 ? 0 : value).toFixed(3);
    find('lab-result').textContent = `目标态概率 ${(state.probability * 100).toFixed(2)}%；目标振幅 ${amplitude(state.marked)}，非目标均匀态振幅 ${amplitude(state.unmarked)}。第一个峰值附近：k = ${state.firstPeak}。`;
  });
}
