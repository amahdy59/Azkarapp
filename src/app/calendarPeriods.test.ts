import { describe, expect, it } from "vitest";
import { getCalendarMonthPeriod, getCalendarYearPeriods, shiftCalendarDate } from "./calendarPeriods";
import { createDailyCompletionIndex, getMonthDetailedStatsForDates } from "./gardenViews";

describe("calendar periods", () => {
  it("builds a real Umm al-Qura month around the reference date", () => {
    const reference = new Date(2026, 7, 14, 12);
    const period = getCalendarMonthPeriod(reference, "hijri", "en");

    expect(period.dates.length).toBeGreaterThanOrEqual(29);
    expect(period.dates.length).toBeLessThanOrEqual(30);
    expect(period.dayNumbers[0]).toBe(1);
    expect(period.dates.some((date) => date.toDateString() === reference.toDateString())).toBe(true);
  });

  it("does not relabel records from a different Gregorian period as current Hijri progress", () => {
    const reference = new Date(2026, 7, 14, 12);
    const period = getCalendarMonthPeriod(reference, "hijri", "en");
    const index = createDailyCompletionIndex([
      { dayKey: "2026-02-15", category: "morning", timeZone: "Africa/Cairo", completionLevel: "complete" },
    ]);

    const stats = getMonthDetailedStatsForDates(index, period.dates, period.dayNumbers);
    expect(stats.totalActiveDays).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  it("navigates Hijri months and years without falling back to Gregorian indexes", () => {
    const reference = new Date(2026, 7, 14, 12);
    const current = getCalendarMonthPeriod(reference, "hijri", "en");
    const next = getCalendarMonthPeriod(shiftCalendarDate(reference, "month", 1, "hijri"), "hijri", "en");
    const year = getCalendarYearPeriods(reference, "hijri", "en");

    expect(next.startDate.getTime()).toBeGreaterThan(current.endDate.getTime());
    expect(year).toHaveLength(12);
    expect(new Set(year.map((period) => period.startDate.getTime())).size).toBe(12);
  });
});
