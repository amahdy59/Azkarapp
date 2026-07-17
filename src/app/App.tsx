import { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  clearStoredAppData,
  fromCompletedSets,
  getStreakSummary,
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

import { BottomNav, StatusBar } from "./components/LayoutShells";
import { NetworkStatus } from "./components/NetworkStatus";
import { SyncStatus } from "./components/SyncStatus";
import { LANGUAGE_LABELS } from "./languageOptions";
import { t } from "./i18n";
import { useRemoteAccountSync } from "./hooks/useRemoteAccountSync";
import { useForegroundReminders } from "./hooks/useForegroundReminders";

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
}: {
  title: string;
  body: string;
  actionLabel: string;
  dismissLabel: string;
  onAction: () => void;
  onDismiss: () => void;
}) {
  return (
    <aside className="mx-4 rounded-2xl border border-primary/30 bg-card p-4 shadow-lg" role="status" aria-live="polite">
      <p className="text-[15px] font-bold text-foreground">{title}</p>
      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{body}</p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-11 rounded-xl px-3 text-[13px] font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {dismissLabel}
        </button>
        <button
          type="button"
          onClick={onAction}
          className="min-h-11 rounded-xl bg-primary px-4 text-[13px] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
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
  const [completed, setCompleted] = useState<Record<CategoryId, Set<number>>>(toCompletedSets(initialState.completed));
  const [sessions, setSessions] = useState<StoredSession[]>(initialState.sessions);
  const [savedZikrIds, setSavedZikrIds] = useState<Set<string>>(() => new Set(initialState.savedZikrIds));
  const [displayName, setDisplayName] = useState(initialState.profile.displayName);
  const [lastPhoneNumber, setLastPhoneNumber] = useState(initialState.profile.lastPhoneNumber);
  const [isGuest, setIsGuest] = useState(initialState.profile.isGuest);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(() => {
    try {
      return window.localStorage.getItem("azkarapp.install-dismissed") === "true";
    } catch {
      return false;
    }
  });

  const { currentStreak, longestStreak } = getStreakSummary(sessions);
  const languageLabel = LANGUAGE_LABELS[selectedLang];
  const isArabic = selectedLang === "ar";

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
      },
      profile: { displayName, lastPhoneNumber, isGuest },
      completed: fromCompletedSets(completed),
      sessions,
      savedZikrIds: [...savedZikrIds].sort(),
    }),
    [
      boldText,
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
      selectedLang,
      sessions,
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
    setDisplayName(state.profile.displayName);
    setLastPhoneNumber(state.profile.lastPhoneNumber);
    setIsGuest(state.profile.isGuest);
    setCompleted(toCompletedSets(state.completed));
    setSessions(state.sessions);
    setSavedZikrIds(new Set(state.savedZikrIds));
  }, []);

  const applyAuthProfile = useCallback((profile: AppStateSnapshot["profile"]) => {
    setDisplayName(profile.displayName);
    setLastPhoneNumber(profile.lastPhoneNumber);
    setIsGuest(profile.isGuest);
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
    onRemoteState: applyStateSnapshot,
    onAuthProfile: applyAuthProfile,
  });

  useForegroundReminders({ reminders, sessions, language: selectedLang });

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

  const push = useCallback(
    (to: View) => {
      setHistory((h) => [...h, view]);
      setView(to);
    },
    [view],
  );

  const handleResetCategory = (catId: CategoryId) => {
    if (!window.confirm("Reset all progress for this category? This cannot be undone.")) {
      return;
    }
    setCompleted((prev) => {
      const next = { ...prev };
      next[catId] = new Set();
      return next;
    });
  };

  const pop = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1] ?? "home";
      setView(prev);
      setActiveTab(prev === "settings" ? "settings" : prev === "library" || prev === "category" ? "azkar" : "home");
      return h.slice(0, -1);
    });
  }, []);

  const openCategory = (catId: CategoryId) => {
    setActiveCat(catId);
    setActiveTab("azkar");
    setHistory([view]);
    setView("category");
  };

  const openReader = (catId: CategoryId, i: number) => {
    setActiveCat(catId);
    setActiveIdx(i);
    setSessionStart(Date.now());
    push("reader");
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
    setCompleted((prev) => {
      const updated = new Set(prev[activeCat]);
      updated.add(idx);
      return { ...prev, [activeCat]: updated };
    });
  };

  const advanceAfterCompletion = (idx: number) => {
    const azkar = getAzkarByCategory(activeCat);
    if (idx + 1 < azkar.length) {
      setActiveIdx(idx + 1);
    } else {
      setSessions((prev) => [
        {
          id: `${activeCat}-${Date.now()}`,
          category: activeCat,
          completedAt: new Date().toISOString(),
          completedCount: azkar.length,
          totalCount: azkar.length,
          durationSeconds: Math.max(1, Math.round((Date.now() - sessionStart) / 1000)),
          isComplete: true,
        },
        ...prev,
      ]);
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
      setAuthError(error instanceof Error ? error.message : "Could not send the verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (token: string) => {
    try {
      setAuthError("");
      setIsVerifyingOtp(true);
      const session = await verifyPhoneOtp(lastPhoneNumber, token);
      if (!session) {
        throw new Error("Could not verify the code.");
      }

      const mergedState = await loadRemoteState(session, appStateSnapshot);
      applyStateSnapshot(mergedState);
      markOnboardingComplete();
      setView("home");
      setActiveTab("home");
      setHistory([]);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not verify the code.");
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
      setAuthError(error instanceof Error ? error.message : "Could not resend the verification code.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm("Sign out of your account on this device?")) {
      return;
    }
    try {
      setAuthError("");
      if (isSupabaseConfigured) {
        await signOutSupabase();
      }
      setDisplayName("Guest");
      setIsGuest(true);
      setView("login");
      setActiveTab("home");
      setHistory([]);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign out.");
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
    setHistory([]);
    if (tab === "home") {
      setView("home");
    } else if (tab === "azkar") {
      setView("library");
    } else if (tab === "settings") {
      setView("settings");
    }
  };

  const showBottomNav = ["home", "library", "category", "settings"].includes(view);
  const showStatusBar = ["home", "library", "category", "reader", "completion", "settings", "search"].includes(view);
  const azkar = getAzkarByCategory(activeCat);

  return (
    <div className="app-viewport min-h-screen flex items-center justify-center">
      {/* Phone frame */}
      <div className="app-shell relative flex flex-col overflow-hidden bg-background shadow-2xl">
        <NetworkStatus />
        {isSupabaseConfigured && !isGuest && (
          <SyncStatus isSyncing={isSyncingRemote} errorMessage={syncError} onRetry={retrySync} />
        )}

        {showStatusBar && <StatusBar />}
        {/* Screen */}
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
                onCategory={openCategory}
                onResume={openReader}
                language={selectedLang}
              />
            )}
            {view === "library" && (
              <AzkarLibraryScreen
                completed={completed}
                language={selectedLang}
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
                onZikr={(i) => openReader(activeCat, i)}
                onReset={() => handleResetCategory(activeCat)}
                onBack={pop}
              />
            )}
            {view === "reader" && (
              <ReaderScreen
                catId={activeCat}
                idx={activeIdx}
                isArabic={isArabic}
                isDone={completed[activeCat]?.has(activeIdx) ?? false}
                hapticFeedback={hapticFeedback}
                arabicFont={arabicFont}
                showTranslation={showTranslation}
                showTransliteration={showTransliteration}
                textSize={textSize}
                savedZikrIds={savedZikrIds}
                onBack={pop}
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
                currentStreak={currentStreak}
                onHome={goHome}
                onRepeat={() => {
                  setView("category");
                  setHistory([]);
                }}
                language={selectedLang}
              />
            )}
            {view === "settings" && (
              <SettingsScreen
                themeMode={themeMode}
                languageLabel={languageLabel}
                language={selectedLang}
                isGuest={isGuest}
                isSyncing={isSyncingRemote}
                syncError={syncError}
                sessions={sessions}
                savedCount={savedZikrIds.size}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
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
                onBack={pop}
                onZikr={(catId, i) => {
                  openReader(catId, i);
                }}
              />
            )}
          </Suspense>
        </main>

        {(updateAvailable || (installPrompt && sessions.length > 0 && !installDismissed)) && (
          <div className={`absolute inset-x-0 z-40 ${showBottomNav ? "bottom-20" : "bottom-3"}`}>
            {updateAvailable ? (
              <PwaNotice
                title={t(selectedLang, "pwa.updateTitle")}
                body={t(selectedLang, "pwa.updateBody")}
                actionLabel={t(selectedLang, "pwa.refresh")}
                dismissLabel={t(selectedLang, "pwa.later")}
                onAction={() => window.dispatchEvent(new Event("azkar-apply-update"))}
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
