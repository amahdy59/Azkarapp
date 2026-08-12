import { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fromCompletedSets, loadAppState, saveAppState, toCompletedSets, type StoredSession } from "./state";
import { applyAppAppearance } from "./theme";
import { parseLocation, routeToHash } from "./routing";
import { getAzkarForMode, isRoutineCategory, registerLazyCollection } from "./content/azkar";
import type {
  AppLanguage,
  AppStateSnapshot,
  BeforeInstallPromptEvent,
  CategoryId,
  ColorBlindSupport,
  LocationSettings,
  ReminderSettings,
  RoutineMode,
  TextSizeOption,
  ThemeMode,
  View,
} from "./types";
import type { LibrarySection } from "./screens/AzkarLibraryScreen";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { authProviderFlags, isSupabaseConfigured } from "../lib/supabase";
import {
  FRIDAY_KAHF_WEEK_KEY,
  fridayKahfOpenedKey,
  getIsoWeekKey,
  readFridayDuaProgress,
  writeFridayDuaProgress,
} from "./fridayProgress";

const ONBOARDING_COMPLETE_KEY = "azkarapp.onboarding-complete.v1";

function categoryFromShortcutUrl(): CategoryId | null {
  const category = new URLSearchParams(window.location.search).get("category");
  return category === "morning" || category === "evening" || category === "before_sleep" ? category : null;
}

function isLazyRouteCategory(categoryId: CategoryId): boolean {
  return categoryId === "comprehensive_duas" || categoryId === "friday_kahf";
}

async function loadLazyRouteCategory(categoryId: CategoryId) {
  if (categoryId === "comprehensive_duas") {
    const { COMPREHENSIVE_DUAS } = await import("./content/comprehensiveDuas");
    registerLazyCollection(categoryId, COMPREHENSIVE_DUAS);
  } else if (categoryId === "friday_kahf") {
    const { FRIDAY_KAHF } = await import("./content/fridayKahf");
    registerLazyCollection(categoryId, FRIDAY_KAHF);
  }
}

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
import { loadReleaseNotes, type ReleaseNotes } from "./releaseNotes";
import { useRemoteAccountSync } from "./hooks/useRemoteAccountSync";
import { getLocationBasedReminders, useForegroundReminders } from "./hooks/useForegroundReminders";
import { useAuthHandlers, type ConfirmDialogOptions, type GuestMigrationDecision } from "./hooks/useAuthHandlers";
import { useSettingsHandlers } from "./hooks/useSettingsHandlers";
import { useSessionHandlers } from "./hooks/useSessionHandlers";
import {
  getPalmStreakSummary,
  getFirstIncompleteZikrIndex,
  getNextIncompleteZikrIndex,
  millisecondsUntilNextProgressDay,
  resetStaleCompletedCollections,
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

type NavTab = "home" | "azkar" | "progress" | "settings";

/** Keeps the bottom/rail navigation highlight in step with a restored route. */
function tabForView(view: View): NavTab {
  if (view === "settings") return "settings";
  if (view === "progress") return "progress";
  if (view === "library" || view === "category" || view === "reader") return "azkar";
  return "home";
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function AppContent() {
  const initialState = useRef(loadAppState()).current;
  // Deep link wins over the splash screen, so a shared or bookmarked URL opens
  // the screen it names instead of restarting the app at the beginning.
  const initialRoute = useRef(parseLocation(window.location.search, window.location.hash)).current;
  const initialShortcutCategory = useRef(categoryFromShortcutUrl()).current;
  const [view, setView] = useState<View>(() => initialRoute?.view ?? "splash");
  const initialHistoryView = useRef(view).current;
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
  const [activeTab, setActiveTab] = useState<"home" | "azkar" | "progress" | "settings">(() =>
    tabForView(initialRoute?.view ?? "home"),
  );
  const [activeCat, setActiveCat] = useState<CategoryId>(initialRoute?.categoryId ?? "morning");
  const [activeIdx, setActiveIdx] = useState(initialRoute?.index ?? 0);
  const [searchQuery, setSearchQuery] = useState(initialRoute?.query ?? "");
  const [librarySection, setLibrarySection] = useState<LibrarySection>("collections");
  const [routineModes, setRoutineModes] = useState(initialState.settings.routineModes);
  const [routeContentLoading, setRouteContentLoading] = useState(
    () =>
      initialRoute?.view === "reader" ||
      Boolean(initialRoute?.categoryId && isLazyRouteCategory(initialRoute.categoryId)),
  );
  const [routeContentError, setRouteContentError] = useState<{
    categoryId: CategoryId;
    targetView: View;
    targetIndex: number;
  } | null>(null);
  const routeLoadId = useRef(0);

  const hydrateRouteCategory = useCallback(
    async (categoryId: CategoryId, targetView: View, targetIndex = 0) => {
      const loadId = ++routeLoadId.current;
      setRouteContentLoading(true);
      setRouteContentError(null);
      try {
        await loadLazyRouteCategory(categoryId);
        if (loadId !== routeLoadId.current) return;

        const mode = isRoutineCategory(categoryId) ? routineModes[categoryId] : "complete";
        const items = getAzkarForMode(categoryId, mode);
        if (targetView === "reader" && (targetIndex < 0 || targetIndex >= items.length)) {
          setActiveIdx(0);
          setView(items.length > 0 ? "category" : "library");
        }
        return true;
      } catch (error) {
        reportError(error, "route-content-load");
        if (loadId === routeLoadId.current) {
          setRouteContentError({ categoryId, targetView, targetIndex });
        }
        return false;
      } finally {
        if (loadId === routeLoadId.current) setRouteContentLoading(false);
      }
    },
    [routineModes],
  );

  const activeRoutineMode: RoutineMode = isRoutineCategory(activeCat) ? routineModes[activeCat] : "complete";
  const activeAzkarList = getAzkarForMode(activeCat, activeRoutineMode);
  const layoutMode = useLayoutMode();
  useViewFocus(view);

  const audioController = useAudioController();
  const audioCoverage = useMemo(() => getAudioCoverage(activeAzkarList), [activeAzkarList]);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialState.settings.themeMode);
  const darkMode = themeMode !== "light";
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(initialState.settings.language);
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
  const [calendarType, setCalendarType] = useState<"hijri" | "gregorian">(
    initialState.settings.calendarType ?? "hijri",
  );
  const [dailyCompletions, setDailyCompletions] = useState(initialState.dailyCompletions);
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

  const ensureCurrentFridayWeek = useCallback(() => {
    const currentWeek = getIsoWeekKey();
    try {
      if (window.localStorage.getItem(FRIDAY_KAHF_WEEK_KEY) === currentWeek) return true;
      window.localStorage.setItem(FRIDAY_KAHF_WEEK_KEY, currentWeek);
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
      const week = getIsoWeekKey();
      const { COMPREHENSIVE_DUAS } = await import("./content/comprehensiveDuas");
      registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
      const duaIds = COMPREHENSIVE_DUAS.filter((dua) => !dua.isCollectionIntroduction).map((dua) => dua.id);
      const stored = readFridayDuaProgress(duaIds, week);
      writeFridayDuaProgress(stored, week);
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

  useEffect(() => {
    if (initialRoute?.categoryId && (initialRoute.view === "reader" || isLazyRouteCategory(initialRoute.categoryId))) {
      void hydrateRouteCategory(initialRoute.categoryId, initialRoute.view, initialRoute.index);
    }
  }, [hydrateRouteCategory, initialRoute]);
  const [sessions, setSessions] = useState<StoredSession[]>(initialState.sessions);
  const [savedZikrIds, setSavedZikrIds] = useState<Set<string>>(() => new Set(initialState.savedZikrIds));
  const [displayName, setDisplayName] = useState(initialState.profile.displayName);
  const [email, setEmail] = useState(initialState.profile.email);
  const [phone, setPhone] = useState(initialState.profile.phone);
  const [avatarUrl, setAvatarUrl] = useState(initialState.profile.avatarUrl);
  const [isGuest, setIsGuest] = useState(initialState.profile.isGuest);
  const [accountUserId, setAccountUserId] = useState(initialState.profile.accountUserId);
  const [remoteSyncReady, setRemoteSyncReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNotes | null>(null);
  const [persistenceError, setPersistenceError] = useState(false);
  const [persistenceNoticeDismissed, setPersistenceNoticeDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [pwaError, setPwaError] = useState("");
  const [pwaStatus, setPwaStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(() => {
    try {
      return window.localStorage.getItem("azkarapp.install-dismissed") === "true";
    } catch {
      return false;
    }
  });

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
      savedZikrIds: [...savedZikrIds].sort(),
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
      savedZikrIds,
      showTranslation,
      showTransliteration,
      textSize,
      themeMode,
    ],
  );

  // Tracks how many entries *this app* has pushed. window.history.length counts
  // the whole tab's session, so arriving from another site made it >1 already
  // and Back navigated out of the app instead of home.
  const inAppHistoryDepth = useRef(0);

  // Creates the history entry only. The URL itself is written by the sync
  // effect below, which also catches the places that call setView directly
  // (keyboard shortcuts, app shortcuts) so the address bar never lies.
  const push = useCallback((to: View) => {
    window.history.pushState({ view: to }, "", window.location.href);
    inAppHistoryDepth.current += 1;
    setView(to);
  }, []);

  const pop = useCallback(() => {
    if (inAppHistoryDepth.current > 0) {
      // Do not decrement here — history.back() fires popstate, and the popstate
      // handler owns the decrement so browser-Back and in-app back agree.
      window.history.back();
    } else {
      push("home");
    }
  }, [push]);

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
    [hydrateRouteCategory, openCategoryWithoutHydration, push],
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

  useEffect(() => {
    if (fridayDuaFlow && (activeCat !== "comprehensive_duas" || (view !== "category" && view !== "reader"))) {
      setFridayDuaFlow(false);
    }
  }, [activeCat, fridayDuaFlow, view]);

  useEffect(() => {
    if (view !== "category" && view !== "reader") setRouteContentError(null);
  }, [view]);

  useEffect(() => {
    const plan = audioController.state.plan;
    const playingZikrId = plan?.entries[audioController.state.entryIndex]?.zikrId;
    if (view !== "reader" || !plan || plan.context.category !== activeCat || !playingZikrId) return;
    const matchingIndex = activeAzkarList.findIndex((zikr) => zikr.id === playingZikrId);
    if (matchingIndex >= 0 && matchingIndex !== activeIdx) setActiveIdx(matchingIndex);
  }, [activeAzkarList, activeCat, activeIdx, audioController.state.entryIndex, audioController.state.plan, view]);

  const markOnboardingComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
    try {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    } catch {
      // Storage failure non-fatal
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
    applyStateSnapshot: useCallback((state: AppStateSnapshot) => {
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
    }, []),
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
  }, [hasCompletedOnboarding]);

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
  }, []);

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
    setCompleted((previous) =>
      resetStaleCompletedCollections(previous, dailyCompletions, new Date(), progressDayStartHour),
    );
  }, [dailyCompletions, progressDayStartHour]);

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
    const handleUpdate = () => {
      setUpdateAvailable(true);
      setPwaError("");
      setReleaseNotes(null);
      void loadReleaseNotes().then(setReleaseNotes);
    };
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleUpdateFailure = () => {
      setIsUpdating(false);
      setPwaError(t(selectedLang, "pwa.updateError"));
    };

    window.addEventListener("azkar-update-available", handleUpdate);
    window.addEventListener("azkar-update-failed", handleUpdateFailure);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => {
      window.removeEventListener("azkar-update-available", handleUpdate);
      window.removeEventListener("azkar-update-failed", handleUpdateFailure);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, [selectedLang]);

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

  useEffect(() => {
    if (!window.history.state?.view) {
      window.history.replaceState({ view: initialHistoryView }, "", window.location.href);
    }
  }, [initialHistoryView]);

  // Single writer for the address bar: whatever the app is showing, the URL
  // says so, and reloading that URL comes back to the same place.
  useEffect(() => {
    const hash = routeToHash({ view, categoryId: activeCat, index: activeIdx, query: searchQuery });
    // Onboarding and auth steps have no linkable route — leave the URL alone.
    if (!hash) return;
    const target = `${window.location.pathname}${hash}`;
    if (`${window.location.pathname}${window.location.hash}` !== target) {
      window.history.replaceState({ view }, "", target);
    }
  }, [view, activeCat, activeIdx, searchQuery]);

  // Adopts whatever the address bar currently says. Idempotent, so it is safe
  // for popstate and hashchange to both fire for the same navigation.
  const applyRouteFromLocation = useCallback((): boolean => {
    const route = parseLocation(window.location.search, window.location.hash);
    if (!route) return false;
    setView(route.view);
    if (route.categoryId) {
      setActiveCat(route.categoryId);
      if (route.view === "reader" || isLazyRouteCategory(route.categoryId)) {
        void hydrateRouteCategory(route.categoryId, route.view, route.index);
      } else {
        routeLoadId.current += 1;
        setRouteContentLoading(false);
      }
    } else {
      routeLoadId.current += 1;
      setRouteContentLoading(false);
    }
    if (route.index !== undefined) setActiveIdx(route.index);
    if (route.query !== undefined) setSearchQuery(route.query);
    setActiveTab(tabForView(route.view));
    return true;
  }, [hydrateRouteCategory]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Keep the in-app depth counter in step with the browser's own Back
      // button, not just our pop() helper, so the two never drift apart.
      inAppHistoryDepth.current = Math.max(0, inAppHistoryDepth.current - 1);

      // The URL is the source of truth; history.state is only a fallback for
      // entries pushed before the route was written.
      if (applyRouteFromLocation()) return;
      if (e.state?.view) {
        setView(e.state.view);
        setActiveTab(tabForView(e.state.view));
      } else {
        setView(hasCompletedOnboarding ? "home" : "language");
      }
    };

    // Typing a route into the address bar, or following an in-page link, fires
    // hashchange but not popstate — without this the sync effect would simply
    // overwrite the hash the user just asked for.
    const handleHashChange = () => {
      applyRouteFromLocation();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [applyRouteFromLocation, hasCompletedOnboarding, setView, setActiveTab]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K / '/' for search; Alt+1..5 for tabs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable ||
          activeEl.getAttribute("role") === "textbox")
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setView("search");
        return;
      }

      if (e.key === "/" && view !== "reader" && view !== "custom_counter") {
        e.preventDefault();
        setView("search");
        return;
      }

      if (e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveTab("home");
          setView("home");
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveTab("azkar");
          setView("library");
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveTab("progress");
          setView("progress");
        } else if (e.key === "4") {
          e.preventDefault();
          setActiveTab("settings");
          setView("settings");
        } else if (e.key === "5") {
          e.preventDefault();
          setView("custom_counter");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, setView, setActiveTab]);

  useEffect(() => {
    if (view !== "home") {
      return;
    }

    const category = initialShortcutCategory;
    if (!category) {
      return;
    }

    setActiveCat(category);
    setActiveTab("azkar");
    setView("category");
    window.history.replaceState(null, "", window.location.pathname);
  }, [initialShortcutCategory, view]);

  const handleNavTab = (tab: "home" | "azkar" | "progress" | "settings") => {
    setActiveTab(tab);
    if (tab === "home") {
      push("home");
    } else if (tab === "azkar") {
      setLibrarySection("collections");
      push("library");
    } else if (tab === "progress") {
      push("progress");
    } else if (tab === "settings") {
      push("settings");
    }
  };

  const showBottomNav = [
    "home",
    "library",
    "benefits",
    "category",
    "reader",
    "settings",
    "search",
    "progress",
    "friday",
    "friday_salawat",
    "custom_counter",
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
  // The reader is a full-screen reading surface on the bottom-nav tiers: its
  // own header row carries every action it needs, so the tab bar is hidden
  // there and the zikr text plus counter get the whole viewport back.
  const showBottomNavArea = showBottomNav && view !== "reader" && (layoutMode === "compact" || layoutMode === "medium");
  const showRail = showBottomNav && layoutMode === "expanded";
  const showSidebar = showBottomNav && layoutMode === "large";

  return (
    <div className="app-viewport flex items-center justify-center">
      <div className="app-shell relative overflow-hidden bg-background shadow-2xl">
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
        {showRail && <NavRail active={activeTab} onChange={handleNavTab} isArabic={isArabic} />}
        {showSidebar && (
          <NavSidebar
            active={activeTab}
            onChange={handleNavTab}
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
                  quietProgressEnabled={quietProgressEnabled}
                  progressDayStartHour={progressDayStartHour}
                  locationSettings={locationSettings}
                  onResume={resumeCategory}
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
                />
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
                  onBack={() => {
                    window.history.replaceState({ view: "friday" }, "", "?view=friday");
                    setView("friday");
                  }}
                />
              )}
              {view === "category" && !routeContentLoading && !routeContentError && (
                <CategoryScreen
                  catId={activeCat}
                  completed={
                    fridayDuaFlow && activeCat === "comprehensive_duas"
                      ? fridayDuaCompletedIds
                      : (completed[activeCat] ?? new Set())
                  }
                  isArabic={isArabic}
                  direction={layoutDirection}
                  onZikr={(i) => openReader(activeCat, i)}
                  onToggleZikr={(i) => {
                    const zikrId = getAzkarForMode(activeCat, activeRoutineMode)[i]?.id;
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
                    handleResetCategory(activeCat);
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
                  hapticFeedback={hapticFeedback}
                  reduceMotion={reduceMotion}
                />
              )}
              {view === "reader" && !routeContentLoading && !routeContentError && activeZikr && (
                <ReaderScreen
                  catId={activeCat}
                  idx={activeIdx}
                  routineMode={activeRoutineMode}
                  isArabic={isArabic}
                  direction={layoutDirection}
                  themeMode={themeMode}
                  isDone={
                    isRepeatSession
                      ? repeatCompleted.has(activeIdx)
                      : fridayDuaFlow && activeCat === "comprehensive_duas"
                        ? fridayDuaCompletedIds.has(azkar[activeIdx]?.id ?? "")
                        : (completed[activeCat]?.has(azkar[activeIdx]?.id ?? "") ?? false)
                  }
                  collectionCompletedCount={
                    isRepeatSession
                      ? repeatCompleted.size
                      : fridayDuaFlow && activeCat === "comprehensive_duas"
                        ? fridayDuaCompletedIds.size
                        : (completed[activeCat]?.size ?? 0)
                  }
                  hapticFeedback={hapticFeedback}
                  reduceMotion={reduceMotion}
                  showTranslation={showTranslation}
                  showTransliteration={showTransliteration}
                  textSize={textSize}
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
                  onProgressDayStartHourChange={setProgressDayStartHour}
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
              {view === "custom_counter" && (
                <CustomCounterScreen
                  isArabic={selectedLang === "ar"}
                  direction={layoutDirection}
                  onBack={pop}
                  hapticFeedback={hapticFeedback}
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
                onAction={() => {
                  setPwaError("");
                  setIsUpdating(true);
                  window.dispatchEvent(new Event("azkar-apply-update"));
                }}
                onDismiss={() => {
                  setUpdateAvailable(false);
                  setReleaseNotes(null);
                }}
              />
            ) : (
              <PwaNotice
                title={t(selectedLang, "pwa.installTitle")}
                body={t(selectedLang, "pwa.installBody")}
                actionLabel={t(selectedLang, "pwa.install")}
                dismissLabel={t(selectedLang, "pwa.later")}
                isActionLoading={isInstalling}
                statusMessage={isInstalling ? t(selectedLang, "pwa.installing") : undefined}
                onAction={() => {
                  const prompt = installPrompt;
                  if (!prompt) return;
                  void (async () => {
                    try {
                      setIsInstalling(true);
                      await prompt.prompt();
                      const choice = await prompt.userChoice;
                      setPwaStatus(
                        t(
                          selectedLang,
                          choice?.outcome === "accepted" ? "pwa.installAccepted" : "pwa.installDismissed",
                        ),
                      );
                    } catch (error) {
                      reportError(error, "pwa-install");
                      setPwaStatus(t(selectedLang, "pwa.installDismissed"));
                    } finally {
                      setIsInstalling(false);
                      setInstallPrompt(null);
                      window.setTimeout(() => setPwaStatus(""), 3000);
                    }
                  })();
                }}
                onDismiss={() => {
                  try {
                    window.localStorage.setItem("azkarapp.install-dismissed", "true");
                  } catch {
                    // Non-fatal storage failure
                  }
                  setInstallDismissed(true);
                }}
              />
            )}
          </div>
        )}

        {/* Bottom nav — compact and medium only, shown in its own grid area */}
        {showBottomNavArea && (
          <div className="app-bottom-nav">
            <BottomNav active={activeTab} onChange={handleNavTab} isArabic={isArabic} />
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
