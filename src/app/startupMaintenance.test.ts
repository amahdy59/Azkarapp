import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasAudioCacheMaintenance, scheduleStartupMaintenance } from "./startupMaintenance";
const mocks = vi.hoisted(() => ({ discard: vi.fn(), cleanup: vi.fn() }));
vi.mock("./content/qcfMushaf", () => ({ discardRetiredCaches: mocks.discard }));
vi.mock("./audio/audioOfflineCache", () => ({ cleanupStaleAudioDownloads: mocks.cleanup }));

describe("startup maintenance", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubGlobal("caches", { keys: vi.fn().mockResolvedValue([]) });
  });
  afterEach(() => vi.unstubAllGlobals());
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
    idle({ didTimeout: false, timeRemaining: () => 30 });
    await vi.waitFor(() => expect(mocks.cleanup).toHaveBeenCalledOnce());
  });
});
