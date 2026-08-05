import { useState, useEffect, useCallback } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { AuthenticZikrLibrarySheet } from "../components/AuthenticZikrLibrarySheet";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import { Check, RotateCcw, Volume2, Sparkles, ChevronDown, Play } from "../components/icons";
import { PulseRings, ZikrCounterSurface } from "../components/ZikrComponents";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function CustomCounterScreen({
  isArabic,
  direction,
  onBack,
  hapticFeedback = true,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onBack: () => void;
  hapticFeedback?: boolean;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";

  // Active Authentic Zikr Selection (Default to first authentic item)
  const [selectedAuthentic, setSelectedAuthentic] = useState<AuthenticZikrItem>(AUTHENTIC_AZKAR_COLLECTION[0]!);

  // Counter state — Default is 0 (Free / Open counter)
  const [target, setTarget] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [laps, setLaps] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showLibrarySheet, setShowLibrarySheet] = useState<boolean>(false);
  const [pulse, setPulse] = useState<number>(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState<boolean>(false);

  const activeText = selectedAuthentic.textAr;
  const isTargetMode = target > 0;
  const isTargetComplete = isTargetMode && count >= target;

  const handleTap = useCallback(() => {
    if (isTargetComplete) {
      setShowCompletionDialog(true);
      return;
    }

    const nextCount = count + 1;
    setCount(nextCount);
    setPulse((v) => v + 1);

    if (hapticFeedback) {
      vibrate(8);
    }

    if (isTargetMode && nextCount >= target) {
      setShowCompletionDialog(true);
      if (hapticFeedback) {
        vibrate([30, 50, 40, 50, 60]);
      }
    }
  }, [isTargetComplete, count, hapticFeedback, isTargetMode, target]);

  const handleUndo = useCallback(() => {
    if (count > 0) {
      setCount((prev) => prev - 1);
    }
  }, [count]);

  const handleReset = () => {
    setCount(0);
    setLaps(0);
    setShowCompletionDialog(false);
  };

  const handleContinueCounting = () => {
    setLaps((prev) => prev + 1);
    setShowCompletionDialog(false);
  };

  const handleSelectAuthenticZikr = (item: AuthenticZikrItem) => {
    setSelectedAuthentic(item);
    if (item.recommendedTarget > 0 && target !== 0) {
      setTarget(item.recommendedTarget);
    }
    setCount(0);
    setLaps(0);
    setShowCompletionDialog(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("role") === "search")
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (showLibrarySheet) {
          setShowLibrarySheet(false);
        } else {
          onBack();
        }
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (!showLibrarySheet) {
          handleTap();
        }
      } else if (e.key === "r" || e.key === "R" || e.key === "ق") {
        e.preventDefault();
        if (!showLibrarySheet) {
          handleReset();
        }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        if (!showLibrarySheet) {
          handleUndo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, showLibrarySheet, isTargetComplete, count, target, handleTap, handleUndo]);

  return (
    <ScreenContainer dir={direction} className="relative flex flex-col page-content-center">
      <TimeOfDayBackground categoryId="night" />
      <div className="relative z-10 flex flex-col min-h-screen flex-1">
        {/* Header */}
        <Header
          title={isArabic ? "المسبحة الإلكترونية" : "Tasbeeh Counter"}
          onBack={onBack}
          language={language}
          right={
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="interactive-elem flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isArabic ? "الصوت والاهتزاز" : "Sound & Haptics"}
            >
              <Volume2 size={20} className={soundEnabled ? "text-primary" : "text-muted-foreground/40"} />
            </button>
          }
        />

        <main className="flex min-h-0 flex-1 flex-col justify-between px-5 pb-6 pt-2">
          {/* Top Controls: Zikr Card & Target Picker */}
          <div className="space-y-3">
            {/* Selected Authentic Zikr Card */}
            <button
              type="button"
              onClick={() => setShowLibrarySheet(true)}
              className="interactive-elem flex w-full items-center justify-between gap-3 rounded-[2rem] border border-white/40 dark:border-white/10 bg-card p-4.5 text-start backdrop-blur-xl shadow-lg shadow-black/5 hover:border-amber-500/40 hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <span className="block text-[0.75rem] font-bold text-muted-foreground">
                  {isArabic ? "الذكر المأثور" : "Selected Dhikr"}
                </span>
                <p className="truncate text-[1.125rem] font-extrabold leading-tight text-foreground" dir="rtl">
                  {activeText}
                </p>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                <ChevronDown size={18} />
              </div>
            </button>

            {/* Target Presets */}
            <CounterTargetPicker
              activeTarget={target}
              onTargetChange={(newTarget) => {
                setTarget(newTarget);
                setCount(0);
                setLaps(0);
                setShowCompletionDialog(false);
              }}
              language={language}
              direction={direction}
            />
          </div>

          {/* Central Counter Display Surface */}
          <div className="my-auto flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center">
              <PulseRings trigger={pulse} size={220} count={count} total={target} />

              <ZikrCounterSurface
                count={count}
                total={target}
                compact={false}
                complete={isTargetComplete}
                onTap={handleTap}
                language={language}
                instructionText=""
                testId="custom-counter-surface"
              />
            </div>

            {/* Quick Counter Action Buttons (Undo & Reset) */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleUndo}
                disabled={count === 0}
                className="interactive-elem flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/40 dark:border-white/10 bg-card px-4 text-[0.875rem] font-bold text-foreground backdrop-blur-xl shadow-lg shadow-black/5 hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              >
                <RotateCcw size={16} />
                <span>{isArabic ? "تراجع" : "Undo"}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={count === 0 && laps === 0}
                className="interactive-elem flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/40 dark:border-white/10 bg-card px-4 text-[0.875rem] font-bold text-foreground backdrop-blur-xl shadow-lg shadow-black/5 hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              >
                <RotateCcw size={16} />
                <span>{isArabic ? "إعادة الفتح" : "Reset"}</span>
              </button>
            </div>

            {/* Keyboard Shortcuts Helper on Desktop & Tablet */}
            <div className="hidden md:flex items-center justify-center gap-3 mt-4 py-1.5 px-4 rounded-full bg-muted/60 border border-border/40 text-[0.75rem] font-medium text-muted-foreground mx-auto w-fit">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
                  Space
                </kbd>
                <span>{isArabic ? "التسبيح" : "Count"}</span>
              </span>
              <span className="h-3 w-px bg-border/60" aria-hidden="true" />
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
                  R
                </kbd>
                <span>{isArabic ? "إعادة" : "Reset"}</span>
              </span>
              <span className="h-3 w-px bg-border/60" aria-hidden="true" />
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
                  Backspace
                </kbd>
                <span>{isArabic ? "تراجع" : "Undo"}</span>
              </span>
              <span className="h-3 w-px bg-border/60" aria-hidden="true" />
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
                  Esc
                </kbd>
                <span>{isArabic ? "رجوع" : "Back"}</span>
              </span>
            </div>
          </div>

          {/* Virtue & Source Information Card */}
          {selectedAuthentic.virtueAr && (
            <div className="rounded-[1.5rem] border border-white/40 dark:border-white/10 bg-card p-4 backdrop-blur-xl shadow-lg shadow-black/5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[0.8125rem] font-extrabold text-foreground">
                      {isArabic ? "الفضل والحديث:" : "Virtue & Reference:"}
                    </h4>
                    <span className="text-[0.6875rem] font-bold text-amber-600 dark:text-amber-400">
                      {isArabic ? selectedAuthentic.hadithGradeAr : selectedAuthentic.hadithGradeEn}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground" dir={isArabic ? "rtl" : "ltr"}>
                    {isArabic ? selectedAuthentic.virtueAr : selectedAuthentic.virtueEn}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Target Completion Choice Modal (Reset vs Continue) */}
      {showCompletionDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label={isArabic ? "إغلاق" : "Close"}
            className="absolute inset-0 h-full w-full cursor-default border-none bg-transparent p-0"
            onClick={() => setShowCompletionDialog(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/40 dark:border-white/10 bg-card p-6 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
              <Check size={32} strokeWidth={3} />
            </div>

            <h3 className="mb-1 text-[1.25rem] font-extrabold text-foreground">
              {isArabic ? "ما شاء الله! أتممت الهدف" : "Goal Reached!"}
            </h3>
            <p className="mb-5 text-[0.875rem] text-muted-foreground">
              {isArabic
                ? `وصلت إلى ${formatNumerals(target, language)} من "${activeText}". تقبل الله طاعتك!`
                : `You reached ${formatNumerals(target, language)} repetitions.`}
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleContinueCounting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[0.9375rem] font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                <Play size={18} />
                <span>
                  {isArabic
                    ? `متابعة التسبيح (الجولة ${formatNumerals(laps + 2, language)})`
                    : `Continue Counting (Lap ${laps + 2})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-[0.875rem] font-bold text-foreground transition-all hover:bg-muted"
              >
                <RotateCcw size={18} />
                <span>{isArabic ? "إعادة العداد لـ 0" : "Reset Counter to 0"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentic Zikr Selection Sheet */}
      <AuthenticZikrLibrarySheet
        isOpen={showLibrarySheet}
        onClose={() => setShowLibrarySheet(false)}
        onSelectZikr={handleSelectAuthenticZikr}
        language={language}
        direction={direction}
      />
    </ScreenContainer>
  );
}
