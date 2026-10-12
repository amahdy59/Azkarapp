import { useMemo, type CSSProperties } from "react";
import { buildQuranTextSegments, type QuranWordMeaning, type WordMeaningSelection } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { QuranVerseText, type QuranWordAttributes } from "./QuranVerseText";

/** Meanings decorate the existing word boxes; they never replace the text layout. */
export function QuranWordText({
  text,
  meanings,
  language,
  style,
  onSelectMeanings,
  activeWordId,
  canonicalKey,
  showMeanings = true,
}: {
  text: string;
  meanings: readonly QuranWordMeaning[];
  language: AppLanguage;
  style: CSSProperties;
  onSelectMeanings: (selection: WordMeaningSelection) => void;
  activeWordId?: string | null;
  canonicalKey?: string;
  showMeanings?: boolean;
}) {
  const annotations = useMemo(() => {
    let offset = 0;
    let index = 0;
    return buildQuranTextSegments(text, meanings).flatMap((segment) => {
      const start = offset;
      offset += segment.text.length;
      return segment.meanings ? [{ start, end: offset, meanings: segment.meanings, index: index++ }] : [];
    });
  }, [meanings, text]);
  const groups = annotations.map((annotation) => annotation.meanings);
  const wordAttributes: QuranWordAttributes = (start, end) => {
    if (!showMeanings) return {};
    const annotation = annotations.find((item) => item.start < end && item.end > start);
    if (!annotation) return {};
    const select = (anchor: HTMLElement) => onSelectMeanings({ groups, index: annotation.index, anchor });
    return {
      role: "button",
      tabIndex: 0,
      "data-testid": "quran-word-help",
      "data-prevent-count": "true",
      "data-word-active": annotation.meanings[0]!.id === activeWordId ? "true" : undefined,
      "aria-label": t(language, "reader.wordMeaningAria", {
        word: text.slice(annotation.start, annotation.end),
        ayah: formatNumerals(annotation.meanings[0]!.ayahNumber, language),
      }),
      onPointerDown: (event) => event.stopPropagation(),
      onClick: (event) => {
        event.stopPropagation();
        select(event.currentTarget);
      },
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          select(event.currentTarget);
        }
      },
      className: "cursor-help focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
      style: {
        color: "color-mix(in srgb, var(--primary) 60%, var(--foreground))",
        backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)",
        borderRadius: "0.15em",
        textDecoration: "underline dotted",
        textDecorationColor: "color-mix(in srgb, var(--primary) 60%, transparent)",
        textUnderlineOffset: "0.22em",
      },
    } as ReturnType<QuranWordAttributes>;
  };
  return (
    <p
      className="zikr-text text-center text-foreground"
      data-testid="zikr-text"
      data-quran-passage=""
      dir="rtl"
      lang="ar"
      translate="no"
      style={{ ...style, ...QURAN_TEXT_STYLE }}
    >
      <QuranVerseText text={text} language={language} canonicalKey={canonicalKey} wordAttributes={wordAttributes} />
    </p>
  );
}
