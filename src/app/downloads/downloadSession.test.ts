import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import {
  cancelDownloadSession,
  getDownloadSession,
  runDownloadSession,
  updateDownloadSession,
  useDownloadSession,
} from "./downloadSession";

it("keeps progress across unmounts, rejects overlapping starts and reports completion to the returning screen", async () => {
  let finish!: () => void;
  let duplicate = false;
  const first = renderHook(useDownloadSession);
  let pending!: ReturnType<typeof runDownloadSession>;
  act(() => {
    pending = runDownloadSession(
      { id: "adhkar", completed: 0, total: 20 },
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  });
  first.unmount();
  updateDownloadSession({ id: "adhkar", completed: 12, total: 20 });
  await runDownloadSession({ id: "other", completed: 0, total: 1 }, async () => {
    duplicate = true;
  });
  expect(duplicate).toBe(false);
  const returning = renderHook(useDownloadSession);
  expect(returning.result.current.job?.completed).toBe(12);
  await act(async () => {
    finish();
    await pending;
  });
  expect(returning.result.current.result?.status).toBe("complete");
  expect(returning.result.current.job).toBeNull();
  returning.unmount();
});
it.each(["cancel", "clear"])("drains %s without publishing successful completion", async (mode) => {
  const work = runDownloadSession(
    { id: "mushaf", completed: 0, total: 604 },
    (controller) =>
      new Promise((_resolve, reject) =>
        controller.signal.addEventListener("abort", () => reject(new Error("cancelled")), { once: true }),
      ),
  );
  if (mode === "clear") window.dispatchEvent(new Event("azkar-private-data-cleared"));
  else cancelDownloadSession();
  expect((await work)?.status).toBe("cancelled");
  expect(getDownloadSession().job).toBeNull();
});

it("coalesces progress, pauses hidden notifications and reconciles the exact snapshot on return", async () => {
  vi.useFakeTimers();
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  const hook = renderHook(useDownloadSession);
  let finish!: () => void;
  let pending!: ReturnType<typeof runDownloadSession>;
  try {
    act(() => {
      pending = runDownloadSession(
        { id: "bytes", completed: 0, total: 100 },
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
    });
    act(() => {
      for (let n = 1; n <= 50; n++) updateDownloadSession({ id: "bytes", completed: n, total: 100 });
    });
    expect(hook.result.current.job?.completed).toBe(0);
    expect(getDownloadSession().job?.completed).toBe(50);
    act(() => vi.advanceTimersByTime(80));
    expect(hook.result.current.job?.completed).toBe(50);
    act(() => {
      visibility.mockReturnValue("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
      updateDownloadSession({ id: "bytes", completed: 90, total: 100 });
      vi.advanceTimersByTime(200);
    });
    expect(hook.result.current.job?.completed).toBe(50);
    act(() => {
      visibility.mockReturnValue("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(hook.result.current.job?.completed).toBe(90);
  } finally {
    await act(async () => {
      finish();
      await pending;
    });
    hook.unmount();
    visibility.mockRestore();
    vi.useRealTimers();
  }
});
