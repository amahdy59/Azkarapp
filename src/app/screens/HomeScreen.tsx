import { getTimeOfDayZikr, isDhuhaWindow, isFridayFeatureWindow, getHomeBackgroundCategory } from "../homeTime";
export {
  getTimeOfDayZikr,
  isLastThirdOfNight,
  isDhuhaWindow,
  isFridayFeatureWindow,
  isFridayDaytime,
  isFridayMorning,
} from "../homeTime";
import { displayLocationName } from "../content/prayerLocations";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { scheduleIdleAfterPaint } from "../startupMaintenance";
import { ArrowNext, Compass, Sparkles, Zap } from "../components/icons";
import { getQiblaBearing } from "../qibla";
import { PalmTreeMark } from "../components/GardenMarks";
import { HomeWirdSection } from "../components/HomeWirdSection";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import { getContextualEvidence, getReminderContexts, selectLibraryEvidence } from "../dailyEvidence";
import type { DayMomentContext, PrayerMomentContext, ReminderContext } from "../types";
import { DailyEvidenceCard, FridayHomeCard, PrayerRoutineCard } from "../components/HomeCards";
import { PrayerMomentPanel } from "../components/PrayerMomentPanel";
import { VisitorCount } from "../components/VisitorCount";
import { useHomePrayerScroll } from "../hooks/useHomePrayerScroll";
import { usePrayerSelectionAnchor } from "../hooks/usePrayerSelectionAnchor";
import { getReminderPlan, reminderCivilTime } from "../reminderPlan";
import { TodaysPathSheet } from "../components/TodaysPathSheet";
import { createDailyPathIndex, getDailyPathStatus } from "../dailyPath";
import { getLeadingPrayerMoment } from "../prayerMoment";
import { estimateCompletionMinutes, getAzkarForMode, getRoutineProgress, isRoutineCategory } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import type { PrayerName } from "../content/prayerTimes";
import { PrayerTrackerCards, type PrayerTrackingWrite } from "../components/PrayerTrackerCards";
import { buildPrayerCardModels } from "../prayerCardModels";
import { useNow } from "../hooks/useNow";
import { useQuickRoutineShare } from "../hooks/useQuickRoutineShare";
import { formatDisplayDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { getFirstIncompleteZikrIndex, getGardenSummary, getProgressDayKey } from "../progress";
import { fridayKahfOpenedKey } from "../fridayProgress";
import { SituationalShortcuts } from "../components/SituationalShortcuts";
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

const seenCompletions = new Set<string>();

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

function hasStartedFridayKahf(): boolean {
  try {
    return window.localStorage.getItem(fridayKahfOpenedKey()) === "true";
  } catch {
    return false;
  }
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
  homeVisualEffects: requestedHomeVisualEffects = true,
  homeWirdImages = false,
  homeMaterial = "system",
  reduceMotion = false,
  progressDayStartHour,
  language,
  direction,
  calendarType = "hijri",
  hijriDateOffset = 0,
  locationSettings,
  onResume,
  onOpenPrayerAdhkar,
  mosquePrayerGoal,
  dailyPathStartDayKey,
  onOpenFridayMode,
  routineModes,
  onSetRoutineMode,
  onOpenWirdBenefits,
  onOpenKhatmah,
  onOpenProgress,
  onOpenQibla,
  onOpenMasbaha,
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
  homeWirdImages?: boolean;
  homeMaterial?: "inherit" | "system" | "glass" | "solid";
  reduceMotion?: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  hijriDateOffset?: number;
  locationSettings?: LocationSettings;
  onResume: (category: CategoryId) => void;
  /** Opens that prayer's own adhkar, as the prayer screen's card does. */
  onOpenPrayerAdhkar?: (prayer: PrayerName) => void;
  mosquePrayerGoal?: number;
  dailyPathStartDayKey?: string;
  onMosquePrayerGoalChange?: (goal: number | undefined) => void;
  onOpenFridayMode: () => void;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onSetRoutineMode?: (categoryId: RoutineCategoryId, mode: RoutineMode) => void;
  onOpenWirdBenefits?: () => void;
  onOpenKhatmah?: () => void;
  onOpenProgress?: () => void;
  onOpenQibla?: () => void;
  onOpenMasbaha?: () => void;
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
  const scrolledHomeRef = useRef(false);
  const [failedBackgroundCategory, setFailedBackgroundCategory] = useState<string | null>(null);
  const isArabic = language === "ar";
  const now = useNow();
  const [fridayKahfStarted] = useState(hasStartedFridayKahf);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName | null>(null);
  const [dismissedAutoPrayer, setDismissedAutoPrayer] = useState<PrayerName | null>(null);

  /* How each day is judged. Days before the reader's daily path started keep
     the verdict they were lived under — see dailyPath.ts — so this is one
     function for both eras rather than a flag the callers have to remember. */
  const judgeDay = useMemo(() => {
    const getDay = createDailyPathIndex({
      dailyCompletions,
      wirdHistory: wirdHistory ?? {},
      quranWirdPlan,
      quranWirdDailyGoals,
      prayerTracking,
      mosquePrayerGoal,
      dailyPathStartDayKey,
    });
    return (dayKey: string) => {
      const status = getDay(dayKey);
      return { palm: status.palmEarned, qualifies: status.streakQualified };
    };
  }, [
    dailyCompletions,
    dailyPathStartDayKey,
    mosquePrayerGoal,
    prayerTracking,
    quranWirdDailyGoals,
    quranWirdPlan,
    wirdHistory,
  ]);

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
  const currentReminderContexts = useMemo(() => {
    /* Every one of these is read from a clock the app already keeps. The
       weekday comes from `now`; the prayer window from the leading moment; the
       last third from the collection the hour already resolves to, which is
       what "comprehensive_duas" means late at night. `dhuha` is deliberately
       not derived: sunrise is computed inside the prayer maths and not
       reported, and guessing the forenoon from the leading prayer would be a
       second clock disagreeing with the first. */
    const reminderNow = reminderCivilTime(now, locationSettings);
    const timedReminder = getTimeOfDayZikr(reminderNow, language, locationSettings);
    const weekday = reminderNow.getDay();
    const dayMoments: DayMomentContext[] = [];
    if (weekday === 5 && leadingPrayer?.prayer === "asr") dayMoments.push("friday_after_asr");
    if (weekday === 5) dayMoments.push("friday");
    if (weekday === 1) dayMoments.push("monday");
    if (weekday === 4) dayMoments.push("thursday");

    const prayerMoment: PrayerMomentContext | undefined =
      timedReminder.categoryId === "comprehensive_duas"
        ? "last_third"
        : leadingPrayer?.prayer === "fajr" && leadingPrayer.phase === "approaching"
          ? "before_fajr"
          : /* The forenoon only counts when no prayer is close enough to lead:
               a reader inside Dhuhr's approach is being called to Dhuhr, not to
               the Duha they could have prayed an hour ago. */
            (leadingPrayer?.prayer ?? (isDhuhaWindow(reminderNow, locationSettings) ? "dhuha" : undefined));

    return getReminderContexts({
      afterPrayer: leadingPrayer?.phase === "recorded" && !leadingPrayer.adhkarDone,
      activePrayer: leadingPrayer ? "after_prayer" : undefined,
      timedCollection: timedReminder.categoryId,
      prayerMoment,
      dayMoments,
    });
  }, [language, leadingPrayer, locationSettings, now]);
  const reminderPlan = useMemo(
    () =>
      getReminderPlan({
        now,
        location: locationSettings,
        contexts: currentReminderContexts,
        hijriOffset: hijriDateOffset,
      }),
    [currentReminderContexts, hijriDateOffset, locationSettings, now],
  );
  // Clock ticks can recreate the same contexts. Keep optional loading tied to
  // a meaningful context change rather than every new Date/array identity.
  const reminderContextKey = reminderPlan.contexts.join("|");
  const reminderContexts = useMemo(
    () => (reminderContextKey ? (reminderContextKey.split("|") as ReminderContext[]) : []),
    [reminderContextKey],
  );

  const reminderSlotKey = reminderPlan.key;

  const [manualEvidenceOffset, setManualEvidenceOffset] = useState(0);

  useEffect(() => {
    setManualEvidenceOffset(0);
  }, [reminderContexts, reminderSlotKey]);

  const contextualEvidence = useMemo(
    () => getContextualEvidence(reminderSlotKey, language, reminderContexts, manualEvidenceOffset),
    [language, manualEvidenceOffset, reminderContexts, reminderSlotKey],
  );

  /* Complete readings load after first paint from the verified R2/offline package,
     including the unchanged schedule and Quran records. Do not briefly show
     unverified legacy excerpts while this catalogue is being unpacked. */
  const [libraryEvidence, setLibraryEvidence] = useState<ReturnType<typeof getContextualEvidence>>(null);
  const [readingCatalogue, setReadingCatalogue] = useState<Awaited<
    ReturnType<typeof import("../content/reminderReadings").loadReminderReadings>
  > | null>(null);
  useEffect(() => {
    let cancelled = false;
    // Keep the current verified card until its replacement is ready. Clearing
    // it here briefly rotates through a contextual fallback on every refresh.
    const load = async () => {
      const catalogue = await import("../content/reminderReadings");
      if (cancelled) return;
      const readings = await catalogue.loadReminderReadings();
      if (cancelled) return;
      setReadingCatalogue(readings);
      setLibraryEvidence(
        selectLibraryEvidence(
          readings.library,
          readings.verses,
          reminderSlotKey,
          language,
          reminderContexts,
          manualEvidenceOffset,
        ),
      );
    };

    const cancelScheduled = scheduleIdleAfterPaint(() => void load().catch(() => undefined), {
      timeout: 2000,
      fallbackDelay: 200,
    });
    return () => {
      cancelled = true;
      cancelScheduled();
    };
  }, [language, manualEvidenceOffset, reminderContexts, reminderSlotKey]);

  /* The library wins only where it is at least as specific as what the corpus
     found. Otherwise a Friday source would displace the Asr one the reader is
     actually in the window for. */
  const dailyEvidence = useMemo(() => {
    let evidence = contextualEvidence?.evidence ?? null;
    if (libraryEvidence) {
      const rank = (context: ReminderContext) => reminderContexts.indexOf(context);
      if (
        manualEvidenceOffset > 0 ||
        !contextualEvidence ||
        rank(libraryEvidence.context) <= rank(contextualEvidence.context)
      ) {
        evidence = libraryEvidence.evidence;
      }
    }
    return evidence && readingCatalogue ? readingCatalogue.withReminderReading(evidence, language) : null;
  }, [contextualEvidence, language, libraryEvidence, manualEvidenceOffset, readingCatalogue, reminderContexts]);
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
    if (!isComplete || !reminderInfo.categoryId) {
      setCompletionCardState("hidden");
      return;
    }

    const completionId = `${todayKey}-${reminderInfo.categoryId}`;
    if (seenCompletions.has(completionId)) {
      setCompletionCardState("hidden");
      return;
    }

    seenCompletions.add(completionId);
    setCompletionCardState("visible");
    const exitTimer = window.setTimeout(() => setCompletionCardState("exiting"), 3_600);
    const hideTimer = window.setTimeout(() => setCompletionCardState("hidden"), 4_100);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isComplete, reminderInfo.categoryId, todayKey]);

  const showCompletionCard = isComplete && completionCardState !== "hidden";
  const showRoutineCard = !isComplete;
  const showHeroContent = showCompletionCard || showRoutineCard || quietProgressEnabled;
  const estimatedMinutes = useMemo(() => estimateCompletionMinutes(visibleReminderAzkar), [visibleReminderAzkar]);
  const prayerCardModels = useMemo(
    () => buildPrayerCardModels(now, language, locationSettings),
    [now, language, locationSettings],
  );
  const homeScrollRef = useRef<HTMLDivElement>(null);
  const homeStickyRef = useRef<HTMLDivElement>(null);
  const prayerPanelRef = useRef<HTMLElement>(null);
  const { condensed: prayerCardsCondensed, updateScroll: updatePrayerScroll } = useHomePrayerScroll();

  useEffect(() => {
    const scroll = homeScrollRef.current;
    const sticky = homeStickyRef.current;
    if (!scroll || !sticky) return;
    // Keep native focus/scroll-into-view recovery below the full sticky cards,
    // including when text size, viewport width or safe-area insets change.
    let expandedHeight = sticky.getBoundingClientRect().height;
    let viewportHeight = scroll.clientHeight;
    const measure = (entries: ResizeObserverEntry[] = []) => {
      const stickyEntry = entries.find((entry) => entry.target === sticky);
      const height = stickyEntry?.borderBoxSize?.[0]?.blockSize ?? sticky.getBoundingClientRect().height;
      if (entries.some((entry) => entry.target === scroll)) viewportHeight = scroll.clientHeight;
      const expansion = Number(getComputedStyle(sticky).getPropertyValue("--home-prayer-expansion"));
      if (expansion === 1) expandedHeight = height;
      // Finish geometry reads before changing styles. A read after changing
      // the reserved margin forced a second full layout on every motion frame.
      const fits = height + 44 < viewportHeight;
      const reserved = `${Math.max(0, expandedHeight - height)}px`;
      const padding = `${fits ? height + 8 : 8}px`;
      // Keep the same content coordinates while the sticky footprint contracts.
      // This reserved flow space scrolls away normally, without scrollTop writes.
      if (sticky.style.getPropertyValue("--home-prayer-reserved-space") !== reserved)
        sticky.style.setProperty("--home-prayer-reserved-space", reserved);
      // A short landscape or enlarged-text viewport must still expose the
      // content below the cards. Restore ordinary scrolling if it cannot.
      const position = fits ? "" : "relative";
      if (sticky.style.position !== position) sticky.style.position = position;
      if (scroll.style.scrollPaddingTop !== padding) scroll.style.scrollPaddingTop = padding;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(sticky);
    observer.observe(scroll);
    measure();
    return () => {
      observer.disconnect();
      scroll.style.removeProperty("scroll-padding-top");
      sticky.style.removeProperty("position");
      sticky.style.removeProperty("--home-prayer-reserved-space");
    };
  }, []);

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

  const homeBackgroundCategoryId = getHomeBackgroundCategory(now, locationSettings);
  const fridayInWindow = isFridayFeatureWindow(now, locationSettings);
  const homeVisualEffects = requestedHomeVisualEffects && failedBackgroundCategory !== homeBackgroundCategoryId;
  const handleBackgroundFailure = useCallback(
    () => setFailedBackgroundCategory(homeBackgroundCategoryId),
    [homeBackgroundCategoryId],
  );
  const fridayKahfComplete = completed.friday_kahf?.has("friday-kahf") ?? false;
  const fridayStatus = fridayKahfComplete ? "review" : fridayKahfStarted ? "continue" : "start";
  const isPrayerHero = Boolean(
    leadingPrayer &&
    (leadingPrayer.phase === "approaching" || leadingPrayer.phase === "now" || leadingPrayer.phase === "recorded"),
  );
  const isRoutineHero = !isPrayerHero && showRoutineCard;
  const autoPrayer = isPrayerHero ? (leadingPrayer?.prayer ?? null) : null;
  const expandedPrayer = selectedPrayer ?? (dismissedAutoPrayer === autoPrayer ? null : autoPrayer);
  const expandedPrayerModel = prayerCardModels.find((model) => model.prayer === expandedPrayer);
  usePrayerSelectionAnchor(homeStickyRef, prayerPanelRef, showHeroContent ? expandedPrayer : null, direction);
  const quickShare = useQuickRoutineShare(reminderInfo.categoryId, language);
  const hasQuranActivity =
    Boolean(quranWirdPlan?.startedDayKey) ||
    (quranReadingPosition?.page ?? 1) > 1 ||
    Object.values(wirdHistory ?? {}).some((pages) => pages.length > 0);

  useEffect(() => {
    if (dismissedAutoPrayer && dismissedAutoPrayer !== autoPrayer) setDismissedAutoPrayer(null);
  }, [autoPrayer, dismissedAutoPrayer]);

  const prayerControlFocused = () => !!homeStickyRef.current?.querySelector(".home-prayer-sticky-row button:focus");
  const handlePrayerOpen = (prayer: PrayerName | null) => {
    setSelectedPrayer(prayer);
    setDismissedAutoPrayer(prayer ? null : autoPrayer);
    // WebKit can leave focus on the native horizontal scroll region after a
    // pointer close. Reconcile now; only a prayer button holds its geometry.
    if (!prayer) updatePrayerScroll(homeScrollRef.current?.scrollTop ?? 0, prayerControlFocused());
  };
  const hasPrimaryContext = showCompletionCard || showRoutineCard;
  const hasContextCompanion = Boolean(dailyEvidence);
  const hasContextStackContent = Boolean(hasPrimaryContext || dailyEvidence);

  /* The named scroll region must itself be keyboard-scrollable. */
  return (
    <ScreenContainer
      dir={direction}
      className={`home-photo-canvas ${homeMaterial === "glass" ? "home-force-glass" : ""} relative isolate flex flex-col overflow-hidden px-0 pt-0 ${
        homeVisualEffects ? "!bg-on-media-surface" : "!bg-background"
      }`}
      style={{ paddingTop: 0 }}
      screenName={t(language, "home.title")}
    >
      {homeVisualEffects && (
        <TimeOfDayBackground categoryId={homeBackgroundCategoryId} onFailure={handleBackgroundFailure} />
      )}
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Scrollable Content Area */}
      <div
        ref={homeScrollRef}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={t(language, "home.title")}
        className="home-content-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-0 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
        onTouchStart={() => {
          if (
            expandedPrayer === null &&
            document.activeElement instanceof HTMLElement &&
            document.activeElement.closest(".home-prayer-sticky-row button")
          ) {
            document.activeElement.blur();
          }
        }}
        onScroll={(event) => {
          const top = event.currentTarget.scrollTop;
          const scrolled = top > (scrolledHomeRef.current ? 2 : 8);
          if (scrolledHomeRef.current !== scrolled) {
            scrolledHomeRef.current = scrolled;
            setHasScrolledHomeContent(scrolled);
          }
          updatePrayerScroll(top, expandedPrayer !== null || prayerControlFocused());
        }}
      >
        {/* Sticky Header Overlay */}
        <div
          ref={homeStickyRef}
          onBlurCapture={(event) => {
            if (
              !expandedPrayer &&
              !(event.relatedTarget instanceof Element && event.relatedTarget.closest(".home-prayer-sticky-row button"))
            )
              updatePrayerScroll(homeScrollRef.current?.scrollTop ?? 0);
          }}
          data-testid="home-sticky-prayers"
          data-scrolled={hasScrolledHomeContent || undefined}
          data-prayer-cards-condensed={prayerCardsCondensed || undefined}
          data-home-motion={reduceMotion ? "reduced" : undefined}
          className="home-prayer-sticky pointer-events-none sticky inset-x-0 top-0 z-50 overflow-visible"
        >
          <header
            data-testid="home-utility-header"
            data-scrolled={hasScrolledHomeContent || undefined}
            className={`${homeVisualEffects ? "hero-glass home-glass-surface home-glass-header" : ""} w-full pt-2 pb-1 sm:pt-3 sm:pb-2 transition-[background-color,box-shadow] duration-standard ${
              homeVisualEffects
                ? hasScrolledHomeContent
                  ? "shadow-none"
                  : ""
                : hasScrolledHomeContent
                  ? "bg-background shadow-none"
                  : "bg-background shadow-none"
            }`}
            dir={direction}
          >
            <div
              data-testid="home-header-content"
              className="home-layout-frame px-page mx-auto flex w-full max-w-7xl items-center justify-between gap-3"
            >
              <div
                data-testid="hijri-date"
                className={`min-w-0 flex-1 text-start text-label font-bold leading-tight sm:text-subtitle ${
                  homeVisualEffects ? "text-on-media-accent drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]" : "text-primary"
                }`}
              >
                <time className="block" dateTime={now.toISOString()} dir="auto">
                  {formatDisplayDate(now, language, calendarType, hijriDateOffset)}
                </time>
              </div>
              <div className={`shrink-0 ${homeVisualEffects ? "text-on-media-accent" : "text-primary"}`}>
                <button
                  type="button"
                  data-testid="home-header-routine-summary-mobile"
                  onClick={() => setPathSheetOpen(true)}
                  aria-label={`${t(language, "dailyPath.title")}: ${t(language, "progress.lifetimePalmsSummary")}: ${formatNumerals(gardenSummary.lifetimePalms, language)}, ${t(language, "progress.activeStreakSummary")}: ${formatNumerals(gardenSummary.currentUsageStreak ?? 0, language)}`}
                  className="home-header-path-button pointer-events-auto flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring min-[600px]:hidden"
                >
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <PalmTreeMark size={20} className="control-cue" strokeWidth={3} />
                    <bdi>{formatNumerals(gardenSummary.lifetimePalms, language)}</bdi>
                  </span>
                  <span className="home-header-path-divider" aria-hidden="true" />
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <Zap size={18} className="control-cue" />
                    <bdi>{formatNumerals(gardenSummary.currentUsageStreak ?? 0, language)}</bdi>
                  </span>
                </button>
                <button
                  type="button"
                  data-testid="home-header-routine-summary"
                  onClick={() => setPathSheetOpen(true)}
                  aria-label={`${t(language, "dailyPath.title")}: ${t(language, "progress.lifetimePalmsSummary")}: ${formatNumerals(gardenSummary.lifetimePalms, language)}, ${t(language, "progress.activeStreakSummary")}: ${formatNumerals(gardenSummary.currentUsageStreak ?? 0, language)}`}
                  className="home-header-path-button pointer-events-auto hidden min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring min-[600px]:flex"
                >
                  <span className="hidden min-[900px]:inline" aria-hidden="true">
                    {t(language, "dailyPath.title")}
                  </span>
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <PalmTreeMark size={20} className="control-cue" strokeWidth={3} />
                    <bdi>{formatNumerals(gardenSummary.lifetimePalms, language)}</bdi>
                  </span>
                  <span className="home-header-path-divider" aria-hidden="true" />
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <Zap size={18} className="control-cue" />
                    <bdi>{formatNumerals(gardenSummary.currentUsageStreak ?? 0, language)}</bdi>
                  </span>
                </button>
              </div>
            </div>
          </header>
          {showHeroContent && (
            <div className="home-layout-frame home-prayer-sticky-row pointer-events-auto mx-auto w-full max-w-7xl px-page">
              <div data-testid="home-prayer-strip" className="relative z-10 mx-auto w-full min-w-0 overflow-visible">
                <h2 className="sr-only">{t(language, "prayerMoment.dayTitle")}</h2>
                <PrayerTrackerCards
                  models={prayerCardModels}
                  language={language}
                  direction={direction}
                  records={prayerTracking}
                  dayKey={todayKey}
                  onToggle={onTogglePrayerTracking ?? (() => undefined)}
                  onOpen={handlePrayerOpen}
                  onGlass={homeVisualEffects}
                  summaryOnly
                  compactSummary
                  selectedPrayer={expandedPrayer}
                />
              </div>
            </div>
          )}
        </div>
        <div
          data-testid="home-content-grid"
          className="home-layout-frame mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:gap-5"
        >
          <div data-testid="home-hero" className="relative w-full">
            {showHeroContent && (
              <div className="relative z-10 mx-auto flex w-full flex-col items-stretch justify-end gap-4 px-page pb-5 sm:pb-6 lg:gap-5 lg:pb-8">
                <div
                  data-testid="home-context-grid"
                  className={`grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 ${
                    hasContextStackContent && !expandedPrayer ? "items-stretch" : "items-start"
                  }`}
                  dir={direction}
                >
                  <div data-testid="home-prayer-column" className="contents">
                    {expandedPrayer && (
                      <section
                        ref={prayerPanelRef}
                        id="home-expanded-prayer"
                        data-testid="home-prayer-moment"
                        data-prayer={expandedPrayer}
                        aria-label={t(language, "prayerMoment.homeTitle")}
                        className="home-prayer-connected-panel mx-auto w-full min-w-0 justify-self-center md:col-span-2"
                      >
                        <PrayerMomentPanel
                          prayer={expandedPrayer}
                          language={language}
                          direction={direction}
                          records={prayerTracking}
                          dayKey={todayKey}
                          calendarType={calendarType}
                          hijriDateOffset={hijriDateOffset}
                          locationSettings={locationSettings}
                          now={now}
                          onToggle={onTogglePrayerTracking ?? (() => undefined)}
                          onOpenAdhkar={(prayer) =>
                            onOpenPrayerAdhkar ? onOpenPrayerAdhkar(prayer) : onResume("after_prayer")
                          }
                          onGlass={homeVisualEffects}
                          canRecord={expandedPrayerModel?.isRecordable ?? false}
                        />
                      </section>
                    )}
                  </div>

                  {hasContextStackContent && (
                    <div data-testid="home-context-stack" className="contents">
                      {/* Contextual Hero */}
                      {hasPrimaryContext && (
                        <div
                          data-testid="home-primary-card"
                          className={`grid w-full min-w-0 justify-self-center ${hasContextCompanion ? "md:col-span-1" : "md:col-span-2"}`}
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
                          ) : showRoutineCard ? (
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
                              quickShare={quickShare}
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
                        <div
                          data-testid="home-context-companion"
                          className={`flex w-full min-w-0 justify-self-center ${hasPrimaryContext ? "md:col-span-1" : "md:col-span-2"}`}
                        >
                          <DailyEvidenceCard
                            language={language}
                            direction={direction}
                            evidence={dailyEvidence}
                            onRefresh={() => setManualEvidenceOffset((prev) => prev + 1)}
                            onGlass={homeVisualEffects}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Today's Wird needs the full row: its three routine tiles must
                      respond to their own available width, not the viewport. */}
                  {quietProgressEnabled && (
                    <div data-testid="home-wird-row" className="w-full min-w-0 justify-self-center md:col-span-2">
                      <HomeWirdSection
                        summary={gardenSummary}
                        language={language}
                        onSelectCategory={onResume}
                        onOpenWirdBenefits={onOpenWirdBenefits}
                        quranWird={{
                          progress: dailyPath.quran.progress,
                          goal: dailyPath.quran.goal,
                          complete: dailyPath.quran.complete,
                          active: dailyPath.quran.active,
                          onPress: hasQuranActivity
                            ? (onContinueKhatmah ?? onOpenKhatmah ?? (() => undefined))
                            : (onOpenKhatmah ?? (() => undefined)),
                        }}
                        onGlass={homeVisualEffects}
                        showImages={homeWirdImages}
                        recommendedCategoryId={isRoutineHero ? reminderInfo.categoryId : undefined}
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
            palmCount={gardenSummary.lifetimePalms}
            streakCount={gardenSummary.currentUsageStreak ?? 0}
            language={language}
            direction={direction}
            onViewProgress={onOpenProgress}
            onClose={() => setPathSheetOpen(false)}
            onGlass={false}
          />

          {fridayInWindow && (
            <div className="px-page mx-auto w-full">
              <FridayHomeCard
                language={language}
                direction={direction}
                expanded
                status={fridayStatus}
                onOpen={onOpenFridayMode}
                onGlass={homeVisualEffects}
              />
            </div>
          )}

          <div className="px-page mx-auto w-full">
            <SituationalShortcuts language={language} onOpen={onResume} onGlass={homeVisualEffects} />
          </div>

          {/* Devotional Tools: Qiblah & Masbaha */}
          {(onOpenQibla || onOpenMasbaha) && (
            <div className="px-page mx-auto w-full">
              <div className={`grid grid-cols-1 gap-3 ${onOpenQibla && onOpenMasbaha ? "sm:grid-cols-2" : ""}`}>
                {onOpenQibla && (
                  <button
                    type="button"
                    onClick={onOpenQibla}
                    data-testid="home-tool-qibla"
                    className={`group flex items-center justify-between gap-4 rounded-3xl px-4 py-3 text-start transition-[background-color,border-color,transform] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      homeVisualEffects
                        ? "hero-glass home-glass-surface text-on-media hover:border-white/30"
                        : "border border-border bg-card text-foreground shadow-raised hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`control-cue flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                          homeVisualEffects
                            ? "border border-white/20 bg-white/10 text-on-media-accent"
                            : "border border-primary/30 bg-primary/10 text-primary"
                        }`}
                        aria-hidden="true"
                      >
                        <Compass size={22} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-subtitle font-extrabold text-foreground">
                          {t(language, "qibla.title")}
                        </span>
                        <span className="block text-micro font-semibold text-muted-foreground">
                          {locationSettings?.latitude != null && locationSettings?.longitude != null
                            ? `${displayLocationName(locationSettings, language) || t(language, "qibla.currentLocation")} · ${formatNumerals(
                                Math.round(getQiblaBearing(locationSettings.latitude, locationSettings.longitude)),
                                language,
                              )}°`
                            : t(language, "more.qiblaDescription")}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                        homeVisualEffects ? "text-on-media-accent" : "text-primary"
                      }`}
                    >
                      <span>{t(language, "common.open")}</span>
                      <ArrowNext size={14} data-rtl-flip aria-hidden="true" className="control-cue shrink-0" />
                    </span>
                  </button>
                )}

                {onOpenMasbaha && (
                  <button
                    type="button"
                    onClick={onOpenMasbaha}
                    data-testid="home-tool-masbaha"
                    className={`group flex items-center justify-between gap-4 rounded-3xl px-4 py-3 text-start transition-[background-color,border-color,transform] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      homeVisualEffects
                        ? "hero-glass home-glass-surface text-on-media hover:border-white/30"
                        : "border border-border bg-card text-foreground shadow-raised hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`control-cue flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                          homeVisualEffects
                            ? "border border-white/20 bg-white/10 text-on-media-accent"
                            : "border border-primary/30 bg-primary/10 text-primary"
                        }`}
                        aria-hidden="true"
                      >
                        <Sparkles size={22} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-subtitle font-extrabold text-foreground">
                          {t(language, "counter.tasbeehTitle")}
                        </span>
                        <span className="block text-micro font-semibold text-muted-foreground">
                          {t(language, "more.masbahaDescription")}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                        homeVisualEffects ? "text-on-media-accent" : "text-primary"
                      }`}
                    >
                      <span>{t(language, "common.open")}</span>
                      <ArrowNext size={14} data-rtl-flip aria-hidden="true" className="control-cue shrink-0" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
          <footer className="px-page" data-testid="home-visitor-footer">
            <VisitorCount language={language} onMedia={homeVisualEffects} />
          </footer>
        </div>
      </div>
    </ScreenContainer>
  );
}
