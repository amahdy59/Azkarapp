import { useEffect, useState } from "react";
import {
  isQcfFontReady,
  loadMushafPage,
  loadQcfFont,
  pageHasQcfGlyphs,
  subscribeQcfFontLoaded,
} from "../content/qcfMushaf";
import type { MushafWordToken } from "../components/MushafPageViewer";

export function useListeningMushafPage(page: number, retry: number, loadPageFont = true) {
  const [result, setResult] = useState<{ page: number; lines: MushafWordToken[][]; qcf: boolean } | null>(null);
  const [errorPage, setErrorPage] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setErrorPage(null);
    if (page < 1 || page > 604) return;
    const unsubscribe = loadPageFont
      ? subscribeQcfFontLoaded((loadedPage) => {
          if (loadedPage === page && !cancelled)
            setResult((current) => (current?.page === page ? { ...current, qcf: true } : current));
        })
      : undefined;
    void (async () => {
      try {
        const data = await loadMushafPage(page);
        const hasGlyphs = loadPageFont && pageHasQcfGlyphs(data);
        const qcf = hasGlyphs && isQcfFontReady(page);
        const lines: MushafWordToken[][] = Array.from({ length: 15 }, () => []);
        for (const verse of data)
          for (const [position, line, isEnd, text, qcfCode] of verse.w)
            lines[line - 1]!.push({ verseKey: verse.k, position, isEnd, text, qcfCode, pageNumber: page });
        if (!cancelled) setResult({ page, lines, qcf });
        // Local words are usable now; font loading must never hold up reading.
        // A cancelled request cannot upgrade another page or an unmounted reader.
        if (!cancelled && hasGlyphs && !qcf) {
          const ready = await loadQcfFont(page).catch(() => false);
          if (ready && !cancelled)
            setResult((current) => (current?.page === page ? { ...current, qcf: true } : current));
        }
      } catch {
        if (!cancelled) setErrorPage(page);
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [page, retry, loadPageFont]);
  return { result: result?.page === page ? result : null, error: errorPage === page };
}
