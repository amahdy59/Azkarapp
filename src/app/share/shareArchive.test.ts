import { describe, expect, it } from "vitest";
import { createShareArchive, crc32 } from "./shareArchive";
describe("share ZIP", () => {
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
});
