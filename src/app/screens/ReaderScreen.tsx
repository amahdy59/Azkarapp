/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useZikrCounter } from "../hooks/useZikrCounter";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { useMediaQuery } from "../hooks/useMediaQuery";
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
import { scrollBehavior } from "../motionPreferences";
import { CATEGORIES } from "../content/categories";
import { getAzkarForMode } from "../content/azkar";
import { isLongSurah, splitMushafPages } from "../content/mushafPages";
import type { AppLanguage, CategoryId, RoutineMode, TextSizeOption, ThemeMode } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { ReaderReferenceSheet } from "../components/ReaderReferenceSheet";
import { IconButton } from "../components/LayoutShells";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { prepareZikrShareCardFonts, shareZikrCard, type ZikrShareCardStatus } from "../share/zikrShareCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import { QuranPrelude, QuranSurahHeader } from "../components/QuranChrome";
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
  idx,
  routineMode,
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
  idx: number;
  routineMode: RoutineMode;
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
  const azkar = getAzkarForMode(catId, routineMode);
  const z = azkar[idx];
  const category = CATEGORIES.find((item) => item.id === catId);
  const language: AppLanguage = isArabic ? "ar" : "en";
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
  const readingContentRef = useRef<HTMLDivElement | null>(null);
  const readingScrollRef = useRef<HTMLDivElement | null>(null);
  const [visibleMushafPage, setVisibleMushafPage] = useState<number | null>(null);

  // The hero band + card treatment now starts at the tablet breakpoint
  // (>=768px) rather than at the shell's "large" tier: tablets have the width
  // for the desktop reader, and running the phone layout there left a wide,
  // sparse column. Below 768px the phone layout takes over.
  const isDesktopReader = useMediaQuery("(min-width: 768px)");

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

  // Long-Surah reading-position tracking. Drives the floating "jump to
  // counter" affordance (task: sticky mini-counter) and lets it report which
  // Mushaf page is currently on screen (task: page-jump orientation) without
  // a second observer. Included isDesktopReader in the deps for the same
  // reason as the measurement effect above: swapping mobile/desktop trees
  // remounts the scroll container, and a stale observer would otherwise keep
  // watching a detached node.
  useEffect(() => {
    if (!longSurah) {
      setVisibleMushafPage(null);
      return;
    }
    const root = readingScrollRef.current;
    const content = readingContentRef.current;
    if (!root || !content) return;
    // jsdom (unit tests) and some older embedded webviews don't implement
    // IntersectionObserver; the jump pill simply stays hidden there rather
    // than throwing during mount.
    if (typeof IntersectionObserver === "undefined") return;

    const sections = Array.from(content.querySelectorAll<HTMLElement>("[data-mushaf-page]"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0]?.target;
        const page = top ? Number(top.getAttribute("data-mushaf-page")) : NaN;
        if (!Number.isNaN(page)) setVisibleMushafPage(page);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [longSurah, z?.id, isDesktopReader]);

  const handleToggleSaved = useCallback(() => {
    if (z) onToggleSaved(z.id);
  }, [z, onToggleSaved]);

  // Desktop & Tablet Keyboard Navigation (Space to count, Arrow keys for Zikr navigation, R to reset, Esc to return)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable ||
          activeEl.getAttribute("role") === "textbox")
      ) {
        return;
      }

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

  const counterInstruction = t(language, longSurah ? "reader.tapCounterWhenFinished" : "reader.tapAnywhere");
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
          categoryLabel: isArabic ? category.nameArabic : category.name,
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

  const mushafPages = longSurah ? splitMushafPages(displayArabicText, z.mushafPages ?? []) : [];
  const firstMushafPage = mushafPages[0]?.page ?? null;
  const lastMushafPage = mushafPages[mushafPages.length - 1]?.page ?? null;
  // Hidden on the first page (nothing to jump to yet) and on the last page
  // (the counter it points to is already close by, so the pill would just
  // sit on top of it).
  const showLongSurahJump =
    longSurah &&
    !complete &&
    visibleMushafPage !== null &&
    visibleMushafPage !== firstMushafPage &&
    visibleMushafPage !== lastMushafPage;

  const scrollToLongSurahCounter = () => {
    readingScrollRef.current
      ?.querySelector('[data-testid="long-surah-end-counter"]')
      ?.scrollIntoView({ behavior: scrollBehavior(reduceMotion), block: "center" });
  };

  const renderReadingContent = () => (
    <article
      ref={readingContentRef}
      className={`mt-1 w-full px-4 pb-2 pt-2 flex flex-col items-center justify-center text-center bg-transparent ${longSurah ? "" : "cursor-pointer touch-manipulation transition-colors hover:bg-muted/10 active:bg-muted/20 my-auto"}`}
    >
      <QuranSurahHeader zikr={z} language={language} sticky={longSurah} />
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
          />
        </div>
        <div className="md:hidden">{renderNavigationButton("next")}</div>
      </div>
      <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
        {isDesktopReader ? t(language, "reader.tapAnywhereDesktop") : t(language, "reader.tapAnywhere")}
      </p>
    </div>
  );

  const renderKeyboardShortcutsHint = () => (
    <div
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

  // Long Surahs can run a dozen Mushaf pages before the counter appears.
  // This floating pill reports the current page and jumps straight to the
  // counter, so the primary action is never more than one tap away.
  //
  // Positioned `absolute` against the reading pane (not `sticky` inside the
  // scroll flow), so it stays anchored to a fixed corner of the pane
  // regardless of scroll offset, never overlaps the centered word-help
  // targets or the counter itself, and — always mounted, only opacity
  // toggled — never causes a scroll-position jump when it appears. The
  // nearest `relative` ancestor differs per tree (the outer card on desktop,
  // the reader-column on mobile), so each call site supplies its own
  // container's positioning context; this just renders the pill itself.
  const renderLongSurahJumpFab = () =>
    longSurah && (
      <div
        className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex justify-end"
        aria-hidden={!showLongSurahJump}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            scrollToLongSurahCounter();
          }}
          tabIndex={showLongSurahJump ? 0 : -1}
          className={`pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2.5 text-[0.8125rem] font-bold text-foreground shadow-raised backdrop-blur transition-[opacity,transform] duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
            showLongSurahJump ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <BookOpen size={16} className="shrink-0 text-primary" />
          {visibleMushafPage !== null && (
            <span dir="auto">
              {t(language, "reader.mushafPage", { page: formatNumerals(visibleMushafPage, language) })}
            </span>
          )}
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span dir="auto">{t(language, "reader.jumpToCounter")}</span>
        </button>
      </div>
    );

  // Shared between the mobile header's overflow menu and the wide-desktop
  // card header's overflow menu so the two never drift apart.
  const renderReaderMenuItems = () => (
    <>
      <DropdownMenuItem
        disabled={idx === 0}
        onClick={onPrev}
        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5">
          {direction === "rtl" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>{t(language, "reader.prev")}</span>
        </div>
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled={idx === azkar.length - 1}
        onClick={onNext}
        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5">
          {direction === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          <span>{t(language, "reader.next")}</span>
        </div>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

      <DropdownMenuItem
        disabled={!audioAvailable}
        onClick={onPlayAudio}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
      >
        <Volume2 size={18} />
        {audioAvailable
          ? language === "ar"
            ? "تشغيل مرة واحدة"
            : "Play audio once"
          : language === "ar"
            ? "الصوت غير متاح"
            : "Audio unavailable"}
      </DropdownMenuItem>

      {onRepeatAudio && (
        <DropdownMenuItem
          onClick={onRepeatAudio}
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
        >
          <RotateCcw size={18} />
          {language === "ar" ? "تكرار العدد المحدد" : "Repeat prescribed count"}
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

      {/* The counter-sound toggle lives here on phones: the hero header owns
          it on tablet/desktop, and the phone header row is capped at three
          controls (Benefit, Share, More) to keep the title legible at 320px. */}
      <DropdownMenuItem
        onClick={toggleSound}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
      >
        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        {t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound")}
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={handleResetCounter}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
      >
        <RotateCcw size={18} />
        {t(language, "reader.resetCounter")}
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={handleToggleSaved}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
      >
        <Bookmark size={18} className={isSaved ? "fill-current text-primary" : ""} />
        {isSaved ? t(language, "reader.removeFromFavorites") : t(language, "reader.addToFavorites")}
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => void handleShare()}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
      >
        <Share2 size={18} />
        {t(language, "reader.share")}
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
      screenName={isArabic ? category.nameArabic : category.name}
      onClick={handleSurfaceTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="sr-only" aria-live="polite">
        {shareMessage}
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
                <DropdownMenuContent
                  align="end"
                  className="min-w-[210px] rounded-2xl p-1.5 shadow-xl border border-border bg-popover text-popover-foreground"
                  sideOffset={8}
                >
                  {renderReaderMenuItems()}
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
              {isArabic ? category.nameArabic : category.name}
            </h1>

            <div className="flex w-full max-w-[520px] flex-col items-center gap-2">
              <div className="flex w-full items-center justify-between px-1" aria-hidden="true">
                <span className="text-[0.8125rem] font-semibold text-[color:var(--on-media-accent)]">
                  {t(language, "reader.collectionPercentComplete", { percent: readingPercent })}
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
            </div>
          </div>

          {/* Wide-desktop card: reading content, side navigation, counter,
              and keyboard guidance. Page-level actions stay in the hero. */}
          <div
            className="relative mx-4 mb-4 mt-4 flex flex-1 min-h-0 flex-col overflow-hidden bg-transparent"
            data-testid="reader-card"
          >
            <div ref={readerMainRef} className="flex flex-1 min-h-0 flex-col justify-between select-none">
              <div
                ref={readingScrollRef}
                role="region"
                tabIndex={0}
                aria-label={isArabic ? "نص الذكر" : "Zikr reading text"}
                className={`relative flex-1 overflow-y-auto min-h-0 w-full ps-6 pe-7 pt-6 pb-2 outline-none [scrollbar-gutter:stable] ${
                  justCompleted ? "zikr-step-exit" : "zikr-step-enter"
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={z.id}
                    initial={{ opacity: 0, x: direction === "rtl" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction === "rtl" ? 20 : -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
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

              <footer className="shrink-0 pb-3 pt-2">{renderCounterStack()}</footer>
            </div>

            {renderSideNavigation()}
            {renderLongSurahJumpFab()}
          </div>
        </>
      ) : (
        <>
          <div>
            <Header
              title={isArabic ? category.nameArabic : category.name}
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
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[210px] rounded-2xl p-1.5 shadow-xl border border-border bg-popover text-popover-foreground"
                      sideOffset={8}
                    >
                      {renderReaderMenuItems()}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />
          </div>

          <div className="shrink-0 px-5 pb-3 pt-2 reader-column" data-testid="reader-session-chrome">
            <ProgressBar
              value={readingProgressValue}
              max={azkar.length}
              height={6}
              trackColor="var(--card)"
              fillColor="var(--primary)"
              direction={direction}
              aria-label={t(language, "reader.groupProgress")}
            />
          </div>

          {/* Main Layout Area */}
          <div
            ref={readerMainRef}
            className="flex-1 flex flex-col min-h-0 justify-between select-none relative reader-column"
            data-testid="reader-card"
          >
            {/* Long chapters keep their completion control after the final Mushaf page;
                ordinary adhkar retain the fixed counter below this scroll region. */}
            <div
              ref={readingScrollRef}
              role="region"
              tabIndex={0}
              aria-label={isArabic ? "نص الذكر" : "Zikr reading text"}
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

            {renderSideNavigation()}
            {renderLongSurahJumpFab()}
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
