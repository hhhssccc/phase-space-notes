import { normalizeBase } from '../lib/urls.mjs';
import { contentRoutes } from './content-routes.mjs';

function transformText(node, basePrefix, routes) {
  const pattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const parts = [];
  let cursor = 0;
  let match;

  while ((match = pattern.exec(node.value)) !== null) {
    if (match.index > cursor) parts.push({ type: 'text', value: node.value.slice(cursor, match.index) });
    const target = match[1].trim();
    const label = (match[2] || target).trim();
    const clean = target.replace(/^\/+|\/+$/g, '');
    const route = clean.startsWith('notes/') || clean.startsWith('articles/')
      ? `/${clean}/`
      : routes.get(clean);
    if (!route || ![...routes.values()].includes(route)) throw new Error(`WikiLink target is not a public article: ${target}`);
    const url = `${basePrefix}${route}`;
    parts.push({ type: 'link', url, children: [{ type: 'text', value: label }] });
    cursor = pattern.lastIndex;
  }

  if (cursor === 0) return null;
  if (cursor < node.value.length) parts.push({ type: 'text', value: node.value.slice(cursor) });
  return parts;
}

function walk(node, basePrefix, routes) {
  if (!node || !Array.isArray(node.children)) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text') next.push(...(transformText(child, basePrefix, routes) || [child]));
    else {
      walk(child, basePrefix, routes);
      next.push(child);
    }
  }
  node.children = next;
}

export function remarkWikiLinks(options = {}) {
  const basePrefix = normalizeBase(options.base);
  return (tree) => walk(tree, basePrefix, options.routes ?? contentRoutes());
}
