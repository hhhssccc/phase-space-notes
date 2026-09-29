type PageFeature = (signal: AbortSignal) => void | (() => void) | Promise<void | (() => void)>;
const features = new Map<string, PageFeature>();
let controller: AbortController | undefined;
let cleanups: (() => void)[] = [];

function unmountPage() {
  for (const cleanup of cleanups.splice(0)) {
    try { cleanup(); } catch (error) { console.error('Page cleanup failed', error); }
  }
  controller?.abort();
}

document.addEventListener('astro:before-swap', unmountPage);
document.addEventListener('astro:page-load', () => {
  unmountPage();
  controller = new AbortController();
  const { signal } = controller;
  for (const [name, mount] of features) {
    // Start each feature independently: a lazy dependency cannot block siblings.
    try {
      Promise.resolve(mount(signal)).then(cleanup => {
        if (!cleanup) return;
        if (signal.aborted) cleanup(); else cleanups.push(cleanup);
      }).catch(error => { if (!signal.aborted) console.error(`${name} failed`, error); });
    } catch (error) { console.error(`${name} failed`, error); }
  }
});

/** Page-only features. Persistent music and the study drawer must not register here. */
export function registerPageFeature(name: string, mount: PageFeature) {
  features.set(name, mount);
}
