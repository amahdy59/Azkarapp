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

  it("uses the actual Gregorian month length", () => {
    expect(getReadingMonthDuration(new Date(2028, 1, 10), "gregorian")).toBe(29);
    expect(getReadingMonthDuration(new Date(2026, 7, 10), "gregorian")).toBe(31);
  });

  it("uses an actual Umm al-Qura month length", () => {
    expect([29, 30]).toContain(getReadingMonthDuration(new Date(2026, 7, 24), "hijri"));
  });

  it("does not create a goal for free reading", () => {
    expect(getQuranWirdGoal({ kind: "free", dailyPages: 0 }, {}, "2026-08-24")).toEqual({
      dailyGoal: 0,
      expired: false,
      remainingPages: 604,
    });
  });
});
