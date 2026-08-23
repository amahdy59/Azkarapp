import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type { AppLanguage, MushafTheme, QuranReadingPosition } from "../types";
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
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

interface ResolvedPage {
  page: number;
  data: MushafVerseData[];
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
  onReadingPositionChange?: (position: QuranReadingPosition) => void;
}) {
  const currentPage = Math.max(1, Math.min(LAST_PAGE, khatmahPage || 1));

  const [theme, setTheme] = useState<MushafTheme>(initialTheme);
  const [bookmarks, setBookmarks] = useState<number[]>(initialBookmarks);
  const [resolved, setResolved] = useState<ResolvedPage | null>(() => {
    const cached = getCachedMushafPage(currentPage);
    return cached ? { page: currentPage, data: cached } : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsFocused, setControlsFocused] = useState(false);
  const [showWordMeanings, setShowWordMeanings] = useState(false);
  const [qcfFontReady, setQcfFontReady] = useState(() => isQcfFontReady(currentPage));
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

    const cached = getCachedMushafPage(currentPage);
    if (cached) {
      setResolved({ page: currentPage, data: cached });
      setError(null);
    }

    void loadMushafPage(currentPage)
      .then((data) => {
        if (!active) return;
        setResolved({ page: currentPage, data });
        setError(null);
      })
      .catch((reason) => {
        if (!active) return;
        console.error("Failed to load Mushaf page", reason);
        setError(t(language, "mushaf.loadFailed"));
      });

    setQcfFontReady(isQcfFontReady(currentPage));
    void loadQcfFont(currentPage).then((ready) => {
      if (active && ready) setQcfFontReady(isQcfFontReady(currentPage));
    });

    return () => {
      active = false;
    };
  }, [currentPage, language, reloadToken]);

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

  useEffect(() => {
    setControlsVisible(true);
  }, [currentPage]);

  useEffect(() => {
    if (!controlsVisible || controlsFocused || isIndexOpen || isOptionsMenuOpen) return;
    const timer = window.setTimeout(() => setControlsVisible(false), 3500);
    return () => window.clearTimeout(timer);
  }, [controlsVisible, controlsFocused, currentPage, isIndexOpen, isOptionsMenuOpen]);

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

  const pageCarriesGlyphs = useMemo(() => !!pageData && pageHasQcfGlyphs(pageData), [pageData]);
  const useQcfGlyphs = qcfFontReady && displayPage === currentPage && pageCarriesGlyphs;

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
    drag.current = { pointerId: event.pointerId, startX: event.clientX, engaged: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    const offset = event.clientX - drag.current.startX;
    if (!drag.current.engaged) {
      if (Math.abs(offset) < 12) return;
      drag.current.engaged = true;
      setControlsVisible(false);
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
        disabled={todayPagesRead.includes(currentPage)}
        className={`${footerActionClass} bg-primary text-primary-foreground`}
        aria-label={t(language, "mushaf.recordPage")}
      >
        <CheckCircle2 size={19} aria-hidden="true" />
        <span className="truncate">{t(language, "mushaf.recordPage")}</span>
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

  const revealPageControls = (
    <div className="flex w-full justify-center">
      <button
        type="button"
        onClick={() => setControlsVisible(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t(language, "mushaf.showPageControls")}
      >
        <SlidersHorizontal size={18} />
        <span>{t(language, "mushaf.pageControls")}</span>
      </button>
    </div>
  );

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
          <div
            ref={paperRef}
            key={displayPage}
            className={`h-full w-full ${reduceMotion ? "" : "animate-in fade-in duration-150"}`}
          >
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
              controlsVisible={controlsVisible}
              headerContent={pageHeader}
              footerContent={pageFooter}
              hiddenControlsContent={revealPageControls}
              onControlsFocusChange={setControlsFocused}
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
