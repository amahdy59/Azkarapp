import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ load: vi.fn(), font: vi.fn(), subscribe: vi.fn() }));
vi.mock("../content/qcfMushaf", () => ({
  loadMushafPage: mocks.load,
  loadQcfFont: mocks.font,
  isQcfFontReady: () => false,
  pageHasQcfGlyphs: () => true,
  subscribeQcfFontLoaded: mocks.subscribe,
}));
import { useListeningMushafPage } from "./useListeningMushafPage";
afterEach(() => vi.useRealTimers());

it("upgrades readable fallback when a matching font finishes after the bounded wait", async () => {
  vi.useFakeTimers();
  let listener: (page: number) => void = () => {};
  const unsubscribe = vi.fn();
  mocks.subscribe.mockImplementation((callback) => {
    listener = callback;
    return unsubscribe;
  });
  mocks.load.mockResolvedValue([{ k: "112:1", w: [[1, 1, 0, "قُلْ", "A"]] }]);
  mocks.font.mockReturnValue(new Promise(() => {}));
  const view = renderHook(() => useListeningMushafPage(604, 0));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1801);
  });
  expect(view.result.current.result?.qcf).toBe(false);
  act(() => listener(603));
  expect(view.result.current.result?.qcf).toBe(false);
  act(() => listener(604));
  expect(view.result.current.result?.qcf).toBe(true);
  view.unmount();
  expect(unsubscribe).toHaveBeenCalledOnce();
});

it("does not request page data or fonts for an unidentified quotation", () => {
  mocks.load.mockClear();
  mocks.font.mockClear();
  mocks.subscribe.mockClear();
  const view = renderHook(() => useListeningMushafPage(0, 0, false));
  expect(view.result.current.result).toBeNull();
  expect(mocks.load).not.toHaveBeenCalled();
  expect(mocks.font).not.toHaveBeenCalled();
  expect(mocks.subscribe).not.toHaveBeenCalled();
});
