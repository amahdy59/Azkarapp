import { getAzkarByCategory, getCollectionIntroduction } from "./azkar";
import { describe, expect, it } from "vitest";

describe("prayer and fasting collections", () => {
  it("keeps the in-prayer collection sourced, staged, and distinct from post-prayer adhkar", () => {
    const items = getAzkarByCategory("in_prayer");
    expect(items.map((item) => item.id)).toEqual([
      "in-prayer-opening-forgiveness",
      "in-prayer-ruku-tasbih",
      "in-prayer-rising-praise",
      "in-prayer-sujud-tasbih",
      "in-prayer-between-prostrations",
      "in-prayer-tashahhud",
      "in-prayer-ibrahimiyyah",
      "in-prayer-before-salam-refuge",
    ]);
    expect(items.every((item) => item.sourceUrl && item.sourceReference && item.benefitArabic)).toBe(true);
    expect(items.filter((item) => item.repetitionCount === 3).map((item) => item.sourceReference)).toEqual([
      expect.stringContaining("Hisn al-Muslim 33"),
      expect.stringContaining("Hisn al-Muslim 41"),
    ]);
    expect(getCollectionIntroduction("in_prayer")?.benefit).toMatch(/choose one/i);
  });

  it("keeps fasting content useful outside Ramadan without prescribing a spoken intention", () => {
    const items = getAzkarByCategory("fasting_ramadan");
    expect(items.map((item) => item.id)).toEqual(["fasting-suhur-blessing", "fasting-iftar-supplication"]);
    expect(getCollectionIntroduction("fasting_ramadan")?.benefit).toMatch(/does not prescribe/i);
    expect(items.every((item) => item.sourceUrl && item.sourceReference && item.benefitArabic)).toBe(true);
  });
});
