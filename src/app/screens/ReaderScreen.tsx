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
import type { AppLanguage, CategoryId, RoutineMode, MushafTextScale, TextSizeOption, ThemeMode, Zikr } from "../types";
import { isPrayerName } from "../content/prayerTimes";
import { ProgressBar } from "../components/ProgressBar";
import { CounterShortcutHints, ZikrCounterSurface } from "../components/ZikrComponents";
import { ToggleTrack } from "../components/SettingsRow";
import { ReaderReferenceSheet } from "../components/ReaderReferenceSheet";
import { IconButton } from "../components/LayoutShells";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { prepareZikrShareCardFonts, shareZikrCard, type ZikrShareCardStatus } from "../share/zikrShareCard";
import { CountingRipples, useCountingSurface } from "../components/countingSurface";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import { QuranPrelude, QuranSurahHeader } from "../components/QuranChrome";
import { QuranWordText } from "../components/QuranWordText";
import { MushafImmersiveReader, type MushafSurahSettings } from "../components/MushafImmersiveReader";
import { QuranWordMeaningSheet } from "../components/QuranWordMeaningSheet";
import { QuranWordPopover } from "../components/QuranWordPopover";
import { getQuranWordMeanings, type WordMeaningSelection } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { getReadingFontSize } from "./readingTypography";

/**
 * Same three steps, same labels and same order as Settings → Accessibility →
 * Text size, because both controls write the one `textSize` setting. If these
 * drift apart the reader and Settings start describing the same value
 * differently.
 */
const READER_TEXT_SIZE_OPTIONS: ReadonlyArray<{
  value: TextSizeOption;
  labelKey: string;
  sampleClass: string;
}> = [
  { value: "small", labelKey: "settings.textSmall", sampleClass: "text-[0.75rem]" },
  { value: "medium", labelKey: "settings.medium", sampleClass: "text-[0.9375rem]" },
  { value: "large", labelKey: "settings.textLarge", sampleClass: "text-[1.125rem]" },
];

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

/**
 * The heading above the reading canvas, or null when there is nothing worth
 * saying there.
 *
 * This used to fall back to the zikr's own first clause, which meant that for
 * a short dhikr the heading was a verbatim copy of the text directly beneath
 * it — the same words twice, once as a label for itself. The other fallback,
 * the category name, simply repeated the header title. Neither told the reader
 * anything, and both cost vertical space above the canvas and an extra stop in
 * the screen-reader running order.
 *
 * A real surah name is different: it names a passage the text itself does not,
 * so it is the only case that earns the heading.
 */
function getReaderZikrTitle(zikr: Zikr, language: AppLanguage): string | null {
  const surahName = language === "ar" ? zikr.surahNameArabic : zikr.surahNameEnglish;
  if (!surahName?.trim()) return null;
  /* A surah is named "سورة الكهف", not "الكهف". The bare name reads as a noun
     dropped into the layout; the prefix is part of how the passage is referred
     to, and the reference chip elsewhere already writes it that way. */
  return language === "ar" ? `سورة ${surahName.trim()}` : `Surah ${surahName.trim()}`;
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

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
  onTextSizeChange,
  savedZikrIds,
  onBack,
  onComplete,
  onUncomplete,
  onAdvance,
  onNext,
  onPrev,
  onToggleSaved,
  audioAvailable,
  mushafTextScale = "medium",
  mushafBookmarks = [],
  onToggleMushafBookmark,
  mushafSettings,
  onMushafModeChange,
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
  onTextSizeChange: (value: TextSizeOption) => void;
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
  /** Passed to the immersive Mushaf so it matches the Mushaf proper. */
  mushafTextScale?: MushafTextScale;
  mushafBookmarks?: readonly number[];
  onToggleMushafBookmark?: (page: number) => void;
  mushafSettings?: MushafSurahSettings;
  /** Announces when the Mushaf is the reader's body, so the shell can stand aside. */
  onMushafModeChange?: (showing: boolean) => void;
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
  /** A surah short enough to be read here rather than in the Mushaf view. */
  const showSurahChrome = Boolean(z?.isSurah) && !longSurah;
  const [immersiveOpen, setImmersiveOpen] = useState(false);
  /**
   * Which zikr the Mushaf view was opened for, so closing it stays closed.
   *
   * A multi-page surah is page data — Al-Kahf, As-Sajdah and Al-Mulk are laid
   * out as Mushaf pages and read as Mushaf pages. Opening them as a scroll of
   * running text and hiding the real view behind a menu item meant most readers
   * never saw it. It now opens that way by default, and a reader who leaves it
   * gets their choice honoured until they move to a different zikr.
   */
  const autoOpenedFor = useRef<string | null>(null);
  /**
   * The Mushaf position, held here rather than inside the view.
   *
   * That view is mounted only while it is open, so closing it on page four and
   * reopening put the reader back on page one — the clearest symptom of the two
   * being separate screens rather than one screen in two modes.
   */
  const [mushafPageTuple, setMushafPageTuple] = useState<readonly [number, number]>([0, 1]);
  /** The surah is being read as Mushaf pages, so the Mushaf is the body. */
  const showMushaf = immersiveOpen && longSurah;

  useEffect(() => {
    onMushafModeChange?.(showMushaf);
    // Leaving the reader gives the shell its navigation back, however the
    // reader was left.
    return () => onMushafModeChange?.(false);
  }, [onMushafModeChange, showMushaf]);
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [hasOpenedBenefit, setHasOpenedBenefit] = useState(false);
  const [showDifficultWords, setShowDifficultWords] = useState(true);
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [wordMeaningSelection, setWordMeaningSelection] = useState<WordMeaningSelection | null>(null);
  /* The popover answers the tap; the sheet is the deliberate "all meanings"
     step, so the same selection drives both and only this flag differs. */
  const [wordSheetOpen, setWordSheetOpen] = useState(false);
  const activeWordId = wordSheetOpen
    ? null
    : (wordMeaningSelection?.groups[wordMeaningSelection.index]?.[0]?.id ?? null);
  const closeReference = useCallback(() => setBenefitOpen(false), []);
  const { soundEnabled, toggleSound, playClickFeedback } = useCounterClickFeedback();

  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readerMainRef = useRef<HTMLDivElement | null>(null);
  const readingScrollRef = useRef<HTMLDivElement | null>(null);

  // The hero band + card treatment now starts at the tablet breakpoint
  // (>=768px) rather than at the shell's "large" tier: tablets have the width
  // for the desktop reader, and running the phone layout there left a wide,
  // sparse column. Below 768px the phone layout takes over.
  const isDesktopReader = useMediaQuery("(min-width: 768px)");

  useWakeLock(true);

  const [undoResetState, setUndoResetState] = useState<{ count: number; wasDone: boolean } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    count,
    complete,
    justCompleted,
    readerAnnouncement,
    suppressTap,
    handleTap,
    handleSurfaceTap,
    handleReset,
    restoreCount,
  } = useZikrCounter({
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

  /* The press, the ripple and the tap all come from one shared definition, so
     counting a zikr feels the same here as it does in the Masbaha and on
     Friday. This screen had drifted to half the travel over twice the time,
     which on the surface people tap most read as nothing happening at all. */
  const {
    ripples: canvasRipples,
    dismissRipple,
    pressStyle,
    surfaceProps,
  } = useCountingSurface({
    onCount: handleSurfaceTap,
    // A long surah is read and scrolled rather than tapped, so its canvas must
    // not answer a tap it is not going to count.
    reduceMotion: reducedMotion || longSurah,
  });

  /**
   * "Reset counter" also clears a recorded completion, so an accidental tap on
   * the reader canvas is recoverable. Without this the count could be zeroed
   * while the zikr stayed marked done, and `isDone` restored it on remount.
   *
   * An Undo toast is shown temporarily to allow immediate recovery.
   */
  const handleResetCounter = useCallback(() => {
    if (count > 0 || isDone) {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoResetState({ count, wasDone: isDone });
      undoTimerRef.current = setTimeout(() => {
        setUndoResetState(null);
      }, 5000);
    }
    handleReset();
    if (isDone) {
      onUncomplete?.(idx);
    }
    // handleReset is stable for the life of the mounted zikr.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, idx, isDone, onUncomplete]);

  const handleUndoReset = useCallback(() => {
    if (!undoResetState) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    restoreCount(undoResetState.count);
    if (undoResetState.wasDone) {
      onComplete(idx);
    }
    setUndoResetState(null);
  }, [idx, onComplete, restoreCount, undoResetState]);

  const {
    onTouchStart: baseTouchStart,
    onTouchMove: baseTouchMove,
    onTouchEnd: baseTouchEnd,
    dragStyle,
  } = useSwipeGestures({
    direction,
    onNext,
    onPrev,
    suppressTap,
    reduceMotion: reducedMotion,
  });

  const onTouchStart = immersiveOpen ? undefined : baseTouchStart;
  const onTouchMove = immersiveOpen ? undefined : baseTouchMove;
  const onTouchEnd = immersiveOpen ? undefined : baseTouchEnd;

  useEffect(() => {
    return () => {
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setWordMeaningSelection(null);
  }, [z?.id]);

  useEffect(() => {
    const id = z?.id;
    if (!id) return;
    if (!longSurah) {
      autoOpenedFor.current = null;
      setImmersiveOpen(false);
      setMushafPageTuple([0, 1]);
      return;
    }
    // Once per zikr: reopening on every render would make the close button
    // useless, and reopening on a re-render would fight the reader.
    if (autoOpenedFor.current === id) return;
    autoOpenedFor.current = id;
    setMushafPageTuple([0, 1]);
    setImmersiveOpen(true);
  }, [longSurah, z?.id]);

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
    if (immersiveOpen) return;

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

      if (benefitOpen || wordMeaningSelection || immersiveOpen) {
        if (e.key === "Escape") {
          if (wordMeaningSelection) {
            setWordSheetOpen(false);
            setWordMeaningSelection(null);
          } else if (benefitOpen) setBenefitOpen(false);
          else if (immersiveOpen) setImmersiveOpen(false);
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
    wordMeaningSelection,
    longSurah,
    immersiveOpen,
  ]);

  if (!z || !category) {
    return null;
  }

  const counterInstruction = t(
    language,
    longSurah ? "reader.tapCounterWhenFinished" : isDesktopReader ? "reader.tapAnywhereDesktop" : "reader.tapAnywhere",
  );
  const allWordMeanings = getQuranWordMeanings(z);
  const wordMeanings = showDifficultWords ? allWordMeanings : [];
  const readingProgressValue = Math.min(collectionCompletedCount, azkar.length);
  const isSaved = savedZikrIds.has(z.id);
  // Shorter azkar read larger, long surahs stay at the size their Mushaf pages
  // were reviewed at, and nothing drops below the legibility floor. The table
  // and both guarantees live in readingTypography.ts, under test.
  const readingFontSize = getReadingFontSize({
    textSize,
    arabicLength: z.arabicText.length,
    longSurah,
  });
  const readingFontFamily = "var(--font-zikr)";
  const readingPercent = azkar.length > 0 ? Math.round((readingProgressValue / azkar.length) * 100) : 0;
  const readerZikrTitle = getReaderZikrTitle(z, language);
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
      {/* A short surah gets its identity back: which surah, where it was
          revealed, how many ayat — and the Mushaf's rule around the passage, so
          it stops reading as a paragraph of dua. Long surahs are excluded
          because they open the Mushaf view, which has the real page frame. */}
      {showSurahChrome && <QuranSurahHeader zikr={z} language={language} />}

      <div className={showSurahChrome ? "quran-passage w-full" : "contents"}>
        {z.isSurah && <QuranPrelude zikr={z} className="pointer-events-none mb-4" />}

        {wordMeanings.length > 0 ? (
          <QuranWordText
            text={displayArabicText}
            meanings={wordMeanings}
            language={language}
            style={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
            onSelectMeanings={setWordMeaningSelection}
            activeWordId={activeWordId}
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
      </div>

      {!isArabic && (showTranslation || showTransliteration) && (
        <div className="mt-5 space-y-4 border-t border-border pt-4 text-center">
          {/* No surah exception. `!z.surahNameArabic` hid the translation for
              every surah — Al-Kahf, As-Sajdah, Al-Mulk and the short ones —
              while the transliteration of the same verses rendered right below
              it. A reader who turned both on got the pronunciation of a surah
              and never its meaning, and the meaning was present and complete
              the whole time. The guard arrived in an unrelated commit and no
              decision records it; DEC-108 says the opposite, that the reader is
              where translation and transliteration live. */}
          {showTranslation && z.translation && (
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
      {z.repetitionCount !== 1 && (
        <p className="mt-3 text-center text-sm font-medium text-muted-foreground">{counterInstruction}</p>
      )}
    </div>
  );

  const renderKeyboardShortcutsHint = () => (
    <CounterShortcutHints
      language={language}
      direction={direction}
      testId="reader-keyboard-shortcuts"
      ariaLabel={t(language, "reader.keyboardShortcuts")}
      shortcuts={[
        /* Space only counts once the counter itself is focused in long-Surah
           mode (the reader canvas deliberately never counts a full Surah — see
           the counter-only contract in docs/DESIGN_SYSTEM.md), so the global
           shortcut does not apply and the hint would be misleading. */
        ...(longSurah ? [] : [{ keys: ["Space"], label: t(language, "reader.shortcutCount") }]),
        { keys: ["→", "←"], label: t(language, "reader.shortcutNavigate") },
        { keys: ["R"], label: t(language, "reader.shortcutReset") },
        { keys: ["Esc"], label: t(language, "reader.shortcutBack") },
      ]}
    />
  );

  const renderCounterStack = () => (
    <div data-testid="reader-counter-stack">
      {renderCounterPanel()}
      {/* A phone has no keys to show shortcuts for, and the row cost every
          reader 35px of the screen to serve the ones holding a keyboard. */}
      <div className="hidden md:block">{renderKeyboardShortcutsHint()}</div>
    </div>
  );

  const renderReaderMenuItems = (layout: "mobile" | "desktop") => (
    <>
      {/* Long surahs only: the immersive view pages a mushaf sideways, which
          means nothing for a zikr that fits on one screen. */}
      {longSurah && (
        <DropdownMenuItem
          onClick={() => setImmersiveOpen(true)}
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
        >
          <BookOpen size={18} />
          {t(language, "reader.immersiveOpen")}
        </DropdownMenuItem>
      )}

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

      {/* Reading size, in the reader rather than only three taps away in
          Settings — it is the one preference people reach for mid-session,
          when the text in front of them is the thing that is too small. It
          drives the same app-wide setting Settings does, so the two can never
          disagree; changing it here also resizes the app's chrome. */}
      <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[0.75rem] font-bold uppercase tracking-wide text-muted-foreground">
        {t(language, "settings.textSize")}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup value={textSize} onValueChange={(value) => onTextSizeChange(value as TextSizeOption)}>
        {READER_TEXT_SIZE_OPTIONS.map(({ value, labelKey, sampleClass }) => (
          <DropdownMenuRadioItem
            key={value}
            value={value}
            data-testid={`reader-text-size-${value}`}
            className="cursor-pointer rounded-xl py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-3">
              {/* The glyph previews the step; the word carries the meaning,
                  so size is never the only thing distinguishing the options. */}
              <span aria-hidden="true" className={`w-5 text-center font-bold leading-none ${sampleClass}`}>
                Aa
              </span>
              {t(language, labelKey)}
            </span>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>

      <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

      {/* Save, share and sound live here on every tier now, not just on
          phones: the header keeps two actions at most, so these three moved
          off the desktop hero toolbar into the same menu. */}
      <DropdownMenuItem
        onClick={handleToggleSaved}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
      >
        <Bookmark key={String(isSaved)} size={18} className={isSaved ? "favorite-pop fill-current" : ""} />
        {isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => void handleShare()}
        disabled={isSharing}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
      >
        <Share2 size={18} />
        {t(language, "reader.share")}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={toggleSound}
        data-testid={`reader-counter-sound-toggle-${layout}`}
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

  return (
    // The canvas delegates pointer clicks while its explicit reading and counter surfaces own keyboard activation.
    <ScreenContainer
      className="reader-swipe-surface relative !pb-0"
      data-testid="reader-screen"
      data-zikr-index={idx}
      data-zikr-id={z.id}
      data-counting-mode={longSurah ? "counter-only" : "canvas"}
      dir={direction}
      data-reader-category={catId}
      screenName={displayCategoryName}
      {...surfaceProps}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="sr-only" aria-live="polite">
        {shareMessage}
      </div>
      {/* While a surah is read as pages, the Mushaf is the reader's body — one
          screen rendering what is on it a second way, rather than a modal over
          a screen that is still there underneath. Its rail carries the chrome,
          so the reader does not also show a header of its own. */}
      {showMushaf && (
        <MushafImmersiveReader
          /* A surah gets its own instance. The view used to be torn down between
             zikr because it only opened from a menu; now that it stays open as
             the reader moves, the previous surah's resolved page and page index
             would carry into the next one — which showed As-Sajdah's page 415
             stacked on top of Al-Mulk's 562. */
          key={z.id}
          zikr={z}
          pageTuple={mushafPageTuple}
          setPageTuple={setMushafPageTuple}
          language={language}
          direction={direction}
          title={readerZikrTitle ?? displayCategoryName}
          theme={themeMode === "light" ? "light" : "midnight"}
          reducedMotion={reducedMotion}
          textScale={mushafTextScale}
          bookmarkedPages={mushafBookmarks}
          onTogglePageBookmark={onToggleMushafBookmark}
          mushafSettings={mushafSettings}
          onClose={() => setImmersiveOpen(false)}
          onComplete={() => {
            /**
             * Finishing the surah is the whole act: it records the reading and
             * moves to the next zikr, exactly as completing a count does.
             *
             * It used to close the Mushaf instead, which left the reader looking
             * at a counter for the surah they had just finished — a second
             * thing to press for something already done. There is one
             * completion for a surah, and it is reaching the end of it.
             */
            if (!isDone) onComplete(idx);
            onAdvance(idx);
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
        <CountingRipples ripples={canvasRipples} onDismiss={dismissRipple} />
      </div>
      {/* Polite, not assertive: this region carries counting progress (every
          tenth repetition, the halfway mark) and the completion message. None
          of that is urgent enough to cut off whatever the screen reader is
          already saying — which, in a reader, is usually the zikr itself.
          Matches ZikrShareButton, which reserves assertive for errors. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {readerAnnouncement}
      </div>

      {/* One body at a time. While the surah is showing its pages, the reader
          does not also render its own header, counter and text underneath —
          that duplication is what made the two feel like separate screens. */}
      {!showMushaf &&
        (isDesktopReader ? (
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
                background:
                  "radial-gradient(120% 140% at 50% 10%, rgba(232,180,32,0.18), transparent 60%), var(--brand-hero)",
              }}
            >
              <IconButton
                onClick={onBack}
                label={t(language, "common.back")}
                className="absolute start-4 top-4 border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] hover:bg-[color:var(--on-media)]/20"
              >
                <ArrowPrevious size={20} />
              </IconButton>

              {/* Two actions, the same two as on phones: Benefit, then the
                overflow menu. Save, share and sound used to sit out here as
                three more icons — five ghost circles competing with the
                collection name for the top of the reading screen. They are one
                tap away in the menu now, and the toolbar reads as a pair
                rather than a strip. Icon-only throughout; the Benefit tooltip
                previews the actual benefit text rather than repeating the
                button's own name. */}
              <div className="absolute end-4 top-4 flex items-center gap-2" data-testid="reader-hero-actions">
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

                <DropdownMenu dir={direction}>
                  <DropdownMenuTrigger
                    aria-label={t(language, "reader.menu")}
                    onPointerEnter={() => void prepareZikrShareCardFonts()}
                    onFocus={() => void prepareZikrShareCardFonts()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <MoreVertical size={18} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[210px]">
                    {renderReaderMenuItems("desktop")}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                {/* Only surah names reach here. This margin adds to the column's
                  gap-2 for 14px under the bar — comfortably past the 4px
                  minimum, which Arabic needs because harakat sit well above
                  the cap line and would otherwise crowd the track. */}
                {/* The way into Mushaf mode sits on the title's own line rather
                  than only inside the overflow menu: it belongs to this
                  passage, so it reads as part of naming it. */}
                {readerZikrTitle && (
                  <div className="mt-1.5 flex w-full items-center justify-between gap-3">
                    <h2
                      className="min-w-0 truncate text-start text-[0.875rem] font-extrabold leading-relaxed text-[color:var(--on-media)]"
                      dir="auto"
                      title={readerZikrTitle}
                      data-testid="reader-zikr-title"
                    >
                      {readerZikrTitle}
                    </h2>
                    <div className="flex shrink-0 items-center gap-3">
                      {z.isSurah && allWordMeanings.length > 0 && (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={showDifficultWords}
                          onClick={() => setShowDifficultWords((v) => !v)}
                          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color:var(--on-media)] rounded-full"
                          aria-label={t(language, "settings.showDifficultWords")}
                          title={t(language, "settings.showDifficultWords")}
                        >
                          <span className="text-[0.75rem] font-bold text-[color:var(--on-media)] hidden sm:inline">
                            {t(language, "settings.showDifficultWords")}
                          </span>
                          <ToggleTrack checked={showDifficultWords} />
                        </button>
                      )}
                      {longSurah && (
                        <button
                          type="button"
                          onClick={() => setImmersiveOpen(true)}
                          data-testid="reader-mushaf-button"
                          className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--on-media)]/25 px-3 text-[0.75rem] font-black text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        >
                          <BookOpen size={14} aria-hidden="true" />
                          {t(language, "reader.immersiveOpen")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
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
                        className="reading-measure mx-auto flex min-h-full w-full flex-col py-4"
                      >
                        {/* Three transforms, three layers. The entrance slide is
                          framer's on the element above, the drag follows the
                          thumb here, and the press scales below — all animating
                          `transform`, so sharing an element would mean one
                          silently overwriting another. */}
                        <div style={dragStyle} className="flex w-full flex-1 flex-col">
                          <div
                            style={pressStyle}
                            className={`my-auto w-full flex flex-col items-center justify-center ${justCompleted ? "zikr-step-exit" : "zikr-step-enter"}`}
                          >
                            {renderReadingContent()}
                          </div>
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
                  // Two actions at most: Benefit, then the overflow control.
                  // Share used to sit between them; at 320-390px a third 44px
                  // target was the difference between the collection name
                  // fitting and being truncated to "أذكار ال…", and share is not
                  // a per-zikr primary. Both share the header's ghost
                  // icon-button treatment so the row reads as one set.
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

                    <DropdownMenu dir={direction}>
                      {/* The share-card fonts used to be prefetched on the share
                        button's own hover/focus. That button is in the menu
                        now, so the trigger warms them instead — still ahead of
                        the click, one step earlier in the same gesture. */}
                      <DropdownMenuTrigger
                        aria-label={t(language, "reader.menu")}
                        className={READER_HEADER_ACTION_CLASS}
                        onPointerEnter={() => void prepareZikrShareCardFonts()}
                        onFocus={() => void prepareZikrShareCardFonts()}
                      >
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
              {/* See the desktop heading: only surah names render, and the 10px
                margin keeps harakat clear of the progress track. */}
              {readerZikrTitle && (
                <div className="mt-2.5 flex w-full items-center justify-between gap-3">
                  <h2
                    className="min-w-0 truncate whitespace-nowrap text-start text-[0.875rem] font-extrabold leading-relaxed text-foreground"
                    dir="auto"
                    title={readerZikrTitle}
                    data-testid="reader-zikr-title"
                  >
                    {readerZikrTitle}
                  </h2>
                  <div className="flex shrink-0 items-center gap-3">
                    {z.isSurah && allWordMeanings.length > 0 && (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showDifficultWords}
                        onClick={() => setShowDifficultWords((v) => !v)}
                        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring rounded-full"
                        aria-label={t(language, "settings.showDifficultWords")}
                        title={t(language, "settings.showDifficultWords")}
                      >
                        <span className="text-[0.75rem] font-bold text-muted-foreground hidden sm:inline">
                          {t(language, "settings.showDifficultWords")}
                        </span>
                        <ToggleTrack checked={showDifficultWords} />
                      </button>
                    )}
                    {longSurah && (
                      <button
                        type="button"
                        onClick={() => setImmersiveOpen(true)}
                        data-testid="reader-mushaf-button"
                        className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-[0.75rem] font-black text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      >
                        <BookOpen size={14} aria-hidden="true" />
                        {t(language, "reader.immersiveOpen")}
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                {/* The drag and the press apply here too. They used to hang off
                  the wide branch alone, so on a phone — where the swipe and the
                  tap are the only ways to drive the reader — the page followed
                  nothing and a tap to count moved nothing at all. */}
                <div style={dragStyle} className="flex min-h-full w-full flex-col py-4">
                  <div
                    key={z.id}
                    style={pressStyle}
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
        ))}

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
      <QuranWordPopover
        meanings={wordSheetOpen ? null : (wordMeaningSelection?.groups[wordMeaningSelection.index] ?? null)}
        anchorEl={wordMeaningSelection?.anchor ?? null}
        language={language}
        direction={direction}
        showSource
        onShowAll={() => setWordSheetOpen(true)}
        onClose={() => setWordMeaningSelection(null)}
      />

      <QuranWordMeaningSheet
        selection={wordSheetOpen ? wordMeaningSelection : null}
        language={language}
        direction={direction}
        onNavigate={(index) => setWordMeaningSelection((current) => (current ? { ...current, index } : current))}
        onClose={() => {
          setWordSheetOpen(false);
          setWordMeaningSelection(null);
        }}
      />
      {undoResetState && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-primary/40 bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur-md text-foreground transition-all duration-200"
          dir={direction}
        >
          <span className="text-[0.875rem] font-medium">{t(language, "reader.resetCounter")}</span>
          <button
            type="button"
            onClick={handleUndoReset}
            className="interactive-elem flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-primary/20 hover:bg-primary/30 px-3.5 py-2 text-[0.875rem] font-bold text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            {t(language, "common.undo")}
          </button>
        </div>
      )}
    </ScreenContainer>
  );
}
