export class StartupTimeoutError extends Error { }

export const withStartupDeadline = <T,>(task: Promise<T>, signal: AbortSignal, startupTimeoutMs: number) => new Promise<T>((resolve, reject) => {
  let settled = false;
  const timeoutId = window.setTimeout(() => {
    if (settled) return;
    settled = true;
    cleanup();
    reject(new StartupTimeoutError('Playback did not start before the deadline.'));
  }, startupTimeoutMs);
  const handleAbort = () => {
    if (settled) return;
    settled = true;
    cleanup();
    reject(new Error('Playback start was cancelled.'));
  };
  const cleanup = () => {
    window.clearTimeout(timeoutId);
    signal.removeEventListener('abort', handleAbort);
  };

  signal.addEventListener('abort', handleAbort, { once: true });
  task.then(
    (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    },
    (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    },
  );
});

export const waitForMediaPlaying = (audio: HTMLAudioElement, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  let settled = false;
  const cleanup = () => {
    audio.removeEventListener('playing', handlePlaying);
    audio.removeEventListener('error', handleError);
    signal.removeEventListener('abort', handleAbort);
  };
  const finish = (callback: () => void) => {
    if (settled) return;
    settled = true;
    cleanup();
    callback();
  };
  const handlePlaying = () => finish(resolve);
  const handleError = () => finish(() => reject(new Error('The configured audio source failed.')));
  const handleAbort = () => finish(() => reject(new Error('Playback start was cancelled.')));

  audio.addEventListener('playing', handlePlaying);
  audio.addEventListener('error', handleError);
  signal.addEventListener('abort', handleAbort, { once: true });
  if (!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) handlePlaying();
});
