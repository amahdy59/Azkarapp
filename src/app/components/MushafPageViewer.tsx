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
import type { AppLanguage, MushafTheme } from "../types";
import { getQuranWordMeaning } from "../content/quranWordMeanings";
import * as Popover from "@radix-ui/react-popover";
import { t } from "../i18n";
import { X, Bookmark } from "./icons";
import { formatNumerals } from "../formatting";
import { getSurahDisplayName } from "../content/surahInfo";

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
  theme = "parchment",
}: {
  number: string | number;
  language: AppLanguage;
  theme?: MushafTheme;
}) {
  const displayNum = formatNumerals(number, language);
  const isOled = theme === "oled";

  return (
    <span
      className="relative inline-flex shrink-0 select-none items-center justify-center align-middle mx-0.5"
      role="img"
      aria-label={`آية ${displayNum}`}
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
 * The printed Mushaf sets a surah heading in a thin ornamented band exactly one
 * line tall. The previous rounded card was three times that height and pushed
 * the reading canvas off the reference grid.
 */
function SurahHeaderBand({
  surahNumber,
  language,
  theme = "parchment",
}: {
  surahNumber: number | string;
  language: AppLanguage;
  theme?: MushafTheme;
}) {
  const title = getSurahDisplayName(surahNumber, language);
  const isOled = theme === "oled";

  const rule = isOled ? "bg-white/35" : "bg-current opacity-20";

  return (
    <div className="flex h-full w-full items-center justify-center gap-2.5 px-2 select-none" dir="rtl">
      {/* A double rule either side — the printed heading's ornament, carried at
          one line height rather than the boxed panel it used to be. */}
      <span className="flex flex-1 flex-col gap-[0.15em]" aria-hidden="true">
        <span className={`h-px w-full ${rule}`} />
        <span className={`h-px w-full ${rule}`} />
      </span>
      <span className="shrink-0 text-[0.42em] opacity-45" aria-hidden="true">
        ۞
      </span>
      <span className="shrink-0 truncate font-arabic text-[0.52em] font-semibold tracking-[0.12em]">{title}</span>
      <span className="shrink-0 text-[0.42em] opacity-45" aria-hidden="true">
        ۞
      </span>
      <span className="flex flex-1 flex-col gap-[0.15em]" aria-hidden="true">
        <span className={`h-px w-full ${rule}`} />
        <span className={`h-px w-full ${rule}`} />
      </span>
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
  theme = "parchment",
  withBismillah,
}: {
  surahNumber: number | string;
  language: AppLanguage;
  theme?: MushafTheme;
  withBismillah: boolean;
}) {
  const title = getSurahDisplayName(surahNumber, language);
  const isOled = theme === "oled";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-px px-2 select-none" dir="rtl">
      <span className="flex w-full items-center justify-center gap-2">
        <span className={`h-px flex-1 ${isOled ? "bg-white/40" : "bg-current opacity-25"}`} aria-hidden="true" />
        <span className="shrink-0 truncate font-arabic text-[0.48em] font-semibold tracking-[0.12em]">{title}</span>
        <span className={`h-px flex-1 ${isOled ? "bg-white/40" : "bg-current opacity-25"}`} aria-hidden="true" />
      </span>
      {withBismillah && (
        <span className="font-arabic text-[0.5em] leading-none opacity-90" style={{ fontFamily: "var(--font-mushaf)" }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </span>
      )}
    </div>
  );
}

function BismillahLine() {
  return (
    <div className="flex h-full w-full items-center justify-center select-none" dir="rtl">
      <p className="font-arabic text-[0.92em] leading-none tracking-wide" style={{ fontFamily: "inherit" }}>
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </p>
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
  text: string;
  meaning: string;
}

const MushafTextLine = memo(function MushafTextLine({
  words,
  language,
  direction,
  theme,
  useQcfGlyphs,
  showWordMeanings,
  meanings,
  activeWord,
  onActiveWordChange,
}: {
  words: MushafWordToken[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  theme: MushafTheme;
  useQcfGlyphs: boolean;
  showWordMeanings: boolean;
  meanings: ReadonlyMap<string, string>;
  /** The open word *on this line*, or null. Passing the page-wide value here
   *  re-rendered all fifteen lines every time a popover opened. */
  activeWord: ActiveWord | null;
  onActiveWordChange: (word: ActiveWord | null) => void;
}) {
  const isArabic = language === "ar";

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
            if (useQcfGlyphs && w.qcfCode) {
              return (
                <span
                  key={key}
                  className="inline-block shrink-0 select-none align-baseline"
                  role="img"
                  aria-label={`آية ${formatNumerals(w.verseKey.split(":")[1] || w.text, language)}`}
                >
                  {w.qcfCode}
                </span>
              );
            }
            return (
              <AyahMarker
                key={key}
                number={w.text || w.verseKey.split(":")[1] || ""}
                language={language}
                theme={theme}
              />
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
              <span className="select-text" title={!isArabic && meaning ? meaning : undefined}>
                {w.text}
              </span>
            );

          if (meaning && showWordMeanings) {
            const isOpen = activeWord?.verseKey === w.verseKey && activeWord?.wordPosition === w.position;
            return (
              <Popover.Root
                key={`${w.verseKey}-${w.position}`}
                open={isOpen}
                onOpenChange={(open) => {
                  if (open)
                    onActiveWordChange({ verseKey: w.verseKey, wordPosition: w.position, text: w.text, meaning });
                  else if (isOpen) onActiveWordChange(null);
                }}
              >
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className="relative inline shrink-0 appearance-none rounded-sm border-0 bg-primary/10 p-0 align-baseline text-primary underline decoration-2 decoration-dotted underline-offset-4 transition-colors [font:inherit] [line-height:inherit] hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t(language, "mushaf.wordMeaning", { word: w.text })}
                  >
                    {wordContent}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    sideOffset={6}
                    className="z-50 max-w-[290px] rounded-xl border border-border/60 bg-popover p-3.5 text-popover-foreground shadow-overlay animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                    dir={direction}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex w-full items-center justify-between border-b border-border/40 pb-1.5">
                        <span
                          className="text-[1.125rem] font-bold text-primary"
                          style={{ fontFamily: "var(--font-mushaf)" }}
                        >
                          {w.text}
                        </span>
                        <Popover.Close className="rounded-full p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          <X size={14} />
                        </Popover.Close>
                      </div>
                      <p className="font-sans text-[0.875rem] font-medium leading-relaxed">{meaning}</p>
                    </div>
                    <Popover.Arrow className="fill-popover" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            );
          }

          return (
            <span key={key} className="shrink-0">
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
 *
 * Summed from the words rather than read off the box: the line is a
 * `space-between` flex row, so its own `scrollWidth` equals the container width
 * whenever the words are being spread — which reported every under-filled line
 * as exactly full and left the page's type at its starting size. `scrollWidth`
 * is consulted only when it genuinely overflows.
 */
function measureNaturalWidth(content: HTMLElement) {
  const gap = Number.parseFloat(getComputedStyle(content).columnGap) || 0;
  let natural = gap * Math.max(0, content.children.length - 1);
  for (const child of Array.from(content.children)) natural += (child as HTMLElement).offsetWidth;
  const overflow = content.scrollWidth > content.clientWidth ? content.scrollWidth : 0;
  return Math.max(natural, overflow);
}

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

      // Pass one — release both constraints, then measure the page as the
      // stylesheet would set it. Only the two custom properties are ever
      // written; the font-size expression itself belongs to React, and clearing
      // that left the page at the browser default.
      // Written on the page, not the column: the header and footer are the
      // column's siblings and have to line up with the same measure, and a
      // custom property only inherits downwards.
      const page = (canvas.parentElement as HTMLElement | null) ?? column;
      page.style.setProperty("--mushaf-measure", "100%");
      page.style.setProperty("--mushaf-fit", "1");
      for (const content of contents) {
        content.style.transform = "";
        content.style.justifyContent = "";
      }

      const available = first.clientWidth;
      const slotHeight = (first.parentElement as HTMLElement | null)?.clientHeight ?? 0;
      if (available <= 0 || slotHeight <= 0) return;

      // Only full lines say anything about the page's natural measure; a
      // two-word closing line would drag the whole page's type up.
      const fullLines = contents.filter((content) => content.children.length >= 5).map(measureNaturalWidth);
      const widest = fullLines.length > 0 ? Math.max(...fullLines) : 0;
      const lineHeight = first.offsetHeight;

      /**
       * The measure is derived, not chosen.
       *
       * Fifteen lines have to fit the page height, which caps how large the type
       * can be; the type size in turn fixes how wide a line wants to be. Picking
       * the column width independently — it was capped at `92cqh` — left the
       * widest line covering only three quarters of it on a tablet or desktop,
       * so every line fell short of the justify threshold and the page rendered
       * as a narrow ragged column with wide margins. Setting the measure to what
       * the vertically-limited type actually spans makes the two agree, and the
       * type comes out the same size either way.
       */
      const verticalScale = lineHeight > 0 ? (slotHeight * inkAllowance) / lineHeight : 1;
      const measure = Math.min(widest * verticalScale, available);
      const scale = Math.min(Math.max(widest > 0 ? measure / widest : 1, 0.6), 2.4);

      page.style.setProperty("--mushaf-measure", `${Math.round(measure)}px`);
      page.style.setProperty("--mushaf-fit", scale.toFixed(3));

      // Pass two — settle each line at the size the page actually ended up with.
      const fills = contents.map((content) => {
        const width = content.clientWidth;
        return width > 0 ? measureNaturalWidth(content) / width : 1;
      });

      contents.forEach((content, index) => {
        const fill = fills[index] ?? 1;
        content.style.transform = fill > 1 ? `scale(${(1 / fill).toFixed(4)})` : "";
        content.style.justifyContent = fill >= JUSTIFY_FILL_THRESHOLD ? "" : "center";
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);
    // Web fonts settle after first paint; a line measured against the fallback
    // metrics would otherwise stay scaled to the wrong ratio.
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
}: {
  lines: MushafWordToken[][];
  language: AppLanguage;
  pageNumber: number;
  direction: "ltr" | "rtl";
  theme: MushafTheme;
  useQcfGlyphs: boolean;
  showWordMeanings: boolean;
  inkStroke: string;
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
    const found = new Map<string, string>();
    for (const words of lines) {
      for (const word of words) {
        if (word.isEnd) continue;
        const meaning = getQuranWordMeaning(word.verseKey, word.text);
        if (meaning) found.set(`${word.verseKey}:${word.position}`, meaning);
      }
    }
    return found;
  }, [lines]);

  const lineDetails = useLineDetails(lines, pageNumber);
  const canvasRef = useLineFitter(
    `${pageNumber}:${useQcfGlyphs}:${lines.length}`,
    useQcfGlyphs ? SLOT_INK_ALLOWANCE["qcf-v2"] : SLOT_INK_ALLOWANCE.fallback,
  );
  const handleActiveWordChange = useCallback((word: ActiveWord | null) => setActiveWord(word), []);

  return (
    <div
      ref={canvasRef}
      className="min-h-0 min-w-0 flex-1 px-2 py-1.5 min-[360px]:px-3 sm:px-5 sm:py-2"
      style={{ containerType: "size" }}
      data-mushaf-rendering={useQcfGlyphs ? "qcf-v2" : "unicode-fallback"}
      data-mushaf-page={pageNumber}
    >
      <div
        className="mx-auto flex h-full w-full flex-col"
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
              <SurahHeaderBand surahNumber={line.surah} language={language} theme={theme} />
            ) : line.type === "surah-opening" ? (
              <SurahOpeningBand
                surahNumber={line.surah}
                language={language}
                theme={theme}
                withBismillah={line.withBismillah}
              />
            ) : line.type === "bismillah" ? (
              <BismillahLine />
            ) : line.type === "text" ? (
              <MushafTextLine
                words={line.words}
                language={language}
                direction={direction}
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
                onActiveWordChange={handleActiveWordChange}
              />
            ) : (
              <div className="h-full" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MushafPageViewer({
  lines,
  language,
  pageNumber,
  surahName,
  juzNumber,
  direction,
  theme = "parchment",
  isBookmarked = false,
  useQcfGlyphs = false,
  showWordMeanings = false,
  headerContent,
  footerContent,
  footerStatus,
  progressBar,
  chromeVisible = true,
  paperRef,
  facingPage,
}: {
  lines: MushafWordToken[][];
  language: AppLanguage;
  pageNumber: number;
  /** The left-hand page of a spread, when the screen has room for one. */
  facingPage?: { pageNumber: number; lines: MushafWordToken[][]; useQcfGlyphs: boolean };
  surahName: string;
  juzNumber: number;
  direction: "ltr" | "rtl";
  theme?: MushafTheme;
  isBookmarked?: boolean;
  useQcfGlyphs?: boolean;
  showWordMeanings?: boolean;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  /** Shown in the footer's reserved space once the action rows step aside, so
   *  the reader never loses their place. */
  footerStatus?: ReactNode;
  /** Always visible, whatever the chrome is doing. */
  progressBar?: ReactNode;
  chromeVisible?: boolean;
  /** The paper itself. A page turn drags this, never the chrome around it. */
  paperRef?: MutableRefObject<HTMLDivElement | null>;
}) {
  const formattedJuz = `${t(language, "common.juz")} ${formatNumerals(juzNumber, language)}`;

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
  const themeClasses = {
    parchment: "bg-[#fbf7ee] dark:bg-[#191d26] text-[#1c1917] dark:text-[#e6e1d6]",
    dark: "bg-[#1a1d23] text-[#ded8cc]",
    oled: "bg-[#000000] text-[#ffffff]",
    white: "bg-[#ffffff] text-[#111827]",
  }[theme];

  const inkStroke = { parchment: "0.021em", dark: "0.016em", oled: "0.012em", white: "0.021em" }[theme];

  const gutterClass = { parchment: "bg-current/15", dark: "bg-current/15", oled: "bg-white/25", white: "bg-black/10" }[
    theme
  ];

  const chromeBgClass = {
    parchment: "bg-primary/5 border-primary/20 text-foreground/80",
    dark: "bg-primary/10 border-primary/20 text-foreground/80",
    oled: "bg-white/10 border-white/30 text-white",
    white: "bg-gray-100 border-gray-200 text-gray-800",
  }[theme];

  return (
    <article
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden transition-colors duration-200 ${themeClasses}`}
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

      {/* The chrome occupies the physical Mushaf header/footer band, and keeps
          that space whether or not it is showing anything: hiding the controls
          must never resize the reading canvas underneath them.

          Its content is held to the same measure as the page, so on a wide
          screen Previous and Next sit under the paper they turn rather than out
          at the far corners of the display. */}
      <div
        data-mushaf-chrome="header"
        className={`flex h-14 shrink-0 items-center border-b px-2 transition-[opacity,visibility] duration-200 sm:px-3 ${chromeBgClass} ${
          chromeVisible ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!chromeVisible}
      >
        <div className="mx-auto flex w-full items-center" style={{ maxWidth: CHROME_MEASURE }}>
          {headerContent}
        </div>
      </div>

      {/* One page, or two facing pages when the screen has room for both at a
          readable size. Ordered as the Mushaf is bound: the lower page number
          on the right, the reader moving leftwards. */}
      <div ref={paperRef} className="flex min-h-0 flex-1" dir="rtl">
        <MushafPageCanvas
          lines={lines}
          language={language}
          pageNumber={pageNumber}
          direction={direction}
          theme={theme}
          useQcfGlyphs={useQcfGlyphs}
          showWordMeanings={showWordMeanings}
          inkStroke={inkStroke}
        />
        {facingPage && (
          <>
            <div className={`w-px shrink-0 self-stretch ${gutterClass}`} aria-hidden="true" />
            <MushafPageCanvas
              lines={facingPage.lines}
              language={language}
              pageNumber={facingPage.pageNumber}
              direction={direction}
              theme={theme}
              useQcfGlyphs={facingPage.useQcfGlyphs}
              showWordMeanings={showWordMeanings}
              inkStroke={inkStroke}
            />
          </>
        )}
      </div>

      <div
        data-mushaf-chrome="footer"
        className={`relative flex h-14 shrink-0 items-center border-t px-2 sm:px-3 ${chromeBgClass}`}
      >
        {/* `relative` matters: the row that steps aside is positioned against
            this measure, not against the full-width footer. Without it the
            hidden controls stretched across a 2000px display. */}
        <div className="relative mx-auto flex w-full items-center" style={{ maxWidth: CHROME_MEASURE }}>
          <div
            className={`w-full transition-[opacity,visibility] duration-200 ${chromeVisible ? "visible opacity-100" : "invisible absolute inset-x-0 opacity-0"}`}
          >
            {footerContent}
          </div>
          <div
            className={`w-full transition-[opacity,visibility] duration-200 ${chromeVisible ? "invisible absolute inset-x-0 opacity-0" : "visible opacity-100"}`}
          >
            {footerStatus}
          </div>
        </div>
        {/* Outside both, because the reader's progress is never in the way. */}
        {progressBar}
      </div>
    </article>
  );
}
