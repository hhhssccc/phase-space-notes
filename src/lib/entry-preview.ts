import type { ArticleEntry } from './content';
import { previewDiagrams } from '../features/previews/diagrams';

type Preview = { width: number; height: number; variants: { width: number; src: string }[] };

export function entryPreview(entry: ArticleEntry): Preview | undefined {
  if (entry.data.type === 'reflection') {
    return { width: 640, height: 400, variants: [{ width: 640, src: `/figures/${entry.id}/cover.webp` }] };
  }
  if (entry.data.type === 'essay' || entry.data.type === 'note' || entry.data.type === 'visualization') {
    if (!previewDiagrams[entry.id]) throw new Error(`Missing preview diagram: ${entry.id}`);
    return { width: 640, height: 400, variants: [{ width: 640, src: `/previews/${entry.id}.svg` }] };
  }
  return undefined;
}
