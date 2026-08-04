import { useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { AuthenticZikrLibrarySheet } from "../components/AuthenticZikrLibrarySheet";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import type { AppLanguage } from "../types";
import { BookOpen, Check, RotateCcw, Volume2, Sparkles, ChevronDown, Play } from "../components/icons";

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
        {/* Zikr Selection Bar & Target Presets */}
        <div className="mb-3 space-y-3">
          {/* Authentic Zikr Selector Bar */}
          <button
            type="button"
            onClick={() => setShowLibrarySheet(true)}
            className="interactive-elem flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-start text-primary transition-all hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BookOpen size={18} />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[0.75rem] font-bold text-primary">
                    {isArabic ? "الذكر المأثور (اضغط للتغيير):" : "Authentic Zikr (Tap to change):"}
                  </span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[0.6875rem] font-semibold text-primary">
                    {isArabic ? selectedAuthentic.sourceRefAr : selectedAuthentic.sourceRefEn}
                  </span>
                </div>
                <p className="truncate text-[0.9375rem] font-extrabold text-foreground">{activeText}</p>
              </div>
            </div>
            <ChevronDown size={18} className="shrink-0 text-primary" />
          </button>

          {/* Target Preset Selector Row (Default is Free / 0) */}
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

        {/* Hero Zikr Card & Tap Surface */}
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 py-4">
          {/* Authentic Zikr Text Display */}
          <div className="max-w-md text-center">
            <p
              className="text-[1.375rem] font-extrabold leading-loose text-foreground"
              dir="rtl"
              style={{ fontFamily: "Amiri, Scheherazade New, serif" }}
            >
              "{activeText}"
            </p>

            {/* Hadith Virtue Badge */}
            {selectedAuthentic.virtueAr && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.8125rem] font-medium text-amber-700 dark:text-amber-300">
                <Sparkles size={16} className="shrink-0 text-amber-500" />
                <p>{isArabic ? selectedAuthentic.virtueAr : selectedAuthentic.virtueEn}</p>
              </div>
            )}
          </div>

          {/* Central Interactive Counter Ring */}
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={handleTap}
              aria-label={isArabic ? "اضغط للتسبيح" : "Tap to count"}
              className={`interactive-elem relative flex h-56 w-56 flex-col items-center justify-center rounded-full border-4 border-primary/30 bg-card p-4 shadow-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring ${
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
                  <Check size={52} strokeWidth={3} className="mb-1 animate-bounce" />
                  <p className="text-[1.125rem] font-extrabold">{isArabic ? "أتممت الهدف!" : "Target Completed!"}</p>
                  <p className="text-[0.75rem] opacity-80">
                    {formatNumerals(count, language)} / {formatNumerals(target, language)}
                  </p>
                </div>
              ) : (
                <>
                  <span
                    className="text-[3rem] font-black leading-none text-foreground"
                    style={{
                      fontFamily: numeralFontFamily(language),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatNumerals(count, language)}
                  </span>

                  {isTargetMode ? (
                    <span className="mt-1 text-[0.8125rem] font-bold text-muted-foreground">
                      / {formatNumerals(target, language)}{" "}
                      {laps > 0 && `(${isArabic ? `الجولة ${formatNumerals(laps + 1, language)}` : `Lap ${laps + 1}`})`}
                    </span>
                  ) : (
                    <span className="mt-1 text-[0.75rem] font-semibold text-primary">
                      {isArabic ? "تسبيح حر (مفتوح)" : "Free Counter (Unlimited)"}
                    </span>
                  )}

                  <span className="mt-3 text-[0.75rem] font-medium text-muted-foreground">
                    {isArabic ? "اضغط للتسبيح" : "Tap to count"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Bar Buttons */}
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
            <span>{isArabic ? "الأذكار المأثورة" : "Authentic Library"}</span>
          </button>
        </div>
      </main>

      {/* Target Completion Modal Option (Reset vs Continue) */}
      {showCompletionDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCompletionDialog(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
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

      {/* Authentic Zikr Selection Drawer */}
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
