import { useState, useRef, useEffect } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { AuthenticZikrLibrarySheet } from "../components/AuthenticZikrLibrarySheet";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { BookOpen, Check, RotateCcw, Volume2, Sparkles, ChevronDown } from "../components/icons";

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

  const handleTap = () => {
    // If target is reached and completion modal is active, tapping prompts action
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

    // Check if target reached
    if (isTargetMode && nextCount >= target) {
      setShowCompletionDialog(true);
      if (hapticFeedback) {
        vibrate([30, 50, 40, 50, 60]);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
    setLaps(0);
    setShowCompletionDialog(false);
  };

  const handleContinueCounting = () => {
    // Increment lap count and continue counting seamlessly into the next set
    setLaps((prev) => prev + 1);
    setShowCompletionDialog(false);
  };

  const handleSelectAuthenticZikr = (item: AuthenticZikrItem) => {
    setSelectedAuthentic(item);
    // Keep user's preferred target or reset to recommended
    if (item.recommendedTarget > 0 && target !== 0) {
      setTarget(item.recommendedTarget);
    }
    setCount(0);
    setLaps(0);
    setShowCompletionDialog(false);
  };

  return (
    <ScreenContainer dir={direction} className="relative flex flex-col">
      {/* Top Navigation Header */}
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
        {/* Zikr Selection Header Pill */}
        <div className="mb-3 space-y-2">
          <button
            type="button"
            onClick={() => setShowLibrarySheet(true)}
            className="interactive-elem flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-start text-primary transition-all hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <BookOpen size={20} className="shrink-0 text-primary" />
              <div className="truncate">
                <p className="text-[0.75rem] font-medium text-primary/80">
                  {isArabic ? "الذكر الحالي (اضغط للتغيير):" : "Current Zikr (Tap to change):"}
                </p>
                <p className="truncate text-[0.9375rem] font-bold text-primary">{activeText}</p>
              </div>
            </div>
            <ChevronDown size={18} className="shrink-0 text-primary" />
          </button>

          {/* Target Preset Selector Row */}
          <CounterTargetPicker
            activeTarget={target}
            onTargetChange={(newTarget) => {
              setTarget(newTarget);
              setCount(0);
              setLaps(0);
              setJustCompletedTarget(false);
            }}
            language={language}
            direction={direction}
          />
        </div>

        {/* Hero Zikr Card & Counter Surface */}
        <div className="flex flex-1 flex-col items-center justify-center space-y-5 py-4">
          {/* Zikr Display Text */}
          <div className="max-w-md text-center">
            <p
              className="text-[1.375rem] font-extrabold leading-loose text-foreground"
              dir="rtl"
              style={{ fontFamily: "Amiri, Scheherazade New, serif" }}
            >
              "{activeText}"
            </p>

            {/* Hadith Virtue / Source Badge */}
            {selectedAuthentic && (
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/30 px-3 py-1 text-[0.75rem] font-bold text-secondary-foreground">
                  {isArabic ? selectedAuthentic.sourceRefAr : selectedAuthentic.sourceRefEn}
                </span>
                {selectedAuthentic.virtueAr && (
                  <p className="max-w-sm text-[0.8125rem] text-amber-700 dark:text-amber-300">
                    ✨ {isArabic ? selectedAuthentic.virtueAr : selectedAuthentic.virtueEn}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Large Central Circular Interactive Counter */}
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={handleTap}
              aria-label={isArabic ? "اضغط للتسبيح" : "Tap to count"}
              className={`interactive-elem relative flex h-52 w-52 flex-col items-center justify-center rounded-full border-4 border-primary/30 bg-card p-4 shadow-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring ${
                isTargetComplete ? "border-green-500 bg-green-500/10 shadow-green-500/20" : ""
              }`}
            >
              {/* Pulse Ring effect */}
              <span
                key={pulse}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary/40 animate-ping"
                style={{ animationDuration: "350ms" }}
              />

              {isTargetComplete ? (
                <div className="flex flex-col items-center text-green-600 dark:text-green-400">
                  <Check size={48} strokeWidth={3} className="mb-1 animate-bounce" />
                  <p className="text-[1.125rem] font-extrabold">{isArabic ? "أتممت الهدف!" : "Target Complete!"}</p>
                  <p className="text-[0.75rem] opacity-80">
                    {formatNumerals(count, language)} / {formatNumerals(target, language)}
                  </p>
                </div>
              ) : (
                <>
                  <span
                    className="text-[2.75rem] font-black leading-none text-foreground"
                    style={{
                      fontFamily: numeralFontFamily(language),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatNumerals(count, language)}
                  </span>

                  {target > 0 ? (
                    <span className="mt-1 text-[0.8125rem] font-bold text-muted-foreground">
                      / {formatNumerals(target, language)}{" "}
                      {laps > 0 && `(${isArabic ? `الجولة ${formatNumerals(laps + 1, language)}` : `Lap ${laps + 1}`})`}
                    </span>
                  ) : (
                    <span className="mt-1 text-[0.75rem] font-semibold text-muted-foreground">
                      {isArabic ? "تسبيح حر" : "Free Mode"}
                    </span>
                  )}

                  <span className="mt-3 text-[0.75rem] font-medium text-primary">
                    {isArabic ? "اضغط هنا للتسبيح" : "Tap anywhere to count"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="interactive-elem flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card text-[0.875rem] font-bold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw size={18} />
            <span>{isArabic ? "إعادة العداد" : "Reset Counter"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLibrarySheet(true)}
            className="interactive-elem flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-[0.875rem] font-bold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BookOpen size={18} />
            <span>{isArabic ? "اختيار ذكر mأثور" : "Select Zikr"}</span>
          </button>
        </div>
      </main>

      {/* Authentic Zikr Selection Drawer */}
      <AuthenticZikrLibrarySheet
        isOpen={showLibrarySheet}
        onClose={() => setShowLibrarySheet(false)}
        onSelectZikr={handleSelectZikr}
        language={language}
        direction={direction}
      />
    </ScreenContainer>
  );
}
