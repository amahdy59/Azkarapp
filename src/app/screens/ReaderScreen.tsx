/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "../../styles/animations/ZikrAnimations.css";
import { motion, AnimatePresence } from "motion/react";
import "./ReaderScreen.css";
import { useZikrCounter } from "../hooks/useZikrCounter";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useWakeLock } from "../hooks/useWakeLock";
import {
  BookOpen,
  ArrowPrevious,
  Share2,
  MoreVertical,
  RotateCcw,
  List,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "../components/icons";
import { t } from "../i18n";
import { shouldReduceMotion } from "../motionPreferences";
import { CATEGORIES } from "../content/categories";
import { getAzkarForMode } from "../content/azkar";
import { isLongSurah } from "../content/mushafPages";
import type { AppLanguage, CategoryId, RoutineMode, TextSizeOption, ThemeMode, Zikr } from "../types";
import { isPrayerName } from "../content/prayerTimes";
import { ProgressBar } from "../components/ProgressBar";
import { tapRippleStyle, ZikrCounterSurface } from "../components/ZikrComponents";
import { ReaderReferenceSheet } from "../components/ReaderReferenceSheet";
import { IconButton } from "../components/LayoutShells";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { prepareZikrShareCardFonts, shareZikrCard, type ZikrShareCardStatus } from "../share/zikrShareCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import { QuranPrelude } from "../components/QuranChrome";
import { QuranWordText } from "../components/QuranWordText";
import { MushafPageReader } from "../components/MushafPageReader";
import { QuranWordMeaningSheet } from "../components/QuranWordMeaningSheet";
import { getQuranWordMeanings, type QuranWordMeaning } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

/** Shared ghost icon-button treatment for every control in the phone header row. */
const READER_HEADER_ACTION_CLASS =
  "flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40";

const SHARE_STATUS_KEYS: Record<ZikrShareCardStatus, string> = {
  generating: "reader.shareCardGenerating",
  openingShareSheet: "reader.shareCardOpening",
  shared: "reader.shareCardShared",
  copying: "reader.shareCardCopying",
  copied: "reader.shareCardCopied",
  downloading: "reader.shareCardDownloading",
  downloaded: "reader.shareCardDownloaded",
  cancelled: "reader.shareCardCancelled",
  error: "reader.shareCardError",
};

function getReaderZikrTitle(zikr: Zikr, language: AppLanguage, fallback: string) {
  const surahName = language === "ar" ? zikr.surahNameArabic : zikr.surahNameEnglish;
  if (surahName?.trim()) return surahName.trim();

  const primaryText = (language === "ar" ? zikr.arabicText : zikr.translation).replace(/\s+/g, " ").trim();
  const firstClause = primaryText.split(/[,،;؛.!?؟]/)[0]?.trim() ?? "";
  if (firstClause.length >= 4) {
    return firstClause.length > 58 ? `${firstClause.slice(0, 57).trimEnd()}…` : firstClause;
  }
  return fallback;
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

const getCategoryThemeStyles = (catId: CategoryId, themeMode: ThemeMode) => {
  const isLight = themeMode === "light";
  if (isLight) {
    switch (catId) {
      case "morning":
        return { "--primary": "#b45309", "--ring": "#b45309" } as React.CSSProperties; // Amber 700
      case "evening":
        return { "--primary": "#0f766e", "--ring": "#0f766e" } as React.CSSProperties; // Teal 700
      case "before_sleep":
        return { "--primary": "#6d28d9", "--ring": "#6d28d9" } as React.CSSProperties; // Violet 700
      case "after_prayer":
        return { "--primary": "#047857", "--ring": "#047857" } as React.CSSProperties; // Emerald 700
      case "waking_up":
        return { "--primary": "#0369a1", "--ring": "#0369a1" } as React.CSSProperties; // Sky 700
      case "illness_ruqyah":
        return { "--primary": "#be123c", "--ring": "#be123c" } as React.CSSProperties; // Rose 700
      case "distress_anxiety":
        return { "--primary": "#4338ca", "--ring": "#4338ca" } as React.CSSProperties; // Indigo 700
      case "travel":
        return { "--primary": "#d97706", "--ring": "#d97706" } as React.CSSProperties; // Amber 600
      default:
        return {};
    }
  } else {
    switch (catId) {
      case "morning":
        return { "--primary": "#fbbf24", "--ring": "#fbbf24" } as React.CSSProperties; // Amber 400
      case "evening":
        return { "--primary": "#2dd4bf", "--ring": "#2dd4bf" } as React.CSSProperties; // Teal 400
      case "before_sleep":
        return { "--primary": "#a78bfa", "--ring": "#a78bfa" } as React.CSSProperties; // Violet 400
      case "after_prayer":
        return { "--primary": "#34d399", "--ring": "#34d399" } as React.CSSProperties; // Emerald 400
      case "waking_up":
        return { "--primary": "#38bdf8", "--ring": "#38bdf8" } as React.CSSProperties; // Sky 400
      case "illness_ruqyah":
        return { "--primary": "#fb7185", "--ring": "#fb7185" } as React.CSSProperties; // Rose 400
      case "distress_anxiety":
        return { "--primary": "#818cf8", "--ring": "#818cf8" } as React.CSSProperties; // Indigo 400
      case "travel":
        return { "--primary": "#fbbf24", "--ring": "#fbbf24" } as React.CSSProperties; // Amber 400
      default:
        return {};
    }
  }
};

export function ReaderScreen({
  catId,
  subCategory,
  idx,
  routineMode,
  azkarList,
  isArabic,
  direction,
  themeMode,
  isDone,
  collectionCompletedCount,
  hapticFeedback,
  reduceMotion = false,
  showTranslation,
  showTransliteration,
  textSize,
  savedZikrIds,
  onBack,
  onComplete,
  onUncomplete,
  onAdvance,
  onNext,
  onPrev,
  onToggleSaved,
  audioAvailable,
  onPlayAudio,
  onRepeatAudio,
}: {
  catId: CategoryId;
  subCategory?: string;
  idx: number;
  routineMode: RoutineMode;
  azkarList?: Zikr[];
  isArabic: boolean;
  direction: "ltr" | "rtl";
  themeMode: ThemeMode;
  isDone: boolean;
  collectionCompletedCount: number;
  hapticFeedback: boolean;
  reduceMotion?: boolean;
  showTranslation: boolean;
  showTransliteration: boolean;
  textSize: TextSizeOption;
  savedZikrIds: Set<string>;
  onBack: () => void;
  onComplete: (idx: number) => void;
  /** Clears a recorded completion so an accidental tap is recoverable. */
  onUncomplete?: (idx: number) => void;
  onAdvance: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleSaved: (zikrId: string) => void;
  audioAvailable: boolean;
  onPlayAudio?: () => void;
  onRepeatAudio?: () => void;
}) {
  const azkar = azkarList ?? getAzkarForMode(catId, routineMode);
  const z = azkar[idx];
  const category = CATEGORIES.find((item) => item.id === catId);
  const language: AppLanguage = isArabic ? "ar" : "en";
  const displayCategoryName = `${category ? (isArabic ? category.nameArabic : category.name) : ""}${
    catId === "after_prayer" && isPrayerName(subCategory) ? ` · ${t(language, `notifications.${subCategory}`)}` : ""
  }`;
  const reducedMotion = shouldReduceMotion(reduceMotion);
  const longSurah = isLongSurah(z);
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [hasOpenedBenefit, setHasOpenedBenefit] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [selectedWordMeanings, setSelectedWordMeanings] = useState<QuranWordMeaning[] | null>(null);
  const closeReference = useCallback(() => setBenefitOpen(false), []);
  const { soundEnabled, toggleSound, playClickFeedback } = useCounterClickFeedback();

  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readerMainRef = useRef<HTMLDivElement | null>(null);
  const readingScrollRef = useRef<HTMLDivElement | null>(null);
  const [canvasRipples, setCanvasRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // The hero band + card treatment now starts at the tablet breakpoint
  // (>=768px) rather than at the shell's "large" tier: tablets have the width
  // for the desktop reader, and running the phone layout there left a wide,
  // sparse column. Below 768px the phone layout takes over.
  const isDesktopReader = useMediaQuery("(min-width: 768px)");

  useWakeLock(true);

  const { count, complete, justCompleted, readerAnnouncement, suppressTap, handleTap, handleSurfaceTap, handleReset } =
    useZikrCounter({
      z,
      idx,
      isDone,
      language,
      azkarLength: azkar.length,
      collectionCompletedCount,
      hapticFeedback,
      vibrate,
      onCount: playClickFeedback,
      onComplete,
      onAdvance,
    });

  /**
   * "Reset counter" also clears a recorded completion, so an accidental tap on
   * the reader canvas is recoverable. Without this the count could be zeroed
   * while the zikr stayed marked done, and `isDone` restored it on remount.
   *
   * Reuses the same un-complete path the collection list already uses, which
   * deliberately does not revoke a palm that was already earned.
   */
  const handleResetCounter = useCallback(() => {
    handleReset();
    if (isDone) {
      onUncomplete?.(idx);
    }
    // handleReset is stable for the life of the mounted zikr.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, isDone, onUncomplete]);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGestures({
    direction,
    onNext,
    onPrev,
    suppressTap,
  });

  useEffect(() => {
    return () => {
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedWordMeanings(null);
  }, [z?.id]);

  useLayoutEffect(() => {
    if (readingScrollRef.current) {
      readingScrollRef.current.scrollTop = 0;
    }
  }, [idx]);

  const handleToggleSaved = useCallback(() => {
    if (z) onToggleSaved(z.id);
  }, [z, onToggleSaved]);

  // Desktop & Tablet Keyboard Navigation (Space to count, Arrow keys for Zikr navigation, R to reset, Esc to return)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const focusedControl =
        activeEl instanceof Element &&
        activeEl.closest(
          'button, a[href], input, textarea, select, [contenteditable="true"], [role="button"], [role="checkbox"], [role="combobox"], [role="menuitem"], [role="option"], [role="radio"], [role="search"], [role="switch"], [role="tab"], [role="textbox"]',
        );
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable ||
          activeEl.getAttribute("role") === "textbox")
      ) {
        return;
      }

      // Native controls own their keyboard semantics. Reader-wide shortcuts are
      // intentionally limited to the document surface, so Space still saves,
      // opens menus, and activates the focused action as expected.
      if (focusedControl) return;

      if (benefitOpen || selectedWordMeanings) {
        if (e.key === "Escape") {
          if (selectedWordMeanings) setSelectedWordMeanings(null);
          else if (benefitOpen) setBenefitOpen(false);
        }
        return;
      }

      if (e.key === " " || e.code === "Space") {
        if (longSurah) return;
        e.preventDefault();
        handleTap();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (direction === "rtl") {
          if (idx > 0) onPrev();
        } else {
          if (idx < azkar.length - 1) onNext();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (direction === "rtl") {
          if (idx < azkar.length - 1) onNext();
        } else {
          if (idx > 0) onPrev();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onBack();
      } else if (e.key === "r" || e.key === "R" || e.key === "ق") {
        e.preventDefault();
        handleResetCounter();
      } else if (e.key === "s" || e.key === "S" || e.key === "س") {
        e.preventDefault();
        handleToggleSaved();
      } else if (e.key === "b" || e.key === "B" || e.key === "ف") {
        e.preventDefault();
        setHasOpenedBenefit(true);
        setBenefitOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    direction,
    idx,
    azkar.length,
    onPrev,
    onNext,
    onBack,
    handleTap,
    handleResetCounter,
    handleToggleSaved,
    benefitOpen,
    selectedWordMeanings,
    longSurah,
  ]);

  if (!z || !category) {
    return null;
  }

  const counterInstruction = t(
    language,
    longSurah ? "reader.tapCounterWhenFinished" : isDesktopReader ? "reader.tapAnywhereDesktop" : "reader.tapAnywhere",
  );
  const wordMeanings = getQuranWordMeanings(z);
  const readingProgressValue = Math.min(collectionCompletedCount, azkar.length);
  const isSaved = savedZikrIds.has(z.id);
  // Dynamic typography scaling: slightly increase size for short text.
  let scaleFactor = 1;
  const arabicLength = z.arabicText.length;
  if (!longSurah) {
    if (arabicLength < 30) scaleFactor = 1.3;
    else if (arabicLength < 60) scaleFactor = 1.15;
    else if (arabicLength < 80) scaleFactor = 1.05;
  }
  const baseSize = { small: 16, medium: 18.5, large: 21.5 }[textSize];
  const readingFontSize = `${baseSize * scaleFactor}px`;
  const readingFontFamily = "var(--font-reading-arabic)";
  const readingPercent = azkar.length > 0 ? Math.round((readingProgressValue / azkar.length) * 100) : 0;
  const readerZikrTitle = getReaderZikrTitle(z, language, displayCategoryName);
  const localizedReadingPercent = formatNumerals(readingPercent, language);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareZikrCard(
        {
          id: z.id,
          language,
          themeMode,
          arabicText: z.arabicText,
          translation: language === "en" ? z.translation : undefined,
          transliteration: language === "en" ? z.transliteration : undefined,
          benefit: getLocalizedZikrBenefit(z, language),
          sourceReference: getLocalizedSourceReference(z, language),
          categoryLabel: displayCategoryName,
          repetitionCount: z.repetitionCount,
          appUrl:
            typeof window === "undefined"
              ? undefined
              : new URL(import.meta.env.BASE_URL, window.location.origin).toString(),
          labels: { brandName: t(language, "common.azkar") },
        },
        {
          onStatus: (status) => setShareMessage(t(language, SHARE_STATUS_KEYS[status])),
        },
      );
    } catch {
      // The share helper has already announced a localized error state.
    } finally {
      setIsSharing(false);
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
      shareTimer.current = setTimeout(() => setShareMessage(""), 2600);
    }
  };

  let displayArabicText = z.arabicText;
  if (z.hasBasmalah || z.isSurah) {
    displayArabicText = displayArabicText
      .replace(
        /^(بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ|بِسْمِ\s+اللَّهِ\s+الرَّحْمَنِ\s+الرَّحِيمِ|بِسْمِ\s+اللهِ\s+الرَّحْمٰنِ\s+الرَّحِيْمِ)[.\s\u06d4]*/,
        "",
      )
      .replace(
        /^\u0628\u0650\u0633\u0652\u0645\u0650\s+\u0627\u0644\u0644\u0651\u064e\u0647\u0650\s+\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650\s+\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650[.\s]*/,
        "",
      )
      .trim();
  }

  const renderReadingContent = () => (
    <article
      className={`mt-1 w-full px-4 pb-2 pt-2 flex flex-col items-center justify-center text-center bg-transparent ${longSurah ? "" : "cursor-pointer touch-manipulation transition-colors hover:bg-muted/10 active:bg-muted/20 my-auto"}`}
    >
      {!longSurah && <QuranPrelude zikr={z} className="pointer-events-none mb-4" />}

      {longSurah ? (
        <MushafPageReader
          zikr={z}
          arabicText={displayArabicText}
          meanings={wordMeanings}
          language={language}
          textStyle={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
          onSelectMeanings={setSelectedWordMeanings}
          flat={true}
        />
      ) : wordMeanings.length > 0 ? (
        <QuranWordText
          text={displayArabicText}
          meanings={wordMeanings}
          language={language}
          style={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
          onSelectMeanings={setSelectedWordMeanings}
        />
      ) : (
        <p
          className="zikr-text pointer-events-none text-center font-medium leading-[2.1] text-foreground"
          data-testid="zikr-text"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
        >
          {displayArabicText}
        </p>
      )}

      {!isArabic && (showTranslation || showTransliteration) && (
        <div className="mt-5 space-y-4 border-t border-border pt-4 text-center">
          {showTranslation && (
            <section aria-labelledby="reader-translation-title">
              <h2
                id="reader-translation-title"
                className="text-[0.8125rem] font-bold text-muted-foreground text-center"
              >
                {t(language, "reader.translationLabel")}
              </h2>
              <p className="mt-1 text-[1rem] leading-7 text-foreground text-center" lang="en" dir="ltr">
                {z.translation}
              </p>
            </section>
          )}
          {showTransliteration && z.transliteration && (
            <section aria-labelledby="reader-transliteration-title">
              <h2
                id="reader-transliteration-title"
                className="text-[0.8125rem] font-bold text-muted-foreground text-center"
              >
                {t(language, "reader.transliterationLabel")}
              </h2>
              <p className="mt-1 text-[1rem] leading-7 text-foreground text-center" lang="en" dir="ltr">
                {z.transliteration}
              </p>
            </section>
          )}
        </div>
      )}
    </article>
  );

  const renderNavigationButton = (kind: "prev" | "next") => {
    const isPrevious = kind === "prev";
    const disabled = isPrevious ? idx === 0 : idx === azkar.length - 1;
    const label = t(language, isPrevious ? "reader.prev" : "reader.next");

    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (isPrevious) {
            onPrev();
          } else {
            onNext();
          }
        }}
        disabled={disabled}
        title={label}
        aria-label={label}
        className="adaptive-counter-nav"
      >
        {isPrevious ? (
          direction === "rtl" ? (
            <ChevronRight size={22} />
          ) : (
            <ChevronLeft size={22} />
          )
        ) : direction === "rtl" ? (
          <ChevronLeft size={22} />
        ) : (
          <ChevronRight size={22} />
        )}
      </button>
    );
  };

  const renderSideNavigation = () => (
    <div
      className="pointer-events-none absolute inset-x-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-between md:flex"
      data-testid="reader-side-navigation"
    >
      <div className="pointer-events-auto">{renderNavigationButton("prev")}</div>
      <div className="pointer-events-auto">{renderNavigationButton("next")}</div>
    </div>
  );

  const renderCounterPanel = () => (
    <div className="px-3 pb-3" data-testid="counter-panel">
      <div className="adaptive-counter-row flex w-full items-center justify-center gap-2.5">
        <div className="md:hidden">{renderNavigationButton("prev")}</div>
        <div className="flex min-w-0 flex-1 justify-center">
          <ZikrCounterSurface
            count={count}
            total={z.repetitionCount}
            complete={complete}
            justCompleted={justCompleted}
            onTap={handleTap}
            language={language}
            instructionText={counterInstruction}
            testId="counter-surface"
            reduceMotion={reduceMotion}
          />
        </div>
        <div className="md:hidden">{renderNavigationButton("next")}</div>
      </div>
      <p className="mt-3 text-center text-sm font-medium text-muted-foreground">{counterInstruction}</p>
    </div>
  );

  const renderKeyboardShortcutsHint = () => (
    <div
      role="group"
      className="mx-auto mt-5 hidden w-fit max-w-full items-center justify-center gap-3 rounded-full border border-border/40 bg-muted/60 px-4 py-1.5 text-[0.75rem] font-medium text-muted-foreground md:flex"
      data-testid="reader-keyboard-shortcuts"
      aria-label={t(language, "reader.keyboardShortcuts")}
    >
      {/* Space only counts once the counter itself is focused in
          long-Surah mode (the reader canvas deliberately never counts a
          full Surah — see the counter-only contract in
          docs/DESIGN_SYSTEM.md), so the discoverable global shortcut
          doesn't apply here and the hint would be misleading. */}
      {!longSurah && (
        <>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
              Space
            </kbd>
            <span>{t(language, "reader.shortcutCount")}</span>
          </span>
          <span className="h-3 w-px bg-border/60" aria-hidden="true" />
        </>
      )}
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
          →
        </kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
          ←
        </kbd>
        <span>{t(language, "reader.shortcutNavigate")}</span>
      </span>
      <span className="h-3 w-px bg-border/60" aria-hidden="true" />
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
          R
        </kbd>
        <span>{t(language, "reader.shortcutReset")}</span>
      </span>
      <span className="h-3 w-px bg-border/60" aria-hidden="true" />
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[0.6875rem] font-mono shadow-2xs text-foreground font-bold">
          Esc
        </kbd>
        <span>{t(language, "reader.shortcutBack")}</span>
      </span>
    </div>
  );

  const renderCounterStack = () => (
    <div data-testid="reader-counter-stack">
      {renderCounterPanel()}
      {renderKeyboardShortcutsHint()}
    </div>
  );

  const renderReaderMenuItems = (layout: "mobile" | "desktop") => (
    <>
      <DropdownMenuItem
        disabled={!audioAvailable}
        onClick={onPlayAudio}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
      >
        <Volume2 size={18} />
        {audioAvailable ? t(language, "reader.playAudioOnce") : t(language, "reader.audioUnavailable")}
      </DropdownMenuItem>

      {onRepeatAudio && (
        <DropdownMenuItem
          onClick={onRepeatAudio}
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
        >
          <RotateCcw size={18} />
          {t(language, "reader.repeatPrescribed")}
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

      {layout === "mobile" && (
        <>
          <DropdownMenuItem
            onClick={handleToggleSaved}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
          >
            <Bookmark size={18} className={savedZikrIds.has(z.id) ? "favorite-pop fill-current" : ""} />
            {savedZikrIds.has(z.id) ? t(language, "reader.unsave") : t(language, "reader.save")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={toggleSound}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound")}
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuItem
        onClick={handleResetCounter}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
      >
        <RotateCcw size={18} />
        {t(language, "reader.resetCounter")}
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

      <DropdownMenuItem
        onClick={onBack}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
      >
        <List size={18} />
        {t(language, "reader.viewAllAzkar")}
      </DropdownMenuItem>
    </>
  );

  const categoryThemeStyles = getCategoryThemeStyles(catId, themeMode);

  const handleReaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || longSurah || complete) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest(
        "button, a, input, textarea, select, summary, [contenteditable='true'], [role='dialog'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [role='switch'], [data-prevent-count='true']",
      )
    ) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setCanvasRipples((current) => [
      ...current.slice(-3),
      { id: Date.now() + Math.random(), x: event.clientX - rect.left, y: event.clientY - rect.top },
    ]);
  };

  return (
    // The canvas delegates pointer clicks while its explicit reading and counter surfaces own keyboard activation.
    <ScreenContainer
      className="relative !pb-0"
      data-testid="reader-screen"
      data-zikr-index={idx}
      data-zikr-id={z.id}
      data-counting-mode={longSurah ? "counter-only" : "canvas"}
      dir={direction}
      style={categoryThemeStyles}
      screenName={displayCategoryName}
      onClick={handleSurfaceTap}
      onPointerDown={handleReaderPointerDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="sr-only" aria-live="polite">
        {shareMessage}
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
        {canvasRipples.map((ripple) => (
          <span
            key={ripple.id}
            className="tap-ripple"
            style={{
              ...tapRippleStyle,
              left: ripple.x,
              top: ripple.y,
            }}
            onAnimationEnd={() => setCanvasRipples((current) => current.filter((item) => item.id !== ripple.id))}
          />
        ))}
      </div>
      {/* Polite, not assertive: this region carries counting progress (every
          tenth repetition, the halfway mark) and the completion message. None
          of that is urgent enough to cut off whatever the screen reader is
          already saying — which, in a reader, is usually the zikr itself.
          Matches ZikrShareButton, which reserves assertive for errors. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {readerAnnouncement}
      </div>

      {isDesktopReader ? (
        <>
          {/* Wide-desktop hero band (>=1200px). Fixed navy brand surface,
              independent of the active theme — mirrors the Home screen's
              .azkar-hero background (src/app/components/azkar-hero-background.css)
              rather than following light/dark/midnight tokens, since it plays
              the same "always-dark brand band" role. */}
          <div
            data-testid="reader-desktop-hero"
            className="relative mx-4 mt-3 flex shrink-0 flex-col items-center gap-2 overflow-hidden rounded-3xl px-6 py-3 text-center"
            style={{
              background: "radial-gradient(120% 140% at 50% 10%, rgba(232,180,32,0.18), transparent 60%), #0b1426",
            }}
          >
            <IconButton
              onClick={onBack}
              label={t(language, "common.back")}
              className="absolute start-4 top-4 border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] hover:bg-[color:var(--on-media)]/20"
            >
              <ArrowPrevious size={20} />
            </IconButton>

            {/* Page-level actions live with the back control in the hero —
                a single toolbar row — rather than in a second row inside the
                card below. Icon-only throughout (the "Benefit" pill lost its
                text label; its tooltip now previews the actual benefit text
                instead of repeating the button's own name). */}
            <div className="absolute end-4 top-4 flex items-center gap-2">
              <DropdownMenu dir={direction}>
                <DropdownMenuTrigger
                  aria-label={t(language, "reader.menu")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <MoreVertical size={18} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[210px]">
                  {renderReaderMenuItems("desktop")}
                </DropdownMenuContent>
              </DropdownMenu>

              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  setHasOpenedBenefit(true);
                  setBenefitOpen(true);
                }}
                label={t(language, "reader.referencesButton")}
                title={getLocalizedZikrBenefit(z, language)}
                className="border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] hover:bg-[color:var(--on-media)]/20"
              >
                <BookOpen size={18} />
              </IconButton>

              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleSaved();
                }}
                label={isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}
                aria-pressed={isSaved}
                className="border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 hover:bg-[color:var(--on-media)]/20"
                style={{ color: isSaved ? "var(--on-media-accent)" : "var(--on-media)" }}
              >
                <Bookmark key={String(isSaved)} size={18} className={isSaved ? "favorite-pop fill-current" : ""} />
              </IconButton>

              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  void handleShare();
                }}
                label={t(language, "reader.share")}
                disabled={isSharing}
                aria-busy={isSharing || undefined}
                onPointerEnter={() => void prepareZikrShareCardFonts()}
                onFocus={() => void prepareZikrShareCardFonts()}
                className="border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] hover:bg-[color:var(--on-media)]/20"
              >
                <Share2 size={18} />
              </IconButton>

              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSound();
                }}
                label={t(language, "counter.sound")}
                title={t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound")}
                aria-pressed={soundEnabled}
                data-testid="reader-counter-sound-toggle"
                className="border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] hover:bg-[color:var(--on-media)]/20"
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </IconButton>
            </div>

            <h1 className="text-[1.75rem] font-extrabold text-[color:var(--on-media-accent)]" dir="auto">
              {displayCategoryName}
            </h1>

            <div className="flex w-full max-w-[520px] flex-col items-center gap-2">
              <div className="flex w-full items-center justify-between px-1" aria-hidden="true">
                <span className="text-[0.8125rem] font-semibold text-[color:var(--on-media-accent)]">
                  {t(language, "reader.collectionPercentComplete", { percent: localizedReadingPercent })}
                </span>
                <span className="text-[0.75rem] font-bold text-[color:var(--on-media-accent)]">
                  {t(language, "reader.collectionCount", {
                    done: formatNumerals(readingProgressValue, language),
                    total: formatNumerals(azkar.length, language),
                  })}
                </span>
              </div>
              <ProgressBar
                value={readingProgressValue}
                max={azkar.length}
                height={8}
                trackColor="rgba(255,255,255,0.2)"
                fillColor="var(--on-media-accent)"
                direction={direction}
                aria-label={t(language, "reader.groupProgress")}
              />
              <h2
                className="w-full truncate text-start text-[0.875rem] font-extrabold text-[color:var(--on-media)]"
                dir="auto"
                title={readerZikrTitle}
              >
                {readerZikrTitle}
              </h2>
            </div>
          </div>

          {/* Wide-desktop card: reading content, side navigation, counter,
              and keyboard guidance. Page-level actions stay in the hero. */}
          <div
            className="relative mx-4 mb-4 mt-4 flex flex-1 min-h-0 flex-col overflow-hidden bg-transparent"
            data-testid="reader-card"
          >
            <div ref={readerMainRef} className="flex flex-1 min-h-0 flex-col justify-between select-none">
              <div className="relative flex min-h-0 flex-1">
                <div
                  ref={readingScrollRef}
                  role="region"
                  tabIndex={0}
                  aria-label={t(language, "reader.readingText")}
                  className={`h-full min-h-0 w-full overflow-y-auto ps-6 pe-7 py-4 outline-none focus-visible:outline-none focus:ring-0 [scrollbar-gutter:stable] ${
                    justCompleted ? "zikr-step-exit" : "zikr-step-enter"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={z.id}
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction === "rtl" ? -20 : 20 }}
                      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction === "rtl" ? 20 : -20 }}
                      transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: "easeOut" }}
                      className="mx-auto flex min-h-full max-w-[480px] w-full flex-col py-4"
                    >
                      <div
                        className={`my-auto w-full flex flex-col items-center justify-center ${justCompleted ? "zikr-step-exit" : "zikr-step-enter"}`}
                      >
                        {renderReadingContent()}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                {renderSideNavigation()}
              </div>

              <footer className="shrink-0 pb-3 pt-2">{renderCounterStack()}</footer>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <Header
              title={displayCategoryName}
              onBack={onBack}
              language={language}
              right={
                // Phone layout: Benefit and Share join the overflow control in
                // this single top row (the old bottom action bar is gone, and
                // with it the second row of chrome). All three share the
                // header's ghost icon-button treatment, so the row reads as one
                // set rather than a pill next to two icons.
                <div className="flex items-center gap-1" data-testid="reader-actions">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setHasOpenedBenefit(true);
                      setBenefitOpen(true);
                    }}
                    aria-haspopup="dialog"
                    className={READER_HEADER_ACTION_CLASS}
                    aria-label={t(language, "reader.referencesButton")}
                    title={t(language, "reader.referencesButton")}
                  >
                    <BookOpen size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleShare();
                    }}
                    disabled={isSharing}
                    aria-busy={isSharing || undefined}
                    onPointerEnter={() => void prepareZikrShareCardFonts()}
                    onFocus={() => void prepareZikrShareCardFonts()}
                    className={READER_HEADER_ACTION_CLASS}
                    aria-label={t(language, "reader.share")}
                    title={t(language, "reader.share")}
                  >
                    <Share2 size={20} />
                  </button>

                  <DropdownMenu dir={direction}>
                    <DropdownMenuTrigger aria-label={t(language, "reader.menu")} className={READER_HEADER_ACTION_CLASS}>
                      <MoreVertical size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[210px]">
                      {renderReaderMenuItems("mobile")}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />
          </div>

          <div className="shrink-0 px-5 pb-3 pt-2 reader-column" data-testid="reader-session-chrome">
            <div className="mb-2 flex items-center justify-between gap-3 text-[0.75rem] font-bold text-muted-foreground">
              <span>{t(language, "reader.collectionPercentComplete", { percent: localizedReadingPercent })}</span>
              <span>
                {t(language, "reader.collectionCount", {
                  done: formatNumerals(readingProgressValue, language),
                  total: formatNumerals(azkar.length, language),
                })}
              </span>
            </div>
            <ProgressBar
              value={readingProgressValue}
              max={azkar.length}
              height={6}
              trackColor="var(--card)"
              fillColor="var(--primary)"
              direction={direction}
              aria-label={t(language, "reader.groupProgress")}
            />
            <h2
              className="mt-2 block max-w-full truncate whitespace-nowrap text-start text-[0.875rem] font-extrabold text-foreground"
              dir="auto"
              title={readerZikrTitle}
            >
              {readerZikrTitle}
            </h2>
          </div>

          {/* Main Layout Area */}
          <div
            ref={readerMainRef}
            className="flex-1 flex flex-col min-h-0 justify-between select-none relative reader-column"
            data-testid="reader-card"
          >
            <div
              ref={readingScrollRef}
              role="region"
              tabIndex={0}
              aria-label={t(language, "reader.readingText")}
              className={`flex-1 overflow-y-auto min-h-0 w-full outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ${
                justCompleted ? "zikr-step-exit" : "zikr-step-enter"
              }`}
            >
              {/* Inner wrapper vertically centers short/medium Zikrs safely via my-auto; long Surahs start at top to scroll naturally */}
              <div className="flex min-h-full w-full flex-col py-4">
                <div
                  key={z.id}
                  className={`my-auto w-full flex flex-col items-center justify-center ${justCompleted ? "zikr-step-exit" : "zikr-step-enter"}`}
                >
                  {renderReadingContent()}
                </div>
              </div>
            </div>

            {/* The screen sets !pb-0 and the tab bar is hidden here, so the
                counter itself owns the bottom inset — otherwise it would sit
                flush against the home indicator. */}
            <div className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">{renderCounterStack()}</div>
          </div>
        </>
      )}

      {hasOpenedBenefit && (
        <ReaderReferenceSheet
          open={benefitOpen}
          zikr={z}
          language={language}
          direction={direction}
          onClose={closeReference}
          onAnnouncement={setShareMessage}
        />
      )}
      <QuranWordMeaningSheet
        meanings={selectedWordMeanings}
        language={language}
        direction={direction}
        onClose={() => setSelectedWordMeanings(null)}
      />
    </ScreenContainer>
  );
}
