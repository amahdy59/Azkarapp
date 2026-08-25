import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type {
  AppLanguage,
  MushafLayout,
  MushafTheme,
  QuranReadingPosition,
  QuranVerseBookmark,
  QuranWirdPlan,
  ThemeMode,
} from "../types";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  RotateCcw,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Eye,
  ChevronDown,
  SlidersHorizontal,
} from "../components/icons";
import { MushafPageViewer } from "../components/MushafPageViewer";
import { MushafNavigationModal } from "../components/MushafNavigationModal";
import { AyahInteractionSheet } from "../components/AyahInteractionSheet";
import { MushafSettingsSheet } from "../components/MushafSettingsSheet";
import { getSurahDisplayName, getJuzNumberForPage } from "../content/surahInfo";
import { loadSurahWordMeanings } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { getProgressDayKey } from "../progress";
import { useNow } from "../hooks/useNow";
import { effectiveDailyGoal } from "./quranWirdGoal";
import {
  getCachedMushafPage,
  isQcfFontReady,
  loadMushafPage,
  loadCanonicalAyahText,
  loadQcfFont,
  pageHasQcfGlyphs,
  prefetchMushafPage,
  subscribeQcfFontLoaded,
  type MushafVerseData,
} from "../content/qcfMushaf";
import { reportError } from "../../lib/observability";

const LAST_PAGE = 604;
/** Past this many pixels of horizontal travel a drag is a page turn. */
const SWIPE_THRESHOLD = 60;
/** Settling a released drag, and the only transform animation on this screen. */
const PAPER_SETTLE = "transform 160ms ease-out";

/**
 * A spread is only worth showing when both pages still read comfortably.
 *
 * A Mushaf page is about two thirds as wide as it is tall, so two of them plus
 * a gutter need roughly 1.4x the height in width. Below that the pair would be
 * narrower than a single page is now, which trades legibility for novelty.
 */
function fitsTwoPages(width: number, height: number) {
  return width >= 1024 && width / height >= 1.4;
}

/** The right-hand page of a spread is the odd one: the Mushaf opens with page 1
 *  on the right, so pairs run (1,2), (3,4) and so on. */
function spreadStart(page: number) {
  return page % 2 === 1 ? page : page - 1;
}
const COMPLETION_NOTICE_MS = 4000;

/** A page's words, bucketed into the reference's fifteen line slots. */
function toMushafLines(pageData: MushafVerseData[] | null) {
  if (!pageData) return [];
  const lineMap = new Map<
    number,
    { verseKey: string; position: number; isEnd: number; text: string; qcfCode?: string }[]
  >();
  for (const verse of pageData) {
    for (const w of verse.w) {
      const [position, lineNumber, isEnd, text, qcfCode] = w;
      if (!lineMap.has(lineNumber)) lineMap.set(lineNumber, []);
      lineMap.get(lineNumber)!.push({ verseKey: verse.k, position, isEnd, text, qcfCode });
    }
  }
  const result = [];
  for (let i = 1; i <= 15; i++) result.push(lineMap.get(i) || []);
  return result;
}

interface ResolvedPage {
  page: number;
  data: MushafVerseData[];
  /** Settled with the page, never after it: flipping this later reflowed the
   *  whole canvas as the Unicode fallback gave way to QCF. */
  qcf: boolean;
}

function warmGlossesWhenIdle(surahs: string[]) {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;
  const warm = () => void Promise.all(surahs.map((surah) => loadSurahWordMeanings(surah)));
  const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void) => number };
  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(warm);
  } else {
    window.setTimeout(warm, 0);
  }
}

async function resolveMushafPage(page: number, waitForMeanings: boolean): Promise<ResolvedPage> {
  const data = await loadMushafPage(page);
  const surahs = [...new Set(data.map((verse) => verse.k.split(":")[0] ?? ""))].filter(Boolean);
  if (waitForMeanings) await Promise.all(surahs.map((surah) => loadSurahWordMeanings(surah)));
  else warmGlossesWhenIdle(surahs);

  void loadQcfFont(page);
  return { page, data, qcf: true };
}

export function KhatmahReaderScreen({
  language,
  direction,
  onBack,
  khatmahPage,
  setKhatmahPage,
  mushafTheme: initialTheme = "follow-app",
  appTheme = "midnight",
  setMushafTheme: onUpdateTheme,
  mushafLayout = "auto",
  setMushafLayout,
  mushafBookmarks: initialBookmarks = [],
  setMushafBookmarks: onUpdateBookmarks,
  quranReadingBookmark,
  onReadingBookmarkChange,
  mushafVerseBookmarks: initialVerseBookmarks = [],
  setMushafVerseBookmarks: onUpdateVerseBookmarks,
  wirdHistory = {},
  onRecordPages,
  quranWirdPlan,
  onReadingPositionChange,
  progressDayStartHour,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  khatmahPage: number;
  setKhatmahPage: (page: number) => void;
  mushafTheme?: MushafTheme;
  appTheme?: ThemeMode;
  setMushafTheme?: (theme: MushafTheme) => void;
  mushafLayout?: MushafLayout;
  setMushafLayout?: (layout: MushafLayout) => void;
  mushafBookmarks?: number[];
  setMushafBookmarks?: (bookmarks: number[]) => void;
  quranReadingBookmark?: QuranReadingPosition;
  onReadingBookmarkChange?: (bookmark: QuranReadingPosition | undefined) => void;
  mushafVerseBookmarks?: QuranVerseBookmark[];
  setMushafVerseBookmarks?: (bookmarks: QuranVerseBookmark[]) => void;
  wirdHistory?: Record<string, number[]>;
  onRecordPages?: (dayKey: string, pages: number[], dailyGoal: number) => void;
  quranWirdPlan?: QuranWirdPlan;
  onReadingPositionChange?: (position: QuranReadingPosition) => void;
  progressDayStartHour: number;
}) {
  const currentPage = Math.max(1, Math.min(LAST_PAGE, khatmahPage || 1));

  const [theme, setTheme] = useState<MushafTheme>(initialTheme);
  const resolvedTheme = theme === "follow-app" ? appTheme : theme;
  const [resolved, setResolved] = useState<ResolvedPage | null>(() => {
    const cached = getCachedMushafPage(currentPage);
    if (!cached) return null;
    return { page: currentPage, data: cached, qcf: isQcfFontReady(currentPage) && pageHasQcfGlyphs(cached) };
  });
  const [other, setOther] = useState<ResolvedPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [showWordMeanings, setShowWordMeanings] = useState(false);
  const [completionSeen, setCompletionSeen] = useState<string | null>(null);
  /** Read inside the loader without making the switch a dependency of it —
   *  flipping it must not re-fetch the page. */
  const showMeaningsRef = useRef(showWordMeanings);
  showMeaningsRef.current = showWordMeanings;
  const [activeAyah, setActiveAyah] = useState<{ verseKey: string; text: string | null; pageNumber: number } | null>(
    null,
  );
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  const ayahRequestId = useRef(0);

  const handleAyahAction = useCallback((verseKey: string, pageNumber: number) => {
    const requestId = ++ayahRequestId.current;
    setActiveAyah({ verseKey, text: null, pageNumber });
    void loadCanonicalAyahText(verseKey, pageNumber)
      .then((text) => {
        if (ayahRequestId.current === requestId) setActiveAyah({ verseKey, text, pageNumber });
      })
      .catch((error) => {
        reportError(error, "mushaf-ayah-text");
        if (ayahRequestId.current === requestId) setActiveAyah(null);
      });
  }, []);

  useEffect(() => {
    if (!highlightedVerseKey) return;
    const timer = window.setTimeout(() => setHighlightedVerseKey(null), 4_000);
    return () => window.clearTimeout(timer);
  }, [highlightedVerseKey]);

  const [autoSpreadRoom, setSpreadRoom] = useState(
    () => typeof window !== "undefined" && fitsTwoPages(window.innerWidth, window.innerHeight),
  );

  useEffect(() => {
    const measure = () => setSpreadRoom(fitsTwoPages(window.innerWidth, window.innerHeight));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  // A stored desktop preference never forces two pages onto a phone or tall
  // tablet. The physical fit gate is authoritative; settings only opt out.
  const spreadRoom = autoSpreadRoom && mushafLayout !== "single";
  const paperRef = useRef<HTMLDivElement>(null);
  const readerRootRef = useRef<HTMLDivElement>(null);

  // Sync internal theme with prop updates
  useEffect(() => {
    if (initialTheme) setTheme(initialTheme);
  }, [initialTheme]);

  const handleSelectTheme = (newTheme: MushafTheme) => {
    setTheme(newTheme);
    onUpdateTheme?.(newTheme);
    setIsOptionsMenuOpen(false);
  };

  const isCurrentBookmarked = quranReadingBookmark?.page === currentPage;

  const now = useNow();
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const todayPagesRead = useMemo(() => wirdHistory[todayKey] ?? [], [todayKey, wirdHistory]);

  // The goal the reader chose on the overview, computed by the same function
  // that screen uses so the two can never disagree about today's target.
  const wirdGoal = useMemo(
    () => (quranWirdPlan ? effectiveDailyGoal(quranWirdPlan, wirdHistory, todayKey) : 0),
    [quranWirdPlan, todayKey, wirdHistory],
  );
  const wirdRead = Math.min(todayPagesRead.length, wirdGoal || todayPagesRead.length);
  const wirdComplete = wirdGoal > 0 && wirdRead >= wirdGoal;
  const wirdLabel = t(language, "mushaf.todayProgress", {
    read: formatNumerals(wirdRead, language),
    goal: formatNumerals(wirdGoal, language),
  });

  /**
   * The page never blanks to a spinner mid-turn. `resolved` keeps the paper that
   * is on screen until the next one is in hand, and every page now comes from a
   * local file behind an in-memory cache, so a prefetched neighbour resolves in
   * the same tick that the button is pressed.
   */
  useEffect(() => {
    let active = true;
    const rightPage = spreadStart(currentPage);
    const leftPage = rightPage + 1 <= LAST_PAGE ? rightPage + 1 : null;
    const facingPage = spreadRoom && leftPage !== null ? (currentPage === rightPage ? leftPage : rightPage) : null;

    // Immediately resolve from memory if present
    const cachedPrimary = getCachedMushafPage(currentPage);
    if (cachedPrimary) {
      setResolved({
        page: currentPage,
        data: cachedPrimary,
        qcf: true,
      });
      void loadQcfFont(currentPage);
    }

    void (async () => {
      // Settle both halves together.
      const [next, facing] = await Promise.all([
        resolveMushafPage(currentPage, showMeaningsRef.current).catch((reason) => {
          reportError(reason, "mushaf-page-load");
          return null;
        }),
        facingPage === null
          ? Promise.resolve(null)
          : resolveMushafPage(facingPage, showMeaningsRef.current).catch((reason) => {
              reportError(reason, "mushaf-facing-page-load");
              return null;
            }),
      ]);
      if (!active) return;
      if (!next) {
        if (!cachedPrimary) setError(t(language, "mushaf.loadFailed"));
        return;
      }
      setResolved(next);
      setOther(facing);
      setError(null);
    })();

    return () => {
      active = false;
    };
  }, [currentPage, language, reloadToken, spreadRoom]);

  /**
   * A page counts itself once it has actually been read.
   *
   * Asking for a tap to record a page you have just finished reading is a
   * receipt for work already done — and the reader's hands are on the swipe,
   * not on a button. A short dwell separates reading a page from flicking past
   * it on the way somewhere else.
   */

  /**
   * Finishing the day's wird is worth saying out loud once — the progress bar
   * filling is easy to miss when your eyes are on the text. It is a notice, not
   * a dialog: nothing to dismiss before carrying on reading, because reading
   * past the goal is a perfectly good thing to do.
   */
  useEffect(() => {
    if (!wirdComplete) return;
    setCompletionSeen((seen) => (seen === todayKey ? seen : todayKey));
  }, [todayKey, wirdComplete]);

  useEffect(() => {
    if (completionSeen !== todayKey) return;
    const timer = window.setTimeout(() => setCompletionSeen(null), COMPLETION_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [completionSeen, todayKey]);

  const displayPage = resolved?.page ?? currentPage;
  const pageData = resolved?.data ?? null;

  /**
   * The other half of the spread.
   *
   * The Mushaf opens with page 1 on the right, so pairs run (1,2), (3,4) and so
   * on: the odd page is always the right-hand one. The page the reader is on
   * can be either half, so the pair is derived from its parity rather than
   * assuming it is the right — assuming that showed page 50 twice.
   */
  const rightNumber = spreadRoom ? spreadStart(displayPage) : displayPage;
  const leftNumber = spreadRoom && rightNumber + 1 <= LAST_PAGE ? rightNumber + 1 : null;
  const otherNumber = leftNumber === null ? null : displayPage === rightNumber ? leftNumber : rightNumber;

  const visiblePages = useMemo(
    () => (spreadRoom && leftNumber !== null ? [rightNumber, leftNumber] : [displayPage]),
    [displayPage, leftNumber, rightNumber, spreadRoom],
  );

  const recordCurrentSpread = useCallback(() => {
    const currentList = wirdHistory[todayKey] ?? [];
    const newlyRead = visiblePages.filter((page) => !currentList.includes(page));
    if (newlyRead.length > 0) onRecordPages?.(todayKey, newlyRead, wirdGoal);
  }, [onRecordPages, todayKey, visiblePages, wirdGoal, wirdHistory]);

  // Live subscription to font arrivals: dynamically upgrades any on-screen page
  // to authentic QCF Madani glyphs the exact millisecond the font arrives.
  useEffect(() => {
    return subscribeQcfFontLoaded((loadedPage) => {
      setResolved((current) => {
        if (current && current.page === loadedPage && !current.qcf) {
          return { ...current, qcf: true };
        }
        return current;
      });
      setOther((current) => {
        if (current && current.page === loadedPage && !current.qcf) {
          return { ...current, qcf: true };
        }
        return current;
      });
    });
  }, []);

  // Prefetching surrounding spreads/pages after the current page settles so
  // turning to neighbouring pages is an instant cache/memory hit without
  // competing with the initial page load.
  useEffect(() => {
    if (!resolved || resolved.page !== currentPage) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const timer = window.setTimeout(() => {
      if (spreadRoom && leftNumber !== null) {
        for (let offset = 1; offset <= 4; offset++) {
          if (leftNumber + offset <= LAST_PAGE) prefetchMushafPage(leftNumber + offset);
          if (rightNumber - offset >= 1) prefetchMushafPage(rightNumber - offset);
        }
      } else {
        for (let offset = 1; offset <= 3; offset++) {
          if (currentPage + offset <= LAST_PAGE) prefetchMushafPage(currentPage + offset);
          if (currentPage - offset >= 1) prefetchMushafPage(currentPage - offset);
        }
      }
    }, 100);
    return () => window.clearTimeout(timer);
  }, [currentPage, resolved?.page, resolved, spreadRoom, leftNumber, rightNumber]);

  // Transform data into the reference 15 lines
  const lines = useMemo(() => toMushafLines(pageData), [pageData]);

  const otherLines = useMemo(() => (other ? toMushafLines(other.data) : []), [other]);
  const otherReady = other && other.page === otherNumber ? { ...other, lines: otherLines } : null;

  // The right-hand page is drawn first, because that is the one read first.
  const rightSide =
    displayPage === rightNumber
      ? { page: displayPage, lines, qcf: resolved?.qcf ?? false }
      : otherReady && { page: otherReady.page, lines: otherReady.lines, qcf: otherReady.qcf };
  const leftSide =
    displayPage === rightNumber
      ? otherReady && { page: otherReady.page, lines: otherReady.lines, qcf: otherReady.qcf }
      : { page: displayPage, lines, qcf: resolved?.qcf ?? false };
  const spreadReady = Boolean(leftNumber && rightSide && leftSide);

  const useQcfGlyphs = resolved?.qcf ?? false;

  // Compute Surah and Juz for the header
  const { surahName, juzNumber } = useMemo(() => {
    const juz = getJuzNumberForPage(displayPage);
    if (!pageData || pageData.length === 0) return { surahName: "", juzNumber: juz };
    const [surah] = (pageData[0]?.k || "1:1").split(":");
    return { surahName: getSurahDisplayName(surah || "1", language), juzNumber: juz };
  }, [pageData, displayPage, language]);

  useEffect(() => {
    if (!pageData?.length) return;
    const [surahNumber] = (pageData[0]?.k ?? "1:1").split(":").map(Number);
    onReadingPositionChange?.({ page: displayPage, surahNumber, juzNumber });
  }, [displayPage, juzNumber, onReadingPositionChange, pageData]);

  const toggleReadingBookmark = useCallback(() => {
    if (isCurrentBookmarked) {
      onReadingBookmarkChange?.(undefined);
      return;
    }
    const [surahNumber] = (pageData?.[0]?.k ?? "1:1").split(":").map(Number);
    onReadingBookmarkChange?.({ page: displayPage, surahNumber, juzNumber });
  }, [displayPage, isCurrentBookmarked, juzNumber, onReadingBookmarkChange, pageData]);

  /** One page at a time, or a whole spread when two are showing. */
  const pageStep = spreadReady ? 2 : 1;
  const paginate = useCallback(
    (delta: number) => {
      const nextPage = currentPage + delta * pageStep;
      if (nextPage < 1 || nextPage > LAST_PAGE) return;
      if (delta > 0) recordCurrentSpread();
      setKhatmahPage(nextPage);
    },
    [currentPage, pageStep, setKhatmahPage, recordCurrentSpread],
  );

  /** Physical direction is the product rule: right advances, left goes back.
   *  Buttons, keys, and swipes all call the same signed paginator. */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isIndexOpen || isOptionsMenuOpen || activeAyah) return;
      const target = e.target as HTMLElement | null;
      const root = readerRootRef.current;
      if (target && target !== document.body && target.id !== "main-content" && !root?.contains(target)) return;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      let handled = true;
      if (e.key === "ArrowRight" || e.key === "PageDown") paginate(1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") paginate(-1);
      else if (e.key === "Home") setKhatmahPage(1);
      else if (e.key === "End") setKhatmahPage(LAST_PAGE);
      else if (e.key === "Escape") onBack();
      else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAyah, isIndexOpen, isOptionsMenuOpen, onBack, paginate, setKhatmahPage]);

  // Pointer-driven page turn. The transform is written straight to the node, so
  // dragging costs no React render at all — the previous implementation ran a
  // spring through component state on every frame.
  const drag = useRef({ pointerId: -1, startX: 0, engaged: false });

  const endDrag = useCallback(
    (clientX: number | null) => {
      const paper = paperRef.current;
      if (paper) {
        paper.style.transition = PAPER_SETTLE;
        paper.style.transform = "";
      }
      if (drag.current.engaged && clientX !== null) {
        const offset = clientX - drag.current.startX;
        if (offset >= SWIPE_THRESHOLD) paginate(1);
        else if (offset <= -SWIPE_THRESHOLD) paginate(-1);
      }
      drag.current = { pointerId: -1, startX: 0, engaged: false };
    },
    [paginate],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a, [role='switch']")) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, engaged: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    const offset = event.clientX - drag.current.startX;
    if (!drag.current.engaged) {
      if (Math.abs(offset) < 12) return;
      drag.current.engaged = true;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId) === false) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    const paper = paperRef.current;
    if (paper) {
      paper.style.transition = "none";
      paper.style.transform = `translateX(${(offset * 0.35).toFixed(1)}px)`;
    }
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    endDrag(event.clientX);
  };

  const isArabic = language === "ar";
  const backIcon = isArabic ? <ArrowRight size={20} /> : <ArrowLeft size={20} />;
  const headerActionClass =
    "inline-flex min-h-11 min-w-0 shrink-0 items-center justify-center gap-1 rounded-xl px-1.5 text-[0.6875rem] font-extrabold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";
  const footerActionClass =
    "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.625rem] font-extrabold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40";

  const pageHeader = (
    <div className="flex w-full min-w-0 items-center gap-1" dir={direction}>
      <button type="button" onClick={onBack} className={headerActionClass} aria-label={t(language, "common.back")}>
        {backIcon}
        <span>{t(language, "common.back")}</span>
      </button>
      <button
        type="button"
        onClick={() => setIsIndexOpen(true)}
        className="arabic-ui flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t(language, "mushaf.indexTitle")}
      >
        <span className="min-w-0 truncate text-sm font-extrabold">{surahName}</span>
        {/* The juz and the chevron are the parts a reader can lose: the
            surah name is the one that must never truncate to a single letter. */}
        <span className="hidden shrink-0 text-xs font-bold opacity-70 sm:inline">
          ، {t(language, "common.juz")} {formatNumerals(juzNumber, language)}
        </span>
        <ChevronDown size={16} className="hidden shrink-0 opacity-60 sm:block" aria-hidden="true" />
      </button>

      {/* Reading Settings Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOptionsMenuOpen(true)}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-current/25 bg-current/5 transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        aria-label={t(language, "common.settings")}
        data-testid="mushaf-settings-trigger"
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
      </button>
    </div>
  );

  const pageFooter = (
    <nav
      dir={direction}
      aria-label={t(language, "mushaf.pageNavigation")}
      className="grid w-full items-center gap-1"
      style={{ gridTemplateColumns: "3.5rem minmax(0,1fr) 3.5rem" }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={showWordMeanings}
        onClick={() => setShowWordMeanings((current) => !current)}
        className={`inline-flex size-14 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
          showWordMeanings ? "border-primary bg-primary text-primary-foreground" : "border-transparent bg-current/5"
        }`}
        aria-label={t(language, "mushaf.difficultWordsInvite")}
        data-testid="mushaf-difficult-words-switch"
      >
        <Eye size={19} aria-hidden="true" />
      </button>

      {/* Page-turn controls follow natural reading progression:
          In RTL (Arabic Mushaf), Previous is on the right pointing right (>) and Next is on the left pointing left (<). */}
      <div
        className="grid min-w-0 items-center gap-1"
        style={{ gridTemplateColumns: "minmax(2.75rem,1fr) minmax(4rem,0.8fr) minmax(2.75rem,1fr)" }}
        dir={direction}
      >
        <button
          type="button"
          onClick={() => paginate(-1)}
          disabled={currentPage <= 1}
          className={footerActionClass}
          aria-label={t(language, "common.previous")}
        >
          {direction === "rtl" ? (
            <ChevronRight size={22} aria-hidden="true" />
          ) : (
            <ChevronLeft size={22} aria-hidden="true" />
          )}
          <span className="truncate">{t(language, "common.previous")}</span>
        </button>

        <div className="flex min-h-14 min-w-0 flex-col items-center justify-center px-1">
          <span className="truncate text-[0.75rem] font-extrabold tabular-nums">
            {t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}
          </span>
          <span className="hidden text-[0.625rem] font-semibold opacity-65 md:block">
            {t(language, "mushaf.keyboardNavigationHint")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => paginate(1)}
          disabled={currentPage >= LAST_PAGE}
          className={footerActionClass}
          aria-label={t(language, "common.next")}
        >
          {direction === "rtl" ? (
            <ChevronLeft size={22} aria-hidden="true" />
          ) : (
            <ChevronRight size={22} aria-hidden="true" />
          )}
          <span className="truncate">{t(language, "common.next")}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={toggleReadingBookmark}
        aria-pressed={isCurrentBookmarked}
        className={`inline-flex size-14 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
          isCurrentBookmarked ? "border-primary bg-primary text-primary-foreground" : "border-transparent bg-current/5"
        }`}
        aria-label={t(language, "mushaf.savePlace")}
        data-testid="mushaf-save-place"
      >
        <Bookmark size={19} className={isCurrentBookmarked ? "fill-current" : ""} aria-hidden="true" />
      </button>
    </nav>
  );
  const wirdProgressBar =
    wirdGoal > 0 ? (
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-current/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={wirdGoal}
        aria-valuenow={wirdRead}
        aria-label={wirdLabel}
        data-testid="mushaf-wird-progress"
      >
        <div
          className={`h-full transition-[width] duration-standard ease-standard ${
            wirdComplete ? "bg-success" : "bg-primary"
          }`}
          style={{ width: `${Math.min(100, (wirdRead / wirdGoal) * 100)}%` }}
        />
      </div>
    ) : null;

  return (
    <ScreenContainer
      dir={direction}
      edgeToEdge
      screenName={t(language, "common.mushaf")}
      className="relative flex h-full select-none flex-col overflow-hidden bg-background"
    >
      {/* The Mushaf page is the screen: no card, no gutter, no letterbox. */}
      <div
        ref={readerRootRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{ touchAction: "pan-y" }}
      >
        {!pageData && !error && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            role="status"
            aria-busy="true"
          >
            <div
              className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-muted-foreground">{t(language, "common.loading")}</span>
          </div>
        )}

        {error && !pageData && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-[0.9375rem] font-bold text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => setReloadToken((token) => token + 1)}
              className="flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-[0.875rem] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <RotateCcw size={16} />
              <span>{t(language, "mushaf.retry")}</span>
            </button>
          </div>
        )}

        {pageData && (
          <div className="h-full w-full">
            <MushafPageViewer
              lines={spreadReady && rightSide ? rightSide.lines : lines}
              language={language}
              pageNumber={spreadReady && rightSide ? rightSide.page : displayPage}
              surahName={surahName}
              juzNumber={juzNumber}
              direction={direction}
              theme={resolvedTheme}
              isBookmarked={isCurrentBookmarked}
              useQcfGlyphs={spreadReady && rightSide ? rightSide.qcf : useQcfGlyphs}
              showWordMeanings={showWordMeanings}
              highlightedVerseKey={highlightedVerseKey}
              facingPage={
                spreadReady && leftSide
                  ? { pageNumber: leftSide.page, lines: leftSide.lines, useQcfGlyphs: leftSide.qcf }
                  : undefined
              }
              headerContent={pageHeader}
              footerContent={pageFooter}
              progressBar={wirdProgressBar}
              paperRef={paperRef}
              onAyahAction={handleAyahAction}
            />
          </div>
        )}
        {pageData && (
          <p className="sr-only" role="status" aria-live="polite">
            {t(language, "mushaf.positionAnnouncement", {
              page: formatNumerals(displayPage, language),
              surah: surahName,
              juz: formatNumerals(juzNumber, language),
            })}
          </p>
        )}
      </div>

      <AyahInteractionSheet
        isOpen={activeAyah !== null}
        onClose={() => {
          ayahRequestId.current += 1;
          setActiveAyah(null);
        }}
        verseKey={activeAyah?.verseKey ?? null}
        text={activeAyah?.text ?? null}
        language={language}
        isBookmarked={
          activeAyah?.verseKey
            ? initialVerseBookmarks.some((bookmark) => bookmark.verseKey === activeAyah.verseKey)
            : false
        }
        onBookmark={() => {
          if (!activeAyah?.verseKey) return;
          const exists = initialVerseBookmarks.some((bookmark) => bookmark.verseKey === activeAyah.verseKey);
          const next = exists
            ? initialVerseBookmarks.filter((bookmark) => bookmark.verseKey !== activeAyah.verseKey)
            : [...initialVerseBookmarks, { verseKey: activeAyah.verseKey, page: activeAyah.pageNumber }];
          onUpdateVerseBookmarks?.(next);
        }}
      />

      {/* Wird completed */}
      {wirdComplete && completionSeen === todayKey && (
        <div
          role="status"
          data-testid="mushaf-wird-complete"
          className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4"
          style={{ bottom: "4.5rem" }}
        >
          <div className="pointer-events-auto inline-flex w-auto max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-success/45 bg-popover px-4 py-2 text-popover-foreground shadow-overlay">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 size={16} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="flex flex-col text-start whitespace-nowrap" dir={direction}>
              <p className="text-[0.8125rem] font-extrabold leading-tight">{t(language, "mushaf.wirdComplete")}</p>
              <p className="text-[0.6875rem] font-medium leading-tight opacity-80">
                {t(language, "mushaf.wirdCompleteBody", { goal: formatNumerals(wirdGoal, language) })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCompletionSeen(null)}
              className="flex size-7 shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              aria-label={t(language, "common.close")}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Reading Settings Sheet */}
      <MushafSettingsSheet
        open={isOptionsMenuOpen}
        onClose={() => setIsOptionsMenuOpen(false)}
        language={language}
        direction={direction}
        theme={theme}
        appTheme={appTheme}
        onSelectTheme={handleSelectTheme}
        mushafLayout={mushafLayout}
        onSelectLayout={setMushafLayout}
        autoSpreadRoom={autoSpreadRoom}
        isBookmarked={initialBookmarks.includes(displayPage)}
        onToggleBookmark={() => {
          const isBookmarked = initialBookmarks.includes(displayPage);
          const next = isBookmarked
            ? initialBookmarks.filter((page) => page !== displayPage)
            : Array.from(new Set([...initialBookmarks, displayPage])).sort((a, b) => a - b);
          onUpdateBookmarks?.(next);
        }}
        pageNumber={displayPage}
        surahName={surahName}
      />

      {/* Index & Navigation Modal */}
      <MushafNavigationModal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        currentPage={currentPage}
        onSelectPage={setKhatmahPage}
        language={language}
        direction={direction}
        bookmarks={initialBookmarks}
        verseBookmarks={initialVerseBookmarks}
        onSelectVerseBookmark={(bookmark) => setHighlightedVerseKey(bookmark.verseKey)}
      />
    </ScreenContainer>
  );
}
