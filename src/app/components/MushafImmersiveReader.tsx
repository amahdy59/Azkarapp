import { useCallback, useEffect, useMemo, useRef, useState, startTransition, type CSSProperties } from "react";
import { ArrowPrevious, Bookmark, CheckCircle2, ChevronDown, MoreVertical, Translate } from "./icons";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { PAPER_ASPECT, spreadStart, useMushafShell } from "./mushafShell";
import { MushafToolRail, MUSHAF_RAIL_WIDTH, type SurahAudioControl } from "./MushafToolRail";
import { MushafNavigationModal } from "./MushafNavigationModal";
import { MushafSettingsSheet } from "./MushafSettingsSheet";
import { MushafKeyboardShortcutList } from "./MushafKeyboardShortcuts";
import { MushafQuickMenu } from "./MushafQuickMenu";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type {
  AppLanguage,
  MushafLayout,
  MushafPageTheme,
  MushafTextScale,
  MushafTheme,
  MushafToolbarSide,
  ThemeMode,
  Zikr,
} from "../types";
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
export type { SurahAudioControl } from "./MushafToolRail";

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

/**
 * The Mushaf-wide reading preferences, handed in so the surah view changes the
 * same settings the Mushaf does rather than keeping a second set of its own.
 */
export interface MushafSurahSettings {
  theme: MushafTheme;
  appTheme: ThemeMode;
  onSelectTheme: (theme: MushafTheme) => void;
  layout: MushafLayout;
  onSelectLayout: (layout: MushafLayout) => void;
  onSelectTextScale: (scale: MushafTextScale) => void;
  toolbarSide: MushafToolbarSide;
  onSelectToolbarSide: (side: MushafToolbarSide) => void;
}

export function MushafImmersiveReader({
  zikr,
  pageTuple,
  setPageTuple,
  language,
  direction,
  title,
  theme = "midnight",
  reducedMotion = false,
  textScale = "medium",
  bookmarkedPages = [],
  onTogglePageBookmark,
  mushafSettings,
  surahAudio,
  onClose,
  onComplete,
  onReadExternally,
}: {
  zikr: Zikr;
  /** The page position, held above so it survives closing this view. */
  pageTuple: readonly [number, number];
  setPageTuple: (
    next: readonly [number, number] | ((prev: readonly [number, number]) => readonly [number, number]),
  ) => void;
  arabicText?: string;
  meanings?: readonly QuranWordMeaning[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  title: string;
  theme?: MushafPageTheme;
  reducedMotion?: boolean;
  /** The Mushaf reading size, so this view matches the Mushaf proper. */
  textScale?: MushafTextScale;
  /** Pages the reader has marked, so the rail can show and toggle the state. */
  bookmarkedPages?: readonly number[];
  onTogglePageBookmark?: (page: number) => void;
  /** The Mushaf-wide reading preferences, so this view can change them too. */
  mushafSettings?: MushafSurahSettings;
  /** The surah's recitation, driven by the app's one audio controller. */
  surahAudio?: SurahAudioControl;
  textStyle?: CSSProperties;
  onSelectMeanings?: (selection: WordMeaningSelection) => void;
  activeWordId?: string | null;
  onClose: () => void;
  onComplete?: () => void;
  onReadExternally?: () => void;
}) {
  const pageNumbers = useMemo(() => {
    if (zikr.mushafPages && zikr.mushafPages.length > 0) {
      return zikr.mushafPages.map((p) => p.page);
    }
    return [1];
  }, [zikr.mushafPages]);

  /**
   * Where the reader is in the surah, owned by the screen above.
   *
   * It used to live here, and this view is mounted only while it is open — so
   * closing it on page four of Al-Kahf and opening it again put the reader back
   * on page one. Position is the thing a reader would notice losing, so it
   * belongs to something that outlives the view.
   */
  const [pageIndex, slideDir] = pageTuple;
  const [showWordMeanings, setShowWordMeanings] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [activeAyah, setActiveAyah] = useState<{ verseKey: string; text: string | null; pageNumber: number } | null>(
    null,
  );
  const ayahRequestId = useRef(0);
  const paperRef = useRef<HTMLDivElement>(null);
  /**
   * Read by the key handler instead of closing over the prop.
   *
   * `surahAudio` is rebuilt on every render of the screen above, and playback
   * re-renders it several times a second while the recitation runs. In the
   * effect's dependencies that tore the window listener down and rebuilt it on
   * every tick; the ref keeps the listener installed once and still current.
   */
  const surahAudioRef = useRef(surahAudio);
  surahAudioRef.current = surahAudio;

  const currentPage = pageNumbers[pageIndex] ?? pageNumbers[0]!;
  const pageCount = pageNumbers.length;

  const shell = useMushafShell();

  /**
   * The facing page, when there is room and when it belongs to this surah.
   *
   * A Mushaf opens with page 1 on the right, so pairs run (1,2), (3,4). The
   * odd page is always on the right and the even page on the left.
   */
  const rightNumber = shell.spreadRoom ? spreadStart(currentPage) : currentPage;
  const leftNumber =
    shell.spreadRoom && pageNumbers.includes(rightNumber) && pageNumbers.includes(rightNumber + 1)
      ? rightNumber + 1
      : null;
  const hasSpread = leftNumber !== null;
  const facingNumber = hasSpread ? (currentPage === rightNumber ? leftNumber : rightNumber) : null;

  const [facing, setFacing] = useState<ResolvedPage | null>(null);

  const [resolved, setResolved] = useState<ResolvedPage | null>(() => {
    const cached = getCachedMushafPage(currentPage);
    if (!cached) return null;
    const hasQcfGlyphs = pageHasQcfGlyphs(cached);
    if (hasQcfGlyphs && !isQcfFontReady(currentPage)) return null;
    return { page: currentPage, data: cached, qcf: hasQcfGlyphs };
  });

  const rightResolved = resolved?.page === rightNumber ? resolved : facing?.page === rightNumber ? facing : null;
  const leftResolved = resolved?.page === leftNumber ? resolved : facing?.page === leftNumber ? facing : null;

  const displayPage = rightResolved?.page ?? (hasSpread ? rightNumber : (resolved?.page ?? currentPage));
  const pageData = rightResolved?.data ?? resolved?.data ?? null;
  const useQcfGlyphs = rightResolved?.qcf ?? resolved?.qcf ?? false;

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        // Both halves settle together, so a spread never shows one page of a
        // pair while the other is still resolving.
        const [next, other] = await Promise.all([
          resolveMushafPage(currentPage, showWordMeanings),
          facingNumber === null ? Promise.resolve(null) : resolveMushafPage(facingNumber, showWordMeanings),
        ]);
        if (!active) return;
        if (next) setResolved(next);
        setFacing(other);
      } catch (err) {
        reportError(err, "mushaf-immersive-load");
      }
    })();

    return () => {
      active = false;
    };
  }, [currentPage, facingNumber, showWordMeanings]);

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
        // A spread shows two leaves, so a turn moves by two: stepping one would
        // re-show the page the reader just finished, on the other half.
        const step = hasSpread ? delta * 2 : delta;
        const nextIndex = Math.max(0, Math.min(pageCount - 1, prev[0] + step));
        return nextIndex !== prev[0] ? [nextIndex, delta] : prev;
      });
    },
    [hasSpread, pageCount, setPageTuple],
  );

  // Keyboard navigation: physical direction (ArrowLeft/PageDown = next page,
  // ArrowRight/PageUp = previous), Home/End jump to the surah's first and last
  // page, F toggles focus mode, and Escape steps back one layer at a time
  // (focus mode first, then the surah) so nested ayah sheets close in order.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeAyah) return;
      const target = e.target as HTMLElement | null;
      // Text entry and composite widgets own the arrow keys; a plain button
      // does not. Excluding buttons made the page keys dead from the moment
      // this view opened, because it now autofocuses a control on the rail.
      // The Mushaf's own guard has always been this one.
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='menu'], [role='listbox']")) return;
      if (e.key === "Escape") {
        // Radix owned this while it was a dialog. Layered as the Mushaf layers
        // it: giving up the surah entirely from a keypress meant to undo the
        // last thing you did is a surprise you cannot take back without losing
        // your place.
        e.preventDefault();
        if (isFocusMode) setIsFocusMode(false);
        else onClose();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageDown") {
        e.preventDefault();
        paginate(1);
      } else if (e.key === "ArrowRight" || e.key === "PageUp") {
        e.preventDefault();
        paginate(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        setPageTuple((prev) => (prev[0] === 0 ? prev : [0, -1]));
      } else if (e.key === "End") {
        e.preventDefault();
        setPageTuple((prev) => (prev[0] === pageCount - 1 ? prev : [pageCount - 1, 1]));
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      } else if (e.key === " " || e.code === "Space") {
        // Safe to claim here in a way it is not in the counting reader: the
        // Mushaf spread does not scroll, so Space has no default to displace.
        // It only does anything when there is a recitation to start.
        const audio = surahAudioRef.current;
        if (!audio?.available) return;
        // A focused button already answers Space by activating itself; taking
        // it here as well would start the recitation and stop it again in the
        // same keystroke.
        if (target?.closest("button, [role='button']")) return;
        e.preventDefault();
        audio.onToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAyah, isFocusMode, onClose, paginate, pageCount, setPageTuple]);

  /**
   * One gesture, shared with the reader.
   *
   * This view had its own: a 1:1 unbounded translation that let a page be
   * dragged clean off the screen, no axis lock so a drifting vertical scroll
   * engaged it, and a 160ms settle that ran at the same time as the page-turn
   * spring — two curves on one property, which is what made the swipe feel
   * unnatural. Moving between the reader and the Mushaf now feels like one app
   * because it is one implementation.
   */
  const { dragStyle, pointerProps } = useSwipeGestures({
    direction,
    onNext: () => paginate(1),
    onPrev: () => paginate(-1),
    reduceMotion: reducedMotion,
  });

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

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch((reason) => reportError(reason, "surah-exit-fullscreen"));
      return;
    }
    void document.documentElement.requestFullscreen?.().catch((reason) => reportError(reason, "surah-fullscreen"));
  }, []);

  useEffect(() => {
    // The browser owns this state — Escape and the F11 key both change it
    // without going through the button.
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const lines = useMemo(() => toMushafLines(pageData), [pageData]);

  const { surahName, juzNumber } = useMemo(() => {
    const juz = getJuzNumberForPage(displayPage);
    if (!pageData || pageData.length === 0) return { surahName: title, juzNumber: juz };
    const [surah] = (pageData[0]?.k || "1:1").split(":");
    return { surahName: getSurahDisplayName(surah || "1", language), juzNumber: juz };
  }, [displayPage, language, pageData, title]);

  const atStart = hasSpread ? rightNumber <= pageNumbers[0]! : pageIndex <= 0;
  const atEnd = hasSpread ? leftNumber >= pageNumbers[pageNumbers.length - 1]! : pageIndex >= pageCount - 1;

  /**
   * The Mushaf's own toolbar, standing beside the paper.
   *
   * The same component the Khatmah reader uses, so the buttons, their order and
   * their behaviour are the Mushaf's rather than this view's own invention. The
   * difference is the span: previous and next stop at the ends of the surah
   * rather than at the ends of the Mushaf, and the page shown as "last" is the
   * surah's last, not 604.
   */
  const toolRail = (
    <MushafToolRail
      language={language}
      direction={direction}
      side="right"
      compact={shell.railCompact}
      surahName={surahName}
      juzNumber={juzNumber}
      pageNumber={displayPage}
      lastPage={pageNumbers[pageNumbers.length - 1] ?? displayPage}
      atFirstPage={atStart}
      atLastPage={atEnd}
      showWordMeanings={showWordMeanings}
      isLoadingWordMeanings={false}
      isPageBookmarked={bookmarkedPages.includes(displayPage)}
      isFullscreen={isFullscreen}
      onBack={onClose}
      onOpenIndex={() => setIsIndexOpen(true)}
      onPrevious={() => paginate(-1)}
      onNext={() => paginate(1)}
      onToggleWordMeanings={() => setShowWordMeanings((value) => !value)}
      onTogglePageBookmark={() => onTogglePageBookmark?.(displayPage)}
      onToggleFullscreen={toggleFullscreen}
      onEnterFocusMode={() => setIsFocusMode(true)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      surahAudio={surahAudio}
      /* Only where the rail itself is shown: that gate is a landscape screen
         with room for it, which is also where a keyboard is likely to exist.
         A phone has no keys for this list to describe. */
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
      onComplete={onComplete}
    />
  );

  const isPageBookmarked = bookmarkedPages.includes(displayPage);

  const mobileTopLeft =
    !shell.rail && !isFocusMode ? (
      <button
        type="button"
        onClick={onClose}
        data-testid="mushaf-immersive-close"
        aria-label={t(language, "common.back")}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-sm backdrop-blur-md transition-all active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowPrevious size={20} />
      </button>
    ) : undefined;

  const mobileTopRight =
    !shell.rail && !isFocusMode ? (
      <button
        type="button"
        onClick={() => setIsQuickMenuOpen(true)}
        data-testid="mushaf-immersive-more"
        aria-label={t(language, "mushaf.moreActions")}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-sm backdrop-blur-md transition-all active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreVertical size={20} />
      </button>
    ) : undefined;

  const mobileTopCenter =
    !shell.rail && !isFocusMode ? (
      <button
        type="button"
        dir={direction}
        onClick={() => setIsIndexOpen(true)}
        data-testid="mushaf-furniture-surah-btn"
        style={{ maxWidth: "calc(100vw - 7.5rem)" }}
        className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-foreground shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <span className="truncate font-bold text-sm leading-none">{surahName}</span>
        <span className="text-muted-foreground opacity-40 text-xs select-none">·</span>
        <span className="shrink-0 text-xs text-muted-foreground font-medium leading-none">
          {t(language, "common.juz")} {formatNumerals(juzNumber, language)}
        </span>
        <ChevronDown
          size={14}
          className="text-muted-foreground shrink-0 opacity-70 select-none ms-0.5"
          aria-hidden="true"
        />
      </button>
    ) : undefined;

  const mobileBottomRight =
    !shell.rail && !isFocusMode ? (
      <button
        type="button"
        role="switch"
        aria-checked={showWordMeanings}
        onClick={() => startTransition(() => setShowWordMeanings((v) => !v))}
        data-testid="mushaf-immersive-word-meanings"
        aria-label={t(language, "mushaf.difficultWordsInvite")}
        title={t(language, "mushaf.difficultWordsInvite")}
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          showWordMeanings
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border/60 bg-card/90 text-foreground hover:bg-muted"
        }`}
      >
        <Translate size={19} aria-hidden="true" />
      </button>
    ) : undefined;

  const mobileBottomLeft =
    !shell.rail && !isFocusMode ? (
      atEnd && onComplete ? (
        <button
          type="button"
          onClick={onComplete}
          data-testid="mushaf-immersive-return"
          aria-label={t(language, "reader.immersiveComplete")}
          className="flex h-11 items-center gap-1.5 rounded-full border border-primary bg-primary px-3.5 text-xs font-black text-primary-foreground shadow-sm backdrop-blur-md transition-all active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          <span className="truncate">{t(language, "reader.immersiveComplete")}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onTogglePageBookmark?.(displayPage)}
          data-testid="mushaf-immersive-bookmark"
          aria-label={t(language, "mushaf.bookmarkCurrentPage")}
          title={t(language, "mushaf.bookmarkCurrentPage")}
          className={`flex size-11 shrink-0 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isPageBookmarked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/60 bg-card/90 text-foreground hover:bg-muted"
          }`}
        >
          <Bookmark size={19} className={isPageBookmarked ? "fill-current" : undefined} aria-hidden="true" />
        </button>
      )
    ) : undefined;

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
    /**
     * A mode of the reader, not a dialog over it.
     *
     * This was a modal covering the screen, which is why it had a header and a
     * footer of its own duplicating the reader's, why leaving it read as a
     * dismissal rather than a switch, and why its state died with it. It is now
     * the reader's body while the surah is being read as pages, so there is one
     * screen with two ways of rendering what is on it.
     */
    <section
      data-testid="mushaf-immersive"
      dir={direction}
      aria-label={t(language, "reader.immersiveTitle")}
      className="relative flex min-h-0 flex-1 flex-col bg-background text-foreground outline-none select-none"
    >
      <div
        data-testid="mushaf-immersive-track"
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        {...pointerProps}
        /* The surface itself never scrolls: the paper inside it does when a
           short screen makes it taller than the viewport. Leaving the browser
           a vertical axis to claim here is what let a drag move the page. */
        style={{ touchAction: "pan-y", overscrollBehavior: "none" }}
      >
        {/* The page turn animates the paper, not the chrome.
            This wrapped the whole viewer in AnimatePresence, so every turn
            mounted a second copy of the rail and slid it with the page — two
            rails on screen mid-turn. MushafPageViewer already animates its own
            paper from `pageTransitionDirection`, which is what the Mushaf uses
            and what leaves the tools standing still. */}
        <div className="relative h-full w-full">
          <MushafPageViewer
            lines={lines}
            language={language}
            pageNumber={displayPage}
            pageTransitionDirection={slideDir > 0 ? "forward" : "backward"}
            surahName={surahName}
            juzNumber={juzNumber}
            direction={direction}
            theme={theme}
            useQcfGlyphs={useQcfGlyphs}
            showWordMeanings={showWordMeanings}
            {...(shell.rail && !isFocusMode ? { railContent: toolRail, railSide: "right" as const } : {})}
            topLeftControl={mobileTopLeft}
            topRightControl={mobileTopRight}
            topCenterControl={mobileTopCenter}
            bottomLeftControl={mobileBottomLeft}
            bottomRightControl={mobileBottomRight}
            onSurahClick={() => setIsIndexOpen(true)}
            onJuzClick={() => setIsIndexOpen(true)}
            onPageClick={() => setIsIndexOpen(true)}
            onEdgeTap={(edge) => {
              if (edge === "left") paginate(1);
              else paginate(-1);
            }}
            onCenterTap={() => setIsFocusMode((v) => !v)}
            progressBar={progressBar}
            paperRef={paperRef}
            reduceMotion={reducedMotion}
            textScale={textScale}
            facingPage={
              hasSpread && leftResolved && leftNumber !== null
                ? {
                    pageNumber: leftResolved.page,
                    lines: toMushafLines(leftResolved.data),
                    useQcfGlyphs: leftResolved.qcf,
                  }
                : undefined
            }
            onAyahAction={handleAyahAction}
            paperStyle={dragStyle}
          />
        </div>
      </div>

      {isFocusMode && (
        /* Focus mode hides the rail that turned it on, so without this the only
           way out was leaving the surah altogether — and on a phone, with no
           keyboard, there was no way out at all. The Mushaf's own handle. */
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
      )}

      <MushafQuickMenu
        open={isQuickMenuOpen}
        onClose={() => setIsQuickMenuOpen(false)}
        language={language}
        direction={direction}
        surahName={surahName}
        juzNumber={juzNumber}
        pageNumber={displayPage}
        showWordMeanings={showWordMeanings}
        isLoadingWordMeanings={false}
        isPageBookmarked={isPageBookmarked}
        onOpenIndex={() => {
          setIsQuickMenuOpen(false);
          setIsIndexOpen(true);
        }}
        onOpenBookmarks={() => {
          setIsQuickMenuOpen(false);
          setIsIndexOpen(true);
        }}
        onToggleWordMeanings={() => setShowWordMeanings((v) => !v)}
        onTogglePageBookmark={() => onTogglePageBookmark?.(displayPage)}
        onEnterFocusMode={() => setIsFocusMode(true)}
        onOpenSettings={() => {
          setIsQuickMenuOpen(false);
          setIsSettingsOpen(true);
        }}
        onReadExternally={onReadExternally}
        surahAudio={surahAudio}
      />

      <MushafNavigationModal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        currentPage={displayPage}
        onSelectPage={(page) => {
          const index = pageNumbers.indexOf(page);
          if (index >= 0) setPageTuple([index, index >= pageIndex ? 1 : -1]);
          setIsIndexOpen(false);
        }}
        language={language}
        direction={direction}
        bookmarks={[...bookmarkedPages]}
        initialTab="jump"
        // The span is the whole difference from the Mushaf's own index.
        pageRange={{ first: pageNumbers[0]!, last: pageNumbers[pageNumbers.length - 1]! }}
      />

      {mushafSettings && (
        <MushafSettingsSheet
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          language={language}
          direction={direction}
          theme={mushafSettings.theme}
          appTheme={mushafSettings.appTheme}
          onSelectTheme={mushafSettings.onSelectTheme}
          mushafLayout={mushafSettings.layout}
          onSelectLayout={mushafSettings.onSelectLayout}
          autoSpreadRoom={shell.spreadRoom}
          textScale={textScale}
          onSelectTextScale={mushafSettings.onSelectTextScale}
          textScaleApplies={shell.pageAspect >= PAPER_ASPECT}
          toolbarSide={mushafSettings.toolbarSide}
          onSelectToolbarSide={mushafSettings.onSelectToolbarSide}
          showToolbarSide={shell.rail}
          showKeyboardHelp={shell.rail}
          presentation={shell.rail ? "side-panel" : "sheet"}
          panelInset={shell.rail ? (shell.railCompact ? MUSHAF_RAIL_WIDTH.compact : MUSHAF_RAIL_WIDTH.regular) : 0}
          pageNumber={displayPage}
          surahName={surahName}
        />
      )}

      {/* The keys, on their own, reachable from the rail rather than only from
          the foot of the reading settings. Radix supplies focus containment,
          focus restore and Escape — and consumes that Escape, so dismissing
          this never also gives up the surah. */}
      <ResponsiveSheet
        open={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        title={t(language, "mushaf.keyboardTitle")}
        direction={direction}
        testId="mushaf-shortcuts-sheet"
        maxWidthClassName="sm:max-w-sm"
      >
        {/* ResponsiveSheet's own title is `sr-only` in this presentation, so a
            sighted reader would otherwise get a bare list with nothing naming
            it. Matches the heading the reading settings print above the same
            list. */}
        <div className="flex flex-col gap-2 px-5 pb-5">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase" aria-hidden="true">
            {t(language, "mushaf.keyboardTitle")}
          </h3>
          <MushafKeyboardShortcutList language={language} />
        </div>
      </ResponsiveSheet>

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
    </section>
  );
}
