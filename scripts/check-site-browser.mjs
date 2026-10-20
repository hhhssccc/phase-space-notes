import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { startPreview, detectBuildBase } from './lib/preview-server.mjs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const directory = process.env.RENDER_OUTPUT_DIR || 'dist';
const server = process.env.SITE_BROWSER_URL
  ? { url: process.env.SITE_BROWSER_URL.replace(/\/?$/, '/'), close: async () => {} }
  : await startPreview(directory, process.env.BASE_PATH || await detectBuildBase(directory));
const output = path.resolve(process.env.QA_DIR || '.qa');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: process.env.BROWSER_HEADED !== '1', args: ['--mute-audio'],
  ...(process.env.EDGE_EXECUTABLE ? { executablePath: process.env.EDGE_EXECUTABLE } : { channel: 'msedge' }) });
const reports = [];
const article = 'articles/jones-polynomial-braids-and-link-invariants/';
async function ready(page) { await page.evaluate(() => document.fonts.ready); await page.waitForFunction(() => document.querySelector('[data-study-open]')); }
async function noOverflow(page, name) { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: page overflow`); }
async function shot(page, name) { await page.screenshot({path:path.join(output,`${name}.png`),animations:'disabled'}); }
try {
  const widths = process.env.BROWSER_WIDTHS ? process.env.BROWSER_WIDTHS.split(',').map(Number) : [1440,390,320];
  for (const width of widths) for (const theme of ['light','dark']) {
    const context = await browser.newContext({ viewport:{width,height:900}, colorScheme:theme, hasTouch:width<768 });
    await context.addInitScript(() => {
      window.__copied = '';
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(window.__clipboardFail)throw Error('Clipboard unavailable');window.__copied=text;}}});
      const play=HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play=function(...args){window.__testAudio=this;return play.apply(this,args);};
      window.__documentIdentity = Math.random();
    });
    const page=await context.newPage(); const errors=[]; const media=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    page.on('request',request=>{if(request.url().includes('/audio/'))media.push(request.url());});
    const suffix=`${width}-${theme}`;
    for(const [name,route] of [['home',''],['search','search/'],['article',article],['paths','paths/'],['lab','notes/quantum-gas/']]) {
      await page.goto(server.url+route);await ready(page);await noOverflow(page,name);
      assert.equal(await page.locator('h1').count(),1);
      await shot(page,`${name}-${suffix}`);
      if(name==='search') {
        assert.equal(await page.locator('label[for="site-search"]').evaluate(el=>getComputedStyle(el).position),'absolute');
        await page.locator('#site-search').fill('Markov');
        assert.match(await page.locator('[data-search-results]').innerText(),/Jones/);
      }
    }
    assert.equal(media.length,0,'audio must not load before play');
    assert.equal(await page.locator('[data-physics-lab]').count(),0,'legacy note-end lab removed');
    await page.goto(server.url+article);await ready(page);
    const equation=page.locator('[data-equation]').first();
    const trigger=page.locator('[data-formula-toggle]').first();
    await equation.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
    assert.equal(await trigger.evaluate(el=>getComputedStyle(el).opacity),'0');
    const bounds=await equation.boundingBox();
    const tex=await equation.locator('annotation[encoding="application/x-tex"]').textContent();
    if(width<768) await equation.tap();
    else await equation.click();
    await page.locator('[data-formula-menu]:visible').waitFor();
    assert.ok(Math.abs(await equation.evaluate(el=>el.getBoundingClientRect().height)-bounds.height)<0.01,'menu must not change formula height (subpixel rounding tolerance)');
    await noOverflow(page,'formula-menu');await shot(page,`formula-menu-${suffix}`);
    await page.locator('[data-formula-copy="tex"]').click();
    await page.waitForFunction(text=>window.__copied===text,tex);
    await page.locator('[data-formula-copy="note"]').click();
    assert.ok((await page.evaluate(()=>window.__copied)).startsWith(`$$\n${tex}\n$$\n\n来源：[`));
    assert.ok((await page.evaluate(()=>window.__copied)).includes('https://hhhssccc.github.io/phase-space-notes/'),'preview copies the canonical source URL');
    await page.locator('[data-formula-copy="link"]').click();
    await page.waitForFunction(()=>window.__copied.includes('#eq-'));
    assert.ok((await page.evaluate(()=>window.__copied)).endsWith('#'+await equation.getAttribute('id')));
    await page.keyboard.press('Escape');assert.equal(await page.locator('[data-formula-menu]').isVisible(),false);
    assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
    await trigger.press('Enter');await page.locator('[data-formula-menu]:visible').waitFor();
    await page.evaluate(()=>{window.__clipboardFail=true;});
    await page.locator('[data-formula-copy="tex"]').click();await page.locator('[data-copy-dialog][open]').waitFor();
    assert.equal(await page.locator('[data-copy-dialog] textarea').inputValue(),tex);
    await page.locator('[data-copy-close]').click();await page.evaluate(()=>{window.__clipboardFail=false;});
    await page.waitForFunction(()=>document.activeElement?.matches('[data-formula-copy="tex"]'));
    await page.keyboard.press('Escape');
    if(width<768) {
      await equation.dispatchEvent('pointerdown',{isPrimary:true,pointerId:7,pointerType:'touch',clientX:100,clientY:100});
      await equation.dispatchEvent('pointermove',{isPrimary:true,pointerId:7,pointerType:'touch',clientX:140,clientY:100});
      await equation.dispatchEvent('pointerup',{isPrimary:true,pointerId:7,pointerType:'touch',clientX:140,clientY:100});
      await equation.dispatchEvent('click');
      assert.equal(await page.locator('[data-formula-menu]').isVisible(),false,'swipes must not open tools');
      await equation.dispatchEvent('pointerdown',{isPrimary:true,pointerId:8,pointerType:'touch',clientX:100,clientY:100});
      await page.waitForTimeout(500);
      await equation.dispatchEvent('pointerup',{isPrimary:true,pointerId:8,pointerType:'touch',clientX:100,clientY:100});
      await equation.dispatchEvent('click');
      assert.equal(await page.locator('[data-formula-menu]').isVisible(),false,'long presses must not open tools');
      await equation.dispatchEvent('pointerdown',{isPrimary:true,pointerId:9,pointerType:'touch',button:0,clientX:100,clientY:100});
      await equation.dispatchEvent('pointercancel',{isPrimary:true,pointerId:9,pointerType:'touch'});
      await equation.dispatchEvent('pointerup',{isPrimary:true,pointerId:9,pointerType:'touch',clientX:100,clientY:100});
      await equation.dispatchEvent('click');
      assert.equal(await page.locator('[data-formula-menu]').isVisible(),false,'cancelled and multi-touch gestures must not open tools');
    }
    // Search, actual source previews, sequential keyboard navigation and scoped shortcuts.
    await page.locator('[data-formula-index-open]').click();
    await page.locator('[data-formula-index][open]').waitFor();
    if(width<768) {
      const sheet=await page.locator('[data-formula-index]').boundingBox();
      // The site's stable scrollbar gutter reserves 15px in desktop Edge's touch emulation.
      const screen=await page.evaluate(()=>document.body.getBoundingClientRect().width);
      const sheetStyle=await page.locator('[data-formula-index]').evaluate(el=>({width:getComputedStyle(el).width,maxWidth:getComputedStyle(el).maxWidth,position:getComputedStyle(el).position,margin:getComputedStyle(el).margin}));
      assert.ok(sheet.width>=screen-2,`mobile search sheet fills the viewport: ${JSON.stringify({sheet,screen,sheetStyle})}`);
    }
    await noOverflow(page,'formula-index');await shot(page,`formula-index-${suffix}`);
    const search=page.locator('[data-formula-search]');
    await search.fill('___no_formula_matches___');
    assert.equal(await page.locator('[data-formula-result]').count(),0);
    await search.fill(tex);
    assert.ok(await page.locator('[data-formula-result]').count()>0);
    await search.press('Enter');
    await page.locator('[data-formula-menu]:visible').waitFor();
    assert.equal(await page.locator('[data-formula-index]').isVisible(),false);
    await primaryKey('ArrowDown');
    const second=page.locator('[data-equation]').nth(1);
    const secondTex=await second.locator('annotation[encoding="application/x-tex"]').textContent();
    await primaryKey('c');await page.waitForFunction(text=>window.__copied===text,secondTex);
    await primaryKey('m');assert.ok((await page.evaluate(()=>window.__copied)).includes(secondTex));
    await primaryKey('ArrowUp');
    const visibleEquation=await equation.boundingBox();
    const panelBounds=await page.locator('[data-formula-menu]').boundingBox();
    assert.ok(visibleEquation.y >= 0 && visibleEquation.y + visibleEquation.height < panelBounds.y,'selected formula remains above the workbench');
    await primaryKey('ArrowDown');
    await page.locator('[data-formula-source] summary').click();
    assert.equal(await page.locator('[data-formula-code]').textContent(),secondTex);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-formula-menu]').isVisible(),false);
    // Opening the inspector does not change formula geometry or invalidate stable links.
    assert.equal(await page.locator('[data-equation-block][data-tools-open]').count(),0);
    if(width===1440) {
      await equation.scrollIntoViewIfNeeded();await equation.dblclick();await page.waitForTimeout(300);
      assert.equal(await page.locator('[data-formula-menu]').isVisible(),false,'double-click remains native text selection');
      await page.evaluate(()=>getSelection()?.removeAllRanges());
    }
    async function primaryKey(key) { await page.locator('[data-formula-copy="tex"]').press(key); }
    await page.locator('[data-add-bookmark]').first().click();
    await page.locator('[data-study-open]').click();await page.locator('[data-study-drawer][data-open]').waitFor();
    assert.ok(await page.locator('[data-reading-bookmarks] a').count()>0);
    await page.locator('[data-study-wallpaper="grid"]').click();
    assert.equal(await page.locator('body').getAttribute('data-wallpaper'),'grid');
    await page.locator('[data-study-theme="dark"]').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.locator('[data-study-theme="system"]').click();
    await shot(page,`study-${suffix}`);
    await page.locator('[data-music-volume]').fill('0');await page.locator('[data-music-volume]').dispatchEvent('input');
    await page.locator('[data-music-toggle]').click();
    await page.waitForFunction(()=>document.querySelector('[data-music-player]')?.dataset.state==='playing',null,{timeout:20000});
    const identity=await page.evaluate(()=>window.__documentIdentity);
    await page.evaluate(()=>{window.__persistedPlayer=document.querySelector('[data-music-player]');});
    await page.keyboard.press('Escape');
    await page.locator('.site-name').click();await page.waitForURL(server.url);await ready(page);
    assert.equal(await page.locator('[data-formula-menu]').count(),0,'article tools cleaned up during navigation');
    assert.equal(await page.evaluate(()=>window.__documentIdentity),identity,'navigation must preserve document');
    assert.equal(await page.evaluate(()=>window.__persistedPlayer===document.querySelector('[data-music-player]')),true);
    assert.equal(await page.evaluate(()=>window.__testAudio.paused),false,'music must continue across navigation');
    assert.equal(await page.locator('body').getAttribute('data-wallpaper'),'grid');
    if (width < 768) await page.locator('.mobile-menu summary').click();
    await page.locator('a[href$="/search/"]:visible').first().click();await page.waitForURL('**/search/');
    await page.locator('#site-search').fill('Grover');assert.match(await page.locator('[data-search-results]').innerText(),/Grover/);
    await page.locator('[data-search-results] a').first().click();await page.waitForURL('**/articles/grover-algorithm-original-motivation/**');
    assert.equal(await page.locator('[data-formula-menu]').count(),1,'one workbench after client navigation');
    await page.locator('[data-equation]').first().scrollIntoViewIfNeeded();
    if(width<768) await page.locator('[data-equation]').first().tap(); else await page.locator('[data-equation]').first().click();
    await page.locator('[data-formula-menu]:visible').waitFor();await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-physics-lab]').count(),0,'legacy article-end lab removed');
    await page.locator('[data-study-open]').click();await page.locator('[data-music-toggle]').click();
    await page.waitForFunction(()=>window.__testAudio.paused);
    await page.locator('[data-study-wallpaper="plain"]').click();await page.keyboard.press('Escape');
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('[data-study-open]').isVisible(),false);
    assert.equal(await page.locator('[data-formula-menu]').isVisible(),false);
    assert.equal(await page.locator('[data-formula-index]').isVisible(),false);
    assert.ok(await page.locator('.katex-display').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).transform==='none')));
    await shot(page,`print-${suffix}`);
    assert.deepEqual(errors,[],`${suffix} browser errors`);
    reports.push({width,theme,passed:true});await context.close();
  }
  // Storage failure is an independent environment, not a mutation of user data.
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});
  const page=await blocked.newPage();await page.goto(server.url+article);await ready(page);
  await page.locator('[data-add-bookmark]').first().click();await page.locator('[data-study-open]').click();
  assert.equal(await page.locator('[data-reading-bookmarks] a').count(),1);
  assert.match(await page.locator('[data-reading-storage-note]').innerText(),/本次浏览/);await blocked.close();
  await writeFile(path.join(output,'results.json'),JSON.stringify(reports,null,2));
  console.log('SITE_BROWSER_PASS: desktop/mobile, light/dark, formula menu/clipboard fallback/swipe, shelf, storage fallback, legacy labs absent, print, search after navigation, continuous music, themes and wallpaper.');
} finally {await browser.close();await server.close();}
