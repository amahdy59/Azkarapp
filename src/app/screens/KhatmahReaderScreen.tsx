import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type { AppLanguage, MushafTheme, QuranReadingPosition, QuranWirdPlan } from "../types";
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Eye,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  MoreHorizontal,
  Brush,
} from "../components/icons";
import { useReducedMotion } from "motion/react";
import { MushafPageViewer } from "../components/MushafPageViewer";
import { MushafNavigationModal } from "../components/MushafNavigationModal";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { getSurahDisplayName, getJuzNumberForPage } from "../content/surahInfo";
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
   * DEC-089: the control that points forward advances the Mushaf, in Arabic and
   * in English alike. The reader used to invert both the arrow keys and the
   * footer buttons under RTL, which read as backwards to everyone using it.
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
      if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
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

  const pageAlreadyRecorded = todayPagesRead.includes(currentPage);
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
      <button
        type="button"
        role="switch"
        aria-checked={showWordMeanings}
        onClick={() => setShowWordMeanings((current) => !current)}
        className={`${headerActionClass} gap-1.5`}
        aria-label={t(language, "mushaf.difficultWords")}
        data-testid="mushaf-difficult-words-switch"
      >
        <Eye size={18} aria-hidden="true" />
        <span className="hidden sm:inline">{t(language, "mushaf.difficultWords")}</span>
        <span
          aria-hidden="true"
          className={`flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors ${
            showWordMeanings ? "justify-end border-primary bg-primary" : "justify-start border-current/40 bg-current/15"
          }`}
        >
          <span
            className={`m-px size-3 rounded-full ${showWordMeanings ? "bg-primary-foreground" : "bg-current opacity-70"}`}
          />
        </span>
      </button>
      <DropdownMenu dir={direction} open={isOptionsMenuOpen} onOpenChange={setIsOptionsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className={headerActionClass} aria-label={t(language, "mushaf.options")}>
            <MoreHorizontal size={18} />
            <span>{t(language, "mushaf.options")}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[14rem]">
          <DropdownMenuCheckboxItem checked={isCurrentBookmarked} onCheckedChange={toggleBookmark}>
            <Bookmark size={18} className={isCurrentBookmarked ? "fill-primary" : ""} />
            <span>{t(language, "mushaf.toggleBookmark")}</span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Brush size={16} aria-hidden="true" />
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
      <button
        type="button"
        onClick={() => paginate(-1)}
        disabled={currentPage <= 1}
        className={footerActionClass}
        aria-label={t(language, "common.previous")}
      >
        <ChevronLeft size={22} />
        <span className="truncate">{t(language, "common.previous")}</span>
      </button>
      <button
        type="button"
        onClick={recordCurrentPage}
        disabled={pageAlreadyRecorded}
        className={`${footerActionClass} shrink-0 basis-auto px-4 ${
          pageAlreadyRecorded
            ? "bg-primary/15 text-foreground/70 disabled:opacity-100"
            : "bg-primary text-primary-foreground"
        }`}
        aria-label={pageAlreadyRecorded ? t(language, "mushaf.pageRecorded") : t(language, "mushaf.recordPage")}
      >
        <CheckCircle2 size={19} aria-hidden="true" className={pageAlreadyRecorded ? "fill-primary/30" : ""} />
        <span className="truncate">
          {pageAlreadyRecorded ? t(language, "mushaf.pageRecorded") : t(language, "mushaf.recordPage")}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setIsIndexOpen(true)}
        className={footerActionClass}
        aria-label={t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}
      >
        <BookOpen size={19} aria-hidden="true" />
        <span className="truncate">
          {t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}
        </span>
      </button>
      <button
        type="button"
        onClick={() => paginate(1)}
        disabled={currentPage >= LAST_PAGE}
        className={footerActionClass}
        aria-label={t(language, "common.next")}
      >
        <ChevronRight size={22} />
        <span className="truncate">{t(language, "common.next")}</span>
      </button>
    </nav>
  );

  /** What stays on the paper once the controls step aside: where you are, and
   *  how today's wird is going. Both are the questions a reader actually asks
   *  mid-page, and neither is worth a tap. */
  const pageStatus = (
    <div
      className="flex w-full items-center justify-center gap-3 text-[0.6875rem] font-bold opacity-70"
      dir={direction}
    >
      <span>{t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}</span>
      {wirdGoal > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {t(language, "mushaf.wirdToday")} {formatNumerals(wirdRead, language)}/{formatNumerals(wirdGoal, language)}
          </span>
        </>
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
          className="h-full bg-primary transition-[width] duration-standard ease-standard"
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
