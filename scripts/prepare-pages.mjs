import { cp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../dist/', import.meta.url));
const target = fileURLToPath(new URL('../.pages-dist/', import.meta.url));
const base = '/phase-space-notes';
const textExtensions = new Set(['.html', '.css', '.js', '.xml', '.txt', '.json']);

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if ([...textExtensions].some((extension) => entry.name.endsWith(extension))) await prefixFile(path);
  }
}

async function prefixFile(path) {
  const original = await readFile(path, 'utf8');
  const updated = original
    .replace(/(\b(?:href|src|action)=["'])\/(?!\/|phase-space-notes(?:\/|["']))/g, `$1${base}/`)
    .replace(/url\((["']?)\/(?!\/|phase-space-notes\/)/g, `url($1${base}/`)
    .replace(/(["'])\/(?!phase-space-notes\/)(articles|notes|tags|archive|about|search|rss\.xml|assets|figures|_astro)(?=[/"'])/g, `$1${base}/$2`);
  if (updated !== original) await writeFile(path, updated);
}

await walk(target);
console.log(`Prepared GitHub Pages artifact at ${target}`);
