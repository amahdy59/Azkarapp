import { describe, expect, it } from "vitest";
import { COMPREHENSIVE_DUAS } from "./comprehensiveDuas";

describe("comprehensive duas content", () => {
  const introduction = COMPREHENSIVE_DUAS.find((dua) => dua.isCollectionIntroduction);
  const duas = COMPREHENSIVE_DUAS.filter((dua) => !dua.isCollectionIntroduction);

  it("keeps 20 essential and 27 additional duas in stable order", () => {
    expect(introduction?.id).toBe("comprehensive-duas-introduction");
    expect(duas).toHaveLength(47);
    expect(duas.slice(0, 20).every((dua) => dua.includedInCore)).toBe(true);
    expect(duas.slice(20).every((dua) => !dua.includedInCore)).toBe(true);
    expect(duas.slice(0, 35).map((dua) => dua.id)).toEqual(
      Array.from({ length: 35 }, (_, index) => `friday-dua-${String(index + 1).padStart(2, "0")}`),
    );
    expect(duas.slice(35).map((dua) => dua.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => `comprehensive-dua-${index + 36}`),
    );
  });

  it("provides bilingual benefits and sources without prescribing a Friday-specific count", () => {
    for (const dua of duas) {
      expect(dua.repetitionCount).toBe(dua.id === "comprehensive-dua-42" ? 100 : 1);
      expect(dua.benefit.trim()).not.toBe("");
      expect(dua.benefitArabic).toMatch(/[\u0600-\u06ff]/);
      expect(dua.sourceReference.trim()).not.toBe("");
      expect(dua.sourceReferenceArabic).toMatch(/[\u0600-\u06ff]/);
    }
  });

  it("records direct sources and precise attribution for every new dua", () => {
    for (const dua of duas.slice(35)) {
      expect(dua.sourceUrl).toMatch(/^https:\/\/sunnah\.com\//);
      expect(dua.attributionType).toBeTruthy();
    }
  });
});
