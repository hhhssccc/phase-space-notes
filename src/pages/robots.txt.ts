export function GET({ site }: { site?: URL }) {
  const origin = site?.origin || 'https://phase-space-notes.vercel.app';
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
