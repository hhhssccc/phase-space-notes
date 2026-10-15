import type { ArticleEntry } from './content';
import previews from '../features/visualizations/previews.json';
import { previewDiagrams } from '../features/previews/diagrams';

type Preview = { width: number; height: number; variants: { width: number; src: string }[] };

export function entryPreview(entry: ArticleEntry): Preview | undefined {
  if (entry.data.visualization) {
    const id = entry.data.visualization;
    return { ...previews[id], variants: [{ width: previews[id].width, src: `/visualizations/${id}.png` }] };
  }
  if (entry.data.type === 'essay' || entry.data.type === 'note') {
    if (!previewDiagrams[entry.id]) throw new Error(`Missing preview diagram: ${entry.id}`);
    return { width: 640, height: 400, variants: [{ width: 640, src: `/previews/${entry.id}.svg` }] };
  }
  return undefined;
}
