import { createPlayerView } from './player-view';
import { StartupTimeoutError, withStartupDeadline, waitForMediaPlaying } from './startup';
import { readVolume, saveVolume } from './storage';
import type { GeneratedMusicEngine } from './generated-engine';
import { setupPlaylist } from './music-playlist';

export function createMusicSession(player: HTMLElement) {
  const lifetime = new AbortController(); const lifetimeSignal = lifetime.signal;
  let trackTitle = player.dataset.trackTitle || '书房音乐';
  const trackKind = player.dataset.trackKind === 'self-hosted' ? 'self-hosted' : 'generated';
  const defaultVolume = Number(player.dataset.defaultVolume || '28');
  const volumeStorageKey = player.dataset.volumeStorageKey || 'asymptotic-freedom-music-volume';
  const startupTimeoutMs = Number(player.dataset.startupTimeout || '10000');
  const toggle = player.querySelector<HTMLButtonElement>('[data-music-toggle]');
  const volume = player.querySelector<HTMLInputElement>('[data-music-volume]');
  const volumeValue = player.querySelector<HTMLOutputElement>('[data-music-volume-value]');
  const selfHostedAudio = player.querySelector<HTMLAudioElement>('[data-music-audio]');
  // Keep the media element outside document swaps. The persisted drawer owns
  // its controls; a detached audio element continues playing during navigation.
  selfHostedAudio?.remove();

  let generatedContext: AudioContext | null = null;
  let generatedEngine: GeneratedMusicEngine | null = null;
  let generatedModulePromise: Promise<typeof import('./generated-engine')> | null = null;
  let currentVolume = defaultVolume;
  let isPlaying = false;
  let isStarting = false;
  let operationVersion = 0;
  let startController: AbortController | null = null;

  const playingStatus = () => currentVolume === 0
    ? '正在播放 · 当前音量为 0%'
    : '正在播放 · 全站连续播放';

  const { setState, showError } = createPlayerView(player, () => trackTitle);

  const loadGeneratedModule = () => {
    if (!generatedModulePromise) {
      generatedModulePromise = import('./generated-engine').catch((error: unknown) => {
        generatedModulePromise = null;
        throw error;
      });
    }
    return generatedModulePromise;
  };

  const cancelPendingStart = (message = '已取消启动；声音保持暂停。') => {
    if (!isStarting) return;
    operationVersion += 1;
    startController?.abort();
    startController = null;
    isStarting = false;
    isPlaying = false;
    selfHostedAudio?.pause();
    if (generatedEngine) void generatedEngine.pause();
    else if (generatedContext?.state === 'running') void generatedContext.suspend().catch(() => undefined);
    if (toggle) toggle.disabled = false;
    setState('paused', message);
  };

  const pausePlayback = async (message = '已暂停；声音与后续调度均已停止。') => {
    if (!toggle) return;
    if (isStarting) {
      cancelPendingStart(message);
      return;
    }

    const operation = ++operationVersion;
    startController?.abort();
    startController = null;
    toggle.disabled = true;
    isPlaying = false;

    try {
      if (trackKind === 'self-hosted') {
        selfHostedAudio?.pause();
        setState('paused', message);
      } else {
        setState('paused', message);
        if (generatedEngine) {
          await generatedEngine.pause();
        } else if (generatedContext?.state === 'running') {
          try {
            await generatedContext.suspend();
          } catch {
            // The page can become inactive while suspend() is settling.
          }
        }
      }
    } finally {
      if (operation === operationVersion) toggle.disabled = false;
    }
  };

  const startPlayback = async () => {
    if (isPlaying || isStarting || !toggle) return;

    const operation = ++operationVersion;
    const controller = new AbortController();
    startController?.abort();
    startController = controller;
    isStarting = true;
    toggle.disabled = false;
    setState('starting', '正在启动本页声音…点击可取消。');

    try {
      if (trackKind === 'self-hosted') {
        if (!selfHostedAudio) throw new Error('The configured self-hosted audio element is unavailable.');
        if (selfHostedAudio.error) selfHostedAudio.load();
        selfHostedAudio.volume = currentVolume / 100;
        const playing = waitForMediaPlaying(selfHostedAudio, controller.signal);
        const requested = selfHostedAudio.play();
        await withStartupDeadline(Promise.all([requested, playing]).then(() => undefined), controller.signal, startupTimeoutMs);
        if (operation !== operationVersion || controller.signal.aborted) return;
        isPlaying = !selfHostedAudio.paused && !selfHostedAudio.ended;
        if (!isPlaying) throw new Error('The audio element did not enter a playing state.');
        isStarting = false;
        setState('playing', playingStatus());
      } else {
        // Creating/resuming the context happens synchronously inside the user
        // click before awaiting the lazy engine chunk. This preserves strict
        // transient-user-activation behavior in Safari and mobile browsers.
        if (!generatedContext || generatedContext.state === 'closed') {
          generatedContext = new AudioContext({ latencyHint: 'playback' });
          generatedEngine = null;
        }
        const audioContext = generatedContext;
        const resumeTask = audioContext.resume();
        const moduleTask = loadGeneratedModule();
        void resumeTask.then(
          () => {
            if (controller.signal.aborted && audioContext.state === 'running') {
              void audioContext.suspend().catch(() => undefined);
            }
          },
          () => undefined,
        );
        const engineModule = await withStartupDeadline(
          Promise.all([resumeTask, moduleTask]).then(([, module]) => module),
          controller.signal, startupTimeoutMs,
        );
        if (operation !== operationVersion || controller.signal.aborted) return;
        if (audioContext.state !== 'running') throw new Error('AudioContext did not enter the running state.');
        if (!generatedEngine) {
          generatedEngine = engineModule.createGeneratedMusicEngine(audioContext, () => {
            if (!isPlaying) return;
            isPlaying = false;
            isStarting = false;
            setState('paused', '浏览器已暂停声音。点击播放可继续。');
          });
        }
        generatedEngine.start(currentVolume);
        isStarting = false;
        isPlaying = true;
        setState('playing', playingStatus());
      }
      if (startController === controller) startController = null;
    } catch (error) {
      const cancelled = operation !== operationVersion || controller.signal.aborted;
      if (!controller.signal.aborted) controller.abort();
      if (startController === controller) startController = null;
      if (cancelled) return;

      isStarting = false;
      isPlaying = false;
      selfHostedAudio?.pause();
      if (generatedEngine) void generatedEngine.pause();
      else if (generatedContext?.state === 'running') void generatedContext.suspend().catch(() => undefined);
      toggle.disabled = false;
      if (error instanceof StartupTimeoutError) {
        showError('声音启动超时。请检查本地音频文件或浏览器声音权限后重试。');
      } else {
        showError(trackKind === 'generated'
          ? '浏览器未能加载或启动本页 Web Audio。请检查网络与站点声音权限后重试。'
          : '本地音频未能加载或播放。请检查文件路径与格式。');
      }
    }
  };

  const playlist = selfHostedAudio ? setupPlaylist(player, selfHostedAudio, {
    play: () => { void startPlayback(); },
    pause: () => { void pausePlayback(); },
    title: (title) => { trackTitle = title; },
  }) : null;

  const teardown = () => {
    playlist?.save();
    playlist?.clearTimer();
    operationVersion += 1;
    startController?.abort();
    startController = null;
    isPlaying = false;
    isStarting = false;
    selfHostedAudio?.pause();
    const engine = generatedEngine;
    const context = generatedContext;
    generatedEngine = null;
    generatedContext = null;
    if (engine) void engine.close();
    else if (context && context.state !== 'closed') void context.close().catch(() => undefined);
    if (toggle) toggle.disabled = false;
    setState('paused', '页面已关闭，声音已停止。');
  };

  currentVolume = readVolume(volumeStorageKey, defaultVolume);
  if (volume) volume.value = String(currentVolume);
  if (volumeValue) volumeValue.value = `${currentVolume}%`;
  if (selfHostedAudio) selfHostedAudio.volume = currentVolume / 100;

  toggle?.addEventListener('click', () => {
    if (isStarting) cancelPendingStart();
    else if (isPlaying || (selfHostedAudio !== null && !selfHostedAudio.paused)) void pausePlayback();
    else void startPlayback();
  }, { signal: lifetimeSignal });

  volume?.addEventListener('input', () => {
    const nextVolume = Number(volume.value);
    if (!Number.isFinite(nextVolume)) return;
    currentVolume = Math.max(0, Math.min(100, nextVolume));
    if (volumeValue) volumeValue.value = `${currentVolume}%`;
    saveVolume(volumeStorageKey, currentVolume);
    if (selfHostedAudio) selfHostedAudio.volume = currentVolume / 100;
    if (generatedEngine && isPlaying) {
      generatedEngine.setVolume(currentVolume);
      setState('playing', playingStatus());
    } else if (selfHostedAudio && isPlaying) {
      setState('playing', playingStatus());
    }
  }, { signal: lifetimeSignal });

  if (selfHostedAudio) {
    selfHostedAudio.addEventListener('playing', () => {
      if (selfHostedAudio.paused || selfHostedAudio.ended) return;
      isStarting = false;
      isPlaying = true;
      if (toggle) toggle.disabled = false;
      setState('playing', playingStatus());
    }, { signal: lifetimeSignal });

    selfHostedAudio.addEventListener('pause', () => {
      if (!selfHostedAudio.paused) return;
      if (startController) {
        operationVersion += 1;
        startController.abort();
        startController = null;
      }
      isStarting = false;
      isPlaying = false;
      if (toggle) toggle.disabled = false;
      if (selfHostedAudio.ended || player.dataset.state === 'error' || player.dataset.state === 'paused') return;
      setState('paused', '播放已暂停。点击播放可继续。');
    }, { signal: lifetimeSignal });

    selfHostedAudio.addEventListener('ended', () => {
      if (selfHostedAudio.loop) return;
      startController?.abort();
      startController = null;
      isStarting = false;
      isPlaying = false;
      if (toggle) toggle.disabled = false;
      setState('paused', '播放已结束。');
      playlist?.ended();
    }, { signal: lifetimeSignal });

    selfHostedAudio.addEventListener('error', () => {
      operationVersion += 1;
      startController?.abort();
      startController = null;
      isStarting = false;
      isPlaying = false;
      if (toggle) toggle.disabled = false;
      showError('本地音频未能加载或播放。请检查文件路径与格式。');
    }, { signal: lifetimeSignal });

    selfHostedAudio.addEventListener('waiting', () => {
      if (selfHostedAudio.paused || selfHostedAudio.ended) return;
      isStarting = true;
      isPlaying = false;
      if (toggle) toggle.disabled = false;
      setState('waiting', '本地音频正在等待数据…点击可取消。');
    }, { signal: lifetimeSignal });

    selfHostedAudio.addEventListener('stalled', () => {
      if (selfHostedAudio.paused || selfHostedAudio.ended) return;
      isStarting = true;
      isPlaying = false;
      if (toggle) toggle.disabled = false;
      setState('waiting', '本地音频加载暂时停滞…点击可取消。');
    }, { signal: lifetimeSignal });
  }

  window.addEventListener('pagehide', teardown, { signal: lifetimeSignal });
  return { pause: pausePlayback, play: startPlayback, dispose: () => { teardown(); lifetime.abort(); playlist?.dispose(); window.removeEventListener('pagehide', teardown); } };
}
