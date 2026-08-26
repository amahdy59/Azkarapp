import type { QuranWirdPlan } from "../types";

export const TOTAL_MUSHAF_PAGES = 604;

export interface QuranWirdGoalResult {
  dailyGoal: number;
  expired: boolean;
  remainingPages: number;
}

/** One reading month follows the real length of the chosen calendar month. */
export function getReadingMonthDuration(now: Date, calendar: "hijri" | "gregorian") {
  if (calendar === "gregorian") {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const parts = (date: Date) =>
    Object.fromEntries(
      formatter
        .formatToParts(date)
        .filter(({ type }) => type === "day" || type === "month" || type === "year")
        .map(({ type, value }) => [type, Number(value)]),
    ) as Record<"day" | "month" | "year", number>;
  const start = parts(now);

  for (let offset = 1; offset <= 32; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    const next = parts(candidate);
    if (next.month !== start.month || next.year !== start.year) {
      return start.day - 1 + offset;
    }
  }

  return 30;
}

function dayNumber(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * Resolves the target for one devotional day from the range the reader chose.
 * The day key is passed in rather than read from the system clock so the Wird
 * overview, reader, Home card, and after-midnight boundary all use one day.
 */
export function getQuranWirdGoal(
  plan: QuranWirdPlan,
  history: Record<string, number[]>,
  activeDayKey: string,
): QuranWirdGoalResult {
  if (plan.kind === "free") {
    return { dailyGoal: 0, expired: false, remainingPages: TOTAL_MUSHAF_PAGES };
  }
  if (plan.kind === "daily" || !plan.durationDays || !plan.startedDayKey) {
    return { dailyGoal: plan.dailyPages, expired: false, remainingPages: TOTAL_MUSHAF_PAGES };
  }

  const startPage = plan.startPage ?? 1;
  const targetPage = plan.targetPage ?? TOTAL_MUSHAF_PAGES;
  const completed = new Set(
    Object.entries(history)
      .filter(([dayKey]) => dayKey >= plan.startedDayKey!)
      .flatMap(([, pages]) => pages)
      .filter((page) => page >= startPage && page <= targetPage),
  ).size;
  const remainingPages = Math.max(0, targetPage - startPage + 1 - completed);

  const started = dayNumber(plan.startedDayKey);
  const active = dayNumber(activeDayKey);
  const elapsed = started === null || active === null ? 0 : Math.max(0, active - started);
  const expired = remainingPages > 0 && elapsed >= plan.durationDays;
  const remainingDays = Math.max(1, plan.durationDays - elapsed);

  return {
    dailyGoal: expired ? 0 : Math.ceil(remainingPages / remainingDays),
    expired,
    remainingPages,
  };
}

export function effectiveDailyGoal(
  plan: QuranWirdPlan,
  history: Record<string, number[]>,
  activeDayKey: string,
): number {
  return getQuranWirdGoal(plan, history, activeDayKey).dailyGoal;
}
