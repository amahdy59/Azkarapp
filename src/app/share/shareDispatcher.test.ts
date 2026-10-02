import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canCopyImage,
  canShareMultipleFiles,
  copyImageToClipboard,
  shareMultipleFiles,
  shareSingleFile,
} from "./shareDispatcher";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("shareDispatcher", () => {
  const dummyFile1 = new File(["dummy1"], "card-1.png", { type: "image/png" });
  const dummyFile2 = new File(["dummy2"], "card-2.png", { type: "image/png" });

  it("returns false for canShareMultipleFiles when navigator.canShare is missing", () => {
    vi.stubGlobal("navigator", {});
    expect(canShareMultipleFiles([dummyFile1])).toBe(false);
  });

  it("delegates to navigator.canShare when available", () => {
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", {
      share: vi.fn(),
      canShare,
    });

    expect(canShareMultipleFiles([dummyFile1, dummyFile2])).toBe(true);
    expect(canShare).toHaveBeenCalledWith({ files: [dummyFile1, dummyFile2] });
  });

  it("shares files using navigator.share when supported", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", {
      share,
      canShare,
    });

    const statusUpdates: string[] = [];
    const result = await shareMultipleFiles([dummyFile1, dummyFile2], {
      title: "أذكار الصباح",
      onStatus: (s) => statusUpdates.push(s),
    });

    expect(result.method).toBe("shared");
    expect(result.fileCount).toBe(2);
    expect(share).toHaveBeenCalledWith({
      files: [dummyFile1, dummyFile2],
      title: "أذكار الصباح",
      text: undefined,
    });
    expect(statusUpdates).toEqual(["sharing", "shared"]);
  });

  it("handles user cancellation (AbortError) without falling back to download", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("Share cancelled", "AbortError"));
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", {
      share,
      canShare,
    });

    const statusUpdates: string[] = [];
    const result = await shareMultipleFiles([dummyFile1], {
      onStatus: (s) => statusUpdates.push(s),
    });

    expect(result.method).toBe("cancelled");
    expect(statusUpdates).toEqual(["sharing", "cancelled"]);
  });

  it("falls back to sequential download when sharing is unavailable", async () => {
    vi.stubGlobal("navigator", {});

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const statusUpdates: string[] = [];
    const result = await shareMultipleFiles([dummyFile1, dummyFile2], {
      onStatus: (s) => statusUpdates.push(s),
    });

    expect(result.method).toBe("downloaded");
    expect(result.fileCount).toBe(2);
    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(statusUpdates).toEqual(["downloading", "downloaded"]);
  });

  it("shares a single file via shareSingleFile", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", {
      share,
      canShare,
    });

    const statusUpdates: string[] = [];
    const result = await shareSingleFile(dummyFile1, {
      title: "بطاقة ذكر",
      onStatus: (s) => statusUpdates.push(s),
    });

    expect(result.method).toBe("shared");
    expect(result.fileCount).toBe(1);
    expect(share).toHaveBeenCalledWith({
      files: [dummyFile1],
      title: "بطاقة ذكر",
      text: undefined,
    });
    expect(statusUpdates).toEqual(["sharing", "shared"]);
  });

  it("copies image blob to clipboard when supported", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    class MockClipboardItem {
      data: Record<string, Blob>;
      constructor(data: Record<string, Blob>) {
        this.data = data;
      }
    }
    vi.stubGlobal("navigator", {
      clipboard: { write },
    });
    vi.stubGlobal("ClipboardItem", MockClipboardItem);

    expect(canCopyImage()).toBe(true);

    const blob = new Blob(["test"], { type: "image/png" });
    const success = await copyImageToClipboard(blob);
    expect(success).toBe(true);
    expect(write).toHaveBeenCalled();
  });
  it("does not silently download after a rejected native share when fallback is disabled", async () => {
    vi.stubGlobal("navigator", {
      share: vi.fn().mockRejectedValue(new DOMException("Denied", "NotAllowedError")),
      canShare: () => true,
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await expect(shareSingleFile(dummyFile1, { downloadFallback: false })).rejects.toThrow("Denied");
    await expect(shareMultipleFiles([dummyFile1, dummyFile2], { downloadFallback: false })).rejects.toThrow("Denied");
    expect(click).not.toHaveBeenCalled();
  });
});
