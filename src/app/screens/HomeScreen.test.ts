import { describe, expect, it } from "vitest";
import { getHomeAction } from "./HomeScreen";
import { CATEGORY_IDS } from "../progress";
import type { CategoryId } from "../types";

function progress(values: Partial<Record<CategoryId, number[]>> = {}) {
  const result = {} as Record<CategoryId, Set<number>>;
  for (const id of CATEGORY_IDS) {
    result[id] = new Set(values[id] ?? []);
  }
  return result;
}

describe("getHomeAction", () => {
  it("resumes an interrupted collection before suggesting a fresh one", () => {
    const action = getHomeAction(progress({ evening: [0, 1] }), new Date(2026, 6, 17, 9));

    expect(action).toMatchObject({ categoryId: "evening", index: 2, completedCount: 2, kind: "resume" });
  });

  it("uses time of day only as a suggestion for a new session", () => {
    const action = getHomeAction(progress(), new Date(2026, 6, 17, 15));

    expect(action).toMatchObject({ categoryId: "evening", index: 0, kind: "start" });
  });
});
