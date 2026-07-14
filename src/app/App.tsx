import { lazy, Suspense, useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import {
  fromCompletedSets,
  getStreakSummary,
  loadAppState,
  saveAppState,
  toCompletedSets,
  type StoredSession,
} from "./state";
import { getAzkarByCategory } from "./content/azkar";
import type { AppLanguage, AudioQuality, CategoryId, ColorBlindSupport, TextSizeOption, ThemeMode } from "./types";
import {
  getCurrentSession,
  loadRemoteState,
  normalizePhoneNumber,
  profileFromSession,
  requestPhoneOtp,
  resendPhoneOtp,
  signOutSupabase,
  subscribeToAuthChanges,
  syncRemoteState,
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

import { BottomNav, StatusBar } from "./components/LayoutShells";
import { NetworkStatus } from "./components/NetworkStatus";
import { LANGUAGE_LABELS } from "./languageOptions";

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

export default function App() {
  const initialState = useRef(loadAppState()).current;
  const [view, setView] = useState<View>("splash");
  const [history, setHistory] = useState<View[]>([]);
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
  const [highContrast, setHighContrast] = useState(initialState.settings.highContrast);
  const [boldText, setBoldText] = useState(initialState.settings.boldText);
  const [reduceMotion, setReduceMotion] = useState(initialState.settings.reduceMotion);
  const [hapticFeedback, setHapticFeedback] = useState(initialState.settings.hapticFeedback);
  const [forceRtl, setForceRtl] = useState(initialState.settings.forceRtl);
  const [voiceOver, setVoiceOver] = useState(initialState.settings.voiceOver);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>(initialState.settings.audioQuality);
  const [colorBlindSupport, setColorBlindSupport] = useState<ColorBlindSupport>(
    initialState.settings.colorBlindSupport,
  );
  const [completed, setCompleted] = useState<Record<CategoryId, Set<number>>>(toCompletedSets(initialState.completed));
  const [sessions, setSessions] = useState<StoredSession[]>(initialState.sessions);
  const [displayName, setDisplayName] = useState(initialState.profile.displayName);
  const [lastPhoneNumber, setLastPhoneNumber] = useState(initialState.profile.lastPhoneNumber);
  const [isGuest, setIsGuest] = useState(initialState.profile.isGuest);
  const [authSessionLoaded, setAuthSessionLoaded] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);
  const latestLastPhoneNumber = useRef(lastPhoneNumber);

  const { currentStreak, longestStreak } = getStreakSummary(sessions);
  const languageLabel = LANGUAGE_LABELS[selectedLang];
  const isArabic = selectedLang === "ar";
  const useRtlLayout = isArabic || forceRtl;

  useEffect(() => {
    latestLastPhoneNumber.current = lastPhoneNumber;
  }, [lastPhoneNumber]);

  // Apply theme class to root
  useEffect(() => {
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };

    document.documentElement.classList.toggle("dark", themeMode !== "light");
    document.documentElement.classList.toggle("theme-midnight", themeMode === "midnight");
    document.documentElement.classList.toggle("theme-light", themeMode === "light");
    document.documentElement.classList.toggle("theme-dark", themeMode === "dark");
    document.documentElement.classList.toggle("high-contrast", highContrast);
    document.documentElement.classList.toggle("bold-text", boldText);
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
    document.documentElement.classList.toggle("screen-reader-mode", voiceOver);
    document.documentElement.lang = selectedLang;
    document.documentElement.dir = useRtlLayout ? "rtl" : "ltr";
    document.documentElement.style.setProperty("--font-size", fontSizeMap[textSize]);
    document.documentElement.style.setProperty("--font-weight-medium", boldText ? "700" : "500");
    document.documentElement.style.setProperty("--font-weight-normal", boldText ? "500" : "400");
    document.documentElement.dataset.colorBlindSupport = colorBlindSupport;

    // Update theme-color meta tag for mobile status bar
    setTimeout(() => {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.setAttribute("name", "theme-color");
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute("content", bgColor);
    }, 0);
  }, [
    boldText,
    colorBlindSupport,
    themeMode,
    highContrast,
    reduceMotion,
    selectedLang,
    textSize,
    useRtlLayout,
    voiceOver,
  ]);

  useEffect(() => {
    saveAppState({
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
        voiceOver,
        audioQuality,
        colorBlindSupport,
      },
      profile: {
        displayName,
        lastPhoneNumber,
        isGuest,
      },
      completed: fromCompletedSets(completed),
      sessions,
    });
  }, [
    audioQuality,
    boldText,
    colorBlindSupport,
    completed,
    darkMode,
    themeMode,
    displayName,
    forceRtl,
    hapticFeedback,
    highContrast,
    isGuest,
    lastPhoneNumber,
    reduceMotion,
    selectedLang,
    sessions,
    showTranslation,
    showTransliteration,
    textSize,
    voiceOver,
  ]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthSessionLoaded(true);
      return;
    }

    let active = true;

    const hydrateSession = async () => {
      try {
        const session = await getCurrentSession();
        if (!active) {
          return;
        }

        if (session) {
          const mergedState = await loadRemoteState(session, initialState);

          setSelectedLang(mergedState.settings.language);
          setThemeMode(mergedState.settings.themeMode);
          setShowTransliteration(mergedState.settings.showTransliteration);
          setShowTranslation(mergedState.settings.showTranslation);
          setTextSize(mergedState.settings.textSize);
          setHighContrast(mergedState.settings.highContrast);
          setBoldText(mergedState.settings.boldText);
          setReduceMotion(mergedState.settings.reduceMotion);
          setHapticFeedback(mergedState.settings.hapticFeedback);
          setForceRtl(mergedState.settings.forceRtl);
          setVoiceOver(mergedState.settings.voiceOver);
          setAudioQuality(mergedState.settings.audioQuality);
          setColorBlindSupport(mergedState.settings.colorBlindSupport);
          setDisplayName(mergedState.profile.displayName);
          setLastPhoneNumber(mergedState.profile.lastPhoneNumber);
          setIsGuest(false);
          setCompleted(toCompletedSets(mergedState.completed));
          setSessions(mergedState.sessions);
        }
      } catch (error) {
        if (active) {
          setAuthError(error instanceof Error ? error.message : "Could not restore your session.");
        }
      } finally {
        if (active) {
          setAuthSessionLoaded(true);
        }
      }
    };

    void hydrateSession();

    const unsubscribe = subscribeToAuthChanges((session) => {
      if (!active) {
        return;
      }

      const profile = profileFromSession(session, latestLastPhoneNumber.current);
      setDisplayName(profile.displayName);
      setLastPhoneNumber(profile.lastPhoneNumber);
      setIsGuest(profile.isGuest);
      if (!session) {
        setAuthSessionLoaded(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [initialState]);

  useEffect(() => {
    if (!isSupabaseConfigured || !authSessionLoaded || isGuest) {
      return;
    }

    let cancelled = false;

    const pushRemoteState = async () => {
      try {
        setIsSyncingRemote(true);
        const session = await getCurrentSession();
        if (!session || cancelled) {
          return;
        }

        await syncRemoteState(
          session,
          {
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
              voiceOver,
              audioQuality,
              colorBlindSupport,
            },
            profile: {
              displayName,
              lastPhoneNumber,
              isGuest,
            },
            completed: fromCompletedSets(completed),
            sessions,
          },
          { currentStreak, longestStreak },
        );
      } catch (error) {
        if (!cancelled) {
          setAuthError(error instanceof Error ? error.message : "Could not sync your account.");
        }
      } finally {
        if (!cancelled) {
          setIsSyncingRemote(false);
        }
      }
    };

    void pushRemoteState();

    return () => {
      cancelled = true;
    };
  }, [
    audioQuality,
    authSessionLoaded,
    boldText,
    colorBlindSupport,
    completed,
    currentStreak,
    darkMode,
    themeMode,
    displayName,
    forceRtl,
    hapticFeedback,
    highContrast,
    isGuest,
    lastPhoneNumber,
    longestStreak,
    reduceMotion,
    selectedLang,
    sessions,
    showTranslation,
    showTransliteration,
    textSize,
    voiceOver,
  ]);

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

      const mergedState = await loadRemoteState(session, {
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
          voiceOver,
          audioQuality,
          colorBlindSupport,
        },
        profile: {
          displayName,
          lastPhoneNumber,
          isGuest,
        },
        completed: fromCompletedSets(completed),
        sessions,
      });

      setSelectedLang(mergedState.settings.language);
      setThemeMode(mergedState.settings.themeMode);
      setShowTransliteration(mergedState.settings.showTransliteration);
      setShowTranslation(mergedState.settings.showTranslation);
      setTextSize(mergedState.settings.textSize);
      setHighContrast(mergedState.settings.highContrast);
      setBoldText(mergedState.settings.boldText);
      setReduceMotion(mergedState.settings.reduceMotion);
      setHapticFeedback(mergedState.settings.hapticFeedback);
      setForceRtl(mergedState.settings.forceRtl);
      setVoiceOver(mergedState.settings.voiceOver);
      setAudioQuality(mergedState.settings.audioQuality);
      setColorBlindSupport(mergedState.settings.colorBlindSupport);
      setDisplayName(mergedState.profile.displayName);
      setLastPhoneNumber(mergedState.profile.lastPhoneNumber);
      setCompleted(toCompletedSets(mergedState.completed));
      setSessions(mergedState.sessions);
      setIsGuest(false);
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
  const usesReferenceDarkTheme = ["home", "library", "category", "reader", "search"].includes(view);
  const azkar = getAzkarByCategory(activeCat);

  return (
    <div className="app-viewport min-h-screen flex items-center justify-center">
      {/* Phone frame */}
      <div
        className="app-shell relative flex flex-col overflow-hidden bg-background shadow-2xl"
        style={
          usesReferenceDarkTheme
            ? ({
                "--background": "#0d0d0d",
                "--foreground": "#f5f0e8",
                "--card": "#171717",
                "--card-foreground": "#b0aed0",
                "--muted": "#555555",
                "--muted-foreground": "#b0aed0",
                "--border": "#555555",
              } as CSSProperties)
            : undefined
        }
      >
        <NetworkStatus />

        {showStatusBar && <StatusBar />}
        {/* Screen */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-hidden flex flex-col">
          <Suspense fallback={<ScreenFallback />}>
            {/* Phase 2 — onboarding flow */}
            {view === "splash" && (
              <SplashScreen
                language={selectedLang}
                onDone={() => {
                  setView("language");
                }}
              />
            )}
            {view === "onboard1" && (
              <EnglishOnboarding1Screen
                onNext={() => setView("login")}
                onSkip={() => {
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
                  setView("home");
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
                displayName={displayName}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                onCategory={openCategory}
                onFeaturedZikr={(catId, i) => openReader(catId, i)}
                onSearch={() => push("search")}
                language={selectedLang}
              />
            )}
            {view === "library" && (
              <AzkarLibraryScreen
                completed={completed}
                language={selectedLang}
                onCategory={openCategory}
                onSearch={() => push("search")}
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
                onBack={pop}
                onComplete={markComplete}
                onAdvance={advanceAfterCompletion}
                onNext={() => {
                  if (activeIdx < azkar.length - 1) setActiveIdx((i) => i + 1);
                }}
                onPrev={() => {
                  if (activeIdx > 0) setActiveIdx((i) => i - 1);
                }}
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
                phoneAuthEnabled={isSupabaseConfigured}
                isGuest={isGuest}
                isSyncing={isSyncingRemote}
                sessions={sessions}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                textSize={textSize}
                highContrast={highContrast}
                boldText={boldText}
                reduceMotion={reduceMotion}
                hapticFeedback={hapticFeedback}
                forceRtl={forceRtl}
                voiceOver={voiceOver}
                audioQuality={audioQuality}
                colorBlindSupport={colorBlindSupport}
                onLanguageChange={setSelectedLang}
                onThemeModeChange={setThemeMode}
                onTextSizeChange={setTextSize}
                onHighContrastChange={setHighContrast}
                onBoldTextChange={setBoldText}
                onReduceMotionChange={setReduceMotion}
                onHapticFeedbackChange={setHapticFeedback}
                onForceRtlChange={setForceRtl}
                onVoiceOverChange={setVoiceOver}
                onAudioQualityChange={setAudioQuality}
                onColorBlindSupportChange={setColorBlindSupport}
                onActivateAccount={handleOpenAccountAuth}
                onSignOut={handleSignOut}
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

        {/* Bottom nav */}
        {showBottomNav && <BottomNav active={activeTab} onChange={handleNavTab} isArabic={isArabic} />}
      </div>
    </div>
  );
}
