import { ReferenceCard } from "../components/ReferenceCard";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AuthenticZikrPicker } from "../components/AuthenticZikrPicker";
import { DevotionalAction } from "../components/DevotionalControls";
import { useStandaloneReadingFocus } from "../hooks/useStandaloneReadingFocus";
import { StandaloneCounterFooter } from "../components/StandaloneCounterFooter";
import { useCounterAnnouncement } from "../hooks/useCounterAnnouncement";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import {
  ArrowPrevious,
  Check,
  ChevronNext,
  ChevronPrevious,
  Lightbulb,
  MoreVertical,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "../components/icons";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { ReadingScreenChrome } from "../components/ReadingScreenChrome";
import { ResponsiveSheet, SheetHeader } from "../components/ResponsiveSheet";
import { useCountingSurface } from "../components/countingSurface";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
import { getProgressDayKey } from "../progress";
import { useWakeLock } from "../hooks/useWakeLock";
import { isCounterShortcutBlocked } from "../keyboardShortcuts";
import { getReadingFontSize } from "./readingTypography";
import type { AppLanguage, TextSizeOption, Zikr } from "../types";

const SharingPreview = lazy(() =>
  import("../components/CollectionShareModal").then((module) => ({ default: module.CollectionShareModal })),
);

function authenticItemToShareZikr(item: AuthenticZikrItem): Zikr {
  return {
    id: item.id,
    canonicalKey: item.id,
    audioBehavior: { defaultMode: "play-once", supportedModes: ["play-once"] },
    arabicText: item.textAr,
    transliteration: item.textEn ?? "",
    translation: item.textEn ?? "",
    sourceReference: item.sourceRefEn ?? item.sourceRefAr,
    sourceReferenceArabic: item.sourceRefAr,
    benefit: item.virtueEn ?? item.virtueAr,
    benefitArabic: item.virtueAr,
    hadithText: item.hadithTextAr,
    hadithTextEnglish: item.hadithTextEn,
    sourceUrl: item.sourceUrl,
    category: "miscellaneous",
    orderIndex: 0,
    repetitionCount: item.recommendedTarget,
  };
}

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
  hapticFeedback = true,
  reduceMotion = false,
  textSize = "medium",
  onTextSizeChange,
  initialMasbahaState,
  onSaveMasbahaState,
  progressDayStartHour,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onBack: () => void;
  hapticFeedback?: boolean;
  reduceMotion?: boolean;
  textSize?: TextSizeOption;
  onTextSizeChange?: (size: TextSizeOption) => void;
  initialMasbahaState?: MasbahaSavedState;
  onSaveMasbahaState?: (state: MasbahaSavedState) => void;
  progressDayStartHour?: number;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const { focusMode, setFocusMode, focusToggleRef, readingScrollRef } = useStandaloneReadingFocus();
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
  const [currentTextSize, setCurrentTextSize] = useState<TextSizeOption>(textSize);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    setCurrentTextSize(textSize);
  }, [textSize]);

  const handleTextSizeChange = (newSize: TextSizeOption) => {
    setCurrentTextSize(newSize);
    onTextSizeChange?.(newSize);
  };

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
  const counterAnnouncement = useCounterAnnouncement(count, target, language, selectedAuthentic.id);
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

  const switchToZikr = useCallback(
    (item: AuthenticZikrItem, preserveCurrent: boolean) => {
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
    },
    [count, currentDayKey, laps, savedItems, selectedAuthentic.id, target],
  );

  const handleSelectAuthenticZikr = useCallback(
    (item: AuthenticZikrItem) => {
      if (item.id === selectedAuthentic.id) return;
      if (count > 0 || laps > 0) {
        setPendingZikr(item);
        return;
      }
      switchToZikr(item, false);
    },
    [count, laps, selectedAuthentic.id, switchToZikr],
  );

  const handleSaveAndSwitch = (item: AuthenticZikrItem) => {
    switchToZikr(item, true);
    setPendingZikr(null);
  };

  const handleResetAndSwitch = (item: AuthenticZikrItem) => {
    switchToZikr(item, false);
    setPendingZikr(null);
  };

  const currentZikrIndex = AUTHENTIC_AZKAR_COLLECTION.findIndex((item) => item.id === selectedAuthentic.id);
  const prevZikrItem =
    AUTHENTIC_AZKAR_COLLECTION[
      (currentZikrIndex - 1 + AUTHENTIC_AZKAR_COLLECTION.length) % AUTHENTIC_AZKAR_COLLECTION.length
    ]!;
  const nextZikrItem = AUTHENTIC_AZKAR_COLLECTION[(currentZikrIndex + 1) % AUTHENTIC_AZKAR_COLLECTION.length]!;

  const handlePrevZikr = useCallback(() => {
    handleSelectAuthenticZikr(prevZikrItem);
  }, [handleSelectAuthenticZikr, prevZikrItem]);

  const handleNextZikr = useCallback(() => {
    handleSelectAuthenticZikr(nextZikrItem);
  }, [handleSelectAuthenticZikr, nextZikrItem]);

  const suppressTapRef = useRef(false);
  const {
    onTouchStart: swipeTouchStart,
    onTouchMove: swipeTouchMove,
    onTouchEnd: swipeTouchEnd,
  } = useSwipeGestures({
    direction,
    onNext: handleNextZikr,
    onPrev: handlePrevZikr,
    suppressTap: suppressTapRef,
    reduceMotion,
  });

  const { pressStyle, surfaceProps } = useCountingSurface({
    onCount: () => {
      if (!suppressTapRef.current) handleTap();
    },
    reduceMotion,
  });

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
      if (
        event.key === "Escape" &&
        focusMode &&
        !event.defaultPrevented &&
        !document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')
      ) {
        event.preventDefault();
        setFocusMode(false);
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
  }, [handleTap, onBack, requestReset, showReference, focusMode, setFocusMode]);

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
      data-reading-focus={focusMode}
      className="relative flex flex-col overflow-y-auto h-full !pb-0 sm:!pt-0"
      screenName={t(language, "counter.tasbeehTitle")}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div data-reading-chrome>
          <ReadingScreenChrome
            language={language}
            direction={direction}
            title={t(language, "counter.tasbeehTitle")}
            onBack={onBack}
            testId="custom-counter"
            category="neutral"
            textSize={currentTextSize}
            onTextSizeChange={handleTextSizeChange}
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
                <div
                  className="counter-picker-row relative z-20 flex items-center gap-2 sm:gap-3"
                  data-prevent-count="true"
                >
                  <div className="min-w-0 flex-1">
                    <AuthenticZikrPicker
                      items={AUTHENTIC_AZKAR_COLLECTION}
                      selected={selectedAuthentic}
                      language={language}
                      direction={direction}
                      savedItems={liveSavedItems}
                      onSelect={handleSelectAuthenticZikr}
                    />
                  </div>

                  <div className="min-w-fit shrink-0">
                    <CounterTargetPicker
                      activeTarget={target}
                      onTargetChange={changeTarget}
                      language={language}
                      direction={direction}
                      allowOpen={false}
                    />
                  </div>
                </div>
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
        </div>

        <div className="counter-reading-canvas relative mx-4 mb-4 mt-4 flex flex-1 overflow-hidden bg-transparent">
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {counterAnnouncement}
          </p>
          <div
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden cursor-pointer"
            data-testid="reader-card"
            data-counting-mode="canvas"
            {...surfaceProps}
            onTouchStart={swipeTouchStart}
            onTouchMove={swipeTouchMove}
            onTouchEnd={swipeTouchEnd}
          >
            <div
              className="custom-counter-stage mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col justify-between select-none relative"
              data-testid="custom-counter-content"
            >
              <div className="relative flex min-h-0 flex-1">
                <div
                  ref={readingScrollRef}
                  // The reading viewport needs keyboard scrolling, matching ReaderScreen.
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                  role="region"
                  aria-label={t(language, "reader.readingText")}
                  className="reader-text-scroll h-full min-h-0 w-full overflow-y-auto ps-6 pe-7 md:px-20 py-4 outline-none focus-visible:outline-none focus:ring-0"
                >
                  <div className="reading-measure mx-auto flex min-h-full w-full flex-col py-4">
                    <div style={pressStyle} className="my-auto w-full flex flex-col items-center justify-center">
                      <p
                        className="zikr-text max-w-[34rem] text-center font-medium leading-[2.1] text-foreground"
                        dir="rtl"
                        lang="ar"
                        style={{
                          fontFamily: "var(--font-zikr)",
                          fontSize: getReadingFontSize({
                            textSize: currentTextSize,
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

              <footer className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
                <div data-testid="reader-counter-stack">
                  <StandaloneCounterFooter
                    language={language}
                    direction={direction}
                    focusMode={focusMode}
                    onToggleFocus={() => setFocusMode((value) => !value)}
                    focusToggleRef={focusToggleRef}
                    soundEnabled={soundEnabled}
                    onToggleSound={toggleSound}
                    onReset={requestReset}
                    resetDisabled={count === 0 && laps === 0}
                    onShare={() => setShareOpen(true)}
                    previous={
                      <DevotionalAction
                        type="button"
                        aria-label={t(language, "audioPlayer.previous")}
                        title={t(language, "audioPlayer.previous")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevZikr();
                        }}
                        className="adaptive-counter-nav h-12 min-w-[3rem] px-3 font-semibold"
                        data-testid="custom-counter-prev-btn"
                      >
                        <ChevronPrevious size={20} aria-hidden="true" />
                        <span className="hidden sm:inline text-xs">{t(language, "common.previous")}</span>
                      </DevotionalAction>
                    }
                    next={
                      <DevotionalAction
                        type="button"
                        aria-label={t(language, "audioPlayer.next")}
                        title={t(language, "audioPlayer.next")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextZikr();
                        }}
                        className="adaptive-counter-nav h-12 min-w-[3rem] px-3 font-semibold"
                        data-testid="custom-counter-next-btn"
                      >
                        <span className="hidden sm:inline text-xs">{t(language, "common.next")}</span>
                        <ChevronNext size={20} aria-hidden="true" />
                      </DevotionalAction>
                    }
                    benefit={
                      <DevotionalAction
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.focus({ preventScroll: true });
                          setShowReference(true);
                        }}
                        aria-haspopup="dialog"
                        aria-label={t(language, "counter.virtueReference")}
                        title={t(language, "counter.virtueReference")}
                        data-testid="custom-counter-benefit-dock-button"
                      >
                        <Lightbulb size={20} aria-hidden="true" />
                        <span className="reader-tool-label text-label font-semibold">
                          {t(language, "reader.referencesButton")}
                        </span>
                      </DevotionalAction>
                    }
                    counter={
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
                    }
                  />
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {showCompletionDialog && (
        <ResponsiveSheet
          open
          onClose={() => setShowCompletionDialog(false)}
          title={t(language, "counter.goalReached")}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-sm"
          showCloseButton={false}
          drawerClassName="pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex min-h-0 flex-col overflow-hidden text-start">
            <SheetHeader
              title={t(language, "counter.goalReached")}
              icon={<Check size={20} strokeWidth={3} aria-hidden="true" />}
              onClose={() => setShowCompletionDialog(false)}
              language={language}
              direction={direction}
            />
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6 text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-success/20 text-success">
                <Check size={32} strokeWidth={3} aria-hidden="true" />
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                {t(language, "counter.goalReachedDetail", {
                  target: formatNumerals(target, language),
                  zikr: activeText,
                })}
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
          </div>
        </ResponsiveSheet>
      )}

      {showResetDialog && (
        <ResponsiveSheet
          open
          onClose={() => setShowResetDialog(false)}
          title={t(language, "counter.resetConfirmTitle")}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-sm"
          showCloseButton={false}
          drawerClassName="pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex min-h-0 flex-col overflow-hidden text-start">
            <SheetHeader
              title={t(language, "counter.resetConfirmTitle")}
              icon={<RotateCcw size={20} aria-hidden="true" />}
              onClose={() => setShowResetDialog(false)}
              language={language}
              direction={direction}
            />
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <p className="text-sm font-medium leading-6 text-muted-foreground">
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
          </div>
        </ResponsiveSheet>
      )}

      {pendingZikr && (
        <ResponsiveSheet
          open
          onClose={() => setPendingZikr(null)}
          title={t(language, "counter.changeDhikrTitle")}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-sm"
          showCloseButton={false}
          drawerClassName="pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex min-h-0 flex-col overflow-hidden text-start">
            <SheetHeader
              title={t(language, "counter.changeDhikrTitle")}
              icon={<RotateCcw size={20} aria-hidden="true" />}
              onClose={() => setPendingZikr(null)}
              language={language}
              direction={direction}
            />
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <p className="text-sm font-medium leading-6 text-muted-foreground">
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
          </div>
        </ResponsiveSheet>
      )}

      {showReference && (
        <ResponsiveSheet
          open
          onClose={() => setShowReference(false)}
          title={t(language, "counter.virtueReference")}
          direction={direction}
          language={language}
          testId="custom-counter-reference-sheet"
          maxWidthClassName="max-w-md"
          showCloseButton={false}
          drawerClassName="pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex flex-col h-full max-h-[82vh] overflow-hidden text-start">
            <SheetHeader
              title={t(language, "counter.virtueReference")}
              icon={<Lightbulb size={20} aria-hidden="true" />}
              onClose={() => setShowReference(false)}
              language={language}
              direction={direction}
            />

            <div className="flex-1 overflow-y-auto space-y-3.5 px-5 py-4 pe-4">
              <ReferenceCard
                title={t(language, "reader.benefitLabel")}
                titleHeadingId="masbaha-benefit-heading"
                body={isArabic ? selectedAuthentic.virtueAr : selectedAuthentic.virtueEn}
                bodyTestId="masbaha-virtue-text"
                copyable={true}
                copyText={isArabic ? selectedAuthentic.virtueAr : selectedAuthentic.virtueEn}
                language={language}
                direction={direction}
                isArabicText={isArabic}
              />

              <ReferenceCard
                title={t(language, "reader.hadithLabel")}
                titleHeadingId="masbaha-hadith-heading"
                body={
                  isArabic
                    ? selectedAuthentic.hadithTextAr
                    : (selectedAuthentic.hadithTextEn ?? selectedAuthentic.hadithTextAr)
                }
                bodyTestId="masbaha-hadith-text"
                copyable={true}
                copyText={
                  isArabic
                    ? selectedAuthentic.hadithTextAr
                    : (selectedAuthentic.hadithTextEn ?? selectedAuthentic.hadithTextAr)
                }
                copyAriaLabel={t(language, "reader.copyHadith")}
                sourceText={`${isArabic ? selectedAuthentic.sourceRefAr : selectedAuthentic.sourceRefEn} · ${isArabic ? selectedAuthentic.hadithGradeAr : selectedAuthentic.hadithGradeEn}`}
                sourceUrl={selectedAuthentic.sourceUrl}
                sourceTestId="masbaha-hadith-source"
                sourceHeadingId="masbaha-source-heading"
                language={language}
                direction={direction}
                isArabicText={isArabic}
              />
            </div>
          </div>
        </ResponsiveSheet>
      )}

      {shareOpen && (
        <Suspense fallback={null}>
          <SharingPreview
            open
            onClose={() => setShareOpen(false)}
            single
            collectionTitle={selectedAuthentic.shortNameAr || t(language, "counter.tasbeehTitle")}
            collectionTitleArabic={selectedAuthentic.shortNameAr}
            items={[authenticItemToShareZikr(selectedAuthentic)]}
            readerIndex={0}
            language={language}
            themeMode="midnight"
          />
        </Suspense>
      )}
    </ScreenContainer>
  );
}
