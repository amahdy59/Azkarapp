import { afterEach, describe, expect, it, vi } from "vitest";
import {
  allLearningEditions,
  learningCatalogue,
  learningEditions,
  learningEditionNotice,
  resolveLearningResource,
} from "./catalogue";
import { learningEditionId } from "./types";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("language-specific Learn editions", () => {
  it("exposes three Arabic books and only the completed English adaptation during local review", () => {
    vi.stubEnv("DEV", true);
    const arabic = learningCatalogue("en");
    expect(arabic).toHaveLength(3);
    expect(arabic.filter((item) => item.status).map((item) => item.id)).toEqual(["al-mukhtar", "al-wird-an-nabawi"]);
    expect(learningEditionNotice("en", arabic[0]!)).toContain("Review copy");
    expect(learningEditionNotice("en", arabic[0]!)).not.toContain("English");
    const english = learningCatalogue("ar", "en");
    expect(english).toHaveLength(1);
    expect(english[0]).toMatchObject({ id: "dalil-al-mutamir", language: "en", status: "draft-for-review" });
    expect(learningEditionId(english[0]!)).toBe("dalil-al-mutamir:en");
    expect(learningEditionId(learningCatalogue("ar")[0]!)).toBe("al-mukhtar");
  });
  it("keeps the unreviewed English draft out of ordinary production but allows isolated review builds", () => {
    vi.stubEnv("DEV", false);
    vi.stubGlobal("__LEARNING_REVIEW__", false);
    expect(learningCatalogue("en", "en")).toEqual([]);
    const production = learningEditions("en");
    expect(production.map((item) => [item.id, item.language])).toEqual([["dalil-al-mutamir", "ar"]]);
    expect(allLearningEditions("en")).toHaveLength(4);
    expect(resolveLearningResource("en", "al-mukhtar", "ar")).toBeUndefined();
    expect(resolveLearningResource("en", "al-wird-an-nabawi", "ar")).toBeUndefined();
    expect(resolveLearningResource("en", "dalil-al-mutamir", "en")).toEqual(production[0]);
    expect(resolveLearningResource("en", "dalil-al-mutamir", "ar", [])).toBeUndefined();
    expect(learningEditionNotice("en", production[0]!, true)).toContain("not the complete original");
    vi.stubGlobal("__LEARNING_REVIEW__", true);
    expect(learningCatalogue("en", "en")).toHaveLength(1);
  });
});
