import { useEffect, useState, useMemo, useCallback } from "react";
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
} from "../components/icons";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MushafPageViewer } from "../components/MushafPageViewer";
import { MushafNavigationModal } from "../components/MushafNavigationModal";
import * as Popover from "@radix-ui/react-popover";
import { getSurahDisplayName, getJuzNumberForPage } from "../content/surahInfo";
import { formatNumerals } from "../formatting";
import { getProgressDayKey } from "../progress";
import {
  fetchQcfPage,
  getQcfFontFamily,
  getQcfFontUrl,
  mergeQcfPage,
  type MushafVerseData,
} from "../content/qcfMushaf";

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
  const currentPage = Math.max(1, Math.min(604, khatmahPage || 1));

  const [theme, setTheme] = useState<MushafTheme>(initialTheme);
  const [bookmarks, setBookmarks] = useState<number[]>(initialBookmarks);
  const [pageData, setPageData] = useState<MushafVerseData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsFocused, setControlsFocused] = useState(false);
  const [showWordMeanings, setShowWordMeanings] = useState(false);
  const [qcfFontReady, setQcfFontReady] = useState(false);
  const reduceMotion = useReducedMotion();

  // Sync internal theme with prop updates
  useEffect(() => {
    if (initialTheme) setTheme(initialTheme);
  }, [initialTheme]);

  // Sync bookmarks with prop updates
  useEffect(() => {
    if (initialBookmarks) setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  const handleSelectTheme = (newTheme: MushafTheme) => {
    setTheme(newTheme);
    onUpdateTheme?.(newTheme);
    setIsThemeMenuOpen(false);
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
  const todayPagesRead = useMemo(() => {
    const list = wirdHistory[todayKey] ?? [];
    return list;
  }, [todayKey, wirdHistory]);

  const recordCurrentPage = useCallback(() => {
    if (!onUpdateWirdHistory) return;
    const dayKey = getProgressDayKey();
    const currentList = wirdHistory[dayKey] ?? [];
    if (!currentList.includes(currentPage)) {
      const nextList = [...currentList, currentPage];
      onUpdateWirdHistory({ ...wirdHistory, [dayKey]: nextList });
    }
  }, [currentPage, onUpdateWirdHistory, wirdHistory]);

  const loadPage = useCallback(
    (page: number) => {
      let active = true;
      const controller = new AbortController();
      setLoading(true);
      setError(null);
      setQcfFontReady(false);

      const baseUrl = import.meta.env.BASE_URL || "/";
      const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      const targetUrl = `${cleanBase}data/mushaf/${page}.json`;

      void (async () => {
        let localPage: MushafVerseData[] | null = null;
        try {
          const response = await fetch(targetUrl, { signal: controller.signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          localPage = (await response.json()) as MushafVerseData[];
          if (active) {
            setPageData(localPage);
            setLoading(false);
          }
        } catch (localError) {
          if (controller.signal.aborted) return;
          console.error("Failed to load local Mushaf page", localError);
        }

        try {
          const qcfPage = await fetchQcfPage(page, controller.signal);
          if (active) {
            setPageData(localPage ? mergeQcfPage(localPage, qcfPage) : qcfPage);
            setLoading(false);
          }
        } catch (qcfError) {
          if (controller.signal.aborted) return;
          if (!localPage && active) {
            console.error("Failed to load Mushaf page", qcfError);
            setError(t(language, "mushaf.loadFailed"));
            setLoading(false);
          }
        }
      })();

      return () => {
        active = false;
        controller.abort();
      };
    },
    [language],
  );

  useEffect(() => {
    return loadPage(currentPage);
  }, [currentPage, loadPage]);

  useEffect(() => {
    if (!pageData?.some((verse) => verse.w.some((word) => Boolean(word[4])))) return;
    if (typeof FontFace === "undefined" || !document.fonts) return;
    let active = true;
    const pageFont = new FontFace(getQcfFontFamily(currentPage), `url(${getQcfFontUrl(currentPage)})`, {
      display: "swap",
    });
    void pageFont
      .load()
      .then((loadedFont) => {
        if (!active) return;
        document.fonts.add(loadedFont);
        setQcfFontReady(true);
      })
      .catch(() => {
        if (active) setQcfFontReady(false);
      });
    return () => {
      active = false;
    };
  }, [currentPage, pageData]);

  useEffect(() => {
    setControlsVisible(true);
  }, [currentPage]);

  useEffect(() => {
    if (!controlsVisible || controlsFocused || isIndexOpen || isThemeMenuOpen) return;
    const timer = window.setTimeout(() => setControlsVisible(false), 3500);
    return () => window.clearTimeout(timer);
  }, [controlsVisible, controlsFocused, currentPage, isIndexOpen, isThemeMenuOpen]);

  // Transform data into 15 lines
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
    for (let i = 1; i <= 15; i++) {
      result.push(lineMap.get(i) || []);
    }
    return result;
  }, [pageData]);

  // Compute Surah and Juz for the header
  const { surahName, juzNumber } = useMemo(() => {
    if (!pageData || pageData.length === 0) {
      return {
        surahName: "",
        juzNumber: getJuzNumberForPage(currentPage),
      };
    }
    const firstVerseKey = pageData[0]?.k || "1:1";
    const [surah] = firstVerseKey.split(":");
    return {
      surahName: getSurahDisplayName(surah || "1", language),
      juzNumber: getJuzNumberForPage(currentPage),
    };
  }, [pageData, currentPage, language]);

  useEffect(() => {
    if (!pageData?.length) return;
    const [surahNumber, ayahNumber] = (pageData.at(-1)?.k ?? "1:1").split(":").map(Number);
    onReadingPositionChange?.({ page: currentPage, surahNumber, ayahNumber, juzNumber });
  }, [currentPage, juzNumber, onReadingPositionChange, pageData]);

  const paginate = useCallback(
    (newDirection: number) => {
      const nextPage = currentPage + newDirection;
      if (nextPage < 1 || nextPage > 604) return;
      setSwipeDirection(newDirection);
      setKhatmahPage(nextPage);
    },
    [currentPage, setKhatmahPage],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        paginate(direction === "rtl" ? 1 : -1);
      } else if (e.key === "ArrowRight") {
        paginate(direction === "rtl" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, paginate]);

  const isArabic = language === "ar";
  const backIcon = isArabic ? <ArrowRight size={20} /> : <ArrowLeft size={20} />;
  const leftPageDelta = isArabic ? 1 : -1;
  const rightPageDelta = -leftPageDelta;

  const pageHeader = (
    <div className="flex w-full min-w-0 items-center gap-1" dir={direction}>
      <button
        type="button"
        onClick={onBack}
        className="ui-icon-button shrink-0"
        aria-label={t(language, "common.back")}
      >
        {backIcon}
      </button>
      <button
        type="button"
        onClick={() => setIsIndexOpen(true)}
        className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1.5 text-center font-arabic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t(language, "mushaf.indexTitle")}
      >
        <span className="min-w-0 truncate text-sm font-extrabold">{surahName}</span>
        <span className="shrink-0 text-[0.6875rem] font-bold opacity-70">
          · {t(language, "common.juz")} {formatNumerals(juzNumber, language)}
        </span>
        <ChevronDown size={16} className="shrink-0 opacity-60" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setShowWordMeanings((shown) => !shown)}
        className={`ui-icon-button shrink-0 ${showWordMeanings ? "bg-primary/15 text-primary" : ""}`}
        aria-label={t(language, showWordMeanings ? "mushaf.hideWordMeanings" : "mushaf.showWordMeanings")}
        aria-pressed={showWordMeanings}
      >
        <Eye size={18} />
      </button>
      <Popover.Root open={isThemeMenuOpen} onOpenChange={setIsThemeMenuOpen}>
        <Popover.Trigger asChild>
          <button type="button" className="ui-icon-button shrink-0" aria-label={t(language, "mushaf.themeTitle")}>
            <SlidersHorizontal size={18} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={8}
            dir={direction}
            className="z-50 w-52 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-overlay"
          >
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-bold text-muted-foreground">
                {t(language, "mushaf.themeTitle")}
              </span>
              {(
                [
                  ["parchment", t(language, "mushaf.themeParchment")],
                  ["dark", t(language, "mushaf.themeDark")],
                  ["oled", t(language, "mushaf.themeOled")],
                  ["white", t(language, "mushaf.themeWhite")],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectTheme(id)}
                  className={`min-h-11 rounded-xl px-3 text-start text-xs font-bold ${theme === id ? "bg-primary/15 text-primary" : "hover:bg-muted"}`}
                  aria-pressed={theme === id}
                >
                  {label}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <button
        type="button"
        onClick={toggleBookmark}
        className={`ui-icon-button shrink-0 ${isCurrentBookmarked ? "bg-primary/15 text-primary" : ""}`}
        aria-label={t(language, "mushaf.toggleBookmark")}
        aria-pressed={isCurrentBookmarked}
      >
        <Bookmark size={18} className={isCurrentBookmarked ? "fill-primary" : ""} />
      </button>
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
        onClick={() => paginate(leftPageDelta)}
        disabled={currentPage + leftPageDelta < 1 || currentPage + leftPageDelta > 604}
        className="ui-icon-button shrink-0"
        aria-label={t(language, leftPageDelta > 0 ? "common.next" : "common.previous")}
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={recordCurrentPage}
        disabled={todayPagesRead.includes(currentPage)}
        className="ui-icon-button shrink-0 bg-primary text-primary-foreground disabled:opacity-45"
        aria-label={t(language, "mushaf.recordPage")}
      >
        <span aria-hidden="true" className="text-base font-black">
          {todayPagesRead.includes(currentPage) ? "✓" : "+"}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setIsIndexOpen(true)}
        className="min-h-11 min-w-16 rounded-xl px-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}
      >
        {formatNumerals(currentPage, language)}
      </button>
      <button
        type="button"
        onClick={() => paginate(rightPageDelta)}
        disabled={currentPage + rightPageDelta < 1 || currentPage + rightPageDelta > 604}
        className="ui-icon-button shrink-0"
        aria-label={t(language, rightPageDelta > 0 ? "common.next" : "common.previous")}
      >
        <ChevronRight size={22} />
      </button>
    </nav>
  );

  const revealPageControls = (
    <div className="flex w-full justify-center">
      <button
        type="button"
        onClick={() => setControlsVisible(true)}
        className="ui-icon-button"
        aria-label={t(language, "mushaf.showPageControls")}
      >
        <SlidersHorizontal size={18} />
      </button>
    </div>
  );

  return (
    <ScreenContainer
      dir={direction}
      screenName={t(language, "common.mushaf")}
      className="relative flex flex-col h-full bg-background select-none overflow-hidden"
    >
      {/* Main Mushaf Page Display Canvas */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-muted/15 p-0 sm:p-3">
        {loading && !pageData && (
          <div className="absolute inset-0 flex items-center justify-center" aria-live="polite">
            <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {error && !loading && !pageData && (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-[0.9375rem] font-bold text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => loadPage(currentPage)}
              className="flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-[0.875rem] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <RotateCcw size={16} />
              <span>{t(language, "mushaf.retry")}</span>
            </button>
          </div>
        )}

        <AnimatePresence initial={false} custom={swipeDirection}>
          {!loading && pageData && (
            <motion.div
              key={currentPage}
              custom={swipeDirection}
              initial={{ x: reduceMotion ? 0 : swipeDirection > 0 ? 300 : -300, opacity: reduceMotion ? 1 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reduceMotion ? 0 : swipeDirection > 0 ? -300 : 300, opacity: reduceMotion ? 1 : 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragStart={() => setControlsVisible(false)}
              onDragEnd={(_, info) => {
                if (info.offset.x <= -60 || info.velocity.x <= -500) paginate(1);
                else if (info.offset.x >= 60 || info.velocity.x >= 500) paginate(-1);
              }}
              className="absolute inset-0 flex cursor-grab items-center justify-center p-0 active:cursor-grabbing sm:p-3"
            >
              <div className="h-full w-full max-w-[500px] sm:max-w-[580px] md:max-w-[640px]">
                <MushafPageViewer
                  lines={lines}
                  language={language}
                  pageNumber={currentPage}
                  surahName={surahName}
                  juzNumber={juzNumber}
                  direction={direction}
                  theme={theme}
                  isBookmarked={isCurrentBookmarked}
                  useQcfGlyphs={qcfFontReady}
                  showWordMeanings={showWordMeanings}
                  controlsVisible={controlsVisible}
                  headerContent={pageHeader}
                  footerContent={pageFooter}
                  hiddenControlsContent={revealPageControls}
                  onControlsFocusChange={setControlsFocused}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Index & Navigation Modal */}
      <MushafNavigationModal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        currentPage={currentPage}
        onSelectPage={(page) => {
          setSwipeDirection(0);
          setKhatmahPage(page);
        }}
        language={language}
        direction={direction}
        bookmarks={bookmarks}
      />
    </ScreenContainer>
  );
}
