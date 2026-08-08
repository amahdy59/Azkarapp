import { afterEach, describe, expect, it, vi } from "vitest";
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
  { dayKey: "2024-02-01", category: "after_prayer", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-02", category: "travel", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "after_prayer", timeZone: "Africa/Cairo" },
  { dayKey: "2025-02-01", category: "morning", timeZone: "Africa/Cairo" },
];

describe("garden view selectors", () => {
  it("deduplicates categories and marks a palm only when all core collections are present", () => {
    const index = createDailyCompletionIndex(records);
    const days = getMonthGardenDays(index, 2024, 1);

    expect(days).toHaveLength(29);
    expect(days[0]).toMatchObject({ completedCount: 4, isPalm: true, status: "complete" });
    expect(days[1]).toMatchObject({ completedCount: 0, isPalm: false, status: "unstarted" });
  });

  it("scopes year totals and active days to the requested year", () => {
    const stats = getYearGardenStats(createDailyCompletionIndex(records), 2024);

    expect(stats).toEqual({ totalPalms: 2, totalCollections: 8, activeDays: 2 });
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

  it("returns neutral empty-state selectors instead of inventing a best period", () => {
    const index = createDailyCompletionIndex([]);

    expect(getWeekGardenStats(index, new Date(2024, 1, 3), "en")).toMatchObject({
      bestRoutine: null,
      mostMissedRoutine: null,
      completedDaysCount: 0,
      bestStreakDays: 0,
    });
    expect(getMonthDetailedStats(index, 2024, 1)).toMatchObject({
      bestRoutine: null,
      fullDaysCount: 0,
      completionRate: 0,
      longestStreak: 0,
    });
    expect(getYearDetailedStats(index, 2024)).toMatchObject({
      bestMonthIndex: null,
      mostConsistentRoutine: null,
      totalCollections: 0,
      overallCompletionRate: 0,
    });
  });

  it("counts all four main routines while excluding unrelated collections", () => {
    const mixedRecords: DailyCollectionCompletion[] = [
      { dayKey: "2024-03-01", category: "after_prayer", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-01", category: "travel", timeZone: "Africa/Cairo" },
    ];
    const index = createDailyCompletionIndex(mixedRecords);

    expect(getWeekGardenStats(index, new Date(2024, 2, 1), "ar").bestRoutine).toBe("after_prayer");
    expect(getMonthGardenDays(index, 2024, 2)[0]).toMatchObject({ completedCount: 1, status: "partial" });
    expect(getMonthDetailedStats(index, 2024, 2).bestRoutine).toBe("after_prayer");
    expect(getYearGardenStats(index, 2024)).toEqual({ totalPalms: 0, totalCollections: 1, activeDays: 1 });
    expect(getYearDetailedStats(index, 2024).mostConsistentRoutine).toBe("after_prayer");
  });

  it("does not let future dates reset the current-year streak", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 3, 12));
    const streakRecords: DailyCollectionCompletion[] = [];
    for (const dayKey of ["2026-03-02", "2026-03-03"]) {
      for (const category of ["morning", "evening", "before_sleep", "after_prayer"] as const) {
        streakRecords.push({ dayKey, category, timeZone: "Africa/Cairo" });
      }
    }

    expect(getYearDetailedStats(createDailyCompletionIndex(streakRecords), 2026).currentStreak).toBe(2);
  });

  it("handles English locale, perfect week, and streak tracking in weekly stats", () => {
    // Test English locale
    const index = createDailyCompletionIndex(records);
    const enWeekStats = getWeekGardenStats(index, new Date(2024, 1, 1), "en");
    expect(enWeekStats.days).toHaveLength(7);

    // Perfect week (all 7 days complete all 4 categories)
    const perfectWeekRecords: DailyCollectionCompletion[] = [];
    for (let i = 0; i < 7; i++) {
      const dayKey = `2024-02-0${i + 3}`; // Feb 3 to 9 (starts Sat)
      perfectWeekRecords.push(
        { dayKey, category: "morning", timeZone: "Africa/Cairo" },
        { dayKey, category: "evening", timeZone: "Africa/Cairo" },
        { dayKey, category: "before_sleep", timeZone: "Africa/Cairo" },
        { dayKey, category: "after_prayer", timeZone: "Africa/Cairo" },
      );
    }
    const perfectIndex = createDailyCompletionIndex(perfectWeekRecords);
    const perfectStats = getWeekGardenStats(perfectIndex, new Date(2024, 1, 3), "ar");
    expect(perfectStats.mostMissedRoutine).toBeNull();
    expect(perfectStats.bestStreakDays).toBe(7);

    // Broken streak followed by smaller streak (2 days, 1 miss, 1 day)
    const brokenStreakRecords: DailyCollectionCompletion[] = [
      { dayKey: "2024-02-03", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-03", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-03", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-03", category: "after_prayer", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-04", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-04", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-04", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-04", category: "after_prayer", timeZone: "Africa/Cairo" },
      // Feb 5 missed
      { dayKey: "2024-02-06", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-06", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-06", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-06", category: "after_prayer", timeZone: "Africa/Cairo" },
    ];
    const brokenIndex = createDailyCompletionIndex(brokenStreakRecords);
    const brokenStats = getWeekGardenStats(brokenIndex, new Date(2024, 1, 3), "ar");
    expect(brokenStats.bestStreakDays).toBe(2);
  });
});

afterEach(() => {
  vi.useRealTimers();
});
