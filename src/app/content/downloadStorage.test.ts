import { describe, expect, it, vi } from "vitest";
import { hasDownloadSpace, getDownloadPersistence, requestDownloadPersistence } from "./downloadStorage";

describe("download storage preflight", () => {
  it("handles granted, declined, missing and rejected persistence APIs", async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "storage");
    try {
      const persisted = vi.fn().mockResolvedValue(true);
      const persist = vi.fn().mockResolvedValue(false);
      Object.defineProperty(navigator, "storage", { configurable: true, value: { persist, persisted } });
      expect(await getDownloadPersistence()).toBe("granted");
      expect(await requestDownloadPersistence()).toBe("denied");
      persist.mockResolvedValue(true);
      persisted.mockResolvedValue(false);
      expect(await getDownloadPersistence()).toBe("denied");
      expect(await requestDownloadPersistence()).toBe("granted");
      persist.mockRejectedValue(new Error("blocked"));
      persisted.mockRejectedValue(new Error("blocked"));
      expect(await getDownloadPersistence()).toBe("unsupported");
      expect(await requestDownloadPersistence()).toBe("unsupported");
      Object.defineProperty(navigator, "storage", { configurable: true, value: undefined });
      expect(await getDownloadPersistence()).toBe("unsupported");
      expect(await requestDownloadPersistence()).toBe("unsupported");
    } finally {
      if (original) Object.defineProperty(navigator, "storage", original);
      else Reflect.deleteProperty(navigator, "storage");
    }
  });
  it("reserves overhead and tolerates browsers without quota estimates", async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "storage");
    try {
      Object.defineProperty(navigator, "storage", {
        configurable: true,
        value: { estimate: vi.fn().mockResolvedValue({ quota: 1000, usage: 500 }) },
      });
      expect(await hasDownloadSpace(500)).toBe(false);
      expect(await hasDownloadSpace(400)).toBe(true);
      Object.defineProperty(navigator, "storage", { configurable: true, value: undefined });
      expect(await hasDownloadSpace(500)).toBe(true);
    } finally {
      if (original) Object.defineProperty(navigator, "storage", original);
      else Reflect.deleteProperty(navigator, "storage");
    }
  });
});
