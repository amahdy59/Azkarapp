import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { loadSurahWordMeanings } from "../content/quranWordMeanings";
import { useMushafMeaningsReady } from "./useMushafMeaningsReady";

vi.mock("../content/quranWordMeanings", () => ({ loadSurahWordMeanings: vi.fn() }));
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("decorates only the current chapter when a slower previous request finishes", async () => {
  const finish = new Map<string, () => void>();
  vi.mocked(loadSurahWordMeanings).mockImplementation(
    (surah) =>
      new Promise<void>((resolve) => {
        finish.set(String(surah), resolve);
      }),
  );
  const first = [{ k: "2:255", w: [] }];
  const next = [{ k: "3:1", w: [] }];
  const { result, rerender } = renderHook(({ data }) => useMushafMeaningsReady(data, null, true), {
    initialProps: { data: first },
  });
  expect(result.current).toBe(false);
  rerender({ data: next });
  await act(async () => finish.get("2")!());
  expect(result.current).toBe(false);
  await act(async () => finish.get("3")!());
  expect(result.current).toBe(true);
});

it("defers unrequested glosses, cancels obsolete warming and respects Save-Data", async () => {
  vi.useFakeTimers();
  vi.mocked(loadSurahWordMeanings).mockResolvedValue(undefined);
  const first = [{ k: "2:255", w: [] }];
  const next = [{ k: "3:1", w: [] }];
  const { result, rerender } = renderHook(({ data }) => useMushafMeaningsReady(data, null, false), {
    initialProps: { data: first },
  });
  expect(loadSurahWordMeanings).not.toHaveBeenCalled();
  rerender({ data: next });
  await act(async () => vi.advanceTimersByTime(150));
  expect(loadSurahWordMeanings).toHaveBeenCalledExactlyOnceWith("3");
  expect(result.current).toBe(false);
  vi.mocked(loadSurahWordMeanings).mockClear();
  vi.stubGlobal("navigator", { connection: { saveData: true } });
  rerender({ data: first });
  await act(async () => vi.advanceTimersByTime(200));
  expect(loadSurahWordMeanings).not.toHaveBeenCalled();
});
