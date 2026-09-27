import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise playlist transitions without playing audio or relying on wall-clock waits.
const code = ts.transpileModule(readFileSync(new URL('../src/components/study-room/music-playlist.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
class Element {
  listeners = new Map(); attributes = {}; dataset = {}; value = ''; textContent = '';
  addEventListener(event, callback) {
    this.listeners.set(event, [...(this.listeners.get(event) || []), callback]);
  }
  emit(event) { for (const callback of this.listeners.get(event) || []) callback(); }
  setAttribute(key, value) { this.attributes[key] = value; }
}
function fixture(saved = null, count = 3) {
  const tracks = Array.from({ length: count }, (_, i) => ({ id: `t${i}`, title: `Track ${i}`, source: { kind: 'self-hosted', src: `/t${i}.m4a` } }));
  const elements = new Map();
  const get = key => { if (!elements.has(key)) elements.set(key, new Element()); return elements.get(key); };
  const buttons = tracks.map((_, i) => { const button = new Element(); button.dataset.selectTrack = String(i); return button; });
  const root = new Element(); root.querySelector = get; root.querySelectorAll = () => buttons;
  const audio = new Element(); Object.assign(audio, { currentTime: 0, duration: 120, muted: false, paused: true, ended: false, playbackRate: 1 });
  let raw = JSON.stringify(saved); let plays = 0; let pauses = 0; let now = 1000; let timer;
  const exports = {};
  vm.runInNewContext(code, {
    exports, require: path => path.includes('config/music') ? { musicConfig: { tracks } } : { withBase: value => '/base' + value },
    localStorage: { getItem: () => raw, setItem: (_, value) => { raw = value; } },
    navigator: {}, document: new Element(),
    window: { setInterval: callback => { timer = callback; return 1; }, clearInterval: () => { timer = null; } },
    Date: { now: () => now },
  });
  const player = exports.setupPlaylist(root, audio, {
    play: () => { plays++; audio.paused = false; }, pause: () => { pauses++; audio.paused = true; }, title: () => {},
  });
  return {
    player, audio, root, get, buttons, plays: () => plays, pauses: () => pauses, saved: () => JSON.parse(raw),
    mode: value => { get('[data-play-mode]').value = value; get('[data-play-mode]').emit('change'); },
    sleep: value => { get('[data-sleep]').value = value; get('[data-sleep]').emit('change'); },
    advance: ms => { now += ms; timer?.(); },
  };
}
{
  const f = fixture();
  assert.equal(f.plays(), 0, 'initialization must never autoplay');
  f.player.ended(); assert.equal(f.root.dataset.trackTitle, 'Track 1');
  f.player.ended(); f.player.ended(); assert.equal(f.root.dataset.trackTitle, 'Track 0', 'list wraps');
  f.mode('one'); f.player.ended(); assert.equal(f.root.dataset.trackTitle, 'Track 0');
  f.get('[data-next]').emit('click'); assert.equal(f.root.dataset.trackTitle, 'Track 1', 'manual next escapes repeat-one');
  f.mode('order'); f.player.ended(); const plays = f.plays();
  f.player.ended(); assert.equal(f.plays(), plays, 'ordered playback stops after final song');
}
{
  const f = fixture(); f.mode('shuffle');
  const seen = new Set(['Track 0']);
  for (let i = 0; i < 2; i++) { f.player.ended(); seen.add(f.root.dataset.trackTitle); }
  assert.equal(seen.size, 3, 'shuffle visits every track before recycling');
  const previous = f.root.dataset.trackTitle; f.player.ended();
  assert.notEqual(f.root.dataset.trackTitle, previous, 'shuffle cycle boundary cannot repeat immediately');
  f.get('[data-previous]').emit('click'); assert.equal(f.root.dataset.trackTitle, previous, 'previous follows actual history');
  const single = fixture(null, 1); single.mode('shuffle'); single.player.ended(); assert.equal(single.plays(), 1);
}
{
  const f = fixture({ id: 't1', position: 80, mode: 'one', muted: true });
  assert.equal(f.audio.src, '/base/t1.m4a'); assert.equal(f.plays(), 0);
  f.audio.emit('loadedmetadata'); assert.equal(f.audio.currentTime, 80);
  f.get('[data-seek]').value = '999'; f.get('[data-seek]').emit('input'); assert.equal(f.audio.currentTime, 120);
  f.audio.currentTime = 60; f.get('[data-previous]').emit('click'); assert.equal(f.audio.currentTime, 0, 'previous restarts after 3 seconds');
  f.sleep('end'); const plays = f.plays(); f.player.ended(); assert.equal(f.plays(), plays, 'sleep overrides repeat-one');
  f.sleep('15'); f.advance(900_001); assert.equal(f.audio.paused, true); assert.equal(f.get('[data-sleep]').value, '0');
  f.get('[data-mute]').emit('click'); assert.equal(f.audio.muted, false); assert.equal(f.saved().muted, false);
}
{
  const f = fixture({ id: 'removed-track', position: 90, mode: 'broken' });
  f.audio.emit('loadedmetadata'); assert.equal(f.audio.currentTime, 0); assert.equal(f.root.dataset.trackTitle, 'Track 0');
}
console.log('MUSIC_PLAYLIST_PASS: playback modes, shuffle history, seek, resume, mute, timer, invalid storage, base URL, no autoplay');
