import { useMemo, type CSSProperties } from "react";
import { buildQuranTextSegments, type QuranWordMeaning, type WordMeaningSelection } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export function QuranWordText({
  text,
  meanings,
  language,
  style,
  onSelectMeanings,
}: {
  text: string;
  meanings: readonly QuranWordMeaning[];
  language: AppLanguage;
  style: CSSProperties;
  onSelectMeanings: (selection: WordMeaningSelection) => void;
}) {
  const segments = useMemo(() => buildQuranTextSegments(text, meanings), [meanings, text]);

  /* Reading order, so "next word" in the sheet matches the next highlight the
     eye reaches on the page. */
  const groups = useMemo(() => segments.flatMap((segment) => (segment.meanings ? [segment.meanings] : [])), [segments]);
  let groupIndex = -1;

  return (
    <p
      className="zikr-text text-center font-medium leading-[2.1] text-foreground"
      data-testid="zikr-text"
      dir="rtl"
      lang="ar"
      translate="no"
      style={style}
    >
      {segments.map((segment, index) => {
        if (!segment.meanings) return <span key={`text-${index}`}>{segment.text}</span>;
        groupIndex += 1;
        const currentGroupIndex = groupIndex;
        return (
          <button
            key={segment.meanings.map((meaning) => meaning.id).join("-")}
            type="button"
            data-testid="quran-word-help"
            data-prevent-count="true"
            onClick={(event) => {
              event.stopPropagation();
              onSelectMeanings({ groups, index: currentGroupIndex });
            }}
            aria-label={t(language, "reader.wordMeaningAria", {
              word: segment.text,
              ayah: formatNumerals(segment.meanings[0]!.ayahNumber, language),
            })}
            // A button does not inherit font-size or line-height from its
            // paragraph — the UA sheet gives it a 16px default — so a
            // highlighted word rendered several pixels smaller than the ayah
            // around it, and the gap grew with the reading-size setting.
            // Inherited explicitly; the heavier weight stays, since that is
            // the highlight.
            className="relative -mx-0.5 inline cursor-help rounded-md bg-primary/10 px-0.5 text-[length:inherit] font-semibold leading-[inherit] text-primary underline decoration-primary/60 decoration-dotted underline-offset-[0.22em] transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {segment.text}
          </button>
        );
      })}
    </p>
  );
}
