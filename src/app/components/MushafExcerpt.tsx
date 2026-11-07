import { useMemo, type ReactNode } from "react";
import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { excerptActiveWord, excerptWordMapping, MUSHAF_EXCERPTS, selectMushafExcerpt } from "../content/mushafExcerpts";
import type { ListeningWordTiming } from "../audio/listeningTimings";
import type { AppLanguage, MushafPageTheme, TextSizeOption } from "../types";
import { MushafExcerptCanvas } from "./MushafPageViewer";
import { t } from "../i18n";

export default function MushafExcerpt({
  canonicalKey,
  transcript,
  language,
  cue,
  fallback,
  textSize = "medium",
  theme = "light",
}: {
  canonicalKey: string;
  transcript: string;
  language: AppLanguage;
  cue: ListeningWordTiming | null;
  fallback: ReactNode;
  textSize?: TextSizeOption;
  theme?: MushafPageTheme;
}) {
  const range = MUSHAF_EXCERPTS[canonicalKey]!;
  const { result, error } = useListeningMushafPage(range.page, 0);
  const { result: ending, error: endingError } = useListeningMushafPage(range.endPage ?? 0, 0, Boolean(range.endPage));
  const selection = useMemo(() => {
    if (!result || (range.endPage && !ending)) return null;
    const lines = selectMushafExcerpt([...result.lines, ...(range.endPage ? ending!.lines : [])], range.from, range.to);
    const mapping = excerptWordMapping(lines, transcript);
    return mapping ? { lines, mapping } : null;
  }, [result, ending, range, transcript]);
  if ((!result && !error) || (range.endPage && !ending && !endingError))
    return (
      <span role="status" aria-busy="true" className="text-sm text-muted-foreground">
        {t(language, "common.loading")}
      </span>
    );
  if (!result || !selection) return fallback;
  return (
    <div className="w-full">
      <MushafExcerptCanvas
        lines={selection.lines}
        pageNumber={range.page}
        language={language}
        useQcfGlyphs={result.qcf && (!range.endPage || Boolean(ending?.qcf))}
        highlightedWord={excerptActiveWord(selection.mapping, cue)}
        textSize={textSize}
        theme={theme}
      />
    </div>
  );
}
