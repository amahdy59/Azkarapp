import { useEffect, useMemo, useState } from "react";
import type { ResolvedAudioSegment } from "../audio/audioTypes";
import { resolveListeningTiming, type ListeningTimingAnnotation } from "../audio/listeningTimings";
import { resolveQuranTiming, type QuranTimingAnnotation } from "../audio/quranTimings";
import { loadReviewedListeningTiming, loadReviewedQuranTiming } from "../audio/listeningTimingLoader";

export function useReviewedListeningTiming(segment: ResolvedAudioSegment | null, text: string, language: "ar" | "en") {
  const bundled = useMemo(() => resolveListeningTiming(segment, text, language), [segment, text, language]);
  const [loaded, setLoaded] = useState<{
    segment: ResolvedAudioSegment;
    text: string;
    language: "ar" | "en";
    value: ListeningTimingAnnotation | null;
  } | null>(null);
  useEffect(() => {
    if (!segment || bundled) return;
    const controller = new AbortController();
    void loadReviewedListeningTiming(segment, text, language, controller.signal).then((value) => {
      if (!controller.signal.aborted) setLoaded({ segment, text, language, value });
    });
    return () => controller.abort();
  }, [segment, text, language, bundled]);
  return (
    bundled ??
    (loaded?.segment === segment && loaded.text === text && loaded.language === language ? loaded.value : null)
  );
}
export function useReviewedQuranTiming(segment: ResolvedAudioSegment | null) {
  const bundled = useMemo(() => resolveQuranTiming(segment), [segment]);
  const [loaded, setLoaded] = useState<{ segment: ResolvedAudioSegment; value: QuranTimingAnnotation | null } | null>(
    null,
  );
  useEffect(() => {
    if (!segment || bundled) return;
    const controller = new AbortController();
    void loadReviewedQuranTiming(segment, controller.signal).then((value) => {
      if (!controller.signal.aborted) setLoaded({ segment, value });
    });
    return () => controller.abort();
  }, [segment, bundled]);
  return bundled ?? (loaded?.segment === segment ? loaded.value : null);
}
