import { describe, expect, it } from "vitest";
import { allLearningEditions } from "./catalogue";
import { getLearningContinuation } from "./learningContinuation";

const editions = allLearningEditions("en");

describe("Home book continuation", () => {
  it("chooses the most recent available edition without using a hidden saved preference", () => {
    const available = editions.filter((edition) => !edition.status);
    const state = {
      "dalil-al-mutamir": {
        bookmarks: ["p-6"],
        contentLanguage: "en" as const,
        position: { unitId: "p-6", offset: 0.3 },
        lastReadAt: 10,
      },
      "dalil-al-mutamir:en": { bookmarks: [], position: { unitId: "p-9", offset: 0.7 }, lastReadAt: 30 },
      "al-mukhtar": { bookmarks: [], position: { unitId: "p-32", offset: 0.4 }, lastReadAt: 40 },
    };
    const before = structuredClone(state);
    expect(getLearningContinuation(available, state)).toMatchObject({
      resource: { id: "dalil-al-mutamir", language: "ar" },
      unitId: "p-6",
    });
    expect(getLearningContinuation(editions, state)).toMatchObject({ resource: { id: "al-mukhtar" }, unitId: "p-32" });
    expect(state).toEqual(before);
    expect(getLearningContinuation([], state)).toBeUndefined();
  });

  it("keeps legacy positions usable and chooses exact English identity when available", () => {
    const legacy = { "dalil-al-mutamir": { bookmarks: [], position: { unitId: "p-6", offset: 0.3 } } };
    expect(getLearningContinuation(editions, legacy)?.unitId).toBe("p-6");
    expect(
      getLearningContinuation(editions, {
        ...legacy,
        "dalil-al-mutamir:en": { bookmarks: [], position: { unitId: "p-9", offset: 0.7 }, lastReadAt: 10 },
      }),
    ).toMatchObject({ resource: { id: "dalil-al-mutamir", language: "en" }, unitId: "p-9" });
    expect(getLearningContinuation(editions, { "al-mukhtar": { bookmarks: ["p-2"] } })).toBeUndefined();
  });
});
