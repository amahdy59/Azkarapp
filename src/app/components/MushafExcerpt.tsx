import { useMemo, type ReactNode } from "react";
import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { excerptActiveWord, excerptWordMapping, MUSHAF_EXCERPTS, selectMushafExcerpt } from "../content/mushafExcerpts";
import type { ListeningWordTiming } from "../audio/listeningTimings";
import type { AppLanguage, MushafPageTheme, TextSizeOption } from "../types";
import { MushafExcerptCanvas } from "./MushafPageViewer";

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
  // Flowing excerpts use bundled Amiri; fetching a full-page QCF font only
  // delays their canonical words and adds an unnecessary network request.
  const { result } = useListeningMushafPage(range.page, 0, false);
  const selection = useMemo(() => {
    if (!result) return null;
    const lines = selectMushafExcerpt(result.lines, range.from, range.to);
    const mapping = excerptWordMapping(lines, transcript);
    return mapping ? { lines, mapping } : null;
  }, [result, range, transcript]);
  if (!result || !selection) return fallback;
  return (
    <div className="w-full">
      <MushafExcerptCanvas
        lines={selection.lines}
        pageNumber={range.page}
        language={language}
        useQcfGlyphs={false}
        highlightedWord={excerptActiveWord(selection.mapping, cue)}
        textSize={textSize}
        theme={theme}
      />
    </div>
  );
}
