import React, { useEffect, useState, useMemo } from "react";
import { formatNumerals, formatRatio } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, CategoryId } from "../types";
import {
  getWeekGardenStats,
  getMonthDetailedStats,
  getMonthDetailedStatsForDates,
  getYearDetailedStats,
  getYearDetailedStatsForPeriods,
  createDailyCompletionIndex,
} from "../gardenViews";
import { getCalendarMonthPeriod, getCalendarYearPeriods, type CalendarType } from "../calendarPeriods";
import { type GardenSummary } from "../progress";
import { Zap, Check, CheckCircle2, Calendar, Sun, Moon, Star, Sprout, Sparkles } from "./icons";

function isAr(language: AppLanguage) {
  return language === "ar";
}

function getCategoryName(category: CategoryId | null | undefined, language: AppLanguage) {
  if (!category) return t(language, "progress.none");
  switch (category) {
    case "morning":
      return t(language, "progress.morningAzkar");
    case "evening":
      return t(language, "progress.eveningAzkar");
    case "before_sleep":
      return t(language, "progress.sleepAzkar");
    case "after_prayer":
      return t(language, "progress.postPrayerAzkar");
    default:
      return t(language, "progress.otherAzkar");
  }
}

type DayGroupCardStatus = "completed" | "pending";

function MainDhikrGroupCard({
  name,
  icon,
  status,
  completedLabel,
  pendingLabel,
  onPress,
  compact = false,
  subItems,
}: {
  name: string;
  icon: React.ReactNode;
  status: DayGroupCardStatus;
  completedLabel: string;
  pendingLabel: string;
  onPress?: () => void;
  compact?: boolean;
  subItems?: { id: string; name: string; isCompleted: boolean }[];
}) {
  const isCompleted = status === "completed";
  const statusLabel = isCompleted ? completedLabel : pendingLabel;

  return (
    <button
      type="button"
      onClick={onPress}
      className={`group relative flex w-full rounded-3xl border transition-[background-color,border-color,box-shadow] duration-standard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] ${
        compact
          ? "min-h-[6.5rem] items-center gap-3 px-4 py-4 text-start sm:min-h-[11rem] sm:flex-col sm:justify-between sm:gap-4 sm:px-4 sm:py-5 sm:text-center"
          : "min-h-[9.5rem] flex-col items-center justify-between px-3 py-4 text-center"
      } ${
        isCompleted
          ? compact
            ? "border-primary/55 bg-primary/15 text-white shadow-raised"
            : "border-primary/55 bg-primary/10 text-foreground shadow-raised"
          : compact
            ? "border-white/10 bg-black/30 text-white shadow-raised hover:border-white/20 hover:bg-black/40"
            : "border-border bg-background text-foreground shadow-raised hover:border-primary/45 hover:bg-muted"
      }`}
      aria-label={`${name} - ${statusLabel}`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border transition-colors ${
          compact ? "size-11 sm:size-14" : "size-14"
        } ${
          isCompleted
            ? compact
              ? "border-primary/50 bg-primary/20 text-primary"
              : "border-primary/50 bg-primary/15 text-primary"
            : compact
              ? "border-white/10 bg-black/40 text-on-media-muted"
              : "border-border bg-muted text-primary"
        }`}
      >
        {icon}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col gap-3 ${compact ? "items-start sm:items-center" : "w-full items-center"}`}
      >
        <span className="text-[1rem] font-black leading-relaxed text-inherit sm:text-[1.0625rem]">{name}</span>
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[0.75rem] font-bold ${
            isCompleted
              ? "bg-success text-success-foreground shadow-sm"
              : compact
                ? "border border-white/5 bg-black/45 text-white/60"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {statusLabel}
        </span>

        {subItems && subItems.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
            {subItems.map((item) => (
              <span
                key={item.id}
                role="img"
                aria-label={item.name}
                className={`inline-flex h-1.5 w-4 rounded-full ${item.isCompleted ? "bg-success" : "bg-muted-foreground/45"}`}
              />
            ))}
          </div>
        )}
      </div>

      {isCompleted ? (
        <span className="absolute end-3 top-3 flex size-6 items-center justify-center rounded-full border border-success bg-success text-success-foreground shadow-md sm:-end-1.5 sm:top-auto sm:bottom-3">
          <Check size={13} strokeWidth={3} aria-hidden="true" />
        </span>
      ) : null}
    </button>
  );
}

const GREGORIAN_MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ────────────────────────────────────────────────────────────────────────────
// DAY VIEW (WIRD CARD & DAILY ROUTINE DASHBOARD)
// ────────────────────────────────────────────────────────────────────────────
export function ProgressDayView({
  summary,
  language,
  dynamicSubtitle,
  onSelectCategory,
  visibleCategoryIds,
  headingLevel = 2,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  dynamicSubtitle: string;
  onSelectCategory?: (categoryId: CategoryId) => void;
  /**
   * Restricts which routines are listed. Home shows only the three
   * time-of-day routines; after-prayer azkar are getting their own card, and
   * the Progress screen still lists all four. This is display-only — palm and
   * leaf progress keep counting every main collection.
   */
  visibleCategoryIds?: readonly CategoryId[];
  /** Home nests this card below its own section heading; Progress owns an h2. */
  headingLevel?: 2 | 3;
}) {
  const isArabic = isAr(language);
  const completedToday = summary.today.completedCategories;

  const allCategories = [
    {
      id: "morning" as const,
      name: t(language, "progress.morningAzkar"),
      icon: <Sun size={20} />,
    },
    {
      id: "evening" as const,
      name: t(language, "progress.eveningAzkar"),
      icon: <Sun size={20} />,
    },
    {
      id: "before_sleep" as const,
      name: t(language, "progress.sleepAzkar"),
      icon: <Moon size={20} />,
    },
    {
      id: "after_prayer" as const,
      name: t(language, "progress.postPrayerAzkar"),
      icon: <Sparkles size={20} />,
    },
  ];

  const categories = visibleCategoryIds
    ? allCategories.filter((category) => visibleCategoryIds.includes(category.id))
    : allCategories;
  const isHomeSubset = visibleCategoryIds !== undefined;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  // Keep the semantic order stable. The RTL grid places Morning at the right
  // edge while preserving the same keyboard and assistive-technology order.
  const displayCategories = categories;
  const completedCount = categories.filter((category) => completedToday.includes(category.id)).length;

  return (
    // h-full/flex-1 let Home stretch this card to the hero's height. On the
    // Progress screen the parent has no definite height, so both resolve to
    // auto and nothing changes there.
    <div
      className={`mx-auto flex w-full max-w-[44rem] flex-col gap-4 fade-in xl:max-w-[72rem] ${
        isHomeSubset ? "h-full min-h-[19rem] sm:min-h-[21rem] md:min-h-[22rem]" : ""
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div
        className={`flex w-full flex-col rounded-3xl border p-5 shadow-raised sm:p-7 md:p-8 ${
          isHomeSubset
            ? "flex-1 border-white/15 bg-on-media-surface/82 backdrop-blur-lg"
            : "border-border bg-card text-foreground"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Heading
              data-testid="progress-primary-heading"
              className={`block max-w-full truncate whitespace-nowrap text-[1.25rem] font-black tracking-tight sm:text-[1.375rem] md:text-[1.5rem] ${
                isHomeSubset ? "text-on-media-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-foreground"
              }`}
              dir="auto"
            >
              {t(language, "progress.todayWird")}
            </Heading>
            <p
              className={`mt-1 text-[0.8125rem] font-semibold sm:text-[0.875rem] ${
                isHomeSubset ? "text-on-media-muted" : "text-muted-foreground"
              }`}
              dir="auto"
            >
              {dynamicSubtitle}
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[0.8125rem] font-black ${
              isHomeSubset
                ? "border-on-media/16 bg-black/45 text-on-media"
                : "border-border-control bg-muted text-foreground"
            }`}
          >
            <span>{formatNumerals(completedCount, language)}</span>
            <span aria-hidden="true">/</span>
            <span>{formatNumerals(categories.length, language)}</span>
          </div>
        </div>

        <div
          className={`mt-5 grid flex-1 grid-cols-1 gap-2.5 sm:mt-6 sm:gap-3 md:gap-4 ${
            isHomeSubset ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4"
          }`}
        >
          {displayCategories.map((col) => {
            const isDone = completedToday.includes(col.id);
            const completedPrayers = summary.today.completedAfterPrayers ?? [];
            const subItems =
              col.id === "after_prayer"
                ? [
                    {
                      id: "fajr",
                      name: t(language, "notifications.fajr"),
                      isCompleted: completedPrayers.includes("fajr"),
                    },
                    {
                      id: "dhuhr",
                      name: t(language, "notifications.dhuhr"),
                      isCompleted: completedPrayers.includes("dhuhr"),
                    },
                    {
                      id: "asr",
                      name: t(language, "notifications.asr"),
                      isCompleted: completedPrayers.includes("asr"),
                    },
                    {
                      id: "maghrib",
                      name: t(language, "notifications.maghrib"),
                      isCompleted: completedPrayers.includes("maghrib"),
                    },
                    {
                      id: "isha",
                      name: t(language, "notifications.isha"),
                      isCompleted: completedPrayers.includes("isha"),
                    },
                  ]
                : undefined;

            return (
              <MainDhikrGroupCard
                key={col.id}
                name={col.name}
                icon={<>{col.icon}</>}
                status={isDone ? "completed" : "pending"}
                completedLabel={t(language, "progress.completed")}
                pendingLabel={t(language, "progress.notCompleted")}
                onPress={() => onSelectCategory?.(col.id)}
                compact={Boolean(visibleCategoryIds)}
                subItems={subItems}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// WEEK VIEW (WEEKLY COMMITMENT MATRIX & ROUTINE PROGRESS BARS)
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
}: {
  done: boolean;
  label: string;
  language: AppLanguage;
  subItems?: boolean[];
}) {
  const status = done ? t(language, "progress.completed") : t(language, "progress.notCompleted");
  return (
    <td className="py-3 px-2">
      <div className="flex justify-center">
        <span className="sr-only">{`${label}: ${status}`}</span>
        {subItems ? (
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
          <div aria-hidden="true" className="w-6 h-6 rounded-full border-2 border-primary/50" />
        )}
      </div>
    </td>
  );
}

export function ProgressWeekView({
  language,
  dailyCompletions = [],
  referenceDate = new Date(),
}: {
  language: AppLanguage;
  dailyCompletions?: import("../types").DailyCollectionCompletion[];
  referenceDate?: Date;
}) {
  const isArabic = isAr(language);
  const completionIndex = useMemo(() => createDailyCompletionIndex(dailyCompletions), [dailyCompletions]);

  const weekStats = useMemo(
    () => getWeekGardenStats(completionIndex, referenceDate, language),
    [completionIndex, referenceDate, language],
  );

  const mostMissedName = getCategoryName(weekStats.mostMissedRoutine, language);

  return (
    <div
      className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 fade-in xl:max-w-[72rem]"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Most Missed Routine Card */}
        <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Moon size={20} className="text-primary mb-1" />
          <span className="text-[0.75rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.mostMissed")}
          </span>
          <span className="text-[0.875rem] font-black text-foreground truncate max-w-full">{mostMissedName}</span>
        </div>

        {/* Best Streak Card */}
        <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Zap className="h-5 w-5 text-primary fill-primary/20 mb-1" />
          <span className="text-[0.75rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.bestStreak")}
          </span>
          <span className="text-[0.9375rem] font-black text-foreground">
            {formatNumerals(weekStats.bestStreakDays, language)} {t(language, "progress.days")}
          </span>
        </div>

        {/* Completed Days Card */}
        <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <CheckCircle2 size={20} className="text-success mb-1" />
          <span className="text-[0.75rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.completedDays")}
          </span>
          <span className="text-[0.9375rem] font-black text-foreground">
            {formatNumerals(weekStats.completedDaysCount, language)} {t(language, "progress.ofSeven")}
          </span>
        </div>
      </div>

      {/* Main Weekly Commitment Matrix Card */}
      <div className="w-full rounded-3xl bg-card border border-border/40 p-5 md:p-6 shadow-raised">
        <h2
          data-testid="progress-primary-heading"
          className="mb-4 block max-w-full truncate whitespace-nowrap text-start text-[1rem] font-black text-foreground sm:text-[1.125rem] md:text-[1.25rem]"
        >
          {t(language, "progress.weekCommitment")}
        </h2>

        {/* Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="border-b border-white/30 dark:border-white/10">
                <th scope="col" className="py-2.5 px-2 text-start text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} />
                    <span>{t(language, "progress.day")}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Sun size={15} className="text-success" />
                    <span>{t(language, "progress.morningShort")}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Sun size={15} className="text-primary" />
                    <span>{t(language, "progress.eveningShort")}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Moon size={15} className="text-sleep" />
                    <span>{t(language, "progress.sleepShort")}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={15} className="text-success" />
                    <span>{t(language, "progress.postPrayerShort")}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-white/5">
              {weekStats.days.map((day) => (
                <tr key={day.dayKey} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-start">
                    <span
                      className={`text-[0.875rem] ${
                        day.isToday ? "font-black text-primary" : "font-bold text-foreground"
                      }`}
                    >
                      {day.weekdayName}
                    </span>
                  </td>

                  <WeekStatusCell
                    done={day.morningStatus === "complete"}
                    label={t(language, "progress.morningShort")}
                    language={language}
                  />

                  <WeekStatusCell
                    done={day.eveningStatus === "complete"}
                    label={t(language, "progress.eveningShort")}
                    language={language}
                  />

                  <WeekStatusCell
                    done={day.sleepStatus === "complete"}
                    label={t(language, "progress.sleepShort")}
                    language={language}
                  />

                  <WeekStatusCell
                    done={day.afterPrayerStatus === "complete"}
                    label={t(language, "progress.postPrayerShort")}
                    language={language}
                    subItems={[
                      day.completedAfterPrayers.includes("fajr"),
                      day.completedAfterPrayers.includes("dhuhr"),
                      day.completedAfterPrayers.includes("asr"),
                      day.completedAfterPrayers.includes("maghrib"),
                      day.completedAfterPrayers.includes("isha"),
                    ]}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-white/20 dark:border-white/10 flex items-center justify-center gap-6 text-[0.75rem] font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/20 border border-success text-success">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{t(language, "progress.complete")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-info/20 border border-info text-info">
              <span className="text-[0.625rem] font-black">-</span>
            </div>
            <span>{t(language, "progress.partial")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-primary" />
            <span>{t(language, "progress.missed")}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Insight Card & Routine Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insight Card */}
        <div className="p-5 rounded-3xl bg-card border border-success shadow-raised flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/20 border border-success/40 text-success shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="mb-1 block max-w-full truncate whitespace-nowrap text-[0.9375rem] font-black leading-snug text-foreground">
              {t(language, "garden.weekCompletedDays", {
                count: formatNumerals(weekStats.completedDaysCount, language),
              })}
            </h3>
            <p className="text-[0.8125rem] font-semibold text-muted-foreground">
              {weekStats.bestRoutine
                ? t(language, "garden.weekBestRoutine", {
                    routine: getCategoryName(weekStats.bestRoutine, language),
                  })
                : t(language, "garden.noRecordedActivity")}
            </p>
          </div>
        </div>

        {/* Routine Summary Progress Bars Card */}
        <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-raised flex flex-col justify-center gap-3">
          <h3 className="mb-1 block max-w-full truncate whitespace-nowrap text-[0.875rem] font-black text-foreground">
            {t(language, "progress.weeklySummary")}
          </h3>

          {/* Morning Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.morningCompletedCount, language)} {t(language, "progress.ofSeven")}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${Math.round((weekStats.morningCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{t(language, "progress.morningShort")}</span>
              <Sun size={14} className="text-success" />
            </div>
          </div>

          {/* Evening Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.eveningCompletedCount, language)} {t(language, "progress.ofSeven")}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.round((weekStats.eveningCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{t(language, "progress.eveningShort")}</span>
              <Sun size={14} className="text-primary" />
            </div>
          </div>

          {/* Sleep Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.sleepCompletedCount, language)} {t(language, "progress.ofSeven")}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-sleep rounded-full"
                style={{ width: `${Math.round((weekStats.sleepCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{t(language, "progress.sleepShort")}</span>
              <Moon size={14} className="text-sleep" />
            </div>
          </div>

          {/* Post-Prayer Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.afterPrayerCompletedCount, language)} {t(language, "progress.ofSeven")}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${Math.round((weekStats.afterPrayerCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{t(language, "progress.postPrayerShort")}</span>
              <CheckCircle2 size={14} className="text-success" />
            </div>
          </div>
        </div>
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
}: {
  language: AppLanguage;
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

  const monthStats = useMemo(
    () =>
      calendarType === "gregorian" && targetYear !== undefined && targetMonth !== undefined && !referenceDate
        ? getMonthDetailedStats(completionIndex, targetYear, targetMonth)
        : getMonthDetailedStatsForDates(completionIndex, period.dates, period.dayNumbers),
    [calendarType, completionIndex, period, referenceDate, targetMonth, targetYear],
  );

  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
    new Date().getDate(),
  ).padStart(2, "0")}`;
  const defaultSelectedDay =
    monthStats.days.find((day) => day.dayKey === todayKey)?.dayNum ?? monthStats.days[0]?.dayNum ?? 1;
  const [selectedDayNum, setSelectedDayNum] = useState<number>(defaultSelectedDay);

  useEffect(() => {
    setSelectedDayNum(defaultSelectedDay);
  }, [defaultSelectedDay, period.startDate]);

  const selectedDayRecord = useMemo(
    () => monthStats.days.find((d) => d.dayNum === selectedDayNum) || monthStats.days[0],
    [monthStats.days, selectedDayNum],
  );

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
    <div
      className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 fade-in xl:max-w-[72rem]"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Best Routine */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Sun size={20} className="text-primary mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.bestRoutine")}
          </span>
          <span className="text-[0.8125rem] font-black text-foreground truncate max-w-full">
            {getCategoryName(monthStats.bestRoutine, language)}
          </span>
        </div>

        {/* Longest Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Zap className="h-5 w-5 text-primary fill-primary/20 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.longestStreak")}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(monthStats.longestStreak, language)} {t(language, "progress.days")}
          </span>
        </div>

        {/* Full Days */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Calendar size={20} className="text-success mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.fullDays")}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(monthStats.fullDaysCount, language)}
          </span>
        </div>

        {/* Completion Rate */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Sprout size={20} className="text-success mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.completionRate")}
          </span>
          <span className="text-[0.875rem] font-black text-primary">
            %{formatNumerals(monthStats.completionRate, language)}
          </span>
        </div>
      </div>

      {/* Main Month View: Calendar Grid + Selected Day Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calendar Grid Card (2 Columns on desktop) */}
        <div
          data-testid="garden-month-calendar"
          className="md:col-span-2 p-5 rounded-3xl bg-card border border-border/40 shadow-raised"
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {weekdays.map((day) => (
              <div key={day} className="text-[0.75rem] font-bold text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`offset-${i}`} className="aspect-square" />
            ))}

            {monthStats.days.map((day) => {
              const isSelected = day.dayNum === selectedDayNum;
              const isPalm = day.isPalm;
              const count = day.completedCount;

              return (
                <button
                  type="button"
                  key={day.dayKey}
                  onClick={() => setSelectedDayNum(day.dayNum)}
                  aria-label={t(language, "progress.monthDayAria", {
                    day: formatNumerals(day.dayNum, language),
                    status: isPalm
                      ? t(language, "progress.monthDayComplete")
                      : count > 0
                        ? t(language, "progress.monthDayPartial", { count: formatNumerals(count, language) })
                        : t(language, "progress.monthDayUnstarted"),
                  })}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/50 bg-primary/20 scale-105 z-10"
                      : isPalm
                        ? "bg-success/15 border-success/30 text-success"
                        : count > 0
                          ? "bg-info/10 border-info/30 text-info"
                          : "bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10 text-muted-foreground/60"
                  }`}
                >
                  <span className="text-[0.6875rem] sm:text-[0.75rem] font-bold">
                    {formatNumerals(day.dayNum, language)}
                  </span>
                  <div className="flex h-4 items-center justify-center mt-0.5">
                    {isPalm ? (
                      <Check size={12} strokeWidth={3} className="text-success" />
                    ) : count > 0 ? (
                      <span className="text-[0.5625rem] font-extrabold text-info">
                        {formatRatio(count, 4, language)}
                      </span>
                    ) : (
                      <span className="text-[0.625rem] text-muted-foreground/40">-</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Grid Legend */}
          <div className="mt-4 pt-3 border-t border-white/20 dark:border-white/10 flex items-center justify-center gap-4 text-[0.6875rem] font-bold text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Check size={12} strokeWidth={3} className="text-success" />
              <span>{t(language, "progress.complete")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-info" />
              <span>{t(language, "progress.partialRange")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border border-primary" />
              <span>{t(language, "progress.unstarted")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>- {t(language, "progress.noData")}</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details & Monthly Insight Card (1 Column on desktop) */}
        <div className="flex flex-col gap-4">
          {/* Day Details Card */}
          <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-raised flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/20 dark:border-white/10 pb-2">
              <div className="min-w-0 flex-1">
                <h2
                  data-testid="progress-primary-heading"
                  className="block max-w-full truncate whitespace-nowrap text-[0.9375rem] font-black text-foreground"
                >
                  {t(language, "progress.selectedDayDetails", {
                    day: formatNumerals(selectedDayNum, language),
                  })}
                </h2>
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                  {selectedDayRecord?.dayKey}
                </span>
              </div>
              <Calendar size={18} className="text-primary" />
            </div>

            {/* Morning Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-primary" />
                <span className="text-[0.8125rem] font-bold">{t(language, "progress.morningAzkar")}</span>
              </div>
              {selectedDayRecord?.categories.includes("morning") ? (
                <span className="text-[0.75rem] font-bold text-success">{t(language, "progress.done")}</span>
              ) : (
                <span className="text-[0.75rem] font-bold text-primary">{t(language, "progress.notDone")}</span>
              )}
            </div>

            {/* Evening Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-evening" />
                <span className="text-[0.8125rem] font-bold">{t(language, "progress.eveningAzkar")}</span>
              </div>
              {selectedDayRecord?.categories.includes("evening") ? (
                <span className="text-[0.75rem] font-bold text-success">{t(language, "progress.done")}</span>
              ) : (
                <span className="text-[0.75rem] font-bold text-primary">{t(language, "progress.notDone")}</span>
              )}
            </div>

            {/* Sleep Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-sleep" />
                <span className="text-[0.8125rem] font-bold">{t(language, "progress.sleepAzkar")}</span>
              </div>
              {selectedDayRecord?.categories.includes("before_sleep") ? (
                <span className="text-[0.75rem] font-bold text-success">{t(language, "progress.done")}</span>
              ) : (
                <span className="text-[0.75rem] font-bold text-primary">{t(language, "progress.notDone")}</span>
              )}
            </div>

            {/* Post-Prayer Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span className="text-[0.8125rem] font-bold">{t(language, "progress.postPrayerAzkar")}</span>
              </div>
              {selectedDayRecord?.categories.includes("after_prayer") ? (
                <span className="text-[0.75rem] font-bold text-success">{t(language, "progress.done")}</span>
              ) : (
                <span className="text-[0.75rem] font-bold text-primary">{t(language, "progress.notDone")}</span>
              )}
            </div>
          </div>

          {/* Month Improvement Insight */}
          <div className="p-4 rounded-3xl bg-card border border-success shadow-raised flex items-start gap-3">
            <Sprout size={20} className="text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="mb-1 block max-w-full truncate whitespace-nowrap text-[0.875rem] font-black text-foreground">
                {t(language, "garden.monthRecordTitle")}
              </h3>
              <p className="text-[0.75rem] font-semibold text-muted-foreground">
                {t(language, "garden.monthFullDays", {
                  count: formatNumerals(monthStats.fullDaysCount, language),
                })}
              </p>
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
}: {
  language: AppLanguage;
  targetYear?: number;
  referenceDate?: Date;
  calendarType?: CalendarType;
  dailyCompletions?: import("../types").DailyCollectionCompletion[];
}) {
  const isArabic = isAr(language);
  const completionIndex = useMemo(() => createDailyCompletionIndex(dailyCompletions), [dailyCompletions]);
  const resolvedReferenceDate = useMemo(
    () => referenceDate ?? new Date(targetYear, 6, 1, 12),
    [referenceDate, targetYear],
  );
  const yearPeriods = useMemo(
    () => getCalendarYearPeriods(resolvedReferenceDate, calendarType, language),
    [calendarType, language, resolvedReferenceDate],
  );

  const yearStats = useMemo(
    () =>
      calendarType === "gregorian" && !referenceDate
        ? getYearDetailedStats(completionIndex, targetYear)
        : getYearDetailedStatsForPeriods(completionIndex, yearPeriods),
    [calendarType, completionIndex, referenceDate, targetYear, yearPeriods],
  );

  const monthNames =
    calendarType === "gregorian" && !referenceDate
      ? isArabic
        ? yearPeriods.map((period) => period.monthLabel)
        : GREGORIAN_MONTH_NAMES_EN
      : yearPeriods.map((period) => period.monthLabel);
  const bestMonthName =
    yearStats.bestMonthIndex === null ? getCategoryName(null, language) : monthNames[yearStats.bestMonthIndex];

  return (
    <div
      className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 fade-in xl:max-w-[72rem]"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Completion Rate */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Sprout size={20} className="text-success mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.completionRate")}
          </span>
          <span className="text-[0.9375rem] font-black text-primary">
            %{formatNumerals(yearStats.overallCompletionRate, language)}
          </span>
        </div>

        {/* Longest Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Star size={20} className="text-primary mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.longestStreak")}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(yearStats.longestStreak, language)} {t(language, "progress.days")}
          </span>
        </div>

        {/* Current Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Zap className="h-5 w-5 text-primary fill-primary/20 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.currentStreak")}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(yearStats.currentStreak, language)} {t(language, "progress.days")}
          </span>
        </div>

        {/* Active Days */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Calendar size={20} className="text-success mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {t(language, "progress.activeDays")}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(yearStats.activeDays, language)} {t(language, "progress.activeSuffix")}
          </span>
        </div>
      </div>

      {/* Middle Section: Monthly Bar Chart + Quick Glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Completion Bar Chart (2 Columns on desktop) */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-card border border-border/40 shadow-raised flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h2
              data-testid="progress-primary-heading"
              className="block max-w-full truncate whitespace-nowrap text-[0.9375rem] font-black text-foreground"
            >
              {t(language, "progress.monthlyCompletionRate")}
            </h2>
          </div>
          <p className="text-[0.75rem] font-semibold text-muted-foreground mb-4">
            {t(language, "garden.yearChartHint")}
          </p>

          {/* Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-1.5 pt-6 pb-2 min-h-[140px]">
            {yearStats.months.map((m, idx) => {
              const rate = m.completionRate;
              const isBest = yearStats.bestMonthIndex !== null && idx === yearStats.bestMonthIndex;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span
                    className={`text-[0.625rem] font-black mb-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isBest ? "opacity-100 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    %{formatNumerals(rate, language)}
                  </span>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-t-lg h-[90px] flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-[height,background-color] duration-emphasis ${
                        isBest
                          ? "bg-primary shadow-md shadow-primary/30"
                          : "bg-primary/40 dark:bg-primary/30 group-hover:bg-primary/70"
                      }`}
                      style={{ height: `${rate}%` }}
                    />
                  </div>
                  <span className="text-[0.5625rem] font-bold text-muted-foreground mt-1.5 truncate max-w-full text-center">
                    {monthNames[idx]?.slice(0, isArabic ? 6 : 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Glance Card (1 Column on desktop) */}
        <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-raised flex flex-col justify-between gap-3">
          <h2 className="block max-w-full truncate whitespace-nowrap border-b border-white/20 pb-2 text-[0.9375rem] font-black text-foreground dark:border-white/10">
            {t(language, "progress.quickGlance")}
          </h2>

          {/* Best Month */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
            <div>
              <span className="block text-[0.6875rem] font-bold text-muted-foreground">
                {t(language, "progress.bestMonth")}
              </span>
              <span className="text-[0.875rem] font-black text-foreground">{bestMonthName}</span>
            </div>
            <Star size={18} className="text-primary" />
          </div>

          {/* Most Consistent Routine */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
            <div>
              <span className="block text-[0.6875rem] font-bold text-muted-foreground">
                {t(language, "progress.mostConsistent")}
              </span>
              <span className="text-[0.875rem] font-black text-foreground">
                {getCategoryName(yearStats.mostConsistentRoutine, language)}
              </span>
            </div>
            <Sun size={18} className="text-primary" />
          </div>

          {/* Total Azkar Completed */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
            <div>
              <span className="block text-[0.6875rem] font-bold text-muted-foreground">
                {t(language, "progress.totalCompleted")}
              </span>
              <span className="text-[0.875rem] font-black text-foreground">
                {formatNumerals(yearStats.totalCollections, language)}
              </span>
            </div>
            <CheckCircle2 size={18} className="text-success" />
          </div>
        </div>
      </div>

      {/* 12-Month Mini Heatmap Matrices */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {yearStats.months.map((m, idx) => {
          const isBest = yearStats.bestMonthIndex !== null && idx === yearStats.bestMonthIndex;
          const rate = m.completionRate;

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl bg-card border transition-colors ${
                isBest ? "border-success/60 ring-1 ring-success/40 bg-success/5 shadow-md" : "border-border/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 text-[0.75rem] font-extrabold">
                <span className="text-foreground truncate">{monthNames[idx]}</span>
                <span className="text-muted-foreground text-[0.6875rem]">%{formatNumerals(rate, language)}</span>
              </div>

              {/* Mini day grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {m.dayCells.slice(0, 28).map((cell) => (
                  <div
                    key={cell.dayNum}
                    className={`aspect-square rounded-[var(--ds-radius-micro)] ${
                      cell.isPalm || cell.level === 2
                        ? "bg-primary"
                        : cell.level === 1
                          ? "bg-primary/40"
                          : "bg-black/10 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Quote / Closing Prayer Card */}
      <div className="p-4 rounded-3xl bg-muted border border-border shadow-raised flex items-center justify-center text-center">
        <p className="text-[0.875rem] font-bold text-foreground">
          {yearStats.totalCollections > 0
            ? t(language, "garden.yearActivitySummary", {
                count: formatNumerals(yearStats.totalCollections, language),
              })
            : t(language, "garden.yearNoActivity")}
        </p>
      </div>
    </div>
  );
}
