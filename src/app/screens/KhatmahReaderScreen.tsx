import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type {
  AppLanguage,
  MushafLayout,
  MushafTextScale,
  MushafToolbarSide,
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
  BookOpen,
  ChevronDown,
  MoreVertical,
} from "../components/icons";
import { PAPER_ASPECT, spreadStart, useMushafShell } from "../components/mushafShell";
import { MushafPageViewer } from "../components/MushafPageViewer";
import { MushafNavigationModal } from "../components/MushafNavigationModal";
import { AyahInteractionSheet } from "../components/AyahInteractionSheet";
import { MushafSettingsSheet } from "../components/MushafSettingsSheet";
import { MUSHAF_RAIL_WIDTH, MushafToolRail } from "../components/MushafToolRail";
import { MushafQuickMenu } from "../components/MushafQuickMenu";
import { getSurahDisplayName, getSurahShortName, getJuzNumberForPage } from "../content/surahInfo";
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
  type MushafVerseData,
} from "../content/qcfMushaf";
import { reportError } from "../../lib/observability";

const LAST_PAGE = 604;
/** Past this many pixels of horizontal travel a drag is a page turn. */
const SWIPE_THRESHOLD = 60;
/** Settling a released drag, and the only transform animation on this screen. */
const PAPER_SETTLE = "transform 160ms ease-out";
const FONT_WAIT_MS = 1200;

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

  const qcf =
    pageHasQcfGlyphs(data) &&
    (isQcfFontReady(page) ||
      (await Promise.race([
        loadQcfFont(page),
        new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), FONT_WAIT_MS)),
      ])));
  return { page, data, qcf };
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
  mushafToolbarSide = "right",
  setMushafToolbarSide,
  mushafTextScale = "medium",
  setMushafTextScale,
  mushafBookmarks: initialBookmarks = [],
  setMushafBookmarks: onUpdateBookmarks,
  mushafVerseBookmarks: initialVerseBookmarks = [],
  setMushafVerseBookmarks: onUpdateVerseBookmarks,
  wirdHistory = {},
  onRecordPages,
  quranWirdPlan,
  wirdCompletionAnnouncedDayKey,
  onWirdCompletionAnnounced,
  onReadingPositionChange,
  progressDayStartHour,
  reduceMotion = false,
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
  mushafToolbarSide?: MushafToolbarSide;
  setMushafToolbarSide?: (side: MushafToolbarSide) => void;
  mushafTextScale?: MushafTextScale;
  setMushafTextScale?: (scale: MushafTextScale) => void;
  mushafBookmarks?: number[];
  setMushafBookmarks?: (bookmarks: number[]) => void;
  mushafVerseBookmarks?: QuranVerseBookmark[];
  setMushafVerseBookmarks?: (bookmarks: QuranVerseBookmark[]) => void;
  wirdHistory?: Record<string, number[]>;
  onRecordPages?: (dayKey: string, pages: number[], dailyGoal: number) => void;
  quranWirdPlan?: QuranWirdPlan;
  /** The day whose completion has already been announced, from stored state. */
  wirdCompletionAnnouncedDayKey?: string;
  onWirdCompletionAnnounced?: (dayKey: string) => void;
  onReadingPositionChange?: (position: QuranReadingPosition) => void;
  progressDayStartHour: number;
  reduceMotion?: boolean;
}) {
  const currentPage = Math.max(1, Math.min(LAST_PAGE, khatmahPage || 1));

  const [theme, setTheme] = useState<MushafTheme>(initialTheme);
  const resolvedTheme = theme === "follow-app" ? appTheme : theme;
  const [resolved, setResolved] = useState<ResolvedPage | null>(() => {
    const cached = getCachedMushafPage(currentPage);
    if (!cached) return null;
    const hasQcfGlyphs = pageHasQcfGlyphs(cached);
    if (hasQcfGlyphs && !isQcfFontReady(currentPage)) return null;
    return { page: currentPage, data: cached, qcf: hasQcfGlyphs };
  });
  const settledPage = useRef(resolved?.page ?? currentPage);
  const [pageTransitionDirection, setPageTransitionDirection] = useState<"forward" | "backward" | undefined>();
  const [other, setOther] = useState<ResolvedPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [showWordMeanings, setShowWordMeanings] = useState(false);
  const [isLoadingWordMeanings, setIsLoadingWordMeanings] = useState(false);
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

  const shell = useMushafShell();

  const autoSpreadRoom = shell.spreadRoom;
  /**
   * Whether the reading type size can change anything here.
   *
   * On a phone the page is width-bound and the setting was inert — all three
   * steps rendered the identical measure and the identical 22.4px type. A
   * control that silently does nothing is worse than one that says it cannot.
   */
  const typeSizeApplies = shell.pageAspect >= PAPER_ASPECT;
  // A stored desktop preference never forces two pages onto a phone or tall
  // tablet. The physical fit gate is authoritative; settings only opt out.
  const spreadRoom = autoSpreadRoom && mushafLayout !== "single";
  const useRail = shell.rail;

  const paperRef = useRef<HTMLDivElement>(null);
  const readerRootRef = useRef<HTMLDivElement>(null);
  /**
   * Focus mode lasts as long as the sitting, not as long as the account. It is
   * something you do when you settle in to read, and reopening the Mushaf
   * tomorrow to a page with no visible controls would be a puzzle, not a
   * preference honoured.
   */
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [indexTab, setIndexTab] = useState<"surahs" | "bookmarks">("surahs");

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    sync();
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  /** Browser chrome is the last thing between the reader and the page. Not
   *  every browser grants this (iOS Safari has no Fullscreen API on the
   *  element), so a refusal is reported and otherwise ignored. */
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch((reason) => reportError(reason, "mushaf-exit-fullscreen"));
      return;
    }
    void document.documentElement.requestFullscreen?.().catch((reason) => reportError(reason, "mushaf-fullscreen"));
  }, []);

  // Sync internal theme with prop updates
  useEffect(() => {
    if (initialTheme) setTheme(initialTheme);
  }, [initialTheme]);

  /**
   * Choosing a theme leaves the settings open.
   *
   * It used to close them, which made the one control whose whole point is
   * comparison the only one you could not try twice — and every other control
   * on the same surface stays put. With the settings docked beside the page,
   * closing them also took away the view of what the choice had just done.
   */
  const handleSelectTheme = (newTheme: MushafTheme) => {
    setTheme(newTheme);
    onUpdateTheme?.(newTheme);
  };

  useEffect(() => {
    const root = readerRootRef.current;
    if (!root || root.contains(document.activeElement)) return;
    root.focus({ preventScroll: true });
  }, []);

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
        setError(t(language, "mushaf.loadFailed"));
        return;
      }
      setPageTransitionDirection(
        next.page === settledPage.current ? undefined : next.page > settledPage.current ? "forward" : "backward",
      );
      settledPage.current = next.page;
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
   *
   * Once a day, not once a visit. This used to live only in component state, so
   * every return to the Mushaf was a fresh mount and congratulated the reader
   * again for the same day's reading. The day it was said is stored, and the
   * ref stops a second announcement inside one mount before that store lands.
   */
  const announcedThisMount = useRef(false);
  useEffect(() => {
    announcedThisMount.current = false;
  }, [todayKey]);

  useEffect(() => {
    if (!wirdComplete) return;
    if (announcedThisMount.current) return;
    if (wirdCompletionAnnouncedDayKey === todayKey) return;
    announcedThisMount.current = true;
    setCompletionSeen(todayKey);
    onWirdCompletionAnnounced?.(todayKey);
  }, [onWirdCompletionAnnounced, todayKey, wirdComplete, wirdCompletionAnnouncedDayKey]);

  useEffect(() => {
    if (completionSeen === null) return;
    const timer = window.setTimeout(() => setCompletionSeen(null), COMPLETION_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [completionSeen]);

  const displayPage = resolved?.page ?? currentPage;
  const pageData = resolved?.data ?? null;

  const isPageBookmarked = initialBookmarks.includes(displayPage);
  const togglePageBookmark = useCallback(() => {
    const next = initialBookmarks.includes(displayPage)
      ? initialBookmarks.filter((page) => page !== displayPage)
      : Array.from(new Set([...initialBookmarks, displayPage])).sort((a, b) => a - b);
    onUpdateBookmarks?.(next);
  }, [displayPage, initialBookmarks, onUpdateBookmarks]);

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
    if (quranWirdPlan?.kind === "free") return;
    const currentList = wirdHistory[todayKey] ?? [];
    const newlyRead = visiblePages.filter((page) => !currentList.includes(page));
    if (newlyRead.length > 0) onRecordPages?.(todayKey, newlyRead, wirdGoal);
  }, [onRecordPages, quranWirdPlan?.kind, todayKey, visiblePages, wirdGoal, wirdHistory]);

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
  const { surahName, surahShortName, juzNumber } = useMemo(() => {
    const juz = getJuzNumberForPage(displayPage);
    if (!pageData || pageData.length === 0) return { surahName: "", surahShortName: "", juzNumber: juz };
    const [surah] = (pageData[0]?.k || "1:1").split(":");
    return {
      surahName: getSurahDisplayName(surah || "1", language),
      surahShortName: getSurahShortName(surah || "1", language),
      juzNumber: juz,
    };
  }, [pageData, displayPage, language]);

  useEffect(() => {
    if (!pageData?.length) return;
    const [surahNumber] = (pageData[0]?.k ?? "1:1").split(":").map(Number);
    onReadingPositionChange?.({ page: displayPage, surahNumber, juzNumber });
  }, [displayPage, juzNumber, onReadingPositionChange, pageData]);

  const toggleWordMeanings = useCallback(async () => {
    if (showWordMeanings) {
      setShowWordMeanings(false);
      return;
    }

    setIsLoadingWordMeanings(true);
    const visibleData = [...(pageData ?? []), ...(other?.data ?? [])];
    const surahs = [...new Set(visibleData.map((verse) => verse.k.split(":")[0] ?? ""))].filter(Boolean);
    await Promise.all(surahs.map((surah) => loadSurahWordMeanings(surah)));
    setShowWordMeanings(true);
    setIsLoadingWordMeanings(false);
  }, [other?.data, pageData, showWordMeanings]);

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
      if (isIndexOpen || isOptionsMenuOpen || isQuickMenuOpen || activeAyah) return;
      const target = e.target as HTMLElement | null;
      const root = readerRootRef.current;
      if (target && target !== document.body && target.id !== "main-content" && !root?.contains(target)) return;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      let handled = true;
      if (e.key === "ArrowLeft" || e.key === "PageDown") paginate(1);
      else if (e.key === "ArrowRight" || e.key === "PageUp") paginate(-1);
      else if (e.key === "Home") setKhatmahPage(1);
      else if (e.key === "End") setKhatmahPage(LAST_PAGE);
      // Focus mode is otherwise two taps away; on a keyboard it is one key.
      else if (e.key === "f" || e.key === "F") setIsFocusMode((on) => !on);
      // Escape gives the tools back before it gives up the reader: leaving the
      // Mushaf entirely from a keypress meant to undo the last thing you did
      // is a surprise you cannot take back without losing your place.
      else if (e.key === "Escape") {
        if (isFocusMode) setIsFocusMode(false);
        else onBack();
      } else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAyah, isFocusMode, isIndexOpen, isOptionsMenuOpen, isQuickMenuOpen, onBack, paginate, setKhatmahPage]);

  // Pointer-driven page turn. The transform is written straight to the node, so
  // dragging costs no React render at all — the previous implementation ran a
  // spring through component state on every frame.
  const drag = useRef({ pointerId: -1, startX: 0, startY: 0, startedAt: 0, engaged: false });

  /** A tap is short and still. Anything slower or further is a gesture the
   *  reader was making, and must not be read as one they were not. */
  const TAP_MS = 400;
  const TAP_SLOP = 8;

  const endDrag = useCallback(
    (clientX: number | null, clientY: number | null, target?: EventTarget | null, cancelled = false) => {
      const paper = paperRef.current;
      if (paper) {
        paper.style.transition = PAPER_SETTLE;
        paper.style.transform = "";
      }
      const { engaged, startX, startY, startedAt } = drag.current;
      drag.current = { pointerId: -1, startX: 0, startY: 0, startedAt: 0, engaged: false };
      // The browser cancels the pointer when it takes the gesture over for
      // scrolling. Committing a page turn on that would turn a scroll into a
      // page the reader never asked for.
      if (cancelled) return;

      if (engaged && clientX !== null) {
        const offset = clientX - startX;
        if (offset >= SWIPE_THRESHOLD) paginate(1);
        else if (offset <= -SWIPE_THRESHOLD) paginate(-1);
        return;
      }

      if (!isFocusMode || clientX === null || clientY === null) return;
      const moved = Math.hypot(clientX - startX, clientY - startY);
      const heldFor = performance.now() - startedAt;
      if (moved > TAP_SLOP || heldFor > TAP_MS) return;
      if (target instanceof Element && target.closest("button, a, [role='button'], [role='switch']")) return;
      // A deliberate tap on the paper — not a swipe, not a scroll, and not on a
      // word or an ayah marker, which have their own answer — brings the tools
      // back.
      setIsFocusMode(false);
    },
    [isFocusMode, paginate],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a, [role='switch']")) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: performance.now(),
      engaged: false,
    };
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
      paper.style.transform = `translateX(${offset.toFixed(1)}px)`;
    }
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    endDrag(event.clientX, event.clientY, event.target);
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    endDrag(null, null, null, true);
  };

  const isArabic = language === "ar";
  const backIcon = isArabic ? <ArrowRight size={20} /> : <ArrowLeft size={20} />;
  const headerActionClass =
    "inline-flex min-h-11 min-w-0 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-current/15 bg-current/5 px-2 text-[0.6875rem] font-extrabold transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:px-3";
  /** The page turn carries the bar's weight: a bordered chip, like the rail's. */
  const footerActionClass =
    "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0 rounded-lg border border-current/15 bg-current/5 px-1 text-[0.625rem] font-extrabold transition-colors enabled:hover:bg-current/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40";
  /** The study toggles sit back until they are on, so they do not outrank it. */
  const footerToggleClass = (active: boolean) =>
    `inline-flex h-11 w-11 items-center justify-center gap-2 rounded-lg border px-2 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-60 md:w-auto md:px-3 ${
      active ? "border-primary/60 bg-primary/15 text-primary" : "border-transparent hover:bg-current/5"
    }`;

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

      {/* One overflow button carries the index, saved places, study mode,
          focus, and settings. It shows wherever the bars do, not only on a
          phone: a portrait tablet has the same bars and had been left with
          focus mode two taps and a scroll deep inside Settings. */}
      <button
        type="button"
        onClick={() => setIsQuickMenuOpen(true)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-current/15 bg-current/5 transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        aria-label={t(language, "mushaf.moreActions")}
        data-testid="mushaf-more-actions"
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>
    </div>
  );

  const pageFooter = (
    <nav
      dir={direction}
      aria-label={t(language, "mushaf.pageNavigation")}
      className="grid w-full items-center gap-1 md:gap-2"
      style={{ gridTemplateColumns: "minmax(3.5rem, auto) minmax(0, 1fr) minmax(3.5rem, auto)" }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={showWordMeanings}
        aria-busy={isLoadingWordMeanings}
        disabled={isLoadingWordMeanings}
        onClick={() => void toggleWordMeanings()}
        className={footerToggleClass(showWordMeanings)}
        aria-label={t(language, "mushaf.difficultWordsInvite")}
        data-testid="mushaf-difficult-words-switch"
      >
        {showWordMeanings ? (
          <CheckCircle2 size={19} aria-hidden="true" className="shrink-0" />
        ) : (
          <BookOpen size={19} aria-hidden="true" className="shrink-0" />
        )}
        <span className="hidden max-w-[11rem] truncate font-bold md:block">
          {t(language, "mushaf.difficultWordsInvite")}
        </span>
      </button>

      {/* Page-turn controls follow natural reading progression:
          In RTL (Arabic Mushaf), Previous is on the right pointing right (>) and Next is on the left pointing left (<). */}
      <div
        className="grid min-w-0 items-center gap-1"
        style={{ gridTemplateColumns: "minmax(2.75rem,1fr) minmax(4rem,0.8fr) minmax(2.75rem,1fr)" }}
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => paginate(-1)}
          disabled={currentPage <= 1}
          className={footerActionClass}
          aria-label={t(language, "common.previous")}
        >
          <ChevronRight size={22} aria-hidden="true" />
          <span className="truncate">{t(language, "common.previous")}</span>
        </button>

        {/* The same readout the rail carries on a wide screen: the numeral,
            then the unit, with the total in the accessible name. One anatomy
            for the page number wherever the reader meets it. */}
        <p
          className="flex min-h-11 min-w-0 flex-col items-center justify-center px-1"
          data-testid="mushaf-page-readout"
        >
          <bdi className="text-[0.9375rem] leading-[1.4] font-extrabold tabular-nums">
            {formatNumerals(displayPage, language)}
          </bdi>
          <span className="text-[0.625rem] leading-[1.4] font-bold opacity-70">
            {t(language, "mushaf.railPageUnit")}
          </span>
          <span className="sr-only">
            {t(language, "mushaf.pageOfTotal", {
              page: formatNumerals(displayPage, language),
              total: formatNumerals(LAST_PAGE, language),
            })}
          </span>
        </p>

        <button
          type="button"
          onClick={() => paginate(1)}
          disabled={currentPage >= LAST_PAGE}
          className={footerActionClass}
          aria-label={t(language, "common.next")}
        >
          <ChevronLeft size={22} aria-hidden="true" />
          <span className="truncate">{t(language, "common.next")}</span>
        </button>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isPageBookmarked}
        onClick={togglePageBookmark}
        className={footerToggleClass(isPageBookmarked)}
        aria-label={t(language, "mushaf.bookmarkCurrentPage")}
        data-testid="mushaf-page-bookmark"
      >
        <Bookmark size={19} className={isPageBookmarked ? "shrink-0 fill-current" : "shrink-0"} aria-hidden="true" />
        <span className="hidden max-w-[11rem] truncate font-bold md:block">
          {t(language, "mushaf.bookmarkCurrentPage")}
        </span>
      </button>
    </nav>
  );
  /**
   * The same actions, stood on end. Where the rail is shown it is the only
   * chrome, so every control the bars carry has to be here.
   */
  const toolRail = (
    <MushafToolRail
      language={language}
      direction={direction}
      side={mushafToolbarSide}
      compact={shell.railCompact}
      surahName={surahShortName}
      juzNumber={juzNumber}
      pageNumber={displayPage}
      lastPage={LAST_PAGE}
      atFirstPage={currentPage <= 1}
      atLastPage={currentPage >= LAST_PAGE}
      showWordMeanings={showWordMeanings}
      isLoadingWordMeanings={isLoadingWordMeanings}
      isPageBookmarked={isPageBookmarked}
      isFullscreen={isFullscreen}
      onBack={onBack}
      onOpenIndex={() => {
        setIndexTab("surahs");
        setIsIndexOpen(true);
      }}
      onPrevious={() => paginate(-1)}
      onNext={() => paginate(1)}
      onToggleWordMeanings={() => void toggleWordMeanings()}
      onTogglePageBookmark={togglePageBookmark}
      onToggleFullscreen={toggleFullscreen}
      onEnterFocusMode={() => setIsFocusMode(true)}
      onOpenSettings={() => setIsOptionsMenuOpen(true)}
    />
  );

  /** The one thing left on screen in focus mode: a hairline handle at the foot
   *  of the page, wide enough to hit and quiet enough to forget. It sits in the
   *  same place whichever chrome it replaced, so there is one thing to learn. */
  const focusHandle = (
    <button
      type="button"
      onClick={() => setIsFocusMode(false)}
      data-testid="mushaf-focus-exit"
      aria-label={t(language, "mushaf.focusModeExit")}
      title={t(language, "mushaf.focusModeExit")}
      className="group absolute inset-x-0 bottom-[env(safe-area-inset-bottom)] z-20 flex h-5 items-center justify-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <span
        aria-hidden="true"
        className="h-0.5 w-10 rounded-full bg-muted-foreground transition-colors group-hover:bg-primary"
      />
    </button>
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
      {/* Focusable and focused on arrival, so the page keys work without asking
          the reader to click the paper first. `useViewFocus` skips the initial
          view, which is exactly the deep link or reload case. */}
      <div
        ref={readerRootRef}
        tabIndex={-1}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden outline-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerCancel}
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
              isBookmarked={isPageBookmarked}
              useQcfGlyphs={spreadReady && rightSide ? rightSide.qcf : useQcfGlyphs}
              showWordMeanings={showWordMeanings}
              highlightedVerseKey={highlightedVerseKey}
              facingPage={
                spreadReady && leftSide
                  ? { pageNumber: leftSide.page, lines: leftSide.lines, useQcfGlyphs: leftSide.qcf }
                  : undefined
              }
              headerContent={isFocusMode || useRail ? undefined : pageHeader}
              footerContent={isFocusMode || useRail ? undefined : pageFooter}
              railContent={useRail && !isFocusMode ? toolRail : undefined}
              railSide={mushafToolbarSide}
              progressBar={wirdProgressBar}
              paperRef={paperRef}
              pageTransitionDirection={pageTransitionDirection}
              reduceMotion={reduceMotion}
              textScale={mushafTextScale}
              onAyahAction={handleAyahAction}
            />
            {isFocusMode && focusHandle}
          </div>
        )}
        {isFocusMode && (
          <p className="sr-only" role="status" aria-live="polite">
            {t(language, "mushaf.focusModeActive")}
          </p>
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
        textScale={mushafTextScale}
        onSelectTextScale={setMushafTextScale}
        textScaleApplies={typeSizeApplies}
        toolbarSide={mushafToolbarSide}
        onSelectToolbarSide={setMushafToolbarSide}
        showToolbarSide={useRail}
        showKeyboardHelp={useRail}
        presentation={useRail ? "side-panel" : "sheet"}
        panelInset={useRail ? (shell.railCompact ? MUSHAF_RAIL_WIDTH.compact : MUSHAF_RAIL_WIDTH.regular) : 0}
        pageNumber={displayPage}
        surahName={surahName}
      />

      {/* Everything a phone has no room for, one tap behind the header. */}
      <MushafQuickMenu
        open={isQuickMenuOpen}
        onClose={() => setIsQuickMenuOpen(false)}
        language={language}
        direction={direction}
        surahName={surahName}
        juzNumber={juzNumber}
        pageNumber={displayPage}
        showWordMeanings={showWordMeanings}
        isLoadingWordMeanings={isLoadingWordMeanings}
        isPageBookmarked={isPageBookmarked}
        onOpenIndex={() => {
          setIndexTab("surahs");
          setIsIndexOpen(true);
        }}
        onOpenBookmarks={() => {
          setIndexTab("bookmarks");
          setIsIndexOpen(true);
        }}
        onToggleWordMeanings={() => void toggleWordMeanings()}
        onTogglePageBookmark={togglePageBookmark}
        onEnterFocusMode={() => setIsFocusMode(true)}
        onOpenSettings={() => setIsOptionsMenuOpen(true)}
      />

      {/* Index & Navigation Modal */}
      <MushafNavigationModal
        isOpen={isIndexOpen}
        initialTab={indexTab}
        currentPage={currentPage}
        onClose={() => setIsIndexOpen(false)}
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
