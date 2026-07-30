import { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fromCompletedSets, loadAppState, saveAppState, toCompletedSets, type StoredSession } from "./state";
import { applyAppAppearance } from "./theme";
import { getAzkarByCategory } from "./content/azkar";
import type {
  AppLanguage,
  AppStateSnapshot,
  ArabicFontOption,
  BeforeInstallPromptEvent,
  CategoryId,
  ColorBlindSupport,
  LocationSettings,
  ReminderSettings,
  TextSizeOption,
  ThemeMode,
  View,
} from "./types";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { isSupabaseConfigured } from "../lib/supabase";

const ONBOARDING_COMPLETE_KEY = "azkarapp.onboarding-complete.v1";

function categoryFromShortcutUrl(): CategoryId | null {
  const category = new URLSearchParams(window.location.search).get("category");
  return category === "morning" || category === "evening" || category === "before_sleep" ? category : null;
}

import { BottomNav } from "./components/LayoutShells";
import { NetworkStatus } from "./components/NetworkStatus";
import { SyncStatus } from "./components/SyncStatus";
import { FloatingAudioPlayer } from "./components/FloatingAudioPlayer";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ScreenFallback } from "./components/ScreenFallback";
import { PwaNotice } from "./components/PwaNotice";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { t } from "./i18n";
import { useRemoteAccountSync } from "./hooks/useRemoteAccountSync";
import { getLocationBasedReminders, useForegroundReminders } from "./hooks/useForegroundReminders";
import { useAuthHandlers, type ConfirmDialogOptions } from "./hooks/useAuthHandlers";
import { useSettingsHandlers } from "./hooks/useSettingsHandlers";
import { useSessionHandlers } from "./hooks/useSessionHandlers";
import {
  getPalmStreakSummary,
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
const CompletionScreen = lazy(() =>
  import("./screens/CompletionScreen").then((module) => ({ default: module.CompletionScreen })),
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
const PhoneInputScreen = lazy(() =>
  import("./screens/auth/RevampedAuthScreens").then((module) => ({ default: module.PhoneInputScreen })),
);
const OTPScreen = lazy(() =>
  import("./screens/auth/RevampedAuthScreens").then((module) => ({ default: module.OTPScreen })),
);

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const initialState = useRef(loadAppState()).current;
  const [view, setView] = useState<View>("splash");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "azkar" | "progress" | "settings">("home");
  const [activeCat, setActiveCat] = useState<CategoryId>("morning");
  const [activeIdx, setActiveIdx] = useState(0);

  const activeAzkarList = useMemo(() => getAzkarByCategory(activeCat), [activeCat]);
  const audioPlayer = useAudioPlayer(activeAzkarList, activeIdx, setActiveIdx);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialState.settings.themeMode);
  const darkMode = themeMode !== "light";
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(initialState.settings.language);
  const [showTransliteration, setShowTransliteration] = useState(initialState.settings.showTransliteration);
  const [showTranslation, setShowTranslation] = useState(initialState.settings.showTranslation);
  const [textSize, setTextSize] = useState<TextSizeOption>(initialState.settings.textSize);
  const [arabicFont, setArabicFont] = useState<ArabicFontOption>(initialState.settings.arabicFont);
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
  const [sessions, setSessions] = useState<StoredSession[]>(initialState.sessions);
  const [savedZikrIds, setSavedZikrIds] = useState<Set<string>>(() => new Set(initialState.savedZikrIds));
  const [displayName, setDisplayName] = useState(initialState.profile.displayName);
  const [lastPhoneNumber, setLastPhoneNumber] = useState(initialState.profile.lastPhoneNumber);
  const [isGuest, setIsGuest] = useState(initialState.profile.isGuest);
  const [accountUserId, setAccountUserId] = useState(initialState.profile.accountUserId);
  const [remoteSyncReady, setRemoteSyncReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
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
        arabicFont,
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
      },
      profile: { displayName, lastPhoneNumber, isGuest, accountUserId },
      completed: fromCompletedSets(completed),
      sessions,
      dailyCompletions,
      savedZikrIds: [...savedZikrIds].sort(),
    }),
    [
      boldText,
      accountUserId,
      arabicFont,
      calendarType,
      colorBlindSupport,
      completed,
      darkMode,
      displayName,
      forceRtl,
      hapticFeedback,
      highContrast,
      isGuest,
      lastPhoneNumber,
      reduceMotion,
      reminders,
      locationSettings,
      weeklyGoalDays,
      quietProgressEnabled,
      progressDayStartHour,
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
    push,
    pop,
    setView,
    setActiveTab,
    showConfirm,
  });

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
    authError,
    setAuthError,
    handleOpenAccountAuth,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleSignOut,
  } = useAuthHandlers({
    selectedLang,
    lastPhoneNumber,
    setLastPhoneNumber,
    setDisplayName,
    setIsGuest,
    setRemoteSyncReady,
    appStateSnapshot,
    applyStateSnapshot: useCallback((state: AppStateSnapshot) => {
      setSelectedLang(state.settings.language);
      setThemeMode(state.settings.themeMode);
      setShowTransliteration(state.settings.showTransliteration);
      setShowTranslation(state.settings.showTranslation);
      setTextSize(state.settings.textSize);
      setArabicFont(state.settings.arabicFont);
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
      setDisplayName(state.profile.displayName);
      setLastPhoneNumber(state.profile.lastPhoneNumber);
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
    showConfirm,
    setPendingConfirm,
    setView,
    setActiveTab,
  });

  const { handleExportData, handleResetPreferences, handleClearLocalData } = useSettingsHandlers({
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
    setArabicFont(state.settings.arabicFont);
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
    setDisplayName(state.profile.displayName);
    setLastPhoneNumber(state.profile.lastPhoneNumber);
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
    retry: retrySync,
    syncError,
  } = useRemoteAccountSync({
    initialState,
    state: appStateSnapshot,
    isGuest,
    currentStreak,
    longestStreak,
    remoteSyncReady,
    onRemoteState: applyStateSnapshot,
    onRemoteHydrationChange: setRemoteSyncReady,
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

  useEffect(() => saveAppState(appStateSnapshot), [appStateSnapshot]);

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

  const showBottomNav = ["home", "library", "category", "reader", "settings", "search", "progress"].includes(view);
  const azkar = getAzkarByCategory(activeCat);

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
                phoneAuthEnabled={isSupabaseConfigured}
                onPhone={() => {
                  setAuthError("");
                  setView("phone");
                }}
                onGuest={() => {
                  markOnboardingComplete();
                  setDisplayName("Guest");
                  setIsGuest(true);
                  setView("home");
                  setActiveTab("home");
                }}
              />
            )}
            {view === "phone" && (
              <PhoneInputScreen
                language={selectedLang}
                initialPhone={lastPhoneNumber}
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
                maskedPhone={lastPhoneNumber}
                errorMessage={authError}
                isVerifying={isVerifyingOtp}
                isResending={isResendingOtp}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onBack={() => {
                  setAuthError("");
                  setView("phone");
                }}
                onDifferent={() => {
                  setAuthError("");
                  setView("phone");
                }}
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
                onOpenFridayMode={() => push("friday")}
                onOpenShareModal={() => setShowShareModal(true)}
                language={selectedLang}
                calendarType={calendarType}
                direction={layoutDirection}
              />
            )}
            {view === "library" && (
              <AzkarLibraryScreen
                completed={completed}
                language={selectedLang}
                direction={layoutDirection}
                onCategory={openCategory}
                onZikr={openReader}
                onSearch={() => push("search")}
                savedZikrIds={savedZikrIds}
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
              />
            )}
            {view === "friday" && <FridayModeScreen isArabic={isArabic} direction={layoutDirection} onBack={pop} />}
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
                onPlayAllAudio={() => {
                  openReader(activeCat, 0);
                  audioPlayer.toggleAutoPlayAll();
                  audioPlayer.playTrackAtIndex(0);
                }}
              />
            )}
            {view === "reader" && (
              <ReaderScreen
                catId={activeCat}
                idx={activeIdx}
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
                arabicFont={arabicFont}
                showTranslation={showTranslation}
                showTransliteration={showTransliteration}
                textSize={textSize}
                savedZikrIds={savedZikrIds}
                onBack={leaveReader}
                onComplete={markComplete}
                onAdvance={advanceAfterCompletion}
                onNext={() => {
                  if (activeIdx < azkar.length - 1) setActiveIdx((i) => i + 1);
                }}
                onPrev={() => {
                  if (activeIdx > 0) setActiveIdx((i) => i - 1);
                }}
                onToggleSaved={toggleSavedZikr}
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
              />
            )}
            {view === "settings" && (
              <SettingsScreen
                themeMode={themeMode}
                language={selectedLang}
                isGuest={isGuest}
                isSyncing={isSyncingRemote}
                syncError={syncError}
                sessions={sessions}
                dailyCompletions={dailyCompletions}
                savedCount={savedZikrIds.size}
                textSize={textSize}
                arabicFont={arabicFont}
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
                onArabicFontChange={setArabicFont}
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
                onBack={pop}
              />
            )}
            {view === "search" && (
              <SearchScreen
                language={selectedLang}
                direction={layoutDirection}
                onBack={pop}
                onZikr={(catId, i) => {
                  openReader(catId, i);
                }}
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

        {/* Floating Audio Player */}
        {(audioPlayer.isPlaying || audioPlayer.isBuffering) && (
          <FloatingAudioPlayer
            title={audioPlayer.currentZikr?.arabicText ?? ""}
            isPlaying={audioPlayer.isPlaying}
            isBuffering={audioPlayer.isBuffering}
            currentTime={audioPlayer.currentTime}
            duration={audioPlayer.duration}
            playbackRate={audioPlayer.playbackRate}
            autoPlayAll={audioPlayer.autoPlayAll}
            reciter={audioPlayer.reciter}
            language={selectedLang}
            onTogglePlayPause={audioPlayer.togglePlayPause}
            onNext={audioPlayer.playNext}
            onPrev={audioPlayer.playPrev}
            onSetSpeed={audioPlayer.setPlaybackRate}
            onSetReciter={audioPlayer.setReciter}
            onToggleAutoPlayAll={audioPlayer.toggleAutoPlayAll}
            onClose={audioPlayer.stop}
          />
        )}

        {(updateAvailable || (installPrompt && sessions.length > 0 && !installDismissed)) && (
          <div
            className="absolute inset-x-0 z-40"
            style={{
              bottom: showBottomNav
                ? "calc(4rem + env(safe-area-inset-bottom))"
                : "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            {updateAvailable ? (
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
