import { afterEach, expect, test, vi } from "vitest";
import { probeAudioVariants } from "./probe-audio-variants.mjs";

const variant = (id) => ({ id, relativePath: `/${id}.mp3`, mimeType: "audio/mpeg" });
const response = (status = 206, mimeType = "audio/mpeg; charset=binary") => ({
  status,
  headers: new Map([["content-type", mimeType]]),
  body: { cancel: vi.fn(async () => {}) },
});
afterEach(() => vi.useRealTimers());

test("retries rate limits with bounded Retry-After and releases every response", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-05T12:00:00.000Z"));
  const limited = response(429);
  limited.headers.set("retry-after", "120");
  const second = response(429);
  second.headers.set("retry-after", new Date(Date.now() + 5000).toUTCString());
  const ready = response();
  const sleep = vi.fn(async () => {});
  const fetchImpl = vi.fn().mockResolvedValueOnce(limited).mockResolvedValueOnce(second).mockResolvedValue(ready);
  expect(await probeAudioVariants([variant("a")], "https://audio.test", { fetchImpl, sleep })).toEqual([]);
  expect(sleep.mock.calls).toEqual([[30_000], [5000]]);
  expect(fetchImpl).toHaveBeenCalledTimes(3);
  for (const reply of [limited, second, ready]) expect(reply.body.cancel).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

test("still fails persistent rate limits after three attempts", async () => {
  const replies = [response(429), response(429), response(429)];
  const sleep = vi.fn(async () => {});
  const fetchImpl = vi.fn(async () => replies.shift());
  expect(await probeAudioVariants([variant("a")], "https://audio.test", { fetchImpl, sleep })).toEqual([
    { code: "unavailable-url", message: "a: HTTP 429" },
  ]);
  expect(fetchImpl).toHaveBeenCalledTimes(3);
  expect(sleep.mock.calls).toEqual([[1000], [2000]]);
});

test("checks every recording while bounding requests and releasing response bodies", async () => {
  const pending = [];
  const replies = [];
  let active = 0;
  let peak = 0;
  const fetchImpl = vi.fn(async (_url, options) => {
    expect(options.headers.Range).toBe("bytes=0-0");
    active++;
    peak = Math.max(peak, active);
    await new Promise((resolve) => pending.push(resolve));
    active--;
    const reply = response();
    replies.push(reply);
    return reply;
  });
  const run = probeAudioVariants([variant("a"), variant("b"), variant("c")], "https://audio.test", {
    concurrency: 2,
    fetchImpl,
  });
  expect(fetchImpl).toHaveBeenCalledTimes(2);
  for (let count = 0; count < 3; count++) {
    await vi.waitFor(() => expect(pending.length).toBeGreaterThan(0));
    pending.shift()();
  }
  expect(await run).toEqual([]);
  expect(peak).toBe(2);
  expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
    "https://audio.test/a.mp3",
    "https://audio.test/b.mp3",
    "https://audio.test/c.mp3",
  ]);
  expect(replies.every((reply) => reply.body.cancel.mock.calls.length === 1)).toBe(true);
});

test("retains HTTP/MIME failures in input order and continues other probes", async () => {
  const badStatus = response(404);
  const badMime = response(206, "text/html");
  const fetchImpl = vi.fn(async (url) => (url.endsWith("a.mp3") ? badStatus : badMime));
  expect(await probeAudioVariants([variant("a"), variant("b")], "https://audio.test", { fetchImpl })).toEqual([
    { code: "unavailable-url", message: "a: HTTP 404" },
    { code: "unavailable-url", message: "b: MIME text/html" },
  ]);
  expect(fetchImpl).toHaveBeenCalledTimes(2);
  expect(badStatus.body.cancel).toHaveBeenCalledOnce();
  expect(badMime.body.cancel).toHaveBeenCalledOnce();
});

test("retries transient network failures with the existing backoff and fails after three attempts", async () => {
  const sleep = vi.fn(async () => {});
  const fetchImpl = vi.fn().mockRejectedValue(new Error("network unavailable"));
  expect(await probeAudioVariants([variant("a")], "https://audio.test", { fetchImpl, sleep })).toEqual([
    { code: "unavailable-url", message: "a: network unavailable" },
  ]);
  expect(fetchImpl).toHaveBeenCalledTimes(3);
  expect(sleep.mock.calls).toEqual([[1000], [2000]]);
});

test("a successful retry retains validation and clears its request timer", async () => {
  vi.useFakeTimers();
  const reply = response(200);
  const fetchImpl = vi.fn().mockRejectedValueOnce(new Error("temporary")).mockResolvedValue(reply);
  expect(await probeAudioVariants([variant("a")], "https://audio.test", { fetchImpl, sleep: async () => {} })).toEqual(
    [],
  );
  expect(fetchImpl).toHaveBeenCalledTimes(2);
  expect(vi.getTimerCount()).toBe(0);
  expect(reply.body.cancel).toHaveBeenCalledOnce();
});

test("aborts stalled requests and retains timeout failures without leaking timers", async () => {
  vi.useFakeTimers();
  const fetchImpl = vi.fn(
    (_url, { signal }) =>
      new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")))),
  );
  const run = probeAudioVariants([variant("a")], "https://audio.test", {
    fetchImpl,
    sleep: async () => {},
    timeoutMs: 10,
  });
  await vi.runAllTimersAsync();
  expect(await run).toEqual([{ code: "unavailable-url", message: "a: aborted" }]);
  expect(fetchImpl).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});

test("accepts empty catalogs and rejects an invalid worker bound", async () => {
  const fetchImpl = vi.fn();
  expect(await probeAudioVariants([], "https://audio.test", { fetchImpl })).toEqual([]);
  expect(fetchImpl).not.toHaveBeenCalled();
  await expect(probeAudioVariants([], "https://audio.test", { concurrency: 0 })).rejects.toThrow("Concurrency");
});

test("probes shared URLs once per run while checking each variant's expected MIME", async () => {
  const reply = response();
  const fetchImpl = vi.fn(async () => reply);
  const variants = [
    variant("a"),
    { ...variant("alias"), relativePath: "a.mp3" },
    { ...variant("bad-metadata"), relativePath: "/a.mp3", mimeType: "text/html" },
  ];
  expect(await probeAudioVariants(variants, "https://audio.test", { fetchImpl })).toEqual([
    { code: "unavailable-url", message: "bad-metadata: MIME audio/mpeg" },
  ]);
  expect(fetchImpl).toHaveBeenCalledOnce();
  expect(reply.body.cancel).toHaveBeenCalledOnce();
  await probeAudioVariants(variants.slice(0, 2), "https://audio.test", { fetchImpl });
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});
