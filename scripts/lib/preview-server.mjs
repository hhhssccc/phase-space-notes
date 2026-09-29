import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { normalizeBase } from '../../src/lib/urls.mjs';
export async function detectBuildBase(directory = 'dist') {
  const html = await readFile(path.join(directory, 'index.html'), 'utf8');
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  if (!canonical) throw new Error('Build homepage is missing its canonical URL');
  return new URL(canonical[1]).pathname;
}
export async function startPreview(directory = 'dist', base = '/phase-space-notes') {
  const root = path.resolve(directory); const prefix = normalizeBase(base);
  const mime = { '.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.m4a':'audio/mp4','.xml':'application/xml' };
  const server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (prefix && !pathname.startsWith(`${prefix}/`)) throw Error('outside base');
      pathname = pathname.slice(prefix.length);
      if (pathname.endsWith('/')) pathname += 'index.html';
      const file = path.resolve(root, `.${pathname}`);
      if (!file.startsWith(`${root}${path.sep}`)) throw Error('outside output');
      const metadata = await stat(file); const data = await readFile(file);
      const headers = {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Accept-Ranges':'bytes'};
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]); const end = range[2] ? Math.min(Number(range[2]), metadata.size-1) : metadata.size-1;
        if (start > end) { response.writeHead(416); response.end(); return; }
        response.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${metadata.size}`,'Content-Length':end-start+1});
        response.end(data.subarray(start,end+1));
      } else { response.writeHead(200,{...headers,'Content-Length':metadata.size});response.end(data); }
    } catch { response.writeHead(404);response.end(); }
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  return { url:`http://127.0.0.1:${server.address().port}${prefix}/`,close:()=>new Promise(resolve=>server.close(resolve)) };
}
