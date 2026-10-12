import { useMemo } from "react";
import {
  MUSHAF_EXCERPTS,
  QURAN_EVIDENCE_EXCERPTS,
  selectMushafExcerpt,
  excerptWordMapping,
} from "../content/mushafExcerpts";
import { getQcfFontFamily } from "../content/qcfMushaf";
import { useListeningMushafPage } from "./useListeningMushafPage";

/** Glyphs are usable only for an explicitly identified, complete, matching passage. */
export function useQuranSnippet(text: string, canonicalKey?: string) {
  const range = canonicalKey ? (MUSHAF_EXCERPTS[canonicalKey] ?? QURAN_EVIDENCE_EXCERPTS[canonicalKey]) : undefined;
  const { result } = useListeningMushafPage(range?.page ?? 0, 0, Boolean(range));
  const { result: ending } = useListeningMushafPage(range?.endPage ?? 0, 0, Boolean(range?.endPage));
  return useMemo(() => {
    if (!range || !result?.qcf || (range.endPage && !ending?.qcf)) return null;
    const lines = selectMushafExcerpt([...result.lines, ...(range.endPage ? ending!.lines : [])], range.from, range.to);
    const mapping = excerptWordMapping(lines, text, Boolean(canonicalKey && QURAN_EVIDENCE_EXCERPTS[canonicalKey]));
    if (!mapping || lines.flat().some((word) => !word.qcfCode)) return null;
    return { lines, mapping, fontFamily: getQcfFontFamily(range.page) };
  }, [range, result, ending, text, canonicalKey]);
}
