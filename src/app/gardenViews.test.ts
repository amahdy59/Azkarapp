import { describe, expect, it } from "vitest";
import { createDailyCompletionIndex, getMonthGardenDays, getYearGardenStats } from "./gardenViews";
import type { DailyCollectionCompletion } from "./types";

const records: DailyCollectionCompletion[] = [
  { dayKey: "2024-02-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-02", category: "travel", timeZone: "Africa/Cairo" },
  { dayKey: "2025-02-01", category: "morning", timeZone: "Africa/Cairo" },
];

describe("garden view selectors", () => {
  it("deduplicates categories and marks a palm only when all core collections are present", () => {
    const index = createDailyCompletionIndex(records);
    const days = getMonthGardenDays(index, 2024, 1);

    expect(days).toHaveLength(29);
    expect(days[0]).toMatchObject({ completedCount: 3, isPalm: true });
    expect(days[1]).toMatchObject({ completedCount: 1, isPalm: false });
  });

  it("scopes year totals and active days to the requested year", () => {
    const stats = getYearGardenStats(createDailyCompletionIndex(records), 2024);

    expect(stats).toEqual({ totalPalms: 1, totalCollections: 4, activeDays: 2 });
  });
});
