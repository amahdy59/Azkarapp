import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Eye, X } from "./icons";
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
  const pageNumbers = useMemo<number[]>(() => {
    if (zikr.mushafPages && zikr.mushafPages.length > 0) {
      return zikr.mushafPages.map((p) => p.page);
    }
    return [1];
  }, [zikr.mushafPages]);

  const [pageIndex, setPageIndex] = useState(0);
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
    return { page: currentPage, data: cached, qcf: isQcfFontReady(currentPage) && pageHasQcfGlyphs(cached) };
  });

  const displayPage = resolved?.page ?? currentPage;
  const pageData = resolved?.data ?? null;

  // Immediate in-memory resolution on pageIndex change
  useEffect(() => {
    let active = true;
    const cached = getCachedMushafPage(currentPage);
    if (cached) {
      setResolved({
        page: currentPage,
        data: cached,
        qcf: isQcfFontReady(currentPage) && pageHasQcfGlyphs(cached),
      });
    }

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
      setPageIndex((current) => Math.max(0, Math.min(pageCount - 1, current + delta)));
    },
    [pageCount],
  );

  // Keyboard navigation: physical direction (ArrowRight = next page, ArrowLeft = previous, Escape = close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeAyah) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        paginate(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        paginate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAyah, onClose, paginate]);

  // Drag / swipe navigation
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
          onClick={() => setShowWordMeanings((v) => !v)}
          className={`inline-flex size-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            showWordMeanings ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
          aria-label={t(language, "mushaf.difficultWordsInvite")}
          title={t(language, "mushaf.difficultWordsInvite")}
        >
          <Eye size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          data-testid="mushaf-immersive-close"
          aria-label={t(language, "reader.immersiveClose")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={17} />
        </button>
      </div>
    </header>
  );

  const pageFooter = (
    <nav
      dir="ltr"
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
        <ChevronLeft size={18} />
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
          <ChevronRight size={18} />
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
        className="h-full bg-primary transition-[width] duration-standard ease-standard"
        style={{ width: `${((pageIndex + 1) / pageCount) * 100}%` }}
      />
    </div>
  );

  return (
    <div
      data-testid="mushaf-immersive"
      dir={direction}
      role="dialog"
      aria-modal="true"
      aria-label={t(language, "reader.immersiveTitle")}
      className="fixed inset-0 z-50 flex flex-col bg-background text-foreground select-none"
    >
      <div
        data-testid="mushaf-immersive-track"
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div className="h-full w-full">
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
    </div>
  );
}
