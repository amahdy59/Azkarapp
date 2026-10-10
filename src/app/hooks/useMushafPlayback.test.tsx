import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AudioController } from "../audio/AudioProvider";
import type { QuranTimingAnnotation } from "../audio/quranTimings";
import { useMushafPlayback } from "./useMushafPlayback";

vi.mock("./useReviewedListeningTiming", () => ({
  useReviewedQuranTiming: (segment: { variantId: string } | null) =>
    segment?.variantId === "matching"
      ? ({
          verses: [
            { verseKey: "2:6", startMs: 0, endMs: 1000 },
            { verseKey: "2:7", startMs: 2000, endMs: 3000 },
          ],
        } as QuranTimingAnnotation)
      : null,
}));

function controller(seconds: number, variantId = "matching") {
  return {
    currentEntry: {
      entryId: "baqarah",
      contentKind: "quran",
      quranRange: { surah: 2 },
      mushafPages: [
        { page: 3, startAyah: 6, endAyah: 6 },
        { page: 4, startAyah: 7, endAyah: 7 },
      ],
    },
    currentSegment: { variantId },
    state: { currentTime: seconds, status: "paused" },
    getPlaybackTime: () => seconds,
  } as AudioController;
}

describe("Mushaf playback following", () => {
  it("follows exact verse pages, yields to manual browsing and resumes at the current media time", () => {
    const onPage = vi.fn();
    const { result, rerender } = renderHook(({ audio, page }) => useMushafPlayback(audio, page, onPage), {
      initialProps: { audio: controller(0.2), page: 2 },
    });
    expect(result.current.cue.verseKey).toBe("2:6");
    expect(onPage).toHaveBeenLastCalledWith(3);
    act(result.current.pauseFollowing);
    onPage.mockClear();
    rerender({ audio: controller(2.2), page: 10 });
    expect(result.current.cue.verseKey).toBe("2:7");
    expect(onPage).not.toHaveBeenCalled();
    act(result.current.toggleFollowing);
    expect(onPage).toHaveBeenLastCalledWith(4);
    onPage.mockClear();
    rerender({ audio: controller(1.5), page: 4 });
    expect(result.current.cue.verseKey).toBeNull();
    expect(onPage).not.toHaveBeenCalled();
  });

  it("does not change pages or highlight mismatched recordings and clears the old cue", () => {
    const onPage = vi.fn();
    const { result, rerender } = renderHook(({ audio }) => useMushafPlayback(audio, 3, onPage), {
      initialProps: { audio: controller(0.2) },
    });
    expect(result.current.available).toBe(true);
    rerender({ audio: controller(2.2, "different-recording") });
    expect(result.current.available).toBe(false);
    expect(result.current.cue.verseKey).toBeNull();
    expect(onPage).not.toHaveBeenCalled();
  });
});
