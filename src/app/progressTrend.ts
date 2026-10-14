import type { DailyCollectionCompletion } from "./types";
import { createDailyCompletionIndex, formatDayKey } from "./gardenViews";
import { getProgressDayKey } from "./progress";

export interface ProgressTrendPoint {
  key: string;
  label: string;
  dates: readonly Date[];
  completed: number;
  possible: number;
  rate: number | null;
  partial: boolean;
  routines?: { morning: number; evening: number; before_sleep: number };
}

/** Recording coverage, not a measure of worship. Only the three daily azkar
 * routines participate; Quran and after-prayer records remain independent. */
export function buildProgressTrend(
  records: readonly DailyCollectionCompletion[],
  buckets: readonly { label: string; dates: readonly Date[]; elapsedLabel?: (length: number) => string }[],
  now: Date,
  progressDayStartHour = 0,
): ProgressTrendPoint[] {
  const index = createDailyCompletionIndex([...records]);
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  return buckets.flatMap(({ label, dates, elapsedLabel }) => {
    const elapsed = dates.filter((date) => formatDayKey(date) <= todayKey);
    if (!elapsed.length) return [];
    const routines = { morning: 0, evening: 0, before_sleep: 0 };
    elapsed.forEach((date) => {
      const categories = index.get(formatDayKey(date))?.categories;
      for (const id of ["morning", "evening", "before_sleep"] as const) {
        if (categories?.has(id)) routines[id]++;
      }
    });
    const completed = routines.morning + routines.evening + routines.before_sleep;
    const possible = elapsed.length * 3;
    return [
      {
        key: dates[0] ? formatDayKey(dates[0]) : label,
        label: elapsedLabel?.(elapsed.length) ?? label,
        dates: elapsed,
        routines,
        completed,
        possible,
        rate: possible ? Math.round((completed / possible) * 100) : null,
        partial: elapsed.length > 0 && elapsed.length < dates.length,
      },
    ];
  });
}
