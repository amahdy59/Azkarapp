import { describe, expect, it } from "vitest";
import {
  createDailyCompletionIndex,
  getMonthGardenDays,
  getYearGardenStats,
  getWeekGardenStats,
  getMonthDetailedStats,
  getYearDetailedStats,
} from "./gardenViews";
import type { DailyCollectionCompletion } from "./types";

const records: DailyCollectionCompletion[] = [
  { dayKey: "2024-02-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-02", category: "travel", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2025-02-01", category: "morning", timeZone: "Africa/Cairo" },
];

describe("garden view selectors", () => {
  it("deduplicates categories and marks a palm only when all core collections are present", () => {
    const index = createDailyCompletionIndex(records);
    const days = getMonthGardenDays(index, 2024, 1);

    expect(days).toHaveLength(29);
    expect(days[0]).toMatchObject({ completedCount: 3, isPalm: true, status: "complete" });
    expect(days[1]).toMatchObject({ completedCount: 1, isPalm: false, status: "partial" });
  });

  it("scopes year totals and active days to the requested year", () => {
    const stats = getYearGardenStats(createDailyCompletionIndex(records), 2024);

    expect(stats).toEqual({ totalPalms: 2, totalCollections: 7, activeDays: 3 });
  });

  it("calculates weekly commitment matrix and routine totals accurately", () => {
    const index = createDailyCompletionIndex(records);
    const weekStats = getWeekGardenStats(index, new Date(2024, 1, 1), "ar");

    expect(weekStats.days).toHaveLength(7);
    expect(weekStats.morningCompletedCount).toBeGreaterThanOrEqual(1);
    expect(weekStats.bestRoutine).toBeDefined();
  });

  it("calculates detailed monthly and yearly statistics", () => {
    const index = createDailyCompletionIndex(records);
    const monthStats = getMonthDetailedStats(index, 2024, 1);

    expect(monthStats.fullDaysCount).toBe(2);
    expect(monthStats.daysInMonth).toBe(29);
    expect(monthStats.completionRate).toBeGreaterThan(0);

    const yearStats = getYearDetailedStats(index, 2024);
    expect(yearStats.months).toHaveLength(12);
    expect(yearStats.totalPalms).toBe(2);
    expect(yearStats.bestMonthIndex).toBe(1); // Feb
  });

  it("correctly identifies evening or sleep as the best routine when dominant", () => {
    const eveningDominant: DailyCollectionCompletion[] = [
      { dayKey: "2024-03-01", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-02", category: "evening", timeZone: "Africa/Cairo" },
    ];
    const eveningIndex = createDailyCompletionIndex(eveningDominant);
    expect(getMonthDetailedStats(eveningIndex, 2024, 2).bestRoutine).toBe("evening");
    expect(getYearDetailedStats(eveningIndex, 2024).mostConsistentRoutine).toBe("evening");

    const sleepDominant: DailyCollectionCompletion[] = [
      { dayKey: "2024-03-01", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-02", category: "before_sleep", timeZone: "Africa/Cairo" },
    ];
    const sleepIndex = createDailyCompletionIndex(sleepDominant);
    expect(getMonthDetailedStats(sleepIndex, 2024, 2).bestRoutine).toBe("before_sleep");
    expect(getYearDetailedStats(sleepIndex, 2024).mostConsistentRoutine).toBe("before_sleep");
  });
});
