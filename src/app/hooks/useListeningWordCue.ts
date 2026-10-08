import { useEffect, useState } from "react";
import { getListeningWordCue, type ListeningTimingAnnotation } from "../audio/listeningTimings";

export function useListeningWordCue(
  timing: ListeningTimingAnnotation | null,
  currentTime: number,
  playing: boolean,
  readTime?: () => number,
) {
  const [live, setLive] = useState<ReturnType<typeof getListeningWordCue>>(null);
  useEffect(() => {
    if (!timing || !playing || !readTime) return;
    let frame = 0;
    const sample = () => {
      if (document.visibilityState === "hidden") return;
      const cue = getListeningWordCue(timing, readTime());
      setLive((previous) => (previous === cue ? previous : cue));
      frame = requestAnimationFrame(sample);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState !== "hidden") sample();
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [timing, playing, readTime, currentTime]);
  const cue = getListeningWordCue(timing, readTime ? readTime() : currentTime);
  return live === cue ? live : cue;
}
