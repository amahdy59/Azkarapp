import { afterEach, describe, expect, it, vi } from "vitest";
import { scrollBehavior, shouldReduceMotion, vibrateIfEnabled } from "./motionPreferences";

/** Stub `matchMedia` so the OS-level reduced-motion answer is controllable. */
function stubPrefersReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches, media: query }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("shouldReduceMotion", () => {
  it("honours the in-app setting even when the OS does not ask for it", () => {
    stubPrefersReducedMotion(false);
    expect(shouldReduceMotion(true)).toBe(true);
  });

  it("honours the OS query even when the in-app setting is off", () => {
    stubPrefersReducedMotion(true);
    expect(shouldReduceMotion(false)).toBe(true);
  });

  it("allows motion only when neither source asks to reduce it", () => {
    stubPrefersReducedMotion(false);
    expect(shouldReduceMotion(false)).toBe(false);
  });
});

describe("vibrateIfEnabled", () => {
  it("vibrates when haptics are enabled", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    vibrateIfEnabled(true, 8);
    expect(vibrate).toHaveBeenCalledWith(8);
  });

  it("stays silent when haptics are disabled", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    vibrateIfEnabled(false, [30, 50]);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it("does not throw on platforms without the Vibration API", () => {
    vi.stubGlobal("navigator", {});
    expect(() => vibrateIfEnabled(true, 8)).not.toThrow();
  });
});

describe("scrollBehavior", () => {
  it("jumps instantly under reduced motion", () => {
    stubPrefersReducedMotion(false);
    expect(scrollBehavior(true)).toBe("auto");
  });

  it("scrolls smoothly otherwise", () => {
    stubPrefersReducedMotion(false);
    expect(scrollBehavior(false)).toBe("smooth");
  });
});
