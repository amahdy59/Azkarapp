import { useCallback, useEffect, useState } from "react";
import type { AudioController } from "../audio/AudioProvider";
import { useReviewedQuranTiming } from "./useReviewedListeningTiming";
import { useQuranPlaybackCue } from "./useQuranPlaybackCue";

/** Follow the existing media clock without treating listening as completed reading. */
export function useMushafPlayback(
  controller: AudioController | null,
  pageNumber: number,
  onPage: (page: number) => void,
) {
  const entry = controller?.currentEntry;
  const segment = entry?.contentKind === "quran" ? (controller?.currentSegment ?? null) : null;
  const timing = useReviewedQuranTiming(segment);
  const cue = useQuranPlaybackCue(
    timing,
    controller?.state.currentTime ?? 0,
    controller?.state.status === "playing",
    controller?.state.status === "loading" ? undefined : controller?.getPlaybackTime,
  );
  const [follow, setFollow] = useState(true);
  useEffect(() => setFollow(true), [entry?.entryId, segment?.variantId]);
  const ayah = Number(cue.verseKey?.split(":")[1]);
  const playingPage = cue.verseKey?.startsWith(`${entry?.quranRange?.surah}:`)
    ? entry?.mushafPages?.find((page) => ayah >= page.startAyah && ayah <= page.endAyah)?.page
    : undefined;
  useEffect(() => {
    if (follow && playingPage && playingPage !== pageNumber) onPage(playingPage);
  }, [follow, playingPage, pageNumber, onPage]);
  const pauseFollowing = useCallback(() => setFollow(false), []);
  const toggleFollowing = useCallback(() => setFollow((value) => !value), []);
  return { cue, follow, available: Boolean(timing), pauseFollowing, toggleFollowing };
}
