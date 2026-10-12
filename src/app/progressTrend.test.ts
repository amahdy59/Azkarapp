import { describe, expect, it } from "vitest";
import { buildProgressTrend } from "./progressTrend";
import { getCalendarMonthPeriod, getCalendarYearPeriods } from "./calendarPeriods";
import type { DailyCollectionCompletion } from "./types";

const record = (dayKey: string, category: DailyCollectionCompletion["category"]): DailyCollectionCompletion => ({
  dayKey,
  category,
  timeZone: "Africa/Cairo",
});
describe("recorded routine trends", () => {
  it("deduplicates routines, excludes other practices and future records, and includes today", () => {
    const period = getCalendarMonthPeriod(new Date(2026, 0, 2, 12), "gregorian", "en");
    const [point] = buildProgressTrend(
      [
        record("2026-01-01", "morning"),
        record("2026-01-01", "morning"),
        record("2026-01-01", "evening"),
        record("2026-01-01", "before_sleep"),
        record("2026-01-01", "after_prayer"),
        record("2026-01-03", "morning"),
      ],
      [{ label: "January", dates: period.dates }],
      new Date(2026, 0, 2, 12),
    );
    expect(point).toMatchObject({ completed: 3, possible: 6, rate: 50, partial: true });
  });
  it("uses the configured progress boundary rather than the clock's calendar day", () => {
    const periods = getCalendarYearPeriods(new Date(2026, 1, 1, 1), "gregorian", "en");
    const points = buildProgressTrend(
      [record("2026-02-01", "morning")],
      periods.map((p) => ({ label: p.monthLabel, dates: p.dates })),
      new Date(2026, 1, 1, 1),
      3,
    );
    expect(points[0]).toMatchObject({ possible: 93, partial: false });
    expect(points[1]).toMatchObject({ possible: 0, completed: 0, rate: null, partial: false });
  });
  it("counts leap-year and Hijri elapsed days without assuming month lengths", () => {
    for (const calendar of ["gregorian", "hijri"] as const) {
      const period = getCalendarMonthPeriod(new Date(2024, 1, 20, 12), calendar, "ar");
      const [point] = buildProgressTrend(
        [],
        [{ label: period.monthLabel, dates: period.dates }],
        new Date(2025, 0, 1, 12),
      );
      expect(point?.possible).toBe(period.dates.length * 3);
      expect(point?.rate).toBe(0);
      if (calendar === "gregorian") expect(period.dates).toHaveLength(29);
    }
  });
  it("keeps future and empty buckets unavailable and completed historical buckets at 100%", () => {
    const dates = [new Date(2026, 0, 1, 12)];
    const points = buildProgressTrend(
      [record("2026-01-01", "morning"), record("2026-01-01", "evening"), record("2026-01-01", "before_sleep")],
      [
        { label: "Past", dates },
        { label: "Future", dates: [new Date(2027, 0, 1, 12)] },
        { label: "Empty", dates: [] },
      ],
      new Date(2026, 0, 2, 12),
    );
    expect(points.map((p) => p.rate)).toEqual([100, null, null]);
    expect(points[0]?.partial).toBe(false);
  });
});
