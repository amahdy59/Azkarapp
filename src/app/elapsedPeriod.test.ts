import { describe, expect, it } from "vitest";
import { getElapsedPeriod } from "./elapsedPeriod";
import { getPeriodRange } from "./calendarPeriods";

describe("elapsed recording periods", () => {
  it("includes elapsed unrecorded days and excludes future days", () => {
    expect(getElapsedPeriod("2026-01-01", "2026-12-31", new Date(2026, 0, 30, 12))).toEqual({
      startKey: "2026-01-01",
      endKey: "2026-01-30",
      days: 30,
    });
  });
  it("preserves historical leap years and returns zero for future periods", () => {
    expect(getElapsedPeriod("2024-01-01", "2024-12-31", new Date(2026, 0, 30)).days).toBe(366);
    expect(getElapsedPeriod("2027-01-01", "2027-12-31", new Date(2026, 0, 30)).days).toBe(0);
  });
  it("counts date boundaries rather than DST-dependent elapsed hours", () => {
    expect(getElapsedPeriod("2026-04-23", "2026-04-26", new Date(2026, 3, 26, 12)).days).toBe(4);
  });
  it("retains Hijri boundaries instead of assuming 365 days", () => {
    const now = new Date(2026, 0, 30, 12);
    const period = getPeriodRange("year", now, "ar", "hijri");
    const elapsed = getElapsedPeriod(period.startKey, period.endKey, now);
    expect(elapsed.endKey).toBe("2026-01-30");
    expect(elapsed.startKey).toBe(period.startKey);
    expect(elapsed.days).toBeGreaterThan(30);
    expect(elapsed.days).toBeLessThan(355);
  });
});
