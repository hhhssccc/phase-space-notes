import { groverState, groverSvg, occupation, gasSvg } from '../lib/physics-models';
export function activateLab(lab: HTMLElement, signal: AbortSignal) {
  const find = <T extends HTMLElement>(name: string) => lab.querySelector<T>(`[data-${name}]`)!;
  const grover = lab.dataset.physicsLab === 'grover';
  find('lab-interactive').hidden = false; lab.classList.add('lab-active');
  const update = () => {
    if (grover) {
      const size = Number(find<HTMLSelectElement>('lab-size').value);
      const iterations = Number(find<HTMLInputElement>('lab-iterations').value);
      const state = groverState(size, iterations);
      find('iteration-value').textContent = String(iterations);
      find('live-plot').innerHTML = groverSvg(size, iterations);
      const amplitude = (value: number) => (Math.abs(value) < .0005 ? 0 : value).toFixed(3);
      find('lab-result').textContent = `目标态概率 ${(state.probability * 100).toFixed(2)}%；目标振幅 ${amplitude(state.marked)}，非目标均匀态振幅 ${amplitude(state.unmarked)}。第一个峰值附近：k = ${state.firstPeak}。`;
    } else {
      const temperature = Number(find<HTMLInputElement>('lab-temperature').value);
      const mu = Number(find<HTMLInputElement>('lab-chemical').value);
      const ground = occupation(0, temperature, mu);
      find('temperature-value').textContent = temperature.toFixed(2); find('chemical-value').textContent = mu.toFixed(2);
      find('live-plot').innerHTML = gasSvg(temperature, mu);
      find('lab-result').textContent = `基态平均占据数：B–E ${ground.be.toFixed(3)} · F–D ${ground.fd.toFixed(3)} · M–B ${ground.mb.toFixed(3)}。`;
    }
  };
  lab.querySelectorAll('input, select').forEach(control => control.addEventListener('input', update, { signal }));
  find('lab-reset').addEventListener('click', () => {
    if (grover) { find<HTMLSelectElement>('lab-size').value = '16'; find<HTMLInputElement>('lab-iterations').value = '0'; }
    else { find<HTMLInputElement>('lab-temperature').value = '1'; find<HTMLInputElement>('lab-chemical').value = '-0.5'; }
    update();
  }, { signal });
  update();
}
