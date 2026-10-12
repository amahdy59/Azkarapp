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

it("publishes local words immediately and upgrades only when the matching font finishes", async () => {
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
    await Promise.resolve();
  });
  expect(view.result.current.result?.qcf).toBe(false);
  act(() => listener(603));
  expect(view.result.current.result?.qcf).toBe(false);
  act(() => listener(604));
  expect(view.result.current.result?.qcf).toBe(true);
  view.unmount();
  expect(unsubscribe).toHaveBeenCalledOnce();
});

it("contains font rejection while retaining complete readable words", async () => {
  mocks.load.mockResolvedValue([{ k: "112:1", w: [[1, 1, 0, "قُلْ", "A"]] }]);
  mocks.font.mockRejectedValue(new Error("font unavailable"));
  const view = renderHook(() => useListeningMushafPage(604, 0));
  await act(async () => {});
  expect(view.result.current.result?.lines.flat().map((word) => word.text)).toEqual(["قُلْ"]);
  expect(view.result.current.result?.qcf).toBe(false);
  expect(view.result.current.error).toBe(false);
  view.unmount();
});

it("ignores a late font completion after navigating to another page", async () => {
  let finish!: (ready: boolean) => void;
  mocks.load.mockResolvedValue([{ k: "112:1", w: [[1, 1, 0, "قُلْ", "A"]] }]);
  mocks.font.mockImplementation((page: number) =>
    page === 604
      ? new Promise<boolean>((resolve) => {
          finish = resolve;
        })
      : Promise.resolve(false),
  );
  const view = renderHook(({ page }) => useListeningMushafPage(page, 0), { initialProps: { page: 604 } });
  await act(async () => {});
  view.rerender({ page: 603 });
  await act(async () => {});
  await act(async () => finish(true));
  expect(view.result.current.result?.page).toBe(603);
  expect(view.result.current.result?.qcf).toBe(false);
  view.unmount();
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
