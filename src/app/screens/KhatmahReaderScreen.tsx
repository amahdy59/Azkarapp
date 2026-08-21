import { useEffect, useState, useMemo } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { ChevronRight, ChevronLeft, BookOpen, Settings } from "../components/icons";
import { motion, AnimatePresence } from "motion/react";

export function KhatmahReaderScreen({
  language,
  direction,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
}) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageData, setPageData] = useState<{ k: string; w: [number, number, number, string][] }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/data/mushaf/" + currentPage + ".json")
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setPageData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load Mushaf page", err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentPage]);

  // Transform data into lines
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

  const paginate = (newDirection: number) => {
    const nextPage = currentPage + newDirection;
    if (nextPage < 1 || nextPage > 604) return;
    setSwipeDirection(newDirection);
    setCurrentPage(nextPage);
  };

  const isArabic = language === "ar";
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
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
              className="w-full max-w-[var(--content-reading)] h-full max-h-[85vh] bg-[#fdfaf6] dark:bg-[#0c0c0c] border border-border shadow-sm rounded-xl p-4 flex flex-col justify-between"
              dir="rtl"
              style={{ fontFamily: "var(--font-mushaf)" }}
            >
              <div className="flex justify-between items-center px-4 mb-4 text-[0.75rem] font-bold text-muted-foreground font-sans">
                <span>?????</span>
                <span>????</span>
              </div>

              <div className="flex-1 flex flex-col justify-around">
                {lines.map((lineWords, lineIdx) => {
                  if (!lineWords || lineWords.length === 0) {
                    return <div key={lineIdx} className="h-8" aria-hidden="true" />;
                  }

                  return (
                    <div
                      key={lineIdx}
                      className="flex justify-between items-baseline w-full"
                      style={{ direction: "rtl" }}
                    >
                      {lineWords.map((w, wIdx) => (
                        <span
                          key={w.verseKey + "-" + w.position + "-" + wIdx}
                          className={
                            "inline-block leading-tight text-center " +
                            (w.isEnd
                              ? "text-primary text-[1.1em] mx-1"
                              : "text-[1.5rem] sm:text-[1.8rem] md:text-[2rem]")
                          }
                          dangerouslySetInnerHTML={{ __html: w.text }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center items-center mt-4 text-[0.75rem] font-bold text-muted-foreground font-sans">
                {currentPage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 p-4 flex justify-between items-center bg-card border-t border-border shadow-raised">
        <button
          onClick={() => paginate(isArabic ? 1 : -1)}
          disabled={currentPage === (isArabic ? 604 : 1)}
          className="p-3 rounded-full bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
        >
          {prevIcon}
        </button>

        <div className="flex gap-2">
          <button className="p-3 rounded-full bg-muted text-foreground hover:bg-muted/80">
            <BookOpen size={20} />
          </button>
          <button className="p-3 rounded-full bg-muted text-foreground hover:bg-muted/80">
            <Settings size={20} />
          </button>
        </div>

        <button
          onClick={() => paginate(isArabic ? -1 : 1)}
          disabled={currentPage === (isArabic ? 1 : 604)}
          className="p-3 rounded-full bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
        >
          {nextIcon}
        </button>
      </div>
    </ScreenContainer>
  );
}
