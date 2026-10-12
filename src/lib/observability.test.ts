import { afterEach, describe, expect, it, vi } from "vitest";
import { createErrorEvent, reportError, startPerformanceMonitoring } from "./observability";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function monitoring() {
  const callbacks = new Map<string, PerformanceObserverCallback>();
  const options: PerformanceObserverInit[] = [];
  const disconnect = vi.fn();
  vi.stubGlobal(
    "PerformanceObserver",
    class {
      constructor(private callback: PerformanceObserverCallback) {}
      observe(option: PerformanceObserverInit) {
        options.push(option);
        callbacks.set(option.type!, this.callback);
      }
      disconnect = disconnect;
    },
  );
  const events: { name: string; value: number; type: string }[] = [];
  const listener = (event: Event) => events.push((event as CustomEvent).detail);
  window.addEventListener("azkar:telemetry", listener);
  const stop = startPerformanceMonitoring();
  return {
    events,
    options,
    disconnect,
    emit(
      type: string,
      entries: Partial<PerformanceEntry & { value: number; hadRecentInput: boolean; interactionId: number }>[],
    ) {
      callbacks.get(type)!({ getEntries: () => entries } as PerformanceObserverEntryList, {} as PerformanceObserver);
    },
    stop() {
      stop();
      window.removeEventListener("azkar:telemetry", listener);
    },
  };
}

describe("observability privacy", () => {
  it("never includes error messages, stacks, query strings, or hashes", () => {
    window.history.replaceState(null, "", "/reader?phone=secret#private");
    const error = new Error("sensitive zikr or account content");
    error.stack = "private stack";

    const event = createErrorEvent(error, "render");
    const serialized = JSON.stringify(event);

    expect(event).toMatchObject({ type: "error", name: "Error", source: "render", path: "/reader" });
    expect(serialized).not.toContain("sensitive");
    expect(serialized).not.toContain("private stack");
    expect(serialized).not.toContain("phone");
  });
});

describe("performance diagnostics", () => {
  it("reports the largest CLS session instead of summing unrelated shifts", () => {
    const monitor = monitoring();
    monitor.emit("layout-shift", [
      { startTime: 100, value: 0.04, hadRecentInput: false },
      { startTime: 400, value: 0.05, hadRecentInput: false },
      { startTime: 450, value: 0.9, hadRecentInput: true },
      { startTime: 2000, value: 0.06, hadRecentInput: false },
    ]);
    monitor.stop();
    expect(monitor.events.find((event) => event.name === "CLS")?.value).toBe(90);
    expect(monitor.disconnect).toHaveBeenCalledTimes(3);
  });

  it("caps a layout-shift session at five seconds even with frequent shifts", () => {
    const monitor = monitoring();
    monitor.emit(
      "layout-shift",
      Array.from({ length: 12 }, (_, index) => ({ startTime: 100 + index * 500, value: 0.01, hadRecentInput: false })),
    );
    monitor.stop();
    expect(monitor.events.find((event) => event.name === "CLS")?.value).toBe(100);
  });

  it("groups interaction events and ignores one outlier per fifty interactions", () => {
    const monitor = monitoring();
    monitor.emit("event", [
      { interactionId: 0, duration: 9999 },
      { interactionId: 7, duration: 400 },
      { interactionId: 7, duration: 600 },
      ...Array.from({ length: 49 }, (_, index) => ({
        interactionId: 14 + index * 7,
        duration: index === 0 ? 200 : 24,
      })),
    ]);
    monitor.stop();
    expect(monitor.events.find((event) => event.name === "INP")?.value).toBe(200);
    expect(monitor.options).toContainEqual({ type: "event", buffered: true, durationThreshold: 16 });
  });

  it("flushes on hiding, avoids visibility duplicates and keeps latest LCP", () => {
    const monitor = monitoring();
    monitor.emit("largest-contentful-paint", [{ startTime: 100 }, { startTime: 220 }]);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(monitor.events.filter((event) => event.name === "LCP")).toHaveLength(0);
    monitor.stop();
    expect(monitor.events.find((event) => event.name === "LCP")?.value).toBe(220);
  });

  it("still captures runtime errors when performance observers are unavailable", () => {
    vi.stubGlobal("PerformanceObserver", undefined);
    const events: unknown[] = [];
    const listener = (event: Event) => events.push((event as CustomEvent).detail);
    window.addEventListener("azkar:telemetry", listener);
    const stop = startPerformanceMonitoring();
    window.dispatchEvent(new ErrorEvent("error", { error: new TypeError("private content") }));
    expect(events).toContainEqual(
      expect.objectContaining({ type: "error", name: "TypeError", source: "window-error" }),
    );
    stop();
    expect(events).not.toContainEqual(expect.objectContaining({ type: "metric", name: "CLS" }));
    window.removeEventListener("azkar:telemetry", listener);
  });
});

describe("collector failures", () => {
  it("contains a synchronous beacon exception", () => {
    vi.stubEnv("VITE_TELEMETRY_ENDPOINT", "https://example.invalid/metrics");
    vi.stubGlobal("navigator", {
      doNotTrack: "0",
      sendBeacon: () => {
        throw new Error("blocked");
      },
    });
    expect(() => reportError(new Error("private"), "test")).not.toThrow();
  });

  it("falls back to fetch when the browser declines a beacon", () => {
    vi.stubEnv("VITE_TELEMETRY_ENDPOINT", "https://example.invalid/metrics");
    vi.stubGlobal("navigator", { doNotTrack: "0", sendBeacon: () => false });
    const fetch = vi.fn().mockResolvedValue({});
    vi.stubGlobal("fetch", fetch);
    reportError(new Error("private"), "test");
    expect(fetch).toHaveBeenCalledWith(
      "https://example.invalid/metrics",
      expect.objectContaining({ credentials: "omit", keepalive: true }),
    );
    expect(fetch.mock.calls[0]![1].body).not.toContain("private");
  });
});
