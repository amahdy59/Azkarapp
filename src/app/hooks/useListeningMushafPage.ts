import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  getCachedMushafPage,
  retainQcfFonts,
  isQcfFontReady,
  loadMushafPage,
  loadQcfFont,
  pageHasQcfGlyphs,
  waitForQcfFont,
  type MushafVerseData,
} from "../content/qcfMushaf";
import type { MushafWordToken } from "../components/MushafPageViewer";

function pageResult(page: number, data: MushafVerseData[], qcf: boolean) {
  const lines: MushafWordToken[][] = Array.from({ length: 15 }, () => []);
  for (const verse of data)
    for (const [position, line, isEnd, text, qcfCode] of verse.w)
      lines[line - 1]!.push({ verseKey: verse.k, position, isEnd, text, qcfCode, pageNumber: page });
  return { page, lines, qcf };
}

export function useListeningMushafPage(page: number, retry: number, loadPageFont = true) {
  useLayoutEffect(() => (loadPageFont ? retainQcfFonts([page]) : undefined), [page, loadPageFont]);
  const cached = useMemo(() => {
    const data = getCachedMushafPage(page);
    if (!data || (loadPageFont && pageHasQcfGlyphs(data) && !isQcfFontReady(page))) return null;
    return pageResult(page, data, loadPageFont && pageHasQcfGlyphs(data));
  }, [page, loadPageFont]);
  const [result, setResult] = useState(cached);
  const [errorPage, setErrorPage] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    // A warm revisit must not paint Unicode and then replace its word boxes.
    // The return value also selects this page's cache during a page-change render.
    setResult(cached);
    setErrorPage(null);
    if (page < 1 || page > 604) return;
    void (async () => {
      try {
        // Start together; a slow JSON/cache read must not delay the critical font.
        // Contain rejection immediately even while page data is still pending.
        const font = loadPageFont ? loadQcfFont(page).catch(() => false) : Promise.resolve(false);
        const data = await loadMushafPage(page);
        const hasGlyphs = loadPageFont && pageHasQcfGlyphs(data);
        const qcf = hasGlyphs && (isQcfFontReady(page) || (await waitForQcfFont(font)));
        if (!cancelled) setResult(pageResult(page, data, qcf));
      } catch {
        if (!cancelled) setErrorPage(page);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, retry, loadPageFont, cached]);
  return { result: result?.page === page ? result : cached, error: errorPage === page };
}
