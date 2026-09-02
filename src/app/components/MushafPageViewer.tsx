import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type MutableRefObject,
} from "react";
import type { AppLanguage, MushafPageTheme, MushafTextScale } from "../types";
import { getQuranWordMeaningEntry, type QuranWordMeaning } from "../content/quranWordMeanings";
import { t } from "../i18n";
import { Bookmark } from "./icons";
import { formatNumerals } from "../formatting";
import { getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { QuranWordPopover } from "./QuranWordPopover";
import { shouldReduceMotion } from "../motionPreferences";
import { MushafSurahHeaderArt } from "./MushafSurahHeaderArt";
import { MushafBismillahArt } from "./MushafBismillahArt";
import { SURAH_PLACEMENTS } from "../content/mushafSurahPlacements";

const MushafOpeningFrameArt = lazy(() => import("./MushafOpeningFrameArt"));

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
  hideArtwork = false,
}: {
  surahNumber: number | string;
  language: AppLanguage;
  compact?: boolean;
  hideArtwork?: boolean;
}) {
  const title = getSurahDisplayName(surahNumber, language);

  return (
    <div
      className="relative flex h-full w-full min-w-0 items-center justify-center select-none"
      dir="rtl"
      data-testid="mushaf-surah-heading"
      data-variant="pill"
    >
      {!hideArtwork && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <MushafSurahHeaderArt className="h-full w-full max-w-full" />
        </div>
      )}
      <h2
        className="arabic-ui relative z-10 shrink-0 whitespace-nowrap text-center font-bold leading-none text-foreground"
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
  hideArtwork = false,
}: {
  surahNumber: number | string;
  language: AppLanguage;
  withBismillah: boolean;
  hideArtwork?: boolean;
}) {
  return (
    <div
      className={`grid h-full w-full min-w-0 items-center select-none ${withBismillah ? "grid-rows-2" : "grid-rows-1"}`}
      dir="rtl"
    >
      <div className="h-full min-h-0 w-full">
        <MushafSurahHeader
          surahNumber={surahNumber}
          language={language}
          compact={withBismillah}
          hideArtwork={hideArtwork}
        />
      </div>
      {withBismillah && (
        <div className="flex h-full min-h-0 items-center justify-center">
          <MushafBismillahArt className="h-full max-h-[85%] max-w-[65%] w-auto object-contain select-none" />
        </div>
      )}
    </div>
  );
}

function BismillahLine() {
  return (
    <div className="flex h-full w-full items-center justify-center select-none" dir="rtl">
      <MushafBismillahArt className="h-full max-h-[75%] max-w-[65%] w-auto object-contain select-none" />
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
  justifyCenter = false,
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
  justifyCenter?: boolean;
  onActiveWordChange: (word: ActiveWord | null) => void;
  onAyahAction?: (verseKey: string) => void;
}) {
  return (
    // The slot deliberately does not clip: the fitter already guarantees the
    // line fits the page width, and Arabic diacritics reach into the space
    // between lines exactly as they do in print.
    <div data-mushaf-line="" className="flex h-full w-full min-w-0 items-center justify-center">
      {/* The printed Mushaf justifies ordinary lines to both margins.
          Opening pages use natural center alignment without artificial wide gaps. */}
      <div
        data-mushaf-line-content=""
        className={`flex shrink-0 flex-nowrap items-baseline whitespace-nowrap ${
          justifyCenter
            ? `w-auto justify-center ${useQcfGlyphs ? "gap-x-1 min-[360px]:gap-x-1.5" : "gap-x-1.5 min-[360px]:gap-x-2"}`
            : `w-full justify-between ${useQcfGlyphs ? "gap-x-0" : "gap-x-0.5"}`
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

/**
 * The reader's type-size choice, as a multiplier on the ink allowance above.
 *
 * It scales the letters inside the fifteen slots. It cannot add, remove, or
 * re-break a line, because those are page data — so "larger text" here means
 * exactly what it means in print: the same page, set heavier.
 */
const TEXT_SCALE_FACTOR: Record<MushafTextScale, number> = { small: 0.9, medium: 1, large: 1.08 };

/** Past this the descenders of one line reach the marks of the next. */
const MAX_INK_ALLOWANCE = 0.94;

export function resolveInkAllowance(useQcfGlyphs: boolean, textScale: MushafTextScale) {
  const base = useQcfGlyphs ? SLOT_INK_ALLOWANCE["qcf-v2"] : SLOT_INK_ALLOWANCE.fallback;
  return Math.min(base * TEXT_SCALE_FACTOR[textScale], MAX_INK_ALLOWANCE);
}

function useLineFitter(dependencyKey: string, inkAllowance: number, isOpening: boolean) {
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

      /* The two halves of a spread share one parent, so writing the measure
         there gave both pages whichever fitter happened to run last. Each page
         owns its own measure: the vars are set on its canvas and inherited by
         its column. */
      const page = canvas;

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

      /**
       * The two opening pages are set as a matched pair in print.
       *
       * They do not share the fifteen-line grid, so their "slot" is however
       * tall a line of theirs happens to be — and Al-Fatihah's seven lines make
       * a shorter slot than Al-Baqarah's six. Sizing each page to its own slot
       * therefore set one at 29px and its facing page at 37px, and pinned
       * Al-Fatihah against the fitter's lower clamp so three of its lines had
       * to be squeezed on top of that. The pair takes one size from the CSS
       * clamp instead, and only overlong lines are corrected below.
       */
      if (isOpening) {
        for (let i = 0; i < contents.length; i++) {
          const content = contents[i]!;
          // An opening line is `w-auto`, so its own clientWidth is its content,
          // not its room. The room is what its wrapper gives it.
          const room = (content.parentElement as HTMLElement | null)?.clientWidth ?? 0;
          const natural = content.scrollWidth;
          const overrun = room > 0 && natural > room ? room / natural : 1;
          content.style.transform = overrun < 1 ? `scale(${overrun.toFixed(4)})` : "";
        }
        return;
      }

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
  }, [dependencyKey, inkAllowance, isOpening]);

  return canvasRef;
}

/** Which of the fifteen slots carry words, and which carry a heading or the
 *  basmalah. Shared by both pages of a spread. */
function useLineDetails(lines: MushafWordToken[][], pageNumber: number) {
  return useMemo<LineDetail[]>(() => {
    const slots: LineDetail[] = Array.from({ length: MUSHAF_LINES_PER_PAGE }, () => ({ type: "empty" }));

    // 1. Fill word tokens
    for (let l = 0; l < lines.length && l < MUSHAF_LINES_PER_PAGE; l++) {
      const lineWords = lines[l];
      if (lineWords && lineWords.length > 0) {
        slots[l] = { type: "text", words: lineWords };
      }
    }

    // 2. Surah placements from canonical map
    for (const [sStr, pl] of Object.entries(SURAH_PLACEMENTS)) {
      const surahNum = Number(sStr);
      if (pl.page === pageNumber) {
        const headerIdx = pl.line - 1;
        if (headerIdx >= 0 && headerIdx < MUSHAF_LINES_PER_PAGE && slots[headerIdx]?.type === "empty") {
          slots[headerIdx] = pl.openingBand
            ? { type: "surah-opening", surah: surahNum, withBismillah: surahNum !== 9 }
            : { type: "surah-header", surah: surahNum };
        }
        if (pl.bismillahLine) {
          const bismillahIdx = pl.bismillahLine - 1;
          if (bismillahIdx >= 0 && bismillahIdx < MUSHAF_LINES_PER_PAGE && slots[bismillahIdx]?.type === "empty") {
            slots[bismillahIdx] = { type: "bismillah" };
          }
        }
      }
    }

    // 3. If previous page had Surah header at line 15, page starts with Bismillah on line 1 (unless Surah 9)
    for (const [sStr, pl] of Object.entries(SURAH_PLACEMENTS)) {
      const surahNum = Number(sStr);
      if (pl.page === pageNumber - 1 && pl.line === 15 && surahNum !== 9) {
        if (slots[0]?.type === "empty") {
          slots[0] = { type: "bismillah" };
        }
      }
    }

    if (!OPENING_PAGES.has(pageNumber)) return slots;
    const lastUsed = slots.reduce((last, slot, index) => (slot.type === "empty" ? last : index + 1), 0);
    return lastUsed > 0 ? slots.slice(0, lastUsed) : slots;
  }, [lines, pageNumber]);
}

/**
 * The printed page's own header and footer.
 *
 * A bound Mushaf names every page on the page itself — surah at the head, juz
 * at the outer corner, the number at the foot — and that is what makes a
 * two-page spread legible: the chrome can only ever name one of the two pages,
 * while the paper names both. The bands sit outside the fifteen line slots, so
 * the canonical geometry is untouched; only the height the slots divide changes.
 */
function PageFurnitureHead({
  surahNumber,
  juzNumber,
  language,
}: {
  surahNumber: number | null;
  juzNumber: number;
  language: AppLanguage;
}) {
  return (
    <div className="mushaf-page-furniture flex shrink-0 items-center justify-between gap-2" dir="rtl">
      <span className="mushaf-page-furniture__juz arabic-ui min-w-0 shrink truncate" aria-hidden="true">
        {t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}
      </span>
      {surahNumber !== null && (
        <span className="mushaf-page-furniture__cartouche arabic-ui truncate" aria-hidden="true">
          {getSurahDisplayName(surahNumber, language)}
        </span>
      )}
      {/* Balances the juz label so the cartouche stays optically centred. */}
      <span className="mushaf-page-furniture__juz invisible min-w-0 shrink truncate" aria-hidden="true">
        {t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}
      </span>
    </div>
  );
}

function PageFurnitureFoot({ pageNumber, language }: { pageNumber: number; language: AppLanguage }) {
  return (
    <div className="mushaf-page-furniture flex shrink-0 items-center justify-center" dir="rtl">
      <span className="mushaf-page-furniture__folio tabular-nums" aria-hidden="true">
        {formatNumerals(pageNumber, language)}
      </span>
    </div>
  );
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
  textScale,
  showPageIdentity,
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
  textScale: MushafTextScale;
  /**
   * Whether the page names itself.
   *
   * Where the chrome already carries the surah forty pixels above the paper —
   * a phone, a portrait tablet — a second copy inside the frame buys nothing
   * and costs a tenth of the reading height. In a spread, in a rail layout, or
   * with the chrome hidden, the page is the only thing that can say where it is.
   */
  showPageIdentity: boolean;
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
  const isOpening = OPENING_PAGES.has(pageNumber);
  const canvasRef = useLineFitter(
    `${pageNumber}:${useQcfGlyphs}:${lines.length}:${textScale}`,
    resolveInkAllowance(useQcfGlyphs, textScale),
    isOpening,
  );

  /* Each page names itself, so a spread is not two anonymous columns under one
     chrome label. Taken from the page's own first verse. */
  const pageSurahNumber = useMemo(() => {
    for (const line of lines) {
      const first = line?.[0];
      if (!first) continue;
      const surah = Number(first.verseKey.split(":")[0]);
      return Number.isFinite(surah) ? surah : null;
    }
    return null;
  }, [lines]);
  const pageJuzNumber = useMemo(() => getJuzNumberForPage(pageNumber), [pageNumber]);
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
      className={`relative ${spreadSide ? "mushaf-spread__page" : "flex-1"} mushaf-page-canvas min-h-0 min-w-0 px-2 py-1.5 min-[360px]:px-3 sm:px-5 sm:py-2`}
      style={{ containerType: "size" }}
      data-mushaf-rendering={useQcfGlyphs ? "qcf-v2" : "unicode-fallback"}
      data-mushaf-page={pageNumber}
    >
      {isOpening ? (
        <>
          <Suspense fallback={null}>
            <MushafOpeningFrameArt
              pageNumber={pageNumber}
              className="absolute inset-0 h-full w-full pointer-events-none select-none z-0"
            />
          </Suspense>
          {/* Content Area within Cartouche */}
          <div
            className="absolute z-10 flex flex-col items-center justify-between text-center"
            style={{
              top: "4%",
              bottom: "4%",
              left: "6%",
              right: "6%",
              fontFamily: useQcfGlyphs ? `qcf-v2-page-${pageNumber}, var(--font-mushaf)` : "var(--font-mushaf)",
              // No --mushaf-fit here: the pair shares one size (see useLineFitter).
              fontSize: useQcfGlyphs ? "min(6.1cqi, 6.1cqh)" : "min(5.0cqi, 5.4cqh)",
              WebkitTextStrokeWidth: inkStroke,
              WebkitTextStrokeColor: "currentColor",
            }}
          >
            {/* Basmalah: Al-Fatihah (page 1) has only one Basmalah which is Ayah 1 in its text lines */}
            {pageNumber !== 1 && (
              <div className="w-full flex items-center justify-center shrink-0 h-[12%] min-h-0 mb-2">
                <MushafBismillahArt className="h-full max-h-[90%] max-w-[70%] w-auto object-contain select-none" />
              </div>
            )}
            {/* Verses */}
            <div className="w-full flex-1 flex flex-col justify-evenly items-center min-h-0 py-1">
              {lineDetails
                .filter((line): line is { type: "text"; words: MushafWordToken[] } => line.type === "text")
                .map((line, lineIdx) => (
                  <div key={lineIdx} className="w-full flex items-center justify-center min-h-0">
                    <MushafTextLine
                      words={line.words}
                      language={language}
                      theme={theme}
                      useQcfGlyphs={useQcfGlyphs}
                      showWordMeanings={showWordMeanings}
                      meanings={meanings}
                      justifyCenter={true}
                      activeWord={
                        activeWord &&
                        line.words.some(
                          (w) => w.verseKey === activeWord.verseKey && w.position === activeWord.wordPosition,
                        )
                          ? activeWord
                          : null
                      }
                      highlightedVerseKey={highlightedVerseKey}
                      onActiveWordChange={handleActiveWordChange}
                      onAyahAction={handleAyahAction}
                    />
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div
          className={`mushaf-page-frame relative z-10 flex h-full w-full flex-col ${
            spreadSide === "right" ? "mr-auto ml-0" : spreadSide === "left" ? "mr-0 ml-auto" : "mx-auto"
          }`}
        >
          {/* The manuscript rule, drawn in the page's own ink.
              Two strokes, as a printed Mushaf has: a heavier outer rule that
              gives the page an edge, and a lighter inner one set in from it.
              A single hairline at 20% opacity read as a faint box around
              crowded type rather than as the frame of a page. */}
          <div className="mushaf-page-rule" aria-hidden="true" />
          <div className="mushaf-page-rule mushaf-page-rule--inner" aria-hidden="true" />
          {showPageIdentity && (
            <PageFurnitureHead surahNumber={pageSurahNumber} juzNumber={pageJuzNumber} language={language} />
          )}
          {/* The fifteen slots, and nothing else: a stable hook for the
              geometry assertions that guard DEC-089. */}
          <div
            data-mushaf-column=""
            className="flex min-h-0 w-full flex-1 flex-col"
            style={{
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
                  <MushafSurahHeader surahNumber={line.surah} language={language} hideArtwork={false} />
                ) : line.type === "surah-opening" ? (
                  <SurahOpeningBand
                    surahNumber={line.surah}
                    language={language}
                    withBismillah={line.withBismillah}
                    hideArtwork={false}
                  />
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
                      line.words.some(
                        (w) => w.verseKey === activeWord.verseKey && w.position === activeWord.wordPosition,
                      )
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
          {showPageIdentity && <PageFurnitureFoot pageNumber={pageNumber} language={language} />}
        </div>
      )}
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
  railContent,
  railSide = "right",
  progressBar,
  paperRef,
  pageTransitionDirection,
  reduceMotion = false,
  textScale = "medium",
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
  /**
   * A vertical tool rail beside the paper, used where the screen is wider than
   * it is tall. It replaces the two horizontal bars rather than joining them:
   * on a landscape screen height is the scarce dimension and width is not.
   */
  railContent?: ReactNode;
  railSide?: "right" | "left";
  /** Always visible, whatever the chrome is doing. */
  progressBar?: ReactNode;
  /** The paper itself. A page turn drags this, never the chrome around it. */
  paperRef?: MutableRefObject<HTMLDivElement | null>;
  pageTransitionDirection?: "forward" | "backward";
  reduceMotion?: boolean;
  /** Reading type size within the fixed fifteen-line geometry. */
  textScale?: MushafTextScale;
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
        { opacity: 0.8, transform: `translateX(${pageTransitionDirection === "forward" ? "-22px" : "22px"})` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" },
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

  const useRail = Boolean(railContent);
  /* A spread needs each half to name itself; so does any layout where the
     chrome is not carrying the surah above the paper. */
  const showPageIdentity = Boolean(facingPage) || useRail || !headerContent;

  return (
    <article
      className={`relative flex h-full min-h-0 w-full overflow-hidden transition-colors duration-200 ${useRail ? (railSide === "left" ? "flex-row-reverse" : "") : "flex-col"} ${themeClasses} ${theme === "oled" ? "" : `theme-${theme}`}`}
      data-mushaf-chrome-mode={useRail ? "rail" : "bars"}
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
          className={`pointer-events-none absolute end-4 z-20 flex items-center justify-center text-primary drop-shadow-md ${
            headerContent && !useRail ? "top-14" : "top-2"
          }`}
          role="img"
          aria-label={t(language, "mushaf.bookmarkSaved")}
        >
          <Bookmark size={26} className="fill-primary text-primary" />
        </div>
      )}

      {/* On a landscape screen the tools stand beside the paper, because there
          height is the scarce dimension and the two horizontal bars spent 112px
          of it. Elsewhere the chrome keeps the physical Mushaf header/footer
          band, its content held to the page's own measure so Previous and Next
          sit under the paper they turn. */}
      {useRail ? (
        <div
          data-mushaf-chrome="rail"
          className={`relative flex shrink-0 flex-col ${railSide === "left" ? "border-s" : "border-e"} ${chromeBgClass}`}
        >
          {railContent}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">{progressBar}</div>
        </div>
      ) : headerContent ? (
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
      ) : (
        /* Focus mode: no chrome at all, and the progress hairline is the last
           thing to go — it is the only thing on screen that is not the page. */
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10">{progressBar}</div>
      )}

      {/* One page, or two facing pages when the screen has room for both at a
          readable size. Ordered as the Mushaf is bound: the lower page number
          on the right, the reader moving leftwards. */}
      {/* Below MIN_PAPER_HEIGHT the paper stops being squeezed into the
          viewport and starts scrolling inside it. Fifteen lines is page data,
          so a 278px-tall landscape phone can only honour it by shrinking the
          type to 9px — which is not reading. The paper keeps a legible floor
          and the window moves over it instead, exactly as a held page does. */}
      <div
        key={`${pageNumber}:${facingPage?.pageNumber ?? "single"}`}
        ref={paperRef}
        className={`mushaf-paper flex min-h-0 min-w-0 flex-1 ${facingPage ? "mushaf-spread" : ""}`}
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
            textScale={textScale}
            showPageIdentity={showPageIdentity}
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
                textScale={textScale}
                showPageIdentity={showPageIdentity}
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

      {!useRail && footerContent && (
        <div
          data-mushaf-chrome="footer"
          className={`relative flex h-14 shrink-0 items-center border-t px-2 sm:px-3 ${chromeBgClass}`}
        >
          <div className="mx-auto flex w-full items-center" style={{ maxWidth: CHROME_MEASURE }}>
            {footerContent}
          </div>
        </div>
      )}
    </article>
  );
}
