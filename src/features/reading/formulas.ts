import { registerPageFeature } from '../../lib/browser/lifecycle';
import { formulaCopyText, formulaMatches, isFormulaTap, normalizeFormulaSearch, type FormulaCopyKind } from './formula-data';

type Equation = { element: HTMLElement; trigger: HTMLButtonElement; tex: string; section: string; context: string; search: string };

// Read only the accessible text, not KaTeX's duplicate HTML and TeX annotations.
function readableText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('.katex-html, annotation, [aria-hidden="true"], button').forEach(node => node.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

registerPageFeature('formula-tools', signal => {
  const prose = document.querySelector<HTMLElement>('.article-prose');
  const menu = document.querySelector<HTMLElement>('[data-formula-menu]');
  const indexOpen = document.querySelector<HTMLButtonElement>('[data-formula-index-open]');
  const indexDialog = document.querySelector<HTMLDialogElement>('[data-formula-index]');
  const copyDialog = document.querySelector<HTMLDialogElement>('[data-copy-dialog]');
  if (!prose || !menu || !indexOpen || !indexDialog || !copyDialog) return;
  const feedback = menu.querySelector<HTMLElement>('[data-formula-feedback]')!;
  const source = menu.querySelector<HTMLDetailsElement>('[data-formula-source]')!;
  const code = menu.querySelector<HTMLElement>('[data-formula-code]')!;
  const primary = menu.querySelector<HTMLButtonElement>('[data-formula-copy="tex"]')!;
  const search = indexDialog.querySelector<HTMLInputElement>('[data-formula-search]')!;
  const results = indexDialog.querySelector<HTMLElement>('[data-formula-results]')!;
  const more = indexDialog.querySelector<HTMLButtonElement>('[data-formula-more]')!;
  const hint = document.querySelector<HTMLElement>('[data-formula-hint]');
  const title = document.querySelector<HTMLElement>('[data-reading-article]')?.dataset.readingTitle || document.title;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || location.href;
  const articleURL = new URL(canonical); articleURL.search = ''; articleURL.hash = '';
  const equations: Equation[] = [];
  const byElement = new Map<Element, number>();
  let section = '正文'; let context = '';
  for (const node of prose.querySelectorAll<HTMLElement>('h2, h3, h4, p, [data-equation]')) {
    if (/^H[234]$/.test(node.tagName)) { section = readableText(node); context = ''; continue; }
    if (node.tagName === 'P') { if (!node.querySelector('[data-equation]')) context = readableText(node); continue; }
    const trigger = node.closest('[data-equation-block]')?.querySelector<HTMLButtonElement>('[data-formula-toggle]');
    if (!trigger) continue;
    const tex = node.querySelector('annotation[encoding="application/x-tex"]')?.textContent || '';
    const index = equations.length;
    equations.push({ element: node, trigger, tex, section, context: context.slice(0, 220),
      search: normalizeFormulaSearch(`${tex} ${readableText(node)} ${section} ${context}`) });
    byElement.set(node, index);
    trigger.disabled = false;
    trigger.setAttribute('aria-label', `打开第 ${index + 1} 条公式的工具：${section}`);
  }
  indexOpen.hidden = equations.length === 0;
  if (hint) hint.hidden = equations.length === 0;
  if (!equations.length) return;
  prose.setAttribute('data-formulas-ready', '');
  indexOpen.textContent = `本文公式 · ${equations.length}`;
  indexDialog.querySelector('[data-formula-total]')!.textContent = `${equations.length} 条`;
  // Shared surfaces stay outside KaTeX's transformed and horizontally scrolling nodes.
  document.body.append(menu, indexDialog, copyDialog);
  let active: number | null = null;
  let indexInvoker: HTMLElement | null = null;
  let generation = 0;
  let tapTimer = 0;
  let openListeners: AbortController | null = null;
  let filtered: number[] = [];
  let cursor = 0;
  let limit = 24;

  const close = (restoreFocus = false) => {
    generation++;
    clearTimeout(tapTimer);
    openListeners?.abort(); openListeners = null;
    const previous = active === null ? null : equations[active];
    previous?.element.closest('[data-equation-block]')?.removeAttribute('data-tools-open');
    previous?.trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true; feedback.textContent = ''; active = null;
    if (restoreFocus && previous?.trigger.isConnected) previous.trigger.focus({ preventScroll: true });
  };
  const positionMenu = () => {
    if (menu.hidden) return;
    // Measure only the article column and the selected formula on explicit actions.
    const column = prose.getBoundingClientRect();
    const half = menu.offsetWidth / 2;
    menu.style.left = `${Math.max(half + 12, Math.min(innerWidth - half - 12, column.left + column.width / 2))}px`;
  };
  const revealActive = () => {
    if (active === null) return;
    const rect = equations[active].element.getBoundingClientRect();
    const top = Math.max(20, (document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 20);
    const bottom = menu.getBoundingClientRect().top - 18;
    if (rect.top < top || rect.bottom > bottom) {
      const desired = top + Math.max(0, (bottom - top - rect.height) / 2);
      window.scrollBy({ top: rect.top - desired, behavior: 'instant' });
    }
  };
  const open = (index: number, reveal = true) => {
    if (index < 0 || index >= equations.length) return;
    close(); active = index;
    const item = equations[index];
    item.element.closest('[data-equation-block]')?.setAttribute('data-tools-open', '');
    item.trigger.setAttribute('aria-expanded', 'true');
    menu.querySelector('[data-formula-position]')!.textContent = `公式 ${index + 1} / ${equations.length}`;
    menu.querySelector('[data-formula-title]')!.textContent = item.section;
    menu.querySelector<HTMLButtonElement>('[data-formula-step="-1"]')!.disabled = index === 0;
    menu.querySelector<HTMLButtonElement>('[data-formula-step="1"]')!.disabled = index === equations.length - 1;
    code.textContent = item.tex;
    source.open = false;
    menu.hidden = false;
    positionMenu();
    if (reveal) revealActive();
    primary.focus({ preventScroll: true });
    openListeners = new AbortController();
    // Wheel scrolling in the article returns to reading; panel/source scrolling stays local.
    document.addEventListener('wheel', event => {
      if (!menu.contains(event.target as Node) && !copyDialog.open) close();
    }, { passive: true, signal: openListeners.signal });
    window.addEventListener('resize', () => { positionMenu(); revealActive(); }, { passive: true, signal: openListeners.signal });
  };
  const indexAt = (target: EventTarget | null) => {
    const element = target instanceof Element ? target.closest('[data-equation-block]')?.querySelector('[data-equation]') : null;
    return element ? byElement.get(element) : undefined;
  };
  type Gesture = { index: number; pointerId: number; type: string; x: number; y: number; time: number; scrollY: number; scrollX: number; moved: boolean };
  let gesture: Gesture | null = null;
  let tap: { index: number; type: string } | null = null;
  prose.addEventListener('pointerdown', event => {
    clearTimeout(tapTimer); gesture = null; tap = null;
    if (!event.isPrimary || event.button !== 0) return;
    const index = indexAt(event.target);
    if (index === undefined) return;
    gesture = { index, pointerId: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY,
      time: performance.now(), scrollY, scrollX: equations[index].element.scrollLeft, moved: false };
  }, { passive: true, signal });
  prose.addEventListener('pointermove', event => {
    if (gesture?.pointerId === event.pointerId && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.moved = true;
  }, { passive: true, signal });
  prose.addEventListener('pointercancel', () => { gesture = null; tap = null; clearTimeout(tapTimer); }, { passive: true, signal });
  prose.addEventListener('pointerup', event => {
    const current = gesture; gesture = null;
    if (!current || current.pointerId !== event.pointerId || indexAt(event.target) !== current.index) return;
    if (isFormulaTap({ moved: current.moved || equations[current.index].element.scrollLeft !== current.scrollX,
      elapsed: performance.now() - current.time, scrollDelta: scrollY - current.scrollY, selection: Boolean(getSelection()?.toString()) })) {
      tap = { index: current.index, type: current.type };
    }
  }, { passive: true, signal });
  prose.addEventListener('click', event => {
    const target = event.target as Element;
    const trigger = target.closest<HTMLButtonElement>('[data-formula-toggle]');
    const index = indexAt(target);
    if (index === undefined) return;
    if (trigger) { tap = null; open(index); return; }
    const current = tap; tap = null;
    if (!current || current.index !== index) return;
    // Give a desktop double-click a chance to select text before moving focus.
    tapTimer = window.setTimeout(() => {
      if (!signal.aborted && !getSelection()?.toString()) open(index);
    }, current.type === 'mouse' ? 220 : 0);
  }, { signal });
  prose.addEventListener('dblclick', () => { clearTimeout(tapTimer); close(); }, { signal });
  document.addEventListener('pointerdown', event => {
    const target = event.target as Node;
    if (!menu.hidden && !menu.contains(target) && !copyDialog.open && !indexDialog.open) close();
  }, { signal });
  document.addEventListener('selectionchange', () => {
    const selection = getSelection();
    if (selection?.toString() && selection.anchorNode && prose.contains(selection.anchorNode)) { clearTimeout(tapTimer); close(); }
  }, { signal });
  document.addEventListener('focusin', event => {
    if (!menu.hidden && !menu.contains(event.target as Node) && !copyDialog.open && !indexDialog.open) close();
  }, { signal });
  menu.querySelector('[data-formula-close]')!.addEventListener('click', () => close(true), { signal });
  menu.querySelectorAll<HTMLButtonElement>('[data-formula-step]').forEach(button => button.addEventListener('click', () => {
    if (active !== null) open(active + Number(button.dataset.formulaStep));
  }, { signal }));
  source.addEventListener('toggle', () => { if (!menu.hidden) revealActive(); }, { signal });

  const copy = async (kind: FormulaCopyKind) => {
    if (active === null) return;
    const item = equations[active];
    const url = new URL(articleURL); url.hash = item.element.id;
    const text = formulaCopyText(kind, item.tex, url.href, title, item.section);
    const operation = generation;
    try {
      await navigator.clipboard.writeText(text);
      if (signal.aborted || operation !== generation) return;
      feedback.textContent = kind === 'note' ? '已复制 Markdown 公式与出处，可粘贴到笔记。' : kind === 'link' ? '已复制公式链接。' : '已复制 LaTeX。';
    } catch {
      if (signal.aborted || operation !== generation) return;
      const input = copyDialog.querySelector('textarea')!;
      input.value = text; copyDialog.showModal(); input.focus(); input.select();
    }
  };
  menu.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-formula-copy]');
    if (button) void copy(button.dataset.formulaCopy as FormulaCopyKind);
  }, { signal });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
    if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing || getSelection()?.toString()
      || (event.target as Element).closest('input,textarea,[contenteditable="true"],pre')) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); if (active !== null) open(active + (event.key === 'ArrowUp' ? -1 : 1));
    }
    const kind = ({ c: 'tex', m: 'note', l: 'link' } as Record<string, FormulaCopyKind>)[event.key.toLowerCase()];
    if (kind) { event.preventDefault(); void copy(kind); }
  }, { signal });
  copyDialog.querySelector('[data-copy-close]')!.addEventListener('click', () => copyDialog.close(), { signal });
  copyDialog.addEventListener('close', () => { if (!signal.aborted && !menu.hidden) primary.focus({ preventScroll: true }); }, { signal });

  const markResult = (scroll = false) => {
    results.querySelectorAll<HTMLButtonElement>('[data-formula-result]').forEach((button, index) => button.setAttribute('aria-current', String(index === cursor)));
    if (scroll && filtered.length) {
      results.children[cursor]?.scrollIntoView({ block: 'nearest' });
      const selected = filtered[cursor];
      indexDialog.querySelector('[data-formula-search-status]')!.textContent = `${filtered.length} 条匹配 · 当前第 ${selected + 1} 条：${equations[selected].section}`;
    }
  };
  const renderResults = () => {
    const fragment = document.createDocumentFragment();
    for (const index of filtered.slice(0, limit)) {
      const item = equations[index];
      const button = document.createElement('button'); button.type = 'button'; button.className = 'formula-result';
      button.dataset.formulaResult = String(index);
      const heading = document.createElement('span'); heading.className = 'formula-result-heading';
      heading.textContent = `${index + 1} · ${item.section}`;
      const math = document.createElement('span'); math.className = 'formula-result-math'; math.setAttribute('aria-hidden', 'true');
      const rendered = item.element.querySelector('.katex')?.cloneNode(true); if (rendered) math.append(rendered);
      const contextLabel = document.createElement('span'); contextLabel.className = 'formula-result-context'; contextLabel.textContent = item.context;
      button.setAttribute('aria-label', `第 ${index + 1} 条公式，${item.section}。${item.tex}`);
      button.append(heading, math, contextLabel); fragment.append(button);
    }
    results.replaceChildren(fragment);
    more.hidden = filtered.length <= limit;
    indexDialog.querySelector('[data-formula-search-status]')!.textContent = filtered.length
      ? `${filtered.length} 条匹配${filtered.length > limit ? ` · 当前显示 ${limit} 条` : ''}` : '没有找到公式，试试符号、LaTeX 命令或正文中的文字。';
    markResult();
  };
  const filterResults = () => {
    filtered = equations.flatMap((item, index) => formulaMatches(item.search, search.value) ? [index] : []);
    cursor = 0; limit = 24; renderResults();
  };
  const browse = (invoker: HTMLElement) => {
    indexInvoker = invoker; close(); search.value = ''; filterResults();
    indexDialog.showModal(); search.focus({ preventScroll: true });
  };
  indexOpen.addEventListener('click', () => browse(indexOpen), { signal });
  menu.querySelector<HTMLElement>('[data-formula-browse]')!.addEventListener('click', () => browse(indexOpen), { signal });
  indexDialog.querySelector('[data-formula-index-close]')!.addEventListener('click', () => indexDialog.close(), { signal });
  indexDialog.addEventListener('close', () => {
    if (!signal.aborted && menu.hidden && indexInvoker?.isConnected) indexInvoker.focus({ preventScroll: true });
  }, { signal });
  indexDialog.addEventListener('click', event => {
    if (event.target === indexDialog) {
      const rect = indexDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) indexDialog.close();
    }
  }, { signal });
  search.addEventListener('input', filterResults, { signal });
  const choose = (index: number) => { indexDialog.close(); open(index); };
  results.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-formula-result]');
    if (button) choose(Number(button.dataset.formulaResult));
  }, { signal });
  more.addEventListener('click', () => { limit += 24; renderResults(); }, { signal });
  search.addEventListener('keydown', event => {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); cursor = Math.max(0, Math.min(filtered.length - 1, cursor + (event.key === 'ArrowDown' ? 1 : -1)));
      if (cursor >= limit) { limit += 24; renderResults(); }
      markResult(true);
    }
    if (event.key === 'Enter' && filtered.length) { event.preventDefault(); choose(filtered[cursor]); }
  }, { signal });
  // Escape must work after pointer dismissal as well as within keyboard-focused controls.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden && !copyDialog.open && !indexDialog.open) { event.preventDefault(); close(true); }
  }, { signal });
  return () => {
    close(); indexDialog.close(); copyDialog.close();
    prose.removeAttribute('data-formulas-ready'); menu.remove(); indexDialog.remove(); copyDialog.remove();
  };
});
