import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

const originalMatchMedia = window.matchMedia;

/**
 * Minimal matchMedia stub that records its "change" listeners so a test can
 * simulate the query flipping. jsdom does not implement matchMedia at all.
 * Mirrors the stub in useLayoutMode.test.ts.
 */
function stubMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_: string, handler: () => void) => listeners.add(handler),
    removeEventListener: (_: string, handler: () => void) => listeners.delete(handler),
  })) as unknown as typeof window.matchMedia;
  return {
    setMatches: (value: boolean) => {
      matches = value;
    },
    fireChange: () => listeners.forEach((handler) => handler()),
    listenerCount: () => listeners.size,
  };
}

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  it("reads the initial match synchronously from matchMedia", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 1366px)"));
    expect(result.current).toBe(true);
  });

  it("updates when the query reports a change", () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 1366px)"));
    expect(result.current).toBe(false);

    media.setMatches(true);
    act(() => media.fireChange());
    expect(result.current).toBe(true);
  });

  it("removes its listener on unmount", () => {
    const media = stubMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 1366px)"));
    expect(media.listenerCount()).toBeGreaterThan(0);

    unmount();
    expect(media.listenerCount()).toBe(0);
  });

  it("re-subscribes when the query string itself changes", () => {
    const media = stubMatchMedia(false);
    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: "(min-width: 1366px)" },
    });
    expect(result.current).toBe(false);

    media.setMatches(true);
    rerender({ query: "(min-width: 900px)" });
    expect(result.current).toBe(true);
  });

  it("defaults to false when matchMedia is unavailable", () => {
    // Some embedded webviews expose window without matchMedia; the hook must
    // still render rather than throwing, and must not assume a wide layout.
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useMediaQuery("(min-width: 1366px)"));
    expect(result.current).toBe(false);
  });
});
