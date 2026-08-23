import type { QuranWirdPlan } from "../types";

export const TOTAL_MUSHAF_PAGES = 604;

/**
 * How many pages today's wird asks for.
 *
 * A plain daily plan asks for the same number every day. A khatmah plan asks
 * for whatever is left over the days that remain, so a missed day is spread
 * gently across the rest rather than piling up as a debt.
 *
 * Shared by the Wird overview and the reader: the reader shows progress against
 * this while you read, and two copies of this arithmetic would eventually
 * disagree about what today's goal is.
 */
export function effectiveDailyGoal(plan: QuranWirdPlan, history: Record<string, number[]>): number {
  if (plan.kind === "daily" || !plan.durationDays || !plan.startedDayKey) return plan.dailyPages;

  const [year, month, day] = plan.startedDayKey.split("-").map(Number);
  const today = new Date();
  const elapsed = Math.max(
    0,
    Math.floor(
      (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(year!, month! - 1, day!)) /
        86_400_000,
    ),
  );
  const completed = new Set(
    Object.entries(history)
      .filter(([dayKey]) => dayKey >= plan.startedDayKey!)
      .flatMap(([, pages]) => pages),
  ).size;

  return Math.max(1, Math.ceil(Math.max(0, TOTAL_MUSHAF_PAGES - completed) / Math.max(1, plan.durationDays - elapsed)));
}
