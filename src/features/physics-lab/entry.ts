import { registerPageFeature } from '../../lib/browser/lifecycle';
const loaders = { grover: () => import('./controllers/grover'), gas: () => import('./controllers/gas') };
registerPageFeature('physics-lab', signal => {
  document.querySelectorAll<HTMLElement>('[data-physics-lab]').forEach(lab => {
    const start = lab.querySelector<HTMLButtonElement>('[data-lab-start]')!;
    start.addEventListener('click', async () => {
      start.disabled = true; start.textContent = '正在打开…';
      try {
        const loader = loaders[lab.dataset.physicsLab as keyof typeof loaders];
        if (!loader) throw new Error('Unknown physics lab');
        const { activate } = await loader();
        if (signal.aborted) return;
        activate(lab, signal);
        lab.querySelector<HTMLElement>('[data-lab-interactive]')!.hidden = false;
        lab.classList.add('lab-active'); start.hidden = true;
        lab.querySelector<HTMLInputElement>('input, select')?.focus();
      } catch {
        if (!signal.aborted) { start.disabled = false; start.textContent = '加载未完成，点击重试'; }
      }
    }, { signal });
  });
});
