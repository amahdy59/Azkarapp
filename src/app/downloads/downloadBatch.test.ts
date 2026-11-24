import { expect, it, vi } from "vitest";
import { DownloadBatchError, runDownloadBatch } from "./downloadBatch";

it("runs one group at a time and attempts later groups after an earlier failure", async () => {
  let release!: () => void;
  const first = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const error = new Error("failed audio");
  const second = vi.fn(async () => {
    throw error;
  });
  const last = vi.fn(async () => {});
  const stages = vi.fn();
  const pending = runDownloadBatch(
    [
      { id: "adhkar", run: first },
      { id: "recitations", run: second },
      { id: "mushaf", run: last },
    ],
    new AbortController().signal,
    stages,
  );
  expect(first).toHaveBeenCalledOnce();
  expect(second).not.toHaveBeenCalled();
  expect(last).not.toHaveBeenCalled();
  const result = expect(pending).rejects.toEqual(new DownloadBatchError([{ id: "recitations", error }]));
  release();
  await result;
  expect(last).toHaveBeenCalledOnce();
  expect(stages.mock.calls).toEqual([
    ["adhkar", 0, 3],
    ["recitations", 1, 3],
    ["mushaf", 2, 3],
  ]);
});

it("drains the active group before cancellation settles and never starts the next group", async () => {
  const controller = new AbortController();
  let release!: () => void;
  const next = vi.fn();
  const pending = runDownloadBatch(
    [
      {
        id: "adhkar",
        run: () =>
          new Promise<void>((resolve) => {
            release = resolve;
          }),
      },
      { id: "mushaf", run: next },
    ],
    controller.signal,
    vi.fn(),
  );
  controller.abort();
  let settled = false;
  void pending.catch(() => {
    settled = true;
  });
  await Promise.resolve();
  expect(settled).toBe(false);
  release();
  await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  expect(next).not.toHaveBeenCalled();
});
