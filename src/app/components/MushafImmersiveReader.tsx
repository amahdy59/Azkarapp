import { useCallback, useEffect, useMemo, useRef, useState, startTransition, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, BookOpen, X } from "./icons";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafPageTheme, Zikr } from "../types";
import {
  getCachedMushafPage,
  isQcfFontReady,
  loadCanonicalAyahText,
  loadMushafPage,
  loadQcfFont,
  pageHasQcfGlyphs,
  prefetchMushafPage,
  type MushafVerseData,
} from "../content/qcfMushaf";
import { getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { loadSurahWordMeanings, type QuranWordMeaning, type WordMeaningSelection } from "../content/quranWordMeanings";
import { MushafPageViewer } from "./MushafPageViewer";
import { AyahInteractionSheet } from "./AyahInteractionSheet";
import { reportError } from "../../lib/observability";

const SWIPE_THRESHOLD = 50;
const PAPER_SETTLE = "transform 160ms ease-out";
const FONT_WAIT_MS = 1200;

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
  qcf: boolean;
}

async function resolveMushafPage(page: number, waitForMeanings: boolean): Promise<ResolvedPage> {
  const data = await loadMushafPage(page);
  const surahs = [...new Set(data.map((verse) => verse.k.split(":")[0] ?? ""))].filter(Boolean);
  if (waitForMeanings) await Promise.all(surahs.map((surah) => loadSurahWordMeanings(surah)));

  let qcf = false;
  if (pageHasQcfGlyphs(data)) {
    if (isQcfFontReady(page)) {
      qcf = true;
    } else {
      qcf = await Promise.race([
        loadQcfFont(page),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), FONT_WAIT_MS)),
      ]);
    }
  }
  return { page, data, qcf };
}

export function MushafImmersiveReader({
  zikr,
  language,
  direction,
  title,
  theme = "midnight",
  reducedMotion = false,
  onClose,
  onComplete,
}: {
  zikr: Zikr;
  arabicText?: string;
  meanings?: readonly QuranWordMeaning[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  title: string;
  theme?: MushafPageTheme;
  reducedMotion?: boolean;
  textStyle?: CSSProperties;
  onSelectMeanings?: (selection: WordMeaningSelection) => void;
  activeWordId?: string | null;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const pageNumbers = useMemo(() => {
    if (zikr.mushafPages && zikr.mushafPages.length > 0) {
      return zikr.mushafPages.map((p) => p.page);
    }
    return [1];
  }, [zikr.mushafPages]);

  const [[pageIndex, slideDir], setPageTuple] = useState([0, 1]);
  const [showWordMeanings, setShowWordMeanings] = useState(false);
  const [activeAyah, setActiveAyah] = useState<{ verseKey: string; text: string | null; pageNumber: number } | null>(
    null,
  );
  const ayahRequestId = useRef(0);
  const paperRef = useRef<HTMLDivElement>(null);

  const currentPage = pageNumbers[pageIndex] ?? pageNumbers[0]!;
  const pageCount = pageNumbers.length;

  const [resolved, setResolved] = useState<ResolvedPage | null>(() => {
    const cached = getCachedMushafPage(currentPage);
    if (!cached) return null;
    const hasQcfGlyphs = pageHasQcfGlyphs(cached);
    if (hasQcfGlyphs && !isQcfFontReady(currentPage)) return null;
    return { page: currentPage, data: cached, qcf: hasQcfGlyphs };
  });

  const displayPage = resolved?.page ?? currentPage;
  const pageData = resolved?.data ?? null;

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const next = await resolveMushafPage(currentPage, showWordMeanings);
        if (active && next) {
          setResolved(next);
        }
      } catch (err) {
        reportError(err, "mushaf-immersive-load");
      }
    })();

    return () => {
      active = false;
    };
  }, [currentPage, showWordMeanings]);

  // Aggressive prefetching of adjacent pages
  useEffect(() => {
    for (let i = 1; i <= 3; i++) {
      const nextP = pageNumbers[pageIndex + i];
      if (nextP) prefetchMushafPage(nextP);
      const prevP = pageNumbers[pageIndex - i];
      if (prevP) prefetchMushafPage(prevP);
    }
  }, [pageIndex, pageNumbers]);

  const paginate = useCallback(
    (delta: number) => {
      setPageTuple((prev) => {
        const nextIndex = Math.max(0, Math.min(pageCount - 1, prev[0] + delta));
        return nextIndex !== prev[0] ? [nextIndex, delta] : prev;
      });
    },
    [pageCount],
  );

  // Keyboard navigation: physical direction (ArrowLeft = next page, ArrowRight = previous).
  // Escape is owned by the dialog so nested ayah sheets close in the right order.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeAyah) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "ArrowLeft" || e.key === "PageDown") {
        e.preventDefault();
        paginate(1);
      } else if (e.key === "ArrowRight" || e.key === "PageUp") {
        e.preventDefault();
        paginate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAyah, paginate]);

  // Drag / swipe navigation
  const drag = useRef({ pointerId: -1, startX: 0, engaged: false });

  const endDrag = useCallback(
    (clientX: number | null) => {
      const paper = paperRef.current;
      if (paper) {
        paper.style.transition = reducedMotion ? "none" : PAPER_SETTLE;
        paper.style.transform = "";
      }
      if (drag.current.engaged && clientX !== null) {
        const offset = clientX - drag.current.startX;
        if (offset >= SWIPE_THRESHOLD) paginate(1);
        else if (offset <= -SWIPE_THRESHOLD) paginate(-1);
      }
      drag.current = { pointerId: -1, startX: 0, engaged: false };
    },
    [paginate, reducedMotion],
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
      paper.style.transform = `translateX(${offset.toFixed(1)}px)`;
    }
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    endDrag(event.clientX);
  };

  const handleAyahAction = useCallback((verseKey: string, pageNum: number) => {
    const requestId = ++ayahRequestId.current;
    setActiveAyah({ verseKey, text: null, pageNumber: pageNum });
    void loadCanonicalAyahText(verseKey, pageNum)
      .then((text) => {
        if (ayahRequestId.current === requestId) setActiveAyah({ verseKey, text, pageNumber: pageNum });
      })
      .catch((error) => {
        reportError(error, "mushaf-immersive-ayah-text");
        if (ayahRequestId.current === requestId) setActiveAyah(null);
      });
  }, []);

  const lines = useMemo(() => toMushafLines(pageData), [pageData]);
  const useQcfGlyphs = resolved?.qcf ?? false;

  const { surahName, juzNumber } = useMemo(() => {
    const juz = getJuzNumberForPage(displayPage);
    if (!pageData || pageData.length === 0) return { surahName: title, juzNumber: juz };
    const [surah] = (pageData[0]?.k || "1:1").split(":");
    return { surahName: getSurahDisplayName(surah || "1", language), juzNumber: juz };
  }, [displayPage, language, pageData, title]);

  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= pageCount - 1;

  const pageHeader = (
    <header className="flex w-full min-w-0 items-center justify-between gap-2" dir={direction}>
      <span className="min-w-0 truncate text-sm font-extrabold" dir="auto">
        {surahName}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <bdi
          data-testid="mushaf-immersive-indicator"
          className="text-xs font-bold text-muted-foreground hidden min-[360px]:inline"
        >
          {t(language, "reader.mushafPage", { page: formatNumerals(displayPage, language) })} ·{" "}
          {formatNumerals(pageIndex + 1, language)} / {formatNumerals(pageCount, language)}
        </bdi>
        <button
          type="button"
          role="switch"
          aria-checked={showWordMeanings}
          onClick={() => startTransition(() => setShowWordMeanings((v) => !v))}
          className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            showWordMeanings ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
          aria-label={t(language, "mushaf.difficultWordsInvite")}
          title={t(language, "mushaf.difficultWordsInvite")}
        >
          <BookOpen size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          data-testid="mushaf-immersive-close"
          aria-label={t(language, "reader.immersiveClose")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={17} />
        </button>
      </div>
    </header>
  );

  const pageFooter = (
    <nav
      dir="rtl"
      className="flex w-full min-w-0 items-center justify-between gap-2"
      aria-label={t(language, "mushaf.pageNavigation")}
    >
      <button
        type="button"
        onClick={() => paginate(-1)}
        disabled={atStart}
        data-testid="mushaf-immersive-previous"
        className="flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-bold transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t(language, "common.previous")}
      >
        <ChevronRight size={18} />
        <span className="hidden sm:inline">{t(language, "common.previous")}</span>
      </button>

      <bdi
        data-testid="mushaf-immersive-indicator-mobile"
        className="min-[360px]:hidden text-xs font-bold text-muted-foreground"
      >
        {formatNumerals(pageIndex + 1, language)} / {formatNumerals(pageCount, language)}
      </bdi>

      {atEnd ? (
        <button
          type="button"
          onClick={() => {
            onComplete?.();
            onClose();
          }}
          data-testid="mushaf-immersive-return"
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-primary bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t(language, "reader.immersiveComplete")}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => paginate(1)}
          disabled={atEnd}
          data-testid="mushaf-immersive-next"
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-bold transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t(language, "common.next")}
        >
          <span className="hidden sm:inline">{t(language, "common.next")}</span>
          <ChevronLeft size={18} />
        </button>
      )}
    </nav>
  );

  const progressBar = (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-muted"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={pageCount}
      aria-valuenow={pageIndex + 1}
      aria-label={t(language, "reader.immersiveProgress")}
      data-testid="mushaf-immersive-progress"
    >
      <div
        className={`h-full bg-primary ${reducedMotion ? "" : "transition-[width] duration-standard ease-standard"}`}
        style={{ width: `${((pageIndex + 1) / pageCount) * 100}%` }}
      />
    </div>
  );

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Content
          data-testid="mushaf-immersive"
          dir={direction}
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-background text-foreground outline-none select-none"
        >
          <Dialog.Title className="sr-only">{t(language, "reader.immersiveTitle")}</Dialog.Title>
          <div
            data-testid="mushaf-immersive-track"
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            style={{ touchAction: "pan-y" }}
          >
            <div className="relative h-full w-full">
              <AnimatePresence initial={false} custom={slideDir} mode="popLayout">
                <motion.div
                  key={displayPage}
                  custom={slideDir}
                  variants={{
                    enter: (dir: number) =>
                      reducedMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            x: dir > 0 ? (direction === "rtl" ? -100 : 100) : direction === "rtl" ? 100 : -100,
                          },
                    center: { opacity: 1, x: 0 },
                    exit: (dir: number) =>
                      reducedMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            x: dir < 0 ? (direction === "rtl" ? -100 : 100) : direction === "rtl" ? 100 : -100,
                          },
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0"
                >
                  <MushafPageViewer
                    lines={lines}
                    language={language}
                    pageNumber={displayPage}
                    surahName={surahName}
                    juzNumber={juzNumber}
                    direction={direction}
                    theme={theme}
                    useQcfGlyphs={useQcfGlyphs}
                    showWordMeanings={showWordMeanings}
                    headerContent={pageHeader}
                    footerContent={pageFooter}
                    progressBar={progressBar}
                    paperRef={paperRef}
                    onAyahAction={handleAyahAction}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
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
            isBookmarked={false}
            onBookmark={() => undefined}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
