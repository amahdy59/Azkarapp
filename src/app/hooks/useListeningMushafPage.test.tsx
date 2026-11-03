import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ load: vi.fn(), font: vi.fn(), subscribe: vi.fn(), cached: vi.fn(), ready: vi.fn() }));
vi.mock("../content/qcfMushaf", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../content/qcfMushaf")>()),
  retainQcfFonts: () => undefined,
  loadMushafPage: mocks.load,
  loadQcfFont: mocks.font,
  getCachedMushafPage: mocks.cached,
  isQcfFontReady: mocks.ready,
  pageHasQcfGlyphs: () => true,
  subscribeQcfFontLoaded: mocks.subscribe,
}));
import { useListeningMushafPage } from "./useListeningMushafPage";
beforeEach(() => {
  mocks.cached.mockReturnValue(undefined);
  mocks.ready.mockReturnValue(false);
});
afterEach(() => vi.useRealTimers());

it("renders a warm Quran passage with its ready font on the very first render", () => {
  const data = [{ k: "112:1", w: [[1, 1, 0, "قُلْ", "A"]] }];
  mocks.cached.mockReturnValue(data);
  mocks.ready.mockReturnValue(true);
  mocks.load.mockResolvedValue(data);
  const frames: ReturnType<typeof useListeningMushafPage>["result"][] = [];
  const view = renderHook(() => {
    const value = useListeningMushafPage(604, 0);
    frames.push(value.result);
    return value;
  });
  expect(frames[0]).toMatchObject({ page: 604, qcf: true });
  expect(frames.every((value) => value?.qcf)).toBe(true);
  view.unmount();
});

it("starts the critical font while local page data is still pending", async () => {
  mocks.load.mockReturnValue(new Promise(() => {}));
  mocks.font.mockResolvedValue(false);
  mocks.font.mockClear();
  const view = renderHook(() => useListeningMushafPage(42, 0));
  expect(mocks.font).toHaveBeenCalledWith(42);
  await act(async () => {});
  expect(view.result.current.result).toBeNull();
  view.unmount();
});

it("switches directly to another cached page without a null or previous-page frame", () => {
  const data = [{ k: "112:1", w: [[1, 1, 0, "قُلْ", "A"]] }];
  mocks.cached.mockReturnValue(data);
  mocks.ready.mockReturnValue(true);
  mocks.load.mockResolvedValue(data);
  const frames: ReturnType<typeof useListeningMushafPage>["result"][] = [];
  const view = renderHook(
    ({ page }) => {
      const value = useListeningMushafPage(page, 0);
      frames.push(value.result);
      return value;
    },
    { initialProps: { page: 604 } },
  );
  frames.length = 0;
  view.rerender({ page: 603 });
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.every((value) => value?.page === 603 && value.qcf)).toBe(true);
  view.unmount();
});

it("waits briefly then keeps fallback stable when the font finishes late", async () => {
  vi.useFakeTimers();
  let finish!: (ready: boolean) => void;
  mocks.load.mockResolvedValue([{ k: "112:1", w: [[1, 1, 0, "قُلْ", "A"]] }]);
  mocks.font.mockReturnValue(
    new Promise<boolean>((resolve) => {
      finish = resolve;
    }),
  );
  const view = renderHook(() => useListeningMushafPage(604, 0));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1200);
  });
  expect(view.result.current.result?.qcf).toBe(false);
  mocks.ready.mockReturnValue(true);
  await act(async () => finish(true));
  expect(view.result.current.result?.qcf).toBe(false);
  view.unmount();
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
  vi.useFakeTimers();
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
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1200);
  });
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
