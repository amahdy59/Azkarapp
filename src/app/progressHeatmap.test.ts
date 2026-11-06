import { describe, expect, it } from "vitest";
import { progressHeatmapDay, progressHeatmapGrid } from "./progressHeatmap";
import {
  indexProgressDashboard,
  progressPresetRange,
  dashboardProgressBuckets,
  matchedDashboardRanges,
} from "./progressDashboard";

const range = { startKey: "2026-10-01", endKey: "2026-10-31" };
const window = { ...range, endKey: "2026-10-20" };
const rows = indexProgressDashboard(
  {
    dailyCompletions: [{ dayKey: "2026-10-15", category: "morning", timeZone: "Africa/Cairo" }],
    prayerTracking: [],
    dailyHabits: [],
    wirdHistory: { "2026-10-15": [1, 2, 3, 4, 5] },
    quranWirdDailyGoals: { "2026-10-15": 8 },
  },
  "2026-10-20",
);

describe("Progress heatmap and rolling dates", () => {
  it("keeps a rolling window inclusive across year, leap-day and DST boundaries in either calendar", () => {
    for (const end of ["2026-01-01", "2024-03-01", "2026-04-25", "2026-10-30"]) {
      const now = new Date(`${end}T12:00:00`);
      const selected = progressPresetRange("last30", now, "ar", "hijri");
      expect(selected.endKey).toBe(end);
      expect((Date.parse(selected.endKey) - Date.parse(selected.startKey)) / 86400000).toBe(29);
      const buckets = dashboardProgressBuckets(selected, "last30", now, "en", "gregorian");
      expect(buckets).toHaveLength(30);
      expect(buckets.every((bucket) => bucket.days === 1)).toBe(true);
      const comparison = matchedDashboardRanges(selected, "last30", now, "ar", "hijri");
      expect(comparison.days).toBe(30);
      expect(Date.parse(comparison.previous.endKey) + 86400000).toBe(Date.parse(selected.startKey));
    }
  });
  it("distinguishes saved counts, neutral absence, unknown goals, future and outside dates", () => {
    const row = rows.find((row) => row.dayKey === "2026-10-15")!;
    expect(progressHeatmapDay(row, row.dayKey, "routines", range, window)).toMatchObject({
      kind: "recorded",
      value: 1,
      possible: 3,
      level: 2,
    });
    expect(progressHeatmapDay(undefined, "2026-10-14", "prayers", range, window)).toMatchObject({
      kind: "none",
      value: 0,
      possible: 5,
    });
    expect(progressHeatmapDay(undefined, "2026-10-14", "pages", range, window)).toMatchObject({
      kind: "none",
      value: null,
    });
    expect(progressHeatmapDay(undefined, "2026-10-14", "quranGoals", range, window)).toMatchObject({
      kind: "unavailable",
      value: null,
    });
    expect(progressHeatmapDay(row, row.dayKey, "quranGoals", range, window)).toMatchObject({
      kind: "none",
      value: 0,
      possible: 1,
    });
    expect(progressHeatmapDay(undefined, "2026-10-21", "routines", range, window).kind).toBe("future");
    expect(progressHeatmapDay(undefined, "2026-09-30", "routines", range, window).kind).toBe("outside");
    expect(progressHeatmapDay(undefined, "2026-11-01", "routines", range, window).kind).toBe("outside");
    expect(progressHeatmapDay(row, row.dayKey, "routines", range, { ...window, startKey: "2026-10-16" }).kind).toBe(
      "unavailable",
    );
  });
  it("uses fixed page bands and bounded practice intensity without normalising to the selection", () => {
    const row = rows[0]!;
    expect(
      [0, 1, 4, 5, 10, 11, 20, 21, 604].map(
        (pages) => progressHeatmapDay({ ...row, pages }, row.dayKey, "pages", range, window).level,
      ),
    ).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(progressHeatmapDay({ ...row, prayers: 5 }, row.dayKey, "prayers", range, window).level).toBe(4);
  });
  it("pads actual weekday geometry, mirrors week starts and bounds a multi-year calendar to one month", () => {
    const rolling = { startKey: "2026-09-21", endKey: "2026-10-20" };
    const en = progressHeatmapGrid(rolling, rolling.endKey, "gregorian", "en");
    const ar = progressHeatmapGrid(rolling, rolling.endKey, "gregorian", "ar");
    expect(en.days[0]).toBe("2026-09-20");
    expect(ar.days[0]).toBe("2026-09-19");
    expect(en.days).toHaveLength(35);
    const long = progressHeatmapGrid({ startKey: "1900-01-01", endKey: "2026-10-20" }, "2026-10-15", "gregorian", "en");
    expect(long.long).toBe(true);
    expect(long.days.length).toBeLessThanOrEqual(42);
    expect(long.previous).toBe("2026-09-01");
    expect(long.next).toBe("2026-11-01");
    const hijri = progressHeatmapGrid(range, "2026-10-15", "hijri", "ar");
    expect(hijri.days.length).toBeLessThanOrEqual(42);
    expect(hijri.month.dates.length).toBeGreaterThanOrEqual(29);
  });
});
