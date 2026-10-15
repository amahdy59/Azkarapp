import { afterEach, describe, expect, it, vi } from "vitest";
import { nativeAudioSource } from "./cachedAudio";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("packaged Android offline audio", () => {
  it("plays a previously downloaded complete audio response without a network request", async () => {
    const fetch = vi.fn();
    const match = vi.fn().mockResolvedValue(
      new Response(new Blob(["downloaded bytes"], { type: "audio/mpeg" }), {
        headers: { "content-type": "audio/mpeg" },
      }),
    );
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue({ match }) });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:downloaded-audio");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const source = await nativeAudioSource("https://audio.test/voice.mp3?sha256=verified");
    expect(source.url).toBe("blob:downloaded-audio");
    expect(fetch).not.toHaveBeenCalled();
    source.release();
    expect(revoke).toHaveBeenCalledWith("blob:downloaded-audio");
  });

  it("does not use partial downloads or unreadable cached data", async () => {
    const match = vi
      .fn()
      .mockResolvedValueOnce(new Response("partial", { status: 206, headers: { "content-type": "audio/mpeg" } }))
      .mockRejectedValueOnce(new Error("cache unavailable"));
    vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue({ match }) });
    for (let i = 0; i < 2; i++)
      expect((await nativeAudioSource("https://audio.test/a.mp3")).url).toBe("https://audio.test/a.mp3");
  });
});
