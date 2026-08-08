import React, { useState, useMemo } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, CategoryId } from "../types";
import {
  getWeekGardenStats,
  getMonthDetailedStats,
  getYearDetailedStats,
  createDailyCompletionIndex,
} from "../gardenViews";
import { type GardenSummary } from "../progress";
import { GoldenLeafMark } from "./RoutineGarden";
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Calendar,
  Sun,
  Moon,
  Star,
  Sprout,
  Sparkles,
} from "./icons";

function isAr(language: AppLanguage) {
  return language === "ar";
}

function getCategoryName(category: CategoryId | null | undefined, language: AppLanguage) {
  const isArabic = isAr(language);
  if (!category) return isArabic ? "لا يوجد" : "None";
  switch (category) {
    case "morning":
      return isArabic ? "أذكار الصباح" : "Morning Azkar";
    case "evening":
      return isArabic ? "أذكار المساء" : "Evening Azkar";
    case "before_sleep":
      return isArabic ? "أذكار النوم" : "Sleep Azkar";
    case "after_prayer":
      return isArabic ? "أذكار ما بعد الصلاة" : "Post-Prayer Azkar";
    default:
      return isArabic ? "أذكار أخرى" : "Other Azkar";
  }
}

const HIJRI_MONTH_NAMES_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخر",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

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
}) {
  const isArabic = isAr(language);
  const completedToday = summary.today.completedCategories;

  const allCategories = [
    {
      id: "morning" as const,
      name: isArabic ? "أذكار الصباح" : "Morning Azkar",
      icon: <Sun size={20} className="text-amber-500" />,
    },
    {
      id: "evening" as const,
      name: isArabic ? "أذكار المساء" : "Evening Azkar",
      icon: <Sun size={20} className="text-orange-500" />,
    },
    {
      id: "before_sleep" as const,
      name: isArabic ? "أذكار النوم" : "Sleep Azkar",
      icon: <Moon size={20} className="text-indigo-400" />,
    },
    {
      id: "after_prayer" as const,
      name: isArabic ? "أذكار ما بعد الصلاة" : "After Prayer Azkar",
      icon: <Sparkles size={20} className="text-emerald-500" />,
    },
  ];

  const categories = visibleCategoryIds
    ? allCategories.filter((category) => visibleCategoryIds.includes(category.id))
    : allCategories;

  return (
    // h-full/flex-1 let Home stretch this card to the hero's height. On the
    // Progress screen the parent has no definite height, so both resolve to
    // auto and nothing changes there.
    <div className="flex h-full flex-col gap-4 w-full max-w-[44rem] mx-auto fade-in" dir={isArabic ? "rtl" : "ltr"}>
      {/* Main Today's Wird Container Card */}
      <div className="flex w-full flex-1 flex-col rounded-3xl bg-card border border-border/40 p-5 md:p-6 shadow-raised">
        {/* Title and subtitle */}
        <div className="flex flex-col items-center text-center mb-5">
          <h3 className="text-[1.375rem] md:text-[1.5rem] font-black text-foreground tracking-tight mb-1">
            {isArabic ? "وردك اليوم" : "Today's Wird"}
          </h3>
          <p className="text-[0.8125rem] sm:text-[0.875rem] font-semibold text-muted-foreground">{dynamicSubtitle}</p>
        </div>

        {/* Categories / Routines List */}
        <ul className="flex flex-col gap-2.5 w-full mb-4">
          {categories.map((col) => {
            const isDone = completedToday.includes(col.id);
            return (
              <li key={col.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.(col.id)}
                  className={`w-full min-h-[52px] flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] cursor-pointer ${
                    isDone
                      ? "bg-amber-500/10 border-amber-500/30 text-foreground shadow-2xs hover:bg-amber-500/15"
                      : "bg-muted/40 border-border/40 text-foreground hover:bg-white/60 dark:hover:bg-white/10"
                  }`}
                  aria-label={`${col.name} - ${isDone ? (isArabic ? "مكتملة" : "Completed") : isArabic ? "غير مكتملة" : "Not completed"}`}
                >
                  {/* Routine Icon + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 shadow-2xs shrink-0">
                      {col.icon}
                    </div>
                    <span className="text-[1rem] font-bold text-foreground truncate">{col.name}</span>
                  </div>

                  {/* Leaf Indicator + Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <GoldenLeafMark size={22} filled={isDone} />
                    <span className="text-muted-foreground/60">
                      {isArabic ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Motivational Quote Pill Banner */}
        {/* mt-auto so the banner sits at the card's foot when the card is
            stretched to match the hero, rather than leaving a gap below it. */}
        <div className="mt-auto w-full rounded-2xl border border-border/40 bg-muted/40 px-4 py-3 flex items-center justify-center text-center shadow-2xs backdrop-blur-md">
          <p className="text-[0.8125rem] sm:text-[0.875rem] font-bold text-foreground">
            {isArabic
              ? "« القليل الدائم، خير من الكثير المنقطع »"
              : "« Consistent small deeds are better than intermittent large ones »"}
          </p>
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
function WeekStatusCell({ done, label, isArabic }: { done: boolean; label: string; isArabic: boolean }) {
  const status = done ? (isArabic ? "مكتملة" : "Completed") : isArabic ? "غير مكتملة" : "Not completed";
  return (
    <td className="py-3 px-2">
      <div className="flex justify-center">
        <span className="sr-only">{`${label}: ${status}`}</span>
        {done ? (
          <div
            aria-hidden="true"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
          >
            <Check size={15} strokeWidth={3} />
          </div>
        ) : (
          <div aria-hidden="true" className="w-6 h-6 rounded-full border-2 border-amber-500/50" />
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
    <div className="flex flex-col gap-4 w-full max-w-[44rem] mx-auto fade-in" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Most Missed Routine Card */}
        <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Moon size={20} className="text-amber-500 mb-1" />
          <span className="text-[0.75rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أكثر ورد فاتك" : "Most missed"}
          </span>
          <span className="text-[0.875rem] font-black text-foreground truncate max-w-full">{mostMissedName}</span>
        </div>

        {/* Best Streak Card */}
        <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20 mb-1" />
          <span className="text-[0.75rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أفضل سلسلة" : "Best streak"}
          </span>
          <span className="text-[0.9375rem] font-black text-foreground">
            {formatNumerals(weekStats.bestStreakDays, language)} {isArabic ? "أيام" : "days"}
          </span>
        </div>

        {/* Completed Days Card */}
        <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
          <span className="text-[0.75rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أيام مكتملة" : "Completed days"}
          </span>
          <span className="text-[0.9375rem] font-black text-foreground">
            {formatNumerals(weekStats.completedDaysCount, language)} {isArabic ? "من 7" : "of 7"}
          </span>
        </div>
      </div>

      {/* Main Weekly Commitment Matrix Card */}
      <div className="w-full rounded-3xl bg-card border border-border/40 p-5 md:p-6 shadow-raised">
        <h3 className="text-[1.125rem] md:text-[1.25rem] font-black text-foreground mb-4 text-start">
          {isArabic ? "التزامك هذا الأسبوع" : "Your commitment this week"}
        </h3>

        {/* Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="border-b border-white/30 dark:border-white/10">
                <th scope="col" className="py-2.5 px-2 text-start text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} />
                    <span>{isArabic ? "اليوم" : "Day"}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Sun size={15} className="text-emerald-500" />
                    <span>{isArabic ? "أذكار الصباح" : "Morning"}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Sun size={15} className="text-amber-500" />
                    <span>{isArabic ? "أذكار المساء" : "Evening"}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Moon size={15} className="text-indigo-400" />
                    <span>{isArabic ? "أذكار النوم" : "Sleep"}</span>
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-2 text-[0.8125rem] font-bold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    <span>{isArabic ? "بعد الصلاة" : "Post-Prayer"}</span>
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
                        day.isToday ? "font-black text-amber-500" : "font-bold text-foreground"
                      }`}
                    >
                      {day.weekdayName}
                    </span>
                  </td>

                  <WeekStatusCell
                    done={day.morningStatus === "complete"}
                    label={isArabic ? "أذكار الصباح" : "Morning"}
                    isArabic={isArabic}
                  />

                  <WeekStatusCell
                    done={day.eveningStatus === "complete"}
                    label={isArabic ? "أذكار المساء" : "Evening"}
                    isArabic={isArabic}
                  />

                  <WeekStatusCell
                    done={day.sleepStatus === "complete"}
                    label={isArabic ? "أذكار النوم" : "Sleep"}
                    isArabic={isArabic}
                  />

                  <WeekStatusCell
                    done={day.afterPrayerStatus === "complete"}
                    label={isArabic ? "أذكار ما بعد الصلاة" : "Post-Prayer"}
                    isArabic={isArabic}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-white/20 dark:border-white/10 flex items-center justify-center gap-6 text-[0.75rem] font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{isArabic ? "مكتمل" : "Complete"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 text-blue-500">
              <span className="text-[0.625rem] font-black">-</span>
            </div>
            <span>{isArabic ? "جزئي" : "Partial"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-amber-500" />
            <span>{isArabic ? "فاتك" : "Missed"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Insight Card & Routine Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insight Card */}
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-raised backdrop-blur-xl flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="text-[0.9375rem] font-black text-foreground leading-snug mb-1">
              {t(language, "garden.weekCompletedDays", {
                count: formatNumerals(weekStats.completedDaysCount, language),
              })}
            </h4>
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
          <h4 className="text-[0.875rem] font-black text-foreground mb-1">
            {isArabic ? "ملخص الأوراد هذا الأسبوع" : "Weekly routines summary"}
          </h4>

          {/* Morning Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.morningCompletedCount, language)} {isArabic ? "من 7" : "of 7"}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.round((weekStats.morningCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{isArabic ? "أذكار الصباح" : "Morning"}</span>
              <Sun size={14} className="text-emerald-500" />
            </div>
          </div>

          {/* Evening Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.eveningCompletedCount, language)} {isArabic ? "من 7" : "of 7"}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.round((weekStats.eveningCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{isArabic ? "أذكار المساء" : "Evening"}</span>
              <Sun size={14} className="text-amber-500" />
            </div>
          </div>

          {/* Sleep Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.sleepCompletedCount, language)} {isArabic ? "من 7" : "of 7"}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.round((weekStats.sleepCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{isArabic ? "أذكار النوم" : "Sleep"}</span>
              <Moon size={14} className="text-indigo-400" />
            </div>
          </div>

          {/* Post-Prayer Bar */}
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold">
            <span className="text-muted-foreground w-14 shrink-0">
              {formatNumerals(weekStats.afterPrayerCompletedCount, language)} {isArabic ? "من 7" : "of 7"}
            </span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.round((weekStats.afterPrayerCompletedCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-foreground shrink-0">
              <span>{isArabic ? "بعد الصلاة" : "Post-Prayer"}</span>
              <CheckCircle2 size={14} className="text-emerald-500" />
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
  dailyCompletions = [],
}: {
  language: AppLanguage;
  targetYear: number;
  targetMonth: number;
  dailyCompletions?: import("../types").DailyCollectionCompletion[];
}) {
  const isArabic = isAr(language);
  const completionIndex = useMemo(() => createDailyCompletionIndex(dailyCompletions), [dailyCompletions]);

  const monthStats = useMemo(
    () => getMonthDetailedStats(completionIndex, targetYear, targetMonth),
    [completionIndex, targetYear, targetMonth],
  );

  const [selectedDayNum, setSelectedDayNum] = useState<number>(11);

  const selectedDayRecord = useMemo(
    () => monthStats.days.find((d) => d.dayNum === selectedDayNum) || monthStats.days[0],
    [monthStats.days, selectedDayNum],
  );

  const monthDate = new Date(targetYear, targetMonth, 1);
  const firstDayOffset = monthDate.getDay();
  const offset = isArabic ? (firstDayOffset + 1) % 7 : firstDayOffset;

  const weekdays = isArabic
    ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-4 w-full max-w-[44rem] mx-auto fade-in" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Best Routine */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Sun size={20} className="text-amber-500 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أفضل ورد" : "Best routine"}
          </span>
          <span className="text-[0.8125rem] font-black text-foreground truncate max-w-full">
            {getCategoryName(monthStats.bestRoutine, language)}
          </span>
        </div>

        {/* Longest Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أطول سلسلة" : "Longest streak"}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(monthStats.longestStreak, language)} {isArabic ? "أيام" : "days"}
          </span>
        </div>

        {/* Full Days */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Calendar size={20} className="text-emerald-500 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أيام كاملة" : "Full days"}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(monthStats.fullDaysCount, language)}
          </span>
        </div>

        {/* Completion Rate */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Sprout size={20} className="text-emerald-500 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "معدل الاكتمال" : "Completion rate"}
          </span>
          <span className="text-[0.875rem] font-black text-amber-600 dark:text-amber-400">
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
                  aria-label={
                    isArabic
                      ? `اليوم ${formatNumerals(day.dayNum, language)}، ${isPalm ? "مكتمل" : count > 0 ? `جزئي ${formatNumerals(count, language)} من 4` : "لم يبدأ"}`
                      : `Day ${day.dayNum}, ${isPalm ? "Complete" : count > 0 ? `Partial ${count} of 4` : "Unstarted"}`
                  }
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/50 bg-amber-500/20 scale-105 z-10"
                      : isPalm
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : count > 0
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                          : "bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/10 text-muted-foreground/60"
                  }`}
                >
                  <span className="text-[0.6875rem] sm:text-[0.75rem] font-bold">
                    {formatNumerals(day.dayNum, language)}
                  </span>
                  <div className="flex h-4 items-center justify-center mt-0.5">
                    {isPalm ? (
                      <Check size={12} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
                    ) : count > 0 ? (
                      <span className="text-[0.5625rem] font-extrabold text-blue-500">
                        {formatNumerals(count, language)}/4
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
              <Check size={12} strokeWidth={3} className="text-emerald-500" />
              <span>{isArabic ? "مكتمل" : "Complete"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{isArabic ? "جزئي (1–3 من 4)" : "Partial (1–3 of 4)"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border border-amber-500" />
              <span>{isArabic ? "لم يبدأ" : "Unstarted"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>- {isArabic ? "لا يوجد" : "No data"}</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details & Monthly Insight Card (1 Column on desktop) */}
        <div className="flex flex-col gap-4">
          {/* Day Details Card */}
          <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-raised flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/20 dark:border-white/10 pb-2">
              <div>
                <h4 className="text-[0.9375rem] font-black text-foreground">
                  {isArabic
                    ? `تفاصيل اليوم (${formatNumerals(selectedDayNum, language)})`
                    : `Day ${selectedDayNum} Details`}
                </h4>
                <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                  {selectedDayRecord?.dayKey}
                </span>
              </div>
              <Calendar size={18} className="text-amber-500" />
            </div>

            {/* Morning Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-white/20">
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-amber-500" />
                <span className="text-[0.8125rem] font-bold">{isArabic ? "أذكار الصباح" : "Morning Azkar"}</span>
              </div>
              {selectedDayRecord?.categories.includes("morning") ? (
                <span className="text-[0.75rem] font-bold text-emerald-600 dark:text-emerald-400">
                  {isArabic ? "مكتملة" : "Done"}
                </span>
              ) : (
                <span className="text-[0.75rem] font-bold text-amber-600">{isArabic ? "لم تبدأ" : "Not done"}</span>
              )}
            </div>

            {/* Evening Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-white/20">
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-orange-500" />
                <span className="text-[0.8125rem] font-bold">{isArabic ? "أذكار المساء" : "Evening Azkar"}</span>
              </div>
              {selectedDayRecord?.categories.includes("evening") ? (
                <span className="text-[0.75rem] font-bold text-emerald-600 dark:text-emerald-400">
                  {isArabic ? "مكتملة" : "Done"}
                </span>
              ) : (
                <span className="text-[0.75rem] font-bold text-amber-600">{isArabic ? "لم تبدأ" : "Not done"}</span>
              )}
            </div>

            {/* Sleep Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-white/20">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-indigo-400" />
                <span className="text-[0.8125rem] font-bold">{isArabic ? "أذكار النوم" : "Sleep Azkar"}</span>
              </div>
              {selectedDayRecord?.categories.includes("before_sleep") ? (
                <span className="text-[0.75rem] font-bold text-emerald-600 dark:text-emerald-400">
                  {isArabic ? "مكتملة" : "Done"}
                </span>
              ) : (
                <span className="text-[0.75rem] font-bold text-amber-600">{isArabic ? "لم تبدأ" : "Not done"}</span>
              )}
            </div>

            {/* Post-Prayer Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-white/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-[0.8125rem] font-bold">
                  {isArabic ? "أذكار ما بعد الصلاة" : "Post-Prayer Azkar"}
                </span>
              </div>
              {selectedDayRecord?.categories.includes("after_prayer") ? (
                <span className="text-[0.75rem] font-bold text-emerald-600 dark:text-emerald-400">
                  {isArabic ? "مكتملة" : "Done"}
                </span>
              ) : (
                <span className="text-[0.75rem] font-bold text-amber-600">{isArabic ? "لم تبدأ" : "Not done"}</span>
              )}
            </div>
          </div>

          {/* Month Improvement Insight */}
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-raised backdrop-blur-xl flex items-start gap-3">
            <Sprout size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[0.875rem] font-black text-foreground mb-1">
                {t(language, "garden.monthRecordTitle")}
              </h5>
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
  dailyCompletions = [],
}: {
  language: AppLanguage;
  targetYear?: number;
  dailyCompletions?: import("../types").DailyCollectionCompletion[];
}) {
  const isArabic = isAr(language);
  const completionIndex = useMemo(() => createDailyCompletionIndex(dailyCompletions), [dailyCompletions]);

  const yearStats = useMemo(() => getYearDetailedStats(completionIndex, targetYear), [completionIndex, targetYear]);

  const monthNames = isArabic ? HIJRI_MONTH_NAMES_AR : GREGORIAN_MONTH_NAMES_EN;
  const bestMonthName =
    yearStats.bestMonthIndex === null ? getCategoryName(null, language) : monthNames[yearStats.bestMonthIndex];

  return (
    <div className="flex flex-col gap-4 w-full max-w-[44rem] mx-auto fade-in" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Completion Rate */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Sprout size={20} className="text-emerald-500 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "معدل الاكتمال" : "Completion rate"}
          </span>
          <span className="text-[0.9375rem] font-black text-amber-600 dark:text-amber-400">
            %{formatNumerals(yearStats.overallCompletionRate, language)}
          </span>
        </div>

        {/* Longest Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Star size={20} className="text-amber-500 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أطول سلسلة" : "Longest streak"}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(yearStats.longestStreak, language)} {isArabic ? "يوماً" : "days"}
          </span>
        </div>

        {/* Current Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "السلسلة الحالية" : "Current streak"}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(yearStats.currentStreak, language)} {isArabic ? "يوماً" : "days"}
          </span>
        </div>

        {/* Active Days */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-3xl bg-card border border-border/40 shadow-raised text-center">
          <Calendar size={20} className="text-emerald-500 mb-1" />
          <span className="text-[0.6875rem] font-bold text-muted-foreground mb-0.5">
            {isArabic ? "أيام نشطة" : "Active days"}
          </span>
          <span className="text-[0.875rem] font-black text-foreground">
            {formatNumerals(yearStats.activeDays, language)} {isArabic ? "يوماً نشطاً" : "active"}
          </span>
        </div>
      </div>

      {/* Middle Section: Monthly Bar Chart + Quick Glance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Completion Bar Chart (2 Columns on desktop) */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-card border border-border/40 shadow-raised flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[0.9375rem] font-black text-foreground">
              {isArabic ? "معدل الاكتمال الشهري" : "Monthly completion rate"}
            </h4>
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
                      isBest ? "opacity-100 text-amber-500" : "text-muted-foreground"
                    }`}
                  >
                    %{formatNumerals(rate, language)}
                  </span>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-t-lg h-[90px] flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        isBest
                          ? "bg-amber-500 shadow-md shadow-amber-500/30"
                          : "bg-amber-500/40 dark:bg-amber-500/30 group-hover:bg-amber-500/70"
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
          <h4 className="text-[0.9375rem] font-black text-foreground border-b border-white/20 dark:border-white/10 pb-2">
            {isArabic ? "نظرة سريعة" : "Quick glance"}
          </h4>

          {/* Best Month */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-white/20">
            <div>
              <span className="block text-[0.6875rem] font-bold text-muted-foreground">
                {isArabic ? "أفضل شهر" : "Best month"}
              </span>
              <span className="text-[0.875rem] font-black text-foreground">{bestMonthName}</span>
            </div>
            <Star size={18} className="text-amber-500" />
          </div>

          {/* Most Consistent Routine */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-white/20">
            <div>
              <span className="block text-[0.6875rem] font-bold text-muted-foreground">
                {isArabic ? "أكثر ورد منتظم" : "Most consistent"}
              </span>
              <span className="text-[0.875rem] font-black text-foreground">
                {getCategoryName(yearStats.mostConsistentRoutine, language)}
              </span>
            </div>
            <Sun size={18} className="text-amber-500" />
          </div>

          {/* Total Azkar Completed */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-white/20">
            <div>
              <span className="block text-[0.6875rem] font-bold text-muted-foreground">
                {isArabic ? "إجمالي الأذكار المكتملة" : "Total completed"}
              </span>
              <span className="text-[0.875rem] font-black text-foreground">
                {formatNumerals(yearStats.totalCollections, language)}
              </span>
            </div>
            <CheckCircle2 size={18} className="text-emerald-500" />
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
              className={`p-3 rounded-2xl bg-card border transition-all ${
                isBest
                  ? "border-emerald-500/60 ring-1 ring-emerald-500/40 bg-emerald-500/5 shadow-md"
                  : "border-border/40"
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
                    className={`aspect-square rounded-[2px] ${
                      cell.isPalm || cell.level === 2
                        ? "bg-amber-500"
                        : cell.level === 1
                          ? "bg-amber-500/40"
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
      <div className="p-4 rounded-3xl bg-muted/40 border border-border/40 shadow-raised backdrop-blur-xl flex items-center justify-center text-center">
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
