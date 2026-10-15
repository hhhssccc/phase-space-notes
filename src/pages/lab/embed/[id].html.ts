import type { APIRoute } from 'astro';
import { getPublicContent } from '../../../lib/content/service';
import { visualizationDocument } from '../../../features/visualizations/registry';
export async function getStaticPaths() {
  const ids = new Set((await getPublicContent()).entries.flatMap(entry => entry.data.visualization ? [entry.data.visualization] : []));
  return [...ids].map(id => ({ params: { id }, props: { id } }));
}
export const GET: APIRoute = ({ props }) => new Response(visualizationDocument(props.id), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
