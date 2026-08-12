/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Zap,
  ArrowLeft,
  ArrowRight,
  Sparkles,
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
import { getFirstIncompleteZikrIndex, getGardenSummary, MAIN_CATEGORY_IDS } from "../progress";
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
  const afterPrayerCompletedToday = gardenSummary.today.completedCategories.includes("after_prayer");

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
      {/* A scroll region, not a landmark: App.tsx owns the single #main-content. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={t(language, "home.title")}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-0 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      >
        <div className="flex w-full flex-col gap-4 lg:gap-5">
          {/* Hero card. The scene image is contained by this card rather than
              washed across the whole screen, so the page keeps its own surface. */}
          {/* Capped and centred: unbounded, the hero stretched the full width of
              an ultrawide display and the scene image lost all composition. */}
          <div
            data-testid="home-hero"
            className="relative w-full overflow-hidden sm:mx-auto sm:max-w-[80rem] sm:rounded-b-[36px] sm:shadow-raised"
          >
            <TimeOfDayBackground categoryId={homeBackgroundCategoryId} variant="card" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,18,0.04)_0%,rgba(7,11,18,0.16)_16%,rgba(7,11,18,0.34)_42%,rgba(7,11,18,0.64)_72%,rgba(7,11,18,0.82)_100%)]"
            />
            <div className="absolute inset-x-0 top-0 z-20 px-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5 lg:px-8">
              <header
                data-testid="home-utility-header"
                className="flex w-full items-center justify-between gap-3"
                dir="ltr"
              >
                <div
                  data-testid="hijri-date"
                  className="min-w-0 text-[0.8125rem] font-bold text-[#e6be76] sm:text-[0.9375rem]"
                >
                  <time className="block truncate" dateTime={now.toISOString()}>
                    {formatDisplayDate(now, language, calendarType)}
                  </time>
                </div>

                {/* role="img" keeps the two-chip summary discoverable as one
                    meaningful announcement instead of isolated numerals. */}
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
                    className="flex items-center justify-center gap-1 text-[0.75rem] font-black text-[#e6be76]"
                    title={t(language, "progress.dailyStreak")}
                  >
                    <Zap className="h-[13px] w-[13px] text-[#e6be76]" strokeWidth={2.5} aria-hidden="true" />
                    <span>{formatNumerals(streakDays, language)}</span>
                  </div>
                  <div
                    data-testid="header-palms"
                    className="flex items-center justify-center gap-1 text-[0.75rem] font-black text-[#e6be76]"
                    title={t(language, "progress.palmsTitle")}
                  >
                    <PalmTreeMark
                      size={14}
                      filled={gardenSummary.lifetimePalms > 0}
                      className={gardenSummary.lifetimePalms > 0 ? "text-[#e6be76]" : "text-[#e6be76]/70"}
                    />
                    <span>{formatNumerals(gardenSummary.lifetimePalms, language)}</span>
                  </div>
                </div>
              </header>
            </div>

            {/* items-stretch, not items-center: the wird card should match the
                hero's height rather than float centred against it. */}
            {showHeroContent && (
              <div className="relative z-10 flex flex-col items-stretch gap-4 px-4 pb-6 pt-20 sm:p-6 sm:pt-24 md:p-8 lg:grid lg:grid-cols-5 lg:items-stretch lg:gap-5 lg:pt-28">
                {showCompletionCard && (
                  <div className={quietProgressEnabled ? "lg:col-span-3" : "lg:col-span-5"}>
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
                  <div
                    className={`flex h-full w-full ${isComplete && !showCompletionCard ? "lg:col-span-5" : "lg:col-span-2"}`}
                  >
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
            )}
          </div>

          <div className="px-page">
            <section
              data-testid="after-prayer-trackers"
              dir={direction}
              className="overflow-hidden rounded-[30px] border border-border bg-card text-foreground shadow-raised"
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
                  className={`h-full rounded-full bg-primary transition-[transform] duration-500 ease-out ${
                    direction === "rtl" ? "origin-right" : "origin-left"
                  }`}
                  style={{
                    transform: `scaleX(${(activePrayerIndex + 1) / AFTER_PRAYER_TRACKER_ORDER.length})`,
                  }}
                />
              </div>

              <div className="mx-4 mb-4 mt-5 sm:mx-6 sm:mb-6">
                <div className="grid grid-cols-1 gap-2.5 min-[30rem]:grid-cols-2 lg:grid-cols-5">
                  {AFTER_PRAYER_TRACKER_ORDER.map((prayer, index) => {
                    const isActivePrayer = index === activePrayerIndex;
                    const isPastPrayer = index < activePrayerIndex;
                    const isCompletedPrayer = afterPrayerCompletedToday && (isActivePrayer || isPastPrayer);
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
                        onClick={() => onResume("after_prayer")}
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
                        className={`relative flex min-h-24 w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-start transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] lg:min-h-[11rem] lg:flex-col lg:justify-center lg:gap-4 lg:px-3 lg:py-4 lg:text-center ${
                          isCompletedPrayer
                            ? "border-success/45 bg-success/10 text-foreground shadow-[0_12px_28px_color-mix(in_srgb,var(--success)_12%,transparent)]"
                            : isActivePrayer
                              ? "border-primary/60 bg-primary/12 text-foreground shadow-[0_14px_30px_color-mix(in_srgb,var(--primary)_16%,transparent)]"
                              : isNextPrayer
                                ? "border-primary/30 bg-primary/5 text-foreground hover:border-primary/45 hover:bg-primary/10"
                                : isPastPrayer
                                  ? "border-border/70 bg-muted/35 text-foreground hover:bg-muted/60"
                                  : "border-border/60 bg-background/35 text-foreground hover:border-primary/25 hover:bg-muted/50"
                        }`}
                        aria-label={`${prayerTrackerLabel(language, prayer)} - ${stateLabel}`}
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
                            <span className="mt-1.5 block text-[0.6875rem] font-bold text-primary" dir="ltr">
                              {nextPrayerInfo.formattedCountdown}
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

          <div
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
                className="interactive-elem group relative flex min-h-[12rem] w-full flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/20 bg-[linear-gradient(145deg,rgba(245,158,11,0.18),rgba(245,158,11,0.06)_58%,rgba(255,255,255,0.04))] p-5 text-start shadow-sm transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-amber-500/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:p-6"
                data-testid="home-benefits-card"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute end-3 top-3 size-24 rounded-full bg-amber-300/15 blur-2xl"
                />
                <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Sparkles size={24} aria-hidden="true" />
                </span>
                <span className="mt-5 block">
                  <span className="block text-[1.25rem] font-black text-foreground">
                    {t(language, "benefits.title")}
                  </span>
                  <span className="mt-2 block max-w-[34rem] text-[0.8125rem] font-semibold leading-6 text-muted-foreground sm:text-[0.875rem]">
                    {t(language, "benefits.homeDescription")}
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-[0.875rem] font-black text-amber-900 dark:text-amber-200">
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

          <SectionDivider label={t(language, "home.fridayAzkar")} />

          <FridayHomeCard
            language={language}
            direction={direction}
            expanded={fridayInWindow}
            status={fridayStatus}
            onOpen={onOpenFridayMode}
          />

          {/* Tasbeeh Counter Button (Full width matching design system tokens) */}
          {onOpenCustomCounter && (
            <div className="px-page">
              <TasbeehCounterButton onClick={onOpenCustomCounter} language={language} direction={direction} />
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
