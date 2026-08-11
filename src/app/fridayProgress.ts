export const FRIDAY_KAHF_WEEK_KEY = "azkarapp.friday-kahf-week.v1";
export type FridaySalawatTarget = number;

export interface FridaySalawatProgress {
  count: number;
  target: FridaySalawatTarget;
}

export function getIsoWeekKey(date = new Date()): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function fridayChecklistKey(week = getIsoWeekKey()): string {
  return `azkarapp.friday-checklist.${week}`;
}

export function fridayKahfOpenedKey(week = getIsoWeekKey()): string {
  return `azkarapp.friday-kahf-opened.${week}`;
}

export function fridaySalawatKey(week = getIsoWeekKey()): string {
  return `azkarapp.friday-salawat.${week}`;
}

export function fridayDuasKey(week = getIsoWeekKey()): string {
  return `azkarapp.friday-duas.${week}`;
}

/**
 * Matches only the week-scoped Friday keys. `FRIDAY_KAHF_WEEK_KEY` ends in
 * `.v1` rather than an ISO week, so it can never match and is never pruned.
 */
const WEEK_SCOPED_FRIDAY_KEY = /^azkarapp\.friday-[a-z-]+\.(\d{4}-W\d{2})$/;

/**
 * Friday progress is written under a fresh ISO week every seven days and was
 * never cleaned up, so a long-lived install accumulated four dead keys per week
 * indefinitely. Only the current week is ever read, so anything else is waste.
 *
 * Called once at startup from `main.tsx`, deliberately not from the read
 * functions: those take an explicit `week`, so pruning against *today* inside a
 * read would delete the very data a non-current-week read asked for.
 */
export function pruneStaleFridayProgress(currentWeek = getIsoWeekKey()): void {
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      const week = key?.match(WEEK_SCOPED_FRIDAY_KEY)?.[1];
      if (key && week && week !== currentWeek) localStorage.removeItem(key);
    }
  } catch {
    // Stale weeks only occupy storage; failing to prune them changes nothing.
  }
}

export function readFridayDuaProgress(allowedIds: Iterable<string>, week = getIsoWeekKey()): Set<string> {
  try {
    const allowed = new Set(allowedIds);
    const parsed: unknown = JSON.parse(localStorage.getItem(fridayDuasKey(week)) ?? "[]");
    return new Set(
      Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && allowed.has(id)) : [],
    );
  } catch {
    return new Set();
  }
}

export function writeFridayDuaProgress(ids: Iterable<string>, week = getIsoWeekKey()): void {
  try {
    localStorage.setItem(fridayDuasKey(week), JSON.stringify([...new Set(ids)].sort()));
  } catch {
    // Weekly progress remains usable in memory when storage is unavailable.
  }
}

export function readFridaySalawatProgress(week = getIsoWeekKey()): FridaySalawatProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(fridaySalawatKey(week)) ?? "null") as Partial<FridaySalawatProgress>;
    const target = Number.isFinite(parsed?.target) ? Math.min(100_000, Math.max(1, Math.floor(parsed.target!))) : 100;
    const count = Number.isFinite(parsed?.count) ? Math.max(0, Math.floor(parsed.count!)) : 0;
    return { count, target };
  } catch {
    return { count: 0, target: 100 };
  }
}

export function writeFridaySalawatProgress(progress: FridaySalawatProgress, week = getIsoWeekKey()): void {
  try {
    const target = Math.min(100_000, Math.max(1, Math.floor(progress.target)));
    const count = Math.max(0, Math.floor(progress.count));
    localStorage.setItem(fridaySalawatKey(week), JSON.stringify({ count, target }));
  } catch {
    // Counting remains usable in memory when storage is unavailable.
  }
}
