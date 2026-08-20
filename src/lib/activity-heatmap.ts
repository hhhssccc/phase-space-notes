import { execFileSync } from 'node:child_process';

export interface ActivityDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

export interface ActivityMonth {
  label: string;
  column: number;
}

export interface ActivityHeatmap {
  days: ActivityDay[];
  months: ActivityMonth[];
  total: number;
  activeDays: number;
  startDate: string;
  endDate: string;
}

const dayInMilliseconds = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function activityLevel(count: number): ActivityDay['level'] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function readCommitCounts(startDate: string) {
  const counts = new Map<string, number>();

  try {
    const output = execFileSync(
      'git',
      ['log', '--format=%cs', `--since=${startDate}`],
      { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );

    for (const date of output.split(/\r?\n/)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
  } catch {
    // Source archives may not include .git. The component still renders an
    // honest empty state instead of making the site build depend on Git.
  }

  return counts;
}

/** Build a Sunday-to-Saturday, 53-week activity calendar from repository commits. */
export function getActivityHeatmap(now = new Date()): ActivityHeatmap {
  const today = startOfUtcDay(now);
  const currentWeekStart = new Date(today);
  currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay());

  const start = new Date(currentWeekStart);
  start.setUTCDate(start.getUTCDate() - 52 * 7);

  const counts = readCommitCounts(toIsoDate(start));
  const days: ActivityDay[] = [];

  for (let offset = 0; offset < 53 * 7; offset += 1) {
    const date = new Date(start.valueOf() + offset * dayInMilliseconds);
    const dateKey = toIsoDate(date);
    const future = date > today;
    const count = future ? 0 : (counts.get(dateKey) ?? 0);
    days.push({ date: dateKey, count, level: activityLevel(count), future });
  }

  const monthFormatter = new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    timeZone: 'UTC',
  });
  const months: ActivityMonth[] = [];
  let previousMonth = -1;

  for (let column = 0; column < 53; column += 1) {
    const weekStart = new Date(start.valueOf() + column * 7 * dayInMilliseconds);
    const month = weekStart.getUTCMonth();
    if (month === previousMonth) continue;
    months.push({ label: monthFormatter.format(weekStart), column: column + 1 });
    previousMonth = month;
  }

  const visibleDays = days.filter((day) => !day.future);

  return {
    days,
    months,
    total: visibleDays.reduce((sum, day) => sum + day.count, 0),
    activeDays: visibleDays.filter((day) => day.count > 0).length,
    startDate: toIsoDate(start),
    endDate: toIsoDate(today),
  };
}
