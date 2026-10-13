import { useEffect, useState, useMemo, useId } from "react";
import { formatNumerals, formatRatio } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import {
  getWeekGardenStats,
  getMonthDetailedStats,
  getMonthDetailedStatsForDates,
  createDailyCompletionIndex,
} from "../gardenViews";
import { getCalendarMonthPeriod, getCalendarYearPeriods, type CalendarType } from "../calendarPeriods";
import { getProgressDayKey } from "../progress";
import { ProgressBar } from "./ProgressBar";
import { buildProgressTrend } from "../progressTrend";
import { ProgressTrendChart } from "./ProgressTrendChart";
import { Check, CheckCircle2, Calendar, Sunrise, Sunset, MoonStar } from "./icons";
function isAr(language: AppLanguage) {
  return language === "ar";
}
// ────────────────────────────────────────────────────────────────────────────
// WEEK VIEW (WEEKLY COMMITMENT MATRIX)
// ────────────────────────────────────────────────────────────────────────────
/**
 * One completion cell in the week table.
 *
 * The mark used to be a bare icon (or an empty bordered circle for "not done")
 * with no text and no label, so every cell in the week grid was announced as
 * empty and the whole view conveyed nothing to a screen reader.
 */
function WeekStatusCell({
  done,
  label,
  language,
  subItems,
  future = false,
}: {
  done: boolean;
  label: string;
  language: AppLanguage;
  subItems?: boolean[];
  future?: boolean;
}) {
  const status = future
    ? t(language, "progressTrend.upcoming")
    : done
      ? t(language, "progress.completed")
      : t(language, "progress.missed");
  return (
    <td className="py-3 px-2">
      <div className="flex justify-center">
        <span className="sr-only">{`${label}: ${status}`}</span>
        {future ? (
          <span aria-hidden="true" className="text-muted-foreground">
            —
          </span>
        ) : subItems ? (
          <div aria-hidden="true" className="flex items-center gap-0.5">
            {subItems.map((isCompleted, i) => (
              <span
                key={i}
                className={`inline-block h-1.5 w-1.5 rounded-full ${isCompleted ? "bg-success" : "bg-white/10 dark:bg-white/10 bg-black/10"}`}
              />
            ))}
          </div>
        ) : done ? (
          <div
            aria-hidden="true"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-success/20 border border-success/50 text-success"
          >
            <Check size={15} strokeWidth={3} />
          </div>
        ) : (
          <div aria-hidden="true" className="h-6 w-6 rounded-full border-2 border-border-control" />
        )}
      </div>
    </td>
  );
}

export function ProgressWeekView({
  language,
  dailyCompletions = [],
  referenceDate = new Date(),
  weeklyGoalDays,
  activeDays = 0,
  isQuranDoneForDay,
  now = new Date(),
  progressDayStartHour = 0,
  calendarType = "gregorian",
}: {
  language: AppLanguage;
  dailyCompletions?: import("../types").DailyCollectionCompletion[];
  referenceDate?: Date;
  weeklyGoalDays?: number;
  activeDays?: number;
  isQuranDoneForDay?: (dayKey: string) => boolean;
  now?: Date;
  progressDayStartHour?: number;
  calendarType?: CalendarType;
}) {
  const isArabic = isAr(language);
  const completionIndex = useMemo(() => createDailyCompletionIndex(dailyCompletions), [dailyCompletions]);
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        day: "numeric",
        month: "numeric",
        calendar: calendarType === "hijri" ? "islamic-umalqura" : "gregory",
      }),
    [language, calendarType],
  );

  const weekStats = useMemo(
    () => getWeekGardenStats(completionIndex, referenceDate, language, isQuranDoneForDay, todayKey),
    [completionIndex, referenceDate, language, isQuranDoneForDay, todayKey],
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 fade-in" dir={isArabic ? "rtl" : "ltr"}>
      {/* Main Weekly Commitment Matrix Card */}
      <div className="w-full rounded-2xl border border-border bg-card p-4 md:p-5">
        <h2
          data-testid="progress-primary-heading"
          className="mb-4 text-start text-base font-black text-foreground sm:text-lg md:text-xl"
        >
          {t(language, "progress.weekCommitment")}
        </h2>

        {/* Grid Table */}
        <div role="region" aria-label={t(language, "progress.weekCommitment")} className="overflow-x-auto rounded-lg">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="border-b border-white/30 dark:border-white/10">
                <th scope="col" className="py-2.5 px-2 text-start text-label font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>{t(language, "progress.day")}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-label font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <span>{t(language, "progressTrend.morning")}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-label font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <span>{t(language, "progressTrend.evening")}</span>
                  </div>
                </th>
                {weekStats.days.some((d) => d.quranStatus !== undefined) && (
                  <th scope="col" className="py-2.5 px-2 text-label font-bold text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <span>{t(language, "progressTrend.quran")}</span>
                    </div>
                  </th>
                )}
                <th scope="col" className="py-2.5 px-2 text-label font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <span>{t(language, "progressTrend.sleep")}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-white/5">
              {weekStats.days.map((day) => (
                <tr key={day.dayKey} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                  <th scope="row" className="py-3 px-2 text-start">
                    <span
                      className={`text-sm ${day.isToday ? "font-black text-primary" : "font-bold text-foreground"}`}
                    >
                      {day.weekdayName}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                      <bdi>{dayFormatter.format(day.date)}</bdi>
                    </span>
                  </th>

                  <WeekStatusCell
                    future={day.dayKey > todayKey}
                    done={day.morningStatus === "complete"}
                    label={t(language, "progressTrend.morning")}
                    language={language}
                  />

                  <WeekStatusCell
                    future={day.dayKey > todayKey}
                    done={day.eveningStatus === "complete"}
                    label={t(language, "progressTrend.evening")}
                    language={language}
                  />

                  {day.quranStatus !== undefined && (
                    <WeekStatusCell
                      future={day.dayKey > todayKey}
                      done={day.quranStatus === "complete"}
                      label={t(language, "progressTrend.quran")}
                      language={language}
                    />
                  )}

                  <WeekStatusCell
                    future={day.dayKey > todayKey}
                    done={day.sleepStatus === "complete"}
                    label={t(language, "progressTrend.sleep")}
                    language={language}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/20 border border-success text-success">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{t(language, "progress.complete")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full border-2 border-border-control" />
            <span>{t(language, "progress.missed")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true">—</span>
            <span>{t(language, "progressTrend.upcoming")}</span>
          </div>
        </div>

        {/* Routine comparison disclosure inside the unified card */}
        <details className="mt-4 border-t border-border pt-1">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            {t(language, "progressTrend.compareRoutines")}
          </summary>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            {t(language, "progressTrend.elapsedDaysHint")}
          </p>
          <div className="space-y-4">
            {(["morning", "evening", "sleep"] as const).map((routine) => {
              const elapsed = weekStats.days.filter((day) => day.dayKey <= todayKey);
              const completed = elapsed.filter((day) => day[`${routine}Status`] === "complete").length;
              const label = t(language, `progressTrend.${routine}`);
              const value = elapsed.length
                ? t(language, "progressTrend.recordedDays", {
                    done: formatNumerals(completed, language),
                    total: formatNumerals(elapsed.length, language),
                  })
                : t(language, "progressTrend.upcoming");
              return (
                <div key={routine}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span className="font-bold text-foreground">{label}</span>
                    <bdi className="text-xs font-semibold text-muted-foreground">{value}</bdi>
                  </div>
                  <div
                    role="img"
                    aria-label={`${label}: ${value}`}
                    className="h-2.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${elapsed.length ? (completed / elapsed.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </details>

        {weeklyGoalDays && (
          <div className="mt-4 border-t border-border pt-4" aria-labelledby="progress-weekly-goal">
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-3">
              <h3 id="progress-weekly-goal" className="text-subtitle font-black text-foreground">
                {t(language, "progressPanel.weeklyGoal")}
              </h3>
              <p className="text-label font-bold text-muted-foreground">
                {t(language, "progressPanel.goalProgress", {
                  done: formatNumerals(Math.min(activeDays, weeklyGoalDays), language),
                  goal: formatNumerals(weeklyGoalDays, language),
                })}
              </p>
            </div>
            <ProgressBar
              value={Math.min(activeDays, weeklyGoalDays)}
              max={weeklyGoalDays}
              height={8}
              trackColor="var(--muted)"
              direction={isArabic ? "rtl" : "ltr"}
              aria-label={t(language, "progressPanel.goalProgress", {
                done: formatNumerals(Math.min(activeDays, weeklyGoalDays), language),
                goal: formatNumerals(weeklyGoalDays, language),
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MONTH VIEW (CALENDAR MATRIX & DAY DETAILS BREAKDOWN)
// ────────────────────────────────────────────────────────────────────────────
export function ProgressMonthView({
  language,
  targetYear,
  targetMonth,
  referenceDate,
  calendarType = "gregorian",
  dailyCompletions = [],
  now = new Date(),
  progressDayStartHour = 0,
}: {
  language: AppLanguage;
  now?: Date;
  progressDayStartHour?: number;
  targetYear?: number;
  targetMonth?: number;
  referenceDate?: Date;
  calendarType?: CalendarType;
  dailyCompletions?: import("../types").DailyCollectionCompletion[];
}) {
  const isArabic = isAr(language);
  const completionIndex = useMemo(() => createDailyCompletionIndex(dailyCompletions), [dailyCompletions]);

  const resolvedReferenceDate = useMemo(
    () =>
      referenceDate ?? new Date(targetYear ?? new Date().getFullYear(), targetMonth ?? new Date().getMonth(), 15, 12),
    [referenceDate, targetMonth, targetYear],
  );
  const period = useMemo(
    () => getCalendarMonthPeriod(resolvedReferenceDate, calendarType, language),
    [calendarType, language, resolvedReferenceDate],
  );

  const trend = useMemo(
    () =>
      buildProgressTrend(
        dailyCompletions,
        Array.from({ length: Math.ceil(period.dates.length / 7) }, (_, index) => ({
          label:
            formatNumerals(period.dayNumbers[index * 7] ?? 1, language) +
            "–" +
            formatNumerals(period.dayNumbers[Math.min(index * 7 + 6, period.dates.length - 1)] ?? 1, language),
          dates: period.dates.slice(index * 7, index * 7 + 7),
        })),
        now,
        progressDayStartHour,
      ),
    [dailyCompletions, period, language, now, progressDayStartHour],
  );

  const monthStats = useMemo(
    () =>
      calendarType === "gregorian" && targetYear !== undefined && targetMonth !== undefined && !referenceDate
        ? getMonthDetailedStats(completionIndex, targetYear, targetMonth)
        : getMonthDetailedStatsForDates(completionIndex, period.dates, period.dayNumbers),
    [calendarType, completionIndex, period, referenceDate, targetMonth, targetYear],
  );

  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const defaultSelectedDay =
    monthStats.days.find((day) => day.dayKey === todayKey)?.dayNum ?? monthStats.days[0]?.dayNum ?? 1;
  const [selectedDayNum, setSelectedDayNum] = useState<number>(defaultSelectedDay);
  const [monthView, setMonthView] = useState<"trend" | "calendar">("trend");

  useEffect(() => {
    setSelectedDayNum(defaultSelectedDay);
  }, [defaultSelectedDay, period.startDate]);

  const selectedDayRecord = useMemo(
    () => monthStats.days.find((d) => d.dayNum === selectedDayNum) || monthStats.days[0],
    [monthStats.days, selectedDayNum],
  );

  const calendarHintId = useId();
  const firstDayOffset = period.startDate.getDay();
  const offset = isArabic ? (firstDayOffset + 1) % 7 : firstDayOffset;

  const weekdays = isArabic
    ? [
        t(language, "progress.weekdaySaturday"),
        t(language, "progress.weekdaySunday"),
        t(language, "progress.weekdayMonday"),
        t(language, "progress.weekdayTuesday"),
        t(language, "progress.weekdayWednesday"),
        t(language, "progress.weekdayThursday"),
        t(language, "progress.weekdayFriday"),
      ]
    : [
        t(language, "progress.weekdaySunday"),
        t(language, "progress.weekdayMonday"),
        t(language, "progress.weekdayTuesday"),
        t(language, "progress.weekdayWednesday"),
        t(language, "progress.weekdayThursday"),
        t(language, "progress.weekdayFriday"),
        t(language, "progress.weekdaySaturday"),
      ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 fade-in" dir={isArabic ? "rtl" : "ltr"}>
      <div role="group" aria-label={t(language, "progressTrend.monthView")} className="flex flex-wrap gap-2">
        {(["trend", "calendar"] as const).map((view) => (
          <button
            key={view}
            type="button"
            aria-pressed={monthView === view}
            onClick={() => setMonthView(view)}
            className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${monthView === view ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground"}`}
          >
            {t(language, view === "trend" ? "progressTrend.trendView" : "progressTrend.calendarDetails")}
          </button>
        ))}
      </div>
      {monthView === "trend" && (
        <ProgressTrendChart language={language} points={trend} interval="weekly" testId="month-weekly-chart" />
      )}
      <div hidden={monthView !== "calendar"}>
        {/* Main Month View: Calendar Grid + Selected Day Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Calendar Grid Card (2 Columns on desktop) */}
          <div
            data-testid="garden-month-calendar"
            className="rounded-2xl border border-border bg-card p-4 md:col-span-2"
          >
            <h2 className="mb-3 text-subtitle font-bold text-foreground">{t(language, "progressTrend.title")}</h2>
            <p id={calendarHintId} className="mb-3 text-xs leading-5 text-muted-foreground">
              {t(language, "progress.calendarScrollHint")}
            </p>
            <div
              role="region"
              aria-label={t(language, "progress.calendarDates")}
              aria-describedby={calendarHintId}
              className="overflow-x-auto pb-2"
            >
              <div className="min-w-[20rem]">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-2 text-center">
                  {weekdays.map((day) => (
                    /* Steps down on a phone and clips rather than pushing the column
                 open: the longest Arabic weekday needs 44px in a 40px cell, and
                 Intl's "short" form for Arabic is the full word, so there is no
                 shorter label to fall back on. */
                    <div key={day} className="truncate text-micro font-bold text-muted-foreground py-1 sm:text-xs">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`offset-${i}`} className="aspect-square" />
                  ))}

                  {monthStats.days.map((day) => {
                    const isSelected = day.dayNum === selectedDayNum;
                    const isFuture = day.dayKey > todayKey;
                    const isPalm = !isFuture && day.isPalm;
                    const count = isFuture ? 0 : day.completedCount;

                    return (
                      <button
                        type="button"
                        key={day.dayKey}
                        onClick={() => setSelectedDayNum(day.dayNum)}
                        disabled={isFuture}
                        aria-label={t(language, "progress.monthDayAria", {
                          day: formatNumerals(day.dayNum, language),
                          status: isFuture
                            ? t(language, "progressTrend.upcoming")
                            : isPalm
                              ? t(language, "progress.monthDayComplete")
                              : count > 0
                                ? t(language, "progress.monthDayPartial", {
                                    count: formatNumerals(count, language),
                                    total: formatNumerals(3, language),
                                  })
                                : t(language, "progress.missed"),
                        })}
                        aria-pressed={isSelected}
                        className={`flex min-h-11 flex-col items-center justify-center aspect-square rounded-xl border transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          isFuture
                            ? "border-transparent bg-transparent opacity-30 text-muted-foreground"
                            : isSelected
                              ? "border-primary ring-2 ring-primary ring-offset-2 bg-primary/20 z-10"
                              : isPalm
                                ? "bg-success/20 border-success/30 text-success font-bold"
                                : count > 0
                                  ? count === 2
                                    ? "bg-primary/30 border-primary/50 text-foreground font-semibold"
                                    : "bg-primary/10 border-primary/30 text-foreground font-medium"
                                  : "bg-muted/30 border-border text-muted-foreground/60 hover:bg-muted/60"
                        }`}
                      >
                        <span className="text-micro sm:text-xs font-bold leading-tight">
                          {formatNumerals(day.dayNum, language)}
                        </span>
                        <div className="flex h-3.5 items-center justify-center mt-0.5">
                          {isPalm ? (
                            <Check size={12} strokeWidth={3} className="text-success" />
                          ) : count > 0 ? (
                            <div className="flex items-center gap-0.5" aria-hidden="true">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className={`size-1 rounded-full ${
                                    i < count ? "bg-primary" : "bg-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-micro text-muted-foreground/40 leading-none">-</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Grid Legend */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-4 text-micro font-bold text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Check size={12} strokeWidth={3} className="text-success" />
                    <span>{t(language, "progress.complete")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <bdi>
                      {formatRatio(1, 3, language)} – {formatRatio(2, 3, language)}
                    </bdi>
                    <span>{t(language, "progress.partial")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{t(language, "progress.missed")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>— {t(language, "progressTrend.upcoming")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Day Details & Monthly Insight Card (1 Column on desktop) */}
          <div className="flex flex-col gap-4">
            {/* Day Details Card without cards-in-card */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="min-w-0 flex-1">
                  <h2
                    data-testid="progress-selected-day-heading"
                    className="block max-w-full text-subtitle font-black text-foreground"
                  >
                    {t(language, "progress.selectedDayDetails", {
                      day: formatNumerals(selectedDayNum, language),
                    })}
                  </h2>
                  <span className="text-micro font-semibold text-muted-foreground">{selectedDayRecord?.dayKey}</span>
                </div>
                <Calendar size={18} className="text-primary" />
              </div>

              {/* Status rows - clean divided list without cards within cards */}
              <div className="divide-y divide-border/30">
                {/* Morning Status */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Sunrise size={16} className="text-primary" />
                    <span className="text-label font-bold text-foreground">{t(language, "progress.morningAzkar")}</span>
                  </div>
                  {selectedDayRecord?.categories.includes("morning") ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                      <Check size={13} strokeWidth={3} />
                      {t(language, "progress.done")}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t(language, "progress.missed")}
                    </span>
                  )}
                </div>

                {/* Evening Status */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Sunset size={16} className="text-evening" />
                    <span className="text-label font-bold text-foreground">{t(language, "progress.eveningAzkar")}</span>
                  </div>
                  {selectedDayRecord?.categories.includes("evening") ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                      <Check size={13} strokeWidth={3} />
                      {t(language, "progress.done")}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t(language, "progress.missed")}
                    </span>
                  )}
                </div>

                {/* Sleep Status */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <MoonStar size={16} className="text-sleep" />
                    <span className="text-label font-bold text-foreground">{t(language, "progress.sleepAzkar")}</span>
                  </div>
                  {selectedDayRecord?.categories.includes("before_sleep") ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                      <Check size={13} strokeWidth={3} />
                      {t(language, "progress.done")}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t(language, "progress.missed")}
                    </span>
                  )}
                </div>

                {/* Post-Prayer Status */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" />
                    <span className="text-label font-bold text-foreground">
                      {t(language, "progress.postPrayerAzkar")}
                    </span>
                  </div>
                  {selectedDayRecord?.categories.includes("after_prayer") ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                      <Check size={13} strokeWidth={3} />
                      {t(language, "progress.done")}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t(language, "progress.missed")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// YEAR VIEW (ANNUAL BAR CHART, QUICK GLANCE & 12 MINI HEATMAPS)
// ────────────────────────────────────────────────────────────────────────────
export function ProgressYearView({
  language,
  targetYear = new Date().getFullYear(),
  referenceDate,
  calendarType = "gregorian",
  dailyCompletions = [],
  now = new Date(),
  progressDayStartHour = 0,
  onSelectMonth,
}: {
  language: AppLanguage;
  targetYear?: number;
  referenceDate?: Date;
  calendarType?: CalendarType;
  dailyCompletions?: import("../types").DailyCollectionCompletion[];
  now?: Date;
  progressDayStartHour?: number;
  onSelectMonth?: (date: Date) => void;
}) {
  const resolvedReferenceDate = useMemo(
    () => referenceDate ?? new Date(targetYear, 6, 15, 12),
    [referenceDate, targetYear],
  );
  const periods = useMemo(
    () => getCalendarYearPeriods(resolvedReferenceDate, calendarType, language),
    [resolvedReferenceDate, calendarType, language],
  );
  const points = useMemo(
    () =>
      buildProgressTrend(
        dailyCompletions,
        periods.map((period) => ({ label: period.monthLabel, dates: period.dates })),
        now,
        progressDayStartHour,
      ),
    [dailyCompletions, periods, now, progressDayStartHour],
  );
  return (
    <div className="mx-auto w-full" dir={language === "ar" ? "rtl" : "ltr"}>
      <ProgressTrendChart points={points} language={language} onExplore={onSelectMonth} testId="year-monthly-chart" />
    </div>
  );
}
