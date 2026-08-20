function normalizeBase(base) {
  if (!base || base === '/') return '';
  return `/${String(base).replace(/^\/+|\/+$/g, '')}`;
}

function transformText(node, basePrefix) {
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
      : `/articles/${clean}/`;
    const url = `${basePrefix}${route}`;
    parts.push({ type: 'link', url, children: [{ type: 'text', value: label }] });
    cursor = pattern.lastIndex;
  }

  if (cursor === 0) return null;
  if (cursor < node.value.length) parts.push({ type: 'text', value: node.value.slice(cursor) });
  return parts;
}

function walk(node, basePrefix) {
  if (!node || !Array.isArray(node.children)) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text') next.push(...(transformText(child, basePrefix) || [child]));
    else {
      walk(child, basePrefix);
      next.push(child);
    }
  }
  node.children = next;
}

export function remarkWikiLinks(options = {}) {
  const basePrefix = normalizeBase(options.base);
  return (tree) => walk(tree, basePrefix);
}
