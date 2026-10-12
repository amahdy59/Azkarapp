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
}

/** Recording coverage, not a measure of worship. Only the three daily azkar
 * routines participate; Quran and after-prayer records remain independent. */
export function buildProgressTrend(
  records: readonly DailyCollectionCompletion[],
  buckets: readonly { label: string; dates: readonly Date[] }[],
  now: Date,
  progressDayStartHour = 0,
): ProgressTrendPoint[] {
  const index = createDailyCompletionIndex([...records]);
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  return buckets.map(({ label, dates }) => {
    const elapsed = dates.filter((date) => formatDayKey(date) <= todayKey);
    const completed = elapsed.reduce((total, date) => {
      const categories = index.get(formatDayKey(date))?.categories;
      return total + (["morning", "evening", "before_sleep"] as const).filter((id) => categories?.has(id)).length;
    }, 0);
    const possible = elapsed.length * 3;
    return {
      key: dates[0] ? formatDayKey(dates[0]) : label,
      label,
      dates,
      completed,
      possible,
      rate: possible ? Math.round((completed / possible) * 100) : null,
      partial: elapsed.length > 0 && elapsed.length < dates.length,
    };
  });
}
