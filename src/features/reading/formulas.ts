import { registerPageFeature } from '../../lib/browser/lifecycle';

registerPageFeature('formula-tools', signal => {
  const prose = document.querySelector<HTMLElement>('.article-prose');
  const menu = document.querySelector<HTMLElement>('[data-formula-menu]');
  const mode = document.querySelector<HTMLButtonElement>('[data-formula-mode]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-copy-dialog]');
  if (!prose || !menu || !mode || !dialog) return;
  const feedback = menu.querySelector<HTMLElement>('[data-formula-feedback]')!;
  const status = document.querySelector<HTMLElement>('[data-formula-status]');
  const hint = document.querySelector<HTMLElement>('[data-formula-hint]');
  // A single menu is outside the article's scrolling, clipping and transformed nodes.
  document.body.append(menu, dialog);
  let active: HTMLElement | null = null;
  let invoker: HTMLElement | null = null;
  let dialogInvoker: HTMLElement | null = null;
  let touchMode = false;
  let dismissListeners: AbortController | null = null;
  let feedbackTimer = 0;
  let generation = 0;
  const coarse = matchMedia('(hover: none), (pointer: coarse)');
  const triggers = prose.querySelectorAll<HTMLButtonElement>('[data-formula-toggle]');
  mode.hidden = triggers.length === 0;
  triggers.forEach((button, index) => {
    button.disabled = false;
    button.setAttribute('aria-label', `打开第 ${index + 1} 个公式的工具`);
  });

  const close = (restoreFocus = false) => {
    generation++;
    dismissListeners?.abort(); dismissListeners = null;
    clearTimeout(feedbackTimer);
    active?.closest('[data-equation-block]')?.removeAttribute('data-tools-open');
    invoker?.setAttribute('aria-expanded', 'false');
    menu.hidden = true; feedback.textContent = '';
    if (restoreFocus && invoker?.isConnected) invoker.focus({ preventScroll: true });
    active = null; invoker = null;
  };
  const open = (equation: HTMLElement, trigger: HTMLElement) => {
    if (active === equation) { close(true); return; }
    close(); active = equation; invoker = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    equation.closest('[data-equation-block]')?.setAttribute('data-tools-open', '');
    menu.hidden = false;
    menu.style.visibility = 'hidden';
    const rect = equation.getBoundingClientRect();
    const bounds = menu.getBoundingClientRect();
    const left = Math.max(12, Math.min(innerWidth - bounds.width - 12, rect.right - bounds.width));
    const top = rect.bottom + bounds.height + 12 <= innerHeight
      ? rect.bottom + 6 : Math.max(12, rect.top - bounds.height - 6);
    menu.style.left = `${left}px`; menu.style.top = `${top}px`; menu.style.visibility = '';
    menu.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    // Only an open menu needs dismissal listeners. No scroll-time layout measurements.
    dismissListeners = new AbortController();
    const options = { passive: true, signal: dismissListeners.signal };
    window.addEventListener('scroll', () => close(), options);
    window.addEventListener('resize', () => close(), options);
  };

  mode.addEventListener('click', () => {
    touchMode = !touchMode;
    mode.setAttribute('aria-pressed', String(touchMode));
    prose.toggleAttribute('data-formula-mode', touchMode);
    if (hint) { hint.hidden = !touchMode; hint.textContent = '点按公式可复制；滑动与长按选择照常使用。'; }
    if (!touchMode) close();
  }, { signal });
  prose.addEventListener('click', event => {
    const trigger = (event.target as Element).closest<HTMLButtonElement>('[data-formula-toggle]');
    if (!trigger) return;
    const equation = document.getElementById(trigger.dataset.formulaToggle!);
    if (equation) open(equation, trigger);
  }, { signal });
  let gesture: { equation: HTMLElement; x: number; y: number; started: number; scroll: number; cancelled: boolean; pointerId: number } | null = null;
  prose.addEventListener('pointerdown', event => {
    gesture = null;
    if (!touchMode || (!coarse.matches && event.pointerType === 'mouse') || !event.isPrimary) return;
    const equation = (event.target as Element).closest<HTMLElement>('[data-equation]');
    if (equation) gesture = { equation, x: event.clientX, y: event.clientY, started: performance.now(), scroll: scrollY, cancelled: false, pointerId: event.pointerId };
  }, { passive: true, signal });
  prose.addEventListener('pointermove', event => {
    if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.cancelled = true;
  }, { passive: true, signal });
  prose.addEventListener('pointercancel', () => { gesture = null; }, { passive: true, signal });
  prose.addEventListener('pointerup', event => {
    const touch = gesture; gesture = null;
    if (!touch || touch.pointerId !== event.pointerId || touch.cancelled || performance.now() - touch.started > 450
      || Math.abs(scrollY - touch.scroll) > 4 || getSelection()?.toString()) return;
    const trigger = touch.equation.closest('[data-equation-block]')?.querySelector<HTMLElement>('[data-formula-toggle]');
    if (trigger) open(touch.equation, trigger);
  }, { passive: true, signal });

  document.addEventListener('pointerdown', event => {
    const target = event.target as Node;
    if (!menu.hidden && !menu.contains(target) && !invoker?.contains(target)) close();
  }, { signal });
  document.addEventListener('keydown', event => {
    if (!menu.hidden && event.key === 'Escape') { event.preventDefault(); close(true); }
  }, { signal });
  document.addEventListener('focusin', event => {
    if (!menu.hidden && !menu.contains(event.target as Node) && event.target !== invoker) close();
  }, { signal });
  menu.addEventListener('click', async event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-formula-copy]');
    if (!button || !active) return;
    const url = new URL(location.pathname, location.origin); url.hash = active.id;
    const text = button.dataset.formulaCopy === 'tex'
      ? active.querySelector('annotation[encoding="application/x-tex"]')?.textContent || '' : url.href;
    const operation = generation;
    try {
      await navigator.clipboard.writeText(text);
      if (signal.aborted || operation !== generation) return;
      feedback.textContent = '已复制';
      if (status) status.textContent = button.dataset.formulaCopy === 'tex' ? '已复制 LaTeX。' : '已复制公式链接。';
      clearTimeout(feedbackTimer); feedbackTimer = window.setTimeout(() => { feedback.textContent = ''; }, 1500);
    } catch {
      if (signal.aborted || operation !== generation) return;
      dialogInvoker = invoker;
      close();
      const input = dialog.querySelector('textarea')!;
      input.value = text; dialog.showModal(); input.focus(); input.select();
    }
  }, { signal });
  dialog.querySelector('[data-copy-close]')?.addEventListener('click', () => dialog.close(), { signal });
  dialog.addEventListener('close', () => {
    if (dialogInvoker?.isConnected) dialogInvoker.focus({ preventScroll: true });
    dialogInvoker = null;
  }, { signal });
  return () => { close(); dialog.close(); menu.remove(); dialog.remove(); };
});
