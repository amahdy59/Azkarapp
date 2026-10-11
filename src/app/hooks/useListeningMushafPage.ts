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
    let timer: ReturnType<typeof setTimeout> | undefined;
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
        const qcf =
          loadPageFont &&
          pageHasQcfGlyphs(data) &&
          (isQcfFontReady(page) ||
            (await Promise.race([
              loadQcfFont(page),
              new Promise<boolean>((resolve) => {
                timer = setTimeout(() => resolve(false), 1800);
              }),
            ])));
        const lines: MushafWordToken[][] = Array.from({ length: 15 }, () => []);
        for (const verse of data)
          for (const [position, line, isEnd, text, qcfCode] of verse.w)
            lines[line - 1]!.push({ verseKey: verse.k, position, isEnd, text, qcfCode });
        if (!cancelled) setResult({ page, lines, qcf });
      } catch {
        if (!cancelled) setErrorPage(page);
      } finally {
        if (timer) clearTimeout(timer);
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
      if (timer) clearTimeout(timer);
    };
  }, [page, retry, loadPageFont]);
  return { result: result?.page === page ? result : null, error: errorPage === page };
}
