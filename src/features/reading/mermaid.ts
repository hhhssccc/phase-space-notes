import { resolvedDark } from '../../lib/browser/preferences';
export async function mountMermaid(signal: AbortSignal) {
  if (document.body.dataset.featureMermaid !== 'true') return;
  const codes = [...document.querySelectorAll<HTMLElement>('.article-prose pre > code.language-mermaid')];
  if (!codes.length) return;
  // Keep the original code readable until the lazy renderer is available.
  const { default: mermaid } = await import('mermaid');
  if (signal.aborted) return;
  const nodes = codes.map(code => {
    const node = document.createElement('div');
    node.className = 'mermaid'; node.textContent = code.textContent;
    code.parentElement?.replaceWith(node);
    return node;
  });
  mermaid.initialize({ startOnLoad: false, theme: resolvedDark() ? 'dark' : 'neutral', securityLevel: 'strict' });
  await mermaid.run({ nodes });
}
