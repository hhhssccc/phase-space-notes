import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fromHtml } from 'hast-util-from-html';
import { visitCoverImages } from '../src/lib/build/cover-images.mjs';
import { startPreview, detectBuildBase } from './lib/preview-server.mjs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const directory = process.env.RENDER_OUTPUT_DIR || 'dist';
const base = await detectBuildBase(directory);
const server = await startPreview(directory, base);
const output = process.env.QA_DIR || '.qa/covers';
await mkdir(output, { recursive: true });
let browser;
try {
  const routes = [];
  for (const file of await readdir(directory, { recursive: true })) {
    if (!file.endsWith('index.html')) continue;
    const html = await readFile(path.join(directory, file), 'utf8');
    visitCoverImages(fromHtml(html), () => routes.push(file.replaceAll('\\', '/').replace(/index.html$/, '')));
  }
  assert.ok(routes.length > 0);
  browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await mobile.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes) {
    await page.goto(server.url + route);
    const image = page.locator('.lead-figure img');
    await image.evaluate(image => image.decode());
    assert.equal(await image.getAttribute('alt'), '');
    const selected = await image.evaluate(image => image.currentSrc);
    assert.match(selected, /-960\.webp$/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const target = path.join(directory, new URL(selected).pathname.slice(base.length));
    const bytes = (await stat(target)).size;
    console.log(`${route}: ${bytes} bytes, mobile 960px cover`);
  }
  const route = 'articles/jones-polynomial-braids-and-link-invariants/';
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(server.url + route);
    const image = page.locator('.lead-figure img');
    await image.evaluate(image => image.decode());
    await image.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `mobile-${theme}.png`) });
    const original = await image.getAttribute('data-fullsize-src');
    await image.click();
    await page.locator('[data-lightbox][open]').waitFor();
    assert.ok((await page.locator('[data-lightbox-image]').getAttribute('src')).endsWith(original));
    await page.locator('[data-lightbox-image]').evaluate(image => image.decode());
    await page.locator('[data-lightbox-close]').click();
  }
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.lead-figure img').isVisible(), true);
  assert.deepEqual(errors, []);
  await mobile.close();
  // Slow and failed downloads keep the reserved image box and no description.
  const failed = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await failed.route('**/_covers/**', async route => { await new Promise(resolve => setTimeout(resolve, 400)); await route.abort('failed'); });
  await failed.goto(server.url + route);
  const image = failed.locator('.lead-figure img');
  assert.equal(await image.getAttribute('alt'), '');
  assert.equal(await image.evaluate(image => image.naturalWidth), 0);
  const rect = await image.boundingBox();
  assert.ok(rect.height > 100, 'failed image keeps its layout space');
  await image.scrollIntoViewIfNeeded();
  await failed.screenshot({ path: path.join(output, 'mobile-failed.png') });
  console.log(`COVER_IMAGES_PASS: ${routes.length} covers; mobile selection, light/dark, original lightbox, print, failed download.`);
} finally { await browser?.close(); await server.close(); }
