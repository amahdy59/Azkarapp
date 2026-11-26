import { useMediaQuery } from "../hooks/useMediaQuery";
import { ReferenceCard } from "../components/ReferenceCard";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { MasbahaDhikrSheet } from "../components/MasbahaDhikrSheet";
import { IconButton } from "../components/LayoutShells";
import "../components/masbaha.css";
import { MasbahaSettingsSheet } from "../components/MasbahaSettingsSheet";
import { DevotionalAction } from "../components/DevotionalControls";
import { useStandaloneReadingFocus } from "../hooks/useStandaloneReadingFocus";
import { CounterKeyboardHelp } from "../components/CounterKeyboardHelp";
import { useCounterAnnouncement } from "../hooks/useCounterAnnouncement";
import {
  ArrowPrevious,
  BookOpen,
  Check,
  Keyboard,
  List,
  Maximize,
  Minimize,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Undo,
} from "../components/icons";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { ReadingHeaderSurface, READING_HEADER_ACTION_CLASS } from "../components/ReadingHeaderSurface";
import { ResponsiveSheet, SheetHeader } from "../components/ResponsiveSheet";
import { useCountingSurface } from "../components/countingSurface";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { AUTHENTIC_AZKAR_COLLECTION, type AuthenticZikrItem } from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
import { getProgressDayKey } from "../progress";
import { useWakeLock } from "../hooks/useWakeLock";
import { COMPACT_TOUCH_KEYBOARD_HELP_QUERY, isCounterShortcutBlocked } from "../keyboardShortcuts";
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
  const compactTouch = useMediaQuery(COMPACT_TOUCH_KEYBOARD_HELP_QUERY);
  const isWide = useMediaQuery("(min-width: 768px)");
  const [panel, setPanel] = useState<"settings" | "dhikr" | "reference" | "reset" | "keyboard" | "share" | null>(null);
  const keyboardHelpOpen = panel === "keyboard";
  const setKeyboardHelpOpen = (open: boolean) => setPanel(open ? "keyboard" : null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);

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
  const showReference = panel === "reference";
  const setShowReference = useCallback((open: boolean) => setPanel(open ? "reference" : null), []);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const showResetDialog = panel === "reset";
  const setShowResetDialog = useCallback((open: boolean) => setPanel(open ? "reset" : null), []);
  const settingsOpen = panel === "settings";
  const [pendingTarget, setPendingTarget] = useState<number>();
  const [pendingZikr, setPendingZikr] = useState<AuthenticZikrItem | null>(null);
  const [currentTextSize, setCurrentTextSize] = useState<TextSizeOption>(textSize);
  const shareOpen = panel === "share";
  const setShareOpen = (open: boolean) => setPanel(open ? "share" : null);

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
  const [sessionHaptics, setSessionHaptics] = useState(hapticFeedback);
  useEffect(() => setSessionHaptics(hapticFeedback), [hapticFeedback]);

  const suppressTapRef = useRef(false);
  const touchGesture = useRef<{ x: number; y: number; cancelled: boolean } | null>(null);
  const handleTap = useCallback(() => {
    if (suppressTapRef.current) return;
    if (isTargetComplete) {
      setShowCompletionDialog(true);
      return;
    }
    const nextCount = count + 1;
    setCount(nextCount);
    playClickFeedback();

    if (nextCount >= target) {
      setShowCompletionDialog(true);
      vibrateIfEnabled(sessionHaptics, [30, 50, 30, 50, 50]);
    } else if (nextCount > 0 && nextCount % 33 === 0) {
      vibrateIfEnabled(sessionHaptics, [25, 30, 25]);
    } else {
      vibrateIfEnabled(sessionHaptics, 8);
    }
  }, [count, sessionHaptics, isTargetComplete, playClickFeedback, target]);

  const undoCount = () => {
    setCount((value) => Math.max(0, value - 1));
    setShowCompletionDialog(false);
  };

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
    (item: AuthenticZikrItem, preserveCurrent: boolean, targetOverride?: number) => {
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
        setTarget(targetOverride ?? (savedForNew.target > 0 ? savedForNew.target : item.recommendedTarget));
        setLaps(savedForNew.laps);
      } else {
        setCount(0);
        setTarget(targetOverride ?? item.recommendedTarget);
        setLaps(0);
      }

      setSelectedAuthentic(item);
      setShowCompletionDialog(false);
    },
    [count, currentDayKey, laps, savedItems, selectedAuthentic.id, target],
  );

  const handleSelectAuthenticZikr = useCallback(
    (item: AuthenticZikrItem) => {
      setPendingTarget(undefined);
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
    switchToZikr(item, true, pendingTarget);
    setPendingTarget(undefined);
    setPendingZikr(null);
  };

  const handleResetAndSwitch = (item: AuthenticZikrItem) => {
    switchToZikr(item, false, pendingTarget);
    setPendingTarget(undefined);
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
  }, [count, laps, setShowResetDialog]);

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
  }, [handleTap, onBack, requestReset, showReference, setShowReference, focusMode, setFocusMode]);

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
      className="masbaha-screen !pb-0"
      screenName={t(language, "counter.tasbeehTitle")}
    >
      <div className="masbaha-main">
        <ReadingHeaderSurface data-testid="custom-counter-desktop-hero">
          <div className="masbaha-header" data-testid="custom-counter-header-toolbar">
            <IconButton label={t(language, "common.back")} onClick={onBack} className={READING_HEADER_ACTION_CLASS}>
              <ArrowPrevious size={20} data-rtl-flip aria-hidden="true" />
            </IconButton>
            <h1 className="text-xl font-bold">{t(language, "counter.tasbeehTitle")}</h1>
            <button
              ref={moreTriggerRef}
              type="button"
              className={READING_HEADER_ACTION_CLASS}
              data-testid="masbaha-settings-trigger"
              aria-label={t(language, "counter.settings")}
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
              onClick={() => setPanel("settings")}
            >
              <SlidersHorizontal size={20} aria-hidden="true" />
            </button>
          </div>
        </ReadingHeaderSurface>
        <div
          ref={readingScrollRef}
          className="masbaha-reading reader-text-scroll"
          // A scrollable reading region needs keyboard entry, matching Reader/Salawat.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="region"
          aria-label={t(language, "reader.readingText")}
        >
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {counterAnnouncement}
          </p>
          <div
            className="masbaha-stage"
            data-testid="reader-card"
            data-counting-mode="canvas"
            {...surfaceProps}
            onKeyDownCapture={() => {
              suppressTapRef.current = false;
            }}
            onPointerDownCapture={(event) => {
              if (event.pointerType !== "touch") suppressTapRef.current = false;
            }}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              if (!touch) return;
              const cancelled = event.touches.length !== 1;
              touchGesture.current = { x: touch.clientX, y: touch.clientY, cancelled };
              suppressTapRef.current = cancelled;
              if (!cancelled) swipeTouchStart(event);
            }}
            onTouchMove={(event) => {
              const start = touchGesture.current;
              const touch = event.touches[0];
              if (!start || !touch) return;
              if (event.touches.length !== 1) start.cancelled = true;
              if (start.cancelled || Math.abs(touch.clientY - start.y) > 14) suppressTapRef.current = true;
              if (!start.cancelled) swipeTouchMove(event);
            }}
            onTouchEnd={(event) => {
              if (!touchGesture.current?.cancelled) swipeTouchEnd(event);
              // Suppression survives the synthesized click; the next touch starts
              // a new gesture, so rapid intentional taps remain independent.
            }}
            onTouchCancel={() => {
              if (touchGesture.current) touchGesture.current.cancelled = true;
              suppressTapRef.current = true;
            }}
          >
            <div className="masbaha-dhikr" data-testid="custom-counter-content">
              <div style={pressStyle} className="w-full">
                <p
                  className="zikr-text text-center font-medium leading-[2.1] text-foreground"
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
                  <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground" dir="ltr">
                    {selectedAuthentic.textEn}
                  </p>
                )}
              </div>
            </div>
            <div className="masbaha-counter-area">
              <ZikrCounterSurface
                presentation="masbaha"
                count={count}
                total={target}
                complete={isTargetComplete}
                onTap={handleTap}
                onCompleteTap={handleTap}
                language={language}
                instructionText={t(language, "reader.tapAnywhere")}
                testId="custom-counter-surface"
                reduceMotion={reduceMotion}
              />
              {showCompletionDialog && isTargetComplete && (
                <section className="masbaha-completion" data-testid="masbaha-completion" data-prevent-count="true">
                  <p className="text-sm font-semibold" role="status">
                    <Check size={18} aria-hidden="true" className="inline-block me-2" />
                    {t(language, "counter.completeQuiet")}
                  </p>
                  <Button
                    onClick={() => {
                      setLaps((value) => value + 1);
                      setCount(0);
                      setShowCompletionDialog(false);
                    }}
                  >
                    {t(language, "counter.newRoundShort")}
                  </Button>
                  <Button variant="outline" data-testid="custom-counter-return-btn" onClick={onBack}>
                    {t(language, "counter.finish")}
                  </Button>
                </section>
              )}
            </div>
            <div className="masbaha-actions" data-prevent-count="true" data-testid="masbaha-support-actions">
              {!focusMode && (
                <DevotionalAction
                  onClick={undoCount}
                  disabled={count === 0}
                  aria-label={t(language, "counter.undoCount")}
                >
                  <Undo size={20} aria-hidden="true" />
                  <span>{t(language, "common.undo")}</span>
                </DevotionalAction>
              )}
              {!focusMode && (
                <DevotionalAction
                  data-testid="counter-zikr-filter"
                  aria-label={t(language, "counter.chooseDhikr")}
                  aria-haspopup="dialog"
                  aria-expanded={panel === "dhikr"}
                  onClick={() => setPanel("dhikr")}
                >
                  <List size={20} aria-hidden="true" />
                  <span>{t(language, "counter.dhikrShort")}</span>
                </DevotionalAction>
              )}
              <DevotionalAction
                ref={focusToggleRef}
                data-testid="reader-tools-toggle"
                aria-label={t(language, focusMode ? "reader.exitFocus" : "reader.enterFocus")}
                aria-pressed={focusMode}
                onClick={() => setFocusMode((value) => !value)}
              >
                {focusMode ? <Minimize size={20} aria-hidden="true" /> : <Maximize size={20} aria-hidden="true" />}
                <span>{t(language, focusMode ? "reader.exitFocusShort" : "reader.focusShort")}</span>
              </DevotionalAction>
            </div>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <MasbahaSettingsSheet
          target={target}
          language={language}
          direction={direction}
          textSize={currentTextSize}
          feedback={{
            sound: soundEnabled,
            haptics: sessionHaptics,
            vibrationAvailable: typeof navigator.vibrate === "function",
          }}
          onClose={() => setPanel(null)}
          onApply={(nextTarget, feedback, size) => {
            changeTarget(nextTarget);
            setSessionHaptics(feedback.haptics);
            if (feedback.sound !== soundEnabled) toggleSound();
            handleTextSizeChange(size);
            setPanel(null);
          }}
          actions={[
            {
              label: t(language, "counter.virtueReference"),
              icon: <BookOpen aria-hidden="true" />,
              onClick: () => setPanel("reference"),
              testId: "custom-counter-benefit-dock-button",
            },
            {
              label: t(language, "reader.shareAction"),
              icon: <Share2 aria-hidden="true" />,
              onClick: () => setPanel("share"),
              testId: "counter-share-button",
            },
            {
              label: t(language, "reader.resetCounter"),
              icon: <RotateCcw aria-hidden="true" />,
              onClick: requestReset,
              disabled: count === 0 && laps === 0,
              destructive: true,
            },
            ...(isWide && !compactTouch
              ? [
                  {
                    label: t(language, "reader.keyboardShortcuts"),
                    icon: <Keyboard aria-hidden="true" />,
                    onClick: () => setPanel("keyboard"),
                  },
                ]
              : []),
          ]}
        />
      )}
      {panel === "dhikr" && (
        <MasbahaDhikrSheet
          items={AUTHENTIC_AZKAR_COLLECTION}
          current={selectedAuthentic}
          savedItems={liveSavedItems}
          language={language}
          direction={direction}
          onClose={() => setPanel(null)}
          onContinue={(item) => {
            if (item.id !== selectedAuthentic.id) switchToZikr(item, true);
            setPanel(null);
          }}
        />
      )}

      <CounterKeyboardHelp
        language={language}
        direction={direction}
        open={keyboardHelpOpen}
        onOpenChange={setKeyboardHelpOpen}
        showTrigger={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          moreTriggerRef.current?.focus();
        }}
        shortcuts={[
          { keys: ["Space"], label: t(language, "reader.shortcutCount") },
          { keys: ["R"], label: t(language, "reader.shortcutReset") },
          { keys: ["Esc"], label: t(language, "reader.shortcutBack") },
        ]}
      />
      {showResetDialog && (
        <ResponsiveSheet
          open
          onClose={() => setShowResetDialog(false)}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            moreTriggerRef.current?.focus();
          }}
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
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            moreTriggerRef.current?.focus();
          }}
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
              icon={<BookOpen size={20} aria-hidden="true" />}
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
