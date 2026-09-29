import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
test('one failed page feature cannot block siblings; every swap aborts and cleans up', async () => {
  const document = new EventTarget(); const errors = []; const exports = {};
  const source = readFileSync(new URL('../../src/lib/browser/lifecycle.ts', import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
    {document,exports,AbortController,console:{error:(...args)=>errors.push(args)}});
  const { registerPageFeature } = exports;
  let mounted=0,cleaned=0; const signals=[];
  registerPageFeature('failure',async()=>{throw Error('lazy dependency failed')});
  registerPageFeature('healthy',signal=>{mounted++;signals.push(signal);return()=>cleaned++;});
  document.dispatchEvent(new Event('astro:page-load'));await new Promise(resolve=>setImmediate(resolve));
  assert.equal(mounted,1);assert.equal(errors.length,1);
  document.dispatchEvent(new Event('astro:before-swap'));assert.equal(cleaned,1);assert.equal(signals[0].aborted,true);
  document.dispatchEvent(new Event('astro:page-load'));await new Promise(resolve=>setImmediate(resolve));
  assert.equal(mounted,2);assert.equal(signals[1].aborted,false);assert.equal(cleaned,1);
  let complete;
  registerPageFeature('slow',()=>new Promise(resolve=>complete=resolve));
  document.dispatchEvent(new Event('astro:page-load'));document.dispatchEvent(new Event('astro:before-swap'));
  let disposed=false;complete(()=>{disposed=true});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(disposed,true,'late asynchronous mounts are cleaned immediately');
});
