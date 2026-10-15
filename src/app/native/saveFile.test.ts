import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveNativeFile } from "./saveFile";

const files = vi.hoisted(() => ({ create: vi.fn(), append: vi.fn(), finish: vi.fn(), cancel: vi.fn() }));
vi.mock("@capacitor/core", () => ({ registerPlugin: () => files }));

beforeEach(() => {
  vi.resetAllMocks();
  files.create.mockResolvedValue({ token: "document-1" });
  files.append.mockResolvedValue(undefined);
  files.finish.mockResolvedValue(undefined);
  files.cancel.mockResolvedValue(undefined);
});

describe("native user-selected file export", () => {
  it("transfers bounded chunks in order and finishes before reporting success", async () => {
    const bytes = new Uint8Array(100_000).fill(42);
    // Node Blob supports arrayBuffer; jsdom's File intentionally does not.
    const { File } = await import("node:buffer");
    await saveNativeFile(new File([bytes], "audio.mp3", { type: "audio/mpeg" }) as unknown as globalThis.File);
    expect(files.create).toHaveBeenCalledWith({ name: "audio.mp3", mimeType: "audio/mpeg" });
    expect(files.append).toHaveBeenCalledTimes(3);
    const recovered = files.append.mock.calls.flatMap(([{ data }]) =>
      [...atob(data)].map((char) => char.charCodeAt(0)),
    );
    expect(new Uint8Array(recovered)).toEqual(bytes);
    expect(files.append.mock.calls.every(([{ data }]) => data.length <= 65536)).toBe(true);
    expect(files.finish).toHaveBeenCalledWith({ token: "document-1" });
    expect(files.cancel).not.toHaveBeenCalled();
  });

  it("cleans up failed transfers and preserves cancellation as a user action", async () => {
    const { File } = await import("node:buffer");
    const file = new File(["audio"], "a.mp3") as unknown as globalThis.File;
    files.append.mockRejectedValueOnce(new Error("disk full"));
    await expect(saveNativeFile(file)).rejects.toThrow("disk full");
    expect(files.cancel).toHaveBeenCalledWith({ token: "document-1" });
    expect(files.finish).not.toHaveBeenCalled();
    files.create.mockRejectedValueOnce({ code: "SAVE_CANCELLED" });
    await expect(saveNativeFile(file)).rejects.toMatchObject({ name: "AbortError" });
  });
});
