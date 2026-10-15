import subtraction from './fragments/grover-subtraction.html?raw';
import mps from './fragments/grover-mps.html?raw';
import counting from './fragments/grover-counting.html?raw';
import noise from './fragments/grover-noise.html?raw';
import css from './surface.css?raw';
import d3 from './vendor/d3.min.js?raw';

export const visualizations = {
  'grover-subtraction': { fragment: subtraction, title: '减掉背景，让答案显影', cue: '切换目标集合，观察四组振幅怎样变化。' },
  'grover-mps': { fragment: mps, title: '小矩阵怎样装下大向量', cue: '换一个比特串，再回看计算途中键维的变化。' },
  'grover-counting': { fragment: counting, title: '沿着前缀，一步步找到解', cue: '切换单解与多解，拖动步骤回看搜索路径。' },
  'grover-noise': { fragment: noise, title: '噪声怎样吃掉 Grover 的优势', cue: '拖动比特数和噪声强度，点按曲线比较成功率。' },
} as const;
export type VisualizationId = keyof typeof visualizations;

/** Self-contained document: downloaded examples work offline; code cannot access the host page. */
export function visualizationDocument(id: VisualizationId) {
  const item = visualizations[id];
  const fragment = item.fragment.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/d3@7\.9\.0\/dist\/d3\.min\.js"><\/script>/, () => `<script>${d3}</script>`);
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
