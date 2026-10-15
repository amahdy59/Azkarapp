import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CLOUDFLARE_DEVICE_EVENT, CLOUDFLARE_DEVICE_SECRET_KEY } from "../../lib/cloudflareSync";
import { useDeviceLinkStatus } from "./useDeviceLinkStatus";

afterEach(() => vi.restoreAllMocks());

it("handles blocked storage on mount and device events", () => {
  vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
    throw new DOMException("Blocked", "SecurityError");
  });
  const { result } = renderHook(useDeviceLinkStatus);
  expect(result.current).toBe(false);
  act(() => window.dispatchEvent(new Event(CLOUDFLARE_DEVICE_EVENT)));
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: CLOUDFLARE_DEVICE_SECRET_KEY })));
  expect(result.current).toBe(false);
});

it("refreshes only relevant storage changes", () => {
  localStorage.clear();
  const { result } = renderHook(useDeviceLinkStatus);
  localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, "test-device");
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" })));
  expect(result.current).toBe(false);
  act(() => window.dispatchEvent(new Event(CLOUDFLARE_DEVICE_EVENT)));
  expect(result.current).toBe(true);
  localStorage.removeItem(CLOUDFLARE_DEVICE_SECRET_KEY);
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: null })));
  expect(result.current).toBe(false);
});
