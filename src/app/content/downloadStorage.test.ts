import { describe, expect, it, vi } from "vitest";
import { hasDownloadSpace } from "./downloadStorage";

describe("download storage preflight", () => {
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
