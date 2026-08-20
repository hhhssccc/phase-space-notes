import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type ArticleVersionKind = 'first-upload' | 'file-update' | 'substantive-revision';

export interface ArticleVersion {
  /** Chronological version number: the oldest known version is v1. */
  version: number;
  /** Full Git object name for Git-backed versions; metadata fallbacks have no SHA. */
  sha: string | null;
  /** ISO 8601 commit time, or the normalized frontmatter date in fallback mode. */
  timestamp: string;
  subject: string;
  kind: ArticleVersionKind;
}

export type ArticleHistoryFallbackReason =
  | 'git-unavailable'
  | 'not-a-repository'
  | 'shallow-repository'
  | 'untracked-file'
  | 'invalid-history'
  | 'invalid-slug';

export interface ArticleHistory {
  slug: string;
  versions: readonly ArticleVersion[];
  /** True only when a non-shallow Git repository supplied the file's history. */
  complete: boolean;
  source: 'git' | 'frontmatter';
  fallbackReason?: ArticleHistoryFallbackReason;
}

export interface ArticleHistoryDates {
  date: Date | string;
  updated?: Date | string | null;
}

interface GitLookupSuccess {
  ok: true;
  versions: readonly ArticleVersion[];
}

interface GitLookupFailure {
  ok: false;
  reason: ArticleHistoryFallbackReason;
}

type GitLookup = GitLookupSuccess | GitLookupFailure;

const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_ROOT = resolve(process.cwd());
const gitHistoryCache = new Map<string, GitLookup>();

function gitArguments(args: readonly string[]) {
  const safeDirectory = process.platform === 'win32'
    ? ['-c', `safe.directory=${PROJECT_ROOT}`]
    : [];
  return [...safeDirectory, ...args];
}

function runGit(args: readonly string[]) {
  return execFileSync('git', gitArguments(args), {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    maxBuffer: 2 * 1024 * 1024,
    shell: false,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function readGitHistory(slug: string): GitLookup {
  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, reason: 'invalid-slug' };
  }
  if (!existsSync(join(PROJECT_ROOT, '.git'))) {
    return { ok: false, reason: 'not-a-repository' };
  }

  try {
    if (runGit(['rev-parse', '--is-inside-work-tree']).trim() !== 'true') {
      return { ok: false, reason: 'not-a-repository' };
    }

    const shallowState = runGit(['rev-parse', '--is-shallow-repository']).trim();
    if (shallowState === 'true') {
      return { ok: false, reason: 'shallow-repository' };
    }
    if (shallowState !== 'false') {
      return { ok: false, reason: 'invalid-history' };
    }

    const output = runGit([
      'log',
      '--follow',
      '--reverse',
      '--topo-order',
      '-z',
      '--format=%H%x00%cI%x00%s',
      '--',
      `content/${slug}.md`,
    ]);
    const fields = output.split('\0');
    if (fields.at(-1) === '') fields.pop();
    if (fields.length === 0) {
      return { ok: false, reason: 'untracked-file' };
    }
    if (fields.length % 3 !== 0) {
      return { ok: false, reason: 'invalid-history' };
    }

    const parsed: Omit<ArticleVersion, 'version' | 'kind'>[] = [];
    for (let index = 0; index < fields.length; index += 3) {
      const sha = fields[index];
      const timestamp = fields[index + 1];
      const subject = fields[index + 2];
      if (!SHA_PATTERN.test(sha) || Number.isNaN(Date.parse(timestamp))) {
        return { ok: false, reason: 'invalid-history' };
      }
      parsed.push({ sha, timestamp, subject });
    }

    // `--reverse --topo-order` supplies the file's oldest-to-newest evolution
    // order. Commit timestamps are display metadata only and must never renumber
    // versions, because clock skew and rebases can make them non-monotonic.
    const versions = parsed.map((entry, index): ArticleVersion => ({
      ...entry,
      version: index + 1,
      kind: index === 0 ? 'first-upload' : 'file-update',
    }));

    return { ok: true, versions };
  } catch {
    return { ok: false, reason: 'git-unavailable' };
  }
}

function normalizeDate(value: Date | string | null | undefined) {
  if (value === null || value === undefined) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

function frontmatterFallback(slug: string, dates: ArticleHistoryDates, reason: ArticleHistoryFallbackReason): ArticleHistory {
  const firstPublished = normalizeDate(dates.date);
  const substantivelyRevised = normalizeDate(dates.updated);
  const milestones: Omit<ArticleVersion, 'version'>[] = [];

  if (firstPublished) {
    milestones.push({
      sha: null,
      timestamp: firstPublished,
      subject: '依据文章元数据记录的首次公开日期',
      kind: 'first-upload',
    });
  }
  if (substantivelyRevised) {
    milestones.push({
      sha: null,
      timestamp: substantivelyRevised,
      subject: '依据文章元数据记录的正文实质修订日期',
      kind: 'substantive-revision',
    });
  }

  milestones.sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
  return {
    slug,
    versions: milestones.map((entry, index) => ({ ...entry, version: index + 1 })),
    complete: false,
    source: 'frontmatter',
    fallbackReason: reason,
  };
}

/**
 * Read a published article's complete file history when a full Git checkout is
 * available. Missing Git data and shallow clones deliberately fall back to the
 * frontmatter milestones without claiming that they form a complete history.
 */
export function getArticleHistory(slug: string, dates: ArticleHistoryDates): ArticleHistory {
  let lookup = gitHistoryCache.get(slug);
  if (!lookup) {
    lookup = readGitHistory(slug);
    gitHistoryCache.set(slug, lookup);
  }

  if (lookup.ok) {
    return {
      slug,
      versions: lookup.versions,
      complete: true,
      source: 'git',
    };
  }

  return frontmatterFallback(slug, dates, lookup.reason);
}
