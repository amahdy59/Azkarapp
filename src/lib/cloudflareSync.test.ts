import { afterEach, expect, it, vi } from "vitest";
import { DEVICE_REQUEST_TIMEOUT_MS, loadCloudflareSnapshot, CLOUDFLARE_DEVICE_SECRET_KEY } from "./cloudflareSync";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

it("bounds a stalled request and aborts its transport", async () => {
  vi.useFakeTimers();
  localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, "test-credential");
  const fetcher = vi.fn(() => new Promise<Response>(() => {}));
  vi.stubGlobal("fetch", fetcher);
  const request = loadCloudflareSnapshot();
  const rejection = expect(request).rejects.toThrow("device_request_timeout");
  await vi.advanceTimersByTimeAsync(DEVICE_REQUEST_TIMEOUT_MS);
  await rejection;
  expect((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal?.aborted).toBe(true);
});

it("also bounds a response whose body never finishes", async () => {
  vi.useFakeTimers();
  localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, "test-credential");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: () => new Promise(() => {}) })),
  );
  const rejection = expect(loadCloudflareSnapshot()).rejects.toThrow("device_request_timeout");
  await vi.advanceTimersByTimeAsync(DEVICE_REQUEST_TIMEOUT_MS);
  await rejection;
});
