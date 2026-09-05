import { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fromCompletedSets, loadAppState, saveAppState, toCompletedSets, type StoredSession } from "./state";
import { applyAppAppearance } from "./theme";
import { getAzkarForMode, getAzkarForPrayer, isRoutineCategory, registerLazyCollection } from "./content/azkar";
import { isPrayerName } from "./content/prayerTimes";
import type {
  AppLanguage,
  AppStateSnapshot,
  CategoryId,
  ColorBlindSupport,
  LocationSettings,
  ReminderSettings,
  RoutineMode,
  TextSizeOption,
  ZikrFontOption,
  ThemeMode,
  PrayerName,
  PrayerTrackingRecord,
  MushafLayout,
  MushafTextScale,
  MushafToolbarSide,
  MushafTheme,
  QuranReadingEvent,
  QuranReadingPosition,
  QuranVerseBookmark,
  QuranWirdPlan,
} from "./types";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { authProviderFlags, isSupabaseConfigured } from "../lib/supabase";
import {
  FRIDAY_KAHF_WEEK_KEY,
  markFridayKahfOpened,
  mergeFridayCycles,
  onFridayProgressChange,
  readFridayCycle,
  writeFridayCycle,
  type FridayCycleProgress,
  getFridayCycleKey,
  readFridayDuaProgress,
  writeFridayDuaProgress,
} from "./fridayProgress";

const ONBOARDING_COMPLETE_KEY = "azkarapp.onboarding-complete.v1";

import { useAppRouting, isLazyRouteCategory } from "./hooks/useAppRouting";

import { BottomNav, NavRail, NavSidebar } from "./components/LayoutShells";
import { useLayoutMode } from "./hooks/useLayoutMode";
import { useViewFocus } from "./hooks/useScreenFocus";

import { NetworkStatus } from "./components/NetworkStatus";
import { SyncStatus } from "./components/SyncStatus";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ScreenFallback } from "./components/ScreenFallback";
import { StatePanel } from "./components/StatePanel";
import { retryableScreen } from "./components/RetryableScreen";
import type { PrayerTrackingWrite } from "./components/PrayerTrackerCards";
import { PwaNotice } from "./components/PwaNotice";
import type { AudioController } from "./audio/AudioProvider";
import type { AudioStatus } from "./audio/audioTypes";
import { loadAudioModule, EMPTY_AUDIO_COVERAGE, type AudioModule } from "./audio/lazyAudio";
import { t } from "./i18n";
import { reportError } from "../lib/observability";
import { useRemoteAccountSync } from "./hooks/useRemoteAccountSync";
import { getLocationBasedReminders, useForegroundReminders } from "./hooks/useForegroundReminders";
import { useAuthHandlers, type ConfirmDialogOptions, type GuestMigrationDecision } from "./hooks/useAuthHandlers";
import { useSettingsHandlers } from "./hooks/useSettingsHandlers";
import { useSessionHandlers } from "./hooks/useSessionHandlers";
import { usePwaLifecycle } from "./hooks/usePwaLifecycle";
import {
  getPalmStreakSummary,
  getFirstIncompleteZikrIndex,
  getNextIncompleteZikrIndex,
  millisecondsUntilNextProgressDay,
  resetDailyRoutineProgress,
  resetStaleCompletedCollections,
  getEffectiveCompletedForSubcategory,
  getProgressDayKey,
  type GrowthEvent,
} from "./progress";

const HomeScreen = retryableScreen(() =>
  import("./screens/HomeScreen").then((module) => ({ default: module.HomeScreen })),
);
const AzkarLibraryScreen = retryableScreen(() =>
  import("./screens/AzkarLibraryScreen").then((module) => ({ default: module.AzkarLibraryScreen })),
);
const CategoryScreen = retryableScreen(() =>
  import("./screens/CategoryScreen").then((module) => ({ default: module.CategoryScreen })),
);
const ReaderScreen = retryableScreen(() =>
  import("./screens/ReaderScreen").then((module) => ({ default: module.ReaderScreen })),
);
const FloatingAudioPlayer = lazy(() =>
  import("./components/FloatingAudioPlayer").then((module) => ({ default: module.FloatingAudioPlayer })),
);
const PrayerMomentScreen = retryableScreen(() =>
  import("./screens/PrayerMomentScreen").then((module) => ({ default: module.PrayerMomentScreen })),
);
const CompletionScreen = retryableScreen(() =>
  import("./screens/CompletionScreen").then((module) => ({ default: module.CompletionScreen })),
);
const KhatmahReaderScreen = retryableScreen(() =>
  import("./screens/KhatmahReaderScreen").then((module) => ({ default: module.KhatmahReaderScreen })),
);
const QuranWirdScreen = retryableScreen(() =>
  import("./screens/QuranWirdScreen").then((module) => ({ default: module.QuranWirdScreen })),
);
const CustomCounterScreen = retryableScreen(() =>
  import("./screens/CustomCounterScreen").then((module) => ({ default: module.CustomCounterScreen })),
);
const SettingsScreen = retryableScreen(() =>
  import("./screens/settings/SettingsScreen").then((module) => ({ default: module.SettingsScreen })),
);
const SearchScreen = retryableScreen(() =>
  import("./screens/SearchScreen").then((module) => ({ default: module.SearchScreen })),
);
const ProgressScreen = retryableScreen(() =>
  import("./screens/ProgressScreen").then((module) => ({ default: module.ProgressScreen })),
);
const BenefitsScreen = retryableScreen(() =>
  import("./screens/BenefitsScreen").then((module) => ({ default: module.BenefitsScreen })),
);
const WirdBenefitsScreen = retryableScreen(() =>
  import("./screens/WirdBenefitsScreen").then((module) => ({ default: module.WirdBenefitsScreen })),
);
const FridayModeScreen = retryableScreen(() =>
  import("./screens/FridayModeScreen").then((module) => ({ default: module.FridayModeScreen })),
);
const FridaySalawatScreen = retryableScreen(() =>
  import("./screens/FridaySalawatScreen").then((module) => ({ default: module.FridaySalawatScreen })),
);
const ProgressShareModal = lazy(() =>
  import("./components/ProgressShareModal").then((module) => ({ default: module.ProgressShareModal })),
);
const SplashScreen = lazy(() =>
  import("./screens/onboarding/SplashScreen").then((module) => ({ default: module.SplashScreen })),
);
const EnglishOnboarding1Screen = lazy(() =>
  import("./screens/onboarding/EnglishOnboarding").then((module) => ({ default: module.EnglishOnboarding1Screen })),
);
const ArOnboarding1Screen = lazy(() =>
  import("./screens/onboarding/ArabicWelcomeScreen").then((module) => ({ default: module.ArabicWelcomeScreen })),
);
const LanguageScreen = lazy(() =>
  import("./screens/onboarding/LanguageScreen").then((module) => ({ default: module.LanguageScreen })),
);
const LoginScreen = lazy(() =>
  import("./screens/auth/RevampedAuthScreens").then((module) => ({ default: module.LoginScreen })),
);
const EmailInputScreen = lazy(() =>
  import("./screens/auth/RevampedAuthScreens").then((module) => ({ default: module.EmailInputScreen })),
);
const OTPScreen = lazy(() =>
  import("./screens/auth/RevampedAuthScreens").then((module) => ({ default: module.OTPScreen })),
);
const AuthCallbackScreen = lazy(() =>
  import("./screens/auth/RevampedAuthScreens").then((module) => ({ default: module.AuthCallbackScreen })),
);
const ProfileCompletionScreen = lazy(() =>
  import("./screens/auth/RevampedAuthScreens").then((module) => ({ default: module.ProfileCompletionScreen })),
);
const AudioContentReviewScreen = lazy(() =>
  import("./screens/AudioContentReviewScreen").then((module) => ({ default: module.AudioContentReviewScreen })),
);

// ─── Root App ─────────────────────────────────────────────────────────────────
function AppContent({
  audioController,
  buildPlaybackPlan,
  getAudioCoverage,
}: {
  /** `null` until the lazily-loaded audio chunk reports its controller. */
  audioController: AudioController | null;
  buildPlaybackPlan: AudioModule["buildPlaybackPlan"] | null;
  getAudioCoverage: AudioModule["getAudioCoverage"] | null;
}) {
  const initialState = useRef(loadAppState()).current;
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAudioReview, setShowAudioReview] = useState(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).get("audio-review") === "1",
  );
  const [routineModes, setRoutineModes] = useState(initialState.settings.routineModes);

  const {
    view,
    setView,
    activeTab,
    setActiveTab,
    activeCat,
    setActiveCat,
    activeSubCategory,
    setActiveSubCategory,
    activePrayer,
    setActivePrayer,
    activeIdx,
    setActiveIdx,
    quranPage,
    setQuranPage,
    searchQuery,
    setSearchQuery,
    librarySection,
    setLibrarySection,
    routeContentLoading,
    routeContentError,
    setRouteContentError,
    push,
    pop,
    handleNavTab,
    hydrateRouteCategory,
  } = useAppRouting({ routineModes, hasCompletedOnboarding });

  const activeRoutineMode: RoutineMode = isRoutineCategory(activeCat) ? routineModes[activeCat] : "complete";
  const activeAzkarList =
    activeCat === "after_prayer" && isPrayerName(activeSubCategory)
      ? getAzkarForPrayer(activeSubCategory, activeRoutineMode)
      : getAzkarForMode(activeCat, activeRoutineMode);
  const layoutMode = useLayoutMode();
  useViewFocus(view);

  const audioCoverage = useMemo(
    () => (getAudioCoverage ? getAudioCoverage(activeAzkarList) : EMPTY_AUDIO_COVERAGE),
    [getAudioCoverage, activeAzkarList],
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialState.settings.themeMode);
  const darkMode = themeMode !== "light";
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(initialState.settings.language);
  const {
    applyUpdate,
    dismissInstall,
    dismissUpdate,
    installApp,
    installDismissed,
    installPrompt,
    isInstalling,
    isUpdating,
    pwaError,
    pwaStatus,
    releaseNotes,
    updatedNotes,
    dismissUpdatedNotes,
    updateAvailable,
  } = usePwaLifecycle(selectedLang);
  const [showTransliteration, setShowTransliteration] = useState(initialState.settings.showTransliteration);
  const [showTranslation, setShowTranslation] = useState(initialState.settings.showTranslation);
  const [textSize, setTextSize] = useState<TextSizeOption>(initialState.settings.textSize);
  const [zikrFont, setZikrFont] = useState<ZikrFontOption>(initialState.settings.zikrFont ?? "humanist");
  const [highContrast, setHighContrast] = useState(initialState.settings.highContrast);
  const [boldText, setBoldText] = useState(initialState.settings.boldText);
  const [reduceMotion, setReduceMotion] = useState(initialState.settings.reduceMotion);
  const [hapticFeedback, setHapticFeedback] = useState(initialState.settings.hapticFeedback);
  const [forceRtl, setForceRtl] = useState(initialState.settings.forceRtl);
  const [colorBlindSupport, setColorBlindSupport] = useState<ColorBlindSupport>(
    initialState.settings.colorBlindSupport,
  );
  const [reminders, setReminders] = useState<ReminderSettings>(initialState.settings.reminders);
  const [locationSettings, setLocationSettings] = useState<LocationSettings>(
    initialState.settings.location ?? DEFAULT_LOCATION,
  );
  const handleLocationChange = useCallback((location: LocationSettings) => {
    setLocationSettings(location);
    setReminders((current) => getLocationBasedReminders(current, location));
  }, []);
  const [weeklyGoalDays, setWeeklyGoalDays] = useState(initialState.settings.weeklyGoalDays);
  const [quietProgressEnabled, setQuietProgressEnabled] = useState(initialState.settings.quietProgressEnabled);
  const [progressDayStartHour, setProgressDayStartHour] = useState(initialState.settings.progressDayStartHour);
  const activeProgressDayRef = useRef(getProgressDayKey(new Date(), progressDayStartHour));
  const [calendarType, setCalendarType] = useState<"hijri" | "gregorian">(
    initialState.settings.calendarType ?? "hijri",
  );
  const [dailyCompletions, setDailyCompletions] = useState(initialState.dailyCompletions);
  const [prayerTracking, setPrayerTracking] = useState(initialState.prayerTracking);
  const [khatmahPage, setKhatmahPage] = useState(() => quranPage ?? initialState.khatmahPage ?? 1);

  useEffect(() => {
    if (quranPage && quranPage !== khatmahPage) {
      setKhatmahPage(quranPage);
    }
  }, [quranPage, khatmahPage]);

  const handleKhatmahPageChange = useCallback(
    (pageOrUpdater: number | ((prev: number) => number)) => {
      setKhatmahPage((prev) => {
        const next = typeof pageOrUpdater === "function" ? pageOrUpdater(prev) : pageOrUpdater;
        setQuranPage(next);
        return next;
      });
    },
    [setQuranPage],
  );
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(initialState.mushafTheme ?? "follow-app");
  const [mushafLayout, setMushafLayout] = useState<MushafLayout>(initialState.mushafLayout ?? "auto");
  const [mushafToolbarSide, setMushafToolbarSide] = useState<MushafToolbarSide>(
    initialState.mushafToolbarSide ?? "right",
  );
  const [mushafTextScale, setMushafTextScale] = useState<MushafTextScale>(initialState.mushafTextScale ?? "medium");
  const [mushafBookmarks, setMushafBookmarks] = useState<number[]>(initialState.mushafBookmarks ?? []);
  /** Where each multi-page surah was last left, so reopening resumes it. */
  const [surahReadingPages, setSurahReadingPages] = useState<Record<string, number>>(
    initialState.surahReadingPages ?? {},
  );
  const rememberSurahPage = useCallback((zikrId: string, page: number) => {
    setSurahReadingPages((previous) => (previous[zikrId] === page ? previous : { ...previous, [zikrId]: page }));
  }, []);
  /** Whether the reader is currently showing a surah as Mushaf pages. */
  const [readerInMushafMode, setReaderInMushafMode] = useState(false);
  // Seeded from both sides: the local keys are what the Friday screens actually
  // read, while the snapshot is what a previous session synced. Neither is
  // reliably ahead of the other, and merging can only move progress forward.
  const [fridayProgress, setFridayProgress] = useState<FridayCycleProgress>(() => {
    const local = readFridayCycle();
    return initialState.fridayProgress ? mergeFridayCycles(local, initialState.fridayProgress) : local;
  });
  const [mushafVerseBookmarks, setMushafVerseBookmarks] = useState<QuranVerseBookmark[]>(
    initialState.mushafVerseBookmarks ?? [],
  );
  const [dailyWirdGoal, setDailyWirdGoal] = useState<number>(initialState.dailyWirdGoal ?? 4);
  const [wirdHistory, setWirdHistory] = useState<Record<string, number[]>>(initialState.wirdHistory ?? {});
  const [quranWirdCompletionAnnounced, setQuranWirdCompletionAnnounced] = useState<string | undefined>(
    initialState.quranWirdCompletionAnnounced,
  );
  const [quranWirdDailyGoals, setQuranWirdDailyGoals] = useState<Record<string, number>>(
    initialState.quranWirdDailyGoals ?? {},
  );
  const [quranLastReadingEvent, setQuranLastReadingEvent] = useState<QuranReadingEvent | undefined>(
    initialState.quranLastReadingEvent,
  );
  const [quranReadingPosition, setQuranReadingPosition] = useState<QuranReadingPosition>(
    initialState.quranReadingPosition ?? { page: initialState.khatmahPage ?? 1 },
  );
  const [quranWirdPlan, setQuranWirdPlan] = useState<QuranWirdPlan>(
    initialState.quranWirdPlan ?? { kind: "daily", dailyPages: initialState.dailyWirdGoal ?? 4 },
  );

  /**
   * Upserts what is recorded about a prayer on the current progress day.
   *
   * Keyed by (dayKey, prayer) so a record always names the prayer it belongs
   * to; nothing here consults the clock, which keeps tracking independent of
   * which prayer happens to be current when the tick is made.
   */
  const handleTogglePrayerTracking = useCallback(
    (prayer: PrayerName, field: PrayerTrackingWrite, next: boolean | "mosque" | "home" | null) => {
      const dayKey = getProgressDayKey(new Date(), progressDayStartHour);
      setPrayerTracking((current) => {
        // Guarded rather than trusted: this reducer is the one place a bad
        // restore turns into a crash on the user's first tap.
        const records = current ?? [];
        const index = records.findIndex((record) => record.dayKey === dayKey && record.prayer === prayer);
        const existing = index >= 0 ? records[index]! : { dayKey, prayer, mosque: false, adhkar: false };
        /* Where it was prayed is one answer, not two flags: writing it keeps
           the older `mosque` boolean in step so a client that only knows that
           field still reads the record correctly, and clearing it removes the
           answer rather than recording "at home". */
        const updated: PrayerTrackingRecord =
          field === "location"
            ? {
                ...existing,
                mosque: next === "mosque",
                ...(next === "mosque" || next === "home"
                  ? { location: next as "mosque" | "home" }
                  : { location: undefined }),
              }
            : { ...existing, [field]: next === true };
        if (index >= 0) {
          const copy = records.slice();
          copy[index] = updated;
          return copy;
        }
        return [...records, updated];
      });
    },
    [progressDayStartHour],
  );
  /**
   * Opens the prayer itself rather than its adhkar.
   *
   * Tapping a prayer used to jump straight into the after-prayer collection,
   * which answered one of the four things someone does at a prayer and left
   * the rest — where they prayed it, its rawātib, why it is worth walking to —
   * to a checkbox row on Home. The collection is one press further in, from a
   * screen that holds all of them.
   */
  const openPrayerMoment = useCallback(
    (prayer: PrayerName) => {
      setActivePrayer(prayer);
      push("prayer");
    },
    [push, setActivePrayer],
  );

  const [lastGrowthEvent, setLastGrowthEvent] = useState<GrowthEvent | null>(null);
  const [completed, setCompleted] = useState<Record<CategoryId, Set<string>>>(() =>
    resetStaleCompletedCollections(
      toCompletedSets(initialState.completed),
      initialState.dailyCompletions,
      new Date(),
      initialState.settings.progressDayStartHour,
    ),
  );
  const [fridayDuaCompletedIds, setFridayDuaCompletedIds] = useState<Set<string>>(() => new Set());
  const [fridayDuaTotalCount, setFridayDuaTotalCount] = useState(0);
  const [fridayDuaFlow, setFridayDuaFlow] = useState(false);
  const [isFridayDuasLoading, setIsFridayDuasLoading] = useState(false);
  const [fridayDuasError, setFridayDuasError] = useState(false);

  /* Keyed to the Friday the progress belongs to, not the ISO week. The week
     rolls on Monday, which left a finished Friday on screen all weekend; the
     cycle rolls the moment Friday ends. This is the trigger for the actual
     reset, so it has to agree with the storage keys in fridayProgress. */
  const ensureCurrentFridayWeek = useCallback(() => {
    const currentCycle = getFridayCycleKey();
    try {
      if (window.localStorage.getItem(FRIDAY_KAHF_WEEK_KEY) === currentCycle) return true;
      window.localStorage.setItem(FRIDAY_KAHF_WEEK_KEY, currentCycle);
    } catch {
      // Keep the in-memory reset when persistent storage is unavailable.
    }
    setCompleted((previous) => ({ ...previous, friday_kahf: new Set() }));
    setFridayDuaCompletedIds(new Set());
    return false;
  }, []);

  // Every Friday write announces itself, so this one subscription keeps the
  // synced snapshot current no matter which screen did the writing — rather
  // than each of the five write sites remembering to push state itself.
  useEffect(() => onFridayProgressChange(() => setFridayProgress(readFridayCycle())), []);

  const hydrateFridayDuaProgress = useCallback(async () => {
    try {
      setIsFridayDuasLoading(true);
      setFridayDuasError(false);
      const cycle = getFridayCycleKey();
      const { COMPREHENSIVE_DUAS } = await import("./content/comprehensiveDuas");
      registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
      const duaIds = COMPREHENSIVE_DUAS.filter((dua) => !dua.isCollectionIntroduction).map((dua) => dua.id);
      const stored = readFridayDuaProgress(duaIds, cycle);
      writeFridayDuaProgress(stored, cycle);
      setFridayDuaTotalCount(duaIds.length);
      setFridayDuaCompletedIds(stored);
      return true;
    } catch (error) {
      reportError(error, "friday-duas-load");
      setFridayDuasError(true);
      return false;
    } finally {
      setIsFridayDuasLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "friday") void hydrateFridayDuaProgress();
  }, [hydrateFridayDuaProgress, view]);

  useEffect(() => {
    ensureCurrentFridayWeek();
  }, [ensureCurrentFridayWeek]);

  const [sessions, setSessions] = useState<StoredSession[]>(initialState.sessions);
  const [savedZikrIds, setSavedZikrIds] = useState<Set<string>>(() => new Set(initialState.savedZikrIds));
  const [displayName, setDisplayName] = useState(initialState.profile.displayName);
  const [email, setEmail] = useState(initialState.profile.email);
  const [phone, setPhone] = useState(initialState.profile.phone);
  const [avatarUrl, setAvatarUrl] = useState(initialState.profile.avatarUrl);
  const [isGuest, setIsGuest] = useState(initialState.profile.isGuest);
  const [accountUserId, setAccountUserId] = useState(initialState.profile.accountUserId);
  const [remoteSyncReady, setRemoteSyncReady] = useState(false);
  const [persistenceError, setPersistenceError] = useState(false);
  const [persistenceNoticeDismissed, setPersistenceNoticeDismissed] = useState(false);

  // ── Confirmation dialog state ──────────────────────────────────────────────
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmDialogOptions | null>(null);
  const [guestMigrationOpen, setGuestMigrationOpen] = useState(false);
  const guestMigrationResolver = useRef<((decision: GuestMigrationDecision) => void) | null>(null);

  const requestGuestMigrationDecision = useCallback(
    () =>
      new Promise<GuestMigrationDecision>((resolve) => {
        guestMigrationResolver.current?.("cancel");
        guestMigrationResolver.current = resolve;
        setGuestMigrationOpen(true);
      }),
    [],
  );

  const resolveGuestMigration = useCallback((decision: GuestMigrationDecision) => {
    const resolve = guestMigrationResolver.current;
    guestMigrationResolver.current = null;
    setGuestMigrationOpen(false);
    resolve?.(decision);
  }, []);

  const showConfirm = useCallback(
    (
      title: string,
      description: string,
      confirmLabel: string,
      cancelLabel: string,
      onConfirm: () => void | Promise<void>,
      destructive = false,
    ) => {
      setPendingConfirm({ title, description, confirmLabel, cancelLabel, onConfirm, destructive });
    },
    [],
  );

  const { currentPalmRhythm: currentStreak, longestPalmRhythm: longestStreak } = getPalmStreakSummary(
    dailyCompletions,
    new Date(),
    progressDayStartHour,
  );
  const isArabic = selectedLang === "ar";
  const layoutDirection = isArabic || forceRtl ? "rtl" : "ltr";

  const appStateSnapshot = useMemo<AppStateSnapshot>(
    () => ({
      settings: {
        language: selectedLang,
        darkMode,
        themeMode,
        showTransliteration,
        showTranslation,
        textSize,
        zikrFont,
        highContrast,
        boldText,
        reduceMotion,
        hapticFeedback,
        forceRtl,
        colorBlindSupport,
        reminders,
        location: locationSettings,
        weeklyGoalDays,
        quietProgressEnabled,
        progressDayStartHour,
        calendarType,
        routineModes,
      },
      profile: { displayName, email, phone, avatarUrl, isGuest, accountUserId },
      completed: fromCompletedSets(completed),
      sessions,
      dailyCompletions,
      prayerTracking,
      savedZikrIds: [...savedZikrIds].sort(),
      khatmahPage,
      mushafTheme,
      mushafLayout,
      mushafToolbarSide,
      mushafTextScale,
      mushafBookmarks,
      surahReadingPages,
      mushafVerseBookmarks,
      dailyWirdGoal,
      wirdHistory,
      quranWirdDailyGoals,
      quranWirdCompletionAnnounced,
      quranLastReadingEvent,
      quranReadingPosition,
      quranWirdPlan,
      fridayProgress,
    }),
    [
      boldText,
      accountUserId,
      calendarType,
      colorBlindSupport,
      completed,
      darkMode,
      displayName,
      email,
      forceRtl,
      hapticFeedback,
      highContrast,
      isGuest,
      phone,
      avatarUrl,
      reduceMotion,
      reminders,
      locationSettings,
      weeklyGoalDays,
      quietProgressEnabled,
      progressDayStartHour,
      routineModes,
      selectedLang,
      sessions,
      dailyCompletions,
      prayerTracking,
      savedZikrIds,
      khatmahPage,
      mushafTheme,
      mushafLayout,
      mushafToolbarSide,
      mushafTextScale,
      mushafBookmarks,
      surahReadingPages,
      mushafVerseBookmarks,
      dailyWirdGoal,
      wirdHistory,
      quranWirdDailyGoals,
      quranWirdCompletionAnnounced,
      quranLastReadingEvent,
      quranReadingPosition,
      quranWirdPlan,
      showTranslation,
      showTransliteration,
      textSize,
      zikrFont,
      themeMode,
      fridayProgress,
    ],
  );

  // Hook modules
  const {
    sessionStart,
    isRepeatSession,
    repeatCompleted,
    handleResetCategory,
    openCategory: openCategoryWithoutHydration,
    openReader,
    resumeCategory,
    repeatCategory,
    leaveReader,
    toggleSavedZikr,
    markComplete,
    toggleZikrCompletion,
    advanceAfterCompletion,
    goHome,
  } = useSessionHandlers({
    activeCat,
    setActiveCat,
    activeSubCategory,
    setActiveSubCategory,
    activeIdx,
    setActiveIdx,
    completed,
    setCompleted,
    dailyCompletions,
    setDailyCompletions,
    onAfterPrayerCompleted: (prayer) => {
      if (isPrayerName(prayer)) handleTogglePrayerTracking(prayer, "adhkar", true);
    },
    setLastGrowthEvent,
    setSessions,
    setSavedZikrIds,
    progressDayStartHour,
    selectedLang,
    routineModes,
    setRoutineModes,
    push,
    pop,
    setView,
    setActiveTab,
    showConfirm,
  });

  const openCategory = useCallback(
    async (categoryId: CategoryId) => {
      if (isLazyRouteCategory(categoryId) && !(await hydrateRouteCategory(categoryId, "category"))) {
        setActiveCat(categoryId);
        setActiveTab("azkar");
        push("category");
        return;
      }
      openCategoryWithoutHydration(categoryId);
    },
    [hydrateRouteCategory, openCategoryWithoutHydration, push, setActiveCat, setActiveTab],
  );

  const updateFridayDuaProgress = useCallback((index: number, shouldComplete: boolean) => {
    const zikrId = getAzkarForMode("comprehensive_duas")[index]?.id;
    if (!zikrId) return;
    setFridayDuaCompletedIds((previous) => {
      const next = new Set(previous);
      if (shouldComplete) next.add(zikrId);
      else next.delete(zikrId);
      writeFridayDuaProgress(next);
      return next;
    });
  }, []);

  const resetFridayDuaProgress = useCallback(() => {
    const next = new Set<string>();
    setFridayDuaCompletedIds(next);
    writeFridayDuaProgress(next);
  }, []);

  // The fridayDuaFlow state is cleared manually when navigating away (e.g. via nav tabs or back button)
  // to avoid race conditions with asynchronous View Transitions.

  useEffect(() => {
    if (view !== "category" && view !== "reader") setRouteContentError(null);
  }, [view, setRouteContentError]);

  useEffect(() => {
    if (!audioController) return;
    const plan = audioController.state.plan;
    const playingZikrId = plan?.entries[audioController.state.entryIndex]?.zikrId;
    if (view !== "reader" || !plan || plan.context.category !== activeCat || !playingZikrId) return;
    const matchingIndex = activeAzkarList.findIndex((zikr) => zikr.id === playingZikrId);
    if (matchingIndex >= 0 && matchingIndex !== activeIdx) setActiveIdx(matchingIndex);
  }, [activeAzkarList, activeCat, activeIdx, audioController, view, setActiveIdx]);

  const markOnboardingComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
    try {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    } catch {
      // Storage failure non-fatal
    }
  }, []);

  const applyStateSnapshot = useCallback((state: AppStateSnapshot) => {
    setSelectedLang(state.settings.language);
    setThemeMode(state.settings.themeMode);
    setShowTransliteration(state.settings.showTransliteration);
    setShowTranslation(state.settings.showTranslation);
    setTextSize(state.settings.textSize);
    setZikrFont(state.settings.zikrFont ?? "humanist");
    setHighContrast(state.settings.highContrast);
    setBoldText(state.settings.boldText);
    setReduceMotion(state.settings.reduceMotion);
    setHapticFeedback(state.settings.hapticFeedback);
    setForceRtl(state.settings.forceRtl);
    setColorBlindSupport(state.settings.colorBlindSupport);
    setReminders(state.settings.reminders);
    setLocationSettings(state.settings.location ?? DEFAULT_LOCATION);
    setWeeklyGoalDays(state.settings.weeklyGoalDays);
    setQuietProgressEnabled(state.settings.quietProgressEnabled);
    setProgressDayStartHour(state.settings.progressDayStartHour);
    setRoutineModes(state.settings.routineModes);
    setDisplayName(state.profile.displayName);
    setEmail(state.profile.email);
    setPhone(state.profile.phone);
    setAvatarUrl(state.profile.avatarUrl);
    setIsGuest(state.profile.isGuest);
    setAccountUserId(state.profile.accountUserId);
    setDailyCompletions(state.dailyCompletions);
    // Any snapshot written before this field existed — which is every stored
    // or synced state from an earlier version — has no prayerTracking. The
    // type says otherwise, but restore data does not obey the type.
    setPrayerTracking(state.prayerTracking ?? []);
    setCompleted(
      resetStaleCompletedCollections(
        toCompletedSets(state.completed),
        state.dailyCompletions,
        new Date(),
        state.settings.progressDayStartHour,
      ),
    );
    setSessions(state.sessions);
    setSavedZikrIds(new Set(state.savedZikrIds));
    setKhatmahPage(state.khatmahPage ?? 1);
    setMushafTheme(state.mushafTheme ?? "follow-app");
    setMushafLayout(state.mushafLayout ?? "auto");
    setMushafToolbarSide(state.mushafToolbarSide ?? "right");
    setMushafTextScale(state.mushafTextScale ?? "medium");
    setMushafBookmarks(state.mushafBookmarks ?? []);
    setSurahReadingPages(state.surahReadingPages ?? {});
    setMushafVerseBookmarks(state.mushafVerseBookmarks ?? []);
    setDailyWirdGoal(state.dailyWirdGoal ?? 4);
    setWirdHistory(state.wirdHistory ?? {});
    setQuranWirdDailyGoals(state.quranWirdDailyGoals ?? {});
    setQuranWirdCompletionAnnounced(state.quranWirdCompletionAnnounced);
    setQuranLastReadingEvent(state.quranLastReadingEvent);
    setQuranReadingPosition(state.quranReadingPosition ?? { page: state.khatmahPage ?? 1 });
    setQuranWirdPlan(state.quranWirdPlan ?? { kind: "daily", dailyPages: state.dailyWirdGoal ?? 4 });
    // Friday is merged rather than replaced. Restoring an account should never
    // erase a deed done on this device before it signed in, and the remote copy
    // is not automatically the newer one.
    if (state.fridayProgress) {
      const merged = mergeFridayCycles(readFridayCycle(), state.fridayProgress);
      if (merged.cycle === getFridayCycleKey()) writeFridayCycle(merged);
      setFridayProgress(merged);
    }
  }, []);

  const {
    isSendingOtp,
    isVerifyingOtp,
    isResendingOtp,
    isCompletingProfile,
    isAuthenticatingOAuth,
    authError,
    setAuthError,
    handleOpenAccountAuth,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleOAuth,
    handleAuthCallback,
    handleCompleteProfile,
    handleSignOut,
  } = useAuthHandlers({
    selectedLang,
    email,
    setEmail,
    setRemoteSyncReady,
    appStateSnapshot,
    applyStateSnapshot,
    markOnboardingComplete,
    requestGuestMigrationDecision,
    showConfirm,
    setView,
    setActiveTab,
  });

  const { handleExportData, handleResetPreferences, handleClearLocalData, handleDeleteAccount } = useSettingsHandlers({
    selectedLang,
    appStateSnapshot,
    showConfirm,
  });

  const handleSplashDone = useCallback(() => {
    setView(hasCompletedOnboarding ? "home" : "language");
  }, [hasCompletedOnboarding, setView]);

  const {
    isSyncing: isSyncingRemote,
    lastSuccessfulSyncAt,
    retry: retrySync,
    syncError,
    syncStatus,
  } = useRemoteAccountSync({
    initialState,
    state: appStateSnapshot,
    isGuest,
    currentStreak,
    longestStreak,
    remoteSyncReady,
    onRemoteState: applyStateSnapshot,
    onRemoteHydrationChange: setRemoteSyncReady,
    requestGuestMigrationDecision,
    skipInitialHydration: view === "auth-callback",
  });

  useForegroundReminders({ reminders, dailyCompletions, progressDayStartHour, language: selectedLang });

  const reconcileDailyProgress = useCallback(() => {
    const currentDayKey = getProgressDayKey(new Date(), progressDayStartHour);
    if (activeProgressDayRef.current === currentDayKey) return;

    activeProgressDayRef.current = currentDayKey;
    setCompleted((previous) => resetDailyRoutineProgress(previous));
  }, [progressDayStartHour]);

  useEffect(() => {
    let timerId: number | undefined;

    const scheduleNextBoundary = () => {
      timerId = window.setTimeout(
        () => {
          reconcileDailyProgress();
          scheduleNextBoundary();
        },
        millisecondsUntilNextProgressDay(new Date(), progressDayStartHour),
      );
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconcileDailyProgress();
      }
    };

    reconcileDailyProgress();
    scheduleNextBoundary();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [progressDayStartHour, reconcileDailyProgress]);

  useEffect(() => {
    applyAppAppearance({
      themeMode,
      language: selectedLang,
      textSize,
      zikrFont,
      highContrast,
      boldText,
      reduceMotion,
      forceRtl,
      colorBlindSupport,
    });
  }, [boldText, colorBlindSupport, forceRtl, themeMode, highContrast, reduceMotion, selectedLang, textSize, zikrFont]);

  useEffect(() => {
    const saved = saveAppState(appStateSnapshot);
    setPersistenceError(!saved);
    if (saved) setPersistenceNoticeDismissed(false);
  }, [appStateSnapshot]);

  /**
   * The Mushaf is a reading surface, not a screen with a menu bar.
   *
   * Its own route carries no app navigation, and the surah view now renders as
   * the reader's body rather than a modal over it — so without this the nav
   * that the modal used to cover would sit beside the page.
   */
  const showBottomNav =
    !readerInMushafMode &&
    [
      "home",
      "library",
      "benefits",
      "wird_benefits",
      "category",
      "reader",
      "settings",
      "search",
      "progress",
      "friday",
      "friday_salawat",
      "custom_counter",
      "khatmah_overview",
    ].includes(view);
  const azkar = activeAzkarList;
  const activeZikr = azkar[activeIdx];
  const activeZikrHasAudio = activeZikr && getAudioCoverage ? getAudioCoverage([activeZikr]).available === 1 : false;

  /**
   * The active zikr's own playback status, or "idle" when the player is
   * carrying something else. Read from the one controller rather than kept
   * as separate state, so the Mushaf's listen control and the floating
   * player can never disagree about what is playing.
   */
  const activeZikrAudioStatus: AudioStatus = (() => {
    if (!audioController || !activeZikr) return "idle";
    const plan = audioController.state.plan;
    const playingZikrId = plan?.entries[audioController.state.entryIndex]?.zikrId;
    return playingZikrId === activeZikr.id ? audioController.state.status : "idle";
  })();

  const startAudio = (items: typeof azkar, source: "single" | "full-session", repeatPrescribed = false) => {
    if (!audioController || !buildPlaybackPlan) return false;
    const plan = buildPlaybackPlan({
      zikrs: items,
      context: { category: activeCat, routineMode: activeRoutineMode, source },
      mode: repeatPrescribed ? "repeat-prescribed-count" : "play-once",
      preferences: audioController.preferences,
    });
    return audioController.startPlan(plan);
  };

  /**
   * One control for the whole listen cycle: start the surah the first time,
   * then pause and resume the same playback rather than restarting it from
   * the beginning — the Mushaf's rail and the floating player drive the same
   * controller, so either can pick up where the other left off.
   */
  const toggleActiveZikrAudio = () => {
    if (!activeZikr || !audioController) return;
    if (activeZikrAudioStatus === "playing" || activeZikrAudioStatus === "buffering") {
      audioController.pause();
      return;
    }
    if (activeZikrAudioStatus === "paused" || activeZikrAudioStatus === "ready") {
      audioController.play();
      return;
    }
    void startAudio([activeZikr], "single");
  };

  const startPlayAllAudio = () => {
    if (!audioController || !buildPlaybackPlan) return;
    const playAvailable = () => {
      const plan = buildPlaybackPlan({
        zikrs: azkar,
        context: { category: activeCat, routineMode: activeRoutineMode, source: "full-session" },
        preferences: audioController.preferences,
      });
      const firstZikrId = plan.entries[0]?.zikrId;
      if (!firstZikrId || !audioController.startPlan(plan)) return;
      const firstIndex = azkar.findIndex((zikr) => zikr.id === firstZikrId);
      openReader(activeCat, Math.max(0, firstIndex));
    };

    if (audioCoverage.unavailable > 0) {
      showConfirm(
        t(selectedLang, "auth.audioCoverageTitle"),
        t(selectedLang, "auth.audioCoverageBody", {
          available: audioCoverage.available,
          total: audioCoverage.total,
          unavailable: audioCoverage.unavailable,
        }),
        t(selectedLang, "auth.playAvailableAudio"),
        t(selectedLang, "common.cancel"),
        playAvailable,
      );
      return;
    }
    playAvailable();
  };

  // All three nav variants share the same view whitelist, so splash, onboarding
  // and auth never render app navigation regardless of viewport.
  // The reader is a full-screen reading surface on mobile: its
  // own header row carries every action it needs, so the tab bar is hidden
  // there and the zikr text plus counter get the whole viewport back.
  // On tablet (medium) and larger, we preserve navigation even during active reading.
  const showBottomNavArea =
    showBottomNav &&
    ((layoutMode === "compact" && view !== "reader" && view !== "custom_counter") || layoutMode === "medium");
  const showRail = showBottomNav && layoutMode === "expanded";
  const showSidebar = showBottomNav && layoutMode === "large";

  return (
    <div className="app-viewport flex items-center justify-center">
      <div
        // No elevation utility here: theme.css sets `box-shadow: none` on
        // .app-shell both at <=599px and at >=600px, so the shadow-2xl that used
        // to sit here never rendered at any viewport width (DEC-067 / F11).
        className={`app-shell relative overflow-hidden bg-background ${showBottomNav ? "" : "app-shell--navigation-hidden"}`}
      >
        {/* Both banners share one grid area, so they stack across the full shell
            width instead of being auto-placed into an implicit row — which put
            them underneath the rail on the expanded and large tiers. */}
        <div className="app-status">
          {pwaStatus && (
            <p className="sync-status" role="status" aria-live="polite">
              {pwaStatus}
            </p>
          )}
          <NetworkStatus language={selectedLang} />
          {isSupabaseConfigured && !isGuest && (
            <SyncStatus
              isSyncing={isSyncingRemote}
              errorMessage={syncError}
              onRetry={retrySync}
              language={selectedLang}
            />
          )}
        </div>

        {/* Adaptive navigation — only one renders at a time */}
        {showRail && (
          <NavRail
            active={activeTab}
            onChange={(tab) => {
              setFridayDuaFlow(false);
              handleNavTab(tab);
            }}
            isArabic={isArabic}
          />
        )}
        {showSidebar && (
          <NavSidebar
            active={activeTab}
            onChange={(tab) => {
              setFridayDuaFlow(false);
              handleNavTab(tab);
            }}
            isArabic={isArabic}
            themeMode={themeMode}
            onThemeModeChange={setThemeMode}
            onLanguageChange={setSelectedLang}
          />
        )}

        <div className="app-main">
          <main
            id="main-content"
            data-view={view}
            tabIndex={-1}
            className="app-main-view flex-1 overflow-hidden flex flex-col"
          >
            <Suspense fallback={<ScreenFallback language={selectedLang} />}>
              {/* Phase 2 — onboarding flow */}
              {view === "splash" && <SplashScreen language={selectedLang} onDone={handleSplashDone} />}
              {view === "onboard1" && (
                <EnglishOnboarding1Screen
                  onNext={() => setView("login")}
                  onSkip={() => {
                    markOnboardingComplete();
                    setView("home");
                    setActiveTab("home");
                  }}
                />
              )}
              {/* Arabic onboarding — shown for Arabic-locale devices */}
              {view === "ar_onboard1" && (
                <ArOnboarding1Screen
                  onNext={() => setView("login")}
                  onSkip={() => {
                    markOnboardingComplete();
                    setView("home");
                    setActiveTab("home");
                  }}
                />
              )}
              {view === "language" && (
                <LanguageScreen
                  initialLanguage={selectedLang}
                  onContinue={(lang) => {
                    setSelectedLang(lang);
                    setView(lang === "ar" ? "ar_onboard1" : "onboard1");
                  }}
                />
              )}
              {view === "login" && (
                <LoginScreen
                  language={selectedLang}
                  providerFlags={authProviderFlags}
                  onGoogle={() => void handleOAuth("google")}
                  onEmail={() => {
                    setAuthError("");
                    setView("email");
                  }}
                  onApple={() => void handleOAuth("apple")}
                  onGuest={() => {
                    markOnboardingComplete();
                    setDisplayName("Guest");
                    setIsGuest(true);
                    setView("home");
                    setActiveTab("home");
                  }}
                  errorMessage={authError}
                  isAuthenticating={isAuthenticatingOAuth}
                />
              )}
              {view === "email" && (
                <EmailInputScreen
                  language={selectedLang}
                  initialEmail={email}
                  errorMessage={authError}
                  isSending={isSendingOtp}
                  onSend={handleSendOtp}
                  onBack={() => {
                    setAuthError("");
                    setView("login");
                  }}
                  onSkip={() => {
                    markOnboardingComplete();
                    setView("home");
                    setActiveTab("home");
                  }}
                />
              )}
              {view === "otp" && (
                <OTPScreen
                  language={selectedLang}
                  maskedEmail={email}
                  errorMessage={authError}
                  isVerifying={isVerifyingOtp}
                  isResending={isResendingOtp}
                  onVerify={handleVerifyOtp}
                  onResend={handleResendOtp}
                  onBack={() => {
                    setAuthError("");
                    setView("email");
                  }}
                  onDifferent={() => {
                    setAuthError("");
                    setView("email");
                  }}
                />
              )}
              {view === "auth-callback" && (
                <AuthCallbackScreen
                  language={selectedLang}
                  errorMessage={authError}
                  onReady={() => void handleAuthCallback()}
                />
              )}
              {view === "profile-completion" && (
                <ProfileCompletionScreen
                  language={selectedLang}
                  errorMessage={authError}
                  isSaving={isCompletingProfile}
                  onSave={(name) => void handleCompleteProfile(name)}
                />
              )}

              {/* Phase 1 — core app */}
              {view === "home" && (
                <HomeScreen
                  completed={completed}
                  dailyCompletions={dailyCompletions}
                  quietProgressEnabled={true}
                  progressDayStartHour={progressDayStartHour}
                  locationSettings={locationSettings}
                  quranReadingPosition={quranReadingPosition}
                  quranWirdPlan={quranWirdPlan}
                  wirdHistory={wirdHistory}
                  onContinueKhatmah={() => {
                    setKhatmahPage(quranReadingPosition.page);
                    push("khatmah");
                  }}
                  onResume={(categoryId) => {
                    if (categoryId === "comprehensive_duas") {
                      void openCategory(categoryId);
                    } else {
                      resumeCategory(categoryId);
                    }
                  }}
                  onPrayerResume={(prayer) => openPrayerMoment(prayer)}
                  onOpenFridayMode={() => {
                    ensureCurrentFridayWeek();
                    push("friday");
                  }}
                  onOpenProgress={() => {
                    window.history.replaceState({ view: "progress" }, "", "?view=progress");
                    setView("progress");
                    setActiveTab("progress");
                  }}
                  language={selectedLang}
                  calendarType={calendarType}
                  direction={layoutDirection}
                  routineModes={routineModes}
                  onSetRoutineMode={(categoryId, mode) => {
                    setRoutineModes((prev) => ({ ...prev, [categoryId]: mode }));
                  }}
                  onOpenCustomCounter={() => push("custom_counter")}
                  savedZikrIds={savedZikrIds}
                  onOpenSavedZikr={(categoryId, index) => openReader(categoryId, index, "complete")}
                  onOpenSavedLibrary={() => {
                    setActiveTab("azkar");
                    setLibrarySection(savedZikrIds.size > 0 ? "saved" : "collections");
                    push("library");
                  }}
                  onOpenBenefits={() => push("benefits")}
                  onOpenWirdBenefits={() => push("wird_benefits")}
                  onOpenKhatmah={() => push("khatmah_overview")}
                  prayerTracking={prayerTracking}
                  onTogglePrayerTracking={handleTogglePrayerTracking}
                />
              )}
              {view === "wird_benefits" && (
                <WirdBenefitsScreen language={selectedLang} direction={layoutDirection} onBack={pop} />
              )}
              {view === "benefits" && (
                <BenefitsScreen language={selectedLang} direction={layoutDirection} onBack={pop} />
              )}
              {view === "library" && (
                <AzkarLibraryScreen
                  completed={completed}
                  language={selectedLang}
                  direction={layoutDirection}
                  onCategory={openCategory}
                  onZikr={(catId, index) => openReader(catId, index, "complete")}
                  onSearch={(query) => {
                    setSearchQuery(query);
                    push("search");
                  }}
                  savedZikrIds={savedZikrIds}
                  routineModes={routineModes}
                  initialSection={librarySection}
                />
              )}
              {view === "progress" && (
                <ProgressScreen
                  dailyCompletions={dailyCompletions}
                  progressDayStartHour={progressDayStartHour}
                  calendarType={calendarType}
                  language={selectedLang}
                  direction={layoutDirection}
                  onOpenShareModal={() => setShowShareModal(true)}
                  onSelectCategory={openCategory}
                  locationSettings={locationSettings}
                  prayerTracking={prayerTracking}
                  onTogglePrayerTracking={handleTogglePrayerTracking}
                  onPrayerResume={(prayer) => openPrayerMoment(prayer)}
                  onOpenFriday={() => push("friday")}
                />
              )}
              {(view === "category" || view === "reader") && routeContentLoading && (
                <ScreenFallback language={selectedLang} />
              )}
              {(view === "category" || view === "reader") && routeContentError && !routeContentLoading && (
                <div className="flex h-full items-center justify-center p-4">
                  <StatePanel
                    kind="route-error"
                    language={selectedLang}
                    focusOnMount
                    actionLabel={t(selectedLang, "common.tryAgain")}
                    onAction={() => {
                      void hydrateRouteCategory(
                        routeContentError.categoryId,
                        routeContentError.targetView,
                        routeContentError.targetIndex,
                      );
                    }}
                    secondaryActionLabel={t(selectedLang, "common.goToLibrary")}
                    onSecondaryAction={() => {
                      setRouteContentError(null);
                      setLibrarySection("collections");
                      setActiveTab("azkar");
                      push("library");
                    }}
                  />
                </div>
              )}
              {view === "friday" && (
                <FridayModeScreen
                  isArabic={isArabic}
                  direction={layoutDirection}
                  kahfCompletedCount={completed.friday_kahf?.has("friday-kahf") ? 1 : 0}
                  duasCompletedCount={fridayDuaCompletedIds.size}
                  duasTotalCount={fridayDuaTotalCount}
                  isDuasLoading={isFridayDuasLoading}
                  duasLoadError={fridayDuasError}
                  onRetryDuas={() => void hydrateFridayDuaProgress()}
                  onBack={pop}
                  onStartKahf={() => {
                    void (async () => {
                      markFridayKahfOpened();
                      const sameWeek = ensureCurrentFridayWeek();
                      if (!(await hydrateRouteCategory("friday_kahf", "reader", 0))) {
                        setActiveCat("friday_kahf");
                        setActiveIdx(0);
                        setView("reader");
                        return;
                      }
                      const kahf = getAzkarForMode("friday_kahf");
                      const nextIndex = sameWeek ? getFirstIncompleteZikrIndex(kahf, completed.friday_kahf) : 0;
                      if (nextIndex === null) {
                        setCompleted((previous) => ({ ...previous, friday_kahf: new Set() }));
                        openReader("friday_kahf", 0);
                        return;
                      }
                      openReader("friday_kahf", nextIndex);
                    })();
                  }}
                  onOpenSalawat={() => push("friday_salawat")}
                  onStartDuasSession={() => {
                    void (async () => {
                      ensureCurrentFridayWeek();
                      if (!(await hydrateFridayDuaProgress())) return;
                      await openCategory("comprehensive_duas");
                      setFridayDuaFlow(true);
                    })();
                  }}
                />
              )}
              {view === "friday_salawat" && (
                <FridaySalawatScreen
                  language={selectedLang}
                  direction={layoutDirection}
                  reduceMotion={reduceMotion}
                  hapticFeedback={hapticFeedback}
                  onBack={() => {
                    window.history.replaceState({ view: "friday" }, "", "?view=friday");
                    setView("friday");
                  }}
                />
              )}
              {view === "category" && !routeContentLoading && !routeContentError && (
                <CategoryScreen
                  catId={activeCat}
                  subCategory={activeSubCategory}
                  completed={
                    fridayDuaFlow && activeCat === "comprehensive_duas"
                      ? fridayDuaCompletedIds
                      : getEffectiveCompletedForSubcategory(completed, activeCat, activeSubCategory)
                  }
                  isArabic={isArabic}
                  direction={layoutDirection}
                  onZikr={(i) => openReader(activeCat, i)}
                  onToggleZikr={(i) => {
                    const zikrId = activeAzkarList[i]?.id;
                    if (fridayDuaFlow && activeCat === "comprehensive_duas" && zikrId) {
                      const shouldComplete = !fridayDuaCompletedIds.has(zikrId);
                      updateFridayDuaProgress(i, shouldComplete);
                      if (shouldComplete && !completed.comprehensive_duas.has(zikrId)) {
                        toggleZikrCompletion(activeCat, i);
                      }
                      return;
                    }
                    toggleZikrCompletion(activeCat, i);
                  }}
                  onReset={() => {
                    if (fridayDuaFlow && activeCat === "comprehensive_duas") {
                      showConfirm(
                        t(selectedLang, "category.resetConfirmTitle"),
                        t(selectedLang, "category.resetConfirm"),
                        t(selectedLang, "common.reset"),
                        t(selectedLang, "common.cancel"),
                        resetFridayDuaProgress,
                        true,
                      );
                      return;
                    }
                    handleResetCategory(activeCat, activeSubCategory);
                  }}
                  onRepeat={() => {
                    if (fridayDuaFlow && activeCat === "comprehensive_duas") {
                      resetFridayDuaProgress();
                      openReader(activeCat, 0);
                      return;
                    }
                    repeatCategory(activeCat);
                  }}
                  onBack={pop}
                  onPlayAllAudio={
                    activeCat === "comprehensive_duas" || audioCoverage.available === 0 ? undefined : startPlayAllAudio
                  }
                  audioCoverage={audioCoverage}
                  routineMode={activeRoutineMode}
                  onRoutineModeChange={(mode) => {
                    if (isRoutineCategory(activeCat)) {
                      setRoutineModes((previous) => ({ ...previous, [activeCat]: mode }));
                    }
                  }}
                />
              )}
              {view === "reader" && !routeContentLoading && !routeContentError && activeZikr && (
                <ReaderScreen
                  catId={activeCat}
                  subCategory={activeSubCategory}
                  idx={activeIdx}
                  routineMode={activeRoutineMode}
                  azkarList={activeAzkarList}
                  isArabic={isArabic}
                  direction={layoutDirection}
                  themeMode={themeMode}
                  isDone={
                    isRepeatSession
                      ? repeatCompleted.has(activeIdx)
                      : fridayDuaFlow && activeCat === "comprehensive_duas"
                        ? fridayDuaCompletedIds.has(azkar[activeIdx]?.id ?? "")
                        : getEffectiveCompletedForSubcategory(completed, activeCat, activeSubCategory).has(
                            azkar[activeIdx]?.id ?? "",
                          )
                  }
                  collectionCompletedCount={
                    isRepeatSession
                      ? repeatCompleted.size
                      : fridayDuaFlow && activeCat === "comprehensive_duas"
                        ? fridayDuaCompletedIds.size
                        : getEffectiveCompletedForSubcategory(completed, activeCat, activeSubCategory).size
                  }
                  hapticFeedback={hapticFeedback}
                  reduceMotion={reduceMotion}
                  showTranslation={showTranslation}
                  showTransliteration={showTransliteration}
                  textSize={textSize}
                  onTextSizeChange={setTextSize}
                  savedZikrIds={savedZikrIds}
                  onBack={
                    activeCat === "friday_kahf"
                      ? () => {
                          window.history.replaceState({ view: "friday" }, "", "?view=friday");
                          setView("friday");
                        }
                      : leaveReader
                  }
                  onComplete={(i) => {
                    if (fridayDuaFlow && activeCat === "comprehensive_duas") {
                      updateFridayDuaProgress(i, true);
                      const zikrId = azkar[i]?.id;
                      if (zikrId && !completed.comprehensive_duas.has(zikrId)) markComplete(i);
                      return;
                    }
                    markComplete(i);
                  }}
                  onUncomplete={(i) => {
                    if (fridayDuaFlow && activeCat === "comprehensive_duas") {
                      updateFridayDuaProgress(i, false);
                      return;
                    }
                    toggleZikrCompletion(activeCat, i);
                  }}
                  onAdvance={
                    activeCat === "friday_kahf"
                      ? () => {
                          window.history.replaceState({ view: "friday" }, "", "?view=friday");
                          setView("friday");
                        }
                      : fridayDuaFlow && activeCat === "comprehensive_duas"
                        ? (i) => {
                            const effectiveProgress = new Set(fridayDuaCompletedIds);
                            const zikrId = azkar[i]?.id;
                            if (zikrId) effectiveProgress.add(zikrId);
                            const nextIndex = getNextIncompleteZikrIndex(azkar, effectiveProgress, i);
                            if (nextIndex !== null) {
                              setActiveIdx(nextIndex);
                              return;
                            }
                            window.history.replaceState({ view: "friday" }, "", "?view=friday");
                            setView("friday");
                            setFridayDuaFlow(false);
                          }
                        : advanceAfterCompletion
                  }
                  onNext={() => {
                    if (activeIdx < azkar.length - 1) setActiveIdx((i) => i + 1);
                  }}
                  onPrev={() => {
                    if (activeIdx > 0) setActiveIdx((i) => i - 1);
                  }}
                  onToggleSaved={toggleSavedZikr}
                  audioAvailable={activeZikrHasAudio}
                  surahAudio={{
                    available: activeZikrHasAudio,
                    status: activeZikrAudioStatus,
                    onToggle: toggleActiveZikrAudio,
                  }}
                  mushafTextScale={mushafTextScale}
                  mushafBookmarks={mushafBookmarks}
                  surahReadingPages={surahReadingPages}
                  onSurahPageChange={rememberSurahPage}
                  onMushafModeChange={setReaderInMushafMode}
                  mushafSettings={{
                    theme: mushafTheme,
                    appTheme: themeMode,
                    onSelectTheme: setMushafTheme,
                    layout: mushafLayout,
                    onSelectLayout: setMushafLayout,
                    onSelectTextScale: setMushafTextScale,
                    toolbarSide: mushafToolbarSide,
                    onSelectToolbarSide: setMushafToolbarSide,
                  }}
                  onToggleMushafBookmark={(page) =>
                    setMushafBookmarks((previous) =>
                      previous.includes(page)
                        ? previous.filter((p) => p !== page)
                        : [...previous, page].sort((a, b) => a - b),
                    )
                  }
                  onPlayAudio={
                    activeZikrHasAudio && activeZikr ? () => void startAudio([activeZikr], "single") : undefined
                  }
                  onRepeatAudio={
                    activeZikrHasAudio && activeZikr?.audioBehavior.supportedModes.includes("repeat-prescribed-count")
                      ? () => void startAudio([activeZikr], "single", true)
                      : undefined
                  }
                />
              )}
              {view === "prayer" && (
                <PrayerMomentScreen
                  prayer={activePrayer}
                  language={selectedLang}
                  direction={layoutDirection}
                  records={prayerTracking}
                  dayKey={getProgressDayKey(new Date(), progressDayStartHour)}
                  locationSettings={locationSettings}
                  onBack={pop}
                  onToggle={(prayer, field, value) =>
                    handleTogglePrayerTracking(prayer, field, value as boolean | "mosque" | "home" | null)
                  }
                  onOpenAdhkar={(prayer) => resumeCategory("after_prayer", prayer)}
                  onSelectPrayer={(prayer) => setActivePrayer(prayer)}
                />
              )}
              {view === "completion" && (
                <CompletionScreen
                  catId={activeCat}
                  sessionStart={sessionStart}
                  dailyCompletions={dailyCompletions}
                  growthEvent={lastGrowthEvent}
                  quietProgressEnabled={quietProgressEnabled}
                  progressDayStartHour={progressDayStartHour}
                  onHome={goHome}
                  language={selectedLang}
                  direction={layoutDirection}
                  completionLevel={activeRoutineMode}
                  onContinueComplete={
                    isRoutineCategory(activeCat)
                      ? () => {
                          const completeAzkar = getAzkarForMode(activeCat, "complete");
                          const nextIndex = completeAzkar.findIndex((zikr) => !completed[activeCat].has(zikr.id));
                          openReader(activeCat, Math.max(0, nextIndex), "complete");
                        }
                      : undefined
                  }
                  reduceMotion={reduceMotion}
                  hapticFeedback={hapticFeedback}
                />
              )}
              {view === "settings" && (
                <SettingsScreen
                  themeMode={themeMode}
                  language={selectedLang}
                  zikrFont={zikrFont}
                  onZikrFontChange={setZikrFont}
                  isGuest={isGuest}
                  isSyncing={isSyncingRemote}
                  syncError={syncError}
                  syncStatus={syncStatus}
                  lastSuccessfulSyncAt={lastSuccessfulSyncAt}
                  sessions={sessions}
                  dailyCompletions={dailyCompletions}
                  savedCount={savedZikrIds.size}
                  textSize={textSize}
                  showTranslation={showTranslation}
                  showTransliteration={showTransliteration}
                  highContrast={highContrast}
                  boldText={boldText}
                  reduceMotion={reduceMotion}
                  hapticFeedback={hapticFeedback}
                  forceRtl={forceRtl}
                  colorBlindSupport={colorBlindSupport}
                  reminders={reminders}
                  locationSettings={locationSettings}
                  weeklyGoalDays={weeklyGoalDays}
                  quietProgressEnabled={quietProgressEnabled}
                  progressDayStartHour={progressDayStartHour}
                  calendarType={calendarType}
                  direction={layoutDirection}
                  onLanguageChange={setSelectedLang}
                  onThemeModeChange={setThemeMode}
                  onCalendarTypeChange={setCalendarType}
                  onTextSizeChange={setTextSize}
                  onShowTranslationChange={setShowTranslation}
                  onShowTransliterationChange={setShowTransliteration}
                  onHighContrastChange={setHighContrast}
                  onBoldTextChange={setBoldText}
                  onReduceMotionChange={setReduceMotion}
                  onHapticFeedbackChange={setHapticFeedback}
                  onForceRtlChange={setForceRtl}
                  onColorBlindSupportChange={setColorBlindSupport}
                  onRemindersChange={setReminders}
                  onLocationChange={handleLocationChange}
                  onWeeklyGoalDaysChange={setWeeklyGoalDays}
                  onQuietProgressEnabledChange={setQuietProgressEnabled}
                  onActivateAccount={handleOpenAccountAuth}
                  onSignOut={handleSignOut}
                  onExportData={handleExportData}
                  onResetPreferences={handleResetPreferences}
                  onClearLocalData={handleClearLocalData}
                  onDeleteAccount={handleDeleteAccount}
                />
              )}
              {view === "search" && (
                <SearchScreen
                  language={selectedLang}
                  direction={layoutDirection}
                  initialQuery={searchQuery}
                  onBack={pop}
                  onZikr={(catId, i) => {
                    openReader(catId, i, "complete");
                  }}
                />
              )}
              {view === "khatmah_overview" && (
                <QuranWirdScreen
                  language={selectedLang}
                  direction={layoutDirection}
                  calendarType={calendarType}
                  position={quranReadingPosition}
                  plan={quranWirdPlan}
                  progressDayStartHour={progressDayStartHour}
                  wirdHistory={wirdHistory}
                  quranWirdDailyGoals={quranWirdDailyGoals}
                  lastReadingEvent={quranLastReadingEvent}
                  onBack={pop}
                  onContinue={() => push("khatmah")}
                  onPlanChange={(plan) => {
                    setQuranWirdPlan(plan);
                    if (plan.dailyPages > 0) setDailyWirdGoal(plan.dailyPages);
                  }}
                  onUndoReadingEvent={() => {
                    const dayKey = getProgressDayKey(new Date(), progressDayStartHour);
                    if (!quranLastReadingEvent || quranLastReadingEvent.dayKey !== dayKey) return;
                    setWirdHistory((current) => {
                      const pages = current[dayKey] ?? [];
                      const undone = new Set(quranLastReadingEvent.pages);
                      return { ...current, [dayKey]: pages.filter((page) => !undone.has(page)) };
                    });
                    setQuranLastReadingEvent(undefined);
                  }}
                />
              )}
              {view === "khatmah" && (
                <KhatmahReaderScreen
                  language={selectedLang}
                  direction={layoutDirection}
                  onBack={pop}
                  khatmahPage={khatmahPage}
                  setKhatmahPage={handleKhatmahPageChange}
                  progressDayStartHour={progressDayStartHour}
                  reduceMotion={reduceMotion}
                  mushafTheme={mushafTheme}
                  appTheme={themeMode}
                  setMushafTheme={setMushafTheme}
                  mushafLayout={mushafLayout}
                  setMushafLayout={setMushafLayout}
                  mushafToolbarSide={mushafToolbarSide}
                  setMushafToolbarSide={setMushafToolbarSide}
                  mushafTextScale={mushafTextScale}
                  setMushafTextScale={setMushafTextScale}
                  mushafBookmarks={mushafBookmarks}
                  setMushafBookmarks={setMushafBookmarks}
                  mushafVerseBookmarks={mushafVerseBookmarks}
                  setMushafVerseBookmarks={setMushafVerseBookmarks}
                  wirdHistory={wirdHistory}
                  onRecordPages={(dayKey, pages, goal) => {
                    const alreadyRead = new Set(wirdHistory[dayKey] ?? []);
                    const newlyRead = pages.filter((page) => !alreadyRead.has(page));
                    if (newlyRead.length === 0) return;
                    setWirdHistory((current) => ({
                      ...current,
                      [dayKey]: Array.from(new Set([...(current[dayKey] ?? []), ...newlyRead])).sort((a, b) => a - b),
                    }));
                    setQuranLastReadingEvent({ dayKey, pages: newlyRead });
                    if (goal > 0) {
                      setQuranWirdDailyGoals((current) =>
                        current[dayKey] === goal ? current : { ...current, [dayKey]: goal },
                      );
                    }
                  }}
                  quranWirdPlan={quranWirdPlan}
                  wirdCompletionAnnouncedDayKey={quranWirdCompletionAnnounced}
                  onWirdCompletionAnnounced={setQuranWirdCompletionAnnounced}
                  onReadingPositionChange={setQuranReadingPosition}
                />
              )}
              {view === "custom_counter" && (
                <CustomCounterScreen
                  isArabic={selectedLang === "ar"}
                  direction={layoutDirection}
                  onBack={pop}
                  hapticFeedback={hapticFeedback}
                  reduceMotion={reduceMotion}
                />
              )}
            </Suspense>
          </main>
        </div>
        {/* end app-main */}

        {/* Share Achievement Modal */}
        {showShareModal && (
          <ProgressShareModal
            dailyCompletions={dailyCompletions}
            progressDayStartHour={progressDayStartHour}
            language={selectedLang}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {import.meta.env.DEV && showAudioReview && (
          <Suspense fallback={<ScreenFallback language={selectedLang} />}>
            <AudioContentReviewScreen
              onClose={() => {
                audioController?.stop();
                setShowAudioReview(false);
              }}
            />
          </Suspense>
        )}

        {/* Floating Audio Player */}
        {audioController?.state.plan && (
          <Suspense fallback={null}>
            <FloatingAudioPlayer
              controller={audioController}
              language={selectedLang}
              overReadingSurface={readerInMushafMode}
            />
          </Suspense>
        )}

        {((persistenceError && !persistenceNoticeDismissed) ||
          updateAvailable ||
          updatedNotes ||
          (installPrompt && sessions.length > 0 && !installDismissed)) && (
          <div
            className="absolute inset-x-0 z-40"
            style={{
              bottom: showBottomNavArea
                ? "calc(4.5rem + env(safe-area-inset-bottom))"
                : "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            {persistenceError && !persistenceNoticeDismissed ? (
              <PwaNotice
                title={t(selectedLang, "persistence.title")}
                body={t(selectedLang, "persistence.body")}
                actionLabel={t(selectedLang, "persistence.retry")}
                dismissLabel={t(selectedLang, "common.dismiss")}
                onAction={() => setPersistenceError(!saveAppState(appStateSnapshot))}
                onDismiss={() => setPersistenceNoticeDismissed(true)}
              />
            ) : updateAvailable ? (
              <PwaNotice
                title={t(selectedLang, "pwa.updateTitle")}
                body={releaseNotes ? undefined : t(selectedLang, "pwa.updateBody")}
                items={releaseNotes?.[selectedLang]}
                actionLabel={t(selectedLang, "pwa.refresh")}
                dismissLabel={t(selectedLang, "pwa.later")}
                isActionLoading={isUpdating}
                statusMessage={isUpdating ? t(selectedLang, "pwa.updating") : undefined}
                errorMessage={pwaError}
                onAction={applyUpdate}
                onDismiss={dismissUpdate}
              />
            ) : updatedNotes ? (
              <PwaNotice
                title={t(selectedLang, "pwa.updatedTitle")}
                body={t(selectedLang, "pwa.updatedBody")}
                items={updatedNotes[selectedLang]}
                dismissLabel={t(selectedLang, "common.close")}
                onDismiss={dismissUpdatedNotes}
              />
            ) : (
              <PwaNotice
                title={t(selectedLang, "pwa.installTitle")}
                body={t(selectedLang, "pwa.installBody")}
                actionLabel={t(selectedLang, "pwa.install")}
                dismissLabel={t(selectedLang, "pwa.later")}
                isActionLoading={isInstalling}
                statusMessage={isInstalling ? t(selectedLang, "pwa.installing") : undefined}
                onAction={() => void installApp()}
                onDismiss={dismissInstall}
              />
            )}
          </div>
        )}

        {/* Bottom nav — compact and medium only, shown in its own grid area */}
        {showBottomNavArea && (
          <div className="app-bottom-nav">
            <BottomNav
              active={activeTab}
              onChange={(tab) => {
                setFridayDuaFlow(false);
                handleNavTab(tab);
              }}
              isArabic={isArabic}
            />
          </div>
        )}
      </div>

      {/* Accessible confirmation dialog */}
      {guestMigrationOpen && (
        <ConfirmDialog
          open
          title={t(selectedLang, "auth.guestProgressTitle")}
          description={t(selectedLang, "auth.guestProgressBody")}
          confirmLabel={t(selectedLang, "auth.mergeGuestProgress")}
          secondaryLabel={t(selectedLang, "auth.discardGuestProgress")}
          cancelLabel={t(selectedLang, "auth.cancelGuestMigration")}
          onConfirm={() => resolveGuestMigration("merge")}
          onSecondary={() => resolveGuestMigration("discard")}
          onCancel={() => resolveGuestMigration("cancel")}
        />
      )}
      {pendingConfirm && (
        <ConfirmDialog
          open={true}
          title={pendingConfirm.title}
          description={pendingConfirm.description}
          confirmLabel={pendingConfirm.confirmLabel}
          cancelLabel={pendingConfirm.cancelLabel}
          destructive={pendingConfirm.destructive}
          onConfirm={async () => {
            await pendingConfirm.onConfirm();
            setPendingConfirm(null);
          }}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [audioModule, setAudioModule] = useState<AudioModule | null>(null);
  const [audioController, setAudioController] = useState<AudioController | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAudioModule().then((loaded) => {
      if (!cancelled) setAudioModule(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AppContent
        audioController={audioController}
        buildPlaybackPlan={audioModule?.buildPlaybackPlan ?? null}
        getAudioCoverage={audioModule?.getAudioCoverage ?? null}
      />
      {/* A sibling of AppContent, not an ancestor: the audio chunk loads in
          the background and reports its controller through this callback
          rather than through Context, so the rest of the app never waits on
          it to reach first paint, and AppContent never gets remounted (and
          its state lost) once the chunk arrives. */}
      {audioModule && <audioModule.AudioProvider onControllerReady={setAudioController} />}
    </>
  );
}
