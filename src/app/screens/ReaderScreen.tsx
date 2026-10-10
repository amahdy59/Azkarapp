/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import {
  lazy,
  Suspense,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "../../styles/animations/ZikrAnimations.css";
import "./ReaderScreen.css";
import { useZikrCounter } from "../hooks/useZikrCounter";
import { prefixZikrId } from "../progress";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useCollectionPanelSize } from "../hooks/useCollectionPanelSize";
import { CollectionPanelResizeHandle } from "../components/CollectionPanelResizeHandle";
import { SidePanel } from "../components/ResponsiveSheet";
import {
  ReaderOptionsContext,
  ReaderOptionsAction,
  ReaderOptionsDivider,
  ReaderOptionsSection,
} from "../components/ReaderOptions";
import { useWakeLock } from "../hooks/useWakeLock";
import { isCounterShortcutBlocked } from "../keyboardShortcuts";
import {
  BookOpen,
  ArrowPrevious,
  ShareExport,
  Lightbulb,
  MoreVertical,
  RotateCcw,
  List,
  Bookmark,
  ChevronPrevious,
  ChevronNext,
  Volume2,
  VolumeX,
  Check,
  ChevronDown,
  SlidersHorizontal,
  Headphones,
  PanelLeftIcon,
  Maximize,
  RefreshCw,
  Share2,
  Keyboard,
} from "../components/icons";
import { t } from "../i18n";
import { shouldReduceMotion, vibrateIfEnabled } from "../motionPreferences";
import { CATEGORIES } from "../content/categories";
import { getAzkarForMode, isRoutineCategory } from "../content/azkar";
import { isLongSurah } from "../content/mushafPages";
import type { AudioController } from "../audio/AudioProvider";
import type { AppLanguage, CategoryId, RoutineMode, MushafTextScale, TextSizeOption, ThemeMode, Zikr } from "../types";
import { isPrayerName } from "../content/prayerTimes";
import { ProgressBar } from "../components/ProgressBar";
import { CounterGuidance } from "../components/CounterGuidance";
import { CounterKeyboardHelp } from "../components/CounterKeyboardHelp";
import { ReaderFooterTools } from "../components/ReaderFooterTools";
import { DevotionalAction, DevotionalFooter } from "../components/DevotionalControls";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { ToggleTrack } from "../components/SettingsRow";
import { ReadingTextTransition } from "../components/ReadingTextTransition";
import { ReaderReferenceSheet } from "../components/ReaderReferenceSheet";
import { IconButton } from "../components/LayoutShells";
import { prepareZikrShareCardFonts } from "../share/zikrShareCard";
import { useCountingSurface } from "../components/countingSurface";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import { ReaderSceneArt } from "../components/ReaderSceneArt";
import { QuranPrelude, QuranSurahHeader } from "../components/QuranChrome";
import { QuranWordText } from "../components/QuranWordText";
import { QuranVerseText } from "../components/QuranVerseText";
import { QURAN_TEXT_STYLE, getQuranReadingSize } from "../quranTypography";
import {
  MushafImmersiveReader,
  type MushafSurahSettings,
  type SurahAudioControl,
} from "../components/MushafImmersiveReader";
import { QuranWordMeaningSheet } from "../components/QuranWordMeaningSheet";
import { QuranWordPopover } from "../components/QuranWordPopover";
import { getQuranWordMeanings, type WordMeaningSelection } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { AzkarListItem } from "../components/AzkarListItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../components/ui/dropdown-menu";
import { AzkarListLayout } from "../components/AzkarListLayout";
import { getReadingFontSize } from "./readingTypography";

/**
 * Same three steps, same labels and same order as Settings → Accessibility →
/** Shared ghost icon-button treatment for every control in the phone header row. */
const READER_HEADER_ACTION_CLASS =
  "flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40";

const READER_WIDE_HEADER_ACTION_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--on-media)]/20 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-on-media";

const READER_SIDEBAR_TOGGLE_CLASS =
  "flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card shadow-xs text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

const QURAN_CARD_IMAGE = `${import.meta.env.BASE_URL || "/"}assets/cards/wird-quran.jpg`;

const SharingPreview = lazy(() =>
  import("../components/CollectionShareModal").then((module) => ({ default: module.CollectionShareModal })),
);

const EMPTY_COMPLETED_ZIKR_IDS: ReadonlySet<string> = new Set();

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
 * A reviewed passage name identifies the reading without repeating its text.
 * Ayah Al-Kursi uses its concise UI name rather than the full surah label.
 */
function getReaderZikrTitle(zikr: Zikr, language: AppLanguage): string | null {
  if (zikr.canonicalKey === "quran-002-255") return t(language, "reader.ayahAlKursi");
  const surahName = language === "ar" ? zikr.surahNameArabic : zikr.surahNameEnglish;
  if (!surahName?.trim()) return null;
  /* A surah is named "سورة الكهف", not "الكهف". The bare name reads as a noun
     dropped into the layout; the prefix is part of how the passage is referred
     to, and the reference chip elsewhere already writes it that way. */
  return language === "ar" ? `سورة ${surahName.trim()}` : `Surah ${surahName.trim()}`;
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
  onViewAllAzkar,
  onComplete,
  onUncomplete,
  onRoutineModeChange,
  onReset,
  onRepeat,
  onAdvance: onAdvanceProp,
  onNext: onNextProp,
  onPrev: onPrevProp,
  onSelectZikr,
  completedZikrIds = EMPTY_COMPLETED_ZIKR_IDS,
  onToggleSaved,
  audioAvailable,
  surahAudio,
  mushafTextScale = "medium",
  mushafBookmarks = [],
  surahReadingPages,
  onSurahPageChange,
  onToggleMushafBookmark,
  mushafSettings,
  onMushafModeChange,
  onPlayAudio,
  englishAudioAvailable,
  onPlayEnglishAudio,
  onPlayAllAudio,
  audioCoverage,
  audioModeActive = false,
  partialZikrCounts,
  onPartialZikrCountChange,
  counterResetKey,
  audioPlayer,
  audioController,
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
  /** Opens the category list of all azkar in the current collection. */
  onViewAllAzkar?: () => void;
  onComplete: (idx: number) => void;
  /** Clears a recorded completion so an accidental tap is recoverable. */
  onUncomplete?: (idx: number) => void;
  onRoutineModeChange?: (mode: RoutineMode) => void;
  onReset?: () => void;
  onRepeat?: () => void;
  onAdvance: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
  /** Opens an existing item directly from the wide-screen collection navigator. */
  onSelectZikr?: (idx: number) => void;
  completedZikrIds?: ReadonlySet<string>;
  onToggleSaved: (zikrId: string) => void;
  audioAvailable: boolean;
  /**
   * The surah's own recitation, for the Mushaf's listen control. The reader
   * holds no playback state of its own — this reports the one controller's
   * status and toggles it, so the rail and the floating player stay in step.
   */
  surahAudio?: SurahAudioControl;
  /** Passed to the immersive Mushaf so it matches the Mushaf proper. */
  mushafTextScale?: MushafTextScale;
  mushafBookmarks?: readonly number[];
  /** The Mushaf page each multi-page surah was last left on, keyed by zikr id. */
  surahReadingPages?: Record<string, number>;
  /** Reports the page a surah is being read at, so it survives a restart. */
  onSurahPageChange?: (zikrId: string, page: number) => void;
  onToggleMushafBookmark?: (page: number) => void;
  mushafSettings?: MushafSurahSettings;
  /** Announces when the Mushaf is the reader's body, so the shell can stand aside. */
  onMushafModeChange?: (showing: boolean) => void;
  onPlayAudio?: () => void;
  /** A separate, explicitly labelled English translation recording. */
  englishAudioAvailable?: boolean;
  onPlayEnglishAudio?: () => void;
  onPlayAllAudio?: () => void;
  audioCoverage?: { available: number; unavailable: number; total: number };
  onRepeatAudio?: () => void;
  /** The shared player is currently responsible for this zikr's progress. */
  audioModeActive?: boolean;
  /** Persisted in-progress partial tallies, keyed by zikr id. */
  partialZikrCounts?: Record<string, number>;
  onPartialZikrCountChange?: (zikrId: string, count: number) => void;
  counterResetKey?: string;
  audioPlayer?: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  audioController?: AudioController | null;
}) {
  const vibrate = useCallback(
    (pattern: number | number[]) => vibrateIfEnabled(hapticFeedback, pattern),
    [hapticFeedback],
  );
  const onNext = useCallback(() => {
    onNextProp();
  }, [onNextProp]);
  const onPrev = useCallback(() => {
    onPrevProp();
  }, [onPrevProp]);
  const onAdvance = useCallback(
    (currentIndex: number) => {
      onAdvanceProp(currentIndex);
    },
    [onAdvanceProp],
  );
  const azkar = azkarList ?? getAzkarForMode(catId, routineMode);
  const z = azkar[idx];
  const category = CATEGORIES.find((item) => item.id === catId);
  const language: AppLanguage = isArabic ? "ar" : "en";
  const displayCategoryName =
    catId === "after_prayer" && isPrayerName(subCategory)
      ? isArabic
        ? `أذكار بعد ${t(language, `notifications.${subCategory}`)}`
        : `After ${t(language, `notifications.${subCategory}`)}`
      : `${category ? (isArabic ? category.nameArabic : category.name) : ""}`;
  const reducedMotion = shouldReduceMotion(reduceMotion);
  const longSurah = isLongSurah(z);
  /** A surah short enough to be read here rather than in the Mushaf view. */
  const showSurahChrome = Boolean(z?.isSurah) && !longSurah;
  const [immersiveOpen, setImmersiveOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarToggleRef = useRef<HTMLButtonElement>(null);
  const readerMenuRef = useRef<HTMLButtonElement>(null);
  const collectionMenuRequested = useRef(false);
  const collectionSelectionRequested = useRef(false);
  const [isCollectionDrawerOpen, setIsCollectionDrawerOpen] = useState(false);
  const [expandedNavigatorIds, setExpandedNavigatorIds] = useState<Set<string>>(() => new Set());
  const navigatorScrollTop = useRef(0);

  /**
   * The Mushaf position, held here rather than inside the view.
   *
   * That view is mounted only while it is open, so closing it on page four and
   * reopening put the reader back on page one — the clearest symptom of the two
   * being separate screens rather than one screen in two modes.
   */
  const [mushafPageTuple, setMushafPageTuple] = useState<readonly [number, number]>([0, 1]);
  /**
   * Read when a surah opens rather than depended on.
   *
   * The remembered page only decides where a surah is opened; taking it as an
   * effect dependency would make every page turn — each one writes the map
   * back — re-run the effect that opens the view.
   */
  const surahReadingPagesRef = useRef(surahReadingPages);
  surahReadingPagesRef.current = surahReadingPages;
  /** The surah is being read as Mushaf pages, so the Mushaf is the body. */
  const showMushaf = immersiveOpen && longSurah;

  useEffect(() => {
    onMushafModeChange?.(showMushaf);
    // Leaving the reader gives the shell its navigation back, however the
    // reader was left.
    return () => onMushafModeChange?.(false);
  }, [onMushafModeChange, showMushaf]);
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [footerToolsExpanded, setFooterToolsExpanded] = useState(true);
  const focusExitRef = useRef<HTMLButtonElement>(null);
  const focusRequestedRef = useRef(false);
  const previousFocusMode = useRef(false);
  const [hasOpenedBenefit, setHasOpenedBenefit] = useState(false);
  const [showDifficultWords, setShowDifficultWords] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [collectionShareOpen, setCollectionShareOpen] = useState(false);
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [wordMeaningSelection, setWordMeaningSelection] = useState<WordMeaningSelection | null>(null);
  /* The popover answers the tap; the sheet is the deliberate "all meanings"
     step, so the same selection drives both and only this flag differs. */
  const [wordSheetOpen, setWordSheetOpen] = useState(false);
  const activeWordId = wordSheetOpen
    ? null
    : (wordMeaningSelection?.groups[wordMeaningSelection.index]?.[0]?.id ?? null);
  const closeReference = useCallback(() => setBenefitOpen(false), []);
  const { soundEnabled, toggleSound, playClickFeedback } = useCounterClickFeedback();

  const readerMainRef = useRef<HTMLDivElement | null>(null);
  const readingScrollRef = useRef<HTMLDivElement | null>(null);
  const restoreReadingFocusOnAdvanceRef = useRef(false);
  const activeNavigatorItemRef = useRef<HTMLDivElement | null>(null);

  const onReaderMenuCloseAutoFocus = (event: Event) => {
    if (collectionMenuRequested.current) {
      event.preventDefault();
      collectionMenuRequested.current = false;
      return;
    }
    if (!focusRequestedRef.current) return;
    event.preventDefault();
    focusRequestedRef.current = false;
    focusExitRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!focusMode && !previousFocusMode.current) return;
    previousFocusMode.current = focusMode;
    // Run after the menu restores focus, so it cannot focus now-hidden chrome.
    const frame = requestAnimationFrame(() => {
      (focusMode ? focusExitRef.current : readingScrollRef.current)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusMode]);

  // The hero band + card treatment now starts at the tablet breakpoint
  // (>=768px) rather than at the shell's "large" tier: tablets have the width
  // for the desktop reader, and running the phone layout there left a wide,
  // sparse column. Below 768px the phone layout takes over.
  const isDesktopReader = useMediaQuery("(min-width: 768px)");
  const isWideReader = useMediaQuery("(min-width: 1200px)");
  const panelSize = useCollectionPanelSize(isDesktopReader && !focusMode);
  const canDockCollection = isWideReader && panelSize.canDock;
  const previousSidebarOpen = useRef(isSidebarOpen);
  const sidebarCloseRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (canDockCollection && previousSidebarOpen.current !== isSidebarOpen) {
      const target = isSidebarOpen ? sidebarCloseRef.current : sidebarToggleRef.current;
      target?.focus({ preventScroll: true });
    }
    previousSidebarOpen.current = isSidebarOpen;
  }, [canDockCollection, isSidebarOpen]);
  useEffect(() => {
    if (canDockCollection) setIsCollectionDrawerOpen(false);
  }, [canDockCollection]);
  const closeCollectionDrawer = () => {
    setIsCollectionDrawerOpen(false);
  };
  const collapseCollectionPanel = () => {
    if (canDockCollection) {
      setIsSidebarOpen(false);
    } else closeCollectionDrawer();
  };
  const toggleCollectionPanel = () => {
    if (canDockCollection) setIsSidebarOpen((open) => !open);
    else setIsCollectionDrawerOpen((open) => !open);
  };

  useWakeLock(true);

  const [undoResetState, setUndoResetState] = useState<{ count: number; wasDone: boolean } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * A finished surah starts again at its first page.
   *
   * The remembered place is where reading stopped mid-surah; once it is
   * complete that page is history, and being dropped at the last page of
   * Al-Kahf the next time it is opened would be worse than starting over.
   */
  const handleZikrCompletion = useCallback(
    (completedIdx: number) => {
      const firstPage = z?.mushafPages?.[0]?.page;
      if (longSurah && z && firstPage) onSurahPageChange?.(z.id, firstPage);
      setMushafPageTuple([0, 1]);
      if (!isDone) onComplete(completedIdx);
    },
    [isDone, longSurah, onComplete, onSurahPageChange, z],
  );

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
    onComplete: handleZikrCompletion,
    onAdvance,
    initialPartialCounts: Object.fromEntries(
      azkar.map((zikr) => [zikr.id, partialZikrCounts?.[prefixZikrId(catId, zikr.id, subCategory)] ?? 0]),
    ),
    onPartialCountChange: (id, count) => onPartialZikrCountChange?.(prefixZikrId(catId, id, subCategory), count),
    resetKey: `${counterResetKey}:${catId}:${subCategory ?? ""}`,
  });

  /* The press and the tap come from one shared definition, so counting a zikr
     feels the same here as it does in the Masbaha and on Friday. */
  const { pressStyle, surfaceProps } = useCountingSurface({
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
    setWordMeaningSelection(null);
  }, [z?.id]);

  useEffect(() => {
    const id = z?.id;
    if (!id) return;
    if (!longSurah) {
      setImmersiveOpen(false);
      setMushafPageTuple([0, 1]);
      return;
    }
    const firstPage = z?.mushafPages?.[0]?.page;
    // When revisiting a completed surah, it always starts from the beginning.
    if (isDone) {
      setMushafPageTuple([0, 1]);
      if (firstPage) onSurahPageChange?.(id, firstPage);
      return;
    }
    // Set the initial page for the long surah to where they left off
    const rememberedPage = surahReadingPagesRef.current?.[id];
    const rememberedIndex = rememberedPage
      ? (z?.mushafPages?.findIndex((entry) => entry.page === rememberedPage) ?? -1)
      : -1;
    setMushafPageTuple([rememberedIndex > 0 ? rememberedIndex : 0, 1]);
  }, [isDone, longSurah, onSurahPageChange, z?.id, z?.mushafPages]);

  /** Records the page being read mid-reading, so closing the app does not lose the place. */
  useEffect(() => {
    if (!longSurah || !z) return;
    if (isDone) return;
    const page = z.mushafPages?.[mushafPageTuple[0]]?.page;
    if (page) onSurahPageChange?.(z.id, page);
  }, [isDone, longSurah, mushafPageTuple, onSurahPageChange, z]);

  useLayoutEffect(() => {
    if (readingScrollRef.current) {
      readingScrollRef.current.scrollTop = 0;
      if (restoreReadingFocusOnAdvanceRef.current) {
        readingScrollRef.current.focus({ preventScroll: true });
        restoreReadingFocusOnAdvanceRef.current = false;
      }
    }
  }, [idx]);

  useEffect(() => {
    const activeItem = activeNavigatorItemRef.current;
    if (!activeItem || !(canDockCollection ? isSidebarOpen : isCollectionDrawerOpen)) return;
    activeItem.scrollIntoView?.({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
  }, [idx, reducedMotion, canDockCollection, isSidebarOpen, isCollectionDrawerOpen]);

  const handleToggleSaved = useCallback(() => {
    if (z) onToggleSaved(z.id);
  }, [z, onToggleSaved]);

  // Desktop & Tablet Keyboard Navigation (Space to count, Arrow keys for Zikr navigation, R to reset, Esc to return)
  useEffect(() => {
    if (immersiveOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode && !document.querySelector('[role="dialog"], [role="alertdialog"]')) {
        e.preventDefault();
        setFocusMode(false);
        return;
      }
      if (isCounterShortcutBlocked(e)) return;
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
        if (audioModeActive) return;
        if (longSurah) return;
        e.preventDefault();
        restoreReadingFocusOnAdvanceRef.current = document.activeElement === readingScrollRef.current;
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
        if (focusMode) setFocusMode(false);
        else onBack();
      } else if (e.key === "r" || e.key === "R" || e.key === "ق") {
        if (audioModeActive) return;
        e.preventDefault();
        handleResetCounter();
      } else if (e.key === "s" || e.key === "S" || e.key === "س") {
        e.preventDefault();
        handleToggleSaved();
      } else if (e.key === "b" || e.key === "B" || e.key === "ف") {
        e.preventDefault();
        setHasOpenedBenefit(true);
        setBenefitOpen(true);
      } else if ((e.key === "[" || e.key === "]" || e.key === "ج" || e.key === "د") && onSelectZikr) {
        e.preventDefault();
        if (canDockCollection) setIsSidebarOpen((prev) => !prev);
        else setIsCollectionDrawerOpen((prev) => !prev);
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
    onSelectZikr,
    handleTap,
    handleResetCounter,
    handleToggleSaved,
    benefitOpen,
    wordMeaningSelection,
    longSurah,
    immersiveOpen,
    audioModeActive,
    focusMode,
    canDockCollection,
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
  const isQuranicText = Boolean(z.quranText || z.isSurah || z.attributionType === "quranic_supplication");
  const readingFontSize = isQuranicText
    ? getQuranReadingSize(textSize)
    : getReadingFontSize({
        textSize,
        arabicLength: z.arabicText.length,
        longSurah,
        isSurah: isQuranicText,
      });
  const readingFontFamily = isQuranicText ? "var(--font-mushaf)" : "var(--font-zikr)";
  const readingPercent = azkar.length > 0 ? Math.round((readingProgressValue / azkar.length) * 100) : 0;
  const readerZikrTitle = getReaderZikrTitle(z, language);
  const localizedReadingPercent = formatNumerals(readingPercent, language);

  const handleShare = () => setShareOpen(true);

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
      className={`w-full px-4 flex flex-col items-center justify-center text-center bg-transparent ${longSurah ? "" : "cursor-pointer touch-manipulation transition-colors hover:bg-muted/10 active:bg-muted/20"}`}
    >
      {longSurah ? (
        <div
          className="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-4 pb-5 pt-2"
          data-testid="surah-reading-actions"
        >
          <figure className="relative mb-1 h-32 w-full overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 shadow-soft">
            <img
              src={QURAN_CARD_IMAGE}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center opacity-75"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3" aria-hidden="true">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-card/90 text-primary shadow-soft backdrop-blur-sm">
                <BookOpen size={22} />
              </span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              aria-label={t(language, "reader.shareCurrent")}
              data-testid="reader-surah-share-button"
              className="absolute end-2 top-2 flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <ShareExport size={20} aria-hidden="true" />
            </button>
          </figure>
          <button
            type="button"
            onClick={surahAudio?.onToggle ?? onPlayAudio}
            disabled={!audioAvailable}
            aria-busy={surahAudio?.status === "loading" || surahAudio?.status === "buffering"}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary/10 px-6 py-4 text-subtitle font-bold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          >
            <Volume2 size={20} />
            {t(language, "reader.listenToSurah")}
          </button>
          <button
            type="button"
            onClick={() => setImmersiveOpen(true)}
            data-testid="reader-mushaf-button"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-subtitle font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <BookOpen size={20} />
            {t(language, "reader.readFromMushaf")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isDone) handleZikrCompletion(idx);
              onAdvance(idx);
            }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-6 py-4 text-subtitle font-bold text-foreground transition-colors hover:bg-muted"
          >
            <Check size={20} />
            {t(language, "reader.readExternally")}
          </button>
          {renderBenefitDockButton(true)}
        </div>
      ) : (
        <>
          {/* Short surahs keep their canonical Quran identity and text, without a
              decorative card competing with the passage. Long surahs open in the
              Mushaf view instead. */}
          {showSurahChrome && <QuranSurahHeader zikr={z} language={language} />}

          <div
            className={showSurahChrome ? "w-full max-w-[42rem]" : "contents"}
            data-testid={showSurahChrome ? "canonical-surah-passage" : undefined}
          >
            {z.isSurah && <QuranPrelude zikr={z} className="pointer-events-none mb-4" />}

            {wordMeanings.length > 0 ? (
              <QuranWordText
                text={displayArabicText}
                meanings={wordMeanings}
                language={language}
                style={{
                  fontFamily: readingFontFamily,
                  fontSize: readingFontSize,
                  ...(isQuranicText ? QURAN_TEXT_STYLE : {}),
                }}
                onSelectMeanings={setWordMeaningSelection}
                activeWordId={activeWordId}
              />
            ) : (
              <p
                className={`zikr-text pointer-events-none text-center font-medium ${isQuranicText ? "leading-[1.7]" : "leading-[1.85]"} text-foreground`}
                data-testid="zikr-text"
                dir="rtl"
                lang="ar"
                style={{
                  fontFamily: readingFontFamily,
                  fontSize: readingFontSize,
                  ...(isQuranicText ? QURAN_TEXT_STYLE : {}),
                }}
              >
                {isQuranicText ? <QuranVerseText text={displayArabicText} language={language} /> : displayArabicText}
              </p>
            )}
          </div>

          {!isArabic && (showTranslation || showTransliteration) && (
            <div className="mt-5 space-y-4 border-t border-border pt-4 text-center">
              {showTranslation && z.translation && (
                <section aria-labelledby="reader-translation-title">
                  <h2 id="reader-translation-title" className="text-label font-bold text-muted-foreground text-center">
                    {t(language, "reader.translationLabel")}
                  </h2>
                  <p className="mt-1 text-base leading-7 text-foreground text-center" lang="en" dir="ltr">
                    {z.translation}
                  </p>
                </section>
              )}
              {showTransliteration && z.transliteration && (
                <section aria-labelledby="reader-transliteration-title">
                  <h2
                    id="reader-transliteration-title"
                    className="text-label font-bold text-muted-foreground text-center"
                  >
                    {t(language, "reader.transliterationLabel")}
                  </h2>
                  <p className="mt-1 text-base leading-7 text-foreground text-center" lang="en" dir="ltr">
                    {z.transliteration}
                  </p>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );

  const renderNavigationButton = (kind: "prev" | "next", inDock = false) => {
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
        className={
          inDock
            ? "flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-xl px-2 border border-border/60 bg-card text-foreground shadow-sm transition-all duration-fast hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            : "adaptive-counter-nav devotional-secondary-action flex min-h-12 min-w-11 min-[360px]:w-[88px] shrink-0 items-center justify-center min-[360px]:justify-between gap-1 rounded-xl px-2 border border-border/60 bg-card/90 backdrop-blur-xs text-foreground shadow-sm transition-all duration-fast hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        }
      >
        {isPrevious ? (
          <ChevronPrevious size={18} className="shrink-0" aria-hidden="true" />
        ) : (
          <ChevronNext size={18} className="order-2 shrink-0" aria-hidden="true" />
        )}
        {!inDock && (
          <span className="min-w-0 flex-1 hidden min-[360px]:inline text-center text-label font-semibold [overflow-wrap:anywhere]">
            {label}
          </span>
        )}
      </button>
    );
  };

  const renderSideNavigation = () => (
    <div
      className="pointer-events-none absolute inset-x-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-between md:flex"
      data-testid="reader-side-navigation"
    >
      <div className="pointer-events-auto">{renderNavigationButton("prev", false)}</div>
      <div className="pointer-events-auto">{renderNavigationButton("next", false)}</div>
    </div>
  );

  const toggleCompleteAll = (complete: boolean) => {
    if (!azkarList) return;
    azkarList.forEach((_, i) => {
      if (complete) {
        if (onComplete) onComplete(i);
      } else {
        if (onUncomplete) onUncomplete(i);
      }
    });
  };
  const renderCollectionNavigator = (drawer = false) => {
    if (focusMode) return null;
    if (!onSelectZikr) return null;
    const doneCount = collectionCompletedCount;
    const isFullyComplete = doneCount === (azkarList?.length ?? 0);

    return (
      <nav
        id="reader-collection-navigator"
        hidden={!drawer && !isSidebarOpen}
        aria-label={t(language, "reader.viewAllAzkar")}
        style={drawer ? undefined : { width: panelSize.width }}
        className={`h-full min-h-0 shrink-0 flex-col overflow-hidden bg-card ${drawer || isSidebarOpen ? "flex" : "hidden"}`}
        data-testid="reader-collection-navigator"
      >
        <div className="shrink-0 border-b border-border/60 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <List size={19} className="shrink-0 text-primary" aria-hidden="true" />
              <h2 className="min-w-0 break-words text-subtitle font-extrabold text-foreground">
                {t(language, "reader.viewAllAzkar")}
              </h2>
            </div>
            <button
              type="button"
              onClick={collapseCollectionPanel}
              aria-label={t(language, "reader.collapseSidebar")}
              title={t(language, "reader.collapseSidebar")}
              data-testid="reader-sidebar-close"
              ref={sidebarCloseRef}
              className={READER_SIDEBAR_TOGGLE_CLASS}
            >
              <PanelLeftIcon
                size={18}
                className={direction === "ltr" ? "-scale-x-100" : undefined}
                aria-hidden="true"
              />
            </button>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {t(language, "reader.progressSummary", {
              done: formatNumerals(readingProgressValue, language),
              total: formatNumerals(azkar.length, language),
            })}
          </p>
          <div className="mt-4 flex w-full flex-wrap items-center gap-2">
            {isRoutineCategory(catId) && onRoutineModeChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="routine-mode-filter"
                    className="flex min-h-[44px] flex-1 items-center justify-between rounded-lg border border-input bg-card px-3 text-start text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-muted-foreground" />
                      {routineMode === "complete" ? t(language, "category.complete") : t(language, "category.core")}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={direction === "rtl" ? "end" : "start"} className="w-48">
                  <DropdownMenuLabel>{t(language, "category.routineLength")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={routineMode}
                    onValueChange={(value) => onRoutineModeChange(value as RoutineMode)}
                  >
                    <DropdownMenuRadioItem value="complete">{t(language, "category.complete")}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="core">{t(language, "category.core")}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isFullyComplete && onRepeat ? (
              <button
                type="button"
                onClick={onRepeat}
                data-testid="reader-repeat-collection"
                className="interactive-elem flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-4 text-sm font-bold text-primary shadow-xs transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <RefreshCw size={16} className="shrink-0" aria-hidden="true" />
                <span>{t(language, "category.readAgain")}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleCompleteAll(!isFullyComplete)}
                className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  isFullyComplete
                    ? "border border-success/30 bg-success/15 text-success hover:bg-success/20 dark:text-success"
                    : "border border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                aria-label={
                  isFullyComplete ? t(language, "category.completedToggle") : t(language, "category.remainingToggle")
                }
              >
                <Check size={16} strokeWidth={isFullyComplete ? 3 : 2} />
                <span>{t(language, "category.completeAction")}</span>
              </button>
            )}

            {doneCount > 0 && onReset && (
              <button
                type="button"
                onClick={onReset}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-input bg-card px-3 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                aria-label={t(language, "category.resetProgress")}
                title={t(language, "category.resetProgress")}
              >
                <RotateCcw size={14} />
              </button>
            )}

            <button
              type="button"
              data-testid="reader-sidebar-share"
              onClick={() => setCollectionShareOpen(true)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-input bg-card px-3 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              aria-label={t(language, "shareStoryPack.actionButtonAria")}
              title={t(language, "shareStoryPack.actionButton")}
            >
              <Share2 size={16} aria-hidden="true" />
            </button>

            {onPlayAllAudio && (
              <button
                type="button"
                onClick={onPlayAllAudio}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 text-sm font-bold text-primary shadow-xs transition-[color,background-color,border-color,box-shadow,transform] hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring dark:text-primary"
                aria-label={t(language, "category.playAllAudio")}
                title={
                  audioCoverage
                    ? `${t(language, "category.playAllAudio")}: ${audioCoverage.available}/${audioCoverage.total}`
                    : t(language, "category.playAllAudio")
                }
              >
                <Volume2 size={16} />
                <span>{t(language, "category.playAll")}</span>
              </button>
            )}
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
          data-testid="reader-sidebar-scroll"
          ref={(element) => {
            if (element) element.scrollTop = navigatorScrollTop.current;
          }}
          onScroll={(event) => {
            navigatorScrollTop.current = event.currentTarget.scrollTop;
          }}
        >
          <AzkarListLayout
            azkar={azkar}
            completed={completedZikrIds}
            catId={catId}
            isMainRoutine={isRoutineCategory(catId)}
            routineMode={routineMode}
            language={language}
            renderZikrCard={({ z, index }, isCompleted) => {
              const active = index === idx;
              const itemLabel = `${t(language, "reader.title", {
                index: formatNumerals(index + 1, language),
                total: formatNumerals(azkar.length, language),
              })}${isCompleted ? `, ${t(language, "reader.completed")}` : ""}`;

              return (
                <AzkarListItem
                  key={z.id}
                  z={z}
                  index={index}
                  isCardCompleted={isCompleted}
                  language={language}
                  isArabic={isArabic}
                  direction={direction}
                  isActive={active}
                  activeRef={activeNavigatorItemRef}
                  expandedOverride={expandedNavigatorIds.has(z.id)}
                  onToggleExpand={() =>
                    setExpandedNavigatorIds((current) => {
                      const next = new Set(current);
                      if (next.has(z.id)) next.delete(z.id);
                      else next.add(z.id);
                      return next;
                    })
                  }
                  onClickText={(targetIndex) => {
                    onSelectZikr(targetIndex);
                    if (drawer) {
                      collectionSelectionRequested.current = true;
                      setIsCollectionDrawerOpen(false);
                    }
                  }}
                  ariaLabelOverride={itemLabel}
                />
              );
            }}
          />
        </div>
      </nav>
    );
  };

  const renderAudioDockButton = () => {
    return (
      <DevotionalAction
        type="button"
        active={audioModeActive}
        disabled={!audioAvailable && !englishAudioAvailable}
        aria-busy={surahAudio?.status === "loading" || surahAudio?.status === "buffering"}
        onClick={(e) => {
          e.stopPropagation();
          if (audioAvailable) onPlayAudio?.();
          else onPlayEnglishAudio?.();
        }}
        aria-label={
          audioModeActive
            ? t(language, "audioPlayer.openFullPlayer")
            : audioAvailable
              ? t(language, "reader.listenCurrent")
              : englishAudioAvailable
                ? t(language, "reader.playEnglishAudio")
                : t(language, "reader.arabicAudioUnavailable")
        }
        title={
          audioModeActive
            ? t(language, "audioPlayer.openFullPlayer")
            : audioAvailable
              ? t(language, "reader.listenCurrent")
              : englishAudioAvailable
                ? t(language, "reader.playEnglishAudio")
                : t(language, "reader.arabicAudioUnavailable")
        }
        data-testid="reader-audio-dock-button"
        className={`min-w-0 flex-1 ${audioModeActive ? "" : "shadow-sm"}`}
      >
        <Headphones size={20} className="shrink-0" aria-hidden="true" />
        <span className="min-w-0 text-label font-semibold [overflow-wrap:anywhere]">
          {t(language, "reader.menuAudio")}
        </span>
      </DevotionalAction>
    );
  };

  const renderBenefitDockButton = (fullWidth = false) => (
    <DevotionalAction
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        // Safari does not focus buttons on pointer activation. The sheet needs
        // a concrete return target when it closes.
        e.currentTarget.focus({ preventScroll: true });
        setHasOpenedBenefit(true);
        setBenefitOpen(true);
      }}
      aria-haspopup="dialog"
      aria-label={t(language, "reader.referencesButton")}
      title={t(language, "reader.referencesButton")}
      data-testid="reader-benefit-dock-button"
      className={fullWidth ? "w-full rounded-2xl px-6 py-4 shadow-sm" : "min-w-0 flex-1 shadow-sm"}
    >
      <Lightbulb size={20} aria-hidden="true" />
      <span className="min-w-0 text-label font-semibold [overflow-wrap:anywhere]">
        {t(language, "reader.referencesButton")}
      </span>
    </DevotionalAction>
  );

  const renderCounterPanel = () => (
    <div className="w-full pb-1" data-testid="counter-panel">
      <div className="adaptive-counter-row flex w-full items-stretch justify-center gap-2">
        <div className="flex">{renderNavigationButton("prev")}</div>
        <div className="flex min-w-0 flex-1 justify-center">
          <ZikrCounterSurface
            count={count}
            total={z.repetitionCount}
            complete={complete}
            justCompleted={justCompleted}
            onTap={handleTap}
            language={language}
            instructionText={counterInstruction}
            /* A full surah is counted only on this control, so its own face
               carries the mode instruction; anything else counts from the
               canvas, and the face states the action while reading guidance
               says where to tap. */
            actionLabel={longSurah ? counterInstruction : t(language, "reader.tapWhenFinished")}
            testId="counter-surface"
            reduceMotion={reduceMotion}
          />
        </div>
        <div className="flex">{renderNavigationButton("next")}</div>
      </div>
    </div>
  );

  const renderDock = () => {
    if (audioModeActive && audioPlayer) {
      const onClose = () => {
        setTimeout(() => {
          const target =
            document.querySelector<HTMLElement>('[data-testid="counter-surface"]') ??
            document.querySelector<HTMLElement>('[data-testid="reader-mushaf-button"]');
          target?.focus();
        }, 50);
      };
      const player =
        typeof audioPlayer === "function"
          ? audioPlayer(onClose)
          : isValidElement(audioPlayer) && typeof audioPlayer.type !== "string"
            ? cloneElement(audioPlayer as React.ReactElement<Record<string, unknown>>, { dockSlots: {}, onClose })
            : audioPlayer;
      return (
        <>
          {!longSurah && <DevotionalFooter>{renderBenefitDockButton()}</DevotionalFooter>}
          {player}
        </>
      );
    }

    if (audioModeActive) {
      return null;
    }

    if (longSurah) return null;

    return (
      <div data-testid="reader-counter-stack">
        <DevotionalFooter className="reader-session-footer">
          <ReaderFooterTools
            language={language}
            expanded={footerToolsExpanded}
            onToggle={() => setFooterToolsExpanded((expanded) => !expanded)}
            primary={renderCounterPanel()}
          >
            <div
              className="flex w-full flex-wrap items-center justify-center gap-2"
              data-testid="reader-support-actions"
            >
              {renderBenefitDockButton()}
              {renderAudioDockButton()}
              <DevotionalAction
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  // Safari pointer activation does not focus buttons by default;
                  // give the sharing dialog a concrete focus-return target.
                  event.currentTarget.focus({ preventScroll: true });
                  handleShare();
                }}
                aria-haspopup="dialog"
                aria-label={t(language, "reader.shareCurrent")}
                title={t(language, "reader.shareCurrent")}
                data-testid="reader-share-dock-button"
                className="min-w-[5rem] flex-1 shadow-sm"
              >
                <Share2 size={20} aria-hidden="true" />
                <span className="min-w-0 text-label font-semibold [overflow-wrap:anywhere]">
                  {t(language, "reader.shareAction")}
                </span>
              </DevotionalAction>
            </div>
          </ReaderFooterTools>
        </DevotionalFooter>
        <CounterGuidance
          language={language}
          direction={direction}
          reader
          hasStarted={count > 0}
          placement="below"
          showKeyboardHelp={false}
        />
      </div>
    );
  };

  const renderAppearanceMenu = (triggerClass: string) => (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger
        data-testid="reader-settings-button"
        aria-label={t(language, "appearance.title")}
        className={triggerClass}
      >
        <span className="text-sm font-bold tracking-tight" aria-hidden="true">
          Aa
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        data-testid="reader-appearance-menu"
        style={{ width: "max-content", minWidth: "12rem", maxWidth: "calc(100vw - 16px)" }}
      >
        <DropdownMenuLabel>{t(language, "settings.textSize")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={textSize}
          onValueChange={(value) => onTextSizeChange(value as TextSizeOption)}
          aria-label={t(language, "settings.textSize")}
        >
          {(["small", "medium", "large"] as const).map((size) => (
            <DropdownMenuRadioItem
              key={size}
              value={size}
              onSelect={(event) => event.preventDefault()}
              data-testid={`reader-display-text-size-${size}`}
            >
              {t(
                language,
                size === "small" ? "settings.textSmall" : size === "large" ? "settings.textLarge" : "settings.medium",
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {isRoutineCategory(catId) && onRoutineModeChange && (
          <>
            <ReaderOptionsDivider />
            <DropdownMenuLabel>{t(language, "reader.collectionMode")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={routineMode}
              onValueChange={(value) => onRoutineModeChange(value as RoutineMode)}
              aria-label={t(language, "reader.collectionMode")}
            >
              <DropdownMenuRadioItem value="complete" onSelect={(event) => event.preventDefault()}>
                {t(language, "category.complete")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="core" onSelect={(event) => event.preventDefault()}>
                {t(language, "category.core")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderReaderMenuItems = (layout: "mobile" | "desktop") => {
    return (
      <ReaderOptionsContext.Provider value={{ sheet: false, close: () => {} }}>
        {!canDockCollection && onSelectZikr && azkar.length > 1 && (
          <ReaderOptionsAction
            onSelect={() => {
              collectionMenuRequested.current = true;
              setIsCollectionDrawerOpen(true);
            }}
          >
            <PanelLeftIcon size={16} className={direction === "ltr" ? "-scale-x-100" : undefined} aria-hidden="true" />
            <span>{t(language, "reader.expandSidebar")}</span>
          </ReaderOptionsAction>
        )}
        {/* 1. Primary immersion action: Focus Mode */}
        {!longSurah && (
          <>
            <div>
              <ReaderOptionsAction
                onClick={() => {
                  focusRequestedRef.current = true;
                  setFocusMode(true);
                }}
                data-testid="reader-focus-toggle"
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Maximize size={16} aria-hidden="true" />
                <span>{t(language, "reader.enterFocus")}</span>
              </ReaderOptionsAction>
            </div>
            <ReaderOptionsDivider className="my-1 h-px bg-border/60" />
          </>
        )}

        {/* 4. Saved state and reading recovery */}
        <div>
          <ReaderOptionsAction
            onClick={handleToggleSaved}
            className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Bookmark
              key={String(isSaved)}
              size={16}
              aria-hidden="true"
              className={isSaved ? "favorite-pop fill-current text-primary" : ""}
            />
            <span>{isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}</span>
          </ReaderOptionsAction>
        </div>
        {onRepeat && !longSurah && (
          <ReaderOptionsSection title={t(language, "reader.moreActions")}>
            <ReaderOptionsAction
              onClick={onRepeat}
              data-testid="reader-menu-repeat"
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <RefreshCw size={16} aria-hidden="true" />
              <span>{t(language, "category.readAgain")}</span>
            </ReaderOptionsAction>
          </ReaderOptionsSection>
        )}
        {!longSurah && (
          <>
            {/* 5. Counter feedback & recovery */}
            <ReaderOptionsSection title={t(language, "reader.counterSettings")}>
              <ReaderOptionsAction
                onClick={toggleSound}
                keepOpen
                data-testid={`reader-counter-sound-toggle-${layout}`}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {soundEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
                <span>{t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound")}</span>
              </ReaderOptionsAction>
              <ReaderOptionsAction
                onClick={handleResetCounter}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <RotateCcw size={16} aria-hidden="true" />
                <span>{t(language, "reader.resetCounter")}</span>
              </ReaderOptionsAction>
            </ReaderOptionsSection>
          </>
        )}

        <ReaderOptionsAction
          onClick={() => setKeyboardHelpOpen(true)}
          data-testid="reader-menu-keyboard-help"
          className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Keyboard size={16} aria-hidden="true" />
          <span>{t(language, "reader.keyboardShortcuts")}</span>
        </ReaderOptionsAction>
        {onReset && (
          <>
            <ReaderOptionsDivider className="my-1 h-px bg-border/60" />
            <ReaderOptionsAction
              onClick={onReset}
              data-testid="reader-menu-reset-collection"
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>{t(language, "category.resetProgress")}</span>
            </ReaderOptionsAction>
          </>
        )}

        <ReaderOptionsDivider className="my-1 h-px bg-border/60" />

        {/* 6. Collection Navigation */}
        <div>
          <ReaderOptionsAction
            onClick={onViewAllAzkar ?? onBack}
            data-testid="reader-view-all-azkar"
            className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <List size={16} aria-hidden="true" />
            <span>{t(language, "reader.viewAllAzkar")}</span>
          </ReaderOptionsAction>
        </div>
      </ReaderOptionsContext.Provider>
    );
  };

  return (
    // The canvas delegates pointer clicks while its explicit reading and counter surfaces own keyboard activation.
    <ScreenContainer
      /* The Mushaf is the whole screen: no gutter above the paper and none
         below it. The reader kept the screen's own 8px top inset in Mushaf mode,
         which pushed the page down and left a strip of shell above a surface
         that is supposed to be the page itself. */
      edgeToEdge={showMushaf}
      className={`reader-swipe-surface relative !pb-0 sm:!pt-0 ${showMushaf ? "overflow-hidden" : ""}`}
      data-testid="reader-screen"
      data-zikr-index={idx}
      data-zikr-id={z.id}
      data-counting-mode={longSurah ? "counter-only" : "canvas"}
      data-reader-layout={isDesktopReader ? "desktop" : "mobile"}
      dir={direction}
      data-reader-category={catId}
      data-reading-focus={focusMode && !showMushaf ? "true" : "false"}
      screenName={displayCategoryName}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {focusMode && !showMushaf && (
        <div
          className="flex shrink-0 items-center justify-end px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
          data-prevent-count="true"
        >
          <h1 className="sr-only">{displayCategoryName}</h1>
          <button
            ref={focusExitRef}
            type="button"
            onClick={() => setFocusMode(false)}
            className="min-h-11 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {t(language, "reader.exitFocus")}
          </button>
        </div>
      )}
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
          hapticFeedback={hapticFeedback}
          textScale={mushafTextScale}
          bookmarkedPages={mushafBookmarks}
          onTogglePageBookmark={onToggleMushafBookmark}
          mushafSettings={mushafSettings}
          surahAudio={surahAudio}
          audioController={audioController}
          benefitAction={renderBenefitDockButton()}
          onClose={() => setImmersiveOpen(false)}
          onReadExternally={() => {
            if (!isDone) handleZikrCompletion(idx);
            onAdvance(idx);
          }}
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
            handleZikrCompletion(idx);
            onAdvance(idx);
          }}
        />
      )}

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
          <div
            ref={panelSize.workspaceRef}
            data-testid="reader-workspace"
            className="flex h-full w-full min-h-0 flex-1 overflow-hidden"
            dir={direction}
          >
            {/* Reading Canvas Column (flex-1): Hero + Reading Card + Counter */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {/* Wide-desktop hero band (>=1200px). Fixed navy brand surface,
                independent of the active theme — mirrors the Home screen's
                .azkar-hero background (src/app/components/azkar-hero-background.css)
                rather than following light/dark/midnight tokens, since it plays
                the same "always-dark brand band" role. */}
              <div
                data-testid="reader-desktop-hero"
                data-reading-chrome
                className="relative isolate w-full flex shrink-0 flex-col items-center overflow-hidden rounded-b-2xl px-6 pb-2.5 pt-2 text-center"
                style={{
                  gap: "0.375rem",
                  background:
                    "radial-gradient(120% 140% at 50% 10%, rgba(232,180,32,0.18), transparent 60%), var(--brand-hero)",
                }}
              >
                <ReaderSceneArt category={catId} />
                <div
                  className="relative z-10 flex w-full items-center justify-between gap-3"
                  data-testid="reader-header-toolbar"
                >
                  <IconButton
                    onClick={onBack}
                    label={t(language, "common.back")}
                    className={READER_WIDE_HEADER_ACTION_CLASS}
                  >
                    <ArrowPrevious size={20} />
                  </IconButton>

                  {/* Hero actions: appearance and contextual actions. */}
                  <div className="flex flex-wrap items-center justify-end gap-2" data-testid="reader-hero-actions">
                    <button
                      type="button"
                      data-testid="reader-help-trigger"
                      aria-label={t(language, "reader.keyboardShortcuts")}
                      title={t(language, "reader.keyboardShortcuts")}
                      aria-expanded={keyboardHelpOpen}
                      className={READER_WIDE_HEADER_ACTION_CLASS}
                      onClick={(event) => {
                        event.currentTarget.focus({ preventScroll: true });
                        setKeyboardHelpOpen((prev) => !prev);
                      }}
                    >
                      <Keyboard size={20} aria-hidden="true" />
                    </button>
                    {renderAppearanceMenu(READER_WIDE_HEADER_ACTION_CLASS)}
                    <DropdownMenu dir={direction}>
                      <DropdownMenuTrigger
                        ref={readerMenuRef}
                        aria-label={t(language, "reader.menu")}
                        onPointerEnter={() => void prepareZikrShareCardFonts()}
                        onFocus={() => void prepareZikrShareCardFonts()}
                        className={READER_WIDE_HEADER_ACTION_CLASS}
                      >
                        <MoreVertical size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        style={{ width: "max-content", maxWidth: "calc(100vw - 16px)" }}
                        onCloseAutoFocus={onReaderMenuCloseAutoFocus}
                      >
                        {renderReaderMenuItems("desktop")}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                      type="button"
                      hidden={canDockCollection && isSidebarOpen}
                      onClick={toggleCollectionPanel}
                      aria-expanded={canDockCollection ? isSidebarOpen : isCollectionDrawerOpen}
                      aria-controls="reader-collection-navigator"
                      aria-label={
                        (canDockCollection ? isSidebarOpen : isCollectionDrawerOpen)
                          ? t(language, "reader.collapseSidebar")
                          : t(language, "reader.expandSidebar")
                      }
                      title={
                        (canDockCollection ? isSidebarOpen : isCollectionDrawerOpen)
                          ? t(language, "reader.collapseSidebar")
                          : t(language, "reader.expandSidebar")
                      }
                      data-testid="reader-sidebar-toggle"
                      ref={sidebarToggleRef}
                      className={`${READER_SIDEBAR_TOGGLE_CLASS} ${canDockCollection && isSidebarOpen ? "hidden" : ""}`}
                    >
                      <PanelLeftIcon
                        size={18}
                        className={direction === "ltr" ? "-scale-x-100" : undefined}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                <h1
                  className="relative z-10 w-full break-words text-lg md:text-xl font-extrabold leading-tight text-on-media-accent drop-shadow-sm"
                  dir="auto"
                >
                  {displayCategoryName}
                </h1>

                <div className="relative z-10 flex w-full flex-col items-center gap-1" style={{ maxWidth: 480 }}>
                  <div className="flex w-full items-center justify-between px-1 leading-none" aria-hidden="true">
                    <span className="text-xs font-semibold text-on-media-muted">
                      {t(language, "reader.collectionPercentComplete", { percent: localizedReadingPercent })}
                    </span>
                    <span className="text-xs font-bold text-on-media-muted">
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
              <div className="reader-canvas-wrap relative mx-3 my-2 md:mx-4 md:my-2 flex min-h-0 flex-1 overflow-hidden bg-transparent">
                <div
                  className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden cursor-pointer"
                  data-testid="reader-card"
                  {...surfaceProps}
                >
                  {((!showSurahChrome && readerZikrTitle) || (!longSurah && allWordMeanings.length > 0)) && (
                    <div
                      data-testid="reader-entry-tools"
                      data-prevent-count="true"
                      className="reader-entry-tools--wide shrink-0 pt-1 pb-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1"
                    >
                      {!showSurahChrome && readerZikrTitle && (
                        <h2
                          className="max-w-full shrink-0 truncate text-start text-sm font-extrabold leading-relaxed text-foreground"
                          dir="auto"
                          title={readerZikrTitle}
                          data-testid="reader-zikr-title"
                        >
                          {readerZikrTitle}
                        </h2>
                      )}
                      {!longSurah && allWordMeanings.length > 0 && (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={showDifficultWords}
                          onClick={() => setShowDifficultWords((v) => !v)}
                          className="ms-auto flex shrink-0 min-h-11 items-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring rounded-full py-1"
                          aria-label={t(language, "settings.showDifficultWords")}
                          title={t(language, "settings.showDifficultWords")}
                        >
                          <span className="text-xs font-medium text-muted-foreground">
                            {t(language, "settings.showDifficultWords")}
                          </span>
                          <ToggleTrack checked={showDifficultWords} />
                        </button>
                      )}
                    </div>
                  )}
                  <div ref={readerMainRef} className="flex flex-1 min-h-0 flex-col justify-between select-none">
                    <div className="relative flex min-h-0 flex-1">
                      <div
                        ref={readingScrollRef}
                        role="region"
                        tabIndex={0}
                        aria-label={t(language, "reader.readingText")}
                        className={`reader-text-scroll h-full min-h-0 w-full overflow-y-auto ${longSurah ? "px-28" : "px-4 md:px-6"} py-2 outline-none focus-visible:outline-none focus:ring-0 [scrollbar-gutter:stable both-edges]`}
                      >
                        <div className="reading-measure mx-auto flex min-h-full w-full flex-col py-1">
                          <div style={dragStyle} className="flex w-full flex-1 flex-col">
                            <ReadingTextTransition
                              entryId={z.id}
                              index={idx}
                              direction={direction}
                              reduceMotion={reducedMotion || longSurah}
                              className={`${longSurah ? "mb-auto mt-2" : "my-auto"} w-full`}
                            >
                              <div
                                style={pressStyle}
                                className={`flex w-full flex-col items-center justify-center ${justCompleted ? "zikr-step-exit" : ""}`}
                              >
                                {renderReadingContent()}
                              </div>
                            </ReadingTextTransition>
                          </div>
                        </div>
                      </div>
                      {longSurah && renderSideNavigation()}
                    </div>

                    {!longSurah && !audioModeActive && (
                      <CounterGuidance
                        language={language}
                        direction={direction}
                        reader
                        hasStarted={count > 0}
                        placement="above"
                        showKeyboardHelp={false}
                      />
                    )}
                    {<footer className={`shrink-0 pt-1.5 ${audioModeActive ? "pb-0" : "pb-2"}`}>{renderDock()}</footer>}
                    {!audioModeActive && typeof audioPlayer !== "function" && audioPlayer}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Full-Height All-Azkar Sidebar */}
            {canDockCollection && onSelectZikr && !focusMode && (
              <>
                {isSidebarOpen && (
                  <CollectionPanelResizeHandle
                    width={panelSize.width}
                    minimum={panelSize.minimum}
                    maximum={panelSize.maximum}
                    direction={direction}
                    language={language}
                    onResize={panelSize.setWidth}
                    onReset={panelSize.resetWidth}
                    onCollapse={collapseCollectionPanel}
                  />
                )}
                {renderCollectionNavigator()}
              </>
            )}
          </div>
        ) : (
          <>
            <div data-reading-chrome>
              <Header
                title={displayCategoryName}
                style={{ paddingInline: 12 }}
                titleStyle={{ lineHeight: 1.2 }}
                onBack={onBack}
                language={language}
                elevateOnScroll={false}
                decoration={<ReaderSceneArt category={catId} compact />}
                backButtonClassName={READER_HEADER_ACTION_CLASS}
                right={
                  // Two actions: appearance, then the overflow control.
                  // Share used to sit between them; at 320-390px a third 44px
                  // target was the difference between the collection name
                  // fitting and being truncated to "أذكار ال…", and share is not
                  // a per-zikr primary. Both share the header's ghost
                  // icon-button treatment so the row reads as one set.
                  <div className="flex items-center gap-1" data-testid="reader-actions">
                    <button
                      type="button"
                      data-testid="reader-help-trigger"
                      aria-label={t(language, "reader.keyboardShortcuts")}
                      title={t(language, "reader.keyboardShortcuts")}
                      aria-expanded={keyboardHelpOpen}
                      className={`${READER_HEADER_ACTION_CLASS} max-md:hidden`}
                      onClick={(event) => {
                        event.currentTarget.focus({ preventScroll: true });
                        setKeyboardHelpOpen((prev) => !prev);
                      }}
                    >
                      <Keyboard size={18} aria-hidden="true" />
                    </button>
                    {renderAppearanceMenu(READER_HEADER_ACTION_CLASS)}

                    <DropdownMenu dir={direction}>
                      {/* The share-card fonts used to be prefetched on the share
                        button's own hover/focus. That button is in the menu
                        now, so the trigger warms them instead — still ahead of
                        the click, one step earlier in the same gesture. */}
                      <DropdownMenuTrigger
                        ref={readerMenuRef}
                        aria-label={t(language, "reader.menu")}
                        className={READER_HEADER_ACTION_CLASS}
                        onPointerEnter={() => void prepareZikrShareCardFonts()}
                        onFocus={() => void prepareZikrShareCardFonts()}
                      >
                        <MoreVertical size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        style={{ width: "max-content", maxWidth: "calc(100vw - 16px)" }}
                        onCloseAutoFocus={onReaderMenuCloseAutoFocus}
                      >
                        {renderReaderMenuItems("mobile")}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                }
              />
            </div>

            <div
              data-reading-chrome
              className="shrink-0 px-5 pb-1.5 pt-1 reader-column"
              data-testid="reader-session-chrome"
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
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
                height={8}
                trackColor="var(--card)"
                fillColor="var(--primary)"
                direction={direction}
                aria-label={t(language, "reader.groupProgress")}
              />
            </div>

            {/* Main Layout Area */}
            <div
              ref={readerMainRef}
              className="flex-1 flex flex-col min-h-0 justify-between select-none relative reader-column cursor-pointer"
              data-testid="reader-card"
              {...surfaceProps}
            >
              {((!showSurahChrome && readerZikrTitle) || (!longSurah && allWordMeanings.length > 0)) && (
                <div
                  data-testid="reader-entry-tools"
                  data-prevent-count="true"
                  className="px-5 pt-2.5 flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1"
                >
                  {!showSurahChrome && readerZikrTitle && (
                    <h2
                      className="max-w-full shrink-0 truncate whitespace-nowrap text-start text-sm font-extrabold leading-relaxed text-foreground"
                      dir="auto"
                      title={readerZikrTitle}
                      data-testid="reader-zikr-title"
                    >
                      {readerZikrTitle}
                    </h2>
                  )}
                  {!longSurah && allWordMeanings.length > 0 && (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showDifficultWords}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDifficultWords((v) => !v);
                      }}
                      className="ms-auto flex shrink-0 min-h-11 items-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring rounded-full py-1"
                      aria-label={t(language, "settings.showDifficultWords")}
                      title={t(language, "settings.showDifficultWords")}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {t(language, "settings.showDifficultWords")}
                      </span>
                      <ToggleTrack checked={showDifficultWords} />
                    </button>
                  )}
                </div>
              )}
              <div
                ref={readingScrollRef}
                role="region"
                tabIndex={0}
                aria-label={t(language, "reader.readingText")}
                className="reader-text-scroll flex-1 overflow-y-auto min-h-0 w-full outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                style={{ minHeight: "min(8rem, 35dvh)" }}
              >
                {/* Inner wrapper vertically centers short/medium Zikrs safely via my-auto; long Surahs start at top to scroll naturally */}
                {/* The drag and the press apply here too. They used to hang off
                  the wide branch alone, so on a phone — where the swipe and the
                  tap are the only ways to drive the reader — the page followed
                  nothing and a tap to count moved nothing at all. */}
                <div style={dragStyle} className="flex min-h-full w-full flex-col py-2">
                  <ReadingTextTransition
                    entryId={z.id}
                    index={idx}
                    direction={direction}
                    reduceMotion={reducedMotion || longSurah}
                    className={`${longSurah ? "mb-auto mt-2" : "my-auto"} w-full`}
                  >
                    <div
                      style={pressStyle}
                      className={`flex w-full flex-col items-center justify-center ${justCompleted ? "zikr-step-exit" : ""}`}
                    >
                      {renderReadingContent()}
                    </div>
                  </ReadingTextTransition>
                </div>
              </div>

              {!longSurah && !audioModeActive && (
                <CounterGuidance
                  language={language}
                  direction={direction}
                  reader
                  hasStarted={count > 0}
                  placement="above"
                  showKeyboardHelp={false}
                />
              )}
              {/* The screen sets !pb-0 and the tab bar is hidden here, so the
                counter itself owns the bottom inset — otherwise it would sit
                flush against the home indicator. */}
              {
                <div
                  className={`shrink-0 pt-3 ${audioModeActive ? "pb-0" : "pb-[max(0.75rem,env(safe-area-inset-bottom))]"}`}
                >
                  {renderDock()}
                </div>
              }
              {!audioModeActive && typeof audioPlayer !== "function" && audioPlayer}
            </div>
          </>
        ))}

      {shareOpen && (
        <Suspense fallback={null}>
          <SharingPreview
            open
            onClose={() => setShareOpen(false)}
            single
            collectionTitle={readerZikrTitle ?? displayCategoryName}
            collectionTitleArabic={z.surahNameArabic ?? CATEGORIES.find((c) => c.id === catId)?.nameArabic}
            collectionTitleEnglish={z.surahNameEnglish ?? CATEGORIES.find((c) => c.id === catId)?.name}
            categoryId={catId}
            readerIndex={idx}
            routineMode={routineMode}
            prayer={isPrayerName(subCategory) ? subCategory : undefined}
            items={[z]}
            language={language}
            themeMode={themeMode}
          />
        </Suspense>
      )}
      {collectionShareOpen && (
        <Suspense fallback={null}>
          <SharingPreview
            open
            onClose={() => setCollectionShareOpen(false)}
            single={false}
            collectionTitle={displayCategoryName}
            collectionTitleArabic={CATEGORIES.find((c) => c.id === catId)?.nameArabic}
            collectionTitleEnglish={CATEGORIES.find((c) => c.id === catId)?.name}
            categoryId={catId}
            readerIndex={idx}
            routineMode={routineMode}
            prayer={isPrayerName(subCategory) ? subCategory : undefined}
            items={azkarList ?? [z]}
            language={language}
            themeMode={themeMode}
          />
        </Suspense>
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
      {!canDockCollection && onSelectZikr && !focusMode && (
        <SidePanel
          open={isCollectionDrawerOpen}
          onClose={closeCollectionDrawer}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = collectionSelectionRequested.current
              ? readingScrollRef.current
              : (sidebarToggleRef.current ?? readerMenuRef.current);
            collectionSelectionRequested.current = false;
            target?.focus({ preventScroll: true });
          }}
          title={t(language, "reader.viewAllAzkar")}
          side={direction === "rtl" ? "left" : "right"}
          direction={direction}
          language={language}
          testId="reader-collection-drawer"
          className="!overflow-hidden"
        >
          {renderCollectionNavigator(true)}
        </SidePanel>
      )}
      <QuranWordPopover
        meanings={wordSheetOpen ? null : (wordMeaningSelection?.groups[wordMeaningSelection.index] ?? null)}
        anchorEl={wordMeaningSelection?.anchor ?? null}
        language={language}
        direction={direction}
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
          <span className="text-sm font-medium">{t(language, "reader.resetCounter")}</span>
          <button
            type="button"
            onClick={handleUndoReset}
            className="interactive-elem flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-primary/20 hover:bg-primary/30 px-3.5 py-2 text-sm font-bold text-primary transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer"
          >
            {t(language, "common.undo")}
          </button>
        </div>
      )}
      <CounterKeyboardHelp
        compact
        language={language}
        direction={direction}
        open={keyboardHelpOpen}
        onOpenChange={setKeyboardHelpOpen}
        showTrigger={false}
        shortcuts={[
          { keys: ["Space"], label: t(language, "reader.shortcutCount") },
          { keys: ["→", "←"], label: t(language, "reader.shortcutNavigate") },
          { keys: ["R"], label: t(language, "reader.shortcutReset") },
          { keys: ["Esc"], label: t(language, "reader.shortcutBack") },
        ]}
      />
    </ScreenContainer>
  );
}
