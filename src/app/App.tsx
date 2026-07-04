import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Home, BookOpen, Settings, Search, Check, Play, Pause,
  Info, Flame, Share2, RotateCcw, X, Volume2, Wifi, Bell, Download,
  SkipForward, SkipBack,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  fromCompletedSets,
  getStreakSummary,
  loadAppState,
  saveAppState,
  toCompletedSets,
  type StoredSession,
} from "./state";
import { t } from "./i18n";
import { ALL_AZKAR, getAzkarByCategory, ZIKR_LABELS } from "./content/azkar";
import { CATEGORIES } from "./content/categories";
import { T } from "./theme";
import type { AppLanguage, AudioQuality, CategoryId, ColorBlindSupport, TextSizeOption } from "./types";
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
  | "home" | "category" | "reader" | "completion"
  // Phase 2 — English onboarding
  | "splash" | "onboard1" | "onboard2" | "onboard3" | "language" | "login" | "phone" | "otp"
  // Phase 2 — Arabic onboarding (shown when device locale is Arabic)
  | "ar_onboard1" | "ar_onboard2" | "ar_onboard3"
  // Phase 3
  | "settings"
  // Phase 4
  | "search";



import { BottomNav } from "./components/LayoutShells";
import { HomeScreen } from "./screens/HomeScreen";
import { CategoryScreen } from "./screens/CategoryScreen";
import { ReaderScreen } from "./screens/ReaderScreen";
import { CompletionScreen } from "./screens/CompletionScreen";
import { SettingsScreen } from "./screens/settings/SettingsScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { SplashScreen } from "./screens/onboarding/SplashScreen";
import { 
  EnglishOnboarding1Screen, 
  EnglishOnboarding2Screen, 
  EnglishOnboarding3Screen 
} from "./screens/onboarding/EnglishOnboarding";
import { 
  ArOnboarding1Screen, 
  ArOnboarding2Screen, 
  ArOnboarding3Screen 
} from "./screens/onboarding/ArabicOnboarding";
import { LanguageScreen, LANGUAGE_LABELS } from "./screens/onboarding/LanguageScreen";
import { LoginScreen, PhoneInputScreen, OTPScreen } from "./screens/auth/AuthScreens";

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const initialState = useRef(loadAppState()).current;
  const [view, setView]             = useState<View>("splash");
  const [history, setHistory]       = useState<View[]>([]);
  const [activeTab, setActiveTab]   = useState<"home" | "azkar" | "settings">("home");
  const [activeCat, setActiveCat]   = useState<CategoryId>("morning");
  const [activeIdx, setActiveIdx]   = useState(0);
  const [darkMode, setDarkMode]     = useState(initialState.settings.darkMode);
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
  const [colorBlindSupport, setColorBlindSupport] = useState<ColorBlindSupport>(initialState.settings.colorBlindSupport);
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

  const { currentStreak, longestStreak } = getStreakSummary(sessions);
  const languageLabel = LANGUAGE_LABELS[selectedLang];
  const isArabic = selectedLang === "ar";
  const useRtlLayout = isArabic || forceRtl;

  // Apply theme class to root
  useEffect(() => {
    const fontSizeMap: Record<TextSizeOption, string> = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };

    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.classList.toggle("light-mode", !darkMode);
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
  }, [boldText, colorBlindSupport, darkMode, highContrast, reduceMotion, selectedLang, textSize, useRtlLayout, voiceOver]);

  useEffect(() => {
    saveAppState({
      settings: {
        language: selectedLang,
        darkMode,
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
  }, [audioQuality, boldText, colorBlindSupport, completed, darkMode, displayName, forceRtl, hapticFeedback, highContrast, isGuest, lastPhoneNumber, reduceMotion, selectedLang, sessions, showTranslation, showTransliteration, textSize, voiceOver]);

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
          const mergedState = await loadRemoteState(session, {
            settings: {
              language: selectedLang,
              darkMode,
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
          setDarkMode(mergedState.settings.darkMode);
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

      const profile = profileFromSession(session, lastPhoneNumber);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [audioQuality, authSessionLoaded, boldText, colorBlindSupport, completed, currentStreak, darkMode, displayName, forceRtl, hapticFeedback, highContrast, isGuest, lastPhoneNumber, longestStreak, reduceMotion, selectedLang, sessions, showTranslation, showTransliteration, textSize, voiceOver]);

  const push = useCallback((to: View) => {
    setHistory(h => [...h, view]);
    setView(to);
  }, [view]);

  const pop = useCallback(() => {
    setHistory(h => {
      const prev = h[h.length - 1] ?? "home";
      setView(prev);
      return h.slice(0, -1);
    });
  }, []);

  const openCategory = (catId: CategoryId) => {
    setActiveCat(catId);
    setActiveTab("azkar");
    setHistory([]);
    setView("category");
  };

  const openReader = (catId: CategoryId, i: number) => {
    setActiveCat(catId);
    setActiveIdx(i);
    setSessionStart(Date.now());
    push("reader");
  };

  const markComplete = (idx: number) => {
    setCompleted(prev => {
      const updated = new Set(prev[activeCat]);
      updated.add(idx);
      return { ...prev, [activeCat]: updated };
    });
    // auto advance to next or completion
    const azkar = getAzkarByCategory(activeCat);
    if (idx + 1 < azkar.length) {
      setActiveIdx(idx + 1);
    } else {
      setSessions(prev => [
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

  const goHome = () => { setView("home"); setActiveTab("home"); setHistory([]); };

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
      const mergedState = await loadRemoteState(session, {
        settings: {
          language: selectedLang,
          darkMode,
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
      setDarkMode(mergedState.settings.darkMode);
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
    if (tab === "home")     { setView("home"); }
    else if (tab === "azkar")   { setView("category"); }
    else if (tab === "settings") { setView("settings"); }
  };

  const showBottomNav = ["home", "category", "settings"].includes(view);
  // Arabic onboarding screens manage their own status bar; English onboarding is full-bleed
  const onboardViews: View[] = ["splash", "onboard1", "onboard2", "onboard3"];
  const showStatusBar = !onboardViews.includes(view);
  const azkar = getAzkarByCategory(activeCat);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#060A15" }}>
      {/* Phone frame */}
      <div className="relative flex flex-col overflow-hidden shadow-2xl"
        style={{ width: 390, height: 844, borderRadius: 44, background: T.bg }}>

        {/* iOS status bar — hidden on splash/onboarding (they manage their own) */}
        {showStatusBar && (
          <div className="flex items-center justify-between px-6 shrink-0" style={{ height: 44, paddingTop: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>9:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi size={12} style={{ color: T.textPrimary }} />
              <Volume2 size={12} style={{ color: T.textPrimary }} />
              <div className="relative" style={{ width: 22, height: 11 }}>
                <div className="absolute inset-0 rounded-sm" style={{ border: `1.5px solid ${T.textPrimary}`, opacity: 0.6 }} />
                <div className="absolute rounded-sm" style={{ top: 2, left: 2, right: 4, bottom: 2, background: T.textPrimary }} />
                <div className="absolute rounded-r-sm" style={{ right: -3, top: 3.5, width: 2, height: 4, background: T.textPrimary, opacity: 0.5 }} />
              </div>
            </div>
          </div>
        )}

        {/* Screen */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Phase 2 — onboarding flow */}
          {view === "splash" && (
            <SplashScreen onDone={() => {
              setView(isArabic ? "ar_onboard1" : "onboard1");
            }} />
          )}
          {view === "onboard1" && (
            <EnglishOnboarding1Screen
              onNext={() => setView("onboard2")}
              onSkip={() => { setView("home"); setActiveTab("home"); }}
            />
          )}
          {view === "onboard2" && (
            <EnglishOnboarding2Screen
              onNext={() => setView("onboard3")}
              onBack={() => setView("onboard1")}
            />
          )}
          {view === "onboard3" && (
            <EnglishOnboarding3Screen
              onNext={() => { setView("language"); setActiveTab("home"); }}
              onBack={() => setView("onboard2")}
            />
          )}

          {/* Arabic onboarding — shown for Arabic-locale devices */}
          {view === "ar_onboard1" && (
            <ArOnboarding1Screen
              onNext={() => setView("ar_onboard2")}
              onSkip={() => { setView("language"); }}
            />
          )}
          {view === "ar_onboard2" && (
            <ArOnboarding2Screen
              onNext={() => setView("ar_onboard3")}
              onBack={() => setView("ar_onboard1")}
            />
          )}
          {view === "ar_onboard3" && (
            <ArOnboarding3Screen
              onNext={() => setView("language")}
              onBack={() => setView("ar_onboard2")}
            />
          )}

          {view === "language" && (
            <LanguageScreen
              initialLanguage={selectedLang}
              onContinue={(lang) => { setSelectedLang(lang); setView("login"); }}
            />
          )}
          {view === "login" && (
            <LoginScreen
              language={selectedLang}
              phoneAuthEnabled={isSupabaseConfigured}
              onPhone={() => { setAuthError(""); setView("phone"); }}
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
              onBack={() => { setAuthError(""); setView("login"); }}
              onSkip={() => { setView("home"); setActiveTab("home"); setHistory([]); }}
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
              onBack={() => { setAuthError(""); setView("phone"); }}
              onDifferent={() => { setAuthError(""); setView("phone"); }}
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
              onSearch={() => push("search")}
              language={selectedLang}
            />
          )}
          {view === "category" && (
            <CategoryScreen catId={activeCat} completed={completed[activeCat]} isArabic={isArabic}
              onZikr={i => openReader(activeCat, i)} onBack={pop} />
          )}
          {view === "reader" && (
            <ReaderScreen catId={activeCat} idx={activeIdx} isArabic={isArabic}
              isDone={completed[activeCat]?.has(activeIdx) ?? false}
              completedCount={completed[activeCat]?.size ?? 0}
              showTransliteration={showTransliteration}
              showTranslation={showTranslation}
              onBack={pop}
              onComplete={markComplete}
              onToggleTransliteration={() => setShowTransliteration(value => !value)}
              onToggleTranslation={() => setShowTranslation(value => !value)}
              onNext={() => { if (activeIdx < azkar.length - 1) setActiveIdx(i => i + 1); }}
              onPrev={() => { if (activeIdx > 0) setActiveIdx(i => i - 1); }}
            />
          )}
          {view === "completion" && (
            <CompletionScreen catId={activeCat} sessionStart={sessionStart}
              currentStreak={currentStreak}
              onHome={goHome} onRepeat={() => { setView("category"); setHistory([]); }} language={selectedLang} />
          )}
          {view === "settings" && (
            <SettingsScreen
              darkMode={darkMode}
              languageLabel={languageLabel}
              language={selectedLang}
              isGuest={isGuest}
              isSyncing={isSyncingRemote}
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
              onToggleDark={() => setDarkMode(d => !d)}
              onTextSizeChange={setTextSize}
              onHighContrastChange={setHighContrast}
              onBoldTextChange={setBoldText}
              onReduceMotionChange={setReduceMotion}
              onHapticFeedbackChange={setHapticFeedback}
              onForceRtlChange={setForceRtl}
              onVoiceOverChange={setVoiceOver}
              onAudioQualityChange={setAudioQuality}
              onColorBlindSupportChange={setColorBlindSupport}
              onSignOut={handleSignOut}
              onBack={pop}
            />
          )}
          {view === "search" && (
            <SearchScreen onBack={pop} onZikr={(catId, i) => { openReader(catId, i); }} />
          )}
        </div>

        {/* Bottom nav */}
        {showBottomNav && <BottomNav active={activeTab} onChange={handleNavTab} isArabic={isArabic} />}
      </div>
    </div>
  );
}

