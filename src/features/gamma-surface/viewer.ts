import { registerPageFeature } from '../../lib/browser/lifecycle';
import { createGammaMesh, GAMMA_VIEWS } from './mesh';
import { createCanvasRenderer, createWebGLRenderer, type GammaView, type SurfaceRenderer } from './renderers';

/* GammaPlate/mesh contract:
 * - mesh.ts: createGammaMesh({resolution?}), RGB/normal/position Float32 arrays,
 *   Uint16 triangle indices; X=Re(z), Y=display height, Z=Im(z), centered XZ.
 * - GAMMA_VIEWS: radians, distance, and a Y-up target tuple for each preset.
 * - DOM: [data-gamma-viewer] owns [data-gamma-canvas], the persistent SSR
 *   [data-gamma-fallback], [data-gamma-preset="oblique|top|side"],
 *   [data-gamma-reset], and an optional live [data-gamma-status].
 * - CSS reveals the canvas only for data-gamma-ready="true"; print uses the
 *   poster. Renderer/view/dragging data attributes expose current UI state.
 */
type Preset = keyof typeof GAMMA_VIEWS;
const presetNames = ['oblique', 'top', 'side'] as const;
const labels: Record<Preset, string> = { oblique: '斜视', top: '俯视', side: '侧视' };
const copyView = (view: GammaView): GammaView => ({ ...view, target: [...view.target] });
const clampElevation = (value: number) => Math.max(-1.35, Math.min(Math.PI / 2 - 0.0001, value));

/** The only RAF is a one-shot draw requested by input or a size change. */
function mountViewer(root: HTMLElement, pageSignal: AbortSignal) {
  let canvas = root.querySelector<HTMLCanvasElement>('[data-gamma-canvas]');
  if (!canvas) return;
  const local = new AbortController();
  const { signal } = local;
  const status = root.querySelector<HTMLElement>('[data-gamma-status]');
  const controls = root.querySelectorAll<HTMLButtonElement>('[data-gamma-preset], [data-gamma-reset]');
  let renderer: SurfaceRenderer | null = null;
  let view = copyView(GAMMA_VIEWS.oblique);
  let active: Preset | 'custom' = 'oblique';
  let frame = 0;
  let disposed = false;
  let drag: { id: number; x: number; y: number; azimuth: number; elevation: number; touch: boolean; committed: boolean } | undefined;

  const updateControls = () => {
    root.dataset.gammaView = active;
    for (const button of controls) {
      button.disabled = !renderer;
      if (button.dataset.gammaPreset) button.setAttribute('aria-pressed', String(button.dataset.gammaPreset === active));
    }
  };
  const announce = (text: string) => { if (status) status.textContent = text; };
  const fallback = () => {
    if (disposed || !canvas) return;
    delete root.dataset.gammaReady;
    renderer?.dispose();
    renderer = null;
    // A canvas that once owned WebGL cannot subsequently acquire a 2D context.
    const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
    replacement.width = canvas.width;
    replacement.height = canvas.height;
    canvas.replaceWith(replacement);
    canvas = replacement;
    try { renderer = createCanvasRenderer(canvas, createGammaMesh({ resolution: 54 })); } catch { /* Keep SSR poster visible. */ }
    updateControls();
    if (!renderer) announce('曲面预览');
  };
  const draw = () => {
    frame = 0;
    if (disposed || !renderer || !canvas || !root.isConnected) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    let drawn = false;
    try { drawn = renderer.draw(view, rect.width, rect.height); } catch { /* Try the CPU renderer below. */ }
    if (!drawn && renderer.kind === 'webgl') {
      fallback();
      try { drawn = renderer?.draw(view, rect.width, rect.height) ?? false; } catch { drawn = false; }
    }
    if (drawn && renderer) {
      root.dataset.gammaReady = 'true';
      root.dataset.gammaRenderer = renderer.kind;
    } else {
      delete root.dataset.gammaReady;
    }
  };
  const requestDraw = () => {
    if (!disposed && !frame) frame = requestAnimationFrame(draw);
  };
  const drawImmediately = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    draw();
  };
  const stopDrag = () => {
    if (drag && canvas?.hasPointerCapture(drag.id)) canvas.releasePointerCapture(drag.id);
    drag = undefined;
    delete root.dataset.gammaDragging;
    if (frame) drawImmediately();
  };
  const selectView = (preset: Preset) => {
    stopDrag();
    view = copyView(GAMMA_VIEWS[preset]);
    active = preset;
    updateControls();
    drawImmediately();
    announce(`${labels[preset]}，拖动可继续旋转`);
  };

  // Root listeners survive the canvas replacement used by the software fallback.
  root.addEventListener('pointerdown', event => {
    if (!canvas || event.target !== canvas || !renderer || !event.isPrimary || event.button !== 0 || drag) return;
    const touch = event.pointerType === 'touch';
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, azimuth: view.azimuth, elevation: view.elevation, touch, committed: !touch };
    if (!touch) {
      canvas.setPointerCapture(event.pointerId);
      canvas.focus({ preventScroll: true });
      root.dataset.gammaDragging = 'true';
      event.preventDefault();
    }
  }, { signal });
  root.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id || !canvas) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (drag.touch && !drag.committed) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag = undefined; return; }
      if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      drag.committed = true;
      canvas.setPointerCapture(event.pointerId);
      root.dataset.gammaDragging = 'true';
    }
    if (event.cancelable) event.preventDefault();
    const sensitivity = 3.5 / Math.max(280, canvas.getBoundingClientRect().width);
    view.azimuth = drag.azimuth - dx * sensitivity;
    view.elevation = clampElevation(drag.elevation + dy * sensitivity);
    active = 'custom';
    updateControls();
    requestDraw();
  }, { signal, passive: false });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    root.addEventListener(name, event => { if (drag?.id === event.pointerId) stopDrag(); }, { signal });
  }
  window.addEventListener('blur', stopDrag, { signal });
  root.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const control = target?.closest<HTMLButtonElement>('[data-gamma-preset], [data-gamma-reset]');
    if (!control && target !== canvas) return;
    // An enclosing editorial link must never navigate after a viewer action.
    event.preventDefault();
    event.stopPropagation();
    if (!control || control.disabled) return;
    const preset = control.hasAttribute('data-gamma-reset') ? 'oblique' : control.dataset.gammaPreset;
    if (presetNames.includes(preset as Preset)) selectView(preset as Preset);
  }, { signal });
  root.addEventListener('keydown', event => {
    if (event.target !== canvas || !renderer) return;
    if (event.key === 'Home') { event.preventDefault(); selectView('oblique'); return; }
    const amount = event.shiftKey ? 0.16 : 0.065;
    switch (event.key) {
      case 'ArrowLeft': view.azimuth += amount; break;
      case 'ArrowRight': view.azimuth -= amount; break;
      case 'ArrowUp': view.elevation = clampElevation(view.elevation + amount); break;
      case 'ArrowDown': view.elevation = clampElevation(view.elevation - amount); break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
    active = 'custom';
    updateControls();
    requestDraw();
  }, { signal });
  canvas.addEventListener('webglcontextlost', event => {
    if (disposed) return;
    event.preventDefault();
    delete root.dataset.gammaReady;
    drag = undefined;
    delete root.dataset.gammaDragging;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    fallback();
    requestDraw();
  }, { signal });

  try { renderer = createWebGLRenderer(canvas, createGammaMesh()); } catch { /* SSR remains until a successful fallback draw. */ }
  if (!renderer) fallback();
  updateControls();
  drawImmediately();
  const resize = new ResizeObserver(requestDraw);
  resize.observe(root);
  const theme = new MutationObserver(requestDraw);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  systemTheme.addEventListener('change', requestDraw, { signal });
  window.addEventListener('resize', requestDraw, { signal });

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    local.abort();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    drag = undefined;
    resize.disconnect();
    theme.disconnect();
    renderer?.dispose();
    renderer = null;
    delete root.dataset.gammaReady;
    delete root.dataset.gammaRenderer;
    delete root.dataset.gammaDragging;
  };
  pageSignal.addEventListener('abort', cleanup, { once: true });
  if (pageSignal.aborted) cleanup();
  return cleanup;
}

registerPageFeature('gamma-surface', signal => {
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>('[data-gamma-viewer]'), root => mountViewer(root, signal));
  return () => cleanups.forEach(cleanup => cleanup?.());
});
