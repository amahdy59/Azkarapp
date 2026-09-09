/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, ArrowRight, Zap } from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { PalmTreeMark, TodayRoutineGarden } from "../components/RoutineGarden";
import { ProductImage } from "../components/ProductImage";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import { getContextualEvidence, getReminderContexts, selectLibraryEvidence } from "../dailyEvidence";
import type { DayMomentContext, PrayerMomentContext, ReminderContext } from "../types";
import { DailyEvidenceCard, FridayHomeCard, PrayerRoutineCard, SavedZikrCard } from "../components/HomeCards";
import { QuranHomeCard } from "../components/QuranHomeCard";
import { PrayerMomentPanel } from "../components/PrayerMomentPanel";
import { TodaysPathSheet } from "../components/TodaysPathSheet";
import { getDailyPathStatus } from "../dailyPath";
import { getLeadingPrayerMoment } from "../prayerMoment";
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
import { getEstimatedPrayerTimes, timeToMinutes, type PrayerName } from "../content/prayerTimes";
import { PrayerTrackerCards, type PrayerTrackingWrite } from "../components/PrayerTrackerCards";
import { buildPrayerCardModels } from "../prayerCardModels";
import { useNow } from "../hooks/useNow";
import { formatDisplayDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { getFirstIncompleteZikrIndex, getGardenSummary, getProgressDayKey } from "../progress";
import { fridayKahfOpenedKey } from "../fridayProgress";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  RoutineCategoryId,
  RoutineMode,
  PrayerTrackingRecord,
  QuranReadingPosition,
  QuranWirdPlan,
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

export function isLastThirdOfNight(now: Date = new Date(), location?: LocationSettings): boolean {
  const fajrToday = timeToMinutes(getEstimatedPrayerTimes(now, location).fajr);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nightStart = new Date(now);
  const nightEnd = new Date(now);

  if (currentMinutes < fajrToday) {
    nightStart.setDate(nightStart.getDate() - 1);
    const maghribYesterday = timeToMinutes(getEstimatedPrayerTimes(nightStart, location).maghrib);
    nightStart.setHours(Math.floor(maghribYesterday / 60), maghribYesterday % 60, 0, 0);
    nightEnd.setHours(Math.floor(fajrToday / 60), fajrToday % 60, 0, 0);
  } else {
    const maghribToday = timeToMinutes(getEstimatedPrayerTimes(now, location).maghrib);
    if (currentMinutes < maghribToday) return false;
    nightStart.setHours(Math.floor(maghribToday / 60), maghribToday % 60, 0, 0);
    nightEnd.setDate(nightEnd.getDate() + 1);
    const fajrTomorrow = timeToMinutes(getEstimatedPrayerTimes(nightEnd, location).fajr);
    nightEnd.setHours(Math.floor(fajrTomorrow / 60), fajrTomorrow % 60, 0, 0);
  }

  const lastThirdStartsAt = nightStart.getTime() + ((nightEnd.getTime() - nightStart.getTime()) * 2) / 3;
  return now.getTime() >= lastThirdStartsAt && now.getTime() < nightEnd.getTime();
}

/**
 * The forenoon, when the Duha prayer is preferred.
 *
 * Derived from the day's own times rather than from a clock: the window is the
 * late part of the stretch between Fajr and Dhuhr, which lands around half past
 * nine to half eleven for a typical day and stays right in a season or a
 * latitude where those hours would not be. A fixed 09:30–11:30 would drift into
 * the wrong part of the morning every time the sun did.
 *
 * The classical window opens shortly after sunrise, but sunrise is computed
 * inside the prayer maths and never reported, and the preferred time is the
 * later portion in any case — which is what a reminder should aim at.
 */
export function isDhuhaWindow(now: Date = new Date(), location?: LocationSettings): boolean {
  const times = getEstimatedPrayerTimes(now, location);
  const fajr = timeToMinutes(times.fajr);
  const dhuhr = timeToMinutes(times.dhuhr);
  if (dhuhr <= fajr) return false;

  const start = fajr + (dhuhr - fajr) * 0.6;
  const end = dhuhr - 30;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= start && current < end;
}

export function getTimeOfDayZikr(now: Date = new Date(), language: AppLanguage = "ar", location?: LocationSettings) {
  if (isLastThirdOfNight(now, location)) {
    return {
      categoryId: "comprehensive_duas" as CategoryId,
      title: t(language, "home.lastThirdTitle"),
      desc: t(language, "home.lastThirdDesc"),
    };
  }

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
  return routineCategoryId;
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
      <h2 className="text-subtitle font-bold text-primary" dir="auto">
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
  homeVisualEffects = true,
  progressDayStartHour,
  language,
  direction,
  calendarType = "hijri",
  locationSettings,
  onResume,
  onOpenPrayerAdhkar,
  onPrayerResume,
  mosquePrayerGoal,
  dailyPathStartDayKey,
  onMosquePrayerGoalChange,
  onOpenFridayMode,
  onOpenProgress: _onOpenProgress,
  routineModes,
  onSetRoutineMode,
  onOpenCustomCounter,
  savedZikrIds,
  onOpenSavedZikr,
  onOpenSavedLibrary,
  onOpenBenefits,
  onOpenWirdBenefits,
  onOpenKhatmah,
  onContinueKhatmah,
  quranReadingPosition,
  quranWirdPlan,
  wirdHistory,
  quranWirdDailyGoals,
  prayerTracking = [],
  onTogglePrayerTracking,
}: {
  completed: Record<CategoryId, Set<string>>;
  dailyCompletions: DailyCollectionCompletion[];
  quranReadingPosition?: QuranReadingPosition;
  quranWirdPlan?: QuranWirdPlan;
  wirdHistory?: Record<string, number[]>;
  /** What the wird goal was on a given day, so a past day keeps its own. */
  quranWirdDailyGoals?: Record<string, number>;
  onContinueKhatmah?: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  quietProgressEnabled: boolean;
  /** Photograph and translucent Home surfaces; false uses normal theme cards. */
  homeVisualEffects?: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  locationSettings?: LocationSettings;
  onResume: (category: CategoryId) => void;
  /** Opens that prayer's own adhkar, as the prayer screen's card does. */
  onOpenPrayerAdhkar?: (prayer: PrayerName) => void;
  /** Opens the prayer screen, which is where the whole day is tracked. */
  onPrayerResume?: (prayer: PrayerName) => void;
  mosquePrayerGoal?: number;
  dailyPathStartDayKey?: string;
  onMosquePrayerGoalChange?: (goal: number | undefined) => void;
  onOpenFridayMode: () => void;
  onOpenProgress?: () => void;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onSetRoutineMode?: (categoryId: RoutineCategoryId, mode: RoutineMode) => void;
  onOpenCustomCounter?: () => void;
  savedZikrIds: Set<string>;
  onOpenSavedZikr?: (categoryId: CategoryId, index: number) => void;
  onOpenSavedLibrary?: () => void;
  onOpenBenefits?: () => void;
  onOpenWirdBenefits?: () => void;
  onOpenKhatmah?: () => void;
  prayerTracking?: readonly PrayerTrackingRecord[];
  /* Widened to PrayerTrackingWrite because the prayer panel records where a
     prayer was prayed, not only that it was. The tracker cards below still
     pass the narrower field set, which this signature accepts. */
  onTogglePrayerTracking?: (
    prayer: PrayerName,
    field: PrayerTrackingWrite,
    next: boolean | "mosque" | "home" | null,
  ) => void;
}) {
  const [hasScrolledHomeContent, setHasScrolledHomeContent] = useState(false);
  const isArabic = language === "ar";
  const now = useNow();
  const [savedOpenState, setSavedOpenState] = useState<{
    loadingId: string | null;
    errorId: string | null;
  }>({ loadingId: null, errorId: null });
  const [fridayKahfStarted] = useState(hasStartedFridayKahf);

  /* How each day is judged. Days before the reader's daily path started keep
     the verdict they were lived under — see dailyPath.ts — so this is one
     function for both eras rather than a flag the callers have to remember. */
  const judgeDay = useCallback(
    (dayKey: string) => {
      const status = getDailyPathStatus({
        dayKey,
        dailyCompletions,
        wirdHistory: wirdHistory ?? {},
        quranWirdPlan,
        quranWirdDailyGoals,
        prayerTracking,
        mosquePrayerGoal,
        dailyPathStartDayKey,
      });
      return { palm: status.palmEarned, qualifies: status.streakQualified };
    },
    [
      dailyCompletions,
      dailyPathStartDayKey,
      mosquePrayerGoal,
      prayerTracking,
      quranWirdDailyGoals,
      quranWirdPlan,
      wirdHistory,
    ],
  );

  const gardenSummary = useMemo(
    () => getGardenSummary(dailyCompletions, now, progressDayStartHour, judgeDay),
    [dailyCompletions, judgeDay, now, progressDayStartHour],
  );

  const [pathSheetOpen, setPathSheetOpen] = useState(false);
  /* Derived, not stored: every fact here is already a completion, a page or a
     prayer someone recorded. */
  const dailyPath = useMemo(
    () =>
      getDailyPathStatus({
        dayKey: getProgressDayKey(now, progressDayStartHour),
        dailyCompletions,
        wirdHistory: wirdHistory ?? {},
        quranWirdPlan,
        quranWirdDailyGoals,
        prayerTracking,
        mosquePrayerGoal,
        dailyPathStartDayKey,
      }),
    [
      dailyCompletions,
      dailyPathStartDayKey,
      mosquePrayerGoal,
      now,
      prayerTracking,
      progressDayStartHour,
      quranWirdDailyGoals,
      quranWirdPlan,
      wirdHistory,
    ],
  );

  /* The prayer worth leading with, if any. Home shows the whole card while one
     is live so that recording a prayer happening right now costs no
     navigation; outside those windows it stays the compact five below. */
  const leadingPrayer = useMemo(
    () =>
      getLeadingPrayerMoment({
        now,
        dayKey: getProgressDayKey(now, progressDayStartHour),
        records: prayerTracking,
        location: locationSettings,
      }),
    [locationSettings, now, prayerTracking, progressDayStartHour],
  );

  const todayKey = getProgressDayKey(now, progressDayStartHour);
  // Keyed to the progress day, so the narration turns over on the same boundary
  // the routines do rather than at civil midnight.

  const reminderInfo = useMemo(
    () => getTimeOfDayZikr(now, language, locationSettings),
    [now, language, locationSettings],
  );
  const reminderCategory = CATEGORIES.find((c) => c.id === reminderInfo.categoryId)!;

  /* One reviewed reminder chosen for the moment rather than for the date.
     The contexts come from what the app already knows — which prayer's window
     is open, which timed collection the hour belongs to, whether the prayer has
     been recorded and its adhkar are what follows — so this adds no second
     clock and no second content library. Stable for the day within a context,
     so returning to Home does not re-roll it. */
  const reminderContexts = useMemo(() => {
    /* Every one of these is read from a clock the app already keeps. The
       weekday comes from `now`; the prayer window from the leading moment; the
       last third from the collection the hour already resolves to, which is
       what "comprehensive_duas" means late at night. `dhuha` is deliberately
       not derived: sunrise is computed inside the prayer maths and not
       reported, and guessing the forenoon from the leading prayer would be a
       second clock disagreeing with the first. */
    const weekday = now.getDay();
    const dayMoments: DayMomentContext[] = [];
    if (weekday === 5 && leadingPrayer?.prayer === "asr") dayMoments.push("friday_after_asr");
    if (weekday === 5) dayMoments.push("friday");
    if (weekday === 1) dayMoments.push("monday");
    if (weekday === 4) dayMoments.push("thursday");

    const prayerMoment: PrayerMomentContext | undefined =
      reminderInfo.categoryId === "comprehensive_duas"
        ? "last_third"
        : leadingPrayer?.prayer === "fajr" && leadingPrayer.phase === "approaching"
          ? "before_fajr"
          : /* The forenoon only counts when no prayer is close enough to lead:
               a reader inside Dhuhr's approach is being called to Dhuhr, not to
               the Duha they could have prayed an hour ago. */
            (leadingPrayer?.prayer ?? (isDhuhaWindow(now, locationSettings) ? "dhuha" : undefined));

    return getReminderContexts({
      afterPrayer: leadingPrayer?.phase === "recorded" && !leadingPrayer.adhkarDone,
      activePrayer: leadingPrayer ? "after_prayer" : undefined,
      timedCollection: reminderInfo.categoryId,
      prayerMoment,
      dayMoments,
    });
  }, [leadingPrayer, locationSettings, now, reminderInfo.categoryId]);

  const contextualEvidence = useMemo(
    () => getContextualEvidence(todayKey, language, reminderContexts),
    [language, reminderContexts, todayKey],
  );

  /* The reviewed source library is fetched after first paint and never before.
     It is 41 sources of Arabic and English, and a static import would put them
     in the chunk that paints this screen — the growth DEC-153 had to
     re-baseline. Until it resolves the card shows the corpus-derived reminder,
     so nothing is blocked and nothing is empty. */
  const [libraryEvidence, setLibraryEvidence] = useState<ReturnType<typeof getContextualEvidence>>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [{ RELEVANT_NOW_LIBRARY }, { RELEVANT_NOW_VERSES }] = await Promise.all([
        import("../content/relevantNowLibrary"),
        import("../content/relevantNowVerses"),
      ]);
      if (cancelled) return;
      setLibraryEvidence(
        selectLibraryEvidence(RELEVANT_NOW_LIBRARY, RELEVANT_NOW_VERSES, todayKey, language, reminderContexts),
      );
    };

    /* Waited for idle rather than fired on mount. An effect runs while the
       screen is still loading its own collections, so "after first paint" was
       not what this did — it competed with them, and the first thing to suffer
       is the load the reader is actually waiting on. The timeout keeps it from
       being postponed indefinitely on a busy tab. */
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(() => void load(), { timeout: 2000 })
        : window.setTimeout(() => void load(), 200);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [language, reminderContexts, todayKey]);

  /* The library wins only where it is at least as specific as what the corpus
     found. Otherwise a Friday source would displace the Asr one the reader is
     actually in the window for. */
  const dailyEvidence = useMemo(() => {
    if (!libraryEvidence) return contextualEvidence?.evidence ?? null;
    if (!contextualEvidence) return libraryEvidence.evidence;
    const rank = (context: ReminderContext) => reminderContexts.indexOf(context);
    return rank(libraryEvidence.context) <= rank(contextualEvidence.context)
      ? libraryEvidence.evidence
      : contextualEvidence.evidence;
  }, [contextualEvidence, libraryEvidence, reminderContexts]);
  const isLastThirdDua = reminderInfo.categoryId === "comprehensive_duas";
  const doneSet = completed[reminderInfo.categoryId] ?? new Set<string>();

  const reminderMode = isRoutineCategory(reminderInfo.categoryId) ? routineModes[reminderInfo.categoryId] : "complete";
  const visibleReminderAzkar = getAzkarForMode(reminderInfo.categoryId, reminderMode);
  const reminderProgress = isRoutineCategory(reminderInfo.categoryId)
    ? getRoutineProgress(reminderInfo.categoryId, reminderMode, doneSet)
    : {
        done: visibleReminderAzkar.filter((zikr) => doneSet.has(zikr.id)).length,
        total: visibleReminderAzkar.length,
      };
  const totalCount = isLastThirdDua ? 47 : reminderProgress.total;
  const doneCount = isLastThirdDua ? Math.min(doneSet.size, totalCount) : reminderProgress.done;
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
  const prayerCardModels = useMemo(
    () => buildPrayerCardModels(now, language, locationSettings),
    [now, language, locationSettings],
  );

  const actionKind: "start" | "continue" | "again" = doneCount === 0 ? "start" : isComplete ? "again" : "continue";

  const ctaLabel = isLastThirdDua
    ? t(language, "home.lastThirdAction")
    : actionKind === "start"
      ? t(language, "home.startGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
      : actionKind === "again"
        ? t(language, "home.readGroupAgain", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
        : t(language, "home.continueGroupRemaining", {
            name: isArabic ? reminderCategory.nameArabic : reminderCategory.name,
            count: formatNumerals(Math.max(0, totalCount - doneCount), language),
          });

  const homeBackgroundCategoryId = getHomeBackgroundCategoryId(
    now,
    isLastThirdDua ? "before_sleep" : reminderInfo.categoryId,
  );
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

  const isPrayerHero = Boolean(
    leadingPrayer &&
    (leadingPrayer.phase === "approaching" || leadingPrayer.phase === "now" || leadingPrayer.phase === "recorded"),
  );
  const isRoutineHero = !isPrayerHero && showRoutineCard;
  const hasContextCompanion = Boolean(dailyEvidence);

  return (
    <ScreenContainer
      dir={direction}
      className={`relative isolate flex flex-col overflow-hidden px-0 pt-0 ${
        homeVisualEffects ? "!bg-on-media-surface" : "!bg-background"
      }`}
      style={{ paddingTop: 0 }}
      screenName={t(language, "home.title")}
    >
      {homeVisualEffects && <TimeOfDayBackground categoryId={homeBackgroundCategoryId} />}
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Scrollable Content Area */}
      <div
        tabIndex={0}
        role="region"
        aria-label={t(language, "home.title")}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-0 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
        onScroll={(event) => setHasScrolledHomeContent(event.currentTarget.scrollTop > 4)}
      >
        {/* Sticky Header Overlay */}
        <div className="pointer-events-none sticky inset-x-0 top-0 z-50 h-0 overflow-visible">
          <header
            data-testid="home-utility-header"
            data-scrolled={hasScrolledHomeContent || undefined}
            className={`px-page mx-auto flex w-full max-w-[90rem] items-center justify-between gap-3 pt-[max(1rem,env(safe-area-inset-top))] pb-3 transition-[background-color,backdrop-filter,box-shadow] duration-standard sm:pt-5 ${
              homeVisualEffects
                ? hasScrolledHomeContent
                  ? "border-b border-white/10 bg-on-media-surface/95 shadow-sm backdrop-blur-md"
                  : ""
                : "border-b border-border bg-background/95 shadow-sm"
            }`}
            dir="ltr"
          >
            <div
              data-testid="hijri-date"
              className={`min-w-0 text-label font-bold sm:text-subtitle ${
                homeVisualEffects ? "text-on-media-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]" : "text-primary"
              }`}
            >
              {/* Wraps rather than truncates. At 320px "Sunday, Rabiʻ I 24,
                  1448 AH" was clipped to "…14", which drops the year and reads
                  as broken rather than as abbreviated. The date is secondary,
                  so a second line costs less than a mangled one. */}
              <time className="block leading-tight" dateTime={now.toISOString()}>
                {formatDisplayDate(now, language, calendarType)}
              </time>
            </div>
            {/* One control, not two: the streak and the palm are two readings of
                the same day, and they open the same surface. A button rather
                than a decorated span, so it is reachable by keyboard and
                announces what it opens.

                `pointer-events-auto` because the header is a zero-height
                overlay that deliberately lets pointers through to the content
                beneath it. Without opting back in, this button is visible,
                focusable and operable by keyboard while a tap on it lands on
                the hero behind — which is the worst of both.

                `min-h-11` because it is a touch target now. It was a pair of
                decorated spans at the header's own type size, and promoting it
                to a control without giving it a control's size made it the one
                thing on the core flow too small to hit. */}
            <button
              type="button"
              data-testid="home-header-routine-summary"
              onClick={() => setPathSheetOpen(true)}
              aria-label={t(language, "dailyPath.title")}
              className={`pointer-events-auto flex min-h-11 shrink-0 items-center gap-2 rounded-full px-2 text-label font-black transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:text-subtitle ${
                homeVisualEffects
                  ? "text-on-media-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] hover:bg-on-media/10"
                  : "text-primary hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-1" title={t(language, "progress.dailyStreak")}>
                <Zap className="size-4 sm:size-[1.125rem]" strokeWidth={2.5} aria-hidden="true" />
                <bdi>
                  {formatNumerals(gardenSummary.currentPalmRhythm ?? gardenSummary.currentUsageStreak ?? 0, language)}
                </bdi>
                <span>{t(language, "progress.days")}</span>
              </span>
              <span className={`h-4 w-px ${homeVisualEffects ? "bg-on-media/45" : "bg-border"}`} aria-hidden="true" />
              <span className="flex items-center gap-1" title={t(language, "progress.palmsTitle")}>
                <PalmTreeMark size={18} filled={gardenSummary.lifetimePalms > 0} aria-hidden="true" />
                <bdi>{formatNumerals(gardenSummary.lifetimePalms, language)}</bdi>
                <span>{t(language, "progress.palmsUnit")}</span>
              </span>
            </button>
          </header>
        </div>
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 lg:gap-5">
          <div data-testid="home-hero" className="relative isolate w-full pt-16">
            {showHeroContent && (
              <div className="relative z-10 mx-auto flex w-full flex-col items-stretch justify-end gap-4 px-4 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-4 md:px-8 lg:gap-5 lg:px-8 lg:pb-8 lg:pt-5">
                {/* The five daily prayers are the stable navigation and status
                    layer. Context below may change with time; this strip does
                    not move or disappear. */}
                <div data-testid="home-prayer-strip" className="w-full max-w-full overflow-hidden">
                  <PrayerTrackerCards
                    models={prayerCardModels}
                    language={language}
                    direction={direction}
                    records={prayerTracking}
                    dayKey={getProgressDayKey(now, progressDayStartHour)}
                    onToggle={onTogglePrayerTracking ?? (() => undefined)}
                    onOpen={(prayer) => (onOpenPrayerAdhkar ? onOpenPrayerAdhkar(prayer) : onResume("after_prayer"))}
                    onGlass={homeVisualEffects}
                    summaryOnly
                  />
                </div>

                <div
                  data-testid="home-context-grid"
                  className="grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5"
                >
                  {/* Contextual Hero */}
                  {(isPrayerHero || showCompletionCard || isRoutineHero) && (
                    <div
                      data-testid="home-primary-card"
                      className={`grid min-w-0 ${hasContextCompanion ? "lg:col-span-1" : "lg:col-span-2"}`}
                    >
                      {showCompletionCard ? (
                        <div className="h-full">
                          <TranquilityCompletionCard
                            categoryId={reminderInfo.categoryId}
                            language={language}
                            isExiting={completionCardState === "exiting"}
                            onGlass={homeVisualEffects}
                          />
                        </div>
                      ) : isPrayerHero && leadingPrayer ? (
                        <section
                          data-testid="home-prayer-moment"
                          data-prayer={leadingPrayer.prayer}
                          dir={direction}
                          aria-label={t(language, "prayerMoment.homeTitle")}
                          className={`grid h-full grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-2 ${
                            homeVisualEffects ? "hero-glass" : "border border-border bg-card shadow-raised"
                          }`}
                        >
                          <PrayerMomentPanel
                            prayer={leadingPrayer.prayer}
                            language={language}
                            direction={direction}
                            records={prayerTracking}
                            dayKey={getProgressDayKey(now, progressDayStartHour)}
                            locationSettings={locationSettings}
                            now={now}
                            onToggle={onTogglePrayerTracking ?? (() => undefined)}
                            onOpenAdhkar={(prayer) =>
                              onOpenPrayerAdhkar ? onOpenPrayerAdhkar(prayer) : onResume("after_prayer")
                            }
                            onGlass={homeVisualEffects}
                            unified
                          />
                          {onPrayerResume && (
                            <button
                              type="button"
                              onClick={() => onPrayerResume(leadingPrayer.prayer)}
                              data-testid="home-open-prayer-screen"
                              className={`flex min-h-12 w-full items-center justify-center gap-2 border-t px-4 text-label font-black transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring md:col-span-2 ${
                                homeVisualEffects
                                  ? "border-white/10 text-on-media hover:bg-white/10"
                                  : "border-border text-primary hover:bg-muted"
                              }`}
                            >
                              {t(language, "prayerMoment.dayTitle")}
                            </button>
                          )}
                        </section>
                      ) : isRoutineHero ? (
                        <PrayerRoutineCard
                          categoryId={reminderInfo.categoryId}
                          language={language}
                          direction={direction}
                          categoryName={
                            isLastThirdDua
                              ? reminderInfo.title
                              : isArabic
                                ? reminderCategory.nameArabic
                                : reminderCategory.name
                          }
                          description={reminderInfo.desc}
                          mode={reminderMode}
                          showModeSelector={!isLastThirdDua}
                          onModeChange={(mode) => {
                            if (isRoutineCategory(reminderInfo.categoryId)) {
                              onSetRoutineMode?.(reminderInfo.categoryId, mode);
                            }
                          }}
                          completedCount={doneCount}
                          totalCount={totalCount}
                          estimatedMinutes={estimatedMinutes}
                          showEstimate={!isLastThirdDua}
                          ctaLabel={ctaLabel}
                          onOpen={() => onResume(reminderInfo.categoryId)}
                          onGlass={homeVisualEffects}
                        />
                      ) : null}
                    </div>
                  )}

                  {/* One contextual companion keeps the primary action visually dominant. */}
                  {dailyEvidence ? (
                    <div data-testid="home-context-companion" className="flex min-w-0 lg:col-span-1">
                      <DailyEvidenceCard
                        language={language}
                        direction={direction}
                        evidence={dailyEvidence}
                        onGlass={homeVisualEffects}
                      />
                    </div>
                  ) : null}

                  {/* Today's Wird needs the full row: its three routine tiles must
                      respond to their own available width, not the viewport. */}
                  {quietProgressEnabled && (
                    <div data-testid="home-wird-row" className="min-w-0 lg:col-span-2">
                      <TodayRoutineGarden
                        summary={gardenSummary}
                        language={language}
                        hideTabs
                        calendarType={calendarType}
                        dailyCompletions={dailyCompletions}
                        onSelectCategory={onResume}
                        visibleCategoryIds={HOME_WIRD_CATEGORY_IDS}
                        recommendedCategoryId={isRoutineHero ? reminderInfo.categoryId : undefined}
                        onOpenWirdBenefits={onOpenWirdBenefits}
                        onMedia={homeVisualEffects}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <TodaysPathSheet
            open={pathSheetOpen}
            status={dailyPath}
            language={language}
            direction={direction}
            mosquePrayerGoal={mosquePrayerGoal}
            onMosquePrayerGoalChange={(goal) => onMosquePrayerGoalChange?.(goal)}
            onClose={() => setPathSheetOpen(false)}
          />

          {onOpenCustomCounter && (
            <div className="px-page" data-testid="home-masbaha-entry">
              <TasbeehCounterButton
                onClick={onOpenCustomCounter}
                language={language}
                direction={direction}
                onGlass={homeVisualEffects}
              />
            </div>
          )}

          <QuranHomeCard
            language={language}
            direction={direction}
            position={quranReadingPosition}
            plan={quranWirdPlan}
            wirdHistory={wirdHistory ?? {}}
            progressDayStartHour={progressDayStartHour}
            now={now}
            onContinue={onContinueKhatmah ?? (() => {})}
            onOverview={onOpenKhatmah ?? (() => {})}
            onGlass={homeVisualEffects}
          />

          <div className="px-page">
            <SectionDivider label={t(language, "home.yourLibrary")} />
          </div>

          {/* The reminder moved into the hero, beside the routines it explains.
              Leaving a second copy here would have put the same narration on
              the screen twice. */}
          <div className="px-page grid grid-cols-1 items-start gap-3.5 lg:grid-cols-2">
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
              onGlass={homeVisualEffects}
            />

            {onOpenBenefits && (
              <button
                type="button"
                onClick={onOpenBenefits}
                className={`interactive-elem group relative flex min-h-[16rem] w-full flex-col justify-end overflow-hidden rounded-3xl text-start transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  homeVisualEffects ? "hero-glass home-glass-surface" : "border border-border bg-card shadow-raised"
                }`}
                data-testid="home-benefits-card"
              >
                {homeVisualEffects && (
                  <div className="absolute inset-0 z-0">
                    <ProductImage name="benefits_zikr" className="h-full w-full object-cover object-[center_42%]" />
                  </div>
                )}
                <div
                  className={`relative z-10 m-3 rounded-2xl p-4 sm:m-4 sm:p-5 ${
                    homeVisualEffects ? "border border-white/10 bg-black/45 shadow-raised backdrop-blur-md" : "bg-card"
                  }`}
                >
                  <span className="block">
                    <span
                      className={`block text-xl font-black ${homeVisualEffects ? "text-on-media drop-shadow-md" : "text-foreground"}`}
                    >
                      {t(language, "benefits.title")}
                    </span>
                    <span
                      className={`mt-2 block max-w-[34rem] text-label font-semibold leading-6 sm:text-sm ${homeVisualEffects ? "text-on-media-muted" : "text-muted-foreground"}`}
                    >
                      {t(language, "benefits.homeDescription")}
                    </span>
                    <span className="mt-4 flex items-center gap-2 text-sm font-black text-primary drop-shadow-sm">
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

          <div className="px-page">
            <SectionDivider label={t(language, "home.fridayAzkar")} />
          </div>

          <div className="px-page">
            <FridayHomeCard
              language={language}
              direction={direction}
              expanded={fridayInWindow}
              status={fridayStatus}
              onOpen={onOpenFridayMode}
              onGlass={homeVisualEffects}
            />
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}
