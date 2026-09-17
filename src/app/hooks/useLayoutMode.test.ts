import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLayoutMode } from "./useLayoutMode";

const originalWidth = window.innerWidth;
const originalMatchMedia = window.matchMedia;

/**
 * Minimal matchMedia stub that records its "change" listeners so a test can
 * simulate a viewport resize. jsdom does not implement matchMedia at all.
 */
function stubMatchMedia() {
  const listeners = new Set<() => void>();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: (_: string, handler: () => void) => listeners.add(handler),
    removeEventListener: (_: string, handler: () => void) => listeners.delete(handler),
  })) as unknown as typeof window.matchMedia;
  return {
    fireChange: () => listeners.forEach((handler) => handler()),
    listenerCount: () => listeners.size,
  };
}

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true, writable: true });
}

afterEach(() => {
  setWidth(originalWidth);
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe("useLayoutMode", () => {
  // The tiers are half-open intervals, so the value *at* each boundary is the
  // part that is easy to get wrong. App.tsx picks the navigation component from
  // this result while theme.css picks the grid from its own media queries — the
  // two must agree, or a viewport ends up with no navigation at all (DEC-027).
  it.each([
    [320, "compact"],
    [599, "compact"],
    [600, "medium"],
    [899, "medium"],
    [900, "expanded"],
    [1199, "expanded"],
    [1200, "large"],
    [1920, "large"],
  ])("reports %ipx as the %s tier", (width, expected) => {
    setWidth(width);
    stubMatchMedia();
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe(expected);
  });

  it("is width-only, so viewport height never changes the tier", () => {
    setWidth(960);
    stubMatchMedia();
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe("expanded");

    // A short landscape viewport stays "expanded". theme.css used to carry an
    // extra min-height guard the hook knew nothing about, which left 900px+ /
    // short viewports with the bottom nav dropped and the rail hidden.
    Object.defineProperty(window, "innerHeight", { value: 420, configurable: true, writable: true });
    expect(result.current).toBe("expanded");
  });

  it("updates when a media query reports a change", () => {
    setWidth(400);
    const media = stubMatchMedia();
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe("compact");

    setWidth(1280);
    act(() => media.fireChange());
    expect(result.current).toBe("large");
  });

  it("removes its listeners on unmount", () => {
    setWidth(800);
    const media = stubMatchMedia();
    const { unmount } = renderHook(() => useLayoutMode());
    expect(media.listenerCount()).toBeGreaterThan(0);

    unmount();
    expect(media.listenerCount()).toBe(0);
  });

  it("falls back to compact when matchMedia is unavailable", () => {
    setWidth(1280);
    // Some embedded webviews expose window without matchMedia; the hook must
    // still render rather than throwing during the subscribe effect.
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe("large");
  });
});
