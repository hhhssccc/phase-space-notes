export type Mode = 'list' | 'one' | 'shuffle' | 'order';
export const modes: Mode[] = ['list', 'one', 'shuffle', 'order'];
/** Playback order only: no audio, storage, timers or DOM dependencies. */
export function createPlaylistState(indices: number[], random = Math.random) {
  if (!indices.length) throw new Error('A playlist needs at least one playable track');
  let index = indices[0]; let mode: Mode = 'list'; let bag: number[] = [];
  const history: number[] = [];
  return {
    get index() { return index; }, get mode() { return mode; },
    setMode(value: string) { mode = modes.includes(value as Mode) ? value as Mode : 'list'; bag = []; },
    resetShuffle() { bag = []; },
    select(next: number, record = true) {
      if (!indices.includes(next)) return false;
      if (record && next !== index) history.push(index);
      if (history.length > 100) history.shift();
      index = next; return true;
    },
    next(automatic = false): number | null {
      if (automatic && mode === 'one') return index;
      if (mode === 'shuffle') {
        if (!bag.length) bag = indices.filter(i => i !== index);
        return bag.length ? bag.splice(Math.floor(random() * bag.length), 1)[0] : index;
      }
      const position = indices.indexOf(index);
      if (automatic && mode === 'order' && position === indices.length - 1) return null;
      return indices[(position + 1) % indices.length];
    },
    previous() { bag = []; return history.pop() ?? indices[(indices.indexOf(index) - 1 + indices.length) % indices.length]; },
  };
}
