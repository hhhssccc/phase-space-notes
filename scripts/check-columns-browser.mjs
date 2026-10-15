import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {startPreview, detectBuildBase} from './lib/preview-server.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output=process.env.RENDER_OUTPUT_DIR || 'dist';
const server=await startPreview(output,process.env.BASE_PATH || await detectBuildBase(output));
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
await mkdir('.qa/columns',{recursive:true});
const reports=[];
async function fit(page,name){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' overflow');}
async function loadedImages(page){
 for(const img of await page.locator('.entry-preview, .lab-thumbnail img').all()){
  await img.scrollIntoViewIfNeeded();
  await img.evaluate(el=>el.decode());
  assert.ok(await img.evaluate(el=>el.naturalWidth>0));
 }
}
try{
 for(const width of [1440,390,320])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:960},colorScheme:theme,hasTouch:width<500});
  const page=await context.newPage();const errors=[];const remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(server.url)&&!r.url().startsWith('data:'))remote.push(r.url());});
  let total=0;
  for(const route of ['', 'articles/', 'notes/', 'archive/', 'tags/Grover/', 'reflections/', 'lab/']){
   await page.goto(server.url+route);await page.evaluate(()=>document.fonts.ready);await fit(page,route);
   assert.equal(await page.locator('h1').count(),1);
   await loadedImages(page);
   if(['articles/','notes/'].includes(route)){
    const count=await page.locator('.entry-list > li').count();total+=count;
    assert.equal(await page.locator('.entry-list .entry-preview').count(),count,'every essay and note has preview');
    assert.ok((await page.locator('.entry-preview').first().getAttribute('src')).includes('/previews/'));
    await page.locator('.entry-preview').first().scrollIntoViewIfNeeded();
    const box=await page.locator('.entry-preview').first().boundingBox();
    await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForURL(/\/(articles|notes)\/[^/]+\/$/);
    assert.equal(await page.locator('.article-prose .entry-preview').count(),0,'no duplicate previews in body');
    assert.equal(await page.locator('.lead-figure').count(),1,'original cover retained');
    await page.goto(server.url+route);
   }
   if(width!==320){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`.qa/columns/${route.replaceAll('/','-')||'home'}-${width}-${theme}.png`,fullPage:true});}
  }
  assert.equal(total,10);
  assert.equal(await page.locator('.lab-list > li').count(),2);
  assert.equal(await page.locator('.lab-thumbnail img').count(),2);
  // Repeat navigation to verify Astro's page lifecycle initializes each new iframe.
  for(const id of ['grover-subtraction','grover-counting'])for(let visit=0;visit<2;visit++){
   await page.locator(`.lab-list a[href$="/${id}/"]`).click();await page.waitForURL(`**/lab/${id}/`);
   await page.locator('[data-viz-frame][data-ready="true"]').waitFor();
   const frame=page.frames().find(f=>f.url().includes('/lab/embed/'));
   await frame.waitForFunction(expected=>getComputedStyle(document.documentElement).colorScheme===expected,theme);
   assert.equal(await page.locator('[data-viz-start], [data-viz-reset], a[download], [data-viz-preview], .visualization-cue').count(),0);
   assert.equal(await page.locator('.article-prose > h2').count(),0);
   assert.equal(await page.locator('.visualization-print').isVisible(),false);
   assert.equal(await page.locator('[data-viz-frame]').getAttribute('sandbox'),'allow-scripts');
   assert.equal(await frame.evaluate(()=>{try{return Boolean(parent.document)}catch{return false}}),false);
   assert.equal(await page.locator('[data-viz-source] a').getAttribute('href'),'https://doi.org/10.1103/PhysRevX.14.041029');
   assert.match(await page.locator('[data-viz-source]').innerText(),/Stoudenmire.*Waintal/);
   if(id==='grover-subtraction'){
    await frame.locator('[data-solution]').selectOption('2,5,7');
    assert.match(await frame.locator('[data-stage="3"]').getAttribute('aria-label'),/-0.577/);
    assert.match(await frame.locator('[data-foot]').last().innerText(),/33.3%/);
   }else{
    assert.match(await page.locator('[data-viz-source]').innerText(),/VI A.*图 9/);
    for(const example of ['single','multiple']){
     await frame.locator('#gc-example').selectOption(example);
     const solutions=example==='single'?[5]:[2,5,7];
     let prefix='';
     for(let step=0;step<=3;step++){
      await frame.locator('#gc-step').fill(String(step));
      await frame.locator('#gc-step').dispatchEvent('input');
      assert.match(await frame.locator('#gc-cost-count').innerText(),new RegExp(`已计算 ${step+1} 个精确振幅`));
      const trial=step ? prefix+'0' : '';
      // Independent closed-oracle calculation on an explicit 16-component state:
      // project the bit-flip oracle output onto |prefix,+...+> tensor |1>.
      const candidates=Array.from({length:8},(_,x)=>x).filter(x=>x.toString(2).padStart(3,'0').startsWith(trial));
      const input=Array(16).fill(0), output=Array(16).fill(0);
      for(const x of candidates)input[2*x]=1/Math.sqrt(candidates.length);
      for(let x=0;x<8;x++)for(let ancilla=0;ancilla<2;ancilla++)output[2*x+(ancilla^(solutions.includes(x)?1:0))]=input[2*x+ancilla];
      const expected=candidates.reduce((sum,x)=>sum+output[2*x+1]/Math.sqrt(candidates.length),0);
      const label=await frame.locator('#gc-values').innerText();
      const fraction=label.match(/振幅 A₀?=([0-9/]+)/)[1].split('/').map(Number);
      assert.ok(Math.abs(fraction[0]/(fraction[1]||1)-expected)<1e-12,label);
      if(step){prefix+=expected>0?'0':'1';assert.ok((await frame.locator('#gc-decision').innerText()).includes('保留 '+prefix));}
     }
     assert.equal(prefix,example==='single'?'101':'010');
    }
   }
   await fit(page,'detail');await fit(frame,'diagram');
   const other=theme==='dark'?'light':'dark';
   await page.evaluate(value=>document.documentElement.dataset.theme=value,other);
   await frame.waitForFunction(value=>getComputedStyle(document.documentElement).colorScheme===value,other);
   await page.evaluate(value=>document.documentElement.dataset.theme=value,theme);
   await frame.waitForFunction(value=>getComputedStyle(document.documentElement).colorScheme===value,theme);
   if(visit===0 && width!==320){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`.qa/columns/${id}-${width}-${theme}.png`,fullPage:true});}
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('[data-viz-frame]').isVisible(),false);
   assert.equal(await page.locator('.visualization-print').isVisible(),true);
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
 for(const id of ['grover-mps','grover-noise']){
  assert.equal((await fetch(server.url+`lab/${id}/`)).status,404);
  assert.equal((await fetch(server.url+`lab/embed/${id}.html`)).status,404);
  assert.ok(!(await readFile(output+'/search/index.html','utf8')).includes(id));
 }
 await writeFile('.qa/columns/results.json',JSON.stringify(reports,null,2));
 console.log('COLUMNS_BROWSER_PASS: all 10 previews, QiGA/QiGA-2 with independent amplitude checks and paper citations, theme, isolation, navigation reentry, print, legacy labs absent, removed entries absent; 1440/390/320 light/dark.');
}finally{await browser.close();await server.close();}
