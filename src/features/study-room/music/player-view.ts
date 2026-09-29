export type PlayerState = 'idle' | 'starting' | 'waiting' | 'playing' | 'paused' | 'error';
export function createPlayerView(player: HTMLElement, getTitle: () => string) {
  const toggle = player.querySelector<HTMLButtonElement>('[data-music-toggle]');
  const controlLabel = player.querySelector<HTMLElement>('[data-control-label]');
  const status = player.querySelector<HTMLElement>('[data-music-status]');
  const errorMessage = player.querySelector<HTMLElement>('[data-music-error]');
  const setState = (state: PlayerState, message: string) => {
    if (!player || !toggle || !controlLabel || !status || !errorMessage) return;
    player.dataset.state = state;
    const playing = state === 'playing';
    const pending = state === 'starting' || state === 'waiting';
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', `${pending ? '取消启动' : playing ? '暂停' : '播放'}${getTitle()}`);
    controlLabel.textContent = pending ? '取消' : playing ? '暂停' : '播放';
    status.textContent = message;
    if (state !== 'error') {
      errorMessage.hidden = true;
      errorMessage.textContent = '';
    }
    window.dispatchEvent(new CustomEvent('study-music-state', { detail: { playing } }));
  };

  const showError = (message: string) => {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    setState('error', '声音没有启动。');
  };

  return { setState, showError };
}
