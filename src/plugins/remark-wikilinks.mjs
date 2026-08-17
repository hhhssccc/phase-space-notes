function transformText(node) {
  const pattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const parts = [];
  let cursor = 0;
  let match;

  while ((match = pattern.exec(node.value)) !== null) {
    if (match.index > cursor) parts.push({ type: 'text', value: node.value.slice(cursor, match.index) });
    const target = match[1].trim();
    const label = (match[2] || target).trim();
    const clean = target.replace(/^\/+|\/+$/g, '');
    const url = clean.startsWith('notes/') || clean.startsWith('articles/')
      ? `/${clean}/`
      : `/articles/${clean}/`;
    parts.push({ type: 'link', url, children: [{ type: 'text', value: label }] });
    cursor = pattern.lastIndex;
  }

  if (cursor === 0) return null;
  if (cursor < node.value.length) parts.push({ type: 'text', value: node.value.slice(cursor) });
  return parts;
}

function walk(node) {
  if (!node || !Array.isArray(node.children)) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text') next.push(...(transformText(child) || [child]));
    else {
      walk(child);
      next.push(child);
    }
  }
  node.children = next;
}

export function remarkWikiLinks() {
  return (tree) => walk(tree);
}
