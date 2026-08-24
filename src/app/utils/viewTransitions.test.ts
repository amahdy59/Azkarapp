import { afterEach, describe, expect, it, vi } from "vitest";
import { startSafeViewTransition } from "./viewTransitions";

const originalMatchMedia = window.matchMedia;
const originalStartViewTransition = document.startViewTransition;

function setMatchMedia(value: typeof window.matchMedia | undefined) {
  Object.defineProperty(window, "matchMedia", { configurable: true, value });
}

function setStartViewTransition(value: typeof document.startViewTransition | undefined) {
  Object.defineProperty(document, "startViewTransition", { configurable: true, value });
}

afterEach(() => {
  setMatchMedia(originalMatchMedia);
  setStartViewTransition(originalStartViewTransition);
  vi.restoreAllMocks();
});

describe("startSafeViewTransition", () => {
  it("runs the update directly when reduced motion is requested", () => {
    const callback = vi.fn();
    const startViewTransition = vi.fn();
    setStartViewTransition(startViewTransition as typeof document.startViewTransition);
    setMatchMedia(vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia);

    startSafeViewTransition(callback);

    expect(callback).toHaveBeenCalledOnce();
    expect(startViewTransition).not.toHaveBeenCalled();
  });

  it("still uses the API when an embedded browser has no matchMedia", () => {
    const callback = vi.fn();
    const catchReady = vi.fn().mockResolvedValue(undefined);
    const startViewTransition = vi.fn((update: () => void) => {
      update();
      return { ready: { catch: catchReady } };
    });
    setMatchMedia(undefined);
    setStartViewTransition(startViewTransition as unknown as typeof document.startViewTransition);

    expect(() => startSafeViewTransition(callback)).not.toThrow();
    expect(callback).toHaveBeenCalledOnce();
    expect(catchReady).toHaveBeenCalledOnce();
  });

  it("contains a rejected ready promise when the browser skips the animation", async () => {
    const callback = vi.fn();
    const transitionError = new DOMException("Transition was aborted", "AbortError");
    const ready = Promise.reject(transitionError);
    const startViewTransition = vi.fn((update: () => void) => {
      update();
      return { ready };
    });
    setMatchMedia(vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia);
    setStartViewTransition(startViewTransition as unknown as typeof document.startViewTransition);

    startSafeViewTransition(callback);

    await expect(ready).rejects.toBe(transitionError);
    expect(callback).toHaveBeenCalledOnce();
  });
});
