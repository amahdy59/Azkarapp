import { afterEach, describe, expect, it, vi } from "vitest";
import { attributeCardImage } from "./attributedCard";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setup() {
  const image = { naturalWidth: 1080, naturalHeight: 1920, decode: vi.fn().mockResolvedValue(undefined), src: "" };
  vi.stubGlobal(
    "Image",
    class {
      constructor() {
        return image;
      }
    },
  );
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:card");
  const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  const ctx = { drawImage: vi.fn(), fillRect: vi.fn(), fillText: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  const encode = vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (callback, type) {
    callback(new Blob(["branded"], { type }));
  });
  return { image, ctx, encode, revoke };
}

describe("supplied-card attribution", () => {
  it("preserves the complete artwork and prints a contrasting URL below it", async () => {
    const { image, ctx, encode, revoke } = setup();
    const blob = await attributeCardImage(new Blob(["original"]));
    expect(blob.type).toBe("image/webp");
    expect(ctx.drawImage).toHaveBeenCalledWith(image, 0, 0);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 1920, 1080, 92);
    expect(ctx.fillText).toHaveBeenCalledWith("wa-zaker.com", 540, 1966);
    expect(encode.mock.instances[0]).toMatchObject({ width: 1080, height: 2012 });
    expect(revoke).toHaveBeenCalledWith("blob:card");
  });
  it("fails visibly on decode or encoding errors and releases temporary URLs", async () => {
    const { image, encode, revoke } = setup();
    image.decode.mockRejectedValueOnce(new Error("decode"));
    await expect(attributeCardImage(new Blob())).rejects.toThrow("decode");
    encode.mockImplementationOnce((callback) => callback(null));
    await expect(attributeCardImage(new Blob(), "image/png")).rejects.toThrow("encoding failed");
    expect(revoke).toHaveBeenCalledTimes(2);
  });
});
