import { useEffect, useState, useMemo, useCallback } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type { AppLanguage, MushafTheme, QuranReadingPosition } from "../types";
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
} from "../components/icons";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MushafPageViewer } from "../components/MushafPageViewer";
import { MushafNavigationModal } from "../components/MushafNavigationModal";
import * as Popover from "@radix-ui/react-popover";
import { getSurahDisplayName, getJuzNumberForPage } from "../content/surahInfo";
import { formatNumerals } from "../formatting";
import { getProgressDayKey } from "../progress";

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
  const [pageData, setPageData] = useState<{ k: string; w: [number, number, number, string][] }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
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
      setLoading(true);
      setError(null);

      const baseUrl = import.meta.env.BASE_URL || "/";
      const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      const targetUrl = `${cleanBase}data/mushaf/${page}.json`;

      fetch(targetUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (active) {
            setPageData(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load Mushaf page", err);
          if (active) {
            setError(t(language, "mushaf.loadFailed"));
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    },
    [language],
  );

  useEffect(() => {
    return loadPage(currentPage);
  }, [currentPage, loadPage]);

  // Transform data into 15 lines
  const lines = useMemo(() => {
    if (!pageData) return [];
    const lineMap = new Map<number, { verseKey: string; position: number; isEnd: number; text: string }[]>();
    for (const verse of pageData) {
      for (const w of verse.w) {
        const [position, lineNumber, isEnd, text] = w;
        if (!lineMap.has(lineNumber)) lineMap.set(lineNumber, []);
        lineMap.get(lineNumber)!.push({ verseKey: verse.k, position, isEnd, text });
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

  return (
    <ScreenContainer
      dir={direction}
      screenName={t(language, "common.mushaf")}
      className="relative flex flex-col h-full bg-background select-none overflow-hidden"
    >
      {/* Keep the reading surface dominant: the header holds orientation and only
          the controls that change the page, not a second competing toolbar. */}
      <header className="flex min-h-14 items-center justify-between gap-2 border-b border-border/70 bg-card px-3 py-2 shadow-xs z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t(language, "common.back")}
          >
            {backIcon}
          </button>
          <span className="font-arabic font-bold text-base text-foreground">{t(language, "common.mushaf")}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Index Button */}
          <button
            type="button"
            onClick={() => setIsIndexOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl bg-muted/60 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-auto sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm"
            aria-label={t(language, "mushaf.indexTitle")}
          >
            <BookOpen size={16} className="text-primary" />
            <span className="sr-only sm:not-sr-only">{t(language, "mushaf.tabSurahs")}</span>
          </button>

          {/* Theme Selector Popover */}
          <Popover.Root open={isThemeMenuOpen} onOpenChange={setIsThemeMenuOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-xl bg-muted/60 hover:bg-muted text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t(language, "mushaf.themeTitle")}
              >
                <SlidersHorizontal size={18} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={8}
                dir={direction}
                className="z-50 w-52 p-2 rounded-2xl bg-popover text-popover-foreground shadow-overlay border border-border animate-in fade-in zoom-in-95"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                    {t(language, "mushaf.themeTitle")}
                  </span>
                  {[
                    {
                      id: "parchment" as const,
                      label: t(language, "mushaf.themeParchment"),
                      color: "bg-[#fbf7ee] text-[#1c1917] border-primary/40",
                    },
                    {
                      id: "dark" as const,
                      label: t(language, "mushaf.themeDark"),
                      color: "bg-[#0c0f14] text-[#f3f4f6] border-primary/30",
                    },
                    {
                      id: "oled" as const,
                      label: t(language, "mushaf.themeOled"),
                      color: "bg-[#000000] text-[#ffffff] border-white/50",
                    },
                    {
                      id: "white" as const,
                      label: t(language, "mushaf.themeWhite"),
                      color: "bg-[#ffffff] text-[#111827] border-gray-300",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTheme(item.id)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        theme === item.id ? "bg-primary/15 text-primary" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`size-4 rounded-full border ${item.color}`} />
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Bookmark Toggle */}
          <button
            type="button"
            onClick={toggleBookmark}
            className={`flex size-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isCurrentBookmarked
                ? "bg-primary/15 text-primary"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-label={t(language, "mushaf.toggleBookmark")}
            aria-pressed={isCurrentBookmarked}
          >
            <Bookmark size={18} className={isCurrentBookmarked ? "fill-primary" : ""} />
          </button>
        </div>
      </header>

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
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav
        dir="ltr"
        aria-label={t(language, "mushaf.pageNavigation")}
        className="z-20 flex shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-3 py-2.5 shadow-raised sm:px-5"
      >
        <button
          type="button"
          onClick={() => paginate(leftPageDelta)}
          disabled={currentPage + leftPageDelta < 1 || currentPage + leftPageDelta > 604}
          className="ui-icon-button shrink-0"
          aria-label={t(language, leftPageDelta > 0 ? "common.next" : "common.previous")}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex min-w-0 items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground font-sans sm:gap-2 sm:text-sm">
          <button
            type="button"
            onClick={recordCurrentPage}
            disabled={todayPagesRead.includes(currentPage)}
            className="min-h-11 shrink-0 rounded-xl bg-primary px-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:px-3"
          >
            {todayPagesRead.includes(currentPage) ? "✓" : "+"} {t(language, "mushaf.recordPage")}
          </button>
          <button
            type="button"
            onClick={() => setIsIndexOpen(true)}
            className="min-w-0 truncate rounded-md px-1.5 py-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t(language, "mushaf.pageLabel", { page: formatNumerals(currentPage, language) })}
          >
            {formatNumerals(currentPage, language)} / {formatNumerals(604, language)}
          </button>
        </div>

        <button
          type="button"
          onClick={() => paginate(rightPageDelta)}
          disabled={currentPage + rightPageDelta < 1 || currentPage + rightPageDelta > 604}
          className="ui-icon-button shrink-0"
          aria-label={t(language, rightPageDelta > 0 ? "common.next" : "common.previous")}
        >
          <ChevronRight size={24} />
        </button>
      </nav>

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
