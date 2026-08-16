/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Zap,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  MoonStar,
} from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { TodayRoutineGarden, GoldenPalmMark, PalmTreeMark } from "../components/RoutineGarden";
import { ProductImage } from "../components/ProductImage";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import { FridayHomeCard, PrayerRoutineCard, SavedZikrCard } from "../components/HomeCards";
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
import {
  formatPrayerTimeLabel,
  getCurrentPrayerPeriod,
  getEstimatedPrayerTimes,
  getNextPrayerCountdown,
  timeToMinutes,
  type PrayerName,
} from "../content/prayerTimes";
import { triggerBackgroundPrayerTimesRefresh } from "../content/prayerCalculation";
import { formatDisplayDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { StatCard } from "../components/StatCard";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { getFirstIncompleteZikrIndex, getGardenSummary, getProgressDayKey, MAIN_CATEGORY_IDS } from "../progress";
import { fridayKahfOpenedKey } from "../fridayProgress";
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
const AFTER_PRAYER_TRACKER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const satisfies readonly PrayerName[];
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

export function isFridayFeatureWindow(now: Date, location?: LocationSettings): boolean {
  const day = now.getDay();
  if (day !== 4 && day !== 5) return false;

  const maghrib = timeToMinutes(getEstimatedPrayerTimes(now, location).maghrib);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (day === 4 && currentMinutes >= maghrib) || (day === 5 && currentMinutes < maghrib);
}

function hasStartedFridayKahf(): boolean {
  try {
    return window.localStorage.getItem(fridayKahfOpenedKey()) === "true";
  } catch {
    return false;
  }
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

function prayerLabel(language: AppLanguage, prayer: PrayerName) {
  return t(language, `notifications.${prayer}` as never);
}

function prayerTrackerLabel(language: AppLanguage, prayer: PrayerName) {
  return language === "ar" ? `بعد ${prayerLabel(language, prayer)}` : `After ${prayerLabel(language, prayer)}`;
}

function PrayerIcon({ prayer }: { prayer: PrayerName }) {
  const props = { size: 21, strokeWidth: 2.2, "aria-hidden": true } as const;
  if (prayer === "fajr") return <Sunrise {...props} />;
  if (prayer === "dhuhr") return <Sun {...props} />;
  if (prayer === "asr") return <CloudSun {...props} />;
  if (prayer === "maghrib") return <Sunset {...props} />;
  return <MoonStar {...props} />;
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
  onPrayerResume,
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
  onPrayerResume?: (prayer: string) => void;
  onOpenFridayMode: () => void;
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
  const [savedOpenState, setSavedOpenState] = useState<{
    loadingId: string | null;
    errorId: string | null;
  }>({ loadingId: null, errorId: null });
  const [fridayKahfStarted] = useState(hasStartedFridayKahf);

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
  const currentPrayerPeriod = getCurrentPrayerPeriod(now, locationSettings);
  const activePrayerIndex = AFTER_PRAYER_TRACKER_ORDER.indexOf(currentPrayerPeriod.currentPrayer);

  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const completedAfterPrayersToday = new Set(
    dailyCompletions
      .filter((record) => record.dayKey === todayKey && record.category === "after_prayer" && record.subCategory)
      .map((record) => record.subCategory),
  );

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
  const [completionCardState, setCompletionCardState] = useState<"hidden" | "visible" | "exiting">("hidden");

  useEffect(() => {
    if (!isComplete) {
      setCompletionCardState("hidden");
      return;
    }

    setCompletionCardState("visible");
    const exitTimer = window.setTimeout(() => setCompletionCardState("exiting"), 3_600);
    const hideTimer = window.setTimeout(() => setCompletionCardState("hidden"), 4_100);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isComplete, reminderInfo.categoryId]);

  const showCompletionCard = isComplete && completionCardState !== "hidden";
  const showRoutineCard = !isComplete;
  const showHeroContent = showCompletionCard || showRoutineCard || quietProgressEnabled;
  const estimatedMinutes = useMemo(() => estimateCompletionMinutes(visibleReminderAzkar), [visibleReminderAzkar]);

  const actionKind: "start" | "continue" | "again" = doneCount === 0 ? "start" : isComplete ? "again" : "continue";

  const ctaLabel =
    actionKind === "start"
      ? t(language, "home.startGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
      : actionKind === "again"
        ? t(language, "home.readGroupAgain", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
        : t(language, "home.continueGroupRemaining", {
            name: isArabic ? reminderCategory.nameArabic : reminderCategory.name,
            count: formatNumerals(Math.max(0, totalCount - doneCount), language),
          });

  const streakDays = gardenSummary.currentUsageStreak ?? gardenSummary.activeDaysLast7 ?? 0;
  const activeDaysThisWeek = gardenSummary.activeDaysLast7 ?? 0;
  // Recorded main-routine completions, lifetime. This used to be
  // `lifetimePalms * 3 + today.goldenLeafCount`, which was wrong twice over:
  // the multiplier predates DEC-042 making a palm four routines rather than
  // three, and counting only palm days meant someone who completed 3 of 4
  // every day for a month was shown zero. `lifetimeGoldenLeaves` is the
  // ledger's own count of MAIN_CATEGORY_IDS completions, so it needs no
  // arithmetic here and cannot drift from the routine count again.
  const completedCollections = gardenSummary.lifetimeGoldenLeaves;
  const homeBackgroundCategoryId = getHomeBackgroundCategoryId(now, reminderInfo.categoryId);
  const fridayInWindow = isFridayFeatureWindow(now, locationSettings);
  const fridayKahfComplete = completed.friday_kahf?.has("friday-kahf") ?? false;
  const fridayStatus = fridayKahfComplete ? "review" : fridayKahfStarted ? "continue" : "start";
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
    for (const id of [...savedZikrIds].sort()) {
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
    setSavedOpenState({ loadingId: zikr.id, errorId: null });
    try {
      if (zikr.source === "friday") {
        const { FRIDAY_KAHF } = await import("../content/fridayKahf");
        registerLazyCollection("friday_kahf", FRIDAY_KAHF);
        onOpenSavedZikr?.("friday_kahf", 0);
        setSavedOpenState({ loadingId: null, errorId: null });
        return;
      }
      if (zikr.source === "comprehensive") {
        const { COMPREHENSIVE_DUAS } = await import("../content/comprehensiveDuas");
        registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
      }
      const items = getAzkarByCategory(zikr.category);
      const index = items.findIndex((item) => item.id === zikr.id);
      if (index < 0) throw new Error(`Saved zikr ${zikr.id} was not found`);
      onOpenSavedZikr?.(zikr.category, index);
      setSavedOpenState({ loadingId: null, errorId: null });
    } catch {
      setSavedOpenState({ loadingId: null, errorId: zikr.id });
    }
  };

  return (
    <ScreenContainer
      dir={direction}
      className="px-0 pt-0 relative overflow-hidden flex flex-col"
      style={{ paddingTop: 0 }}
      screenName={t(language, "home.title")}
    >
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Scrollable Content Area */}
      <div
        tabIndex={0}
        role="region"
        aria-label={t(language, "home.title")}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-0 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      >
        {/* Sticky Header Overlay */}
        <div className="pointer-events-none sticky inset-x-0 top-0 z-50 h-0 overflow-visible">
          <header
            data-testid="home-utility-header"
            className="mx-auto flex w-full max-w-[80rem] items-center justify-between gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5 lg:px-8"
            dir="ltr"
          >
            <div
              data-testid="hijri-date"
              className="min-w-0 text-[0.8125rem] font-bold text-on-media-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] sm:text-[0.9375rem]"
            >
              <time className="block truncate" dateTime={now.toISOString()}>
                {formatDisplayDate(now, language, calendarType)}
              </time>
            </div>

            <div
              role="img"
              data-testid="home-header-stats"
              className="flex shrink-0 items-center gap-3"
              aria-label={t(language, "home.headerStatsAria", {
                palms: formatNumerals(gardenSummary.lifetimePalms, language),
                leaves: formatNumerals(gardenSummary.today.goldenLeafCount, language),
                total: formatNumerals(MAIN_CATEGORY_IDS.length, language),
                streak: formatNumerals(streakDays, language),
              })}
            >
              <div
                data-testid="header-streak"
                className="flex items-center justify-center gap-1 text-[0.75rem] font-black text-on-media-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                title={t(language, "progress.dailyStreak")}
              >
                <Zap className="h-[13px] w-[13px] text-on-media-accent" strokeWidth={2.5} aria-hidden="true" />
                <span>{formatNumerals(streakDays, language)}</span>
              </div>
              <div
                data-testid="header-palms"
                className="flex items-center justify-center gap-1 text-[0.75rem] font-black text-on-media-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                title={t(language, "progress.palmsTitle")}
              >
                <PalmTreeMark
                  size={14}
                  strokeWidth={4}
                  filled={gardenSummary.lifetimePalms > 0}
                  className="text-on-media-accent"
                />
                <span>{formatNumerals(gardenSummary.lifetimePalms, language)}</span>
              </div>
            </div>
          </header>
        </div>
        <div className="flex w-full flex-col gap-4 lg:gap-5">
          <div
            data-testid="home-hero"
            className="relative isolate min-h-[36rem] w-full overflow-hidden rounded-b-3xl bg-on-media-surface sm:mx-auto sm:min-h-[38rem] sm:max-w-[80rem] sm:rounded-b-3xl sm:shadow-raised lg:min-h-[34rem]"
          >
            <div
              data-testid="time-of-day-scene-window"
              className="absolute inset-0 -z-10 overflow-hidden"
              aria-hidden="true"
            >
              <TimeOfDayBackground categoryId={homeBackgroundCategoryId} />
            </div>

            {/* items-stretch, not items-center: the wird card should match the
                hero's height rather than float centred against it. */}
            {showHeroContent && (
              <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-[80rem] flex-col items-stretch justify-end gap-4 px-4 pb-5 pt-24 sm:px-6 sm:pb-6 sm:pt-28 md:px-8 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-5 lg:px-8 lg:pb-8 lg:pt-20">
                {showCompletionCard && (
                  <div className={quietProgressEnabled ? "h-full" : "h-full lg:col-span-2"}>
                    <TranquilityCompletionCard
                      categoryId={reminderInfo.categoryId}
                      language={language}
                      isExiting={completionCardState === "exiting"}
                    />
                  </div>
                )}
                {showRoutineCard && (
                  <PrayerRoutineCard
                    language={language}
                    direction={direction}
                    categoryName={isArabic ? reminderCategory.nameArabic : reminderCategory.name}
                    description={reminderInfo.desc}
                    mode={reminderMode}
                    onModeChange={(mode) => {
                      if (isRoutineCategory(reminderInfo.categoryId)) {
                        onSetRoutineMode?.(reminderInfo.categoryId, mode);
                      }
                    }}
                    completedCount={doneCount}
                    totalCount={totalCount}
                    estimatedMinutes={estimatedMinutes}
                    ctaLabel={ctaLabel}
                    onOpen={() => onResume(reminderInfo.categoryId)}
                  />
                )}

                {/* Today's Wird ("وردك اليوم") beside the hero. TodayRoutineGarden already
              renders exactly this card; a second bespoke one would duplicate it. */}
                {quietProgressEnabled && (
                  <div className={`flex h-full w-full ${isComplete && !showCompletionCard ? "lg:col-span-2" : ""}`}>
                    <TodayRoutineGarden
                      summary={gardenSummary}
                      language={language}
                      hideTabs={true}
                      calendarType={calendarType}
                      dailyCompletions={dailyCompletions}
                      progressDayStartHour={progressDayStartHour}
                      onSelectCategory={onResume}
                      visibleCategoryIds={HOME_WIRD_CATEGORY_IDS}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-page">
            <section
              data-testid="after-prayer-trackers"
              dir={direction}
              className="overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-raised"
            >
              <div className="border-b border-border/70 bg-muted/35 px-4 py-5 text-start sm:px-6">
                <h2 className="text-[1.375rem] font-black leading-tight text-foreground" dir="auto">
                  {t(language, "progress.postPrayerAzkar")}
                </h2>
                <p className="mt-2 text-[0.8125rem] font-semibold leading-5 text-muted-foreground" dir="auto">
                  {t(language, "home.prayerTrackerHint")}
                </p>
              </div>

              <div className="mx-4 mt-5 h-2 overflow-hidden rounded-full bg-muted sm:mx-6" aria-hidden="true">
                <div
                  className={`h-full rounded-full bg-primary transition-[transform] duration-emphasis ease-out ${
                    direction === "rtl" ? "origin-right" : "origin-left"
                  }`}
                  style={{
                    transform: `scaleX(${(activePrayerIndex + 1) / AFTER_PRAYER_TRACKER_ORDER.length})`,
                  }}
                />
              </div>

              <div className="mx-4 mb-4 mt-5 sm:mx-6 sm:mb-6">
                <div
                  data-testid="after-prayer-carousel"
                  className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5"
                >
                  {AFTER_PRAYER_TRACKER_ORDER.map((prayer, index) => {
                    const isActivePrayer = index === activePrayerIndex;
                    const isPastPrayer = index < activePrayerIndex;
                    const isCompletedPrayer = completedAfterPrayersToday.has(prayer);
                    const isNextPrayer = prayer === nextPrayerInfo.name;
                    const stateLabel = isCompletedPrayer
                      ? t(language, "progress.completed")
                      : isActivePrayer
                        ? t(language, "home.prayerNow")
                        : isNextPrayer
                          ? t(language, "home.prayerNext")
                          : isPastPrayer
                            ? t(language, "home.prayerEarlier")
                            : t(language, "home.prayerUpcoming");

                    return (
                      <button
                        key={prayer}
                        type="button"
                        onClick={() => (onPrayerResume ? onPrayerResume(prayer) : onResume("after_prayer"))}
                        onFocus={(event) => {
                          if (window.matchMedia("(max-width: 639px)").matches) {
                            event.currentTarget.scrollIntoView({
                              behavior: "auto",
                              block: "nearest",
                              inline: "center",
                            });
                          }
                        }}
                        data-testid={isNextPrayer ? "next-prayer" : undefined}
                        data-prayer-state={
                          isCompletedPrayer
                            ? "completed"
                            : isActivePrayer
                              ? "current"
                              : isNextPrayer
                                ? "next"
                                : isPastPrayer
                                  ? "earlier"
                                  : "upcoming"
                        }
                        className={`relative flex min-h-24 w-[84%] min-w-[84%] snap-center items-center gap-2.5 rounded-3xl border px-3 py-2.5 text-start transition-[background-color,border-color,box-shadow,transform] duration-standard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] sm:w-full sm:min-w-0 lg:min-h-[11rem] lg:flex-col lg:justify-center lg:gap-3 lg:px-2 lg:py-3 lg:text-center ${
                          isCompletedPrayer
                            ? "border-success/45 bg-success/10 text-foreground shadow-[0_12px_28px_color-mix(in_srgb,var(--success)_12%,transparent)]"
                            : isActivePrayer
                              ? "border-primary/60 bg-primary/12 text-foreground shadow-md hover:border-primary/50 hover:bg-card/75"
                              : isNextPrayer
                                ? "border-primary/30 bg-primary/5 text-foreground hover:border-primary/50 hover:bg-card/75 hover:shadow-md"
                                : isPastPrayer
                                  ? "border-border/70 bg-muted/35 text-foreground hover:bg-muted/60"
                                  : "border-border/60 bg-background/35 text-foreground hover:border-primary/25 hover:bg-muted/50"
                        }`}
                        aria-label={`${prayerTrackerLabel(language, prayer)} - ${stateLabel} - ${formatPrayerTimeLabel(currentPrayerPeriod.prayerTimes[prayer], isArabic)}${isNextPrayer ? ` - ${nextPrayerInfo.formattedCountdown}` : ""}`}
                        aria-current={isActivePrayer ? "step" : undefined}
                      >
                        <span
                          className={`relative flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                            isCompletedPrayer
                              ? "bg-success text-success-foreground"
                              : isActivePrayer
                                ? "bg-primary text-primary-foreground"
                                : isNextPrayer
                                  ? "bg-primary/12 text-primary"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <PrayerIcon prayer={prayer} />
                          {isCompletedPrayer ? (
                            <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-success text-success-foreground">
                              <Check size={11} strokeWidth={3} aria-hidden="true" />
                            </span>
                          ) : isActivePrayer || isNextPrayer ? (
                            <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-card text-primary">
                              <Clock size={11} strokeWidth={3} aria-hidden="true" />
                            </span>
                          ) : null}
                        </span>

                        <div className="min-w-0 flex-1 lg:flex-none">
                          <span
                            className="block text-[1rem] font-black leading-tight text-foreground lg:text-[1.0625rem]"
                            dir="auto"
                          >
                            {prayerTrackerLabel(language, prayer)}
                          </span>
                          <time
                            data-testid={isNextPrayer ? "next-prayer-time" : undefined}
                            className="mt-1.5 block text-[0.8125rem] font-black text-foreground"
                            dateTime={currentPrayerPeriod.prayerTimes[prayer]}
                          >
                            {formatPrayerTimeLabel(currentPrayerPeriod.prayerTimes[prayer], isArabic)}
                          </time>
                          <span
                            className={`mt-2 inline-flex min-h-6 items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-black ${
                              isCompletedPrayer
                                ? "bg-success/15 text-success"
                                : isActivePrayer || isNextPrayer
                                  ? "bg-primary/12 text-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {stateLabel}
                          </span>
                          {isNextPrayer ? (
                            <span className="mt-1.5 block text-[0.6875rem] font-bold text-primary" dir="auto">
                              {formatNumerals(nextPrayerInfo.formattedCountdown, language)}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {onOpenCustomCounter && (
            <div className="px-page" data-testid="home-masbaha-entry">
              <TasbeehCounterButton onClick={onOpenCustomCounter} language={language} direction={direction} />
            </div>
          )}

          <div
            role="region"
            aria-label={t(language, "home.thisWeek")}
            tabIndex={0}
            className="px-page flex gap-3.5 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="min-w-[14rem] sm:min-w-0 sm:flex-1 snap-center">
              <StatCard
                title={t(language, "home.thisWeek")}
                icon={<Calendar size={18} />}
                value={formatNumerals(activeDaysThisWeek, language)}
                subtitle={t(language, "home.ofSevenDays")}
              />
            </div>
            <div className="min-w-[14rem] sm:min-w-0 sm:flex-1 snap-center">
              <StatCard
                title={t(language, "home.streakTitle")}
                icon={<Zap size={18} />}
                value={formatNumerals(streakDays, language)}
                subtitle={t(language, "home.consecutiveDays")}
              />
            </div>
            <div className="min-w-[14rem] sm:min-w-0 sm:flex-1 snap-center">
              <StatCard
                title={t(language, "home.totalAzkar")}
                icon={<GoldenPalmMark size={18} />}
                value={formatNumerals(completedCollections, language)}
                subtitle={t(language, "home.collectionsCompleted")}
              />
            </div>
          </div>

          <div className="px-page">
            <SectionDivider label={t(language, "home.yourLibrary")} />
          </div>

          <div className="px-page grid grid-cols-1 items-stretch gap-3.5 lg:grid-cols-2">
            <SavedZikrCard
              language={language}
              direction={direction}
              count={savedZikrIds.size}
              items={savedPreview.map((zikr) => {
                const category = CATEGORIES.find((item) => item.id === zikr.category)!;
                return {
                  id: zikr.id,
                  categoryLabel: isArabic ? category.nameArabic : category.name,
                  displayText: isArabic ? zikr.arabicText : zikr.translation,
                  source: zikr.source,
                };
              })}
              loadingId={savedOpenState.loadingId}
              errorId={savedOpenState.errorId}
              onOpenItem={(id) => {
                const item = savedPreview.find((zikr) => zikr.id === id);
                if (item) void openSavedZikr(item);
              }}
              onOpenLibrary={onOpenSavedLibrary}
            />

            {onOpenBenefits && (
              <button
                type="button"
                onClick={onOpenBenefits}
                className="interactive-elem group relative flex min-h-[16rem] w-full flex-col justify-end overflow-hidden rounded-3xl border border-primary/20 bg-card text-start shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                data-testid="home-benefits-card"
              >
                <div className="absolute inset-0 z-0">
                  <ProductImage name="benefits_zikr" className="h-full w-full object-cover object-[center_42%]" />
                </div>
                <div className="relative z-10 m-3 rounded-2xl bg-on-media-surface/90 p-4 shadow-raised sm:m-4 sm:p-5">
                  <span className="block">
                    <span className="block text-[1.25rem] font-black text-on-media drop-shadow-md">
                      {t(language, "benefits.title")}
                    </span>
                    <span className="mt-2 block max-w-[34rem] text-[0.8125rem] font-semibold leading-6 text-on-media-muted sm:text-[0.875rem]">
                      {t(language, "benefits.homeDescription")}
                    </span>
                    <span className="mt-4 flex items-center gap-2 text-[0.875rem] font-black text-primary drop-shadow-sm">
                      {t(language, "benefits.open")}
                      {direction === "rtl" ? (
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      )}
                    </span>
                  </span>
                </div>
              </button>
            )}
          </div>

          <SectionDivider label={t(language, "home.fridayAzkar")} />

          <FridayHomeCard
            language={language}
            direction={direction}
            expanded={fridayInWindow}
            status={fridayStatus}
            onOpen={onOpenFridayMode}
          />
        </div>
      </div>
    </ScreenContainer>
  );
}
