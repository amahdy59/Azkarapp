import { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fromCompletedSets, loadAppState, saveAppState, toCompletedSets, type StoredSession } from "./state";
import { applyAppAppearance } from "./theme";
import { getAzkarForMode, isRoutineCategory } from "./content/azkar";
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
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { authProviderFlags, isSupabaseConfigured } from "../lib/supabase";
import { FRIDAY_KAHF_WEEK_KEY, fridayKahfOpenedKey, getIsoWeekKey } from "./fridayProgress";

const ONBOARDING_COMPLETE_KEY = "azkarapp.onboarding-complete.v1";

function categoryFromShortcutUrl(): CategoryId | null {
  const category = new URLSearchParams(window.location.search).get("category");
  return category === "morning" || category === "evening" || category === "before_sleep" ? category : null;
}

import { BottomNav } from "./components/LayoutShells";
import { NetworkStatus } from "./components/NetworkStatus";
import { SyncStatus } from "./components/SyncStatus";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ScreenFallback } from "./components/ScreenFallback";
import { PwaNotice } from "./components/PwaNotice";
import { useAudioController } from "./audio/useAudioController";
import { AudioProvider } from "./audio/AudioProvider";
import { buildPlaybackPlan, getAudioCoverage } from "./audio/buildPlaybackPlan";
import { t } from "./i18n";
import { useRemoteAccountSync } from "./hooks/useRemoteAccountSync";
import { getLocationBasedReminders, useForegroundReminders } from "./hooks/useForegroundReminders";
import { useAuthHandlers, type ConfirmDialogOptions, type GuestMigrationDecision } from "./hooks/useAuthHandlers";
import { useSettingsHandlers } from "./hooks/useSettingsHandlers";
import { useSessionHandlers } from "./hooks/useSessionHandlers";
import {
  getPalmStreakSummary,
  getFirstIncompleteZikrIndex,
  millisecondsUntilNextProgressDay,
  resetStaleCompletedCollections,
  type GrowthEvent,
} from "./progress";

const HomeScreen = lazy(() => import("./screens/HomeScreen").then((module) => ({ default: module.HomeScreen })));
const AzkarLibraryScreen = lazy(() =>
  import("./screens/AzkarLibraryScreen").then((module) => ({ default: module.AzkarLibraryScreen })),
);
const CategoryScreen = lazy(() =>
  import("./screens/CategoryScreen").then((module) => ({ default: module.CategoryScreen })),
);
const ReaderScreen = lazy(() => import("./screens/ReaderScreen").then((module) => ({ default: module.ReaderScreen })));
const FloatingAudioPlayer = lazy(() =>
  import("./components/FloatingAudioPlayer").then((module) => ({ default: module.FloatingAudioPlayer })),
);
const CompletionScreen = lazy(() =>
  import("./screens/CompletionScreen").then((module) => ({ default: module.CompletionScreen })),
);
const CustomCounterScreen = lazy(() =>
  import("./screens/CustomCounterScreen").then((module) => ({ default: module.CustomCounterScreen })),
);
const SettingsScreen = lazy(() =>
  import("./screens/settings/SettingsScreen").then((module) => ({ default: module.SettingsScreen })),
);
const SearchScreen = lazy(() => import("./screens/SearchScreen").then((module) => ({ default: module.SearchScreen })));
const ProgressScreen = lazy(() =>
  import("./screens/ProgressScreen").then((module) => ({ default: module.ProgressScreen })),
);
const FridayModeScreen = lazy(() =>
  import("./screens/FridayModeScreen").then((module) => ({ default: module.FridayModeScreen })),
);
const FridaySalawatScreen = lazy(() =>
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
  const [view, setView] = useState<View>(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view");
    if (requestedView === "auth-callback") return "auth-callback";
    if (requestedView === "friday") return "friday";
    if (requestedView === "custom_counter") return "custom_counter";
    return "splash";
  });
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
  const [activeTab, setActiveTab] = useState<"home" | "azkar" | "progress" | "settings">("home");
  const [activeCat, setActiveCat] = useState<CategoryId>("morning");
  const [activeIdx, setActiveIdx] = useState(0);
  const [routineModes, setRoutineModes] = useState(initialState.settings.routineModes);

  const activeRoutineMode: RoutineMode = isRoutineCategory(activeCat) ? routineModes[activeCat] : "complete";
  const activeAzkarList = useMemo(() => getAzkarForMode(activeCat, activeRoutineMode), [activeCat, activeRoutineMode]);
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

  const ensureCurrentFridayWeek = useCallback(() => {
    const currentWeek = getIsoWeekKey();
    try {
      if (window.localStorage.getItem(FRIDAY_KAHF_WEEK_KEY) === currentWeek) return true;
      window.localStorage.setItem(FRIDAY_KAHF_WEEK_KEY, currentWeek);
    } catch {
      // Keep the in-memory reset when persistent storage is unavailable.
    }
    setCompleted((previous) => ({ ...previous, friday_kahf: new Set() }));
    return false;
  }, []);

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
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [persistenceError, setPersistenceError] = useState(false);
  const [persistenceNoticeDismissed, setPersistenceNoticeDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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
      onConfirm: () => void,
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

  const push = useCallback((to: View) => {
    window.history.pushState({ view: to }, "", `?view=${to}`);
    setView(to);
  }, []);

  const pop = useCallback(() => {
    if (window.history.length > 1) {
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
    openCategory,
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
    const handleUpdate = () => setUpdateAvailable(true);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("azkar-update-available", handleUpdate);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => {
      window.removeEventListener("azkar-update-available", handleUpdate);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

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

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setView(e.state.view);
        if (e.state.view === "settings") {
          setActiveTab("settings");
        } else if (e.state.view === "progress") {
          setActiveTab("progress");
        } else if (e.state.view === "library" || e.state.view === "category") {
          setActiveTab("azkar");
        } else if (e.state.view === "home") {
          setActiveTab("home");
        }
      } else {
        setView(hasCompletedOnboarding ? "home" : "language");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    if (view !== "home") {
      return;
    }

    const category = categoryFromShortcutUrl();
    if (!category) {
      return;
    }

    setActiveCat(category);
    setActiveTab("azkar");
    setView("category");
    window.history.replaceState(null, "", window.location.pathname);
  }, [view]);

  const handleNavTab = (tab: "home" | "azkar" | "progress" | "settings") => {
    setActiveTab(tab);
    if (tab === "home") {
      push("home");
    } else if (tab === "azkar") {
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
        selectedLang === "ar" ? "تغطية الصوت" : "Audio coverage",
        selectedLang === "ar"
          ? `الصوت متاح لـ ${audioCoverage.available} من ${audioCoverage.total}. غير متاح لـ ${audioCoverage.unavailable}.`
          : `Audio is available for ${audioCoverage.available} of ${audioCoverage.total} items. ${audioCoverage.unavailable} are unavailable.`,
        selectedLang === "ar" ? "تشغيل المتاح" : "Play available",
        t(selectedLang, "common.cancel"),
        playAvailable,
      );
      return;
    }
    playAvailable();
  };

  return (
    <div className="app-viewport flex items-center justify-center">
      <div className="app-shell relative flex flex-col overflow-hidden bg-background shadow-2xl">
        <NetworkStatus language={selectedLang} />
        {isSupabaseConfigured && !isGuest && (
          <SyncStatus
            isSyncing={isSyncingRemote}
            errorMessage={syncError}
            onRetry={retrySync}
            language={selectedLang}
          />
        )}

        <main id="main-content" tabIndex={-1} className="flex-1 overflow-hidden flex flex-col">
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
                onRepeat={repeatCategory}
                onOpenFridayMode={() => {
                  ensureCurrentFridayWeek();
                  push("friday");
                }}
                language={selectedLang}
                calendarType={calendarType}
                direction={layoutDirection}
                routineModes={routineModes}
                onSetRoutineMode={(categoryId, mode) => {
                  setRoutineModes((prev) => ({ ...prev, [categoryId]: mode }));
                }}
                onOpenCustomCounter={() => push("custom_counter")}
              />
            )}
            {view === "library" && (
              <AzkarLibraryScreen
                completed={completed}
                language={selectedLang}
                direction={layoutDirection}
                onCategory={openCategory}
                onZikr={(catId, index) => openReader(catId, index, "complete")}
                onSearch={() => push("search")}
                savedZikrIds={savedZikrIds}
                routineModes={routineModes}
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
            {view === "friday" && (
              <FridayModeScreen
                isArabic={isArabic}
                direction={layoutDirection}
                kahfCompletedCount={completed.friday_kahf.has("friday-kahf") ? 1 : 0}
                duasCompletedCount={completed.comprehensive_duas.size}
                onBack={pop}
                onStartKahf={() => {
                  try {
                    window.localStorage.setItem(fridayKahfOpenedKey(), "true");
                  } catch {
                    // Opening the reader does not depend on storage.
                  }
                  const sameWeek = ensureCurrentFridayWeek();
                  const kahf = getAzkarForMode("friday_kahf");
                  const nextIndex = sameWeek ? getFirstIncompleteZikrIndex(kahf, completed.friday_kahf) : 0;
                  if (nextIndex === null) {
                    setCompleted((previous) => ({ ...previous, friday_kahf: new Set() }));
                    openReader("friday_kahf", 0);
                    return;
                  }
                  openReader("friday_kahf", nextIndex);
                }}
                onOpenSalawat={() => push("friday_salawat")}
                onStartDuasSession={() => void openCategory("comprehensive_duas")}
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
            {view === "category" && (
              <CategoryScreen
                catId={activeCat}
                completed={completed[activeCat] ?? new Set()}
                isArabic={isArabic}
                direction={layoutDirection}
                onZikr={(i) => openReader(activeCat, i)}
                onToggleZikr={(i) => toggleZikrCompletion(activeCat, i)}
                onReset={() => handleResetCategory(activeCat)}
                onRepeat={() => repeatCategory(activeCat)}
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
            {view === "reader" && (
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
                    : (completed[activeCat]?.has(azkar[activeIdx]?.id ?? "") ?? false)
                }
                collectionCompletedCount={isRepeatSession ? repeatCompleted.size : (completed[activeCat]?.size ?? 0)}
                hapticFeedback={hapticFeedback}
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
                onComplete={markComplete}
                onAdvance={
                  activeCat === "friday_kahf"
                    ? () => {
                        window.history.replaceState({ view: "friday" }, "", "?view=friday");
                        setView("friday");
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
              bottom: showBottomNav
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
                body={t(selectedLang, "pwa.updateBody")}
                actionLabel={t(selectedLang, "pwa.refresh")}
                dismissLabel={t(selectedLang, "pwa.later")}
                isActionLoading={isUpdating}
                onAction={() => {
                  setIsUpdating(true);
                  window.dispatchEvent(new Event("azkar-apply-update"));
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }}
                onDismiss={() => setUpdateAvailable(false)}
              />
            ) : (
              <PwaNotice
                title={t(selectedLang, "pwa.installTitle")}
                body={t(selectedLang, "pwa.installBody")}
                actionLabel={t(selectedLang, "pwa.install")}
                dismissLabel={t(selectedLang, "pwa.later")}
                onAction={() => {
                  void installPrompt?.prompt();
                  setInstallPrompt(null);
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

        {/* Bottom nav */}
        {showBottomNav && <BottomNav active={activeTab} onChange={handleNavTab} isArabic={isArabic} />}
      </div>

      {/* Accessible confirmation dialog */}
      {guestMigrationOpen && (
        <ConfirmDialog
          open
          title={selectedLang === "ar" ? "بيانات الزائر" : "Guest progress found"}
          description={
            selectedLang === "ar"
              ? "اختر ما تريد فعله ببيانات هذا الجهاز قبل فتح الحساب."
              : "Choose what to do with this device’s guest progress before opening the account."
          }
          confirmLabel={selectedLang === "ar" ? "دمج التقدم مع الحساب" : "Merge guest progress"}
          secondaryLabel={selectedLang === "ar" ? "حذف تقدم الزائر" : "Discard guest progress"}
          cancelLabel={selectedLang === "ar" ? "إلغاء والبقاء كزائر" : "Cancel and remain a guest"}
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
          onConfirm={() => {
            pendingConfirm.onConfirm();
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
