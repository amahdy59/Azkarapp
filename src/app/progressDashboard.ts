import { getPeriodRange, getCalendarYearPeriods, shiftCalendarDate, type CalendarType } from "./calendarPeriods";
import { getProgressDayKey, isProgressDayKey, shiftProgressDayKey } from "./progress";
import { getPrayerPeriodStats } from "./prayerPeriodStats";
import { getQuranWirdDayProgress } from "./screens/quranWirdGoal";
import type {
  AppLanguage,
  DailyCollectionCompletion,
  DailyHabitCompletion,
  PrayerTrackingRecord,
  QuranWirdPlan,
} from "./types";
import type { InsightBucket, InsightTimelinePoint } from "./progressInsights";

export type ProgressPreset = "day" | "week" | "month" | "year";
export type ProgressRange = { startKey: string; endKey: string };
export type ProgressMetric =
  "prayers" | "routines" | "pages" | "quranGoals" | "mosque" | "rawatib" | "adhkar" | "morning" | "evening" | "sleep";
export const PROGRESS_METRICS: readonly ProgressMetric[] = [
  "prayers",
  "routines",
  "pages",
  "quranGoals",
  "mosque",
  "rawatib",
  "adhkar",
  "morning",
  "evening",
  "sleep",
];
export const DEFAULT_PROGRESS_METRICS: readonly ProgressMetric[] = ["prayers", "routines", "pages", "quranGoals"];
const DAY = 86400000;
export function progressRangeDays(range: ProgressRange) {
  return Math.max(0, Math.round((Date.parse(range.endKey) - Date.parse(range.startKey)) / DAY) + 1);
}
export function validateProgressRange(range: ProgressRange, today: string): "invalid" | "reversed" | "future" | null {
  if (!isProgressDayKey(range.startKey) || !isProgressDayKey(range.endKey)) return "invalid";
  if (range.startKey > range.endKey) return "reversed";
  if (range.endKey > today) return "future";
  return null;
}
export function progressPresetRange(preset: ProgressPreset, date: Date, language: AppLanguage, calendar: CalendarType) {
  return getPeriodRange(preset, date, language, calendar);
}
export function formatProgressRange(range: ProgressRange, language: AppLanguage, calendar: CalendarType) {
  const format = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    calendar: calendar === "hijri" ? "islamic-umalqura" : "gregory",
  });
  const start = format.format(new Date(`${range.startKey}T12:00:00`));
  return range.startKey === range.endKey
    ? start
    : format.formatRange(new Date(`${range.startKey}T12:00:00`), new Date(`${range.endKey}T12:00:00`));
}

export interface ProgressDashboardInput {
  dailyCompletions: readonly DailyCollectionCompletion[];
  prayerTracking: readonly PrayerTrackingRecord[];
  dailyHabits: readonly DailyHabitCompletion[];
  wirdHistory: Record<string, number[]>;
  quranWirdDailyGoals: Record<string, number>;
  quranWirdPlan?: QuranWirdPlan;
}
export interface ProgressDailyRecord {
  dayKey: string;
  prayers: number;
  mosque: number;
  rawatib: number;
  adhkar: number;
  routines: number;
  morning: number;
  evening: number;
  sleep: number;
  pages: number;
  quranGoals: number | null;
  quranGoal: number | null;
}
export interface ProgressMetricValue {
  count: number;
  possible: number | null;
  days: number;
  range: ProgressRange;
}
export type ProgressScopedDailyRecord = { dayKey: string; quranGoal: number | null } & Record<
  ProgressMetric,
  number | null
>;

/** Build sparse, normalized daily facts once per actual record revision. No
 * historical opportunities, goal changes or item records are reconstructed. */
export function indexProgressDashboard(input: ProgressDashboardInput, devotionalToday: string): ProgressDailyRecord[] {
  const keys = new Set([
    ...input.dailyCompletions.map((row) => row.dayKey),
    ...input.prayerTracking.map((row) => row.dayKey),
    ...input.dailyHabits.filter((row) => row.habit === "quran_wird").map((row) => row.dayKey),
    ...Object.keys(input.wirdHistory),
    ...Object.keys(input.quranWirdDailyGoals),
    devotionalToday,
  ]);
  const routines = new Map<string, Set<string>>();
  for (const row of input.dailyCompletions) {
    if (!["morning", "evening", "before_sleep"].includes(row.category)) continue;
    const days = routines.get(row.dayKey) ?? new Set<string>();
    days.add(row.category);
    routines.set(row.dayKey, days);
  }
  const prayers = new Map<string, PrayerTrackingRecord[]>();
  for (const row of input.prayerTracking) {
    const list = prayers.get(row.dayKey) ?? [];
    list.push(row);
    prayers.set(row.dayKey, list);
  }
  const manual = new Set(input.dailyHabits.filter((row) => row.habit === "quran_wird").map((row) => row.dayKey));
  return [...keys]
    .filter(isProgressDayKey)
    .sort()
    .map((dayKey) => {
      const totals = getPrayerPeriodStats(prayers.get(dayKey) ?? [], dayKey, dayKey, 1).totals;
      const done = routines.get(dayKey);
      const pages = new Set(
        (input.wirdHistory[dayKey] ?? []).filter((page) => Number.isInteger(page) && page >= 1 && page <= 604),
      ).size;
      const savedGoal = input.quranWirdDailyGoals[dayKey];
      const todayProgress =
        dayKey === devotionalToday ? getQuranWirdDayProgress(input.quranWirdPlan, input.wirdHistory, dayKey) : null;
      const goal =
        typeof savedGoal === "number" && Number.isFinite(savedGoal)
          ? savedGoal > 0
            ? savedGoal
            : null
          : todayProgress?.goal || null;
      const read = todayProgress && input.quranWirdPlan?.kind === "repeating" ? todayProgress.read : pages;
      return {
        dayKey,
        prayers: totals.fard,
        mosque: totals.mosque,
        rawatib: totals.rawatib,
        adhkar: totals.adhkar,
        morning: Number(done?.has("morning") ?? false),
        evening: Number(done?.has("evening") ?? false),
        sleep: Number(done?.has("before_sleep") ?? false),
        routines: done?.size ?? 0,
        pages,
        quranGoal: goal,
        quranGoals: manual.has(dayKey) ? 1 : goal ? Number(read >= goal) : null,
      };
    });
}

export function metricProgressRange(
  range: ProgressRange,
  metric: ProgressMetric,
  now: Date,
  dayStart: number,
  completeOnly = false,
  currentDay = false,
): ProgressRange {
  const devotional = !["prayers", "mosque", "rawatib", "adhkar"].includes(metric);
  const today = getProgressDayKey(now, devotional ? dayStart : 0);
  const selected = currentDay && devotional ? { startKey: today, endKey: today } : range;
  const cutoff = completeOnly ? shiftProgressDayKey(today, -1) : today;
  return { startKey: selected.startKey, endKey: selected.endKey < cutoff ? selected.endKey : cutoff };
}
export function summarizeProgressMetric(
  rows: readonly ProgressDailyRecord[],
  range: ProgressRange,
  metric: ProgressMetric,
): ProgressMetricValue {
  const days = progressRangeDays(range);
  const selected = rows.filter((row) => row.dayKey >= range.startKey && row.dayKey <= range.endKey);
  const count = selected.reduce((sum, row) => sum + (row[metric] ?? 0), 0);
  const perDay =
    metric === "prayers" || metric === "mosque" || metric === "adhkar"
      ? 5
      : metric === "rawatib"
        ? 4
        : metric === "routines"
          ? 3
          : 1;
  const possible =
    metric === "pages"
      ? null
      : metric === "quranGoals"
        ? selected.filter((row) => row.quranGoals !== null).length
        : days * perDay;
  return { count, possible, days, range };
}

/** Native dates stay local-noon; elapsed days use UTC date ordinals so DST
 * cannot create a fractional denominator. Custom plots have at most 24 bins. */
export function dashboardProgressBuckets(
  range: ProgressRange,
  preset: ProgressPreset | "custom",
  displayDate: Date,
  language: AppLanguage,
  calendar: CalendarType,
): InsightBucket[] {
  const days = progressRangeDays(range);
  if (!days) return [];
  const size = preset === "week" || preset === "day" ? 1 : preset === "month" ? 7 : Math.max(1, Math.ceil(days / 24));
  const ranges =
    preset === "year"
      ? getCalendarYearPeriods(displayDate, calendar, language).map((month) => ({
          startKey: getProgressDayKey(month.startDate, 0),
          endKey: getProgressDayKey(month.endDate, 0),
        }))
      : Array.from({ length: Math.ceil(days / size) }, (_, index) => ({
          startKey: shiftProgressDayKey(range.startKey, index * size),
          endKey: shiftProgressDayKey(range.startKey, index * size + size - 1),
        }));
  return ranges
    .filter((row) => row.startKey <= range.endKey && row.endKey >= range.startKey)
    .map((row) => {
      const clipped = {
        startKey: row.startKey < range.startKey ? range.startKey : row.startKey,
        endKey: row.endKey > range.endKey ? range.endKey : row.endKey,
      };
      const formatter = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        day: "numeric",
        month: "short",
        calendar: calendar === "hijri" ? "islamic-umalqura" : "gregory",
      });
      return {
        ...clipped,
        days: progressRangeDays(clipped),
        partial: clipped.startKey !== row.startKey || clipped.endKey !== row.endKey,
        label: formatProgressRange(clipped, language, calendar),
        axisLabel: formatter.format(new Date(`${clipped.startKey}T12:00:00`)),
      };
    });
}
export function dashboardProgressTimeline(
  rows: readonly ProgressDailyRecord[],
  range: ProgressRange,
  metric: ProgressMetric,
  preset: ProgressPreset | "custom",
  displayDate: Date,
  language: AppLanguage,
  calendar: CalendarType,
): InsightTimelinePoint[] {
  return dashboardProgressBuckets(range, preset, displayDate, language, calendar).map((bucket) => {
    const value = summarizeProgressMetric(rows, bucket, metric);
    return { ...bucket, recorded: value.count, possible: value.possible ?? 0 };
  });
}
export function matchedDashboardRanges(
  range: ProgressRange,
  preset: ProgressPreset | "custom",
  displayDate: Date,
  language: AppLanguage,
  calendar: CalendarType,
) {
  const days = progressRangeDays(range);
  const previous =
    preset === "custom" || preset === "day"
      ? {
          startKey: shiftProgressDayKey(range.startKey, -days),
          endKey: shiftProgressDayKey(range.startKey, -1),
        }
      : getPeriodRange(preset, shiftCalendarDate(displayDate, preset, -1, calendar), language, calendar);
  const matchedDays = Math.min(days, progressRangeDays(previous));
  return {
    days: matchedDays,
    current: { startKey: range.startKey, endKey: shiftProgressDayKey(range.startKey, matchedDays - 1) },
    previous: { startKey: previous.startKey, endKey: shiftProgressDayKey(previous.startKey, matchedDays - 1) },
  };
}

export function scopeProgressDailyRecords(
  records: readonly ProgressDailyRecord[],
  range: ProgressRange,
  now: Date,
  dayStart: number,
  currentDay: boolean,
) {
  const windows = Object.fromEntries(
    PROGRESS_METRICS.map((metric) => [metric, metricProgressRange(range, metric, now, dayStart, false, currentDay)]),
  ) as Record<ProgressMetric, ProgressRange>;
  return records
    .filter((row) =>
      PROGRESS_METRICS.some((metric) => {
        const window = windows[metric];
        return (
          row.dayKey >= window.startKey &&
          row.dayKey <= window.endKey &&
          row[metric] !== null &&
          (row[metric]! > 0 || metric === "quranGoals")
        );
      }),
    )
    .map((row) => {
      const result: ProgressScopedDailyRecord = { ...row };
      for (const metric of PROGRESS_METRICS) {
        const window = windows[metric];
        if (row.dayKey < window.startKey || row.dayKey > window.endKey) {
          result[metric] = null;
          if (metric === "quranGoals") result.quranGoal = null;
        }
      }
      return result;
    });
}

export function exportProgressDashboard(
  input: ProgressDashboardInput,
  records: readonly ProgressDailyRecord[],
  range: ProgressRange,
  now: Date,
  dayStart: number,
  currentDay: boolean,
  calendar: CalendarType,
) {
  const windows = Object.fromEntries(
    PROGRESS_METRICS.map((metric) => [metric, metricProgressRange(range, metric, now, dayStart, false, currentDay)]),
  ) as Record<ProgressMetric, ProgressRange>;
  const includes = (dayKey: string, metric: ProgressMetric) =>
    dayKey >= windows[metric].startKey && dayKey <= windows[metric].endKey;
  return {
    schema: "azkarapp.progress.v1",
    selectedRange: range,
    calendar,
    devotionalDayStartHour: dayStart,
    definitions: {
      prayerDay: "civil",
      routineAndQuranDay: "devotional",
      overviewIncludesCurrentDay: true,
      trendsUseCompleteDays: true,
      missingRecordsAreNotMissedWorship: true,
      unknownPastGoalsAreNull: true,
      pagesCountedOncePerDay: true,
      rawatibExcludes: ["asr"],
    },
    windows,
    metrics: Object.fromEntries(
      PROGRESS_METRICS.map((metric) => [metric, summarizeProgressMetric(records, windows[metric], metric)]),
    ),
    dailyRecords: scopeProgressDailyRecords(records, range, now, dayStart, currentDay),
    records: {
      prayerTracking: input.prayerTracking.filter((row) => includes(row.dayKey, "prayers")),
      dailyCompletions: input.dailyCompletions.filter((row) => includes(row.dayKey, "routines")),
      dailyHabits: input.dailyHabits.filter((row) => includes(row.dayKey, "quranGoals")),
      wirdHistory: Object.fromEntries(Object.entries(input.wirdHistory).filter(([key]) => includes(key, "pages"))),
      quranWirdDailyGoals: Object.fromEntries(
        Object.entries(input.quranWirdDailyGoals).filter(([key]) => includes(key, "quranGoals")),
      ),
    },
  };
}
