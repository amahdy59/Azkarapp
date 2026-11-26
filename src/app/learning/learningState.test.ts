import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPrivateStoredAppData, clearStoredAppData } from "../state";
import {
  LEARNING_STATE_KEY,
  normalizeLearningState,
  readLearningState,
  subscribeLearningState,
  updateLearningState,
} from "./learningState";

beforeEach(() => {
  localStorage.clear();
});

describe("device-local learning state", () => {
  it("preserves optional visit recency while rejecting malformed values and retaining legacy records", () => {
    for (const invalid of [-1, 0, 1.5, NaN, Infinity, "100", null]) {
      expect(normalizeLearningState({ "al-mukhtar": { bookmarks: ["p-3"], lastReadAt: invalid } })).toEqual({
        "al-mukhtar": { bookmarks: ["p-3"] },
      });
    }
    const legacy = { bookmarks: ["p-6"], position: { unitId: "p-6", offset: 0.3 } };
    updateLearningState("dalil-al-mutamir", () => legacy);
    updateLearningState("dalil-al-mutamir", (previous) => ({ ...previous, lastReadAt: 1795669000000 }));
    expect(readLearningState()["dalil-al-mutamir"]).toEqual({ ...legacy, lastReadAt: 1795669000000 });
  });
  it("keeps legacy Arabic records and separate English positions/bookmarks without migration", () => {
    const arabic = { position: { unitId: "p-8", offset: 0.35 }, bookmarks: ["p-6"] };
    localStorage.setItem(LEARNING_STATE_KEY, JSON.stringify({ "dalil-al-mutamir": arabic }));
    updateLearningState("dalil-al-mutamir:en", () => ({
      position: { unitId: "p-9", offset: 0.6 },
      bookmarks: ["p-9"],
    }));
    updateLearningState("dalil-al-mutamir", (previous) => ({ ...previous, contentLanguage: "en" }));
    expect(readLearningState()["dalil-al-mutamir"]).toEqual({ ...arabic, contentLanguage: "en" });
    expect(readLearningState()["dalil-al-mutamir:en"]).toEqual({
      position: { unitId: "p-9", offset: 0.6 },
      bookmarks: ["p-9"],
    });
    expect(
      normalizeLearningState({
        "al-mukhtar:en": { bookmarks: ["p-1"] },
        "al-mukhtar": { bookmarks: [], contentLanguage: "en" },
      }),
    ).toEqual({ "al-mukhtar": { bookmarks: [] } });
  });
  it("normalizes malformed data without touching devotional completion", () => {
    expect(
      normalizeLearningState({
        "al-mukhtar": { position: { unitId: "p-32", offset: 7 }, bookmarks: ["p-3", "p-3", "javascript:bad", null] },
        "dalil-al-mutamir": { position: { unitId: "p-2", offset: "bad" } },
        unknown: { bookmarks: ["p-1"] },
      }),
    ).toEqual({
      "al-mukhtar": { position: { unitId: "p-32", offset: 1 }, bookmarks: ["p-3"] },
      "dalil-al-mutamir": { bookmarks: [] },
    });
    expect(normalizeLearningState(null)).toEqual({});
    expect(normalizeLearningState([])).toEqual({});
  });

  it("keeps position when bookmarking and detects same-document erasure", () => {
    updateLearningState("al-mukhtar", () => ({ position: { unitId: "p-32", offset: 0.4 }, bookmarks: [] }));
    updateLearningState("al-mukhtar", (previous) => ({ ...previous, bookmarks: ["p-32"] }));
    expect(JSON.parse(localStorage.getItem(LEARNING_STATE_KEY)!)["al-mukhtar"].position.offset).toBe(0.4);
    const snapshot = readLearningState();
    expect(readLearningState()).toBe(snapshot);
    localStorage.removeItem(LEARNING_STATE_KEY);
    expect(readLearningState()).toEqual({});
  });

  it("clears private reading records during sign-out and full data erasure", async () => {
    const notify = vi.fn();
    const stop = subscribeLearningState(notify);
    updateLearningState("al-mukhtar", () => ({ bookmarks: ["p-1"] }));
    clearPrivateStoredAppData();
    await Promise.resolve();
    expect(readLearningState()).toEqual({});
    expect(notify).toHaveBeenCalled();
    updateLearningState("al-mukhtar", () => ({ bookmarks: ["p-2"] }));
    clearStoredAppData();
    expect(readLearningState()).toEqual({});
    stop();
  });

  it("keeps a session change and reports denied writes", () => {
    readLearningState();
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Denied");
    });
    try {
      expect(updateLearningState("al-mukhtar", () => ({ bookmarks: ["p-4"] }))).toBe(false);
      expect(readLearningState()["al-mukhtar"]?.bookmarks).toEqual(["p-4"]);
    } finally {
      write.mockRestore();
    }
  });
});
