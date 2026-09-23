import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import * as sync from "../../lib/cloudflareSync";
import { useCloudflareDeviceSync } from "./useCloudflareDeviceSync";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("device sync lifecycle", () => {
  it("re-reads a conflicting revision before retrying", async () => {
    vi.useFakeTimers();
    vi.spyOn(sync, "hasCloudflareDevice").mockReturnValue(true);
    const load = vi
      .spyOn(sync, "loadCloudflareSnapshot")
      .mockResolvedValueOnce({ snapshot: null, revision: 1 })
      .mockResolvedValue({ snapshot: null, revision: 2 });
    const save = vi
      .spyOn(sync, "saveCloudflareSnapshot")
      .mockRejectedValueOnce(new Error("cloudflare_sync_409"))
      .mockResolvedValue({ ok: true, revision: 3, updatedAt: 1 });
    const callback = vi.fn();
    renderHook(() => useCloudflareDeviceSync(DEFAULT_APP_STATE, callback));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(load).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(DEFAULT_APP_STATE, 2);
  });

  it("ignores a hydration response after the hook unmounts", async () => {
    vi.spyOn(sync, "hasCloudflareDevice").mockReturnValue(true);
    let finish!: (value: { snapshot: typeof DEFAULT_APP_STATE; revision: number }) => void;
    vi.spyOn(sync, "loadCloudflareSnapshot").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const save = vi.spyOn(sync, "saveCloudflareSnapshot");
    const callback = vi.fn();
    const hook = renderHook(() => useCloudflareDeviceSync(DEFAULT_APP_STATE, callback));
    hook.unmount();
    await act(async () => {
      finish({ snapshot: DEFAULT_APP_STATE, revision: 2 });
    });
    expect(callback).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
  it("serializes uploads and uses the revision returned by the prior write", async () => {
    vi.useFakeTimers();
    vi.spyOn(sync, "hasCloudflareDevice").mockReturnValue(true);
    vi.spyOn(sync, "loadCloudflareSnapshot").mockResolvedValue({ snapshot: null, revision: 0 });
    let finish!: (value: { ok: boolean; revision: number; updatedAt: number }) => void;
    const save = vi
      .spyOn(sync, "saveCloudflareSnapshot")
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue({ ok: true, revision: 2, updatedAt: 1 });
    const callback = vi.fn();
    const hook = renderHook(({ state }) => useCloudflareDeviceSync(state, callback), {
      initialProps: { state: DEFAULT_APP_STATE },
    });
    await act(async () => {});
    hook.rerender({ state: { ...DEFAULT_APP_STATE, savedZikrIds: ["m-hm-91"] } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish({ ok: true, revision: 1, updatedAt: 1 });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });
    expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ savedZikrIds: ["m-hm-91"] }), 1);
  });

  it("rehydrates on reconnect after bounded failures", async () => {
    vi.useFakeTimers();
    vi.spyOn(sync, "hasCloudflareDevice").mockReturnValue(true);
    const load = vi.spyOn(sync, "loadCloudflareSnapshot").mockRejectedValue(new Error("offline"));
    const save = vi.spyOn(sync, "saveCloudflareSnapshot").mockResolvedValue({ ok: true, revision: 1, updatedAt: 1 });
    const callback = vi.fn();
    renderHook(() => useCloudflareDeviceSync(DEFAULT_APP_STATE, callback));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(load).toHaveBeenCalledTimes(3);
    load.mockResolvedValue({ snapshot: null, revision: 0 });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    expect(save).toHaveBeenCalledWith(DEFAULT_APP_STATE, 0);
  });
});
