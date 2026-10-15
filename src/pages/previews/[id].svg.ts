import type { APIRoute } from 'astro';
import { getPublicContent } from '../../lib/content/service';
import { previewSvg } from '../../features/previews/diagrams';

export async function getStaticPaths() {
  return (await getPublicContent()).entries
    .filter(entry => entry.data.type === 'essay' || entry.data.type === 'note' || entry.data.type === 'visualization')
    .map(entry => ({ params: { id: entry.id }, props: { id: entry.id } }));
}
export const GET: APIRoute = ({ props }) => new Response(previewSvg(props.id), {
  headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
});
