import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useListeningWordCue } from "./useListeningWordCue";
import type { ListeningTimingAnnotation } from "../audio/listeningTimings";

afterEach(() => vi.unstubAllGlobals());
it("samples the existing audio clock and clears stale cues on seek, silence and voice change", () => {
  let tick: FrameRequestCallback = () => {};
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    tick = callback;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const timing = {
    words: [
      { startOffset: 0, endOffset: 5, startMs: 0, endMs: 200, occurrence: 0 },
      { startOffset: 6, endOffset: 8, startMs: 400, endMs: 600, occurrence: 0 },
    ],
  } as ListeningTimingAnnotation;
  let time = 0.1;
  const readTime = () => time;
  const { result, rerender } = renderHook(
    ({ annotation, playing }) => useListeningWordCue(annotation, 0, playing, readTime),
    { initialProps: { annotation: timing as ListeningTimingAnnotation | null, playing: true } },
  );
  expect(result.current).toBe(timing.words[0]);
  act(() => {
    time = 0.5;
    tick(0);
  });
  expect(result.current).toBe(timing.words[1]);
  act(() => {
    time = 0.3;
    tick(0);
  });
  expect(result.current).toBeNull();
  time = 0.1;
  rerender({ annotation: timing, playing: false });
  expect(result.current).toBe(timing.words[0]);
  rerender({ annotation: null, playing: false });
  expect(result.current).toBeNull();
});
