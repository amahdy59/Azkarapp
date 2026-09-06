import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPrayerAdjustments,
  calculateOfflinePrayerTimes,
  CALCULATION_METHODS,
  DEFAULT_LOCATION,
  detectUserCoordinates,
  formatUtcOffset,
  getPrayerTimes,
  getTimeZoneOffsetHours,
  getTimeZoneStatus,
  pruneExpiredPrayerTimes,
} from "./prayerCalculation";

describe("prayerCalculation", () => {
  const originalGeolocation = navigator.geolocation;

  it("keeps Arabic calculation-method labels as valid readable Unicode", () => {
    expect(Object.values(CALCULATION_METHODS).map((method) => method.nameArabic)).toEqual([
      "جامعة العلوم الإسلامية بكراتشي",
      "الجمعية الإسلامية لأمريكا الشمالية (ISNA)",
      "رابطة العالم الإسلامي",
      "جامعة أم القرى بمكة المكرمة",
      "الهيئة المصرية العامة للمساحة",
    ]);
    expect(Object.values(CALCULATION_METHODS).every((method) => !/[ØÙ]/.test(method.nameArabic))).toBe(true);
  });
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: originalGeolocation });
  });

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

  it("keeps high-latitude summer times in prayer order when twilight angles do not occur", () => {
    const times = calculateOfflinePrayerTimes(new Date(2026, 5, 21, 12), 51.5074, -0.1278, 5, "Europe/London");
    const minutes = (value: string) => {
      const [hours, mins] = value.split(":").map(Number);
      return hours! * 60 + mins!;
    };

    expect(minutes(times.fajr)).toBeLessThan(minutes(times.dhuhr));
    expect(minutes(times.dhuhr)).toBeLessThan(minutes(times.asr));
    expect(minutes(times.asr)).toBeLessThan(minutes(times.maghrib));
    expect(minutes(times.maghrib)).toBeLessThan(minutes(times.isha));
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

  it("clears what the old network path left behind, and nothing else", () => {
    /* Prayer times were fetched from a third party and cached under the
       reader's coordinates. Nothing writes that cache now, so what remains is a
       record of where someone was, kept for a service the app no longer uses. */
    const key = (date: string) => `azkarapp.prayer_times_cache.${date}_30.044_31.236_5`;
    window.localStorage.setItem(key("2026-01-10"), "{}");
    window.localStorage.setItem(key("2026-01-15"), "{}");
    window.localStorage.setItem("azkarapp.prayer_time_zone.30.044_31.236", "Africa/Cairo");
    window.localStorage.setItem("azkarapp.state.v1", "keep");
    window.localStorage.setItem("unrelated.product.key", "keep");

    pruneExpiredPrayerTimes(new Date(2026, 0, 15, 10, 0));

    // All of it goes, near dates included: none of it is used any more.
    expect(window.localStorage.getItem(key("2026-01-10"))).toBeNull();
    expect(window.localStorage.getItem(key("2026-01-15"))).toBeNull();
    expect(window.localStorage.getItem("azkarapp.prayer_time_zone.30.044_31.236")).toBeNull();
    // The reader's own data is not this function's business.
    expect(window.localStorage.getItem("azkarapp.state.v1")).toBe("keep");
    expect(window.localStorage.getItem("unrelated.product.key")).toBe("keep");
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

  it("distinguishes denied location permission for actionable recovery", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_success: PositionCallback, failure: PositionErrorCallback) =>
          failure({ code: 1 } as GeolocationPositionError),
        ),
      },
    });

    await expect(detectUserCoordinates()).resolves.toEqual({ ok: false, reason: "denied" });
  });

  it("returns detected coordinates and the device time zone", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({ coords: { latitude: 30.04, longitude: 31.24 } } as GeolocationPosition),
        ),
      },
    });

    await expect(detectUserCoordinates()).resolves.toMatchObject({
      ok: true,
      latitude: 30.04,
      longitude: 31.24,
    });
  });
});
