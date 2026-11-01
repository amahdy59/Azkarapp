import { getCalendarMonthPeriod, shiftCalendarDate, type CalendarType } from "./calendarPeriods";
import { getProgressDayKey, shiftProgressDayKey } from "./progress";
import { progressRangeDays, type ProgressDailyRecord, type ProgressRange } from "./progressDashboard";
import type { AppLanguage } from "./types";

export type HeatmapMetric = "routines" | "prayers" | "pages" | "quranGoals";
export type HeatmapDay = {
  dayKey: string;
  kind: "recorded" | "none" | "unavailable" | "future" | "outside";
  value: number | null;
  possible: number | null;
  level: number;
};

/** The palette has fixed units; selecting another range never rescales it. */
export function progressHeatmapDay(
  row: ProgressDailyRecord | undefined,
  dayKey: string,
  metric: HeatmapMetric,
  range: ProgressRange,
  window: ProgressRange,
): HeatmapDay {
  const empty = { dayKey, value: null, possible: null, level: 0 };
  if (dayKey < range.startKey || dayKey > range.endKey) return { ...empty, kind: "outside" };
  if (dayKey > window.endKey) return { ...empty, kind: "future" };
  if (dayKey < window.startKey || (metric === "quranGoals" && row?.quranGoals == null))
    return { ...empty, kind: "unavailable" };
  const value = row?.[metric] ?? 0;
  const possible = metric === "pages" ? null : metric === "prayers" ? 5 : metric === "routines" ? 3 : 1;
  const level =
    value === 0
      ? 0
      : metric === "pages"
        ? value <= 4
          ? 1
          : value <= 10
            ? 2
            : value <= 20
              ? 3
              : 4
        : Math.min(4, Math.ceil((value / possible!) * 4));
  return { dayKey, value, possible, level, kind: value > 0 ? "recorded" : "none" };
}

/** At most two months of daily cells; long ranges explore one actual month. */
export function progressHeatmapGrid(
  range: ProgressRange,
  monthKey: string,
  calendar: CalendarType,
  language: AppLanguage,
) {
  const month = getCalendarMonthPeriod(new Date(`${monthKey}T12:00:00`), calendar, language);
  const long = progressRangeDays(range) > 62;
  const visible = long
    ? { startKey: getProgressDayKey(month.startDate, 0), endKey: getProgressDayKey(month.endDate, 0) }
    : range;
  const firstWeekday = language === "ar" ? 6 : 0;
  const offset = (new Date(`${visible.startKey}T12:00:00`).getDay() - firstWeekday + 7) % 7;
  const count = Math.ceil((progressRangeDays(visible) + offset) / 7) * 7;
  return {
    month,
    long,
    days: Array.from({ length: count }, (_, index) => shiftProgressDayKey(visible.startKey, index - offset)),
    previous: getProgressDayKey(shiftCalendarDate(month.startDate, "month", -1, calendar), 0),
    next: getProgressDayKey(shiftCalendarDate(month.startDate, "month", 1, calendar), 0),
  };
}
