import { describe, expect, it } from "vitest";
import { createShareArchive, createFileArchive, crc32 } from "./shareArchive";
describe("share ZIP", () => {
  it("cancels during chunked packaging before publishing an archive", async () => {
    const controller = new AbortController();
    const file = new File([new Uint8Array(2 * 1024 * 1024)], "large.mp3");
    const task = createFileArchive([file], "audio.zip", { signal: controller.signal });
    setTimeout(() => controller.abort(), 0);
    await expect(task).rejects.toThrow();
  });
  it("uses the standard CRC32 test vector", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
  it("keeps numbered image bytes and complete Unicode text in a single valid ZIP", async () => {
    const files = [new File(["first"], "001.png"), new File(["second"], "002.png")];
    const text = "اللَّهُمَّ اغْفِرْ لَنَا\nالمصدر: صحيح مسلم";
    const zip = await createShareArchive(files, text);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(bytes.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(bytes.length - 14, true)).toBe(3);
    const decoded = new TextDecoder().decode(bytes);
    expect(decoded).toContain("001.png");
    expect(decoded).toContain("002.png");
    expect(decoded).toContain(text);
    expect(decoded.indexOf("first")).toBeLessThan(decoded.indexOf("second"));
    expect(zip.type).toBe("application/zip");
  });
  it("emits directory entries with 0x10 external attributes and files with 0x20", async () => {
    const dir = new File([], "folder/", { type: "application/x-directory" });
    const file = new File(["test"], "folder/track.mp3", { type: "audio/mpeg" });
    const zip = await createFileArchive([dir, file], "archive.zip");
    const bytes = new Uint8Array(await zip.arrayBuffer());
    const view = new DataView(bytes.buffer);
    // Find EOCD
    const eocdOffset = bytes.length - 22;
    expect(view.getUint32(eocdOffset, true)).toBe(0x06054b50);
    const totalEntries = view.getUint16(eocdOffset + 10, true);
    expect(totalEntries).toBe(2);
    const cdOffset = view.getUint32(eocdOffset + 16, true);
    // Central directory entry 0 (directory)
    expect(view.getUint32(cdOffset, true)).toBe(0x02014b50);
    expect(view.getUint32(cdOffset + 38, true)).toBe(0x10);
    const nameLen0 = view.getUint16(cdOffset + 28, true);
    // Central directory entry 1 (file)
    const cdOffset1 = cdOffset + 46 + nameLen0;
    expect(view.getUint32(cdOffset1, true)).toBe(0x02014b50);
    expect(view.getUint32(cdOffset1 + 38, true)).toBe(0x20);
  });
});
