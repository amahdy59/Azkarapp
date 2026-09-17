import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDailyCompletionIndex,
  getMonthGardenDays,
  getMonthGardenDaysForDates,
  getYearGardenStats,
  getWeekGardenStats,
  getMonthDetailedStats,
  getMonthDetailedStatsForDates,
  getYearDetailedStats,
  getYearDetailedStatsForPeriods,
} from "./gardenViews";
import type { DailyCollectionCompletion } from "./types";

const records: DailyCollectionCompletion[] = [
  { dayKey: "2024-02-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "after_prayer", subCategory: "fajr", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-01", category: "after_prayer", subCategory: "dhuhr", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-02", category: "travel", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2024-02-03", category: "after_prayer", subCategory: "maghrib", timeZone: "Africa/Cairo" },
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

  it("marks days after today as empty rather than unstarted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 3, 12));
    const days = getMonthGardenDays(createDailyCompletionIndex([]), 2026, 2);

    expect(days).toHaveLength(31);
    // A day that has already passed with nothing recorded is a real miss, so it
    // stays "unstarted". A day that has not arrived yet cannot be missed, so it
    // reads as "empty" and the calendar does not present it as a failure.
    expect(days[1]).toMatchObject({ dayKey: "2026-03-02", status: "unstarted" });
    expect(days[2]).toMatchObject({ dayKey: "2026-03-03", status: "unstarted" });
    expect(days[3]).toMatchObject({ dayKey: "2026-03-04", status: "empty" });
    expect(days[30]).toMatchObject({ dayKey: "2026-03-31", status: "empty" });
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

  it("summarizes arbitrary calendar periods without leaking records across their date ranges", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 5, 12));
    const periodRecords: DailyCollectionCompletion[] = [
      { dayKey: "2024-03-01", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-01", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-01", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-01", category: "after_prayer", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-01", category: "travel", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-02", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-03", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-03", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-03", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-03-03", category: "after_prayer", timeZone: "Africa/Cairo" },
      { dayKey: "2024-04-01", category: "morning", timeZone: "Africa/Cairo" },
    ];
    const index = createDailyCompletionIndex(periodRecords);
    const dates = [new Date(2024, 2, 1), new Date(2024, 2, 2), new Date(2024, 2, 4), new Date(2024, 2, 6)];

    const defaultNumberedDays = getMonthGardenDaysForDates(index, dates);
    expect(defaultNumberedDays.map((day) => day.dayNum)).toEqual([1, 2, 4, 6]);
    expect(defaultNumberedDays.map((day) => day.status)).toEqual(["complete", "partial", "unstarted", "empty"]);

    const customNumberedDays = getMonthGardenDaysForDates(index, dates, [21, 22, 23]);
    expect(customNumberedDays.map((day) => day.dayNum)).toEqual([21, 22, 23, 4]);

    expect(getMonthDetailedStatsForDates(index, dates, [21, 22, 23, 24])).toMatchObject({
      daysInMonth: 4,
      fullDaysCount: 1,
      totalActiveDays: 2,
      bestRoutine: "evening",
    });
    expect(getMonthDetailedStatsForDates(index, [])).toMatchObject({
      daysInMonth: 0,
      completionRate: 0,
      bestRoutine: null,
    });

    const yearStats = getYearDetailedStatsForPeriods(index, [
      {
        dates: [new Date(2024, 2, 1), new Date(2024, 2, 2), new Date(2024, 2, 3), new Date(2024, 2, 6)],
        dayNumbers: [11, 12, 13, 14],
      },
      { dates: [] },
    ]);
    expect(yearStats).toMatchObject({
      totalPalms: 2,
      totalCollections: 9,
      activeDays: 3,
      longestStreak: 1,
      currentStreak: 1,
      bestMonthIndex: 0,
      mostConsistentRoutine: "evening",
    });
    expect(yearStats.months[0]?.dayCells).toEqual([
      { dayNum: 11, level: 2, isPalm: true },
      { dayNum: 12, level: 1, isPalm: false },
      { dayNum: 13, level: 2, isPalm: true },
      { dayNum: 14, level: 0, isPalm: false },
    ]);
    expect(yearStats.months[1]).toMatchObject({ completionRate: 0, dayCells: [] });

    expect(getYearDetailedStatsForPeriods(index, [])).toMatchObject({
      totalCollections: 0,
      overallCompletionRate: 0,
      bestMonthIndex: null,
      mostConsistentRoutine: null,
      months: [],
    });
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

  it("names the weakest and strongest routine when the week is uneven", () => {
    // Every other weekly fixture completes each routine the same number of
    // times, so the "is this routine weaker than the current lowest" comparison
    // never actually selects a new minimum. An uneven week is what proves
    // mostMissedRoutine tracks the genuinely weakest routine.
    // mostMissedRoutine tracks the genuinely weakest routine.
    const unevenRecords: DailyCollectionCompletion[] = [
      { dayKey: "2024-02-03", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-04", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-05", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-03", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-03", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-04", category: "before_sleep", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-03", category: "after_prayer", timeZone: "Africa/Cairo" },
      { dayKey: "2024-02-04", category: "after_prayer", timeZone: "Africa/Cairo" },
    ];
    // "ar" starts the week on Saturday, so Feb 3 2024 (a Saturday) opens the
    // window and all three fixture days fall inside it. Under "en" the same
    // reference date closes a Sunday-start week and only Feb 3 would count.
    const stats = getWeekGardenStats(createDailyCompletionIndex(unevenRecords), new Date(2024, 1, 3), "ar");

    expect(stats.mostMissedRoutine).toBe("evening");
    expect(stats.bestRoutine).toBe("morning");
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

  it("reports partial status for incomplete routines on the current day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 2, 12));
    const emptyIndex = createDailyCompletionIndex([]);
    const stats = getWeekGardenStats(emptyIndex, new Date(2024, 2, 2), "en");
    const today = stats.days.find((d) => d.isToday);
    expect(today?.eveningStatus).toBe("partial");
    expect(today?.sleepStatus).toBe("partial");
    expect(today?.afterPrayerStatus).toBe("partial");
  });
});

afterEach(() => {
  vi.useRealTimers();
});
