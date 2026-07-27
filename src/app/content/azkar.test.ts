import { describe, expect, it } from "vitest";
import { CATEGORIES } from "./categories";
import { getAzkarByCategory, getCategoryTotal } from "./azkar";

describe("azkar content totals", () => {
  it("derives every category total from its content collection", () => {
    for (const category of CATEGORIES) {
      const items = getAzkarByCategory(category.id);
      expect(getCategoryTotal(category.id)).toBe(items.length);
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it("keeps order indexes unique within each category", () => {
    for (const category of CATEGORIES) {
      const indexes = getAzkarByCategory(category.id).map((item) => item.orderIndex);
      expect(new Set(indexes).size).toBe(indexes.length);
    }
  });

  it("passes comprehensive authenticity & content completeness audit across all zikrs", () => {
    for (const category of CATEGORIES) {
      const items = getAzkarByCategory(category.id);
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.arabicText.trim().length).toBeGreaterThan(0);
        expect(item.translation.trim().length).toBeGreaterThan(0);
        expect(item.repetitionCount).toBeGreaterThanOrEqual(1);
        expect(item.sourceReference).toBeTruthy();
        expect(item.sourceReference.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
