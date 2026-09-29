// Optional real-browser gate after npm run build. Uses an externally installed
// Playwright (PLAYWRIGHT_MODULE may name its package directory); no browser or
// library is downloaded by this script. EDGE_EXECUTABLE overrides the browser.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve('dist');
const base = (process.env.BASE_PATH || '/phase-space-notes').replace(/\/$/, '');
const slug = '/articles/jones-polynomial-braids-and-link-invariants/';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (base && !pathname.startsWith(`${base}/`)) throw new Error('outside base');
    pathname = pathname.slice(base.length);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) throw new Error('outside build');
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: false, ...(process.env.EDGE_EXECUTABLE ? { executablePath: process.env.EDGE_EXECUTABLE } : { channel: 'msedge' }) });
  const url = `http://127.0.0.1:${server.address().port}${base}${slug}`;
  for (const fallback of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (fallback) await page.route(`**${slug}`, async route => {
      const response = await route.fetch();
      const body = (await response.text()).replace('</head>', '<style>.reading-progress{animation-timeline:auto!important}</style></head>');
      await route.fulfill({ response, body });
    });
    await page.addInitScript(() => {
      window.__scrollRegistrations = 0;
      const original = window.addEventListener;
      window.addEventListener = function(type, ...args) {
        if (type === 'scroll') window.__scrollRegistrations++;
        return original.call(this, type, ...args);
      };
    });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => window.__scrollRegistrations), fallback ? 1 : 0);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const fraction of [0, 0.5, 1]) {
        await page.evaluate(fraction => {
          const article = document.querySelector('.article-main');
          scrollTo({ top: article.offsetTop + (article.offsetHeight - innerHeight) * fraction, behavior: 'instant' });
        }, fraction);
        await page.waitForTimeout(250);
        const actual = await page.locator('.reading-progress').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a);
        assert.ok(Math.abs(actual - fraction) < 0.025, `progress ${actual}, expected ${fraction}, width=${width}, fallback=${fallback}`);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      // Exercise real pointer movement and wheel scrolling in headed Edge, then
      // verify the settled page remains responsive without new scroll handlers.
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      for (let pass = 0; pass < 3; pass++) {
        await page.mouse.move(width * .3, 300, { steps: 20 });
        await page.mouse.move(width * .7, 700, { steps: 20 });
        await page.mouse.wheel(0, 1100);
        await page.waitForTimeout(120);
      }
      await page.mouse.wheel(0, -1400);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window.__scrollRegistrations), fallback ? 1 : 0);
    }
    assert.equal(await page.locator('.article-prose .katex').count(), 230);
    assert.equal(await page.locator('.article-prose math').count(), 230);
    const id = await page.locator('.article-prose h2').last().getAttribute('id');
    await page.evaluate(id => { location.hash = id; }, id);
    await page.waitForTimeout(2000);
    const top = await page.evaluate(id => document.getElementById(id).getBoundingClientRect().top, id);
    assert.ok(top >= -20 && top < 100);
    assert.ok(await page.evaluate(() => window.find('这就是本约定下的 Jones skein 关系')));
    await page.emulateMedia({ media: 'print' });
    assert.ok(await page.locator('.katex-display').evaluateAll(elements => elements.every(element => {
      const style = getComputedStyle(element);
      return style.transform === 'none' && style.contentVisibility === 'visible';
    })));
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('ARTICLE_INTERACTION_PASS: native and fallback progress; desktop/mobile; sustained pointer/wheel interaction; all 230 HTML/MathML formulas; anchors; find; print.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
