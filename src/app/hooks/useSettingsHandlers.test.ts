import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAllLocalData } from "./useSettingsHandlers";

const removeDownloadedAudio = vi.hoisted(() => vi.fn(async () => undefined));
const removeDownloadedMushaf = vi.hoisted(() => vi.fn(async () => undefined));
const signOutSupabase = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("../audio/audioOfflineCache", () => ({ removeDownloadedAudio }));
vi.mock("../content/mushafOfflineCache", () => ({ removeDownloadedMushaf }));
vi.mock("../../lib/auth", () => ({ deleteCurrentAccount: vi.fn(), signOutSupabase }));
vi.mock("../../lib/supabase", () => ({ isSupabaseConfigured: true }));

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
    expect(signOutSupabase).toHaveBeenCalledOnce();
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

  it("removes the downloaded mushaf, which is the largest thing on the device", async () => {
    /* Page images and QCF fonts run to hundreds of megabytes. Clearing
       localStorage alone left all of it behind, so someone who asked the app to
       erase their data kept most of it. */
    await clearAllLocalData();

    expect(removeDownloadedMushaf).toHaveBeenCalledOnce();
  });

  it("clears the rest when one cache refuses to be removed", async () => {
    // A browser that blocks one bucket must not stop the others from going.
    removeDownloadedAudio.mockRejectedValueOnce(new Error("Cache API unavailable"));
    window.localStorage.setItem("azkarapp.state.v1", "{}");

    await expect(clearAllLocalData()).resolves.toBeUndefined();

    expect(removeDownloadedMushaf).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem("azkarapp.state.v1")).toBeNull();
  });

  it("still erases the local Supabase session when remote sign-out fails", async () => {
    signOutSupabase.mockRejectedValueOnce(new Error("offline"));
    window.localStorage.setItem("sb-project-ref-auth-token", "private-token");

    await expect(clearAllLocalData()).resolves.toBeUndefined();

    expect(window.localStorage.getItem("sb-project-ref-auth-token")).toBeNull();
  });
});
