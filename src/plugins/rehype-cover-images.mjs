import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { coverPath, visitCoverImages } from '../lib/build/cover-images.mjs';
import { siteUrl } from '../lib/urls.mjs';

export function rehypeCoverImages({ base = '/', covers = {} } = {}) {
  const update = image => {
    const source = coverPath(image.properties.src);
    const cover = covers[source];
    if (!cover) throw new Error(`Cover was not prepared: ${source}`);
    const fallback = cover.variants.find(item => item.width >= 960) || cover.variants.at(-1);
    Object.assign(image.properties, {
      alt: '', src: siteUrl(fallback.src, base),
      srcSet: cover.variants.map(item => `${siteUrl(item.src, base)} ${item.width}w`).join(', '),
      sizes: '(max-width: 48rem) calc(100vw - 2.5rem), 46rem',
      width: cover.width, height: cover.height,
      loading: 'eager', decoding: 'async', fetchPriority: 'high',
      'data-fullsize-src': siteUrl(source, base),
    });
  };
  return tree => {
    // Raw HTML figures survive remark-rehype; parse only these fragments so
    // the rest of the Markdown/KaTeX pipeline and article text stay unchanged.
    const walk = node => {
      if (node.type === 'raw' && /<figure\b[^>]*\blead-figure\b/i.test(node.value)) {
        const fragment = fromHtml(node.value, { fragment: true });
        visitCoverImages(fragment, update);
        node.value = toHtml(fragment);
      }
      node.children?.forEach(walk);
    };
    walk(tree);
    visitCoverImages(tree, update);
  };
}
