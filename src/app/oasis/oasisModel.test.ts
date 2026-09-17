import { describe, it, expect } from "vitest";
import {
  calculateOasisLevel,
  OASIS_LEVEL_DETAILS,
  getPresetOasisState,
  deriveOasisRoutinesFromCompletions,
} from "./oasisModel";
import type { DailyCollectionCompletion } from "../types";

describe("oasisModel", () => {
  it("calculates Level 0 when no activity has occurred", () => {
    const routines = {
      morning: false,
      evening: false,
      beforeSleep: false,
      afterPrayerCount: 0,
      extraCategoriesCount: 0,
    };
    const habits = {
      quranWird: false,
      mosquePrayers: null,
      active: false,
    };
    expect(calculateOasisLevel(routines, habits)).toBe(0);
  });

  it("calculates Level 1 for situational or single habit activity", () => {
    const routines = {
      morning: false,
      evening: false,
      beforeSleep: false,
      afterPrayerCount: 0,
      extraCategoriesCount: 1, // e.g. food azkar
    };
    const habits = {
      quranWird: false,
      mosquePrayers: null,
      active: false,
    };
    expect(calculateOasisLevel(routines, habits)).toBe(1);

    // Or just after-prayer without core
    expect(calculateOasisLevel({ ...routines, extraCategoriesCount: 0, afterPrayerCount: 1 }, habits)).toBe(1);

    // Or just habit active
    expect(calculateOasisLevel({ ...routines, extraCategoriesCount: 0 }, { ...habits, active: true })).toBe(1);
  });

  it("calculates Level 2 for at least 1 core routine (Seedling)", () => {
    const habits = { quranWird: false, mosquePrayers: null };

    // Morning only
    expect(
      calculateOasisLevel(
        { morning: true, evening: false, beforeSleep: false, afterPrayerCount: 0, extraCategoriesCount: 0 },
        habits,
      ),
    ).toBe(2);

    // Evening only
    expect(
      calculateOasisLevel(
        { morning: false, evening: true, beforeSleep: false, afterPrayerCount: 0, extraCategoriesCount: 0 },
        habits,
      ),
    ).toBe(2);

    // Sleep only
    expect(
      calculateOasisLevel(
        { morning: false, evening: false, beforeSleep: true, afterPrayerCount: 0, extraCategoriesCount: 0 },
        habits,
      ),
    ).toBe(2);
  });

  it("calculates Level 3 for Morning + Evening (Branch)", () => {
    const habits = { quranWird: false, mosquePrayers: null };
    expect(
      calculateOasisLevel(
        { morning: true, evening: true, beforeSleep: false, afterPrayerCount: 0, extraCategoriesCount: 0 },
        habits,
      ),
    ).toBe(3);
  });

  it("calculates Level 4 for Morning + Evening + Before Sleep (Full Palm)", () => {
    const habits = { quranWird: false, mosquePrayers: null };
    expect(
      calculateOasisLevel(
        { morning: true, evening: true, beforeSleep: true, afterPrayerCount: 0, extraCategoriesCount: 0 },
        habits,
      ),
    ).toBe(4);
  });

  it("requires all 5 pillars for Level 5 (Oasis)", () => {
    const coreRoutines = {
      morning: true,
      evening: true,
      beforeSleep: true,
      afterPrayerCount: 5,
      extraCategoriesCount: 0,
    };

    // Missing mosque prayers -> Level 4
    expect(calculateOasisLevel(coreRoutines, { quranWird: true, mosquePrayers: null })).toBe(4);

    // Missing quran wird -> Level 4
    expect(calculateOasisLevel(coreRoutines, { quranWird: false, mosquePrayers: "mosque_3" })).toBe(4);

    // Only 4 after-prayers -> Level 4
    expect(
      calculateOasisLevel({ ...coreRoutines, afterPrayerCount: 4 }, { quranWird: true, mosquePrayers: "mosque_5" }),
    ).toBe(4);

    // All present -> Level 5!
    expect(calculateOasisLevel(coreRoutines, { quranWird: true, mosquePrayers: "mosque_3" })).toBe(5);

    expect(calculateOasisLevel(coreRoutines, { quranWird: true, mosquePrayers: "mosque_5" })).toBe(5);
  });

  it("provides complete metadata and descriptions for all 6 levels", () => {
    for (let level = 0; level <= 5; level += 1) {
      const detail = OASIS_LEVEL_DETAILS[level as 0 | 1 | 2 | 3 | 4 | 5];
      expect(detail).toBeDefined();
      expect(detail.name).toBeTruthy();
      expect(detail.nameArabic).toBeTruthy();
      expect(detail.description).toBeTruthy();
      expect(detail.descriptionArabic).toBeTruthy();
    }
  });

  it("derives routines correctly from daily completions", () => {
    const records: DailyCollectionCompletion[] = [
      { dayKey: "2026-09-17", category: "morning", timeZone: "UTC" },
      { dayKey: "2026-09-17", category: "after_prayer", subCategory: "fajr", timeZone: "UTC" },
      { dayKey: "2026-09-17", category: "after_prayer", subCategory: "dhuhr", timeZone: "UTC" },
      { dayKey: "2026-09-17", category: "food_drink", timeZone: "UTC" },
      { dayKey: "2026-09-16", category: "evening", timeZone: "UTC" }, // yesterday
    ];

    const result = deriveOasisRoutinesFromCompletions(records, "2026-09-17");
    expect(result.morning).toBe(true);
    expect(result.evening).toBe(false);
    expect(result.beforeSleep).toBe(false);
    expect(result.afterPrayerCount).toBe(2);
    expect(result.extraCategoriesCount).toBe(1);
  });

  it("presets produce the exact target levels", () => {
    for (let level = 0; level <= 5; level += 1) {
      const { routines, habits } = getPresetOasisState(level as 0 | 1 | 2 | 3 | 4 | 5);
      expect(calculateOasisLevel(routines, habits)).toBe(level);
    }
  });
});
