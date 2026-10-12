import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioDownloadError, transferAudio } from "./audioDownloadTransfer";
import type { AudioVariant } from "./audioTypes";

const variant = { id: "test-recording", byteSize: 4, mimeType: "audio/mpeg" } as AudioVariant;
const good = () => new Response(new Uint8Array([1, 2, 3, 4]), { headers: { "content-type": "audio/mpeg" } });
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("audio transfer recovery", () => {
  it("honors a bounded server Retry-After delay", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429, headers: { "retry-after": "4" } }))
      .mockImplementationOnce(async () => good());
    vi.stubGlobal("fetch", fetch);
    const result = transferAudio("https://audio.test/file", variant, { onTransfer: vi.fn() });
    await vi.advanceTimersByTimeAsync(3999);
    expect(fetch).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect((await result).buffer.byteLength).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("reports bytes before a streamed response finishes", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            new ReadableStream({
              start(controller) {
                stream = controller;
              },
            }),
            { headers: { "content-type": "audio/mpeg" } },
          ),
      ),
    );
    const onTransfer = vi.fn();
    const result = transferAudio("https://audio.test/file", variant, { onTransfer });
    await vi.waitFor(() => expect(stream).toBeDefined());
    stream.enqueue(new Uint8Array([1, 2]));
    await vi.waitFor(() => expect(onTransfer).toHaveBeenCalledWith("receiving", 2, 1));
    stream.enqueue(new Uint8Array([3, 4]));
    stream.close();
    expect(new Uint8Array((await result).buffer)).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it.each([429, 503, "network"])("retries temporary %s failures before succeeding", async (failure) => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockImplementationOnce(async () => {
        if (failure === "network") throw new TypeError("Connection lost");
        return new Response(null, { status: failure });
      })
      .mockImplementationOnce(async () => good());
    vi.stubGlobal("fetch", fetch);
    const onTransfer = vi.fn();
    const result = transferAudio("https://audio.test/file", variant, { onTransfer });
    await vi.advanceTimersByTimeAsync(1000);
    expect((await result).buffer.byteLength).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(onTransfer).toHaveBeenCalledWith("retrying", 0, 2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("exhausts three attempts with an actionable network failure", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockRejectedValue(new TypeError("offline"));
    vi.stubGlobal("fetch", fetch);
    const result = expect(
      transferAudio("https://audio.test/file", variant, { onTransfer: vi.fn() }),
    ).rejects.toMatchObject({ code: "network", recordingId: variant.id });
    await vi.advanceTimersByTimeAsync(3000);
    await result;
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry permanent missing-file responses", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetch);
    await expect(transferAudio("https://audio.test/file", variant, { onTransfer: vi.fn() })).rejects.toMatchObject({
      code: "server",
      status: 404,
    });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it.each([new Uint8Array([1, 2]), new Uint8Array([1, 2, 3, 4, 5])])(
    "rejects incomplete or oversized bodies",
    async (bytes) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(bytes, { headers: { "content-type": "audio/mpeg" } })),
      );
      await expect(transferAudio("https://audio.test/file", variant, { onTransfer: vi.fn() })).rejects.toBeInstanceOf(
        AudioDownloadError,
      );
    },
  );

  it("rejects the wrong MIME without retrying", async () => {
    const fetch = vi.fn(async () => new Response("not audio"));
    vi.stubGlobal("fetch", fetch);
    await expect(transferAudio("https://audio.test/file", variant, { onTransfer: vi.fn() })).rejects.toMatchObject({
      code: "integrity",
    });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("cancels a retry wait without starting another request", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const fetch = vi.fn().mockRejectedValue(new TypeError("offline"));
    vi.stubGlobal("fetch", fetch);
    const onTransfer = vi.fn();
    const result = expect(
      transferAudio("https://audio.test/file", variant, { signal: controller.signal, onTransfer }),
    ).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await result;
    expect(fetch).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("retries a stalled request after its inactivity deadline", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            options.signal.addEventListener("abort", () => reject(new DOMException("stalled", "AbortError")));
          }),
      )
      .mockImplementationOnce(async () => good());
    vi.stubGlobal("fetch", fetch);
    const result = transferAudio("https://audio.test/file", variant, { onTransfer: vi.fn() });
    await vi.advanceTimersByTimeAsync(31_000);
    expect((await result).buffer.byteLength).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
