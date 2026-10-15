import { readFile } from 'node:fs/promises';
import { fromHtml } from 'hast-util-from-html';
import { coverPath, visitCoverImages } from './build/cover-images.mjs';
import type { ArticleEntry } from './content';
import previews from '../features/visualizations/previews.json';

type Preview = { width: number; height: number; variants: { width: number; src: string }[] };
// Prepared by astro.config before pages render; no original images are sent to lists.
const manifest: Promise<Record<string, Preview>> = readFile('public/_covers/manifest.json', 'utf8').then(JSON.parse);

export async function entryPreview(entry: ArticleEntry): Promise<Preview | undefined> {
  if (entry.data.visualization) {
    const id = entry.data.visualization;
    return { ...previews[id], variants: [{ width: previews[id].width, src: `/visualizations/${id}.png` }] };
  }
  let source: string | undefined;
  for (const figure of (entry.body || '').matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)) {
    visitCoverImages(fromHtml(figure[0], { fragment: true }), (image: { properties: { src: string } }) => {
      source ??= coverPath(image.properties.src);
    });
    if (source) break;
  }
  return source ? (await manifest)[source] : undefined;
}
