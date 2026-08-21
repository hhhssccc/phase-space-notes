export type SynthVoice = 'felt' | 'glass' | 'pad' | 'bass';

export interface ScoreNote {
  /** Zero-based sequencer step within the loop. */
  step: number;
  /** MIDI note number, converted to hertz by the player engine. */
  midi: number;
  /** Note length measured in sequencer steps. */
  length: number;
  /** Quiet normalized level for this note before the master volume. */
  velocity: number;
  voice: SynthVoice;
}

export interface GeneratedTrackSource {
  kind: 'generated';
  bpm: number;
  stepBeats: number;
  loopSteps: number;
  score: readonly ScoreNote[];
}

/**
 * Boundary for a rights-cleared file stored in this site's own public
 * directory. The generated default never renders or requests this source.
 */
export interface SelfHostedTrackSource {
  kind: 'self-hosted';
  /** Site-root-relative path to a rights-cleared file in public/. */
  src: `/${string}`;
  mimeType: `audio/${string}`;
  loop?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  kicker: string;
  subtitle: string;
  description: string;
  sourceNote: string;
  /** Original publication page for provenance; never use a temporary media URL. */
  sourceUrl?: `https://${string}`;
  sourceLabel?: string;
  source: GeneratedTrackSource | SelfHostedTrackSource;
}

export interface MusicConfig {
  defaultVolume: number;
  volumeStorageKey: string;
  /** Maximum time an explicit play request may remain pending. */
  startupTimeoutMs: number;
  scheduler: {
    intervalMs: number;
    lookAheadSeconds: number;
    startDelaySeconds: number;
  };
  tracks: readonly MusicTrack[];
}

export const musicConfig: MusicConfig = {
  defaultVolume: 28,
  volumeStorageKey: 'asymptotic-freedom-music-volume',
  startupTimeoutMs: 10_000,
  scheduler: {
    intervalMs: 25,
    lookAheadSeconds: 0.12,
    startDelaySeconds: 0.06,
  },
  tracks: [
    {
      id: 'summer-study-01',
      title: '夏日书房 · 01',
      kicker: 'SELECTED STUDY TRACK',
      subtitle: 'SUMMER STUDY SESSION',
      description: '轻盈的夏日器乐片段，适合作为阅读与推导时的背景声。',
      sourceNote: '固定曲目 · 约 2 分 49 秒 · 点击后才加载站内音频',
      sourceUrl: 'https://www.bilibili.com/video/BV1CKMk6mEb9/',
      sourceLabel: '原始发布页',
      source: {
        kind: 'self-hosted',
        src: '/audio/study-room-current.m4a?v=20260822-bv1ckmk6meb9',
        mimeType: 'audio/mp4',
        loop: true,
      },
    },
  ],
};
