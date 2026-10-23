import {
  getCalendarMonthPeriod,
  getCalendarYearPeriods,
  getPeriodRange,
  shiftCalendarDate,
  type CalendarType,
} from "./calendarPeriods";
import { formatDayKey } from "./gardenViews";
import { getProgressDayKey } from "./progress";
import type { AppLanguage, DailyCollectionCompletion, ZikrDayRecord } from "./types";
import type { PrayerTrackingRecord } from "./types";
import { getPrayerPeriodStats } from "./prayerPeriodStats";

export const INSIGHT_ROUTINES = ["morning", "evening", "before_sleep"] as const;
export type InsightRoutine = (typeof INSIGHT_ROUTINES)[number];
export type InsightPeriod = "week" | "month" | "year";
export function countRoutineRecords(
  records: readonly DailyCollectionCompletion[],
  range: { startKey: string; endKey: string },
) {
  return new Set(
    records
      .filter(
        (row) =>
          INSIGHT_ROUTINES.includes(row.category as InsightRoutine) &&
          row.dayKey >= range.startKey &&
          row.dayKey <= range.endKey,
      )
      .map((row) => `${row.dayKey}:${row.category}`),
  ).size;
}
export function getMatchedInsightPeriods(
  period: InsightPeriod,
  displayDate: Date,
  now: Date,
  language: AppLanguage,
  calendar: CalendarType,
  dayStart = 0,
) {
  const current = getInsightPeriod(period, displayDate, now, language, calendar, dayStart);
  const previous = getInsightPeriod(
    period,
    shiftCalendarDate(displayDate, period, -1, calendar),
    now,
    language,
    calendar,
    dayStart,
  );
  const days = Math.min(current.days, previous.days);
  const trim = (range: typeof current) => {
    const end = new Date(`${range.startKey}T12:00:00`);
    end.setDate(end.getDate() + days - 1);
    return { startKey: range.startKey, endKey: formatDayKey(end), days };
  };
  return { current: trim(current), previous: trim(previous), days };
}
export interface InsightRow {
  id: string;
  count: number;
}

export interface InsightBucket {
  label: string;
  axisLabel: string;
  startKey: string;
  endKey: string;
  days: number;
  partial: boolean;
}

export interface InsightTimelinePoint extends InsightBucket {
  recorded: number;
  possible: number;
}

/** Historical comparisons use complete progress days only. Today remains in
 * the daily view; an unfinished day must not create an apparent decline. */
export function getInsightPeriod(
  period: InsightPeriod,
  displayDate: Date,
  now: Date,
  language: AppLanguage,
  calendar: CalendarType,
  dayStart = 0,
) {
  const range = getPeriodRange(period, displayDate, language, calendar);
  const today = getProgressDayKey(now, dayStart);
  const yesterday = new Date(`${today}T12:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  const endKey = range.endKey < today ? range.endKey : formatDayKey(yesterday);
  const days = Math.max(0, Math.round((Date.parse(endKey) - Date.parse(range.startKey)) / 86400000) + 1);
  return { startKey: range.startKey, endKey, days };
}

/** No winner is manufactured for ties, empty history, or a tiny sample. */
export function getRecordingPattern(rows: readonly InsightRow[], days: number) {
  const highest = Math.max(0, ...rows.map((row) => row.count));
  const lowest = Math.min(...rows.map((row) => row.count));
  if (days < 3 || highest === 0)
    return { kind: highest === 0 ? "empty" : "early", strongest: [], attention: [] } as const;
  if (highest === lowest)
    return { kind: highest === days ? "complete" : "balanced", strongest: [], attention: [] } as const;
  return {
    kind: "pattern",
    strongest: rows.filter((row) => row.count === highest).map((row) => row.id),
    attention: rows.filter((row) => row.count === lowest).map((row) => row.id),
  } as const;
}

export function getRoutineInsights(
  records: readonly DailyCollectionCompletion[],
  period: InsightPeriod,
  displayDate: Date,
  now: Date,
  language: AppLanguage,
  calendar: CalendarType,
  dayStart = 0,
) {
  const range = getInsightPeriod(period, displayDate, now, language, calendar, dayStart);
  const index = new Map<InsightRoutine, Set<string>>(INSIGHT_ROUTINES.map((id) => [id, new Set()]));
  for (const record of records) {
    if (record.dayKey >= range.startKey && record.dayKey <= range.endKey)
      index.get(record.category as InsightRoutine)?.add(record.dayKey);
  }
  const rows = INSIGHT_ROUTINES.map((id) => ({ id, count: index.get(id)!.size }));
  const trend = getInsightBuckets(period, displayDate, range, language, calendar).map((bucket) => ({
    ...bucket,
    routines: Object.fromEntries(
      INSIGHT_ROUTINES.map((id) => [
        id,
        [...index.get(id)!].filter((key) => key >= bucket.startKey && key <= bucket.endKey).length,
      ]),
    ) as Record<InsightRoutine, number>,
  }));
  return { ...range, rows, trend };
}

/** Shared time buckets, with civil prayer and devotional routine cutoffs
 * supplied by their own range selectors. Never pad future dates with zeroes. */
export function getInsightBuckets(
  period: InsightPeriod,
  displayDate: Date,
  range: ReturnType<typeof getInsightPeriod>,
  language: AppLanguage,
  calendar: CalendarType,
): InsightBucket[] {
  const dates: Date[] = [];
  for (
    let date = new Date(`${range.startKey}T12:00:00`);
    formatDayKey(date) <= range.endKey;
    date.setDate(date.getDate() + 1)
  )
    dates.push(new Date(date));
  const bucketSize = period === "week" ? 1 : 7;
  const buckets =
    period === "year"
      ? getCalendarYearPeriods(displayDate, calendar, language).map((month) =>
          month.dates.filter((date) => formatDayKey(date) <= range.endKey),
        )
      : Array.from({ length: Math.ceil(dates.length / bucketSize) }, (_, i) =>
          dates.slice(i * bucketSize, (i + 1) * bucketSize),
        );
  const formatter = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    calendar: calendar === "hijri" ? "islamic-umalqura" : "gregory",
  });
  return buckets
    .filter((bucket) => bucket.length)
    .map((bucket) => {
      const start = bucket[0]!;
      const end = bucket.at(-1)!;
      const label =
        period === "year"
          ? getCalendarMonthPeriod(start, calendar, language).monthLabel
          : bucket.length === 1
            ? formatter.format(start)
            : `${formatter.format(start)} – ${formatter.format(end)}`;
      return {
        label,
        axisLabel: period === "year" ? label : formatter.format(start),
        startKey: formatDayKey(start),
        endKey: formatDayKey(end),
        days: bucket.length,
        partial:
          period === "year"
            ? bucket.length < getCalendarMonthPeriod(start, calendar, language).dates.length
            : period === "month" &&
              bucket.length < 7 &&
              formatDayKey(end) < getPeriodRange(period, displayDate, language, calendar).endKey,
      };
    });
}

export function getPrayerInsights(
  records: readonly PrayerTrackingRecord[],
  period: InsightPeriod,
  displayDate: Date,
  now: Date,
  language: AppLanguage,
  calendar: CalendarType,
) {
  const range = getInsightPeriod(period, displayDate, now, language, calendar);
  return {
    ...range,
    ...getPrayerPeriodStats(records, range.startKey, range.endKey, range.days),
    trend: getInsightBuckets(period, displayDate, range, language, calendar).map((bucket) => ({
      ...bucket,
      ...getPrayerPeriodStats(records, bucket.startKey, bucket.endKey, bucket.days),
    })),
  };
}

/** Compare rates only when both adjacent buckets have at least three complete
 * days. A short latest bucket is visible, but must not become a trend claim. */
export function getTimelineChange(points: readonly InsightTimelinePoint[], selectedIndex: number) {
  const current = points[selectedIndex];
  const previous = points[selectedIndex - 1];
  if (
    !current ||
    !previous ||
    current.days < 3 ||
    previous.days < 3 ||
    current.days !== previous.days ||
    !current.possible ||
    !previous.possible
  )
    return null;
  return Math.round((current.recorded / current.possible - previous.recorded / previous.possible) * 100);
}

export function getZikrItemInsights(records: readonly ZikrDayRecord[], startKey: string, endKey: string) {
  const items = new Map<
    string,
    { id: string; category: ZikrDayRecord["category"]; recorded: number; possible: number }
  >();
  for (const day of records) {
    if (day.dayKey < startKey || day.dayKey > endKey) continue;
    const completed = new Set(day.completedIds);
    for (const id of day.offeredIds) {
      const row = items.get(id) ?? { id, category: day.category, recorded: 0, possible: 0 };
      row.possible++;
      if (completed.has(id)) row.recorded++;
      items.set(id, row);
    }
  }
  // Comparable rates need at least three observed routine days per item.
  return [...items.values()]
    .filter((row) => row.possible >= 3)
    .sort((a, b) => a.recorded / a.possible - b.recorded / b.possible || a.id.localeCompare(b.id));
}
