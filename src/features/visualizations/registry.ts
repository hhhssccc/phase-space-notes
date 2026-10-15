import subtraction from './fragments/grover-subtraction.html?raw';
import counting from './fragments/grover-counting.html?raw';
import css from './surface.css?raw';

export const groverPaper = {
  title: 'Opening the Black Box inside Grover’s Algorithm',
  authors: 'E. M. Stoudenmire 与 Xavier Waintal',
  publication: 'Physical Review X 14, 041029 (2024)',
  url: 'https://doi.org/10.1103/PhysRevX.14.041029',
};

export const visualizations = {
  'grover-subtraction': { fragment: subtraction, title: 'QiGA：减掉背景，让答案显影', sourceLocation: '第 IV 节' },
  'grover-counting': { fragment: counting, title: 'QiGA-2：沿着前缀，一步步找到解', sourceLocation: '第 VI A 节 · 图 9 · 公式 (21)–(24)' },
} as const;
export type VisualizationId = keyof typeof visualizations;

/** Self-contained document; code cannot access the host page. */
export function visualizationDocument(id: VisualizationId) {
  const item = visualizations[id];
  const fragment = item.fragment;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex"><title>${item.title}</title><style>${css}</style></head><body><main id="visualization-root">${fragment}</main><script>
  (() => {
    let lastHeight = 0;
    const report = () => {
      const height = Math.ceil(document.getElementById('visualization-root').getBoundingClientRect().height) + 32;
      if (height !== lastHeight) { lastHeight = height; parent.postMessage({ type: 'visualization-size', height }, '*'); }
    };
    new ResizeObserver(report).observe(document.getElementById('visualization-root'));
    window.addEventListener('message', event => {
      if (event.source !== parent || event.data?.type !== 'visualization-theme') return;
      if (['light','dark'].includes(event.data.theme)) document.documentElement.style.colorScheme = event.data.theme;
    });
    window.addEventListener('load', report);
    parent.postMessage({ type: 'visualization-ready' }, '*');
  })();</script></body></html>`;
}
