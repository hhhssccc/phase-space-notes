// Run after building; this script never builds, downloads a browser, or changes
// dependencies. Supports the same PLAYWRIGHT_MODULE, EDGE_EXECUTABLE,
// SITE_BROWSER_URL, RENDER_OUTPUT_DIR, BASE_PATH, and BROWSER_HEADED variables as
// check-site-browser.mjs. QA_DIR defaults to .qa/journal/site.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { startPreview, detectBuildBase } from './lib/preview-server.mjs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = createRequire(import.meta.url)('sharp');
const output = path.resolve(process.env.QA_DIR || '.qa/journal/site');
await mkdir(output, { recursive: true });
const directory = process.env.RENDER_OUTPUT_DIR || 'dist';
const server = process.env.SITE_BROWSER_URL
  ? { url: process.env.SITE_BROWSER_URL.replace(/\/?$/, '/'), close: async () => {} }
  : await startPreview(directory, process.env.BASE_PATH || await detectBuildBase(directory));
const home = server.url;
const selector = '[data-gamma-viewer]';
const canvasSelector = `${selector} [data-gamma-canvas]`;
const reports = [];
const idleChecks = [];
let browser;
let currentPage;

/** Count actual surface draws, independently of unrelated page RAF callbacks. */
function instrument({ forceSoftware }) {
  window.__gammaQA = { draws: 0, webgl: 0, software: 0, identity: Math.random() };
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (name, ...args) {
    if (forceSoftware && /^(webgl2?|experimental-webgl)$/.test(String(name))) return null;
    return getContext.call(this, name, ...args);
  };
  const wrap = (prototype, method, renderer) => {
    if (!prototype?.[method]) return;
    const original = prototype[method];
    prototype[method] = function (...args) {
      if (this.canvas?.matches('[data-gamma-canvas]')) {
        window.__gammaQA.draws += 1;
        window.__gammaQA[renderer] += 1;
      }
      return original.apply(this, args);
    };
  };
  wrap(window.WebGLRenderingContext?.prototype, 'drawElements', 'webgl');
  wrap(window.WebGL2RenderingContext?.prototype, 'drawElements', 'webgl');
  wrap(window.CanvasRenderingContext2D?.prototype, 'clearRect', 'software');
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.locator(`${selector}[data-gamma-ready="true"]`).waitFor({ timeout: 20_000 });
  await page.locator(`${selector} [data-gamma-preset="oblique"]:enabled`).waitFor();
  await settle(page);
  assert.equal(await page.locator(selector).count(), 1, 'one Gamma viewer per homepage');
  assert.ok(['webgl', 'canvas2d'].includes(await page.locator(selector).getAttribute('data-gamma-renderer')));
  assert.equal(await page.evaluate(() => devicePixelRatio), 1, 'QA screenshots use device scale 1');
  assert.equal(await page.evaluate(() => visualViewport.scale), 1, 'mobile page is not zoomed');
}
async function fit(page, name) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.width, `${name}: horizontal overflow ${JSON.stringify(dimensions)}`);
}
async function noNavigation(page, identity) {
  assert.equal(page.url(), home, 'surface input must remain on the homepage');
  assert.equal(await page.evaluate(() => window.__gammaQA.identity), identity, 'surface input must not reload the document');
}
async function surfacePixels(page) {
  // Capture displayed pixels, not toDataURL(): WebGL need not preserve its
  // drawing buffer after the compositor has presented the frame.
  const canvas = page.locator(canvasSelector);
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  // Compare the sculpture itself. Header, labels, hover/focus indicators and
  // preset controls can legitimately change pixels without changing the camera.
  const png = await page.screenshot({
    clip: { x: box.x + box.width * 0.14, y: box.y + box.height * 0.20, width: box.width * 0.72, height: box.height * 0.42 },
    scale: 'css',
  });
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { png, pixels: data, width: info.width, height: info.height };
}
function pixelDelta(before, after) {
  assert.equal(after.width, before.width, 'surface crop width remains fixed');
  assert.equal(after.height, before.height, 'surface crop height remains fixed');
  let maxAbs = 0, changedPixels = 0, significantPixels = 0;
  for (let index = 0; index < before.pixels.length; index += 4) {
    let difference = 0;
    for (let channel = 0; channel < 3; channel++) difference = Math.max(difference, Math.abs(before.pixels[index + channel] - after.pixels[index + channel]));
    maxAbs = Math.max(maxAbs, difference);
    if (difference) changedPixels++;
    if (difference >= 4) significantPixels++;
  }
  return { maxAbs, changedPixels, significantPixels };
}
function samePixels(before, after, reason) {
  const difference = pixelDelta(before, after);
  // Chromium may quantize a composited gradient by one RGB level after a route
  // transition. Scene draw counts must still be exactly unchanged when idle.
  assert.ok(difference.maxAbs <= 1, `${reason}: pixels differ ${JSON.stringify(difference)}`);
}
async function changed(page, before, reason) {
  await settle(page);
  const after = await surfacePixels(page);
  const difference = pixelDelta(before, after);
  assert.ok(difference.maxAbs >= 4 && difference.significantPixels >= 20, `${reason}: visibly changed pixels required ${JSON.stringify(difference)}`);
  return after;
}
async function idle(page, reason) {
  await settle(page);
  const before = await surfacePixels(page);
  const count = await page.evaluate(() => window.__gammaQA.draws);
  await page.waitForTimeout(650);
  const after = await surfacePixels(page);
  assert.equal(await page.evaluate(() => window.__gammaQA.draws), count, `${reason}: no autonomous surface draws`);
  const difference = pixelDelta(before, after);
  idleChecks.push({ reason, draws: count, ...difference });
  if (difference.maxAbs > 1) {
    const name = reason.replace(/[^a-zA-Z0-9-]+/g, '-');
    await writeFile(path.join(output, `gamma-idle-${name}-before.png`), before.png);
    await writeFile(path.join(output, `gamma-idle-${name}-after.png`), after.png);
    await writeFile(path.join(output, `gamma-idle-${name}-diagnostic.json`), JSON.stringify(await page.evaluate(() => ({
      animations: document.getAnimations().map(animation => ({ state: animation.playState, target: animation.effect?.target?.className, timing: animation.effect?.getComputedTiming() })),
      canvas: document.querySelector('[data-gamma-canvas]')?.getBoundingClientRect().toJSON(),
      renderer: document.querySelector('[data-gamma-viewer]')?.dataset.gammaRenderer,
    })), null, 2));
  }
  samePixels(before, after, `${reason}: released surface remains still`);
}
async function shot(page, name) {
  await page.mouse.move(0, 0);
  await page.screenshot({ path: path.join(output, `gamma-${name}.png`), animations: 'disabled', scale: 'css' });
}
async function select(page, name) {
  const button = page.locator(`${selector} [data-gamma-preset="${name}"]`);
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await button.tap();
  else await button.click();
  assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), name);
  assert.equal(await page.locator(`${selector} [data-gamma-preset="${name}"]`).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator(`${selector} [data-gamma-preset][aria-pressed="true"]`).count(), 1);
  await settle(page);
}
async function reset(page) {
  const button = page.locator(`${selector} [data-gamma-reset]`);
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await button.tap();
  else await button.click();
  assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), 'oblique');
  await settle(page);
}
async function mouseDrag(page) {
  await page.locator(canvasSelector).scrollIntoViewIfNeeded();
  const box = await page.locator(canvasSelector).boundingBox();
  const start = { x: box.x + box.width * 0.4, y: box.y + box.height * 0.48 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + Math.min(180, box.width * 0.32), start.y + 30, { steps: 12 });
  await page.mouse.up();
  assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), 'custom');
  assert.equal(await page.locator(selector).getAttribute('data-gamma-dragging'), null);
}

/** Real touch input goes through Chromium's gesture recognition and native pan. */
async function touchGesture(page, from, to) {
  const cdp = await page.context().newCDPSession(page);
  const point = (x, y) => ({ x, y, id: 1, radiusX: 2, radiusY: 2, force: 1 });
  try {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(from.x, from.y)] });
    for (let step = 1; step <= 12; step++) {
      const amount = step / 12;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(from.x + (to.x - from.x) * amount, from.y + (to.y - from.y) * amount)] });
      await page.waitForTimeout(18);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await settle(page);
  } finally { await cdp.detach(); }
}

async function contextFor({ width = 1440, theme = 'light', software = false, touch = false, javaScript = true } = {}) {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 844 : 960 },
    deviceScaleFactor: 1, colorScheme: theme, hasTouch: touch, isMobile: touch,
    javaScriptEnabled: javaScript,
  });
  if (javaScript) await context.addInitScript(instrument, { forceSoftware: software });
  const page = await context.newPage();
  currentPage = page;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(home);
  if (javaScript) await ready(page);
  else await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}

async function desktop({ theme, software }) {
  const suffix = `${software ? 'canvas2d' : 'default'}-1440-${theme}`;
  const { context, page, errors } = await contextFor({ theme, software });
  try {
    const identity = await page.evaluate(() => window.__gammaQA.identity);
    const renderer = await page.locator(selector).getAttribute('data-gamma-renderer');
    if (software) assert.equal(renderer, 'canvas2d', 'blocked WebGL must provide an interactive software renderer');
    await fit(page, suffix);
    const original = await surfacePixels(page);
    await shot(page, `${suffix}-oblique`);
    await idle(page, `${suffix} initial`);

    await mouseDrag(page);
    await changed(page, original, `${suffix} mouse drag`);
    await noNavigation(page, identity);
    await idle(page, `${suffix} mouse release`);
    await shot(page, `${suffix}-dragged`);

    await reset(page);
    samePixels(original, await surfacePixels(page), `${suffix}: reset restores the original camera pixels`);
    let previous = original;
    for (const name of ['top', 'side', 'oblique']) {
      await select(page, name);
      previous = await changed(page, previous, `${suffix} ${name} preset`);
      await noNavigation(page, identity);
      await shot(page, `${suffix}-${name}`);
    }
    const beforeKeyboard = await surfacePixels(page);
    await page.locator(canvasSelector).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), 'custom');
    await changed(page, beforeKeyboard, `${suffix} keyboard rotation`);
    await noNavigation(page, identity);
    await page.keyboard.press('Home');
    assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), 'oblique');
    await page.locator(canvasSelector).blur();
    await settle(page);
    samePixels(original, await surfacePixels(page), `${suffix}: Home restores the default camera`);

    // Native wheel scrolling remains available when the pointer is over canvas.
    const box = await page.locator(canvasSelector).boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const scrollBefore = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 230);
    await page.waitForFunction(before => scrollY > before + 30, scrollBefore);
    assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), 'oblique', 'wheel must not orbit the surface');
    await noNavigation(page, identity);

    // Exercise Astro's client navigation in both directions; every new canvas
    // gets exactly one live viewer, while document identity is retained.
    const article = page.locator('a[href*="/articles/"][href$="/"]:not([href$="/articles/"])').first();
    await article.click();
    await page.waitForURL(url => url.pathname !== new URL(home).pathname);
    await page.locator(selector).waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => window.__gammaQA.identity), identity, 'article navigation uses the client router');
    await page.goBack();
    await page.waitForURL(home);
    await ready(page);
    await select(page, 'side');
    await reset(page);
    await idle(page, `${suffix} after navigation`);

    let contextLoss = 'not-applicable: software renderer';
    if (!software && await page.locator(selector).getAttribute('data-gamma-renderer') === 'webgl') {
      const supported = await page.locator(canvasSelector).evaluate(canvas => {
        const extension = canvas.getContext('webgl')?.getExtension('WEBGL_lose_context');
        extension?.loseContext();
        return Boolean(extension);
      });
      if (supported) {
        await page.locator(`${selector}[data-gamma-renderer="canvas2d"][data-gamma-ready="true"]`).waitFor();
        const before = await surfacePixels(page);
        await select(page, 'top');
        await changed(page, before, `${suffix} after context loss`);
        await mouseDrag(page);
        await idle(page, `${suffix} context-loss fallback`);
        contextLoss = 'passed: interactive canvas2d';
        await shot(page, `${suffix}-context-loss`);
      } else contextLoss = 'unavailable: WEBGL_lose_context';
    }
    assert.deepEqual(errors, [], `${suffix}: page errors`);
    reports.push({ scenario: suffix, renderer, contextLoss, passed: true });
  } finally { await context.close(); }
}

async function mobile({ width, theme = 'light', software = false }) {
  const suffix = `${software ? 'canvas2d' : 'default'}-${width}-${theme}-touch`;
  const { context, page, errors } = await contextFor({ width, theme, software, touch: true });
  try {
    await fit(page, suffix);
    const identity = await page.evaluate(() => window.__gammaQA.identity);
    const renderer = await page.locator(selector).getAttribute('data-gamma-renderer');
    if (software) assert.equal(renderer, 'canvas2d');
    const action = await page.locator(canvasSelector).evaluate(el => getComputedStyle(el).touchAction);
    assert.match(action, /pan-y/, 'touch surface preserves native vertical panning');
    await shot(page, `${suffix}-oblique`);
    const before = await surfacePixels(page);
    let box = await page.locator(canvasSelector).boundingBox();
    await touchGesture(page,
      { x: box.x + box.width * 0.25, y: box.y + box.height * 0.48 },
      { x: box.x + box.width * 0.73, y: box.y + box.height * 0.45 });
    assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), 'custom', 'real horizontal touch rotates the surface');
    await changed(page, before, `${suffix} touch drag`);
    await noNavigation(page, identity);
    await idle(page, `${suffix} touch release`);
    await shot(page, `${suffix}-dragged`);
    await reset(page);
    await select(page, 'top');
    await select(page, 'side');
    await noNavigation(page, identity);
    await reset(page);

    // Begin inside the scientific cover, not in the surrounding page gutter.
    box = await page.locator(canvasSelector).boundingBox();
    const scrollBefore = await page.evaluate(() => scrollY);
    const startY = box.y + box.height * 0.68;
    const endY = Math.max(24, startY - Math.min(175, box.height * 0.55));
    await touchGesture(page, { x: box.x + box.width * 0.58, y: startY }, { x: box.x + box.width * 0.58, y: endY });
    await page.waitForFunction(beforeScroll => scrollY > beforeScroll + 25, scrollBefore);
    assert.equal(await page.locator(selector).getAttribute('data-gamma-view'), 'oblique', 'vertical touch scroll does not rotate');
    assert.equal(await page.locator(selector).getAttribute('data-gamma-dragging'), null);
    await fit(page, suffix);
    await noNavigation(page, identity);
    assert.deepEqual(errors, [], `${suffix}: page errors`);
    reports.push({ scenario: suffix, renderer, touchScroll: true, passed: true });
  } finally { await context.close(); }
}

async function poster(width) {
  const { context, page, errors } = await contextFor({ width, javaScript: false });
  try {
    const fallback = page.locator(`${selector} [data-gamma-fallback]`);
    await fallback.waitFor({ state: 'visible' });
    await fallback.locator('img').evaluate(async image => { await image.decode(); });
    assert.ok(await fallback.locator('img').evaluate(image => image.naturalWidth > 0 && image.naturalHeight > 0), 'SSR poster has decoded pixels');
    assert.equal(await page.locator(canvasSelector).evaluate(el => getComputedStyle(el).opacity), '0');
    assert.equal(await page.locator(`${selector} [data-gamma-preset]:enabled, ${selector} [data-gamma-reset]:enabled`).count(), 0, 'unavailable controls remain disabled without JavaScript');
    await fit(page, `no-js-${width}`);
    await shot(page, `no-js-${width}`);
    assert.deepEqual(errors, []);
    reports.push({ scenario: `no-js-${width}`, poster: true, passed: true });
  } finally { await context.close(); }
}

try {
  browser = await chromium.launch({
    headless: process.env.BROWSER_HEADED !== '1', args: ['--mute-audio'],
    ...(process.env.EDGE_EXECUTABLE ? { executablePath: process.env.EDGE_EXECUTABLE } : { channel: 'msedge' }),
  });
  await desktop({ theme: 'light', software: false });
  await desktop({ theme: 'dark', software: false });
  await desktop({ theme: 'light', software: true });
  await mobile({ width: 390 });
  await mobile({ width: 390, theme: 'dark' });
  await mobile({ width: 390, software: true });
  await mobile({ width: 320 });
  // Tablet needs the same controls and no page overflow, without phone emulation.
  const tablet = await contextFor({ width: 768 });
  try {
    await fit(tablet.page, 'tablet-768');
    await select(tablet.page, 'top');
    await shot(tablet.page, 'default-768-top');
    assert.deepEqual(tablet.errors, []);
    reports.push({ scenario: 'tablet-768', passed: true });
  } finally { await tablet.context.close(); }
  await poster(1440);
  await poster(390);
  await writeFile(path.join(output, 'gamma-results.json'), JSON.stringify({ url: home, reports, idleChecks, passed: true }, null, 2));
  console.log('GAMMA_BROWSER_PASS: mouse/touch/keyboard orbit, presets/reset, still pixels and idle draw counts, native vertical scrolling, software fallback, context loss, client navigation, no-JS poster, scale 1 screenshots and responsive overflow.');
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    await currentPage.screenshot({ path: path.join(output, 'gamma-failure.png'), animations: 'disabled', scale: 'css' }).catch(() => {});
  }
  await writeFile(path.join(output, 'gamma-results.json'), JSON.stringify({ url: home, reports, idleChecks, error: String(error.stack || error) }, null, 2));
  throw error;
} finally {
  await browser?.close();
  await server.close();
}
