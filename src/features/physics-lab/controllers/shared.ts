import { labs, type LabKind } from '../registry';
export const findControl = <T extends HTMLElement>(lab: HTMLElement, name: string) => lab.querySelector<T>(`[data-${name}]`)!;
export function bindControls(lab: HTMLElement, signal: AbortSignal, kind: LabKind, update: () => void) {
  lab.querySelectorAll('input, select').forEach(control => control.addEventListener('input', update, { signal }));
  findControl(lab, 'lab-reset').addEventListener('click', () => {
    for (const control of labs[kind].controls) findControl<HTMLInputElement>(lab, `lab-${control.key}`).value = String(control.value);
    update();
  }, { signal });
  update();
}
