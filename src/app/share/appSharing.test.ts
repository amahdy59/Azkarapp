import { inflateSync } from "node:zlib";
import qrcode from "qrcode-generator";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PLAY_STORE_QR, PLAY_STORE_URL } from "./appShareLinks";
import { canShareApplication, prepareAppQrFile, shareApplication } from "./appSharing";
import * as native from "./nativeSharing";
import * as dispatcher from "./shareDispatcher";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("simple public application sharing", () => {
  it("bundles the exact Google Play QR with an opaque ground and four white margin modules", () => {
    expect(PLAY_STORE_URL).toBe("https://play.google.com/store/apps/details?id=m.azkar.com");
    const code = qrcode(0, "M");
    code.addData(PLAY_STORE_URL);
    code.make();
    const png = Buffer.from(PLAY_STORE_QR.split(",")[1]!, "base64");
    expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    const size = (code.getModuleCount() + 8) * 8;
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
    expect([png[24], png[25]]).toEqual([1, 0]); // One-bit grayscale, no alpha.
    const chunks: Buffer[] = [];
    for (let offset = 8; offset < png.length;) {
      const length = png.readUInt32BE(offset);
      if (png.toString("ascii", offset + 4, offset + 8) === "IDAT")
        chunks.push(png.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    const pixels = inflateSync(Buffer.concat(chunks));
    const stride = Math.ceil(size / 8) + 1;
    let exact = true;
    for (let y = 0; y < size; y += 1) {
      exact &&= pixels[y * stride] === 0;
      const row = Math.floor(y / 8) - 4;
      for (let x = 0; x < size; x += 1) {
        const column = Math.floor(x / 8) - 4;
        const dark =
          row >= 0 &&
          column >= 0 &&
          row < code.getModuleCount() &&
          column < code.getModuleCount() &&
          code.isDark(row, column);
        const white = (pixels[y * stride + 1 + (x >> 3)]! >> (7 - (x & 7))) & 1;
        exact &&= white === (dark ? 0 : 1);
      }
    }
    expect(exact).toBe(true); // Every pixel and all four full quiet margins.
  });
  it("automatically includes a supported prepared QR and its one matching link", async () => {
    vi.spyOn(native, "isNativeAndroid").mockReturnValue(false);
    vi.spyOn(dispatcher, "canShareMultipleFiles").mockReturnValue(true);
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });
    const file = new File(["png"], "qr.png", { type: "image/png" });
    const result = shareApplication("Share app", file);
    expect(share).toHaveBeenCalledWith({ title: "Share app", text: PLAY_STORE_URL, files: [file] });
    await expect(result).resolves.toBe("shared");
  });
  it("uses link-only sharing when file sharing or image preparation is unavailable", async () => {
    vi.spyOn(native, "isNativeAndroid").mockReturnValue(false);
    vi.spyOn(dispatcher, "canShareMultipleFiles").mockReturnValue(false);
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });
    expect(canShareApplication()).toBe(true);
    await shareApplication("Share app", new File(["png"], "qr.png"));
    await shareApplication("Share app", null);
    expect(share).toHaveBeenCalledTimes(2);
    expect(share).toHaveBeenLastCalledWith({ title: "Share app", url: PLAY_STORE_URL });
    vi.stubGlobal("navigator", {});
    expect(canShareApplication()).toBe(false);
  });
  it("reuses Android's text/image adapters without browser Web Share", async () => {
    vi.spyOn(native, "isNativeAndroid").mockReturnValue(true);
    vi.spyOn(dispatcher, "canShareMultipleFiles").mockReturnValue(true);
    vi.stubGlobal("navigator", {});
    const image = vi.spyOn(native, "shareWithAndroid").mockResolvedValue(undefined);
    expect(canShareApplication()).toBe(true);
    await shareApplication("Share app", null);
    expect(image).toHaveBeenCalledWith({ title: "Share app", url: PLAY_STORE_URL });
    const file = new File(["png"], "qr.png");
    await shareApplication("Share app", file);
    expect(image).toHaveBeenCalledWith({ title: "Share app", text: PLAY_STORE_URL, files: [file] });
  });
  it("preserves cancellation and rejected shares without downloading", async () => {
    vi.spyOn(native, "isNativeAndroid").mockReturnValue(false);
    const share = vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError"));
    vi.stubGlobal("navigator", { share });
    const save = vi.spyOn(dispatcher, "saveFile");
    await expect(shareApplication("Share app", null)).resolves.toBe("cancelled");
    expect(save).not.toHaveBeenCalled();
    share.mockRejectedValue(new Error("denied"));
    await expect(shareApplication("Share app", null)).rejects.toThrow("denied");
  });
  it("prepares exactly the bundled PNG without canvas, image decoding or a network request", async () => {
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    const file = await prepareAppQrFile();
    expect(file.name).toBe("wa-zaker-qr.png");
    expect(file.type).toBe("image/png");
    const data = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
    expect(Array.from(new Uint8Array(data))).toEqual(Array.from(Buffer.from(PLAY_STORE_QR.split(",")[1]!, "base64")));
    expect(canvas).not.toHaveBeenCalled();
  });
});
