import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from '@astrojs/markdown-remark';
let signature = '';
let routes = new Map();
export function contentRoutes(directory = 'content') {
  const files = readdirSync(directory).filter(name => name.endsWith('.md')).sort();
  const next = directory + files.map(name => { const stat = statSync(join(directory, name)); return `${name}:${stat.mtimeMs}:${stat.size}`; }).join('|');
  if (next === signature) return routes;
  const index = new Map();
  for (const name of files) {
    const { frontmatter } = parseFrontmatter(readFileSync(join(directory, name), 'utf8'));
    if (frontmatter.draft !== false) continue;
    const id = name.slice(0, -3);
    index.set(id, `/${frontmatter.type === 'note' ? 'notes' : 'articles'}/${id}/`);
  }
  signature = next; routes = index;
  return routes;
}
