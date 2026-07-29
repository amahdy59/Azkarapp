import { beforeEach, describe, expect, it } from "vitest";
import {
  applyPrayerAdjustments,
  calculateOfflinePrayerTimes,
  CALCULATION_METHODS,
  DEFAULT_LOCATION,
  formatUtcOffset,
  getPrayerTimes,
  getTimeZoneOffsetHours,
  getTimeZoneStatus,
  parseAladhanPrayerData,
  parseAladhanPrayerTimes,
} from "./prayerCalculation";

describe("prayerCalculation", () => {
  beforeEach(() => window.localStorage.clear());

  it("has Egyptian General Authority of Survey as method 5", () => {
    const egyptianMethod = CALCULATION_METHODS[5];
    expect(egyptianMethod).toBeDefined();
    expect(egyptianMethod?.nameEnglish).toContain("Egyptian");
    expect(egyptianMethod?.nameArabic).toContain("المصرية");
    expect(egyptianMethod?.fajrAngle).toBe(19.5);
    expect(egyptianMethod?.ishaAngle).toBe(17.5);
  });

  it("uses Egypt's IANA timezone rules for standard time and DST", () => {
    expect(getTimeZoneOffsetHours(new Date(2026, 0, 15), "Africa/Cairo")).toBe(2);
    expect(getTimeZoneOffsetHours(new Date(2026, 6, 29), "Africa/Cairo")).toBe(3);

    expect(getTimeZoneStatus(new Date(2026, 0, 15), "Africa/Cairo")).toMatchObject({
      currentOffsetHours: 2,
      standardOffsetHours: 2,
      observesDaylightSaving: true,
      daylightSavingActive: false,
    });
    expect(getTimeZoneStatus(new Date(2026, 6, 29), "Africa/Cairo")).toMatchObject({
      currentOffsetHours: 3,
      standardOffsetHours: 2,
      observesDaylightSaving: true,
      daylightSavingActive: true,
    });
    expect(formatUtcOffset(3)).toBe("UTC+03:00");
    expect(formatUtcOffset(-3.5)).toBe("UTC-03:30");
  });

  it("calculates accurate offline prayer times for Cairo in summer (DST)", () => {
    // Summer date in Cairo (July 29, 2026)
    const summerDate = new Date(2026, 6, 29, 12, 0); // Month is 0-indexed (6 = July)
    const times = calculateOfflinePrayerTimes(summerDate, 30.0444, 31.2357, 5, "Africa/Cairo");

    expect(times).toBeDefined();
    expect(times.fajr).toMatch(/^\d{2}:\d{2}$/);
    expect(times.dhuhr).toMatch(/^\d{2}:\d{2}$/);
    expect(times.asr).toMatch(/^\d{2}:\d{2}$/);
    expect(times.maghrib).toMatch(/^\d{2}:\d{2}$/);
    expect(times.isha).toMatch(/^\d{2}:\d{2}$/);

    // Verify reasonable time bounds for Cairo summer
    const fajrHour = parseInt(times.fajr.split(":")[0]!, 10);
    const maghribHour = parseInt(times.maghrib.split(":")[0]!, 10);

    expect(fajrHour).toBeGreaterThanOrEqual(3);
    expect(fajrHour).toBeLessThanOrEqual(5);

    expect(maghribHour).toBeGreaterThanOrEqual(18);
    expect(maghribHour).toBeLessThanOrEqual(20);
  });

  it("returns fallback offline prayer times when cache is empty", () => {
    const date = new Date(2026, 0, 15, 10, 0); // Jan 15, 2026
    const times = getPrayerTimes(date, DEFAULT_LOCATION);

    expect(times.fajr).toBeDefined();
    expect(times.dhuhr).toBeDefined();
    expect(times.asr).toBeDefined();
    expect(times.maghrib).toBeDefined();
    expect(times.isha).toBeDefined();
  });

  it("parses Aladhan timing values while removing timezone suffixes", () => {
    const payload = {
      data: {
        timings: {
          Fajr: "04:31 (EEST)",
          Dhuhr: "13:01 (EEST)",
          Asr: "16:38 (EEST)",
          Maghrib: "19:50 (EEST)",
          Isha: "21:20 (EEST)",
        },
        meta: { timezone: "Africa/Cairo" },
      },
    };
    const expectedTimes = {
      fajr: "04:31",
      dhuhr: "13:01",
      asr: "16:38",
      maghrib: "19:50",
      isha: "21:20",
    };

    expect(parseAladhanPrayerTimes(payload)).toEqual(expectedTimes);
    expect(parseAladhanPrayerData(payload)).toEqual({
      times: expectedTimes,
      timeZone: "Africa/Cairo",
    });
    expect(parseAladhanPrayerTimes({ data: { timings: { Fajr: "invalid" } } })).toBeNull();
  });

  it("applies per-prayer minute adjustments across midnight safely", () => {
    expect(
      applyPrayerAdjustments(
        { fajr: "00:05", dhuhr: "12:00", asr: "15:00", maghrib: "18:00", isha: "23:55" },
        { fajr: -10, isha: 10 },
      ),
    ).toEqual({
      fajr: "23:55",
      dhuhr: "12:00",
      asr: "15:00",
      maghrib: "18:00",
      isha: "00:05",
    });
  });
});
