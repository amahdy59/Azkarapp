import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import {
  BookOpen,
  Check,
  ChevronDown,
  MoreVertical,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { Modal } from "../components/ResponsiveSheet";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { CounterShortcutHints, ZikrCounterSurface } from "../components/ZikrComponents";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
import { useWakeLock } from "../hooks/useWakeLock";
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
  const [showReference, setShowReference] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const { soundEnabled, toggleSound, playClickFeedback } = useCounterClickFeedback();

  useWakeLock(true);

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
    playClickFeedback();
    vibrateIfEnabled(hapticFeedback, 15);
    if (isTargetMode && nextCount >= target) {
      setShowCompletionDialog(true);
      vibrateIfEnabled(hapticFeedback, [30, 50, 30, 50, 50]);
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
        if (showReference) setShowReference(false);
        else onBack();
        return;
      }
      const focusedControl =
        activeElement instanceof Element &&
        activeElement.closest(
          'button, a[href], input, textarea, select, [contenteditable="true"], [role="button"], [role="checkbox"], [role="radio"], [role="search"], [role="switch"], [role="textbox"]',
        );
      if (focusedControl || showReference) return;
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
  }, [handleReset, handleTap, onBack, showReference]);

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
                onClick={() => setShowReference(true)}
                className={HEADER_ACTION_CLASS}
                aria-label={t(language, "counter.virtueReference")}
                aria-haspopup="dialog"
              >
                <BookOpen size={20} aria-hidden="true" />
              </button>
              <DropdownMenu dir={direction}>
                <DropdownMenuTrigger className={HEADER_ACTION_CLASS} aria-label={t(language, "common.moreOptions")}>
                  <MoreVertical size={20} aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleSound}>
                    {soundEnabled ? (
                      <Volume2 size={16} className="text-primary me-2" aria-hidden="true" />
                    ) : (
                      <VolumeX size={16} className="text-muted-foreground me-2" aria-hidden="true" />
                    )}
                    <span>{t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReset} disabled={count === 0 && laps === 0}>
                    <RotateCcw size={16} className="text-muted-foreground me-2" aria-hidden="true" />
                    <span>{t(language, "reader.resetCounter")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="custom-counter-stage relative mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col overflow-y-auto px-4 pb-6 pt-2 sm:px-5"
          data-testid="custom-counter-content"
          data-counting-mode="canvas"
          onClick={handleCanvasClick}
        >
          {/* Controls Bar */}
          <div className="relative z-20 mb-4 grid grid-cols-2 gap-2 sm:gap-3" data-prevent-count="true">
            <div className="min-w-0">
              <DropdownMenu dir={direction}>
                <DropdownMenuTrigger className="interactive-elem flex min-h-[48px] w-full items-center justify-between gap-2 rounded-2xl border border-border-control bg-card px-3 sm:px-4 text-[0.8125rem] sm:text-[0.875rem] font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                  <span className="truncate text-start flex-1">
                    {isArabic ? selectedAuthentic.categoryNameAr : selectedAuthentic.categoryNameEn}
                  </span>
                  <ChevronDown size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-[250px] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                >
                  <DropdownMenuRadioGroup
                    value={selectedAuthentic.id}
                    onValueChange={(id) => {
                      const item = AUTHENTIC_AZKAR_COLLECTION.find((x) => x.id === id);
                      if (item) handleSelectAuthenticZikr(item);
                    }}
                  >
                    {AUTHENTIC_AZKAR_COLLECTION.map((item) => (
                      <DropdownMenuRadioItem key={item.id} value={item.id} className="text-[0.875rem] font-bold">
                        {isArabic ? item.categoryNameAr : item.categoryNameEn}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="min-w-0">
              <CounterTargetPicker
                activeTarget={target}
                onTargetChange={changeTarget}
                language={language}
                direction={direction}
              />
            </div>
          </div>

          <section
            className="relative z-10 space-y-3 rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-raised"
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
          </section>
          <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10">
            <p
              className="zikr-text max-w-[34rem] text-center text-[1.25rem] font-extrabold leading-[2] text-foreground sm:text-[1.5rem]"
              dir="rtl"
              lang="ar"
            >
              {activeText}
            </p>
          </div>

          <footer className="shrink-0 flex flex-col items-center justify-center pb-3 pt-2">
            <div className="flex w-full items-center justify-center gap-2.5">
              <div className="flex min-w-0 flex-1 justify-center">
                <ZikrCounterSurface
                  count={count}
                  total={target}
                  complete={isTargetComplete}
                  onTap={handleTap}
                  language={language}
                  instructionText={t(language, "reader.tapAnywhere")}
                  testId="custom-counter-surface"
                  reduceMotion={reduceMotion}
                />
              </div>
            </div>

            <CounterShortcutHints
              language={language}
              direction={direction}
              ariaLabel={t(language, "reader.keyboardShortcuts")}
              shortcuts={[
                { keys: ["Space"], label: t(language, "counter.count") },
                { keys: ["R"], label: t(language, "counter.reset") },
              ]}
            />
          </footer>
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
    </ScreenContainer>
  );
}
