import { useMemo, type ReactNode } from "react";
import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { excerptActiveWord, excerptWordMapping, MUSHAF_EXCERPTS, selectMushafExcerpt } from "../content/mushafExcerpts";
import type { ListeningWordTiming } from "../audio/listeningTimings";
import type { AppLanguage } from "../types";
import { MushafExcerptCanvas } from "./MushafPageViewer";

export default function MushafExcerpt({
  canonicalKey,
  transcript,
  language,
  cue,
  fallback,
}: {
  canonicalKey: string;
  transcript: string;
  language: AppLanguage;
  cue: ListeningWordTiming | null;
  fallback: ReactNode;
}) {
  const range = MUSHAF_EXCERPTS[canonicalKey]!;
  const { result } = useListeningMushafPage(range.page, 0);
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
        useQcfGlyphs={result.qcf}
        highlightedWord={excerptActiveWord(selection.mapping, cue)}
      />
    </div>
  );
}
