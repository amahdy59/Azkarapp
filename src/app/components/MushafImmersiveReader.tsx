import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, X } from "./icons";
import { splitMushafPages } from "../content/mushafPages";
import type { QuranWordMeaning, WordMeaningSelection } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { QuranWordText } from "./QuranWordText";
import { QuranPrelude } from "./QuranChrome";

/**
 * One mushaf page per screen, flipped sideways instead of scrolled.
 *
 * Paging is a scroll-snap track rather than an index-and-transform carousel so
 * that a swipe keeps its native momentum and the browser owns the RTL axis:
 * in an RTL container `scrollLeft` runs negative, and reimplementing that by
 * hand is where hand-rolled carousels usually break Arabic.
 */
export function MushafImmersiveReader({
  zikr,
  arabicText,
  meanings,
  language,
  direction,
  title,
  reducedMotion = false,
  textStyle,
  onSelectMeanings,
  activeWordId,
  onClose,
}: {
  zikr: Zikr;
  arabicText: string;
  meanings: readonly QuranWordMeaning[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  /** The reader's own heading — Zikr has no title field of its own. */
  title: string;
  /** Honours the in-app Reduce motion setting: pages jump instead of gliding. */
  reducedMotion?: boolean;
  textStyle: CSSProperties;
  onSelectMeanings: (selection: WordMeaningSelection) => void;
  activeWordId?: string | null;
  onClose: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const pages = splitMushafPages(arabicText, zikr.mushafPages ?? []);
  const pageCount = pages.length;

  const flip = useCallback(
    (delta: number) => {
      const track = trackRef.current;
      if (!track) return;
      // Signed by the reading direction so "next" always means forward in the
      // text, whichever way the axis actually runs.
      const sign = getComputedStyle(track).direction === "rtl" ? -1 : 1;
      track.scrollBy({
        left: sign * delta * track.clientWidth,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      // Arrow keys are physical, so they map to the axis, not to the text.
      if (event.key === "ArrowRight") {
        event.preventDefault();
        flip(direction === "rtl" ? -1 : 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        flip(direction === "rtl" ? 1 : -1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [direction, flip, onClose]);

  /* The page indicator follows the scroll position rather than a click handler,
     so a swipe, a keypress, and a nav button all report the same number. */
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const next = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
    setIndex((current) => (next === current ? current : Math.min(Math.max(next, 0), pageCount - 1)));
  }, [pageCount]);

  if (pageCount === 0) return null;

  const current = pages[Math.min(index, pageCount - 1)]!;
  const atStart = index <= 0;
  const atEnd = index >= pageCount - 1;

  return (
    <div
      data-testid="mushaf-immersive"
      dir={direction}
      role="dialog"
      aria-modal="true"
      aria-label={t(language, "reader.immersiveTitle")}
      className="fixed inset-0 z-50 flex flex-col bg-background text-foreground"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <span className="min-w-0 truncate text-[0.9375rem] font-black" dir="auto">
          {title}
        </span>
        {/* Isolated: a "٣ / ٨" between Arabic words otherwise reorders. */}
        <bdi data-testid="mushaf-immersive-indicator" className="text-[0.8125rem] font-bold text-muted-foreground">
          {t(language, "reader.mushafPage", { page: formatNumerals(current.page, language) })} ·{" "}
          {formatNumerals(index + 1, language)} / {formatNumerals(pageCount, language)}
        </bdi>
        <button
          type="button"
          onClick={onClose}
          data-testid="mushaf-immersive-close"
          aria-label={t(language, "reader.immersiveClose")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <X size={18} />
        </button>
      </header>

      {/* How far through the surah, at a glance. The page numbers above are the
          mushaf's own and mean little as a fraction; this answers "how much is
          left" without the reader doing the arithmetic. */}
      <div
        className="h-1 shrink-0 bg-muted"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={pageCount}
        aria-valuenow={index + 1}
        aria-label={t(language, "reader.immersiveProgress")}
        data-testid="mushaf-immersive-progress"
      >
        <div
          className="h-full bg-primary transition-[width] duration-standard ease-standard"
          style={{ width: `${((index + 1) / pageCount) * 100}%` }}
        />
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        data-testid="mushaf-immersive-track"
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, pageIndex) => (
          <section
            key={page.page}
            data-testid="mushaf-immersive-page"
            data-mushaf-page={page.page}
            aria-label={t(language, "reader.mushafPage", { page: formatNumerals(page.page, language) })}
            className="flex h-full w-full shrink-0 snap-center flex-col overflow-y-auto px-5 py-6 sm:px-10"
          >
            <div className="mx-auto flex w-full max-w-[52rem] flex-col">
              {pageIndex === 0 && <QuranPrelude zikr={zikr} className="pointer-events-none mb-6" />}
              <QuranWordText
                text={page.text}
                meanings={meanings}
                language={language}
                style={{ ...textStyle, textAlign: "justify", textAlignLast: "center" }}
                onSelectMeanings={onSelectMeanings}
                activeWordId={activeWordId}
              />
            </div>
          </section>
        ))}
      </div>

      <nav className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        <FlipButton
          onClick={() => flip(-1)}
          disabled={atStart}
          label={t(language, "reader.immersivePrevious")}
          testId="mushaf-immersive-previous"
          direction={direction}
          back
        />
        <FlipButton
          onClick={() => flip(1)}
          disabled={atEnd}
          label={t(language, "reader.immersiveNext")}
          testId="mushaf-immersive-next"
          direction={direction}
        />
      </nav>
    </div>
  );
}

function FlipButton({
  onClick,
  disabled,
  label,
  testId,
  direction,
  back = false,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  testId: string;
  direction: "ltr" | "rtl";
  back?: boolean;
}) {
  // The arrow points the way the page physically moves, which flips with RTL.
  const pointsLeft = back === (direction === "ltr");
  const Icon = pointsLeft ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[0.875rem] font-bold transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
