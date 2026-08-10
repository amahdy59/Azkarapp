import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAllLocalData } from "./useSettingsHandlers";

const removeDownloadedAudio = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("../audio/audioOfflineCache", () => ({ removeDownloadedAudio }));

describe("clearAllLocalData", () => {
  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("removes downloaded audio before clearing storage", async () => {
    const order: string[] = [];
    removeDownloadedAudio.mockImplementationOnce(async () => {
      // The registry is the only index of the Cache API bucket, so the cached
      // bytes have to go before the keys that point at them.
      order.push("audio");
      return undefined;
    });
    window.localStorage.setItem("azkarapp.state.v1", "{}");
    window.localStorage.setItem("azkarapp_recent_searches_ar", "[]");

    await clearAllLocalData();
    order.push("storage");

    expect(removeDownloadedAudio).toHaveBeenCalledOnce();
    expect(order).toEqual(["audio", "storage"]);
    expect(window.localStorage.getItem("azkarapp.state.v1")).toBeNull();
    expect(window.localStorage.getItem("azkarapp_recent_searches_ar")).toBeNull();
  });

  it("still clears local storage when offline audio removal fails", async () => {
    removeDownloadedAudio.mockRejectedValueOnce(new Error("Cache API unavailable"));
    window.localStorage.setItem("azkarapp.state.v1", "{}");
    window.localStorage.setItem("unrelated.product.key", "keep");

    // A browser without the Cache API, or one that blocks it, must not leave
    // the user unable to erase anything at all.
    await expect(clearAllLocalData()).resolves.toBeUndefined();

    expect(window.localStorage.getItem("azkarapp.state.v1")).toBeNull();
    expect(window.localStorage.getItem("unrelated.product.key")).toBe("keep");
  });
});
