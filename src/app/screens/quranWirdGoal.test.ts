import { describe, expect, it } from "vitest";
import { effectiveDailyGoal, getQuranWirdGoal, getReadingMonthDuration } from "./quranWirdGoal";
import type { QuranWirdPlan } from "../types";

const plan: QuranWirdPlan = {
  kind: "custom",
  dailyPages: 11,
  durationDays: 30,
  startedDayKey: "2026-08-24",
  startPage: 300,
  targetPage: 604,
};

describe("Quran Wird goal calculation", () => {
  it("uses the actual starting range", () => {
    expect(effectiveDailyGoal(plan, {}, "2026-08-24")).toBe(11);
  });

  it("treats an older plan without a stored range as the full 604-page Mushaf", () => {
    expect(
      getQuranWirdGoal(
        { kind: "custom", dailyPages: 21, durationDays: 30, startedDayKey: "2026-08-24" },
        {},
        "2026-08-24",
      ).remainingPages,
    ).toBe(604);
  });

  it("counts only pages inside the plan range", () => {
    expect(effectiveDailyGoal(plan, { "2026-08-24": [2, 3, 301, 302] }, "2026-08-24")).toBe(11);
  });

  it("reports an expired plan explicitly", () => {
    expect(getQuranWirdGoal(plan, {}, "2026-09-23")).toEqual({
      dailyGoal: 0,
      expired: true,
      remainingPages: 305,
    });
  });

  it("is deterministic for a supplied devotional day key", () => {
    expect(effectiveDailyGoal(plan, {}, "2026-08-25")).toBe(11);
  });

  it("uses the days remaining in the current Gregorian month", () => {
    expect(getReadingMonthDuration(new Date(2028, 1, 10), "gregorian")).toBe(20);
    expect(getReadingMonthDuration(new Date(2026, 7, 10), "gregorian")).toBe(22);
  });

  it("ends at the actual Umm al-Qura month boundary", () => {
    const start = new Date(2026, 7, 24, 12);
    const remaining = getReadingMonthDuration(start, "hijri");
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { month: "numeric" });
    const lastDay = new Date(start);
    lastDay.setDate(lastDay.getDate() + remaining - 1);
    const nextMonth = new Date(start);
    nextMonth.setDate(nextMonth.getDate() + remaining);

    expect(formatter.format(lastDay)).toBe(formatter.format(start));
    expect(formatter.format(nextMonth)).not.toBe(formatter.format(start));
  });

  it("does not create a goal for free reading", () => {
    expect(getQuranWirdGoal({ kind: "free", dailyPages: 0 }, {}, "2026-08-24")).toEqual({
      dailyGoal: 0,
      expired: false,
      remainingPages: 604,
    });
  });

  describe("repeating plan", () => {
    const repeatingPlan: QuranWirdPlan = {
      kind: "repeating",
      dailyPages: 20,
      repeatStartPage: 1,
      repeatEndPage: 20,
      repeatScope: "juz",
      repeatNumber: 1,
      startedDayKey: "2026-09-01",
    };

    it("calculates daily goal as the total pages in the repeating range", () => {
      const result = getQuranWirdGoal(repeatingPlan, {}, "2026-09-27");
      expect(result.dailyGoal).toBe(20);
      expect(result.expired).toBe(false);
      expect(result.remainingPages).toBe(20);
    });

    it("tracks only pages read within the defined repeating range today", () => {
      const history = {
        // Yesterday's reading has no effect on today's wird completion
        "2026-09-26": [1, 2, 3, 4, 5],
        // Today read 5 pages in range, and 2 pages outside range (e.g. 50, 51)
        "2026-09-27": [1, 2, 3, 4, 5, 50, 51],
      };
      const progress = getQuranWirdGoal(repeatingPlan, history, "2026-09-27");
      expect(progress.dailyGoal).toBe(20);
      expect(progress.remainingPages).toBe(15);
    });

    it("marks completion when 100% of pages in the repeating range are read today", () => {
      const fullJuzPages = Array.from({ length: 20 }, (_, i) => i + 1);
      const history = {
        "2026-09-27": fullJuzPages,
      };
      const result = getQuranWirdGoal(repeatingPlan, history, "2026-09-27");
      expect(result.remainingPages).toBe(0);
    });
  });
});
