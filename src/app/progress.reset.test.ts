import { describe, expect, it } from "vitest";
import { resetStaleCompletedCollections } from "./progress";
import { getAzkarByCategory } from "./content/azkar";
import type { CategoryId, DailyCollectionCompletion } from "./types";

function fullSet(category: CategoryId) {
  return new Set(getAzkarByCategory(category).map((zikr) => zikr.id));
}

function completedRecord(partial: Partial<Record<CategoryId, Set<string>>>) {
  return partial as Record<CategoryId, Set<string>>;
}

describe("which clock resets a collection", () => {
  it("leaves Al-Kahf to the Friday cycle rather than the day boundary", () => {
    // Read on Friday, opened on Saturday. The daily boundary used to clear this
    // while FRIDAY_KAHF_WEEK_KEY still held Friday's cycle, so the app said the
    // Kahf was unread and the Friday progress said it had been opened — one act
    // with two clocks disagreeing about it.
    const saturday = new Date(2026, 8, 5, 9, 0);
    const reset = resetStaleCompletedCollections(
      completedRecord({ friday_kahf: fullSet("friday_kahf") }),
      [] as DailyCollectionCompletion[],
      saturday,
    );
    expect(reset.friday_kahf.size).toBe(fullSet("friday_kahf").size);
  });

  it("still clears an ordinary daily collection once its day has passed", () => {
    const today = new Date(2026, 8, 5, 9, 0);
    const reset = resetStaleCompletedCollections(
      completedRecord({ morning: fullSet("morning") }),
      [] as DailyCollectionCompletion[],
      today,
    );
    // The mechanism the exclusion must not disturb.
    expect(reset.morning.size).toBe(0);
  });
});
