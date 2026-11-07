import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

function worker(windows: object[] = []) {
  const listeners = new Map();
  const openWindow = vi.fn();
  runInNewContext(readFileSync("public/notification-navigation.js", "utf8"), {
    URL,
    self: {
      registration: { scope: "https://example.com/Azkarapp/" },
      clients: { matchAll: async () => windows, openWindow },
      addEventListener: (name: string, callback: unknown) => listeners.set(name, callback),
    },
  });
  const tap = async (url: unknown) => {
    let done = Promise.resolve();
    const close = vi.fn();
    listeners.get("notificationclick")({
      notification: { close, data: { url } },
      waitUntil: (pending: Promise<void>) => {
        done = pending;
      },
    });
    await done;
    expect(close).toHaveBeenCalledOnce();
  };
  return { tap, openWindow };
}

describe("notification worker tap navigation", () => {
  it("opens a cold-start prayer route inside a Pages subdirectory", async () => {
    const { tap, openWindow } = worker();
    await tap("/Azkarapp/#/prayer/asr");
    expect(openWindow).toHaveBeenCalledWith("https://example.com/Azkarapp/#/prayer/asr");
  });
  it.each(["friday/salawat", "azkar/fasting-ramadan"])("opens the optional reminder destination %s", async (path) => {
    const { tap, openWindow } = worker();
    await tap(`/Azkarapp/#/${path}`);
    expect(openWindow).toHaveBeenCalledWith(`https://example.com/Azkarapp/#/${path}`);
  });
  it("navigates and focuses the existing app while leaving other tabs alone", async () => {
    const navigate = vi.fn();
    const focus = vi.fn();
    const { tap, openWindow } = worker([
      { url: "https://example.com/other/" },
      { url: "https://example.com/Azkarapp/#/home", navigate, focus },
    ]);
    await tap("/Azkarapp/#/azkar/before-sleep");
    expect(navigate).toHaveBeenCalledWith("https://example.com/Azkarapp/#/azkar/before-sleep");
    expect(focus).toHaveBeenCalledOnce();
    expect(openWindow).not.toHaveBeenCalled();
  });
  it.each([
    "https://evil.test/Azkarapp/#/prayer/asr",
    "/other/#/prayer/asr",
    "javascript:alert(1)",
    "/Azkarapp/#/prayer/invalid",
    "/Azkarapp/?redirect=1#/prayer/asr",
    undefined,
  ])("rejects an untrusted target %s", async (target) => {
    const { tap, openWindow } = worker();
    await tap(target);
    expect(openWindow).not.toHaveBeenCalled();
  });
});
