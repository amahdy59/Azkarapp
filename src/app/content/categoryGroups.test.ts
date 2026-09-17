import { describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_GROUPS } from "./categories";

describe("CATEGORY_GROUPS", () => {
  const grouped = CATEGORY_GROUPS.flatMap((group) => group.categories);

  it("covers every library category exactly once", () => {
    // friday_kahf is reached through the Friday screen, so the Library filters
    // it out and it is deliberately ungrouped.
    const expected = CATEGORIES.map((category) => category.id).filter((id) => id !== "friday_kahf");

    expect([...grouped].sort()).toEqual([...expected].sort());
    expect(new Set(grouped).size, "a category appears in more than one group").toBe(grouped.length);
  });

  it("does not group friday_kahf", () => {
    expect(grouped).not.toContain("friday_kahf");
  });

  it("references only real categories", () => {
    const known = new Set(CATEGORIES.map((category) => category.id));
    for (const id of grouped) {
      expect(known.has(id), `unknown category id in a group: ${id}`).toBe(true);
    }
  });

  it("has no empty groups and uses unique ids", () => {
    for (const group of CATEGORY_GROUPS) {
      expect(group.categories.length, `${group.id} is empty`).toBeGreaterThan(0);
    }
    const ids = CATEGORY_GROUPS.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
