import { afterEach, beforeEach, expect, it, vi } from "vitest";

const plugin = vi.hoisted(() => ({
  getVersionCode: vi.fn(),
  getCurrentBundle: vi.fn(),
  downloadBundle: vi.fn(),
  setNextBundle: vi.fn(),
  reload: vi.fn(),
}));
vi.mock("@capacitor/core", () => ({ registerPlugin: () => plugin }));
vi.mock("./platform", () => ({ isNativeAndroid: () => true }));
beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  plugin.getVersionCode.mockResolvedValue({ versionCode: "1" });
  plugin.getCurrentBundle.mockResolvedValue({ bundleId: "old" });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => ({ bundleId: "new", url: "https://example.com/app.zip" }) })),
  );
});
afterEach(() => vi.unstubAllGlobals());

it("downloads without selecting a bundle or reloading until the reader accepts", async () => {
  const { checkForNativeLiveUpdate, applyNativeLiveUpdate } = await import("./liveUpdate");
  expect(await checkForNativeLiveUpdate()).toBe(true);
  expect(plugin.downloadBundle).toHaveBeenCalledOnce();
  expect(plugin.setNextBundle).not.toHaveBeenCalled();
  expect(plugin.reload).not.toHaveBeenCalled();
  await applyNativeLiveUpdate();
  expect(plugin.setNextBundle).toHaveBeenCalledWith({ bundleId: "new" });
  expect(plugin.reload).toHaveBeenCalledOnce();
  expect(plugin.setNextBundle.mock.invocationCallOrder[0]).toBeLessThan(plugin.reload.mock.invocationCallOrder[0]!);
});

it("does not reload when there is no prepared bundle", async () => {
  const { applyNativeLiveUpdate } = await import("./liveUpdate");
  await expect(applyNativeLiveUpdate()).rejects.toThrow("No prepared native update");
  expect(plugin.setNextBundle).not.toHaveBeenCalled();
  expect(plugin.reload).not.toHaveBeenCalled();
});

it("keeps a failed activation retryable without reloading", async () => {
  const { checkForNativeLiveUpdate, applyNativeLiveUpdate } = await import("./liveUpdate");
  await checkForNativeLiveUpdate();
  plugin.setNextBundle.mockRejectedValueOnce(new Error("storage"));
  await expect(applyNativeLiveUpdate()).rejects.toThrow("storage");
  expect(plugin.reload).not.toHaveBeenCalled();
  await applyNativeLiveUpdate();
  expect(plugin.reload).toHaveBeenCalledOnce();
});
