import { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  clearStoredAppData,
  clearPrivateAppData,
  fromCompletedSets,
  loadAppState,
  resetStoredSettings,
  saveAppState,
  toCompletedSets,
  type StoredSession,
} from "./state";
import { applyAppAppearance } from "./theme";
import { getAzkarByCategory } from "./content/azkar";
import type {
  AppLanguage,
  AppStateSnapshot,
  ArabicFontOption,
  CategoryId,
  ColorBlindSupport,
  ReminderSettings,
  TextSizeOption,
  ThemeMode,
} from "./types";
import {
  loadRemoteState,
  normalizePhoneNumber,
  profileFromSession,
  requestPhoneOtp,
  resendPhoneOtp,
  signOutSupabase,
  verifyPhoneOtp,
} from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase";

// ─── Design tokens (match Azkar/Colors Figma vars) ────────────────────────────
// ─── Types ────────────────────────────────────────────────────────────────────
type View =
  | "home"
  | "library"
  | "category"
  | "reader"
  | "completion"
  // Phase 2 — English onboarding
  | "splash"
  | "onboard1"
  | "language"
  | "login"
  | "phone"
  | "otp"
  // Phase 2 — Arabic onboarding (shown when device locale is Arabic)
  | "ar_onboard1"
  // Phase 3
  | "settings"
  // Phase 4
  | "search";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

const ONBOARDING_COMPLETE_KEY = "azkarapp.onboarding-complete.v1";

function categoryFromShortcutUrl(): CategoryId | null {
  const category = new URLSearchParams(window.location.search).get("category");
  return category === "morning" || category === "evening" || category === "before_sleep" ? category : null;
}

import { BottomNav } from "./components/LayoutShells";
import { NetworkStatus } from "./components/NetworkStatus";
import { SyncStatus } from "./components/SyncStatus";
import { t } from "./i18n";
import { useRemoteAccountSync } from "./hooks/useRemoteAccountSync";
import { useForegroundReminders } from "./hooks/useForegroundReminders";
import {
  getNextIncompleteIndex,
  getPalmStreakSummary,
  millisecondsUntilNextProgressDay,
  recordDailyCollectionCompletion,
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
function maskPhoneNumber(phone: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) {
    return "";
  }

  const visiblePrefixLength = normalizedPhone.startsWith("+") ? Math.min(4, normalizedPhone.length) : 0;
  const visibleSuffixLength = Math.min(4, Math.max(0, normalizedPhone.length - visiblePrefixLength));
  const prefix = normalizedPhone.slice(0, visiblePrefixLength);
  const suffix = normalizedPhone.slice(normalizedPhone.length - visibleSuffixLength);
  const hiddenLength = normalizedPhone.length - prefix.length - suffix.length;

  return [prefix, "*".repeat(Math.max(0, hiddenLength)), suffix].filter(Boolean).join(" ");
}

function ScreenFallback() {
  return (
    <div
      className="flex h-full items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}

function PwaNotice({
  title,
  body,
  actionLabel,
  dismissLabel,
  onAction,
  onDismiss,
  isActionLoading,
}: {
  title: string;
  body: string;
  actionLabel: string;
  dismissLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  isActionLoading?: boolean;
}) {
  return (
    <aside className="mx-4 rounded-2xl border border-primary/30 bg-card p-4 shadow-lg" role="status" aria-live="polite">
      <p className="text-[0.9375rem] font-bold text-foreground">{title}</p>
      <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{body}</p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-11 rounded-xl px-3 text-[0.8125rem] font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {dismissLabel}
        </button>
        <button
          type="button"
          onClick={onAction}
          disabled={isActionLoading}
          className="min-h-11 rounded-xl bg-primary px-4 text-[0.8125rem] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isActionLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          )}
          {actionLabel}
        </button>
      </div>
    </aside>
  );
}

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
  const [, setHistory] = useState<View[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "azkar" | "settings">("home");
  const [activeCat, setActiveCat] = useState<CategoryId>("morning");
  const [activeIdx, setActiveIdx] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialState.settings.themeMode);
  const darkMode = themeMode !== "light";
  const [sessionStart, setSessionStart] = useState(Date.now());
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
  const [weeklyGoalDays, setWeeklyGoalDays] = useState(initialState.settings.weeklyGoalDays);
  const [quietProgressEnabled, setQuietProgressEnabled] = useState(initialState.settings.quietProgressEnabled);
  const [progressDayStartHour, setProgressDayStartHour] = useState(initialState.settings.progressDayStartHour);
  const [dailyCompletions, setDailyCompletions] = useState(initialState.dailyCompletions);
  const [lastGrowthEvent, setLastGrowthEvent] = useState<GrowthEvent | null>(null);
  const [isRepeatSession, setIsRepeatSession] = useState(false);
  const [repeatCompleted, setRepeatCompleted] = useState<Set<number>>(() => new Set());
  const [completed, setCompleted] = useState<Record<CategoryId, Set<number>>>(() =>
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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [authError, setAuthError] = useState("");
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
        weeklyGoalDays,
        quietProgressEnabled,
        progressDayStartHour,
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

  const markOnboardingComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
    try {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    } catch {
      // The current session can still continue when persistent storage is unavailable.
    }
  }, []);

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

  const push = useCallback((to: View) => {
    window.history.pushState({ view: to }, "", `?view=${to}`);
    setView(to);
  }, []);

  const handleResetCategory = (catId: CategoryId) => {
    if (!window.confirm(t(selectedLang, "category.resetConfirm"))) {
      return;
    }
    setCompleted((prev) => {
      const next = { ...prev };
      next[catId] = new Set();
      return next;
    });
  };

  const pop = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      push("home");
    }
  }, [push]);

  const openCategory = (catId: CategoryId) => {
    setIsRepeatSession(false);
    setRepeatCompleted(new Set());
    setActiveCat(catId);
    setActiveTab("azkar");
    push("category");
  };

  const openReader = (catId: CategoryId, i: number) => {
    setActiveCat(catId);
    setActiveIdx(i);
    setSessionStart(Date.now());
    push("reader");
  };

  const repeatCategory = (catId: CategoryId) => {
    setIsRepeatSession(true);
    setRepeatCompleted(new Set());
    openReader(catId, 0);
  };

  const leaveReader = () => {
    setIsRepeatSession(false);
    setRepeatCompleted(new Set());
    pop();
  };

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
    setHistory(["home"]);
    setView("category");
    window.history.replaceState(null, "", window.location.pathname);
  }, [view]);

  const toggleSavedZikr = useCallback((zikrId: string) => {
    setSavedZikrIds((previous) => {
      const next = new Set(previous);
      if (next.has(zikrId)) {
        next.delete(zikrId);
      } else {
        next.add(zikrId);
      }
      return next;
    });
  }, []);

  const markComplete = (idx: number) => {
    const azkar = getAzkarByCategory(activeCat);
    const canonicalCollectionWasAlreadyComplete = azkar.every((_, itemIndex) => completed[activeCat].has(itemIndex));
    const effectiveProgress = new Set(isRepeatSession ? repeatCompleted : completed[activeCat]);
    effectiveProgress.add(idx);

    if (isRepeatSession) {
      setRepeatCompleted((previous) => new Set(previous).add(idx));
    } else {
      setCompleted((prev) => {
        const updated = new Set(prev[activeCat]);
        updated.add(idx);
        return { ...prev, [activeCat]: updated };
      });
    }

    if (
      (!isRepeatSession && canonicalCollectionWasAlreadyComplete) ||
      getNextIncompleteIndex(azkar.length, effectiveProgress, idx) !== null
    ) {
      return;
    }

    // Persist the completed collection before the cancellable auto-navigation delay.
    const completedAt = new Date();
    const growth = recordDailyCollectionCompletion(dailyCompletions, activeCat, completedAt, progressDayStartHour);
    setDailyCompletions(growth.records);
    setLastGrowthEvent(growth.event);
    setSessions((prev) => [
      {
        id: `${activeCat}-${completedAt.getTime()}`,
        category: activeCat,
        completedAt: completedAt.toISOString(),
        completedCount: azkar.length,
        totalCount: azkar.length,
        durationSeconds: Math.max(1, Math.round((Date.now() - sessionStart) / 1000)),
        isComplete: true,
      },
      ...prev,
    ]);
  };

  const advanceAfterCompletion = (idx: number) => {
    const azkar = getAzkarByCategory(activeCat);
    const canonicalCollectionWasAlreadyComplete = azkar.every((_, itemIndex) => completed[activeCat].has(itemIndex));
    if (!isRepeatSession && canonicalCollectionWasAlreadyComplete) {
      pop();
      return;
    }

    const effectiveProgress = new Set(isRepeatSession ? repeatCompleted : completed[activeCat]);
    effectiveProgress.add(idx);
    const nextIncomplete = getNextIncompleteIndex(azkar.length, effectiveProgress, idx);

    if (nextIncomplete !== null) {
      setActiveIdx(nextIncomplete);
    } else {
      setIsRepeatSession(false);
      setRepeatCompleted(new Set());
      setView("completion");
      setHistory([]);
    }
  };

  const goHome = () => {
    setView("home");
    setActiveTab("home");
    setHistory([]);
  };

  const handleOpenAccountAuth = () => {
    setAuthError("");
    setView("login");
    setActiveTab("settings");
    setHistory([]);
  };

  const handleSendOtp = async (phone: string) => {
    try {
      setAuthError("");
      setIsSendingOtp(true);
      const normalizedPhone = isSupabaseConfigured ? await requestPhoneOtp(phone) : normalizePhoneNumber(phone);
      setLastPhoneNumber(normalizedPhone);
      setView("otp");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.sendCodeError"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (token: string) => {
    try {
      setAuthError("");
      setIsVerifyingOtp(true);
      setRemoteSyncReady(false);
      const session = await verifyPhoneOtp(lastPhoneNumber, token);
      if (!session) {
        throw new Error(t(selectedLang, "auth.verifyCodeError"));
      }

      const privateGuestDataExists =
        appStateSnapshot.sessions.length > 0 ||
        appStateSnapshot.dailyCompletions.length > 0 ||
        appStateSnapshot.savedZikrIds.length > 0 ||
        Object.values(appStateSnapshot.completed).some((items) => items.length > 0);
      const legacyIdentityMatches =
        !appStateSnapshot.profile.accountUserId &&
        !appStateSnapshot.profile.isGuest &&
        Boolean(session.user.phone) &&
        normalizePhoneNumber(appStateSnapshot.profile.lastPhoneNumber) ===
          normalizePhoneNumber(session.user.phone ?? "");
      let hydrationBase = appStateSnapshot;
      if (appStateSnapshot.profile.accountUserId && appStateSnapshot.profile.accountUserId !== session.user.id) {
        hydrationBase = clearPrivateAppData(appStateSnapshot);
      } else if (
        !appStateSnapshot.profile.accountUserId &&
        !appStateSnapshot.profile.isGuest &&
        !legacyIdentityMatches
      ) {
        hydrationBase = clearPrivateAppData(appStateSnapshot);
      } else if (
        !appStateSnapshot.profile.accountUserId &&
        appStateSnapshot.profile.isGuest &&
        privateGuestDataExists
      ) {
        const shouldMergeGuestProgress = window.confirm(t(selectedLang, "auth.mergeGuestProgress"));
        if (!shouldMergeGuestProgress) {
          hydrationBase = clearPrivateAppData(appStateSnapshot);
        }
      }

      if (hydrationBase !== appStateSnapshot) {
        hydrationBase = {
          ...hydrationBase,
          profile: profileFromSession(session, hydrationBase.profile.lastPhoneNumber),
        };
        applyStateSnapshot(hydrationBase);
      }

      const mergedState = await loadRemoteState(session, hydrationBase);
      applyStateSnapshot(mergedState);
      setRemoteSyncReady(true);
      markOnboardingComplete();
      setView("home");
      setActiveTab("home");
      setHistory([]);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.verifyCodeError"));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setAuthError("");
      setIsResendingOtp(true);
      await resendPhoneOtp(lastPhoneNumber);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.resendCodeError"));
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm(t(selectedLang, "auth.signOutConfirm"))) {
      return;
    }
    try {
      setAuthError("");
      setRemoteSyncReady(false);
      if (isSupabaseConfigured) {
        await signOutSupabase();
      }
      applyStateSnapshot(clearPrivateAppData(appStateSnapshot));
      setView("login");
      setActiveTab("home");
      setHistory([]);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.signOutError"));
    }
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(appStateSnapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `azkar-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleResetPreferences = () => {
    const message =
      selectedLang === "ar"
        ? "هل تريد استعادة التفضيلات الافتراضية؟ سيبقى تقدمك وجلساتك والأذكار المحفوظة."
        : "Restore default preferences? Your progress, sessions, and saved azkar will be kept.";
    if (!window.confirm(message)) {
      return;
    }
    resetStoredSettings();
    window.location.reload();
  };

  const handleClearLocalData = () => {
    const message =
      selectedLang === "ar"
        ? "هل تريد مسح كل بيانات أذكار المحلية على هذا الجهاز؟ لا يمكن التراجع عن ذلك."
        : "Erase all local Azkar data on this device? This cannot be undone.";
    if (!window.confirm(message)) {
      return;
    }
    clearStoredAppData();
    window.location.reload();
  };

  const handleNavTab = (tab: "home" | "azkar" | "settings") => {
    setActiveTab(tab);
    if (tab === "home") {
      push("home");
    } else if (tab === "azkar") {
      push("library");
    } else if (tab === "settings") {
      push("settings");
    }
  };

  const showBottomNav = ["home", "library", "category", "reader", "settings", "search"].includes(view);
  const azkar = getAzkarByCategory(activeCat);

  return (
    <div className="app-viewport flex items-center justify-center">
      <div className="app-shell relative flex flex-col overflow-hidden bg-background shadow-2xl">
        <NetworkStatus />
        {isSupabaseConfigured && !isGuest && (
          <SyncStatus
            isSyncing={isSyncingRemote}
            errorMessage={syncError}
            onRetry={retrySync}
            language={selectedLang}
          />
        )}

        <main id="main-content" tabIndex={-1} className="flex-1 overflow-hidden flex flex-col">
          <Suspense fallback={<ScreenFallback />}>
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
                  setHistory([]);
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
                  setHistory([]);
                }}
              />
            )}
            {view === "otp" && (
              <OTPScreen
                language={selectedLang}
                maskedPhone={maskPhoneNumber(lastPhoneNumber)}
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
                onCategory={openCategory}
                onResume={openReader}
                onRepeat={repeatCategory}
                language={selectedLang}
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
            {view === "category" && (
              <CategoryScreen
                catId={activeCat}
                completed={completed[activeCat] ?? new Set()}
                isArabic={isArabic}
                direction={layoutDirection}
                onZikr={(i) => openReader(activeCat, i)}
                onReset={() => handleResetCategory(activeCat)}
                onRepeat={() => repeatCategory(activeCat)}
                onBack={pop}
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
                  isRepeatSession ? repeatCompleted.has(activeIdx) : (completed[activeCat]?.has(activeIdx) ?? false)
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
                weeklyGoalDays={weeklyGoalDays}
                quietProgressEnabled={quietProgressEnabled}
                progressDayStartHour={progressDayStartHour}
                direction={layoutDirection}
                onLanguageChange={setSelectedLang}
                onThemeModeChange={setThemeMode}
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
                  // Fallback: If service worker controllerchange doesn't fire to reload the page automatically,
                  // force a reload after a short delay to ensure the new version is loaded.
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
                    // Dismissing the prompt should still work when storage is unavailable.
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
    </div>
  );
}
