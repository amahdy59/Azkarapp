import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useQuranPlaybackCue } from "./useQuranPlaybackCue";
import type { QuranTimingAnnotation } from "../audio/quranTimings";

const timing = {
  verses: [
    {
      verseKey: "67:1",
      startMs: 0,
      endMs: 2000,
      words: [
        { position: 1, startMs: 0, endMs: 1000 },
        { position: 2, startMs: 1000, endMs: 2000 },
      ],
    },
  ],
} as QuranTimingAnnotation;
describe("bounded listening media clock", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("updates only changed cues, suspends hidden sampling and reconciles pause and seeks", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let id = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.set(++id, callback);
      return id;
    });
    vi.stubGlobal("cancelAnimationFrame", (key: number) => frames.delete(key));
    let seconds = 0.2;
    const readTime = () => seconds;
    const { result, rerender, unmount } = renderHook(
      ({ currentTime, playing }) => useQuranPlaybackCue(timing, currentTime, playing, readTime),
      { initialProps: { currentTime: 0.2, playing: true } },
    );
    expect(result.current.word?.position).toBe(1);
    const sample = () => {
      const [key, callback] = [...frames][0]!;
      frames.delete(key);
      callback(0);
    };
    const initialCue = result.current;
    act(sample);
    expect(result.current).toBe(initialCue);
    seconds = 1.3;
    act(sample);
    expect(result.current.word?.position).toBe(2);
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(frames.size).toBe(0);
    visibility.mockReturnValue("visible");
    seconds = 3;
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.verseKey).toBeNull();
    rerender({ currentTime: 1.3, playing: false });
    expect(result.current.verseKey).toBeNull(); // The native clock is already at 3s.
    seconds = 0.3;
    rerender({ currentTime: 0.3, playing: false });
    expect(result.current.word?.position).toBe(1);
    expect(frames.size).toBe(0);
    unmount();
    visibility.mockRestore();
  });
});
