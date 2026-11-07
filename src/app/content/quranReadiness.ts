import { MUSHAF_EXCERPTS, QURAN_EVIDENCE_EXCERPTS } from "./mushafExcerpts";
import { prefetchMushafPage } from "./qcfMushaf";
import type { Zikr } from "../types";

/** Warm at most one spread's resources from current navigation intent. */
export function warmQuranPassages(entries: readonly Pick<Zikr, "canonicalKey" | "mushafPages">[]) {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (document.hidden || connection?.saveData || connection?.effectiveType?.includes("2g")) return;
  const pages = new Set<number>();
  for (const entry of entries) {
    const range = entry.canonicalKey
      ? (MUSHAF_EXCERPTS[entry.canonicalKey] ?? QURAN_EVIDENCE_EXCERPTS[entry.canonicalKey])
      : undefined;
    const candidates = range
      ? [range.page, ...(range.endPage ? [range.endPage] : [])]
      : (entry.mushafPages?.map((page) => page.page) ?? []);
    for (const page of candidates) {
      if (pages.size >= 2) break;
      pages.add(page);
    }
    if (pages.size >= 2) break;
  }
  for (const page of pages) prefetchMushafPage(page);
}
