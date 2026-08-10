/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState, useEffect, useMemo } from "react";
import { Calendar, Zap, Clock, ArrowLeft, ArrowRight, Bookmark, Sparkles } from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { TodayRoutineGarden, GoldenPalmMark, PalmTreeMark } from "../components/RoutineGarden";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import {
  ALL_AZKAR,
  estimateCompletionMinutes,
  getAzkarByCategory,
  getAzkarForMode,
  getRoutineProgress,
  isRoutineCategory,
  registerLazyCollection,
} from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { getEstimatedPrayerTimes, getNextPrayerCountdown, timeToMinutes } from "../content/prayerTimes";
import { triggerBackgroundPrayerTimesRefresh } from "../content/prayerCalculation";
import { formatDisplayDate, formatDisplayTime, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { SegmentedControl } from "../components/SegmentedControl";
import { StatCard } from "../components/StatCard";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { getFirstIncompleteZikrIndex, getGardenSummary, MAIN_CATEGORY_IDS } from "../progress";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  RoutineCategoryId,
  RoutineMode,
} from "../types";

/**
 * The three time-of-day routines listed in Home's "وردك اليوم" card. After-prayer
 * azkar are deliberately absent: they get their own card. Progress still counts
 * all four main collections toward leaves and palms.
 */
const HOME_WIRD_CATEGORY_IDS = ["morning", "evening", "before_sleep"] as const satisfies readonly CategoryId[];
type HomeActionKind = "resume" | "start" | "again";

export type HomeAction = {
  categoryId: CategoryId;
  index: number;
  completedCount: number;
  totalCount: number;
  kind: HomeActionKind;
};

type HomeSavedItem = {
  id: string;
  category: CategoryId;
  arabicText: string;
  translation: string;
  source: "main" | "comprehensive" | "friday";
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

export function getHomeBackgroundCategoryId(now: Date, routineCategoryId: CategoryId): CategoryId {
  return now.getDay() === 5 ? "friday_kahf" : routineCategoryId;
}

/** Centred section heading with rules on either side, per the Home design. */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      <h2 className="text-[0.9375rem] font-bold text-primary" dir="auto">
        {label}
      </h2>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

export function getHomeAction(
  completed: Record<CategoryId, Set<string>>,
  now: Date = new Date(),
  location?: LocationSettings,
  routineModes: Record<RoutineCategoryId, RoutineMode> = {
    morning: "complete",
    evening: "complete",
    before_sleep: "complete",
    after_prayer: "complete",
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
  onOpenProgress: _onOpenProgress,
  routineModes,
  onSetRoutineMode,
  onOpenCustomCounter,
  savedZikrIds,
  onOpenSavedZikr,
  onOpenSavedLibrary,
  onOpenBenefits,
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
  savedZikrIds: Set<string>;
  onOpenSavedZikr?: (categoryId: CategoryId, index: number) => void;
  onOpenSavedLibrary?: () => void;
  onOpenBenefits?: () => void;
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

  const streakDays = gardenSummary.currentUsageStreak ?? gardenSummary.activeDaysLast7 ?? 0;
  const activeDaysThisWeek = gardenSummary.activeDaysLast7 ?? 0;
  const totalDays = gardenSummary.lifetimePalms * 3 + gardenSummary.today.goldenLeafCount;
  const homeBackgroundCategoryId = getHomeBackgroundCategoryId(now, reminderInfo.categoryId);
  const savedPreview = useMemo(() => {
    const available: HomeSavedItem[] = ALL_AZKAR.filter(
      (zikr) => !zikr.isCollectionIntroduction && savedZikrIds.has(zikr.id),
    ).map((zikr) => ({
      id: zikr.id,
      category: zikr.category,
      arabicText: zikr.arabicText,
      translation: zikr.translation,
      source: "main",
    }));
    const comprehensiveCategory = CATEGORIES.find((category) => category.id === "comprehensive_duas")!;
    for (const id of savedZikrIds) {
      if (!id.startsWith("friday-dua-") && !id.startsWith("comprehensive-dua-")) continue;
      available.push({
        id,
        category: "comprehensive_duas",
        arabicText: comprehensiveCategory.nameArabic,
        translation: comprehensiveCategory.name,
        source: "comprehensive",
      });
    }
    if (savedZikrIds.has("friday-kahf")) {
      const fridayCategory = CATEGORIES.find((category) => category.id === "friday_kahf")!;
      available.unshift({
        id: "friday-kahf",
        category: "friday_kahf",
        arabicText: fridayCategory.nameArabic,
        translation: fridayCategory.name,
        source: "friday",
      });
    }
    return available.slice(0, 3);
  }, [savedZikrIds]);

  const openSavedZikr = async (zikr: HomeSavedItem) => {
    if (zikr.source === "friday") {
      const { FRIDAY_KAHF } = await import("../content/fridayKahf");
      registerLazyCollection("friday_kahf", FRIDAY_KAHF);
      onOpenSavedZikr?.("friday_kahf", 0);
      return;
    }
    if (zikr.source === "comprehensive") {
      const { COMPREHENSIVE_DUAS } = await import("../content/comprehensiveDuas");
      registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
    }
    const items = getAzkarByCategory(zikr.category);
    const index = items.findIndex((item) => item.id === zikr.id);
    if (index >= 0) onOpenSavedZikr?.(zikr.category, index);
  };

  return (
    <ScreenContainer
      dir={direction}
      className="px-0 relative overflow-hidden flex flex-col"
      screenName={t(language, "home.title")}
    >
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Two-row utility bar: date first, current time/prayer second, with the
          streak intentionally stacked above the palm status. */}
      <div className="relative z-30 border-b border-border/40 bg-card/95 px-page py-2">
        <header
          data-testid="home-utility-header"
          className="grid w-full grid-cols-[minmax(0,1fr)_auto] grid-rows-2 items-center gap-x-2 gap-y-1.5 sm:gap-x-3"
          dir={direction}
        >
          <div
            data-testid="hijri-date"
            className="row-start-1 flex min-w-0 items-center gap-2 text-[0.75rem] font-bold text-foreground sm:text-[0.8125rem]"
          >
            <Calendar className="h-[15px] w-[15px] shrink-0 text-muted-foreground" aria-hidden="true" />
            <time className="truncate" dateTime={now.toISOString()}>
              {formatDisplayDate(now, language, calendarType)}
            </time>
          </div>

          <div
            data-testid="next-prayer"
            className="row-start-2 flex min-w-0 items-center gap-2 text-[0.75rem] font-semibold text-muted-foreground sm:text-[0.8125rem]"
          >
            <Clock className="h-[15px] w-[15px] shrink-0 text-primary" aria-hidden="true" />
            <time
              data-testid="current-time"
              className="shrink-0 font-extrabold text-foreground"
              dateTime={now.toISOString()}
            >
              {formatDisplayTime(now, language)}
            </time>
            <span className="text-border" aria-hidden="true">
              ·
            </span>
            <span className="min-w-0 truncate" dir="auto">
              {isArabic ? nextPrayerInfo.nameArabic : nextPrayerInfo.nameEnglish}{" "}
              <span dir="ltr">{nextPrayerInfo.formattedCountdown}</span>
            </span>
          </div>

          {/* role="img" (not a bare div): aria-label on a roleless generic
              container is ignored by most screen readers, so this summary was
              announced as nothing. It also suppresses the two chips' bare
              numerals, which carry no meaning read on their own — the label
              below is the complete text alternative for the pair. */}
          <div
            role="img"
            data-testid="home-header-stats"
            className="col-start-2 row-span-2 row-start-1 grid min-w-[4.25rem] grid-rows-2 gap-1"
            aria-label={
              isArabic
                ? `أشجار النخيل: ${formatNumerals(gardenSummary.lifetimePalms, language)}، أوراق اليوم: ${formatNumerals(gardenSummary.today.goldenLeafCount, language)} من ${formatNumerals(MAIN_CATEGORY_IDS.length, language)}، السلسلة اليومية: ${formatNumerals(streakDays, language)} أيام`
                : `Palms: ${gardenSummary.lifetimePalms}, Today's leaves: ${gardenSummary.today.goldenLeafCount} of ${MAIN_CATEGORY_IDS.length}, Daily streak: ${streakDays} days`
            }
          >
            <div
              data-testid="header-streak"
              className="flex items-center justify-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[0.6875rem] font-black text-foreground"
              title={isArabic ? "السلسلة اليومية" : "Daily Streak"}
            >
              <Zap className="h-[13px] w-[13px] text-primary" strokeWidth={2.5} aria-hidden="true" />
              <span>{formatNumerals(streakDays, language)}</span>
              <span className="hidden sm:inline">{isArabic ? "أيام" : "days"}</span>
            </div>
            <div
              data-testid="header-palms"
              className="flex items-center justify-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2 py-1 text-[0.6875rem] font-black text-foreground"
              title={isArabic ? "أشجار النخيل" : "Palms"}
            >
              <PalmTreeMark
                size={14}
                filled={gardenSummary.lifetimePalms > 0}
                className={gardenSummary.lifetimePalms > 0 ? "text-primary" : "text-muted-foreground"}
              />
              <span>{formatNumerals(gardenSummary.lifetimePalms, language)}</span>
              <span className="hidden sm:inline">{isArabic ? "نخلة" : "palms"}</span>
            </div>
          </div>
        </header>
      </div>

      {/* Scrollable Content Area */}
      {/* A scroll region, not a landmark: App.tsx owns the single #main-content. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={t(language, "home.title")}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-page pb-24 pt-4 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      >
        <div className="flex w-full flex-col gap-4 lg:gap-5">
          {/* Hero card. The scene image is contained by this card rather than
              washed across the whole screen, so the page keeps its own surface. */}
          {/* Capped and centred: unbounded, the hero stretched the full width of
              an ultrawide display and the scene image lost all composition. */}
          <div className="relative mx-auto w-full max-w-[80rem] overflow-hidden sm:rounded-3xl sm:shadow-raised -mx-4 sm:mx-auto -mt-4 sm:mt-0">
            <TimeOfDayBackground categoryId={homeBackgroundCategoryId} variant="card" />
            {/* items-stretch, not items-center: the wird card should match the
                hero's height rather than float centred against it. */}
            <div className="relative z-10 flex flex-col items-stretch gap-4 p-4 md:p-6 lg:grid lg:grid-cols-5 lg:items-stretch lg:gap-5 pt-8 sm:pt-4">
              {isComplete ? (
                <div className="lg:col-span-3">
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
                  className="lg:col-span-3 flex flex-col justify-between p-0 md:p-2 transition-all"
                >
                  {/* The hero sits on a photo that fades to white in light mode,
                      so its white text needs its own dark backing rather than
                      relying on the page scrim. Without this, "Time for"
                      measured 1.98:1 against a required 4.5:1. */}
                  <div className="flex flex-1 flex-col gap-4 rounded-[28px] bg-black/40 p-5 text-start backdrop-blur-md md:p-6 border border-white/10 shadow-2xl">
                    {/* Hero Text & Category Header */}
                    <div className="flex w-full flex-col items-start gap-1 px-1">
                      <p
                        className="text-[1.125rem] font-black text-on-media drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                        dir="auto"
                      >
                        {isArabic ? "حان وقت" : "Time for"}
                      </p>
                      <h2
                        id="current-zikr-heading"
                        className="text-3xl md:text-4xl font-black text-on-media-accent tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        dir="auto"
                        style={{ lineHeight: "1.25" }}
                      >
                        {isArabic ? reminderCategory.nameArabic : reminderCategory.name}
                      </h2>
                      <p
                        className="text-[0.875rem] font-bold text-white bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit mt-1 shadow-sm border border-white/10"
                        dir="auto"
                      >
                        {reminderInfo.desc}
                      </p>
                    </div>

                    {/* Routine Mode Selector Pill (Abbreviated vs Complete) */}
                    <SegmentedControl
                      value={reminderMode}
                      onChange={(mode) => {
                        if (isRoutineCategory(reminderInfo.categoryId)) {
                          onSetRoutineMode?.(reminderInfo.categoryId, mode);
                        }
                      }}
                      direction={direction}
                      aria-label={isArabic ? "وضع الورد" : "Routine mode"}
                      className="flex min-h-[44px] w-full items-center rounded-2xl bg-black/55 p-1 border border-white/20 dark:border-white/10"
                      itemClassName={(selected) =>
                        `flex min-h-[42px] flex-1 items-center justify-center rounded-2xl transition-all duration-200 text-[0.875rem] font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                          selected ? "bg-primary text-primary-foreground shadow-md" : "text-white/95 hover:text-white"
                        }`
                      }
                      options={[
                        { value: "complete", label: isArabic ? "الكاملة" : "Complete" },
                        { value: "core", label: isArabic ? "المختصرة" : "Abbreviated" },
                      ]}
                    />

                    {/* Progress Text & Progress Bar */}
                    {totalCount > 0 && (
                      <div className="flex flex-col gap-2 w-full mt-1">
                        <div
                          className="flex w-full items-center justify-between text-[0.8125rem] font-bold text-on-media"
                          dir="auto"
                        >
                          <span>
                            {formatNumerals(doneCount, language)} {isArabic ? "من" : "of"}{" "}
                            {formatNumerals(totalCount, language)}
                          </span>
                          <div className="flex items-center gap-1.5 text-on-media-muted">
                            <Clock className="h-[14px] w-[14px] text-[#e2a84a]" />
                            <span>
                              {isArabic
                                ? `${formatNumerals(estimatedMinutes, language)} دقائق تقريباً`
                                : `~${estimatedMinutes} mins`}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/20">
                          <div
                            className="h-full w-full rounded-full bg-primary transition-[transform] duration-500 ease-out origin-[--bar-origin]"
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

                    {/* Primary Action Button (Gold Gradient CTA) */}
                    <button
                      type="button"
                      data-testid="home-primary-cta"
                      onClick={() => {
                        onResume(reminderInfo.categoryId);
                      }}
                      className="mt-2 flex h-[54px] min-h-[48px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#e2a84a] text-[1.0625rem] font-black text-slate-950 shadow-lg hover:bg-[#ebd074] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer group"
                    >
                      <span>{ctaLabel}</span>
                      {direction === "rtl" ? (
                        <ArrowLeft size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  </div>
                </section>
              )}

              {/* Today's Wird ("وردك اليوم") beside the hero. TodayRoutineGarden already
              renders exactly this card; a second bespoke one would duplicate it. */}
              {quietProgressEnabled && (
                <div className="lg:col-span-2 flex h-full w-full">
                  <TodayRoutineGarden
                    summary={gardenSummary}
                    language={language}
                    hideTabs={true}
                    calendarType={calendarType}
                    dailyCompletions={dailyCompletions}
                    onSelectCategory={onResume}
                    visibleCategoryIds={HOME_WIRD_CATEGORY_IDS}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: three at-a-glance progress stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <StatCard
              title={isArabic ? "هذا الأسبوع" : "This Week"}
              icon={<Calendar size={18} />}
              value={formatNumerals(activeDaysThisWeek, language)}
              subtitle={isArabic ? "من ٧ أيام" : "of 7 days"}
            />
            <StatCard
              title={isArabic ? "سلسلة المتابعة" : "Streak"}
              icon={<Zap size={18} />}
              value={formatNumerals(streakDays, language)}
              subtitle={isArabic ? "أيام متتالية" : "consecutive days"}
            />
            <StatCard
              title={isArabic ? "إجمالي الأذكار" : "Total Azkar"}
              icon={<GoldenPalmMark size={18} />}
              value={formatNumerals(totalDays, language)}
              subtitle={isArabic ? "ذكراً اليوم" : "azkar today"}
            />
          </div>

          <SectionDivider label={t(language, "home.yourLibrary")} />

          <div className="grid grid-cols-1 items-stretch gap-3.5 lg:grid-cols-2">
            <section
              aria-labelledby="home-saved-heading"
              className="rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
              data-testid="home-saved-section"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-start">
                  <p className="text-[0.75rem] font-black uppercase tracking-wide text-primary">
                    {t(language, "home.savedEyebrow")}
                  </p>
                  <h2 id="home-saved-heading" className="mt-1 text-[1.125rem] font-black text-foreground">
                    {t(language, "home.savedTitle")}
                  </h2>
                </div>
                <span className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-primary/10 px-3 text-[0.875rem] font-black text-primary">
                  {formatNumerals(savedZikrIds.size, language)}
                </span>
              </div>

              {savedPreview.length > 0 ? (
                <div className="mt-4 space-y-2.5">
                  {savedPreview.map((zikr) => {
                    const category = CATEGORIES.find((item) => item.id === zikr.category)!;
                    return (
                      <button
                        key={zikr.id}
                        type="button"
                        onClick={() => void openSavedZikr(zikr)}
                        className="interactive-elem flex min-h-14 w-full items-center gap-3 rounded-2xl border border-border/50 bg-background/80 px-3 py-2.5 text-start transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Bookmark size={18} className="fill-current" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.6875rem] font-bold text-primary">
                            {isArabic ? category.nameArabic : category.name}
                          </span>
                          <span
                            className={`mt-0.5 block truncate text-[0.875rem] font-bold text-foreground ${isArabic ? "font-arabic" : "font-sans"}`}
                            dir={isArabic ? "rtl" : "ltr"}
                          >
                            {isArabic ? zikr.arabicText : zikr.translation}
                          </span>
                        </span>
                        {direction === "rtl" ? (
                          <ArrowLeft size={17} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                        ) : (
                          <ArrowRight size={17} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-start text-[0.8125rem] font-semibold leading-6 text-muted-foreground">
                  {t(language, "home.savedEmpty")}
                </p>
              )}

              {onOpenSavedLibrary && (
                <button
                  type="button"
                  onClick={onOpenSavedLibrary}
                  className="mt-4 flex min-h-11 w-full items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 px-4 text-[0.875rem] font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {t(language, "home.openSaved")}
                </button>
              )}
            </section>

            {onOpenBenefits && (
              <button
                type="button"
                onClick={onOpenBenefits}
                className="interactive-elem group flex min-h-[12rem] w-full flex-col justify-between rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-card to-card p-5 text-start shadow-raised transition-colors hover:border-amber-500/55 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                data-testid="home-benefits-card"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Sparkles size={24} aria-hidden="true" />
                </span>
                <span className="mt-5 block">
                  <span className="block text-[1.25rem] font-black text-foreground">
                    {t(language, "benefits.title")}
                  </span>
                  <span className="mt-1.5 block text-[0.875rem] font-semibold leading-6 text-muted-foreground">
                    {t(language, "benefits.homeDescription")}
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-[0.875rem] font-black text-amber-800 dark:text-amber-300">
                    {t(language, "benefits.open")}
                    {direction === "rtl" ? (
                      <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    )}
                  </span>
                </span>
              </button>
            )}
          </div>

          <SectionDivider label={isArabic ? "أذكار يوم الجمعة" : "Friday Azkar"} />

          {/* Friday card: artwork at the start edge, the Kahf message and its
              call to action in the middle, and the virtues list at the end. */}
          <section aria-labelledby="friday-card-heading">
            <div className="flex flex-col items-stretch gap-5 rounded-3xl border border-border/40 bg-card p-6 shadow-raised xl:flex-row xl:items-center">
              <div
                className="flex size-[120px] shrink-0 items-center justify-center self-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-5xl"
                aria-hidden="true"
              >
                🕌
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3 text-start">
                <h3 id="friday-card-heading" className="text-xl font-black text-foreground md:text-2xl" dir="auto">
                  {isArabic ? "فضل قراءة سورة الكهف والذكر" : "The merit of reciting Surat Al-Kahf"}
                </h3>
                <p className="text-[0.875rem] font-medium text-muted-foreground" dir="auto">
                  {isArabic
                    ? "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين."
                    : "Whoever recites Surat Al-Kahf on Friday will have light between the two Fridays."}
                </p>
                {onOpenFridayMode && (
                  <button
                    type="button"
                    onClick={onOpenFridayMode}
                    className="mt-1 flex h-[48px] w-fit items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[0.9375rem] font-black text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <span>{isArabic ? "عرض أذكار الجمعة" : "View Friday Azkar"}</span>
                    {direction === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </button>
                )}
              </div>

              <div className="w-full shrink-0 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-start xl:w-[280px]">
                <p className="mb-2 text-[0.8125rem] font-black text-amber-700 dark:text-amber-400" dir="auto">
                  {isArabic ? "من فضائل يوم الجمعة" : "Virtues of Friday"}
                </p>
                <ul className="flex list-disc flex-col gap-1.5 ps-4 text-xs font-semibold text-foreground">
                  {(isArabic
                    ? [
                        "فيه أفضل صلاة (صلاة فجر يوم الجمعة)",
                        "قراءة سورة الكهف نور بين الجمعتين",
                        "أجر عظيم عند الذهاب للمسجد مبكراً والإنصات للخطيب",
                        "فيه وقت استجابة الدعاء",
                      ]
                    : [
                        "It contains the best prayer (Friday's Fajr)",
                        "Reciting Al-Kahf is light between the two Fridays",
                        "Great reward for arriving early and listening to the sermon",
                        "It holds an hour when supplication is answered",
                      ]
                  ).map((virtue) => (
                    <li key={virtue} dir="auto">
                      {virtue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Tasbeeh Counter Button (Full width matching design system tokens) */}
          {onOpenCustomCounter && (
            <div className="">
              <TasbeehCounterButton onClick={onOpenCustomCounter} language={language} direction={direction} />
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
