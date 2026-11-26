import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { headingFromOrientation, useQiblaCompass } from "./useQiblaCompass";

function heading(value: number, accuracy?: number) {
  act(() => {
    window.dispatchEvent(
      Object.assign(new Event("deviceorientation"), {
        webkitCompassHeading: value,
        webkitCompassAccuracy: accuracy,
      }),
    );
  });
}
describe("Qibla compass lifecycle", () => {
  it("starts automatically without a permission request API and stops sensor work on unmount", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { result, unmount } = renderHook(() => useQiblaCompass(5, true));
    expect(result.current.enabled).toBe(true);
    expect(result.current.status).toBe("waiting");
    heading(100, 2);
    expect(result.current.reading?.rawHeading).toBe(105);
    unmount();
    expect(remove.mock.calls.some(([name]) => name === "deviceorientation")).toBe(true);
    expect(remove.mock.calls.some(([name]) => name === "deviceorientationabsolute")).toBe(true);
  });

  it("receives already permitted readings without calling the permission API", () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal(
      "DeviceOrientationEvent",
      class extends Event {
        static requestPermission = requestPermission;
      },
    );
    const { result } = renderHook(() => useQiblaCompass(0, true));
    expect(result.current.status).toBe("permissionRequired");
    act(() => {
      window.dispatchEvent(
        Object.assign(new Event("deviceorientationabsolute"), { alpha: null, beta: null, gamma: null, absolute: true }),
      );
    });
    expect(result.current.status).toBe("permissionRequired");
    heading(100, 2);
    expect(result.current.status).toBe("live");
    expect(result.current.reading?.heading).toBe(100);
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("requests access only on explicit action, retains denial and recovers on explicit retry", async () => {
    const requestPermission = vi.fn().mockResolvedValueOnce("denied").mockResolvedValueOnce("granted");
    vi.stubGlobal(
      "DeviceOrientationEvent",
      class extends Event {
        static requestPermission = requestPermission;
      },
    );
    const { result, rerender } = renderHook(() => useQiblaCompass(0, true));
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.status).toBe("permissionRequired");
    expect(requestPermission).not.toHaveBeenCalled();
    await act(() => result.current.requestAccess());
    expect(result.current.status).toBe("denied");
    expect(result.current.enabled).toBe(false);
    rerender();
    expect(requestPermission).toHaveBeenCalledTimes(1);
    await act(() => result.current.retry());
    heading(100, 2);
    expect(result.current.status).toBe("live");
    expect(requestPermission).toHaveBeenCalledTimes(2);
  });

  it("coalesces rapid permission actions while a request is pending", async () => {
    let resolve!: (value: "granted") => void;
    const requestPermission = vi.fn(
      () =>
        new Promise<"granted">((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal(
      "DeviceOrientationEvent",
      class extends Event {
        static requestPermission = requestPermission;
      },
    );
    const { result } = renderHook(() => useQiblaCompass(0, true));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.requestAccess();
      void result.current.requestAccess();
    });
    expect(requestPermission).toHaveBeenCalledOnce();
    await act(async () => {
      resolve("granted");
      await pending;
    });
    expect(result.current.status).toBe("waiting");
  });
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-24T12:00:00Z"));
    vi.stubGlobal("isSecureContext", true);
    vi.stubGlobal("DeviceOrientationEvent", class extends Event {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("corrects magnetic to true north exactly once, including the 360-degree seam", async () => {
    const { result } = renderHook(() => useQiblaCompass(5));
    expect(result.current.enabled).toBe(false);
    heading(359, 2);
    expect(result.current.reading).toBeNull();
    await act(() => result.current.toggle());
    heading(359, 2);
    expect(result.current.reading).toEqual({ heading: 4, rawHeading: 4, accuracy: 2 });
    heading(1, 2);
    expect(result.current.reading?.rawHeading).toBe(6);
    expect(result.current.reading?.heading).toBeCloseTo(4.5);
  });

  it("discards poor/invalid readings and keeps missing accuracy explicitly unknown", async () => {
    const { result } = renderHook(() => useQiblaCompass(0));
    await act(() => result.current.toggle());
    heading(136);
    expect(result.current.reading?.accuracy).toBeNull();
    for (const accuracy of [-1, 25]) {
      heading(136, accuracy);
      expect(result.current.status).toBe("poor");
      expect(result.current.reading).toBeNull();
      act(() => vi.advanceTimersByTime(6000));
      expect(result.current.status).toBe("poor");
    }
    heading(-1, 2);
    expect(result.current.reading).toBeNull();
  });

  it("drops a stale heading and recovers on the next real sample", async () => {
    const { result } = renderHook(() => useQiblaCompass(0));
    await act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe("unavailable");
    heading(100, 2);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe("stale");
    expect(result.current.reading).toBeNull();
    heading(200, 2);
    expect(result.current.reading?.heading).toBe(200);
    await act(() => result.current.toggle());
    heading(10, 2);
    expect(result.current.status).toBe("off");
    expect(result.current.reading).toBeNull();
  });

  it("removes hidden sensor work and waits for a fresh sample on return", async () => {
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    const { result } = renderHook(() => useQiblaCompass(0));
    await act(() => result.current.toggle());
    heading(100, 2);
    visibility.mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    heading(200, 2);
    expect(result.current.reading).toBeNull();
    expect(result.current.status).toBe("paused");
    visibility.mockReturnValue("visible");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.status).toBe("waiting");
    heading(210, 2);
    expect(result.current.reading?.heading).toBe(210);
  });

  it("never enables sensors after a permission promise resolves following unmount", async () => {
    let resolve!: (permission: string) => void;
    const requestPermission = vi.fn(
      () =>
        new Promise<string>((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal(
      "DeviceOrientationEvent",
      class extends Event {
        static requestPermission = requestPermission;
      },
    );
    const add = vi.spyOn(window, "addEventListener");
    const { result, unmount } = renderHook(() => useQiblaCompass(0));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.toggle();
    });
    unmount();
    await act(async () => {
      resolve("granted");
      await pending;
    });
    expect(add.mock.calls.filter(([name]) => name.startsWith("deviceorientation"))).toHaveLength(0);
  });

  it("keeps the fallback when the north reference is unavailable", async () => {
    const { result } = renderHook(() => useQiblaCompass(null));
    await act(() => result.current.toggle());
    expect(result.current.status).toBe("referenceUnavailable");
    expect(result.current.enabled).toBe(false);
  });

  it("uses the phone's top edge for moderate tilt and rejects vertical/relative data", () => {
    const event = { alpha: 90, beta: 10, gamma: 10, absolute: true } as DeviceOrientationEvent;
    expect(headingFromOrientation(event)).toBe(270);
    expect(headingFromOrientation({ ...event, beta: 80 })).toBeNull();
    expect(headingFromOrientation({ ...event, absolute: false })).toBeNull();
  });

  it("retries unavailable/stale sensors directly without another permission request", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal(
      "DeviceOrientationEvent",
      class extends Event {
        static requestPermission = requestPermission;
      },
    );
    const { result } = renderHook(() => useQiblaCompass(0));
    await act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe("unavailable");
    await act(() => result.current.retry());
    expect(result.current.status).toBe("waiting");
    heading(100, 2);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe("stale");
    await act(() => result.current.retry());
    heading(200, 2);
    expect(result.current.reading?.heading).toBe(200);
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it("retries denied permission only after a new explicit action", async () => {
    const requestPermission = vi.fn().mockResolvedValueOnce("denied").mockResolvedValueOnce("granted");
    vi.stubGlobal(
      "DeviceOrientationEvent",
      class extends Event {
        static requestPermission = requestPermission;
      },
    );
    const { result } = renderHook(() => useQiblaCompass(0));
    await act(() => result.current.toggle());
    heading(100, 2);
    expect(result.current.status).toBe("denied");
    expect(result.current.reading).toBeNull();
    await act(() => result.current.retry());
    expect(requestPermission).toHaveBeenCalledTimes(2);
    expect(result.current.enabled).toBe(true);
  });
});
