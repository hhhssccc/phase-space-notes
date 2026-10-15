import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {startPreview, detectBuildBase} from './lib/preview-server.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output=process.env.RENDER_OUTPUT_DIR || 'dist';
const server=await startPreview(output,process.env.BASE_PATH || await detectBuildBase(output));
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
await mkdir('.qa/columns',{recursive:true});
const ids=['grover-subtraction','grover-mps','grover-counting','grover-noise'];
const reports=[];
async function ready(page){await page.evaluate(()=>document.fonts.ready);}
async function fit(page,name){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' overflow');}
async function frameFor(page){
 await page.locator('[data-viz-reset]').waitFor();
 await page.waitForFunction(()=>document.querySelector('[data-viz-status]').textContent==='');
 return page.frames().find(f=>f.url().includes('/lab/embed/'));
}
async function adjust(frame,selector,value){await frame.locator(selector).fill(value);await frame.locator(selector).dispatchEvent('input');}
try{
 for(const width of [1440,390,320])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:960},colorScheme:theme,hasTouch:width<500});
  const page=await context.newPage();const errors=[];const remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(server.url)&&!r.url().startsWith('data:'))remote.push(r.url());});
  for(const route of ['','reflections/','lab/']){
   await page.goto(server.url+route);await ready(page);await fit(page,route);
   assert.equal(await page.locator('h1').count(),1);
   await page.screenshot({path:`.qa/columns/${route.replace('/','')||'home'}-${width}-${theme}.png`,fullPage:true});
  }
  assert.equal(await page.locator('.lab-list > li').count(),4);
  for(const id of ids){
   await page.locator(`.lab-list a[href$="/${id}/"]`).click();await page.waitForURL(`**/lab/${id}/`);await ready(page);await fit(page,id);
   assert.equal(await page.locator('[data-viz-frame]').getAttribute('src'),null,'no iframe runtime before click');
   assert.equal(await page.locator('[data-viz-frame]').getAttribute('sandbox'),'allow-scripts');
   assert.equal(await page.locator('[data-physics-lab]').count(),0);
   await page.locator('[data-viz-start]').click();
   let frame=await frameFor(page);
   await frame.waitForFunction(expected=>getComputedStyle(document.documentElement).colorScheme===expected,theme);
   await fit(frame,id+' frame');
   assert.equal(await frame.evaluate(()=>{try{return Boolean(parent.document)}catch{return false}}),false,'iframe must not access host DOM');
   if(id==='grover-subtraction'){
    await frame.locator('[data-solution]').selectOption('2,5,7');
    assert.match(await frame.locator('[data-stage="3"]').getAttribute('aria-label'),/-0.577/);
    assert.match(await frame.locator('[data-foot]').last().innerText(),/33.3%/);
   }
   if(id==='grover-mps'){
    await frame.locator('[data-bitstring]').selectOption('000');assert.match(await frame.locator('[data-amplitude]').innerText(),/0.3536/);
    await adjust(frame,'[data-stage]','7');assert.match(await frame.locator('[data-rank-detail]').innerText(),/χ = 2/);
   }
   if(id==='grover-counting'){
    await frame.locator('#gc-example').selectOption('multiple');await adjust(frame,'#gc-step','3');
    assert.match(await frame.locator('#gc-current').innerText(),/010/);
    await adjust(frame,'#gc-step','0');assert.match(await frame.locator('#gc-current').innerText(),/尚未固定/);
   }
   if(id==='grover-noise'){
    const before=await frame.locator('[data-noisy-value]').innerText();
    await adjust(frame,'#grover-noise-n','10');assert.notEqual(await frame.locator('[data-noisy-value]').innerText(),before);
    await frame.locator('#grover-noise-off').check();
    const ideal=(await frame.locator('[data-ideal-value]').innerText()).match(/[\d.]+%/)[0];
    assert.ok((await frame.locator('[data-noisy-value]').innerText()).includes(ideal));
    await frame.locator('[data-series="ideal"]').click();assert.equal(await frame.locator('[data-series="ideal"]').getAttribute('aria-pressed'),'false');
    const chart=frame.locator('[data-chart-hover-overlay]');await chart.click({position:{x:40,y:40}});assert.equal(await frame.locator('[role="tooltip"]').isVisible(),true);
   }
   await fit(page,id+' active');await fit(frame,id+' active frame');
   await page.locator('[data-viz-frame]').scrollIntoViewIfNeeded();
   await page.screenshot({path:`.qa/columns/${id}-${width}-${theme}.png`,fullPage:true});
   const other=theme==='dark'?'light':'dark';
   await page.evaluate(value=>document.documentElement.dataset.theme=value,other);
   await frame.waitForFunction(value=>getComputedStyle(document.documentElement).colorScheme===value,other);
   await page.evaluate(value=>document.documentElement.dataset.theme=value,theme);
   await page.locator('[data-viz-reset]').click();frame=await frameFor(page);
   if(id==='grover-subtraction')await frame.locator('[data-solution]').waitFor({state:'visible'});
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('[data-viz-frame]').isVisible(),false);
   assert.equal(await page.locator('[data-viz-preview]').isVisible(),true);
   assert.equal(await page.locator('.site-header').isVisible(),false);
   await page.emulateMedia({media:'screen'});
   await page.locator('.column-return').click();await page.waitForURL('**/lab/');
  }
  for(const route of ['articles/grover-algorithm-original-motivation/','notes/quantum-gas/']){
   await page.goto(server.url+route);assert.equal(await page.locator('[data-physics-lab], [data-lab-start]').count(),0);
  }
  await page.goto(server.url+'search/');await page.locator('#site-search').fill('显影');assert.match(await page.locator('[data-search-results]').innerText(),/减掉背景/);
  assert.deepEqual(errors,[],width+' '+theme+' runtime errors');assert.deepEqual(remote,[],'no external assets or audio fetched');
  reports.push({width,theme,passed:true});await context.close();
 }
 const page=await browser.newPage({viewport:{width:820,height:900}});await page.goto(server.url);await fit(page,'tablet header');
 await page.goto(server.url+'lab/grover-noise/');
 const downloading=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloading;
 const file=path.resolve('.qa/columns/offline-noise.html');await download.saveAs(file);
 await page.context().setOffline(true);await page.goto(pathToFileURL(file).href);await page.locator('[data-chart-frame]').waitFor();
 await adjust(page,'#grover-noise-n','8');assert.equal(await page.locator('#grover-noise-n-value').innerText(),'8');
 await writeFile('.qa/columns/results.json',JSON.stringify(reports,null,2));
 console.log('COLUMNS_BROWSER_PASS: 1440/390/320 light/dark, four interactions, frame isolation, lazy loading, search, navigation, reset, print, 820 header, offline HTML, legacy labs absent.');
}finally{await browser.close();await server.close();}
