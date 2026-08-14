import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { AuthenticZikrLibrarySheet } from "../components/AuthenticZikrLibrarySheet";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { BookOpen, Check, List, Play, RotateCcw, Sparkles, Volume2, VolumeX, X } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { Modal } from "../components/ResponsiveSheet";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import { PulseRings, ZikrCounterSurface } from "../components/ZikrComponents";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
import type { AppLanguage } from "../types";

const HEADER_ACTION_CLASS =
  "interactive-elem flex size-11 items-center justify-center rounded-full border border-border-control bg-card text-foreground shadow-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

export function CustomCounterScreen({
  isArabic,
  direction,
  onBack,
  hapticFeedback = true,
  reduceMotion = false,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onBack: () => void;
  hapticFeedback?: boolean;
  reduceMotion?: boolean;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const [selectedAuthentic, setSelectedAuthentic] = useState<AuthenticZikrItem>(AUTHENTIC_AZKAR_COLLECTION[0]!);
  const [target, setTarget] = useState(0);
  const [count, setCount] = useState(0);
  const [laps, setLaps] = useState(0);
  const [showLibrarySheet, setShowLibrarySheet] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [pulse, setPulse] = useState(0);
  const { soundEnabled, toggleSound, playClickFeedback } = useCounterClickFeedback();

  const activeText = selectedAuthentic.textAr;
  const isTargetMode = target > 0;
  const isTargetComplete = isTargetMode && count >= target;
  const progressPercent = isTargetMode ? Math.min(100, Math.round((count / target) * 100)) : 0;

  const handleTap = useCallback(() => {
    if (isTargetComplete) {
      setShowCompletionDialog(true);
      return;
    }
    const nextCount = count + 1;
    setCount(nextCount);
    setPulse((value) => value + 1);
    playClickFeedback();
    vibrateIfEnabled(hapticFeedback, 8);
    if (isTargetMode && nextCount >= target) {
      setShowCompletionDialog(true);
      vibrateIfEnabled(hapticFeedback, [30, 50, 40, 50, 60]);
    }
  }, [count, hapticFeedback, isTargetComplete, isTargetMode, playClickFeedback, target]);

  const handleReset = useCallback(() => {
    setCount(0);
    setLaps(0);
    setShowCompletionDialog(false);
  }, []);

  const handleSelectAuthenticZikr = (item: AuthenticZikrItem) => {
    setSelectedAuthentic(item);
    if (item.recommendedTarget > 0 && target !== 0) setTarget(item.recommendedTarget);
    handleReset();
  };

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    const element = event.target;
    if (
      element instanceof Element &&
      element.closest(
        "button, a, input, textarea, select, summary, [contenteditable='true'], [role='dialog'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [data-prevent-count='true']",
      )
    )
      return;
    handleTap();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (event.key === "Escape") {
        event.preventDefault();
        if (showLibrarySheet) setShowLibrarySheet(false);
        else if (showReference) setShowReference(false);
        else onBack();
        return;
      }
      const focusedControl =
        activeElement instanceof Element &&
        activeElement.closest(
          'button, a[href], input, textarea, select, [contenteditable="true"], [role="button"], [role="checkbox"], [role="radio"], [role="search"], [role="switch"], [role="textbox"]',
        );
      if (focusedControl || showLibrarySheet || showReference) return;
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        handleTap();
      } else if (event.key === "r" || event.key === "R" || event.key === "ق") {
        event.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReset, handleTap, onBack, showLibrarySheet, showReference]);

  const changeTarget = (nextTarget: number) => {
    setTarget(nextTarget);
    handleReset();
  };

  return (
    <ScreenContainer
      dir={direction}
      className="relative flex flex-col overflow-y-auto page-content-center"
      screenName={t(language, "counter.tasbeehTitle")}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <Header
          title={t(language, "counter.tasbeehTitle")}
          onBack={onBack}
          language={language}
          right={
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowLibrarySheet(true)}
                className={HEADER_ACTION_CLASS}
                aria-label={`${t(language, "counter.selectedDhikr")}: ${isArabic ? selectedAuthentic.categoryNameAr : selectedAuthentic.categoryNameEn}`}
                aria-haspopup="dialog"
                aria-expanded={showLibrarySheet}
              >
                <List size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setShowReference(true)}
                className={HEADER_ACTION_CLASS}
                aria-label={t(language, "counter.virtueReference")}
                aria-haspopup="dialog"
              >
                <BookOpen size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={toggleSound}
                className={HEADER_ACTION_CLASS}
                aria-label={t(language, "counter.sound")}
                aria-pressed={soundEnabled}
                title={t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound")}
                data-testid="counter-sound-toggle"
              >
                {soundEnabled ? (
                  <Volume2 size={20} className="text-primary" aria-hidden="true" />
                ) : (
                  <VolumeX size={20} className="text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            </div>
          }
        />

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="relative mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col overflow-y-auto px-4 pb-6 pt-2 sm:px-5"
          data-testid="custom-counter-content"
          data-counting-mode="canvas"
          onClick={handleCanvasClick}
        >
          <section
            className="relative z-10 space-y-2 rounded-[24px] border border-border bg-card p-4 shadow-raised"
            aria-label={t(language, "counter.targetLabel")}
          >
            <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold text-muted-foreground">
              <span>
                {isTargetMode ? `${formatNumerals(progressPercent, language)}%` : t(language, "counter.targetOpen")}
              </span>
              <span>
                {isTargetMode
                  ? `${formatNumerals(count, language)} / ${formatNumerals(target, language)}`
                  : formatNumerals(count, language)}
              </span>
            </div>
            <ProgressBar
              value={count}
              max={isTargetMode ? target : 1}
              direction={direction}
              aria-label={t(language, "counter.targetLabel")}
            />
            <p className="truncate text-start text-[0.875rem] font-black text-foreground" dir="auto">
              {isArabic ? selectedAuthentic.categoryNameAr : selectedAuthentic.categoryNameEn}
            </p>
          </section>

          <div className="relative z-10 my-auto flex flex-col items-center justify-center py-8 sm:py-10">
            <p
              className="zikr-text mb-7 max-w-[34rem] text-center text-[1.25rem] font-extrabold leading-[2] text-foreground sm:text-[1.5rem]"
              dir="rtl"
              lang="ar"
            >
              {activeText}
            </p>
            <div className="custom-counter-stage relative flex items-center justify-center">
              <PulseRings trigger={pulse} size={220} height={76} count={count} total={target} />
              <ZikrCounterSurface
                count={count}
                total={target}
                complete={isTargetComplete}
                onTap={handleTap}
                language={language}
                instructionText=""
                testId="custom-counter-surface"
                className="custom-counter-surface"
                reduceMotion={reduceMotion}
              />
            </div>

            <div className="mt-6 flex w-full max-w-sm items-center justify-center gap-2" data-prevent-count="true">
              <div className="min-w-0 flex-1">
                <CounterTargetPicker
                  activeTarget={target}
                  onTargetChange={changeTarget}
                  language={language}
                  direction={direction}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={count === 0 && laps === 0}
                aria-label={t(language, "reader.resetCounter")}
              >
                <RotateCcw size={16} aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{t(language, "reader.resetCounter")}</span>
              </Button>
            </div>
            <p className="mt-3 text-center text-[0.8125rem] font-semibold text-muted-foreground">
              {t(language, "reader.tapAnywhere")}
            </p>
            <div className="mt-4 hidden w-fit items-center justify-center gap-3 rounded-full border border-border bg-card px-4 py-1.5 text-[0.75rem] font-medium text-muted-foreground md:flex">
              <span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold text-foreground">
                  Space
                </kbd>{" "}
                {t(language, "counter.count")}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold text-foreground">
                  R
                </kbd>{" "}
                {t(language, "counter.reset")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showCompletionDialog && (
        <Modal
          open
          onClose={() => setShowCompletionDialog(false)}
          title={t(language, "counter.goalReached")}
          direction={direction}
          maxWidthClassName="max-w-sm"
          className="p-6 text-center"
        >
          <div>
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-success/20 text-success">
              <Check size={32} strokeWidth={3} aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-[1.25rem] font-extrabold text-foreground">{t(language, "counter.goalReached")}</h3>
            <p className="mb-5 text-[0.875rem] text-muted-foreground">
              {t(language, "counter.goalReachedDetail", { target: formatNumerals(target, language), zikr: activeText })}
            </p>
            <div className="space-y-2.5">
              <Button
                onClick={() => {
                  setLaps((value) => value + 1);
                  setCount(0);
                  setShowCompletionDialog(false);
                }}
                size="lg"
                className="w-full"
              >
                <Play size={18} aria-hidden="true" />
                {t(language, "counter.continueLap", { lap: formatNumerals(laps + 2, language) })}
              </Button>
              <Button variant="outline" onClick={handleReset} size="lg" className="w-full">
                <RotateCcw size={18} aria-hidden="true" />
                {t(language, "counter.resetToZero")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showReference && (
        <Modal
          open
          onClose={() => setShowReference(false)}
          title={t(language, "counter.virtueReference")}
          direction={direction}
          maxWidthClassName="max-w-md"
          className="p-6"
        >
          <div className="text-start">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-[1.125rem] font-black text-foreground">{t(language, "counter.virtueReference")}</h2>
              <button
                type="button"
                onClick={() => setShowReference(false)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-control bg-background text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                aria-label={t(language, "common.close")}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <p className="mt-4 text-[0.9375rem] font-semibold leading-7 text-foreground" dir="auto">
              {isArabic ? selectedAuthentic.virtueAr : selectedAuthentic.virtueEn}
            </p>
            <p className="mt-4 text-[0.8125rem] font-bold leading-6 text-muted-foreground" dir="auto">
              {isArabic ? selectedAuthentic.sourceRefAr : selectedAuthentic.sourceRefEn} ·{" "}
              {isArabic ? selectedAuthentic.hadithGradeAr : selectedAuthentic.hadithGradeEn}
            </p>
          </div>
        </Modal>
      )}

      <AuthenticZikrLibrarySheet
        isOpen={showLibrarySheet}
        onClose={() => setShowLibrarySheet(false)}
        onSelectZikr={handleSelectAuthenticZikr}
        language={language}
        direction={direction}
        selectedZikrId={selectedAuthentic.id}
      />
    </ScreenContainer>
  );
}
