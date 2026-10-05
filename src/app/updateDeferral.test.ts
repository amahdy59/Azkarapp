import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deferUpdate,
  readUpdateDeferral,
  remainingUpdateDeferral,
  UPDATE_DEFERRAL_KEY,
  UPDATE_DEFERRAL_MS,
} from "./updateDeferral";

beforeEach(() => window.localStorage.clear());

describe("update deferral", () => {
  it("persists only the waiting release and expires after 24 hours", () => {
    const value = deferUpdate("release-a", 100);
    expect(readUpdateDeferral()).toEqual(value);
    expect(remainingUpdateDeferral(value, "release-a", 100)).toBe(UPDATE_DEFERRAL_MS);
    expect(remainingUpdateDeferral(value, "release-b", 100)).toBe(0);
    expect(remainingUpdateDeferral(value, "release-a", 100 + UPDATE_DEFERRAL_MS)).toBe(0);
  });
  it("ignores malformed storage and caps deferral after a clock change", () => {
    for (const raw of ["broken", "null", '{"release":"a","until":"forever"}']) {
      window.localStorage.setItem(UPDATE_DEFERRAL_KEY, raw);
      expect(readUpdateDeferral()).toBeNull();
    }
    expect(remainingUpdateDeferral({ release: "a", until: Number.MAX_SAFE_INTEGER }, "a", 0)).toBe(UPDATE_DEFERRAL_MS);
  });
  it("returns a usable in-memory choice when storage is denied", () => {
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    try {
      expect(deferUpdate("a", 0)).toEqual({ release: "a", until: UPDATE_DEFERRAL_MS });
    } finally {
      write.mockRestore();
    }
  });
});
