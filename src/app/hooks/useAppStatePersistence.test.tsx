import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE, saveAppState } from "../state";
import { useAppStatePersistence } from "./useAppStatePersistence";

vi.mock("../state", async (original) => ({
  ...(await original<typeof import("../state")>()),
  saveAppState: vi.fn(() => true),
}));

describe("debounced application persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(saveAppState).mockReset().mockReturnValue(true);
  });
  afterEach(() => vi.useRealTimers());

  it("coalesces rapid updates into the latest normalized-boundary snapshot", () => {
    const result = vi.fn();
    const { rerender } = renderHook(({ snapshot }) => useAppStatePersistence(snapshot, result), {
      initialProps: { snapshot: DEFAULT_APP_STATE },
    });
    act(() => vi.advanceTimersByTime(200));
    const latest = { ...DEFAULT_APP_STATE, khatmahPage: 12 };
    rerender({ snapshot: latest });
    act(() => vi.advanceTimersByTime(399));
    expect(saveAppState).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(saveAppState).toHaveBeenCalledExactlyOnceWith(latest);
    expect(result).toHaveBeenCalledWith(true);
  });

  it("flushes the latest pending progress on pagehide before the debounce expires", () => {
    const { rerender } = renderHook(({ snapshot }) => useAppStatePersistence(snapshot, vi.fn()), {
      initialProps: { snapshot: DEFAULT_APP_STATE },
    });
    const latest = { ...DEFAULT_APP_STATE, khatmahPage: 15 };
    rerender({ snapshot: latest });
    act(() => window.dispatchEvent(new Event("pagehide")));
    act(() => vi.advanceTimersByTime(400));
    expect(saveAppState).toHaveBeenCalledExactlyOnceWith(latest);
  });

  it("flushes hidden pages and reports storage failure", () => {
    const result = vi.fn();
    vi.mocked(saveAppState).mockReturnValue(false);
    renderHook(() => useAppStatePersistence(DEFAULT_APP_STATE, result));
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(saveAppState).toHaveBeenCalledWith(DEFAULT_APP_STATE);
    expect(result).toHaveBeenCalledWith(false);
    visibility.mockRestore();
  });

  it("flushes on unmount and removes lifecycle handlers and timers", () => {
    const { unmount } = renderHook(() => useAppStatePersistence(DEFAULT_APP_STATE, vi.fn()));
    unmount();
    window.dispatchEvent(new Event("pagehide"));
    act(() => vi.advanceTimersByTime(400));
    expect(saveAppState).toHaveBeenCalledExactlyOnceWith(DEFAULT_APP_STATE);
  });
});
