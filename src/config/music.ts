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
      title: '夏日书房',
      kicker: 'SELECTED STUDY TRACK',
      subtitle: 'SUMMER STUDY SESSION',
      description: '轻盈的夏日器乐片段，适合作为阅读与推导时的背景声。',
      sourceNote: '约 2 分 49 秒 · 点击后才加载站内音频',
      sourceUrl: 'https://www.bilibili.com/video/BV1CKMk6mEb9/',
      sourceLabel: '原始发布页',
      source: {
        kind: 'self-hosted',
        src: '/audio/study-room-current.m4a?v=20260822-bv1ckmk6meb9',
        mimeType: 'audio/mp4',
      },
    },
    {
      "id": "moonlit-pages",
      "title": "月落纸页",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "古典 · 钢琴",
      "description": "稀疏的琴音与缓缓铺开的和声，留给夜读一片安静。",
      "sourceNote": "5:27 · 古典 · 钢琴",
      "sourceUrl": "https://www.bilibili.com/video/BV1bW411r7Vu/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/moonlit-pages.m4a?v=20260926-bv1bw411r7vu",
        "mimeType": "audio/mp4"
      }
    },
    {
      "id": "blue-margin",
      "title": "蓝调留白",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "爵士 · 钢琴",
      "description": "轻柔的爵士钢琴，在句与句之间稍作停留。",
      "sourceNote": "6:45 · 爵士 · 钢琴",
      "sourceUrl": "https://www.bilibili.com/video/BV1aJ411N7Gr/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/blue-margin.m4a?v=20260926-bv1aj411n7gr",
        "mimeType": "audio/mp4"
      }
    },
    {
      "id": "winter-letter",
      "title": "雪夜来信",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "电影 · 钢琴",
      "description": "清澈的电影配乐，像一封冬夜寄来的信。",
      "sourceNote": "5:56 · 电影 · 钢琴",
      "sourceUrl": "https://www.bilibili.com/video/BV1jY411d7qT/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/winter-letter.m4a?v=20260926-bv1jy411d7qt",
        "mimeType": "audio/mp4"
      }
    },
    {
      "id": "streetlight-beats",
      "title": "街灯慢拍",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "爵士嘻哈 · 器乐",
      "description": "温暖采样与松弛鼓点，适合午后整理思绪。",
      "sourceNote": "4:17 · 爵士嘻哈 · 器乐",
      "sourceUrl": "https://www.bilibili.com/video/BV1Uy4y1b7ba/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/streetlight-beats.m4a?v=20260926-bv1uy4y1b7ba",
        "mimeType": "audio/mp4"
      }
    },
    {
      "id": "woodland-strings",
      "title": "木弦晚风",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "民谣 · 吉他",
      "description": "木吉他的朴素旋律，让阅读慢慢安静下来。",
      "sourceNote": "1:22 · 民谣 · 吉他",
      "sourceUrl": "https://www.bilibili.com/video/BV1fM4y1t7km/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/woodland-strings.m4a?v=20260926-bv1fm4y1t7km",
        "mimeType": "audio/mp4"
      }
    },
    {
      "id": "bamboo-moon",
      "title": "竹影向月",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "东方 · 钢琴",
      "description": "轻快而流动的东方钢琴，伴着月色翻过书页。",
      "sourceNote": "2:53 · 东方 · 钢琴",
      "sourceUrl": "https://www.bilibili.com/video/BV1HUTVzkEUq/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/bamboo-moon.m4a?v=20260926-bv1hutvzkeuq",
        "mimeType": "audio/mp4"
      }
    },
    {
      "id": "before-rain-ends",
      "title": "雨停之前",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "动画 · 人声",
      "description": "温柔人声与细碎节奏，适合雨天的书房。",
      "sourceNote": "4:23 · 动画 · 人声",
      "sourceUrl": "https://www.bilibili.com/video/BV1tW411a71j/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/before-rain-ends.m4a?v=20260926-bv1tw411a71j",
        "mimeType": "audio/mp4"
      }
    },
    {
      "id": "late-summer-echo",
      "title": "夏末回声",
      "kicker": "STUDY ROOM SELECTION",
      "subtitle": "动画 · 抒情人声",
      "description": "带着夏日回忆的抒情合唱，适合阅读后的片刻休息。",
      "sourceNote": "5:52 · 动画 · 抒情人声",
      "sourceUrl": "https://www.bilibili.com/video/BV1d54y137H7/",
      "sourceLabel": "原始发布页",
      "source": {
        "kind": "self-hosted",
        "src": "/audio/late-summer-echo.m4a?v=20260926-bv1d54y137h7",
        "mimeType": "audio/mp4"
      }
    },
  ],
};
