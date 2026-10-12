import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasAudioCacheMaintenance, scheduleStartupMaintenance, scheduleIdleAfterPaint } from "./startupMaintenance";
const mocks = vi.hoisted(() => ({ discard: vi.fn(), cleanup: vi.fn() }));
vi.mock("./content/qcfMushaf", () => ({ discardRetiredCaches: mocks.discard }));
vi.mock("./audio/audioOfflineCache", () => ({ cleanupStaleAudioDownloads: mocks.cleanup }));

describe("startup maintenance", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubGlobal("caches", { keys: vi.fn().mockResolvedValue([]) });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  it("does not request the audio catalogue for a new reader", async () => {
    expect(await hasAudioCacheMaintenance()).toBe(false);
  });
  it("maintains saved recordings and retired audio caches", async () => {
    localStorage.setItem("azkar.audio-downloads.v1", JSON.stringify({ recording: {} }));
    expect(await hasAudioCacheMaintenance()).toBe(true);
    localStorage.clear();
    vi.mocked(caches.keys).mockResolvedValue(["azkar-audio-v1"]);
    expect(await hasAudioCacheMaintenance()).toBe(true);
  });
  it("keeps damaged download registries behind existing cleanup normalization", async () => {
    localStorage.setItem("azkar.audio-downloads.v1", "{");
    expect(await hasAudioCacheMaintenance()).toBe(true);
  });
  it("can cancel maintenance before its first frame", () => {
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", vi.fn().mockReturnValue(3));
    vi.stubGlobal("cancelAnimationFrame", cancel);
    scheduleStartupMaintenance()();
    expect(cancel).toHaveBeenCalledWith(3);
  });
  it("runs lightweight cleanup in an idle slot without loading audio for new readers", async () => {
    let frame!: FrameRequestCallback;
    let idle!: IdleRequestCallback;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback) => {
        frame = callback;
        return 3;
      }),
    );
    vi.stubGlobal(
      "requestIdleCallback",
      vi.fn((callback) => {
        idle = callback;
        return 4;
      }),
    );
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const cancel = scheduleStartupMaintenance();
    frame(0);
    expect(window.requestIdleCallback).not.toHaveBeenCalled();
    frame(16);
    expect(mocks.discard).not.toHaveBeenCalled();
    idle({ didTimeout: false, timeRemaining: () => 30 });
    await vi.waitFor(() => expect(mocks.discard).toHaveBeenCalledOnce());
    expect(mocks.cleanup).not.toHaveBeenCalled();
    cancel();
    expect(window.cancelIdleCallback).toHaveBeenCalledWith(4);
  });
  it("preserves cleanup for existing downloads", async () => {
    localStorage.setItem("azkar.audio-downloads.v1", JSON.stringify({ recording: {} }));
    let frame!: FrameRequestCallback;
    let idle!: IdleRequestCallback;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback) => {
        frame = callback;
        return 3;
      }),
    );
    vi.stubGlobal(
      "requestIdleCallback",
      vi.fn((callback) => {
        idle = callback;
        return 4;
      }),
    );
    scheduleStartupMaintenance();
    frame(0);
    frame(16);
    idle({ didTimeout: false, timeRemaining: () => 30 });
    await vi.waitFor(() => expect(mocks.cleanup).toHaveBeenCalledOnce());
  });

  it("does not run a previously queued idle callback after cancellation", () => {
    let frame!: FrameRequestCallback;
    let idle!: IdleRequestCallback;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback) => {
        frame = callback;
        return 3;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "requestIdleCallback",
      vi.fn((callback) => {
        idle = callback;
        return 4;
      }),
    );
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const work = vi.fn();
    const cancel = scheduleIdleAfterPaint(work);
    frame(0);
    frame(16);
    cancel();
    idle({ didTimeout: false, timeRemaining: () => 30 });
    expect(work).not.toHaveBeenCalled();
  });

  it("runs and cancels the timer fallback when idle callbacks are unavailable", () => {
    vi.useFakeTimers();
    let frame!: FrameRequestCallback;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback) => {
        frame = callback;
        return 3;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("requestIdleCallback", undefined);
    const work = vi.fn();
    scheduleIdleAfterPaint(work, { fallbackDelay: 200 });
    frame(0);
    frame(16);
    vi.advanceTimersByTime(200);
    expect(work).toHaveBeenCalledOnce();
    const cancel = scheduleIdleAfterPaint(work, { fallbackDelay: 200 });
    frame(0);
    frame(16);
    cancel();
    vi.advanceTimersByTime(200);
    expect(work).toHaveBeenCalledOnce();
  });
});
