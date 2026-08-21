import { useEffect, useState, useMemo, useCallback } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { ChevronRight, ChevronLeft, RotateCcw } from "../components/icons";
import { motion, AnimatePresence } from "motion/react";
import { MushafPageViewer } from "../components/MushafPageViewer";
import * as Switch from "@radix-ui/react-switch";
import { getSurahDisplayName, getJuzNumberForPage } from "../content/surahInfo";

export function KhatmahReaderScreen({
  language,
  direction,
  onBack,
  khatmahPage,
  setKhatmahPage,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  khatmahPage: number;
  setKhatmahPage: (page: number) => void;
}) {
  const currentPage = Math.max(1, Math.min(604, khatmahPage || 1));

  const [pageData, setPageData] = useState<{ k: string; w: [number, number, number, string][] }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [highlightGhareeb, setHighlightGhareeb] = useState(false);

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

  // Transform data into lines (1 to 15)
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

  // Compute the current Surah and Juz for the header
  const { surahName, juzNumber } = useMemo(() => {
    if (!pageData || pageData.length === 0) {
      return {
        surahName: "",
        juzNumber: getJuzNumberForPage(currentPage),
      };
    }
    // Get the first verse on the page
    const firstVerseKey = pageData[0]?.k || "1:1";
    const [surah] = firstVerseKey.split(":");
    return {
      surahName: getSurahDisplayName(surah || "1", language),
      juzNumber: getJuzNumberForPage(currentPage),
    };
  }, [pageData, currentPage, language]);

  const paginate = (newDirection: number) => {
    const nextPage = currentPage + newDirection;
    if (nextPage < 1 || nextPage > 604) return;
    setSwipeDirection(newDirection);
    setKhatmahPage(nextPage);
  };

  const isArabic = language === "ar";
  // In Arabic (RTL), next page in Mushaf goes to left (higher page), previous to right
  const nextIcon = isArabic ? <ChevronLeft size={24} /> : <ChevronRight size={24} />;
  const prevIcon = isArabic ? <ChevronRight size={24} /> : <ChevronLeft size={24} />;

  return (
    <ScreenContainer
      dir={direction}
      screenName={t(language, "common.mushaf") || "Mushaf"}
      className="relative flex flex-col h-full bg-background"
    >
      <Header title={t(language, "common.mushaf") || "Mushaf"} onBack={onBack} language={language} />

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4">
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
              initial={{ x: swipeDirection > 0 ? (isArabic ? -300 : 300) : isArabic ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: swipeDirection > 0 ? (isArabic ? 300 : -300) : isArabic ? -300 : 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 p-2 sm:p-4 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-full max-w-[480px] sm:max-w-[540px] md:max-w-[600px] max-h-[85vh] pointer-events-auto">
                <MushafPageViewer
                  lines={lines}
                  language={language}
                  pageNumber={currentPage}
                  surahName={surahName}
                  juzNumber={juzNumber}
                  highlightGhareeb={highlightGhareeb}
                  direction={direction}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 p-4 flex flex-col gap-4 bg-card border-t border-border shadow-raised z-10">
        <div className="flex justify-between items-center px-2">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
            <Switch.Root
              className="w-10 h-6 bg-switch-background rounded-full relative data-[state=checked]:bg-primary outline-none focus:ring-2 focus:ring-ring"
              checked={highlightGhareeb}
              onCheckedChange={setHighlightGhareeb}
              id="ghareeb-toggle"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[1.125rem]" />
            </Switch.Root>
            {t(language, "mushaf.highlightGhareeb") || "Highlight Difficult Words"}
          </label>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => paginate(isArabic ? 1 : -1)}
            disabled={currentPage === (isArabic ? 604 : 1)}
            className="ui-icon-button"
            aria-label={t(language, "common.next") || "Next"}
          >
            {prevIcon}
          </button>

          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2" dir="ltr">
            {Math.round((currentPage / 604) * 100)}%
          </span>

          <button
            onClick={() => paginate(isArabic ? -1 : 1)}
            disabled={currentPage === (isArabic ? 1 : 604)}
            className="ui-icon-button"
            aria-label={t(language, "common.previous") || "Previous"}
          >
            {nextIcon}
          </button>
        </div>
      </div>
    </ScreenContainer>
  );
}
