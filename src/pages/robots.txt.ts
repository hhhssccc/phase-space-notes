export function GET({ site }: { site?: URL }) {
  const origin = site?.origin || 'https://hhhssccc.github.io';
  const base = import.meta.env.BASE_URL || '/';
  const basePath = base.endsWith('/') ? base : `${base}/`;
  const sitemap = new URL(`${basePath.replace(/^\//, '')}sitemap-index.xml`, `${origin}/`);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap.href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
