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
});
