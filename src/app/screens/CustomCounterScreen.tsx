import { useCallback, useEffect, useState } from "react";
import { AuthenticZikrPicker } from "../components/AuthenticZikrPicker";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { ArrowPrevious, Check, Lightbulb, MoreVertical, Play, RotateCcw, Volume2, VolumeX } from "../components/icons";
import { ReadingScreenChrome } from "../components/ReadingScreenChrome";
import { Modal } from "../components/ResponsiveSheet";
import { useCountingSurface } from "../components/countingSurface";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { CounterKeyboardHelp } from "../components/CounterKeyboardHelp";
import { CounterShortcutHints, ZikrCounterSurface } from "../components/ZikrComponents";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
import { getProgressDayKey } from "../progress";
import { useWakeLock } from "../hooks/useWakeLock";
import { isCounterShortcutBlocked } from "../keyboardShortcuts";
import { getReadingFontSize } from "./readingTypography";
import type { AppLanguage, TextSizeOption } from "../types";

const HEADER_ACTION_CLASS =
  "flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40";

/* The wide band is a fixed navy surface, so its controls take on-media colours
   rather than theme ones. Reusing the compact class there is what produced
   white-on-white the last time these two treatments were conflated. */
const HERO_ACTION_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

export interface MasbahaZikrItemState {
  count: number;
  target: number;
  laps: number;
  dayKey?: string;
}

export interface MasbahaSavedState {
  count: number;
  target: number;
  laps: number;
  selectedZikrId?: string;
  dayKey?: string;
  items?: Record<string, MasbahaZikrItemState>;
}

export function CustomCounterScreen({
  isArabic,
  direction,
  onBack,
  onOpenAfterPrayer,
  hapticFeedback = true,
  reduceMotion = false,
  textSize = "medium",
  initialMasbahaState,
  onSaveMasbahaState,
  progressDayStartHour,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onBack: () => void;
  onOpenAfterPrayer?: () => void;
  hapticFeedback?: boolean;
  reduceMotion?: boolean;
  textSize?: TextSizeOption;
  initialMasbahaState?: MasbahaSavedState;
  onSaveMasbahaState?: (state: MasbahaSavedState) => void;
  progressDayStartHour?: number;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const currentDayKey = getProgressDayKey(new Date(), progressDayStartHour);

  const initialSelectedAuthentic =
    AUTHENTIC_AZKAR_COLLECTION.find((item) => item.id === initialMasbahaState?.selectedZikrId) ??
    AUTHENTIC_AZKAR_COLLECTION[0]!;
  const [selectedAuthentic, setSelectedAuthentic] = useState<AuthenticZikrItem>(() => initialSelectedAuthentic);

  const [savedItems, setSavedItems] = useState<Record<string, MasbahaZikrItemState>>(() => {
    const rawItems = initialMasbahaState?.items ?? {};
    const filtered: Record<string, MasbahaZikrItemState> = {};
    for (const [id, item] of Object.entries(rawItems)) {
      if (!item.dayKey || item.dayKey === currentDayKey) {
        filtered[id] = item;
      }
    }
    return filtered;
  });

  const isDifferentDay = Boolean(initialMasbahaState?.dayKey && initialMasbahaState.dayKey !== currentDayKey);
  const initialZikrSaved = !isDifferentDay
    ? (initialMasbahaState?.items?.[initialSelectedAuthentic.id] ??
      (initialMasbahaState?.selectedZikrId === initialSelectedAuthentic.id || !initialMasbahaState?.selectedZikrId
        ? initialMasbahaState
        : undefined))
    : undefined;

  const [target, setTarget] = useState(() =>
    initialZikrSaved?.target && initialZikrSaved.target > 0
      ? initialZikrSaved.target
      : initialSelectedAuthentic.recommendedTarget,
  );
  const [count, setCount] = useState(() => (isDifferentDay ? 0 : (initialZikrSaved?.count ?? 0)));
  const [laps, setLaps] = useState(() => (isDifferentDay ? 0 : (initialZikrSaved?.laps ?? 0)));
  const [showReference, setShowReference] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [pendingZikr, setPendingZikr] = useState<AuthenticZikrItem | null>(null);
  const { soundEnabled, toggleSound, playClickFeedback } = useCounterClickFeedback();

  useWakeLock(true);

  useEffect(() => {
    const activeItemState: MasbahaZikrItemState | undefined =
      count > 0 || laps > 0
        ? {
            count,
            target,
            laps,
            dayKey: currentDayKey,
          }
        : undefined;

    const currentItems: Record<string, MasbahaZikrItemState> = {
      ...savedItems,
      ...(activeItemState ? { [selectedAuthentic.id]: activeItemState } : {}),
    };
    if (!activeItemState) {
      delete currentItems[selectedAuthentic.id];
    }

    onSaveMasbahaState?.({
      count,
      target,
      laps,
      selectedZikrId: selectedAuthentic.id,
      dayKey: currentDayKey,
      items: Object.keys(currentItems).length > 0 ? currentItems : undefined,
    });
  }, [count, target, laps, selectedAuthentic.id, savedItems, currentDayKey, onSaveMasbahaState]);

  const activeText = selectedAuthentic.textAr;
  const isTargetComplete = count >= target;
  const progressPercent = Math.min(100, Math.round((count / target) * 100));

  const handleTap = useCallback(() => {
    if (isTargetComplete) {
      setShowCompletionDialog(true);
      return;
    }
    const nextCount = count + 1;
    setCount(nextCount);
    playClickFeedback();

    if (nextCount >= target) {
      setShowCompletionDialog(true);
      vibrateIfEnabled(hapticFeedback, [30, 50, 30, 50, 50]);
    } else if (nextCount > 0 && nextCount % 33 === 0) {
      vibrateIfEnabled(hapticFeedback, [25, 30, 25]);
    } else {
      vibrateIfEnabled(hapticFeedback, 8);
    }
  }, [count, hapticFeedback, isTargetComplete, playClickFeedback, target]);

  const handleReset = useCallback(() => {
    setCount(0);
    setLaps(0);
    setShowCompletionDialog(false);
    setSavedItems((previous) => {
      const next = { ...previous };
      delete next[selectedAuthentic.id];
      return next;
    });
  }, [selectedAuthentic.id]);

  const switchToZikr = (item: AuthenticZikrItem, preserveCurrent: boolean) => {
    const nextSavedItems: Record<string, MasbahaZikrItemState> = { ...savedItems };

    if (preserveCurrent && (count > 0 || laps > 0)) {
      nextSavedItems[selectedAuthentic.id] = {
        count,
        target,
        laps,
        dayKey: currentDayKey,
      };
    } else {
      delete nextSavedItems[selectedAuthentic.id];
    }

    setSavedItems(nextSavedItems);

    const savedForNew = nextSavedItems[item.id];
    if (savedForNew && (!savedForNew.dayKey || savedForNew.dayKey === currentDayKey)) {
      setCount(savedForNew.count);
      setTarget(savedForNew.target > 0 ? savedForNew.target : item.recommendedTarget);
      setLaps(savedForNew.laps);
    } else {
      setCount(0);
      setTarget(item.recommendedTarget);
      setLaps(0);
    }

    setSelectedAuthentic(item);
    setShowCompletionDialog(false);
  };

  const handleSelectAuthenticZikr = (item: AuthenticZikrItem) => {
    if (item.id === selectedAuthentic.id) return;
    if (count > 0 || laps > 0) {
      setPendingZikr(item);
      return;
    }
    switchToZikr(item, false);
  };

  const handleSaveAndSwitch = (item: AuthenticZikrItem) => {
    switchToZikr(item, true);
    setPendingZikr(null);
  };

  const handleResetAndSwitch = (item: AuthenticZikrItem) => {
    switchToZikr(item, false);
    setPendingZikr(null);
  };

  const { pressStyle, surfaceProps } = useCountingSurface({ onCount: handleTap, reduceMotion });

  const requestReset = useCallback(() => {
    if (count === 0 && laps === 0) return;
    setShowResetDialog(true);
  }, [count, laps]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && showReference) {
        event.preventDefault();
        setShowReference(false);
        return;
      }
      if (isCounterShortcutBlocked(event)) return;
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
        requestReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTap, onBack, requestReset, showReference]);

  const changeTarget = (nextTarget: number) => {
    setTarget(nextTarget);
    setShowCompletionDialog(count >= nextTarget);
    if (count > 0 || laps > 0) {
      setSavedItems((previous) => ({
        ...previous,
        [selectedAuthentic.id]: {
          count,
          target: nextTarget,
          laps,
          dayKey: currentDayKey,
        },
      }));
    }
  };

  const liveSavedItems = {
    ...savedItems,
    ...(count > 0 || laps > 0 ? { [selectedAuthentic.id]: { count, target, laps } } : {}),
  };

  return (
    <ScreenContainer
      dir={direction}
      className="relative flex flex-col overflow-y-auto h-full !pb-0 sm:!pt-0"
      screenName={t(language, "counter.tasbeehTitle")}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <ReadingScreenChrome
          language={language}
          direction={direction}
          title={t(language, "counter.tasbeehTitle")}
          onBack={onBack}
          testId="custom-counter"
          /* An open target has nothing to fill, so it reports the tally and
             skips the bar rather than drawing a track that never moves. */
          progress={{
            value: count,
            max: target,
            percentLabel: `${formatNumerals(progressPercent, language)}%`,
            countLabel: `${formatNumerals(count, language)} / ${formatNumerals(target, language)}`,
            ariaLabel: t(language, "counter.targetLabel"),
          }}
          subRow={
            <div className="w-full" data-prevent-count="true">
              <div className="relative z-20 grid grid-cols-2 gap-2 sm:gap-3" data-prevent-count="true">
                <div className="min-w-0">
                  <AuthenticZikrPicker
                    items={AUTHENTIC_AZKAR_COLLECTION}
                    selected={selectedAuthentic}
                    language={language}
                    direction={direction}
                    savedItems={liveSavedItems}
                    onSelect={handleSelectAuthenticZikr}
                  />
                </div>

                <div className="min-w-0">
                  <CounterTargetPicker
                    activeTarget={target}
                    onTargetChange={changeTarget}
                    language={language}
                    direction={direction}
                    allowOpen={false}
                  />
                </div>
              </div>
              {onOpenAfterPrayer && (
                <Button type="button" variant="outline" onClick={onOpenAfterPrayer} className="mt-3 w-full">
                  {t(language, "counter.guidedAfterPrayer")}
                </Button>
              )}
            </div>
          }
          actions={(tier) => {
            const isWide = tier === "wide";
            const actionClass = isWide ? HERO_ACTION_CLASS : HEADER_ACTION_CLASS;
            return (
              <div className="flex items-center gap-1.5">
                <DropdownMenu dir={direction}>
                  <DropdownMenuTrigger className={actionClass} aria-label={t(language, "common.moreOptions")}>
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
                    <DropdownMenuItem onClick={requestReset} disabled={count === 0 && laps === 0}>
                      <RotateCcw size={16} className="text-muted-foreground me-2" aria-hidden="true" />
                      <span>{t(language, "reader.resetCounter")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          }}
        />

        <div className="relative mx-4 mb-4 mt-4 flex min-h-0 flex-1 overflow-hidden bg-transparent">
          <div
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden cursor-pointer"
            data-testid="reader-card"
            data-counting-mode="canvas"
            {...surfaceProps}
          >
            <div
              className="custom-counter-stage mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col justify-between select-none relative"
              data-testid="custom-counter-content"
            >
              <div className="relative flex min-h-0 flex-1">
                <div className="reader-text-scroll h-full min-h-0 w-full overflow-y-auto ps-6 pe-7 md:px-20 py-4 outline-none focus-visible:outline-none focus:ring-0">
                  <div className="reading-measure mx-auto flex min-h-full w-full flex-col py-4">
                    <div style={pressStyle} className="my-auto w-full flex flex-col items-center justify-center">
                      <p
                        className="zikr-text max-w-[34rem] text-center font-medium leading-[2.1] text-foreground"
                        dir="rtl"
                        lang="ar"
                        style={{
                          fontFamily: "var(--font-zikr)",
                          fontSize: getReadingFontSize({
                            textSize,
                            arabicLength: activeText.length,
                            longSurah: false,
                          }),
                        }}
                      >
                        {activeText}
                      </p>
                      {!isArabic && (
                        <p
                          className="mt-3 max-w-[34rem] text-center text-sm font-semibold leading-7 text-muted-foreground"
                          dir="ltr"
                        >
                          {selectedAuthentic.textEn}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <footer className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                <div data-testid="reader-counter-stack">
                  <div className="reader-dock flex w-full flex-col items-center gap-2" data-testid="reader-dock">
                    <div className="flex w-full items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReference(true);
                        }}
                        aria-haspopup="dialog"
                        aria-label={t(language, "counter.virtueReference")}
                        title={t(language, "counter.virtueReference")}
                        data-testid="custom-counter-benefit-dock-button"
                        className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-3 text-primary shadow-sm transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      >
                        <Lightbulb size={20} aria-hidden="true" />
                        <span className="text-label font-bold">{t(language, "reader.referencesButton")}</span>
                      </button>
                    </div>
                    <div className="w-full px-3 pb-1" data-testid="counter-panel">
                      <div className="adaptive-counter-row flex w-full items-center justify-center gap-2.5">
                        <div className="flex min-w-0 flex-1 justify-center">
                          <ZikrCounterSurface
                            count={count}
                            total={target}
                            complete={isTargetComplete}
                            onTap={handleTap}
                            onCompleteTap={() => setShowCompletionDialog(true)}
                            language={language}
                            instructionText={t(language, "reader.tapAnywhere")}
                            testId="custom-counter-surface"
                            reduceMotion={reduceMotion}
                          />
                        </div>
                      </div>
                      <p className="mt-3 min-h-5 text-center text-sm font-medium text-muted-foreground">
                        {t(language, "reader.tapAnywhere")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <CounterShortcutHints
                      language={language}
                      direction={direction}
                      testId="counter-keyboard-shortcuts"
                      ariaLabel={t(language, "reader.keyboardShortcuts")}
                      shortcuts={[
                        { keys: ["Space"], label: t(language, "counter.count") },
                        { keys: ["R"], label: t(language, "counter.reset") },
                      ]}
                    />
                    <CounterKeyboardHelp
                      shortcuts={[
                        { keys: ["Space"], label: t(language, "counter.count") },
                        { keys: ["R"], label: t(language, "counter.reset") },
                      ]}
                      language={language}
                      direction={direction}
                    />
                  </div>
                </div>
              </footer>
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
            <h3 className="mb-1 text-xl font-extrabold text-foreground">{t(language, "counter.goalReached")}</h3>
            <p className="mb-5 text-sm text-muted-foreground">
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
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCompletionDialog(false);
                  onBack();
                }}
                size="lg"
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
                data-testid="custom-counter-return-btn"
              >
                <ArrowPrevious size={18} data-rtl-flip aria-hidden="true" />
                {t(language, "counter.returnToHub")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showResetDialog && (
        <Modal
          open
          onClose={() => setShowResetDialog(false)}
          title={t(language, "counter.resetConfirmTitle")}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-sm"
          className="p-6"
        >
          <div>
            <h2 className="pe-10 text-lg font-black text-foreground">{t(language, "counter.resetConfirmTitle")}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
              {t(language, "counter.resetConfirmBody", { count: formatNumerals(count, language) })}
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={() => setShowResetDialog(false)} className="flex-1">
                {t(language, "common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleReset();
                  setShowResetDialog(false);
                }}
                className="flex-1"
              >
                {t(language, "counter.resetToZero")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {pendingZikr && (
        <Modal
          open
          onClose={() => setPendingZikr(null)}
          title={t(language, "counter.changeDhikrTitle")}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-sm"
          className="p-6"
        >
          <div>
            <h2 className="pe-10 text-lg font-black text-foreground">{t(language, "counter.changeDhikrTitle")}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
              {t(language, "counter.changeDhikrBody", { count: formatNumerals(count, language) })}
            </p>
            <div className="mt-5 space-y-2">
              <Button onClick={() => handleSaveAndSwitch(pendingZikr)} className="w-full">
                {t(language, "counter.saveAndSwitch")}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPendingZikr(null)} className="flex-1">
                  {t(language, "common.cancel")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResetAndSwitch(pendingZikr)}
                  className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {t(language, "counter.changeDhikrConfirm")}
                </Button>
              </div>
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
          language={language}
          maxWidthClassName="max-w-md"
          className="p-5 sm:p-6"
        >
          <div className="text-start space-y-3">
            <div className="flex items-center gap-3 pe-10">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lightbulb size={20} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-black text-foreground">{t(language, "counter.virtueReference")}</h2>
            </div>
            <p className="text-subtitle font-semibold leading-7 text-foreground" dir="auto">
              {isArabic ? selectedAuthentic.virtueAr : selectedAuthentic.virtueEn}
            </p>
            <p className="text-label font-bold leading-6 text-muted-foreground" dir="auto">
              {isArabic ? selectedAuthentic.sourceRefAr : selectedAuthentic.sourceRefEn} ·{" "}
              {isArabic ? selectedAuthentic.hadithGradeAr : selectedAuthentic.hadithGradeEn}
            </p>
          </div>
        </Modal>
      )}
    </ScreenContainer>
  );
}
