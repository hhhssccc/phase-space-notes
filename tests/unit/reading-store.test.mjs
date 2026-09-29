import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReadingStore, parseShelf, linkFor } from '../../src/features/reading/store.ts';
const position = {path:'/base/articles/a/',title:'A',section:'section-1',label:'第一节',offset:.25,updated:1};
test('reading store preserves existing links and deduplicates bookmarks', () => {
  let saved; const store=createReadingStore({getItem:()=>null,setItem:(_,v)=>saved=v},'/base/');
  store.remember(position);store.remember({...position,offset:.5});
  assert.equal(store.shelf.history.length,1);assert.equal(store.shelf.history[0].offset,.5);
  assert.equal(store.bookmark(position),true);assert.equal(store.bookmark({...position,offset:.251}),false);
  assert.equal(linkFor(position),'/base/articles/a/?read=0.2500#section-1');
  assert.equal(parseShelf(saved,'/base/').bookmarks.length,1);
  store.clearHistory();assert.equal(store.shelf.history.length,0);assert.equal(store.shelf.bookmarks.length,1);
  store.remove('bookmarks',0);assert.equal(store.shelf.bookmarks.length,0);
});
test('blocked storage and malformed cross-tab data safely degrade', () => {
  const store=createReadingStore({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}},'/base/');
  store.bookmark(position);assert.equal(store.available,false);assert.equal(store.shelf.bookmarks.length,1);
  for (const raw of ['null','broken','{"history":{}}','{"bookmarks":[null]}']) assert.deepEqual(parseShelf(raw,'/base/'),{history:[],bookmarks:[]});
  assert.equal(parseShelf(JSON.stringify({history:[{...position,path:'https://evil.test/'}]}),'/base/').history.length,0);
  store.reload(null);assert.equal(store.shelf.bookmarks.length,0);
});
