import { readdir, readFile, mkdir, access, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { fromHtml } from 'hast-util-from-html';

export function visitCoverImages(tree, callback, inCover = false) {
  const cover = inCover || (tree.tagName === 'figure' && tree.properties?.className?.includes('lead-figure'));
  if (cover && tree.tagName === 'img') callback(tree);
  tree.children?.forEach(child => visitCoverImages(child, callback, cover));
}

export function coverPath(src) {
  // Accept existing absolute, base-prefixed and ../../figures source paths.
  if (/^(?:[a-z]+:)?\/\//i.test(src)) throw new Error(`Cover must be local: ${src}`);
  const pathname = decodeURIComponent(src.split(/[?#]/)[0]);
  const index = pathname.indexOf('/figures/');
  if (index < 0) throw new Error(`Cover must be in public/figures: ${src}`);
  const result = path.posix.normalize(pathname.slice(index));
  if (!result.startsWith('/figures/')) throw new Error(`Invalid cover path: ${src}`);
  return result;
}

/** Generated before Astro copies public/. Originals and authored Markdown stay intact. */
export async function prepareCoverImages(root) {
  const sources = new Set();
  for (const file of await readdir(path.join(root, 'content'))) {
    if (!file.endsWith('.md')) continue;
    const text = await readFile(path.join(root, 'content', file), 'utf8');
    for (const figure of text.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)) {
      visitCoverImages(fromHtml(figure[0], { fragment: true }), image => sources.add(coverPath(image.properties.src)));
    }
  }
  const output = path.join(root, 'public', '_covers');
  await mkdir(output, { recursive: true });
  const manifest = {};
  for (const source of sources) {
    const input = await readFile(path.join(root, 'public', source.slice(1)));
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`Invalid cover dimensions: ${source}`);
    const hash = createHash('sha256').update('cover-webp-82-v1').update(input).digest('hex').slice(0, 16);
    const widths = [...new Set([320, 640, 960, 1440].map(width => Math.min(width, metadata.width)))];
    const variants = [];
    for (const width of widths) {
      const name = `${hash}-${width}.webp`;
      const target = path.join(output, name);
      try { await access(target); }
      catch { await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(target); }
      variants.push({ width, src: `/_covers/${name}` });
    }
    manifest[source] = { width: metadata.width, height: metadata.height, variants };
  }
  await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest));
  return manifest;
}
