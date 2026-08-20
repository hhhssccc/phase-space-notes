import { plainText, readingMinutes } from './content';

export interface SiteStatsEntry {
  body?: string;
  data: {
    type: 'essay' | 'note';
    draft: boolean;
    category: string;
    tags: readonly string[];
    date: Date;
    updated?: Date;
  };
}

export interface SiteStats {
  articleCount: number;
  noteCount: number;
  totalWords: number;
  totalReadingMinutes: number;
  categoryCount: number;
  tagCount: number;
  latestUpdated: Date | null;
}

/**
 * Count readable content using one stable rule: every Han character counts as
 * one word, as does every contiguous Latin-letter or digit token.
 */
export function contentWordCount(markdown: string) {
  const text = plainText(markdown).normalize('NFC');
  const cjkCharacters = text.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const latinAndNumberWords = text
    .replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, ' ')
    .match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g)?.length ?? 0;

  return cjkCharacters + latinAndNumberWords;
}

/** Build-time content statistics. Draft entries are always excluded. */
export function getSiteStats(entries: readonly SiteStatsEntry[]): SiteStats {
  let articleCount = 0;
  let noteCount = 0;
  let totalWords = 0;
  let totalReadingMinutes = 0;
  let latestTimestamp: number | null = null;
  const categories = new Set<string>();
  const tags = new Set<string>();

  for (const entry of entries) {
    if (entry.data.draft !== false) continue;

    if (entry.data.type === 'essay') articleCount += 1;
    if (entry.data.type === 'note') noteCount += 1;

    const body = entry.body ?? '';
    totalWords += contentWordCount(body);
    totalReadingMinutes += readingMinutes(body);

    const category = entry.data.category.trim().normalize('NFC');
    if (category) categories.add(category);

    for (const rawTag of entry.data.tags) {
      const tag = rawTag.trim().normalize('NFC');
      if (tag) tags.add(tag);
    }

    const timestamp = (entry.data.updated ?? entry.data.date).valueOf();
    if (Number.isFinite(timestamp) && (latestTimestamp === null || timestamp > latestTimestamp)) {
      latestTimestamp = timestamp;
    }
  }

  return {
    articleCount,
    noteCount,
    totalWords,
    totalReadingMinutes,
    categoryCount: categories.size,
    tagCount: tags.size,
    latestUpdated: latestTimestamp === null ? null : new Date(latestTimestamp),
  };
}
