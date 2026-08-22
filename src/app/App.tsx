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
  ThemeMode,
  PrayerName,
  MushafTheme,
  QuranReadingPosition,
  QuranWirdPlan,
} from "./types";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { authProviderFlags, isSupabaseConfigured } from "../lib/supabase";
import {
  FRIDAY_KAHF_WEEK_KEY,
  fridayKahfOpenedKey,
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
import { PwaNotice } from "./components/PwaNotice";
import { useAudioController } from "./audio/useAudioController";
import { AudioProvider } from "./audio/AudioProvider";
import { buildPlaybackPlan, getAudioCoverage } from "./audio/buildPlaybackPlan";
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
function AppContent() {
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
    activeIdx,
    setActiveIdx,
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

  const audioController = useAudioController();
  const audioCoverage = useMemo(() => getAudioCoverage(activeAzkarList), [activeAzkarList]);
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
  const [khatmahPage, setKhatmahPage] = useState(initialState.khatmahPage ?? 1);
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(initialState.mushafTheme ?? "parchment");
  const [mushafBookmarks, setMushafBookmarks] = useState<number[]>(initialState.mushafBookmarks ?? []);
  const [dailyWirdGoal, setDailyWirdGoal] = useState<number>(initialState.dailyWirdGoal ?? 4);
  const [wirdHistory, setWirdHistory] = useState<Record<string, number[]>>(initialState.wirdHistory ?? {});
  const [quranReadingPosition, setQuranReadingPosition] = useState<QuranReadingPosition>(
    initialState.quranReadingPosition ?? { page: initialState.khatmahPage ?? 1 },
  );
  const [quranWirdPlan, setQuranWirdPlan] = useState<QuranWirdPlan>(
    initialState.quranWirdPlan ?? { kind: "daily", dailyPages: initialState.dailyWirdGoal ?? 4 },
  );

  /**
   * Upserts one of the two flags for a prayer on the current progress day.
   *
   * Keyed by (dayKey, prayer) so a record always names the prayer it belongs
   * to; nothing here consults the clock, which keeps tracking independent of
   * which prayer happens to be current when the tick is made.
   */
  const handleTogglePrayerTracking = useCallback(
    (prayer: PrayerName, field: "mosque" | "adhkar", next: boolean) => {
      const dayKey = getProgressDayKey(new Date(), progressDayStartHour);
      setPrayerTracking((current) => {
        // Guarded rather than trusted: this reducer is the one place a bad
        // restore turns into a crash on the user's first tap.
        const records = current ?? [];
        const index = records.findIndex((record) => record.dayKey === dayKey && record.prayer === prayer);
        const existing = index >= 0 ? records[index]! : { dayKey, prayer, mosque: false, adhkar: false };
        const updated = { ...existing, [field]: next };
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
      mushafBookmarks,
      dailyWirdGoal,
      wirdHistory,
      quranReadingPosition,
      quranWirdPlan,
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
      mushafBookmarks,
      dailyWirdGoal,
      wirdHistory,
      quranReadingPosition,
      quranWirdPlan,
      showTranslation,
      showTransliteration,
      textSize,
      themeMode,
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
    const plan = audioController.state.plan;
    const playingZikrId = plan?.entries[audioController.state.entryIndex]?.zikrId;
    if (view !== "reader" || !plan || plan.context.category !== activeCat || !playingZikrId) return;
    const matchingIndex = activeAzkarList.findIndex((zikr) => zikr.id === playingZikrId);
    if (matchingIndex >= 0 && matchingIndex !== activeIdx) setActiveIdx(matchingIndex);
  }, [
    activeAzkarList,
    activeCat,
    activeIdx,
    audioController.state.entryIndex,
    audioController.state.plan,
    view,
    setActiveIdx,
  ]);

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
    setMushafTheme(state.mushafTheme ?? "parchment");
    setMushafBookmarks(state.mushafBookmarks ?? []);
    setDailyWirdGoal(state.dailyWirdGoal ?? 4);
    setWirdHistory(state.wirdHistory ?? {});
    setQuranReadingPosition(state.quranReadingPosition ?? { page: state.khatmahPage ?? 1 });
    setQuranWirdPlan(state.quranWirdPlan ?? { kind: "daily", dailyPages: state.dailyWirdGoal ?? 4 });
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
      highContrast,
      boldText,
      reduceMotion,
      forceRtl,
      colorBlindSupport,
    });
  }, [boldText, colorBlindSupport, forceRtl, themeMode, highContrast, reduceMotion, selectedLang, textSize]);

  useEffect(() => {
    const saved = saveAppState(appStateSnapshot);
    setPersistenceError(!saved);
    if (saved) setPersistenceNoticeDismissed(false);
  }, [appStateSnapshot]);

  const showBottomNav = [
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
  const activeZikrHasAudio = activeZikr ? getAudioCoverage([activeZikr]).available === 1 : false;

  const startAudio = (items: typeof azkar, source: "single" | "full-session", repeatPrescribed = false) => {
    const plan = buildPlaybackPlan({
      zikrs: items,
      context: { category: activeCat, routineMode: activeRoutineMode, source },
      mode: repeatPrescribed ? "repeat-prescribed-count" : "play-once",
      preferences: audioController.preferences,
    });
    return audioController.startPlan(plan);
  };

  const startPlayAllAudio = () => {
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
                  onResume={resumeCategory}
                  onPrayerResume={(prayer) => resumeCategory("after_prayer", prayer)}
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
                  onPrayerResume={(prayer) => resumeCategory("after_prayer", prayer)}
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
                      try {
                        window.localStorage.setItem(fridayKahfOpenedKey(), "true");
                      } catch {
                        // Opening the reader does not depend on storage.
                      }
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
                  position={quranReadingPosition}
                  plan={quranWirdPlan}
                  wirdHistory={wirdHistory}
                  onBack={pop}
                  onContinue={() => push("khatmah")}
                  onPlanChange={(plan) => {
                    setQuranWirdPlan(plan);
                    setDailyWirdGoal(plan.dailyPages);
                  }}
                  onUndoPage={() => {
                    const dayKey = getProgressDayKey();
                    setWirdHistory((current) => {
                      const pages = current[dayKey] ?? [];
                      if (pages.length === 0) return current;
                      return { ...current, [dayKey]: pages.slice(0, -1) };
                    });
                  }}
                />
              )}
              {view === "khatmah" && (
                <KhatmahReaderScreen
                  language={selectedLang}
                  direction={layoutDirection}
                  onBack={pop}
                  khatmahPage={khatmahPage}
                  setKhatmahPage={setKhatmahPage}
                  mushafTheme={mushafTheme}
                  setMushafTheme={setMushafTheme}
                  mushafBookmarks={mushafBookmarks}
                  setMushafBookmarks={setMushafBookmarks}
                  wirdHistory={wirdHistory}
                  setWirdHistory={setWirdHistory}
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
                audioController.stop();
                setShowAudioReview(false);
              }}
            />
          </Suspense>
        )}

        {/* Floating Audio Player */}
        {audioController.state.plan && (
          <Suspense fallback={null}>
            <FloatingAudioPlayer controller={audioController} language={selectedLang} />
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
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
