import { siteUrl } from '../lib/urls.mjs';
export function rehypeSiteUrls({ base = '/' } = {}) {
  return function visit(node) {
    if (node.type === 'element') for (const key of ['href', 'src', 'action', 'poster']) {
      if (typeof node.properties?.[key] === 'string') node.properties[key] = siteUrl(node.properties[key], base);
    }
    node.children?.forEach(visit);
  };
}
