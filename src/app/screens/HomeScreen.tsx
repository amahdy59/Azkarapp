import { useState, useEffect, useMemo } from "react";
import { Sun, Calendar, Zap, Sparkles, ChevronRightIcon, ChevronLeftIcon, BarChart3, Clock } from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { TodayRoutineGarden, PalmTreeReward, GoldenPalmMark } from "../components/RoutineGarden";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import { estimateCompletionMinutes, getAzkarForMode, getRoutineProgress, isRoutineCategory } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { getEstimatedPrayerTimes, getNextPrayerCountdown, timeToMinutes } from "../content/prayerTimes";
import { triggerBackgroundPrayerTimesRefresh } from "../content/prayerCalculation";
import { formatDisplayDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { getFirstIncompleteZikrIndex, getGardenSummary, MAIN_CATEGORY_IDS } from "../progress";
import { createDailyCompletionIndex } from "../gardenViews";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  RoutineCategoryId,
  RoutineMode,
} from "../types";

type HomeActionKind = "resume" | "start" | "again";

export type HomeAction = {
  categoryId: CategoryId;
  index: number;
  completedCount: number;
  totalCount: number;
  kind: HomeActionKind;
};

function suggestedCategoryId(date: Date, location?: LocationSettings): CategoryId {
  return getTimeOfDayZikr(date, "en", location).categoryId;
}

export function getTimeOfDayZikr(now: Date = new Date(), language: AppLanguage = "ar", location?: LocationSettings) {
  const prayerTimes = getEstimatedPrayerTimes(now, location);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const fajrMinutes = timeToMinutes(prayerTimes.fajr);
  const asrMinutes = timeToMinutes(prayerTimes.asr);
  const ishaMinutes = timeToMinutes(prayerTimes.isha);

  if (currentMinutes >= fajrMinutes && currentMinutes < asrMinutes) {
    return {
      categoryId: "morning" as CategoryId,
      title: t(language, "home.morningTitle"),
      desc: t(language, "home.morningDesc"),
    };
  }
  if (currentMinutes >= asrMinutes && currentMinutes < ishaMinutes) {
    return {
      categoryId: "evening" as CategoryId,
      title: t(language, "home.eveningTitle"),
      desc: t(language, "home.eveningDesc"),
    };
  }
  return {
    categoryId: "before_sleep" as CategoryId,
    title: t(language, "home.beforeSleepTitle"),
    desc: t(language, "home.beforeSleepDesc"),
  };
}

export function getHomeAction(
  completed: Record<CategoryId, Set<string>>,
  now: Date = new Date(),
  location?: LocationSettings,
  routineModes: Record<RoutineCategoryId, RoutineMode> = {
    morning: "complete",
    evening: "complete",
    before_sleep: "complete",
  },
): HomeAction {
  const suggestedId = suggestedCategoryId(now, location);
  const categoryIds = [
    suggestedId,
    ...CATEGORIES.filter((category) => category.id !== "comprehensive_duas" && category.id !== "friday_kahf").map(
      (category) => category.id,
    ),
  ].filter((id, index, values) => values.indexOf(id) === index) as CategoryId[];

  for (const categoryId of categoryIds) {
    const mode = isRoutineCategory(categoryId) ? routineModes[categoryId] : "complete";
    const visibleAzkar = getAzkarForMode(categoryId, mode);
    const progress = isRoutineCategory(categoryId)
      ? getRoutineProgress(categoryId, mode, completed[categoryId] ?? [])
      : {
          done: visibleAzkar.filter((zikr) => completed[categoryId]?.has(zikr.id)).length,
          total: visibleAzkar.length,
        };
    const done = progress.done;
    const totalCount = progress.total;
    if (done > 0 && done < totalCount) {
      return {
        categoryId,
        index: getFirstIncompleteZikrIndex(visibleAzkar, completed[categoryId]) ?? 0,
        completedCount: done,
        totalCount,
        kind: "resume",
      };
    }
  }

  for (const categoryId of categoryIds) {
    const mode = isRoutineCategory(categoryId) ? routineModes[categoryId] : "complete";
    const visibleAzkar = getAzkarForMode(categoryId, mode);
    const progress = isRoutineCategory(categoryId)
      ? getRoutineProgress(categoryId, mode, completed[categoryId] ?? [])
      : {
          done: visibleAzkar.filter((zikr) => completed[categoryId]?.has(zikr.id)).length,
          total: visibleAzkar.length,
        };
    const done = progress.done;
    const totalCount = progress.total;
    if (done === 0) {
      return { categoryId, index: 0, completedCount: done, totalCount, kind: "start" };
    }
  }

  const totalCount = isRoutineCategory(suggestedId)
    ? getRoutineProgress(suggestedId, routineModes[suggestedId], completed[suggestedId] ?? []).total
    : getAzkarForMode(suggestedId, "complete").length;
  return { categoryId: suggestedId, index: 0, completedCount: totalCount, totalCount, kind: "again" };
}

function getWeeklyChartData(dailyCompletions: DailyCollectionCompletion[], now: Date, isArabic: boolean) {
  const index = createDailyCompletionIndex(dailyCompletions);
  const days: { label: string; count: number; isToday: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getDate()).padStart(2, "0");
    const dayKey = `${year}-${month}-${dayNum}`;
    const categories = index.get(dayKey) ?? new Set();
    const count = MAIN_CATEGORY_IDS.filter((c) => categories.has(c)).length;
    const weekdayName = d.toLocaleDateString(isArabic ? "ar-EG" : "en-US", { weekday: "short" });
    days.push({
      label: weekdayName,
      count,
      isToday: i === 0,
    });
  }
  return days;
}

export function HomeScreen({
  completed,
  dailyCompletions,
  quietProgressEnabled,
  progressDayStartHour,
  language,
  direction,
  calendarType = "hijri",
  locationSettings,
  onResume,
  onRepeat,
  onOpenFridayMode,
  onOpenProgress,
  routineModes,
  onSetRoutineMode,
  onOpenCustomCounter,
}: {
  completed: Record<CategoryId, Set<string>>;
  dailyCompletions: DailyCollectionCompletion[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  locationSettings?: LocationSettings;
  onResume: (category: CategoryId) => void;
  onRepeat: (category: CategoryId) => void;
  onOpenFridayMode?: () => void;
  onOpenProgress?: () => void;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onSetRoutineMode?: (categoryId: RoutineCategoryId, mode: RoutineMode) => void;
  onOpenCustomCounter?: () => void;
}) {
  const isArabic = language === "ar";
  const [now, setNow] = useState(() => new Date());
  const [, setPrayerTimesRevision] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const updateAtNextMinute = () => {
      setNow(new Date());
      timer = setTimeout(updateAtNextMinute, 60_050 - (Date.now() % 60_000));
    };
    timer = setTimeout(updateAtNextMinute, 60_050 - (Date.now() % 60_000));
    return () => clearTimeout(timer);
  }, []);

  const prayerDateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  useEffect(() => {
    let active = true;
    triggerBackgroundPrayerTimesRefresh(new Date(), locationSettings, () => {
      if (active) setPrayerTimesRevision((revision) => revision + 1);
    });
    return () => {
      active = false;
    };
  }, [locationSettings, prayerDateKey]);

  const gardenSummary = useMemo(
    () => getGardenSummary(dailyCompletions, now, progressDayStartHour),
    [dailyCompletions, now, progressDayStartHour],
  );

  const nextPrayerInfo = getNextPrayerCountdown(now, language, locationSettings);

  const reminderInfo = useMemo(
    () => getTimeOfDayZikr(now, language, locationSettings),
    [now, language, locationSettings],
  );
  const reminderCategory = CATEGORIES.find((c) => c.id === reminderInfo.categoryId)!;
  const doneSet = completed[reminderInfo.categoryId] ?? new Set<string>();

  const reminderMode = isRoutineCategory(reminderInfo.categoryId) ? routineModes[reminderInfo.categoryId] : "complete";
  const visibleReminderAzkar = getAzkarForMode(reminderInfo.categoryId, reminderMode);
  const reminderProgress = isRoutineCategory(reminderInfo.categoryId)
    ? getRoutineProgress(reminderInfo.categoryId, reminderMode, doneSet)
    : {
        done: visibleReminderAzkar.filter((zikr) => doneSet.has(zikr.id)).length,
        total: visibleReminderAzkar.length,
      };
  const totalCount = reminderProgress.total;
  const doneCount = reminderProgress.done;
  const isComplete = doneCount >= totalCount && totalCount > 0;

  const estimatedMinutes = useMemo(() => estimateCompletionMinutes(visibleReminderAzkar), [visibleReminderAzkar]);

  const actionKind: "start" | "continue" | "again" = doneCount === 0 ? "start" : isComplete ? "again" : "continue";

  const ctaLabel =
    actionKind === "start"
      ? t(language, "home.startGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
      : actionKind === "again"
        ? t(language, "home.readGroupAgain", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
        : t(language, "home.continueGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name });

  const isFriday = now.getDay() === 5;

  const weeklyChartDays = useMemo(
    () => getWeeklyChartData(dailyCompletions, now, isArabic),
    [dailyCompletions, now, isArabic],
  );

  const streakDays = gardenSummary.currentUsageStreak ?? gardenSummary.activeDaysLast7 ?? 0;
  const activeDaysThisWeek = gardenSummary.activeDaysLast7 ?? 0;
  const totalDays = gardenSummary.lifetimePalms * 3 + gardenSummary.today.goldenLeafCount;

  return (
    <ScreenContainer
      dir={direction}
      className="px-0 relative overflow-hidden flex flex-col"
      screenName={t(language, "home.title")}
    >
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Atmospheric Background Sky Image & Backdrop Overlay */}
      <TimeOfDayBackground categoryId={reminderInfo.categoryId} />

      {/* Fixed Header & Gamification Bar */}
      <div className="relative z-20 shrink-0 px-page pt-2 pb-1">
        <header className="flex w-full flex-col gap-2 pt-1 pb-1" dir={direction}>
          <PalmTreeReward summary={gardenSummary} language={language} bare />

          {/* Time & Date Info Pill — Flex wrap for small screens (320-360px) to prevent truncation */}
          <div
            className="flex min-h-[40px] w-full shrink-0 flex-wrap items-center justify-between gap-y-1 rounded-[20px] border border-[#1f293d] bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md shadow-xs"
            dir="auto"
          >
            {/* Date */}
            <div data-testid="hijri-date" className="flex items-center gap-2 text-white whitespace-nowrap">
              <Calendar className="h-[14px] w-[14px] shrink-0 text-[#e2a84a]" />
              <span>{formatDisplayDate(now, language, calendarType)}</span>
            </div>

            <div className="hidden sm:block h-3 w-px bg-white/20 shrink-0 mx-1" />

            {/* Prayer timing */}
            <div data-testid="next-prayer" className="flex items-center gap-2 text-white whitespace-nowrap">
              <Sun className="h-[14px] w-[14px] shrink-0 text-[#e2a84a]" />
              <span className="flex items-center gap-1">
                <span>{isArabic ? nextPrayerInfo.nameArabic : nextPrayerInfo.nameEnglish}</span>
                <span dir="ltr">{nextPrayerInfo.formattedCountdown}</span>
              </span>
            </div>
          </div>
        </header>
      </div>

      {/* Scrollable Content Area */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-6 page-content-center">
        <div className="home-grid w-full">
          {/* Friday Special Banner */}
          {isFriday && onOpenFridayMode && (
            <section className="home-grid-full mb-1">
              <button
                type="button"
                onClick={onOpenFridayMode}
                className="group flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-amber-500/40 bg-black/50 backdrop-blur-md p-3.5 text-start shadow-md hover:bg-black/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-[1.125rem] shadow-sm">
                    ✨
                  </span>
                  <div>
                    <h3 className="text-[0.9375rem] font-black text-foreground">{t(language, "friday.title")}</h3>
                    <p className="text-[0.75rem] font-semibold text-muted-foreground">
                      {t(language, "friday.homeSubtitle")}
                    </p>
                  </div>
                </div>
                <span className="text-[1.125rem] font-bold text-amber-600 dark:text-amber-400 transition-transform">
                  {direction === "rtl" ? "←" : "→"}
                </span>
              </button>
            </section>
          )}

          {/* Hero Zikr Banner Card */}
          {isComplete ? (
            <div className="lg:col-span-2">
              <TranquilityCompletionCard
                categoryId={reminderInfo.categoryId}
                language={language}
                direction={direction}
                onReview={onRepeat}
              />
            </div>
          ) : (
            <section
              aria-labelledby="current-zikr-heading"
              className="lg:col-span-2 flex flex-col justify-between rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl shadow-xl"
            >
              <div className="flex flex-col gap-4 text-start">
                {/* Hero Text Block */}
                <div className="flex w-full flex-col items-start gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
                  <p className="text-[1.125rem] font-medium text-white" dir="auto">
                    {isArabic ? "حان وقت" : "Time for"}
                  </p>
                  <h2
                    id="current-zikr-heading"
                    className="text-2xl md:text-3xl font-black text-[#fbbf24] tracking-wide"
                    dir="auto"
                    style={{ lineHeight: "1.3" }}
                  >
                    {isArabic ? reminderCategory.nameArabic : reminderCategory.name}
                  </h2>
                  <p className="text-[0.8125rem] font-medium text-white/75" dir="auto">
                    {reminderInfo.desc}
                  </p>
                </div>

                {/* Routine Mode Selector Pill */}
                <div
                  className="flex min-h-[48px] w-full items-center rounded-[20px] bg-[rgba(8,12,20,0.3)] p-0.5 border border-[#1f293d]"
                  role="group"
                  aria-label={isArabic ? "وضع الورد" : "Routine mode"}
                >
                  <button
                    type="button"
                    aria-pressed={reminderMode === "complete"}
                    onClick={() => {
                      if (isRoutineCategory(reminderInfo.categoryId)) {
                        onSetRoutineMode?.(reminderInfo.categoryId, "complete");
                      }
                    }}
                    className={`flex min-h-[44px] flex-1 items-center justify-center rounded-2xl transition-colors duration-150 text-[0.875rem] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] focus-visible:ring-inset ${
                      reminderMode === "complete" ? "bg-white/10 text-[#fbbf24]" : "text-[#f2eee9] hover:text-white"
                    }`}
                  >
                    {isArabic ? "الكاملة" : "Complete"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={reminderMode === "core"}
                    onClick={() => {
                      if (isRoutineCategory(reminderInfo.categoryId)) {
                        onSetRoutineMode?.(reminderInfo.categoryId, "core");
                      }
                    }}
                    className={`flex min-h-[44px] flex-1 items-center justify-center rounded-2xl transition-colors duration-150 text-[0.875rem] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] focus-visible:ring-inset ${
                      reminderMode === "core" ? "bg-white/10 text-[#fbbf24]" : "text-[#f2eee9] hover:text-white"
                    }`}
                  >
                    {isArabic ? "المختصرة" : "Abbreviated"}
                  </button>
                </div>

                {/* Progress Text & Bar */}
                {totalCount > 0 && (
                  <div className="flex flex-col gap-2 w-full mt-1">
                    <div
                      className="flex w-full items-center justify-between text-[0.8125rem] font-semibold text-white"
                      dir="auto"
                    >
                      <span>
                        {formatNumerals(doneCount, language)} {isArabic ? "من" : "of"}{" "}
                        {formatNumerals(totalCount, language)}
                      </span>
                      <div className="flex items-center gap-1.5 text-white/90">
                        <Clock className="h-[14px] w-[14px] text-[#e2a84a]" />
                        <span>
                          {isArabic
                            ? `${formatNumerals(estimatedMinutes, language)} دقائق تقريباً`
                            : `~${estimatedMinutes} mins`}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full w-full rounded-full bg-[#fbbf24] transition-[transform] duration-500 ease-out origin-[--bar-origin]"
                        style={
                          {
                            transform: `scaleX(${Math.min(1, Math.max(0, doneCount / totalCount))})`,
                            "--bar-origin": direction === "rtl" ? "right" : "left",
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  type="button"
                  data-testid="home-primary-cta"
                  onClick={() => {
                    onResume(reminderInfo.categoryId);
                  }}
                  className="mt-2 flex h-[52px] min-h-[44px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#d99f43] bg-gradient-to-r from-[#d99f43] to-[#eeb962] text-[1.0625rem] font-bold text-[#141a2a] shadow-lg transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 cursor-pointer"
                >
                  {direction === "rtl" ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  )}
                  <span>{ctaLabel}</span>
                </button>
              </div>
            </section>
          )}

          {/* Leaves & Progress Garden ("وردك اليوم" Daily Card) */}
          {quietProgressEnabled && (
            <div className="lg:col-span-1">
              <TodayRoutineGarden
                summary={gardenSummary}
                language={language}
                hideTabs={true}
                calendarType={calendarType}
                dailyCompletions={dailyCompletions}
                onSelectCategory={onResume}
              />
            </div>
          )}

          {/* Quick Stats Overview Card ("نظرة سريعة" - Variation 1 & 3) */}
          <section className="lg:col-span-1 flex flex-col justify-between rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#fbbf24]" />
                  <h3 className="text-[1.0625rem] font-extrabold text-foreground">
                    {isArabic ? "نظرة سريعة" : "Quick Stats"}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mt-1">
                {/* Streak stat */}
                <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-[#fbbf24]" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {isArabic ? "سلسلتك الحالية" : "Current Streak"}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-foreground">
                    {formatNumerals(streakDays, language)} {isArabic ? "أيام متتالية" : "days"}
                  </span>
                </div>

                {/* This week stat */}
                <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-[#fbbf24]" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {isArabic ? "هذا الأسبوع" : "This Week"}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-foreground">
                    {formatNumerals(activeDaysThisWeek, language)} {isArabic ? "من ٧ أيام" : "of 7 days"}
                  </span>
                </div>

                {/* Total stat */}
                <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <GoldenPalmMark size={16} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {isArabic ? "الإجمالي" : "Lifetime Total"}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-foreground">
                    {formatNumerals(totalDays, language)} {isArabic ? "يوماً" : "days"}
                  </span>
                </div>
              </div>
            </div>

            {onOpenProgress && (
              <button
                type="button"
                onClick={onOpenProgress}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 text-xs font-bold text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <span>{isArabic ? "عرض التقدم الكامل" : "View Full Progress"}</span>
                {direction === "rtl" ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
              </button>
            )}
          </section>

          {/* Analytical Weekly Progress Bar Chart ("تقدمك هذا الأسبوع" - Variation 3) */}
          <section className="lg:col-span-1 flex flex-col justify-between rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#fbbf24]" />
                  <h3 className="text-[1.0625rem] font-extrabold text-foreground">
                    {isArabic ? "تقدمك هذا الأسبوع" : "Weekly Progress"}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {formatNumerals(activeDaysThisWeek, language)} {isArabic ? "من ٧ أيام" : "of 7 days"}
                </span>
              </div>

              {/* Bar chart graphics */}
              <div className="flex items-end justify-between gap-1.5 h-28 pt-4 px-1">
                {weeklyChartDays.map((day, idx) => {
                  const barPercent = day.count === 0 ? 12 : Math.min(100, Math.max(20, (day.count / 3) * 100));
                  return (
                    <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full bg-white/10 rounded-t-lg flex items-end h-full overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            day.count > 0 ? "bg-[#d99f43] bg-gradient-to-t from-[#d99f43] to-[#fbbf24]" : "bg-white/20"
                          }`}
                          style={{ height: `${barPercent}%` }}
                        />
                      </div>
                      <span
                        className={`text-[0.625rem] font-bold ${day.isToday ? "text-[#fbbf24]" : "text-muted-foreground"}`}
                      >
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Resume Last Read & Special Suggestion Cards */}
          <section className="lg:col-span-1 flex flex-col gap-3">
            {/* Resume Last Read Card */}
            <div className="flex-1 flex flex-col justify-between rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                    {isArabic ? "تابع من حيث توقفت" : "Resume reading"}
                  </span>
                  <h4 className="text-sm font-extrabold text-foreground mt-0.5">
                    {isArabic ? reminderCategory.nameArabic : reminderCategory.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onResume(reminderInfo.categoryId)}
                  className="flex min-h-[44px] items-center justify-center rounded-xl bg-[#d99f43] px-3 text-xs font-bold text-[#141a2a] hover:bg-[#eeb962] transition-colors cursor-pointer"
                >
                  {isArabic ? "متابعة" : "Resume"}
                </button>
              </div>
            </div>

            {/* Friday / Salawat Special Recommendation Card */}
            <div className="flex-1 flex flex-col justify-between rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[0.6875rem] font-semibold text-amber-500">
                    {isArabic ? "إقتراحات لك" : "Suggested for you"}
                  </span>
                  <h4 className="text-sm font-extrabold text-foreground mt-0.5">
                    {isArabic ? "أذكار يوم الجمعة" : "Friday Azkar"}
                  </h4>
                </div>
                {onOpenFridayMode && (
                  <button
                    type="button"
                    onClick={onOpenFridayMode}
                    className="flex min-h-[44px] items-center justify-center rounded-xl border border-amber-500/40 bg-black/40 hover:bg-black/60 px-3 text-xs font-bold text-amber-400 transition-colors cursor-pointer"
                  >
                    {isArabic ? "استكشف" : "Explore"}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Electronic Tasbeeh Counter Card */}
          {onOpenCustomCounter && (
            <div className="home-grid-full mt-1">
              <TasbeehCounterButton onClick={onOpenCustomCounter} language={language} direction={direction} />
            </div>
          )}
        </div>
      </main>
    </ScreenContainer>
  );
}
