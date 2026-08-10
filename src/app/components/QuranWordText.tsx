import { useMemo, type CSSProperties } from "react";
import { buildQuranTextSegments, type QuranWordMeaning } from "../content/quranWordMeanings";
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
  onSelectMeanings: (meanings: QuranWordMeaning[]) => void;
}) {
  const segments = useMemo(() => buildQuranTextSegments(text, meanings), [meanings, text]);

  return (
    <p
      className="zikr-text text-justify font-medium leading-[2.1] text-foreground"
      data-testid="zikr-text"
      dir="rtl"
      lang="ar"
      translate="no"
      style={style}
    >
      {segments.map((segment, index) =>
        segment.meanings ? (
          <button
            key={segment.meanings.map((meaning) => meaning.id).join("-")}
            type="button"
            data-testid="quran-word-help"
            data-prevent-count="true"
            onClick={(event) => {
              event.stopPropagation();
              onSelectMeanings(segment.meanings!);
            }}
            aria-label={t(language, "reader.wordMeaningAria", {
              word: segment.text,
              ayah: formatNumerals(segment.meanings[0]!.ayahNumber, language),
            })}
            className="relative -mx-0.5 inline cursor-help rounded-md bg-primary/10 px-0.5 font-semibold text-primary underline decoration-primary/60 decoration-dotted underline-offset-[0.22em] transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {segment.text}
          </button>
        ) : (
          <span key={`text-${index}`}>{segment.text}</span>
        ),
      )}
    </p>
  );
}
