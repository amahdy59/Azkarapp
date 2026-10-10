import { useEffect, useState } from "react";
import { getQuranPlaybackCue, type QuranTimingAnnotation } from "../audio/quranTimings";

/** Read the existing media clock; only changed verse/word cues trigger a render. */
export function useQuranPlaybackCue(
  timing: QuranTimingAnnotation | null,
  currentTime: number,
  playing: boolean,
  readTime?: () => number,
) {
  const [live, setLive] = useState<{
    timing: QuranTimingAnnotation;
    cue: ReturnType<typeof getQuranPlaybackCue>;
  } | null>(null);
  useEffect(() => {
    if (!timing || !playing || !readTime) return;
    let frame = 0;
    const sample = () => {
      const cue = getQuranPlaybackCue(timing, readTime());
      setLive((previous) =>
        previous?.timing === timing &&
        previous.cue.verseKey === cue.verseKey &&
        previous.cue.word?.position === cue.word?.position
          ? previous
          : { timing, cue },
      );
      if (document.visibilityState !== "hidden") frame = requestAnimationFrame(sample);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      sample();
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("focus", visibility);
    window.addEventListener("pageshow", visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("focus", visibility);
      window.removeEventListener("pageshow", visibility);
    };
  }, [timing, playing, readTime, currentTime]);
  // Reconcile seeks and pause immediately, even between native timeupdate events.
  const cue = getQuranPlaybackCue(timing, readTime ? readTime() : currentTime);
  return live?.timing === timing && live.cue.verseKey === cue.verseKey && live.cue.word?.position === cue.word?.position
    ? live.cue
    : cue;
}
