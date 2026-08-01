import { describe, expect, it } from "vitest";
import { FRIDAY_DUAS } from "./fridayDuas";

describe("Friday duas content", () => {
  const introduction = FRIDAY_DUAS.find((dua) => dua.isCollectionIntroduction);
  const duas = FRIDAY_DUAS.filter((dua) => !dua.isCollectionIntroduction);

  it("keeps 20 essential and 15 additional duas in stable order", () => {
    expect(introduction?.id).toBe("friday-duas-introduction");
    expect(duas).toHaveLength(35);
    expect(duas.slice(0, 20).every((dua) => dua.includedInCore)).toBe(true);
    expect(duas.slice(20).every((dua) => !dua.includedInCore)).toBe(true);
    expect(duas.map((dua) => dua.id)).toEqual(
      Array.from({ length: 35 }, (_, index) => `friday-dua-${String(index + 1).padStart(2, "0")}`),
    );
  });

  it("provides bilingual benefits and sources without prescribing a Friday count", () => {
    for (const dua of duas) {
      expect(dua.repetitionCount).toBe(1);
      expect(dua.benefit.trim()).not.toBe("");
      expect(dua.benefitArabic).toMatch(/[\u0600-\u06ff]/);
      expect(dua.sourceReference.trim()).not.toBe("");
      expect(dua.sourceReferenceArabic).toMatch(/[\u0600-\u06ff]/);
    }
  });
});
