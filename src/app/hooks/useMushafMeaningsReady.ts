import { useEffect, useMemo, useState } from "react";
import { loadSurahWordMeanings } from "../content/quranWordMeanings";
import type { MushafVerseData } from "../content/qcfMushaf";

/** Glosses decorate a ready page; they never hold its font or paper hostage. */
export function useMushafMeaningsReady(
  page: readonly MushafVerseData[] | null,
  facing: readonly MushafVerseData[] | null | undefined,
  enabled: boolean,
) {
  const key = useMemo(
    () => [...new Set([...(page ?? []), ...(facing ?? [])].map((verse) => verse.k.split(":")[0]!))].sort().join(","),
    [page, facing],
  );
  const [ready, setReady] = useState("");
  useEffect(() => {
    if (!key) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!enabled && connection?.saveData) return;
    let active = true;
    const load = () => {
      void Promise.all(key.split(",").map((surah) => loadSurahWordMeanings(surah))).then(() => {
        if (active) setReady(key);
      });
    };
    // Current glosses start immediately when requested. Background decoration
    // waits until after the ready page has painted, and cancels when obsolete.
    const timer = enabled ? undefined : window.setTimeout(load, 150);
    if (enabled) load();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [key, enabled]);
  return enabled && Boolean(key) && ready === key;
}
