import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type MutableRefObject,
} from "react";
import type { AppLanguage, MushafPageTheme } from "../types";
import { getQuranWordMeaningEntry, type QuranWordMeaning } from "../content/quranWordMeanings";
import { t } from "../i18n";
import { Bookmark } from "./icons";
import { formatNumerals } from "../formatting";
import { getSurahDisplayName } from "../content/surahInfo";
import { QuranWordPopover } from "./QuranWordPopover";
import { shouldReduceMotion } from "../motionPreferences";

export interface MushafWordToken {
  verseKey: string;
  position: number;
  isEnd: number;
  text: string;
  qcfCode?: string;
}

/** The reference page carries exactly fifteen lines (DEC-089). Rendering all
 *  fifteen slots on every page — filled or not — is what keeps the geometry
 *  identical from page to page, so a turn never reflows the canvas. */
export const MUSHAF_LINES_PER_PAGE = 15;

/**
 * The reference sets its two opening pages — Al-Fatihah and the start of
 * Al-Baqarah — in a larger display type over fewer lines, rather than the
 * fifteen every other page carries. Forcing them onto the fifteen-line grid
 * left the bottom half of the paper blank.
 */
const OPENING_PAGES = new Set([1, 2]);

/**
 * The chrome follows the page's measure, but never shrinks below a comfortable
 * toolbar width — a 300px page on a tall narrow window should not squeeze four
 * controls into 300px when the screen has room.
 */
const CHROME_MEASURE = "min(100%, max(var(--mushaf-measure, 100%), 22rem))";

export function AyahMarker({
  number,
  language,
  theme = "light",
}: {
  number: string | number;
  language: AppLanguage;
  theme?: MushafPageTheme;
}) {
  const displayNum = formatNumerals(number, language);
  const isOled = theme === "oled";

  return (
    <span
      className="relative inline-flex shrink-0 select-none items-center justify-center align-middle mx-0.5"
      role="img"
      aria-label={t(language, "reader.ayahLabel", { ayah: displayNum })}
    >
      {/* Drawn in the page's own ink, not the accent colour. A coloured
          medallion every few words pulled the eye out of the line; print sets
          the marker in the same ink as the text it closes. */}
      <svg
        width="1.15em"
        height="1.15em"
        viewBox="0 0 32 32"
        fill="none"
        className={isOled ? "text-white" : "text-current opacity-75"}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.5" className="opacity-90" />
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="2 1.5"
          className="opacity-60"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-sans text-[0.42em] font-bold leading-none ${
          isOled ? "text-white" : "text-current opacity-85"
        }`}
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-hidden="true"
      >
        {displayNum}
      </span>
    </span>
  );
}

/**
 * A Surah title is presentation around the Quran, never Quran data. This
 * curved outline stays inside the line slot it receives, so decoration cannot
 * change the canonical fifteen-line geometry.
 */
function MushafSurahHeader({
  surahNumber,
  language,
  compact = false,
}: {
  surahNumber: number | string;
  language: AppLanguage;
  compact?: boolean;
}) {
  const title = getSurahDisplayName(surahNumber, language);

  return (
    <div
      className="relative flex h-full w-full min-w-0 items-center justify-center select-none px-4"
      dir="rtl"
      data-testid="mushaf-surah-heading"
      data-variant="pill"
    >
      <svg
        viewBox="0 0 320 40"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full text-accent opacity-70 pointer-events-none"
        aria-hidden="true"
        focusable="false"
        data-testid="mushaf-surah-ornament"
      >
        {/* Symmetrical full pill enclosing the surah title */}
        <rect
          x="52"
          y="5"
          width="216"
          height="30"
          rx="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Symmetrical straight horizontal lines from vertical center */}
        <line
          x1="8"
          y1="20"
          x2="52"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="268"
          y1="20"
          x2="312"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Perfect symmetrical terminal circular dots */}
        <circle cx="8" cy="20" r="2.5" fill="currentColor" />
        <circle cx="312" cy="20" r="2.5" fill="currentColor" />
        {/* Mathematically symmetrical 4-petal floral rosettes */}
        <HeaderRosette transform="translate(72 20)" />
        <HeaderRosette transform="translate(248 20)" />
      </svg>
      <h2
        className="arabic-ui relative z-10 shrink-0 whitespace-nowrap text-center font-bold leading-none"
        style={{
          fontSize: compact ? "clamp(11px, min(3.8cqi, 2cqh), 15px)" : "clamp(13px, min(4.2cqi, 2.5cqh), 17px)",
        }}
        data-testid="mushaf-surah-title"
      >
        {title}
      </h2>
    </div>
  );
}

/**
 * 100% mathematically and visually symmetrical 4-petal floral rosette.
 * Constructed with 4 identical petals rotated 0°, 90°, 180°, and 270° around a central disc.
 */
function HeaderRosette({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <g stroke="currentColor" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke">
        <path d="M0 -1 C-2.6 -3.2, -2.6 -6.5, 0 -8 C2.6 -6.5, 2.6 -3.2, 0 -1 Z" />
        <path d="M0 -1 C-2.6 -3.2, -2.6 -6.5, 0 -8 C2.6 -6.5, 2.6 -3.2, 0 -1 Z" transform="rotate(90)" />
        <path d="M0 -1 C-2.6 -3.2, -2.6 -6.5, 0 -8 C2.6 -6.5, 2.6 -3.2, 0 -1 Z" transform="rotate(180)" />
        <path d="M0 -1 C-2.6 -3.2, -2.6 -6.5, 0 -8 C2.6 -6.5, 2.6 -3.2, 0 -1 Z" transform="rotate(270)" />
      </g>
      <circle cx="0" cy="0" r="1.3" fill="currentColor" />
    </g>
  );
}

const BISMILLAH_FONT_SIZE = "clamp(16px, min(5.4cqi, 3.2cqh), 24px)";

function BismillahText({ text }: { text: string }) {
  return (
    <p
      className="leading-none tracking-[0.03em]"
      style={{ fontFamily: "var(--font-mushaf)", fontSize: BISMILLAH_FONT_SIZE }}
      data-testid="mushaf-bismillah"
    >
      {text}
    </p>
  );
}

/**
 * Nineteen surahs begin on the second line of their page, leaving exactly one
 * slot where the heading and the basmalah both belong. The old inference put
 * the basmalah there and silently dropped the name — and on At-Tawbah's page,
 * which takes no basmalah, left the slot blank. Both belong on the page, so
 * both go in the one slot.
 */
function SurahOpeningBand({
  surahNumber,
  language,
  withBismillah,
}: {
  surahNumber: number | string;
  language: AppLanguage;
  withBismillah: boolean;
}) {
  return (
    <div
      className={`grid h-full w-full min-w-0 items-center select-none ${withBismillah ? "grid-rows-2" : "grid-rows-1"}`}
      dir="rtl"
    >
      <div className="h-full min-h-0 w-full">
        <MushafSurahHeader surahNumber={surahNumber} language={language} compact={withBismillah} />
      </div>
      {withBismillah && (
        <div className="flex h-full min-h-0 items-center justify-center">
          <BismillahText text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ" />
        </div>
      )}
    </div>
  );
}

function BismillahLine() {
  return (
    <div className="flex h-full w-full items-center justify-center select-none" dir="rtl">
      <BismillahText text="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ" />
    </div>
  );
}

type LineDetail =
  | { type: "surah-header"; surah: number }
  | { type: "surah-opening"; surah: number; withBismillah: boolean }
  | { type: "bismillah" }
  | { type: "empty" }
  | { type: "text"; words: MushafWordToken[] };

interface ActiveWord {
  verseKey: string;
  wordPosition: number;
  meaning: QuranWordMeaning;
  anchor: HTMLElement;
}

const MushafTextLine = memo(function MushafTextLine({
  words,
  language,
  theme: _theme,
  useQcfGlyphs,
  showWordMeanings,
  meanings,
  activeWord,
  highlightedVerseKey,
  onActiveWordChange,
  onAyahAction,
}: {
  words: MushafWordToken[];
  language: AppLanguage;
  theme: MushafPageTheme;
  useQcfGlyphs: boolean;
  showWordMeanings: boolean;
  meanings: ReadonlyMap<string, QuranWordMeaning>;
  /** The open word *on this line*, or null. Passing the page-wide value here
   *  re-rendered all fifteen lines every time a popover opened. */
  activeWord: ActiveWord | null;
  highlightedVerseKey?: string | null;
  onActiveWordChange: (word: ActiveWord | null) => void;
  onAyahAction?: (verseKey: string) => void;
}) {
  return (
    // The slot deliberately does not clip: the fitter already guarantees the
    // line fits the page width, and Arabic diacritics reach into the space
    // between lines exactly as they do in print.
    <div data-mushaf-line="" className="flex h-full w-full min-w-0 items-center justify-center">
      {/* The printed Mushaf justifies every line to both margins, so the words
          are spread rather than centred. Lines whose natural width still
          exceeds the page get scaled by the fitter above — never clipped. */}
      <div
        data-mushaf-line-content=""
        // No inter-word gap in QCF: the glyph advances already carry the
        // spacing the page was cut with, and adding our own widened it. The
        // Unicode fallback has no such spacing built in, so it keeps the gap.
        className={`flex w-full shrink-0 flex-nowrap items-baseline justify-between whitespace-nowrap ${
          useQcfGlyphs ? "gap-x-0" : "gap-x-0.5"
        }`}
      >
        {words.map((w, wIdx) => {
          const key = `${w.verseKey}:${w.position}:${wIdx}`;
          const meaning = meanings.get(`${w.verseKey}:${w.position}`);

          if (w.isEnd) {
            return (
              <button
                key={key}
                type="button"
                className={`inline-block shrink-0 select-none rounded-sm border-0 bg-transparent p-0 [font:inherit] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  highlightedVerseKey === w.verseKey ? "bg-primary/20" : ""
                }`}
                style={{ lineHeight: "inherit", verticalAlign: "baseline" }}
                aria-label={t(language, "reader.openAyahActions", {
                  ayah: formatNumerals(w.verseKey.split(":")[1] || w.text, language),
                })}
                onClick={() => onAyahAction?.(w.verseKey)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onAyahAction?.(w.verseKey);
                }}
              >
                {w.qcfCode || w.text}
              </button>
            );
          }

          const wordContent =
            useQcfGlyphs && w.qcfCode ? (
              <>
                <span aria-hidden="true" className="select-none">
                  {w.qcfCode}
                </span>
                <span className="sr-only">{w.text}</span>
              </>
            ) : (
              <span className="select-text">{w.text}</span>
            );

          if (showWordMeanings && meaning) {
            const isOpen = activeWord?.verseKey === w.verseKey && activeWord?.wordPosition === w.position;
            return (
              <span
                key={key}
                role="button"
                tabIndex={0}
                data-word-active={isOpen ? "true" : undefined}
                onClick={(event) => {
                  onActiveWordChange(
                    isOpen
                      ? null
                      : { verseKey: w.verseKey, wordPosition: w.position, meaning, anchor: event.currentTarget },
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onActiveWordChange(
                      isOpen
                        ? null
                        : { verseKey: w.verseKey, wordPosition: w.position, meaning, anchor: e.currentTarget },
                    );
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onAyahAction?.(w.verseKey);
                }}
                className={`relative inline shrink-0 cursor-pointer appearance-none rounded-sm border-0 bg-primary/10 p-0 text-primary underline decoration-dotted underline-offset-4 transition-colors [font:inherit] hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  highlightedVerseKey === w.verseKey ? "ring-2 ring-primary/55" : ""
                }`}
                style={{ lineHeight: "inherit", verticalAlign: "baseline" }}
                aria-label={t(language, "mushaf.wordMeaning", { word: w.text })}
              >
                {wordContent}
              </span>
            );
          }

          return (
            <span
              key={key}
              className={`shrink-0 rounded-sm ${highlightedVerseKey === w.verseKey ? "bg-primary/20" : ""}`}
              aria-hidden={!showWordMeanings}
              onContextMenu={(e) => {
                e.preventDefault();
                onAyahAction?.(w.verseKey);
              }}
            >
              {wordContent}
            </span>
          );
        })}
      </div>
    </div>
  );
});

/** Below this much of the page width a line is treated as a short closing line
 *  and centred, the way print sets the last line of a surah. Spreading three
 *  words across the full measure is the tell of a web page, not a Mushaf. */
const JUSTIFY_FILL_THRESHOLD = 0.82;

/**
 * The width this line would occupy at its natural word spacing.

/**
 * Sizes the page to the paper.
 *
 * A printed Mushaf line runs margin to margin. QCF v2 is cut so that every full
 * line on a given page has the same natural width, so the honest way to fill the
 * measure is to scale the *type* until the longest line lands on the margin —
 * not to leave the type small and let `space-between` blow the word gaps open,
 * which is what a fixed `cqi` size produced.
 *
 * Then, per line: anything still overrunning is scaled down rather than clipped
 * (the defect that cut the first lines off page 599), and anything far short of
 * the measure is centred rather than spread.
 *
 * Two measure/write passes per page turn or resize, never interleaved.
 */
/**
 * How much of a line slot the line box may claim.
 *
 * QCF v2 is cut for exactly this fifteen-line page, so its box is close to its
 * ink and it can use nearly the whole slot. The Unicode fallback is set in
 * Amiri Quran, whose marks paint well outside the box `offsetHeight` reports —
 * scaling it to the same rule stacked one line's kasrahs into the next line's
 * ink.
 */
/**
 * How much of a line slot the line box may claim; the rest is leading.
 *
 * Nudged down from 0.94 to 0.88 for QCF — a small, deliberate increase in the
 * air between lines, which readers found tight.
 */
/**
 * CRITICAL RULE: The 15-line page is a facsimile and its geometry is data, not styling.
 * This non-negotiable rule prevents 'just nudging' leading or line counts, which breaks the Mushaf layout.
 * SLOT_INK_ALLOWANCE adjusts the ink-to-slot ratio (internal letter scaling) without altering the 15-line geometry.
 */
const SLOT_INK_ALLOWANCE = { "qcf-v2": 0.88, fallback: 0.68 } as const;

function useLineFitter(dependencyKey: string, inkAllowance: number) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frame = 0;
    let cancelled = false;

    const fit = () => {
      const column = canvas.firstElementChild as HTMLElement | null;
      const contents = Array.from(canvas.querySelectorAll<HTMLElement>("[data-mushaf-line-content]"));
      const first = contents[0];
      if (!column || !first) return;

      const page = (canvas.parentElement as HTMLElement | null) ?? column;

      // Reset measure & fit to base before measuring
      page.style.setProperty("--mushaf-measure", "100%");
      page.style.setProperty("--mushaf-fit", "1");
      for (let i = 0; i < contents.length; i++) {
        const content = contents[i]!;
        content.style.transform = "";
        content.style.justifyContent = "";
      }

      const available = first.clientWidth;
      const slotHeight = (first.parentElement as HTMLElement | null)?.clientHeight ?? 0;
      if (available <= 0 || slotHeight <= 0) return;

      // Single read pass: measure natural width of all lines in one loop without style mutation in between
      const lineCount = contents.length;
      const naturalWidths = new Float64Array(lineCount);
      let widest = 0;

      for (let i = 0; i < lineCount; i++) {
        const content = contents[i]!;
        const childCount = content.children.length;
        const gap = Number.parseFloat(getComputedStyle(content).columnGap) || 0;
        let natural = gap * Math.max(0, childCount - 1);
        const children = content.children;
        for (let j = 0; j < childCount; j++) {
          natural += (children[j] as HTMLElement).offsetWidth;
        }
        if (content.scrollWidth > content.clientWidth) {
          natural = Math.max(natural, content.scrollWidth);
        }
        naturalWidths[i] = natural;
        if (childCount >= 5 && natural > widest) {
          widest = natural;
        }
      }

      const lineHeight = first.offsetHeight;
      const responsiveInkAllowance = window.innerWidth >= 768 ? Math.max(0.58, inkAllowance - 0.06) : inkAllowance;
      const verticalScale = lineHeight > 0 ? (slotHeight * responsiveInkAllowance) / lineHeight : 1;
      const measure = Math.min(widest * verticalScale, available);
      const scale = Math.min(Math.max(widest > 0 ? measure / widest : 1, 0.6), 2.4);

      // Single write pass: apply calculated scale and transforms
      page.style.setProperty("--mushaf-measure", `${Math.round(measure)}px`);
      page.style.setProperty("--mushaf-fit", scale.toFixed(3));

      for (let i = 0; i < lineCount; i++) {
        const content = contents[i]!;
        const nat = naturalWidths[i]!;
        const scaledNat = nat * scale;
        const fill = measure > 0 ? scaledNat / measure : 1;

        content.style.transform = fill > 1 ? `scale(${(1 / fill).toFixed(4)})` : "";
        content.style.justifyContent = fill >= JUSTIFY_FILL_THRESHOLD ? "" : "center";
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);

    void document.fonts?.ready?.then?.(() => {
      if (!cancelled) schedule();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [dependencyKey, inkAllowance]);

  return canvasRef;
}

/** Which of the fifteen slots carry words, and which carry a heading or the
 *  basmalah. Shared by both pages of a spread. */
function useLineDetails(lines: MushafWordToken[][], pageNumber: number) {
  return useMemo<LineDetail[]>(() => {
    const surahStarts: { surah: number; startLine: number }[] = [];
    for (let l = 0; l < lines.length; l++) {
      const lineWords = lines[l];
      if (!lineWords || lineWords.length === 0) continue;
      for (const w of lineWords) {
        const [s, a] = w.verseKey.split(":");
        if (a === "1" && !surahStarts.some((item) => item.surah === Number(s))) {
          surahStarts.push({ surah: Number(s), startLine: l + 1 });
        }
      }
    }

    const slots: LineDetail[] = [];
    for (let index = 0; index < MUSHAF_LINES_PER_PAGE; index += 1) {
      const words = lines[index];
      const lineNum = index + 1;

      if (!words || words.length === 0) {
        let slot: LineDetail = { type: "empty" };
        for (const start of surahStarts) {
          if (start.surah === 1 && lineNum === 1) {
            slot = { type: "surah-header", surah: 1 };
            break;
          }
          if (lineNum === start.startLine - 2) {
            slot = { type: "surah-header", surah: start.surah };
            break;
          }
          if (lineNum === start.startLine - 1) {
            // Only one slot to spare: the heading and the basmalah share it
            // rather than one of them going missing.
            slot =
              start.startLine - 2 < 1
                ? { type: "surah-opening", surah: start.surah, withBismillah: start.surah !== 9 }
                : start.surah !== 9
                  ? { type: "bismillah" }
                  : { type: "empty" };
            break;
          }
        }
        slots.push(slot);
        continue;
      }

      slots.push({ type: "text", words });
    }

    if (!OPENING_PAGES.has(pageNumber)) return slots;
    const lastUsed = slots.reduce((last, slot, index) => (slot.type === "empty" ? last : index + 1), 0);
    return lastUsed > 0 ? slots.slice(0, lastUsed) : slots;
  }, [lines, pageNumber]);
}

/**
 * One printed page: its glosses, its fifteen slots, its own fitter.
 *
 * Lifted out of the viewer so a wide screen can hold two side by side.
 * Everything here is per-page and must not be shared — the measure and the type
 * size are derived from this page's own longest line, and an open gloss belongs
 * to the page it was tapped on.
 */
function MushafPageCanvas({
  lines,
  language,
  pageNumber,
  direction,
  theme,
  useQcfGlyphs,
  showWordMeanings,
  inkStroke,
  spreadSide,
  onAyahAction,
  highlightedVerseKey,
}: {
  lines: MushafWordToken[][];
  language: AppLanguage;
  pageNumber: number;
  direction: "ltr" | "rtl";
  theme: MushafPageTheme;
  useQcfGlyphs: boolean;
  showWordMeanings: boolean;
  inkStroke: string;
  spreadSide?: "right" | "left";
  onAyahAction?: (verseKey: string, pageNumber: number) => void;
  highlightedVerseKey?: string | null;
}) {
  const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);

  useEffect(() => {
    if (!showWordMeanings) setActiveWord(null);
  }, [showWordMeanings]);

  useEffect(() => {
    setActiveWord(null);
  }, [pageNumber]);

  // One lookup per word per page, rather than one per word per render.
  const meanings = useMemo(() => {
    const found = new Map<string, QuranWordMeaning>();
    if (!showWordMeanings) return found;
    for (const words of lines) {
      for (const word of words) {
        if (word.isEnd) continue;
        const meaning = getQuranWordMeaningEntry(word.verseKey, word.text);
        if (meaning) found.set(`${word.verseKey}:${word.position}`, meaning);
      }
    }
    return found;
  }, [lines, showWordMeanings]);

  const lineDetails = useLineDetails(lines, pageNumber);
  const canvasRef = useLineFitter(
    `${pageNumber}:${useQcfGlyphs}:${lines.length}`,
    useQcfGlyphs ? SLOT_INK_ALLOWANCE["qcf-v2"] : SLOT_INK_ALLOWANCE.fallback,
  );
  const handleActiveWordChange = useCallback((word: ActiveWord | null) => setActiveWord(word), []);

  const handleAyahAction = useCallback(
    (verseKey: string) => {
      onAyahAction?.(verseKey, pageNumber);
    },
    [onAyahAction, pageNumber],
  );

  return (
    <div
      ref={canvasRef}
      className={`${spreadSide ? "mushaf-spread__page" : "flex-1"} mushaf-page-canvas min-h-0 min-w-0 px-2 py-1.5 min-[360px]:px-3 sm:px-5 sm:py-2`}
      style={{ containerType: "size" }}
      data-mushaf-rendering={useQcfGlyphs ? "qcf-v2" : "unicode-fallback"}
      data-mushaf-page={pageNumber}
    >
      <div
        className={`flex h-full w-full flex-col ${spreadSide === "right" ? "ml-0 mr-auto" : spreadSide === "left" ? "ml-auto mr-0" : "mx-auto"}`}
        style={{
          maxWidth: "var(--mushaf-measure, 100%)",
          fontFamily: useQcfGlyphs ? `qcf-v2-page-${pageNumber}, var(--font-mushaf)` : "var(--font-mushaf)",
          fontSize: useQcfGlyphs
            ? "calc(min(4.6cqi, 4.6cqh) * var(--mushaf-fit, 1))"
            : "calc(min(3.6cqi, 4.1cqh) * var(--mushaf-fit, 1))",
          WebkitTextStrokeWidth: inkStroke,
          WebkitTextStrokeColor: "currentColor",
        }}
      >
        {lineDetails.map((line, lineIdx) => (
          <div key={lineIdx} className="min-h-0 w-full flex-1">
            {line.type === "surah-header" ? (
              <MushafSurahHeader surahNumber={line.surah} language={language} />
            ) : line.type === "surah-opening" ? (
              <SurahOpeningBand surahNumber={line.surah} language={language} withBismillah={line.withBismillah} />
            ) : line.type === "bismillah" ? (
              <BismillahLine />
            ) : line.type === "text" ? (
              <MushafTextLine
                words={line.words}
                language={language}
                theme={theme}
                useQcfGlyphs={useQcfGlyphs}
                showWordMeanings={showWordMeanings}
                meanings={meanings}
                activeWord={
                  activeWord &&
                  line.words.some((w) => w.verseKey === activeWord.verseKey && w.position === activeWord.wordPosition)
                    ? activeWord
                    : null
                }
                highlightedVerseKey={highlightedVerseKey}
                onActiveWordChange={handleActiveWordChange}
                onAyahAction={handleAyahAction}
              />
            ) : (
              <div className="h-full" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <QuranWordPopover
        meanings={activeWord ? [activeWord.meaning] : null}
        anchorEl={activeWord?.anchor ?? null}
        language={language}
        direction={direction}
        showSource
        onClose={() => setActiveWord(null)}
      />
    </div>
  );
}

function ScreenReaderVerses({
  lines,
  language,
  pageNumber,
}: {
  lines: MushafWordToken[][];
  language: AppLanguage;
  pageNumber: number;
}) {
  const verses = useMemo(() => {
    const verseMap = new Map<string, string[]>();
    for (const line of lines) {
      if (!line) continue;
      for (const w of line) {
        if (w.isEnd) continue; // the end marker is just a glyph
        const textArr = verseMap.get(w.verseKey) || [];
        textArr.push(w.text);
        verseMap.set(w.verseKey, textArr);
      }
    }
    return Array.from(verseMap.entries()).map(([key, words]) => ({
      key,
      text: words.join(" "),
    }));
  }, [lines]);

  return (
    <section aria-label={t(language, "mushaf.pageRegion", { page: formatNumerals(pageNumber, language) })}>
      {verses.map(({ key, text }) => {
        const [surah, ayah] = key.split(":");
        const surahName = getSurahDisplayName(Number(surah), language);
        return (
          <p key={key}>
            {surahName}, {t(language, "reader.ayahLabel", { ayah: formatNumerals(Number(ayah), language) })}: {text}
          </p>
        );
      })}
    </section>
  );
}

export function MushafPageViewer({
  lines,
  language,
  pageNumber,
  surahName,
  juzNumber,
  direction,
  theme = "light",
  isBookmarked = false,
  useQcfGlyphs = false,
  showWordMeanings = false,
  headerContent,
  footerContent,
  progressBar,
  paperRef,
  pageTransitionDirection,
  reduceMotion = false,
  facingPage,
  onAyahAction,
  highlightedVerseKey,
}: {
  lines: MushafWordToken[][];
  language: AppLanguage;
  pageNumber: number;
  /** The left-hand page of a spread, when the screen has room for one. */
  facingPage?: { pageNumber: number; lines: MushafWordToken[][]; useQcfGlyphs: boolean };
  surahName: string;
  juzNumber: number;
  direction: "ltr" | "rtl";
  theme?: MushafPageTheme;
  isBookmarked?: boolean;
  useQcfGlyphs?: boolean;
  showWordMeanings?: boolean;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  /** Always visible, whatever the chrome is doing. */
  progressBar?: ReactNode;
  /** The paper itself. A page turn drags this, never the chrome around it. */
  paperRef?: MutableRefObject<HTMLDivElement | null>;
  pageTransitionDirection?: "forward" | "backward";
  reduceMotion?: boolean;
  onAyahAction?: (verseKey: string, pageNumber: number) => void;
  highlightedVerseKey?: string | null;
}) {
  const formattedJuz = `${t(language, "common.juz")} ${formatNumerals(juzNumber, language)}`;

  useLayoutEffect(() => {
    const paper = paperRef?.current;
    if (!paper || !pageTransitionDirection || shouldReduceMotion(reduceMotion) || typeof paper.animate !== "function") {
      return;
    }
    const animation = paper.animate(
      [
        { opacity: 0.72, transform: `translateX(${pageTransitionDirection === "forward" ? "-6px" : "6px"})` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 150, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
    );
    return () => animation.cancel();
  }, [facingPage?.pageNumber, pageNumber, pageTransitionDirection, paperRef, reduceMotion]);

  // Theme styling classes. `--mushaf-ink-stroke` gives the glyphs a hairline of
  // extra weight for legibility: QCF v2 is a single-weight face, so synthetic
  // bold would smear the counters instead of thickening the stem.
  /**
   * Reading surfaces, not UI surfaces.
   *
   * The night themes used to run near-white ink on near-black paper — 17.6:1,
   * four times the 4.5:1 that AA asks for. That much contrast is what makes
   * glyphs bloom and smear on a dark ground over a long sitting. These sit
   * around 12:1: comfortably past AA, warm rather than blue, and calm enough to
   * read a juz by. OLED keeps its pure black on purpose — it is the
   * high-contrast choice, and it says so on the tin.
   */
  const themeClasses = theme === "oled" ? "bg-black text-white" : "bg-background text-foreground";

  const inkStroke = { midnight: "0.016em", dark: "0.016em", oled: "0.012em", light: "0.021em" }[theme];

  const chromeBgClass =
    theme === "oled" ? "bg-black border-white/30 text-white" : "bg-card border-border text-card-foreground";

  return (
    <article
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden transition-colors duration-200 ${themeClasses} ${theme === "oled" ? "" : `theme-${theme}`}`}
      data-theme={theme === "oled" ? undefined : theme}
      dir="rtl"
      aria-label={
        facingPage
          ? t(language, "mushaf.spreadLabel", {
              first: formatNumerals(pageNumber, language),
              second: formatNumerals(facingPage.pageNumber, language),
            })
          : t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })
      }
    >
      <h1 className="sr-only">
        {surahName} · {formattedJuz}
      </h1>
      {isBookmarked && (
        <div
          className="pointer-events-none absolute top-14 end-4 z-20 flex items-center justify-center text-primary drop-shadow-md"
          role="img"
          aria-label={t(language, "mushaf.bookmarkSaved")}
        >
          <Bookmark size={26} className="fill-primary text-primary" />
        </div>
      )}

      {/* The chrome occupies the physical Mushaf header/footer band permanently.
          Its content is held to the same measure as the page, so on a wide
          screen Previous and Next sit under the paper they turn rather than out
          at the far corners of the display. */}
      <div
        data-mushaf-chrome="header"
        className={`relative flex h-14 shrink-0 items-center border-b px-2 sm:px-3 ${chromeBgClass}`}
      >
        <div className="mx-auto flex w-full items-center" style={{ maxWidth: CHROME_MEASURE }}>
          {headerContent}
        </div>
        {/* Progress bar positioned absolutely at the bottom of the top header */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-[1px] z-10">{progressBar}</div>
      </div>

      {/* One page, or two facing pages when the screen has room for both at a
          readable size. Ordered as the Mushaf is bound: the lower page number
          on the right, the reader moving leftwards. */}
      <div
        key={`${pageNumber}:${facingPage?.pageNumber ?? "single"}`}
        ref={paperRef}
        className={`flex min-h-0 flex-1 ${facingPage ? "mushaf-spread" : ""}`}
        data-page-transition={pageTransitionDirection}
        dir="rtl"
      >
        {/* Plain visual words step aside from the accessibility tree until
            study mode is enabled; ayah-marker buttons remain operable in
            either mode, while the cohesive page regions below carry the
            normal reading experience. */}
        <div className="contents">
          <MushafPageCanvas
            lines={lines}
            language={language}
            pageNumber={pageNumber}
            direction={direction}
            theme={theme}
            useQcfGlyphs={useQcfGlyphs}
            showWordMeanings={showWordMeanings}
            inkStroke={inkStroke}
            spreadSide={facingPage ? "right" : undefined}
            onAyahAction={onAyahAction}
            highlightedVerseKey={highlightedVerseKey}
          />
          {facingPage && (
            <>
              <div className="mushaf-spread__gutter" aria-hidden="true" />
              <MushafPageCanvas
                lines={facingPage.lines}
                language={language}
                pageNumber={facingPage.pageNumber}
                direction={direction}
                theme={theme}
                useQcfGlyphs={facingPage.useQcfGlyphs}
                showWordMeanings={showWordMeanings}
                inkStroke={inkStroke}
                spreadSide="left"
                onAyahAction={onAyahAction}
                highlightedVerseKey={highlightedVerseKey}
              />
            </>
          )}
        </div>

        {/* The cohesive verse text, cleanly readable for screen readers when they aren't in study mode. */}
        {!showWordMeanings && (
          <div className="sr-only">
            <ScreenReaderVerses lines={lines} language={language} pageNumber={pageNumber} />
            {facingPage && (
              <ScreenReaderVerses lines={facingPage.lines} language={language} pageNumber={facingPage.pageNumber} />
            )}
          </div>
        )}
      </div>

      <div
        data-mushaf-chrome="footer"
        className={`relative flex h-14 shrink-0 items-center border-t px-2 sm:px-3 ${chromeBgClass}`}
      >
        <div className="mx-auto flex w-full items-center" style={{ maxWidth: CHROME_MEASURE }}>
          {footerContent}
        </div>
      </div>
    </article>
  );
}
