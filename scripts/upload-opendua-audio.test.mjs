import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { uploadImmutableAudio } from "./upload-opendua-audio.mjs";

const { Response } = globalThis;

const bytes = Buffer.from("test MP3 bytes");
const variant = {
  relativePath: "dua/opendua/voice/v1/recording.mp3",
  mimeType: "audio/mpeg",
  byteSize: bytes.length,
  sha256: createHash("sha256").update(bytes).digest("hex"),
};
const configuration = {
  publicBase: "https://audio.example.test",
  endpoint: "https://storage.example.test",
  bucket: "test-bucket",
  accessKey: "test-only-key",
  secretKey: "test-only-secret",
};

describe("immutable accepted-audio uploads", () => {
  it("reuses matching remote bytes without a write", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(bytes));
    await expect(uploadImmutableAudio({ variant, bytes, configuration, fetchImpl })).resolves.toBe("reused");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
  it("rejects damaged local bytes before any network call", async () => {
    const fetchImpl = vi.fn();
    await expect(
      uploadImmutableAudio({ variant, bytes: Buffer.from("bad"), configuration, fetchImpl }),
    ).rejects.toThrow("Local recording");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("never overwrites different bytes or retries a non-404 as an upload", async () => {
    for (const response of [new Response("different"), new Response(null, { status: 403 })]) {
      const fetchImpl = vi.fn().mockResolvedValue(response);
      await expect(uploadImmutableAudio({ variant, bytes, configuration, fetchImpl })).rejects.toThrow();
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    }
  });
  it("publishes an absent immutable key with exact audio bytes and caching metadata", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response());
    await expect(uploadImmutableAudio({ variant, bytes, configuration, fetchImpl })).resolves.toBe("uploaded");
    const [url, options] = fetchImpl.mock.calls[1];
    expect(url.pathname).toBe(`/test-bucket/${variant.relativePath}`);
    expect(options).toMatchObject({
      method: "PUT",
      body: bytes,
      headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=31536000, immutable" },
    });
  });
});
