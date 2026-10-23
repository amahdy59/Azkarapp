import { describe, expect, it } from "vitest";
import { getProgressDayKey } from "./progress";
import {
  dashboardProgressBuckets,
  exportProgressDashboard,
  scopeProgressDailyRecords,
  dashboardProgressTimeline,
  indexProgressDashboard,
  matchedDashboardRanges,
  metricProgressRange,
  progressPresetRange,
  progressRangeDays,
  summarizeProgressMetric,
  validateProgressRange,
  type ProgressDashboardInput,
} from "./progressDashboard";

const now = new Date(2026, 9, 20, 2, 30);
const range = { startKey: "2026-10-18", endKey: "2026-10-20" };
const empty: ProgressDashboardInput = {
  dailyCompletions: [],
  prayerTracking: [],
  dailyHabits: [],
  wirdHistory: {},
  quranWirdDailyGoals: {},
};
describe("focused Progress range and independent facts", () => {
  it("respects an explicit no-goal day rather than replacing it with a current plan", () => {
    const rows = indexProgressDashboard(
      {
        ...empty,
        quranWirdPlan: { kind: "daily", dailyPages: 4 },
        quranWirdDailyGoals: { "2026-10-19": 0 },
        wirdHistory: { "2026-10-19": [1, 2, 3, 4] },
      },
      "2026-10-19",
    );
    expect(rows[0]).toMatchObject({ quranGoal: null, quranGoals: null, pages: 4 });
  });
  it("exports the full selected scope with reconciled totals and explicit civil/devotional windows", () => {
    const data: ProgressDashboardInput = {
      ...empty,
      dailyCompletions: [
        { dayKey: "2026-10-19", category: "morning", timeZone: "Africa/Cairo" },
        { dayKey: "2026-10-20", category: "morning", timeZone: "Africa/Cairo" },
      ],
      prayerTracking: [{ dayKey: "2026-10-20", prayer: "fajr", location: "home", adhkar: true }],
      wirdHistory: { "2026-10-19": [1, 1, 2], "2026-10-20": [3] },
      quranWirdDailyGoals: { "2026-10-19": 2, "2026-10-20": 2 },
    };
    const facts = indexProgressDashboard(data, "2026-10-19");
    const selected = { startKey: "2026-10-20", endKey: "2026-10-20" };
    const result = exportProgressDashboard(data, facts, selected, now, 3, true, "hijri");
    expect(result.metrics.prayers).toMatchObject({ count: 1, possible: 5 });
    expect(result.metrics.pages).toMatchObject({ count: 2, possible: null });
    expect(result.records.dailyCompletions.map((row) => row.dayKey)).toEqual(["2026-10-19"]);
    expect(Object.keys(result.records.wirdHistory)).toEqual(["2026-10-19"]);
    expect(Object.keys(result.records.quranWirdDailyGoals)).toEqual(["2026-10-19"]);
    expect(result.dailyRecords.map((row) => [row.dayKey, row.prayers, row.pages, row.quranGoal])).toEqual([
      ["2026-10-19", null, 2, 2],
      ["2026-10-20", 1, null, null],
    ]);
    expect(result.dailyRecords.reduce((sum, row) => sum + (row.pages ?? 0), 0)).toBe(result.metrics.pages.count);
    expect(result.definitions.missingRecordsAreNotMissedWorship).toBe(true);
  });
  it("does not expose future or unrelated sparse rows, or pretend out-of-window values are zero", () => {
    const facts = indexProgressDashboard(
      { ...empty, wirdHistory: { "2026-10-17": [1], "2026-10-18": [2], "2026-10-21": [3] } },
      "2026-10-19",
    );
    const selected = scopeProgressDailyRecords(facts, range, now, 3, false);
    expect(selected.map((row) => row.dayKey)).toEqual(["2026-10-18"]);
    expect(selected[0].pages).toBe(1);
  });
  it("validates actual leap dates, order and future dates before applying", () => {
    expect(validateProgressRange({ startKey: "2024-02-29", endKey: "2024-02-29" }, "2026-10-20")).toBeNull();
    expect(validateProgressRange({ startKey: "2026-02-29", endKey: "2026-03-01" }, "2026-10-20")).toBe("invalid");
    expect(validateProgressRange({ startKey: "2026-10-20", endKey: "2026-10-19" }, "2026-10-20")).toBe("reversed");
    expect(validateProgressRange({ startKey: "2026-10-20", endKey: "2026-10-21" }, "2026-10-20")).toBe("future");
    expect(progressRangeDays({ startKey: "2026-04-23", endKey: "2026-04-25" })).toBe(3);
  });
  it("preserves Saturday Arabic and Sunday English week boundaries", () => {
    expect(progressPresetRange("week", now, "ar", "gregorian")).toEqual({
      startKey: "2026-10-17",
      endKey: "2026-10-23",
    });
    expect(progressPresetRange("week", now, "en", "gregorian")).toEqual({
      startKey: "2026-10-18",
      endKey: "2026-10-24",
    });
  });
  it("resolves actual Hijri months and excludes future parts from the metric window", () => {
    const hijri = progressPresetRange("month", now, "ar", "hijri");
    expect([29, 30]).toContain(progressRangeDays(hijri));
    const clipped = metricProgressRange(hijri, "prayers", now, 3);
    expect(clipped.endKey).toBe("2026-10-20");
    const buckets = dashboardProgressBuckets(clipped, "month", now, "ar", "hijri");
    expect(buckets.reduce((sum, row) => sum + row.days, 0)).toBe(progressRangeDays(clipped));
    expect(buckets.at(-1)?.endKey).toBe("2026-10-20");
  });
  it("separates civil prayer dates from devotional dates and complete-day trends at 03:00", () => {
    expect(metricProgressRange(range, "prayers", now, 3).endKey).toBe("2026-10-20");
    expect(metricProgressRange(range, "routines", now, 3).endKey).toBe("2026-10-19");
    expect(metricProgressRange(range, "prayers", now, 3, true).endKey).toBe("2026-10-19");
    expect(metricProgressRange(range, "routines", now, 3, true).endKey).toBe("2026-10-18");
    const day = { startKey: "2026-10-20", endKey: "2026-10-20" };
    expect(metricProgressRange(day, "pages", now, 3, false, true)).toEqual({
      startKey: "2026-10-19",
      endKey: "2026-10-19",
    });
    expect(metricProgressRange(day, "routines", new Date(2026, 9, 20, 3), 3, false, true)).toEqual(day);
  });
  it("deduplicates records and pages without counting independent practices as prayer or routines", () => {
    const row = { dayKey: "2026-10-18", category: "morning" as const, timeZone: "Africa/Cairo" };
    const facts = indexProgressDashboard(
      {
        ...empty,
        dailyCompletions: [row, row, { ...row, category: "evening" }],
        prayerTracking: [
          { dayKey: row.dayKey, prayer: "fajr", location: "home", adhkar: true },
          { dayKey: row.dayKey, prayer: "fajr", location: "home", adhkar: true },
          { dayKey: row.dayKey, prayer: "asr", sunnah: true, adhkar: true },
        ],
        wirdHistory: { [row.dayKey]: [1, 1, 2, 0, 605] },
      },
      "2026-10-19",
    );
    expect(facts[0]).toMatchObject({ prayers: 1, adhkar: 2, rawatib: 0, routines: 2, pages: 2, quranGoals: null });
    expect(summarizeProgressMetric(facts, range, "prayers")).toMatchObject({ count: 1, possible: 15 });
    expect(summarizeProgressMetric(facts, range, "rawatib").possible).toBe(12);
    expect(summarizeProgressMetric(facts, range, "routines").possible).toBe(9);
    expect(summarizeProgressMetric(facts, range, "pages").possible).toBeNull();
  });
  it("does not apply a new plan retrospectively or invent goals for free reading", () => {
    const facts = indexProgressDashboard(
      {
        ...empty,
        quranWirdPlan: { kind: "daily", dailyPages: 2 },
        wirdHistory: { "2026-10-18": [1, 2], "2026-10-19": [1] },
      },
      "2026-10-19",
    );
    expect(facts[0].quranGoals).toBeNull();
    expect(facts[1].quranGoals).toBe(0);
    expect(summarizeProgressMetric(facts, range, "quranGoals")).toMatchObject({ count: 0, possible: 1 });
    const free = indexProgressDashboard(
      { ...empty, quranWirdPlan: { kind: "free", dailyPages: 0 }, wirdHistory: { "2026-10-19": [2] } },
      "2026-10-19",
    );
    expect(free[0]).toMatchObject({ pages: 1, quranGoals: null });
  });
  it("retains recorded targets and explicit manual completion; repeating today counts only selected pages", () => {
    const facts = indexProgressDashboard(
      {
        ...empty,
        quranWirdPlan: { kind: "repeating", dailyPages: 2, repeatStartPage: 10, repeatEndPage: 11 },
        wirdHistory: { "2026-10-18": [1, 2], "2026-10-19": [1, 2, 10] },
        quranWirdDailyGoals: { "2026-10-18": 2 },
        dailyHabits: [{ dayKey: "2026-10-17", habit: "quran_wird" }],
      },
      "2026-10-19",
    );
    expect(facts.map((row) => [row.dayKey, row.quranGoals])).toEqual([
      ["2026-10-17", 1],
      ["2026-10-18", 1],
      ["2026-10-19", 0],
    ]);
    expect(facts.at(-1)?.pages).toBe(3);
  });
  it("bounds long Custom plots and reconciles every point with the same exact summary", () => {
    const custom = { startKey: "2020-01-01", endKey: "2026-10-19" };
    const facts = indexProgressDashboard({ ...empty, wirdHistory: { "2026-10-18": [1, 2] } }, "2026-10-19");
    const points = dashboardProgressTimeline(facts, custom, "pages", "custom", now, "en", "gregorian");
    expect(points.length).toBeLessThanOrEqual(24);
    expect(points.reduce((sum, point) => sum + point.days, 0)).toBe(progressRangeDays(custom));
    expect(points.reduce((sum, point) => sum + point.recorded, 0)).toBe(
      summarizeProgressMetric(facts, custom, "pages").count,
    );
  });
  it("uses equal complete-day samples for month lengths and contiguous Custom comparisons", () => {
    expect(
      matchedDashboardRanges(
        { startKey: "2026-03-01", endKey: "2026-03-31" },
        "month",
        new Date(2026, 2, 31),
        "en",
        "gregorian",
      ),
    ).toEqual({
      days: 28,
      current: { startKey: "2026-03-01", endKey: "2026-03-28" },
      previous: { startKey: "2026-02-01", endKey: "2026-02-28" },
    });
    const match = matchedDashboardRanges(range, "custom", now, "en", "gregorian");
    expect(match.previous).toEqual({ startKey: "2026-10-15", endKey: "2026-10-17" });
    expect(progressRangeDays(match.previous)).toBe(match.days);
  });
  it("keeps actual Hijri year buckets with no padded future month values", () => {
    const year = progressPresetRange("year", now, "ar", "hijri");
    const clipped = { ...year, endKey: getProgressDayKey(now, 0) };
    const buckets = dashboardProgressBuckets(clipped, "year", now, "ar", "hijri");
    expect(buckets.length).toBeLessThanOrEqual(12);
    expect(buckets.at(-1)?.endKey).toBe(clipped.endKey);
    expect(buckets.reduce((sum, row) => sum + row.days, 0)).toBe(progressRangeDays(clipped));
    expect(buckets.at(-1)?.partial).toBe(true);
  });
});
