import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type { AppLanguage, MushafTheme, QuranReadingPosition, QuranWirdPlan } from "../types";
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
  Brush,
} from "../components/icons";
import { useReducedMotion } from "motion/react";
import { MushafPageViewer } from "../components/MushafPageViewer";
import { MushafNavigationModal } from "../components/MushafNavigationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { getSurahDisplayName, getJuzNumberForPage } from "../content/surahInfo";
import { loadSurahWordMeanings } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { getProgressDayKey } from "../progress";
import { effectiveDailyGoal } from "./quranWirdGoal";
import {
  getCachedMushafPage,
  isQcfFontReady,
  loadMushafPage,
  loadQcfFont,
  pageHasQcfGlyphs,
  prefetchMushafPage,
  type MushafVerseData,
} from "../content/qcfMushaf";

const LAST_PAGE = 604;
/** Past this many pixels of horizontal travel a drag is a page turn. */
const SWIPE_THRESHOLD = 60;
/** Settling a released drag, and the only transform animation on this screen. */
const PAPER_SETTLE = "transform 160ms ease-out";
/**
 * How long a page will wait for its QCF font before mounting in the Unicode
 * fallback instead. Long enough for a warm Cache Storage hit, short enough that
 * a dead network never holds the reader up.
 */
const FONT_WAIT_MS = 1200;
/** How long a page must be open before it counts as read rather than passed. */
const PAGE_DWELL_MS = 4000;
/**
 * How long the controls stay up once you stop touching them.
 *
 * Long enough to read the page number and reach for a button, short enough that
 * the paper is the only thing on screen while you are actually reading. Tapping
 * the page brings them back, so nothing is ever more than one tap away.
 */
const CHROME_IDLE_MS = 4500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ResolvedPage {
  page: number;
  data: MushafVerseData[];
  /** Settled with the page, never after it: flipping this later reflowed the
   *  whole canvas as the Unicode fallback gave way to QCF. */
  qcf: boolean;
}

export function KhatmahReaderScreen({
  language,
  direction,
  onBack,
  khatmahPage,
  setKhatmahPage,
  mushafTheme: initialTheme = "parchment",
  setMushafTheme: onUpdateTheme,
  mushafBookmarks: initialBookmarks = [],
  setMushafBookmarks: onUpdateBookmarks,
  wirdHistory = {},
  setWirdHistory: onUpdateWirdHistory,
  quranWirdPlan,
  onReadingPositionChange,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  khatmahPage: number;
  setKhatmahPage: (page: number) => void;
  mushafTheme?: MushafTheme;
  setMushafTheme?: (theme: MushafTheme) => void;
  mushafBookmarks?: number[];
  setMushafBookmarks?: (bookmarks: number[]) => void;
  wirdHistory?: Record<string, number[]>;
  setWirdHistory?: (history: Record<string, number[]>) => void;
  quranWirdPlan?: QuranWirdPlan;
  onReadingPositionChange?: (position: QuranReadingPosition) => void;
}) {
  const currentPage = Math.max(1, Math.min(LAST_PAGE, khatmahPage || 1));

  const [theme, setTheme] = useState<MushafTheme>(initialTheme);
  const [bookmarks, setBookmarks] = useState<number[]>(initialBookmarks);
  const [resolved, setResolved] = useState<ResolvedPage | null>(() => {
    const cached = getCachedMushafPage(currentPage);
    if (!cached) return null;
    return { page: currentPage, data: cached, qcf: isQcfFontReady(currentPage) && pageHasQcfGlyphs(cached) };
  });
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
  const [chromeVisible, setChromeVisible] = useState(true);
  const [chromeFocused, setChromeFocused] = useState(false);
  /**
   * Hidden controls are `visibility: hidden`, which correctly takes them out of
   * the tab order — and would strand a keyboard reader with no way to reach
   * them at all. So once someone is driving by keyboard the controls stay put
   * until they touch the page again.
   */
  const [keyboardDriven, setKeyboardDriven] = useState(false);
  const reduceMotion = useReducedMotion();
  const paperRef = useRef<HTMLDivElement>(null);

  // Sync internal theme with prop updates
  useEffect(() => {
    if (initialTheme) setTheme(initialTheme);
  }, [initialTheme]);

  // Sync bookmarks with prop updates. Compared by value, not by identity: the
  // prop has a default `[]`, so a plain assignment re-rendered on every render
  // and never settled.
  useEffect(() => {
    setBookmarks((current) =>
      current.length === initialBookmarks.length && current.every((page, index) => page === initialBookmarks[index])
        ? current
        : initialBookmarks,
    );
  }, [initialBookmarks]);

  const handleSelectTheme = (newTheme: MushafTheme) => {
    setTheme(newTheme);
    onUpdateTheme?.(newTheme);
    setIsOptionsMenuOpen(false);
  };

  const isCurrentBookmarked = bookmarks.includes(currentPage);

  const toggleBookmark = () => {
    const nextBookmarks = isCurrentBookmarked
      ? bookmarks.filter((p) => p !== currentPage)
      : [...bookmarks, currentPage].sort((a, b) => a - b);
    setBookmarks(nextBookmarks);
    onUpdateBookmarks?.(nextBookmarks);
  };

  const todayKey = getProgressDayKey();
  const todayPagesRead = useMemo(() => wirdHistory[todayKey] ?? [], [todayKey, wirdHistory]);

  // The goal the reader chose on the overview, computed by the same function
  // that screen uses so the two can never disagree about today's target.
  const wirdGoal = useMemo(
    () => (quranWirdPlan ? effectiveDailyGoal(quranWirdPlan, wirdHistory) : 0),
    [quranWirdPlan, wirdHistory],
  );
  const wirdRead = Math.min(todayPagesRead.length, wirdGoal || todayPagesRead.length);
  const wirdComplete = wirdGoal > 0 && wirdRead >= wirdGoal;
  const wirdLabel = t(language, "mushaf.todayProgress", {
    read: formatNumerals(wirdRead, language),
    goal: formatNumerals(wirdGoal, language),
  });

  const recordCurrentPage = useCallback(() => {
    if (!onUpdateWirdHistory) return;
    const dayKey = getProgressDayKey();
    const currentList = wirdHistory[dayKey] ?? [];
    if (!currentList.includes(currentPage)) {
      onUpdateWirdHistory({ ...wirdHistory, [dayKey]: [...currentList, currentPage] });
    }
  }, [currentPage, onUpdateWirdHistory, wirdHistory]);

  /**
   * The page never blanks to a spinner mid-turn. `resolved` keeps the paper that
   * is on screen until the next one is in hand, and every page now comes from a
   * local file behind an in-memory cache, so a prefetched neighbour resolves in
   * the same tick that the button is pressed.
   */
  useEffect(() => {
    let active = true;

    void (async () => {
      const data = await loadMushafPage(currentPage).catch((reason) => {
        console.error("Failed to load Mushaf page", reason);
        return null;
      });
      if (!active) return;
      if (!data) {
        setError(t(language, "mushaf.loadFailed"));
        return;
      }

      /**
       * Glosses block the page only when the reader has actually asked for
       * them. Awaiting them unconditionally put a 73 kB fetch (Al-Baqarah) in
       * front of every page turn to pay for a feature that was switched off —
       * so with the switch off they warm in the background instead, and the
       * page mounts as soon as its own text is ready.
       */
      const surahs = [...new Set(data.map((verse) => verse.k.split(":")[0] ?? ""))].filter(Boolean);
      const glosses = Promise.all(surahs.map((surah) => loadSurahWordMeanings(surah)));
      if (showMeaningsRef.current) {
        await glosses;
        if (!active) return;
      }

      // The page mounts once, already in its final typeface. Showing the
      // Unicode fallback first and swapping to QCF a moment later resized every
      // line under the reader's eyes.
      const wantsQcf = pageHasQcfGlyphs(data);
      const qcf = wantsQcf
        ? await Promise.race([loadQcfFont(currentPage), sleep(FONT_WAIT_MS).then(() => false)])
        : false;
      if (!active) return;

      setResolved({ page: currentPage, data, qcf });
      setError(null);
    })();

    return () => {
      active = false;
    };
  }, [currentPage, language, reloadToken]);

  const revealChrome = useCallback(() => setChromeVisible(true), []);

  useEffect(() => {
    setChromeVisible(true);
  }, [currentPage]);

  useEffect(() => {
    // Never step on a reader who is mid-interaction: an open menu, an open
    // dialog, or keyboard focus inside the toolbar all hold it open.
    if (!chromeVisible || chromeFocused || keyboardDriven || isIndexOpen || isOptionsMenuOpen) return;
    const timer = window.setTimeout(() => setChromeVisible(false), CHROME_IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [chromeVisible, chromeFocused, keyboardDriven, currentPage, isIndexOpen, isOptionsMenuOpen]);

  /**
   * A page counts itself once it has actually been read.
   *
   * Asking for a tap to record a page you have just finished reading is a
   * receipt for work already done — and the reader's hands are on the swipe,
   * not on a button. A short dwell separates reading a page from flicking past
   * it on the way somewhere else.
   */
  useEffect(() => {
    if (resolved?.page !== currentPage) return;
    const timer = window.setTimeout(() => recordCurrentPage(), PAGE_DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [currentPage, recordCurrentPage, resolved?.page]);

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

  // Warm both neighbours once the reader has settled, so a turn in either
  // direction is a cache hit rather than a fetch.
  useEffect(() => {
    if (resolved?.page !== currentPage) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const timer = window.setTimeout(() => {
      prefetchMushafPage(currentPage + 1);
      prefetchMushafPage(currentPage - 1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [currentPage, resolved?.page]);

  const displayPage = resolved?.page ?? currentPage;
  const pageData = resolved?.data ?? null;

  // Transform data into the reference 15 lines
  const lines = useMemo(() => {
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
  }, [pageData]);

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
    const [surahNumber, ayahNumber] = (pageData.at(-1)?.k ?? "1:1").split(":").map(Number);
    onReadingPositionChange?.({ page: displayPage, surahNumber, ayahNumber, juzNumber });
  }, [displayPage, juzNumber, onReadingPositionChange, pageData]);

  const paginate = useCallback(
    (delta: number) => {
      const nextPage = currentPage + delta;
      if (nextPage < 1 || nextPage > LAST_PAGE) return;
      setKhatmahPage(nextPage);
    },
    [currentPage, setKhatmahPage],
  );

  /**
   * The Mushaf is a right-to-left book, and the controls follow the paper
   * rather than a media player (DEC-094).
   *
   * Moving *right* moves back towards page one; moving *left* moves forward.
   * That is how the pages are bound, it is what the swipe already did — drag
   * the paper rightwards and the earlier page comes back — and it is what the
   * arrows now do, so the gesture and the keys can no longer disagree.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Not while the index dialog is open, and not while someone is typing a
      // page number into it — the arrows belong to the caret there.
      if (isIndexOpen) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      setKeyboardDriven(true);
      setChromeVisible(true);
      if (e.key === "ArrowRight") paginate(-1);
      else if (e.key === "ArrowLeft") paginate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIndexOpen, paginate]);

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
        if (offset <= -SWIPE_THRESHOLD) paginate(1);
        else if (offset >= SWIPE_THRESHOLD) paginate(-1);
      }
      drag.current = { pointerId: -1, startX: 0, engaged: false };
    },
    [paginate],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a, [role='switch']")) return;
    setKeyboardDriven(false);
    drag.current = { pointerId: event.pointerId, startX: event.clientX, engaged: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    const offset = event.clientX - drag.current.startX;
    if (!drag.current.engaged) {
      if (Math.abs(offset) < 12) return;
      drag.current.engaged = true;
      setChromeVisible(false);
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
    const wasDragging = drag.current.engaged;
    endDrag(event.clientX);
    // A tap on the paper — not a drag, not a control — is the gesture every
    // reader tries first for "show me the controls again".
    if (!wasDragging && !(event.target as HTMLElement).closest("[data-mushaf-chrome], button, a")) {
      setChromeVisible((visible) => !visible);
    }
  };

  /** The options menu opens in a portal, outside the page, so it cannot inherit
   *  the paper. Without this it arrived in the app's own popover colours and
   *  read as a different product sitting on top of the Mushaf. */
  const menuSurfaceClass = {
    parchment: "bg-[#fbf7ee] text-[#1c1917] border-primary/25 dark:bg-[#141820] dark:text-[#f3f4f6]",
    dark: "bg-[#0b0e14] text-[#f3f4f6] border-primary/25",
    oled: "bg-black text-white border-white/40",
    white: "bg-white text-[#111827] border-gray-300",
  }[theme];
  const isArabic = language === "ar";
  const backIcon = isArabic ? <ArrowRight size={20} /> : <ArrowLeft size={20} />;
  const headerActionClass =
    "inline-flex min-h-11 min-w-0 shrink-0 items-center justify-center gap-1 rounded-xl px-1.5 text-[0.6875rem] font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const footerActionClass =
    "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.625rem] font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

  const pageHeader = (
    <div className="flex w-full min-w-0 items-center gap-1" dir={direction}>
      <button type="button" onClick={onBack} className={headerActionClass} aria-label={t(language, "common.back")}>
        {backIcon}
        <span>{t(language, "common.back")}</span>
      </button>
      <button
        type="button"
        onClick={() => setIsIndexOpen(true)}
        className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1.5 text-center font-arabic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t(language, "mushaf.indexTitle")}
      >
        <span className="min-w-0 truncate text-sm font-extrabold">{surahName}</span>
        {/* Four targets share a 320px header now that difficult words has its own
            switch. The juz and the chevron are the parts a reader can lose: the
            surah name is the one that must never truncate to a single letter. */}
        <span className="hidden shrink-0 text-[0.6875rem] font-bold opacity-70 min-[380px]:inline">
          · {t(language, "common.juz")} {formatNumerals(juzNumber, language)}
        </span>
        <ChevronDown size={16} className="hidden shrink-0 opacity-60 min-[360px]:block" aria-hidden="true" />
      </button>
      {/* A pill that fills when it is on. The old control was an icon beside a
          4x7 track — technically a switch, but too small to read at a glance
          and too small to be an easy target. */}
      <button
        type="button"
        role="switch"
        aria-checked={showWordMeanings}
        onClick={() => setShowWordMeanings((current) => !current)}
        className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 text-[0.6875rem] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 ${
          showWordMeanings ? "border-primary bg-primary text-primary-foreground" : "border-current/25 bg-current/5"
        }`}
        aria-label={t(language, "mushaf.difficultWordsInvite")}
        data-testid="mushaf-difficult-words-switch"
      >
        <Eye size={17} aria-hidden="true" />
        <span className="hidden min-[420px]:inline">{t(language, "mushaf.difficultWordsInvite")}</span>
      </button>
      {/* Saving your place is a single, frequent, reversible act — it belongs on
          the bar, not two taps deep behind a menu of unrelated settings. */}
      <button
        type="button"
        onClick={toggleBookmark}
        aria-pressed={isCurrentBookmarked}
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isCurrentBookmarked ? "border-primary bg-primary text-primary-foreground" : "border-current/25 bg-current/5"
        }`}
        aria-label={t(language, "mushaf.savePlace")}
        data-testid="mushaf-save-place"
      >
        <Bookmark size={17} className={isCurrentBookmarked ? "fill-current" : ""} aria-hidden="true" />
      </button>
      {/* What is left is one kind of thing: how the page looks. */}
      <DropdownMenu dir={direction} open={isOptionsMenuOpen} onOpenChange={setIsOptionsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-current/25 bg-current/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t(language, "mushaf.themeMenu")}
          >
            <Brush size={17} aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={`min-w-[12rem] ${menuSurfaceClass}`}>
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-bold opacity-70">
            <Brush size={15} aria-hidden="true" />
            <span>{t(language, "mushaf.themeTitle")}</span>
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(value) => handleSelectTheme(value as MushafTheme)}>
            {(
              [
                ["parchment", t(language, "mushaf.themeParchment")],
                ["dark", t(language, "mushaf.themeDark")],
                ["oled", t(language, "mushaf.themeOled")],
                ["white", t(language, "mushaf.themeWhite")],
              ] as const
            ).map(([id, label]) => (
              <DropdownMenuRadioItem key={id} value={id}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const pageFooter = (
    <nav
      dir="ltr"
      aria-label={t(language, "mushaf.pageNavigation")}
      className="flex w-full items-center justify-between gap-1"
    >
      {/* Forward sits on the left, because that is the way the pages turn. */}
      <button
        type="button"
        onClick={() => paginate(1)}
        disabled={currentPage >= LAST_PAGE}
        className={footerActionClass}
        aria-label={t(language, "common.next")}
      >
        <ChevronLeft size={22} />
        <span className="truncate">{t(language, "common.next")}</span>
      </button>
      {/* Where you are on the paper. Kept apart from how today's wird is going,
          which lives on the bar above it — one is a location, the other is a
          measure of effort, and running them together read as one number. */}
      <div className="flex min-h-14 min-w-0 flex-1 items-center justify-center px-1" dir={direction}>
        <span className="truncate text-[0.75rem] font-extrabold tabular-nums">
          {t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}
        </span>
      </div>
      <button
        type="button"
        onClick={() => paginate(-1)}
        disabled={currentPage <= 1}
        className={footerActionClass}
        aria-label={t(language, "common.previous")}
      >
        <ChevronRight size={22} />
        <span className="truncate">{t(language, "common.previous")}</span>
      </button>
    </nav>
  );

  /** What stays on the paper once the controls step aside: where you are, and
   *  how today's wird is going. Both are the questions a reader actually asks
   *  mid-page, and neither is worth a tap. */
  const pageStatus = (
    <div
      className="flex w-full items-center justify-between gap-3 text-[0.6875rem] font-bold opacity-70"
      dir={direction}
    >
      <span className="tabular-nums">
        {t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}
      </span>
      {wirdGoal > 0 && (
        <span className={wirdComplete ? "text-success opacity-100" : ""}>
          {wirdComplete
            ? t(language, "mushaf.wirdComplete")
            : t(language, "mushaf.wirdRemaining", {
                count: formatNumerals(Math.max(wirdGoal - wirdRead, 0), language),
                goal: formatNumerals(wirdGoal, language),
              })}
        </span>
      )}
    </div>
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
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onFocusCapture={(event) => {
          if ((event.target as HTMLElement).closest("[data-mushaf-chrome]")) {
            setChromeFocused(true);
            revealChrome();
          }
        }}
        onBlurCapture={() => setChromeFocused(false)}
        style={{ touchAction: "pan-y" }}
      >
        {!pageData && !error && (
          <div className="absolute inset-0 flex items-center justify-center" aria-live="polite">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
          <div key={displayPage} className={`h-full w-full ${reduceMotion ? "" : "animate-in fade-in duration-150"}`}>
            <MushafPageViewer
              lines={lines}
              language={language}
              pageNumber={displayPage}
              surahName={surahName}
              juzNumber={juzNumber}
              direction={direction}
              theme={theme}
              isBookmarked={isCurrentBookmarked}
              useQcfGlyphs={useQcfGlyphs}
              showWordMeanings={showWordMeanings}
              headerContent={pageHeader}
              footerContent={pageFooter}
              footerStatus={pageStatus}
              progressBar={wirdProgressBar}
              chromeVisible={chromeVisible}
              paperRef={paperRef}
            />
          </div>
        )}
      </div>

      {/* Wird completed */}
      {wirdComplete && completionSeen === todayKey && (
        <div
          role="status"
          data-testid="mushaf-wird-complete"
          className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex justify-center px-4"
        >
          <div className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-success/40 bg-success/12 px-4 py-2.5 shadow-raised backdrop-blur">
            <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden="true" />
            <div className="min-w-0" dir={direction}>
              <p className="truncate text-[0.8125rem] font-extrabold">{t(language, "mushaf.wirdComplete")}</p>
              <p className="truncate text-[0.6875rem] opacity-80">
                {t(language, "mushaf.wirdCompleteBody", { goal: formatNumerals(wirdGoal, language) })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCompletionSeen(null)}
              className="ms-1 shrink-0 rounded-full p-1 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t(language, "common.close")}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Index & Navigation Modal */}
      <MushafNavigationModal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        currentPage={currentPage}
        onSelectPage={setKhatmahPage}
        language={language}
        direction={direction}
        bookmarks={bookmarks}
      />
    </ScreenContainer>
  );
}
