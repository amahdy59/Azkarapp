import { describe, expect, it } from "vitest";
import { getPrayerTimeline } from "./prayerTimeline";
import { getEstimatedPrayerTimes } from "./content/prayerTimes";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { buildPrayerCardModels } from "./prayerCardModels";

describe("dated prayer interval", () => {
  it.each([
    new Date("2026-10-14T14:00:00+03:00"),
    new Date("2026-10-14T23:59:00+03:00"),
    new Date("2026-10-29T23:30:00+03:00"),
  ])("transfers only decorative emphasis in the final thirty minutes after %s", (seed) => {
    const { next } = getPrayerTimeline(seed, DEFAULT_LOCATION);
    const steps = [45, 30, 15, 1].map((minutes) => {
      const models = buildPrayerCardModels(new Date(next.at - minutes * 60_000), "en", DEFAULT_LOCATION);
      const current = models.find((model) => model.state === "current")!;
      const coming = models.find((model) => model.state === "next")!;
      expect(coming.prayer).toBe(next.prayer);
      expect(coming.time).toBe(next.time);
      expect(coming.isRecordable).toBe(false);
      expect(current.isRecordable).toBe(true);
      expect(
        models
          .filter((model) => model.state === "past" || model.state === "upcoming")
          .every((model) => model.emphasis === 0),
      ).toBe(true);
      return { current: current.emphasis!, next: coming.emphasis! };
    });
    expect(steps[0]).toEqual({ current: 1, next: 0.15 });
    expect(steps[1]).toEqual(steps[0]);
    expect(steps[2].current).toBe(0);
    expect(steps[2].next).toBeCloseTo(0.575);
    expect(steps[3].next).toBeGreaterThan(steps[3].current);
    const atAdhan = buildPrayerCardModels(new Date(next.at), "en", DEFAULT_LOCATION);
    expect(atAdhan.find((model) => model.prayer === next.prayer)).toMatchObject({
      state: "current",
      emphasis: 1,
      isRecordable: true,
    });
  });
  it("counts down monotonically between prayer boundaries and switches exactly at the adhan", () => {
    const now = new Date("2026-10-14T14:00:00+03:00");
    const first = getPrayerTimeline(now, DEFAULT_LOCATION);
    expect(first.current.prayer).toBe("dhuhr");
    expect(first.next.prayer).toBe("asr");
    expect(first.next.at).toBeGreaterThan(first.current.at);
    const later = getPrayerTimeline(new Date(now.getTime() + 60_000), DEFAULT_LOCATION);
    expect(later.remainingMinutes).toBe(first.remainingMinutes - 1);
    expect(later.remainingPercent).toBeLessThan(first.remainingPercent);
    const almost = getPrayerTimeline(new Date(first.next.at - 1), DEFAULT_LOCATION);
    expect(almost.remainingMinutes).toBe(1);
    expect(almost.remainingPercent).toBeLessThan(0.01);
    const boundary = getPrayerTimeline(new Date(first.next.at), DEFAULT_LOCATION);
    expect(boundary.current.prayer).toBe("asr");
    expect(boundary.next.prayer).toBe("maghrib");
    expect(boundary.remainingPercent).toBe(100);
  });

  it("uses tomorrow's Fajr after Isha, retaining the same interval across midnight", () => {
    const night = getPrayerTimeline(new Date("2026-10-14T23:59:00+03:00"), DEFAULT_LOCATION);
    const morning = getPrayerTimeline(new Date("2026-10-15T00:01:00+03:00"), DEFAULT_LOCATION);
    const tomorrow = getEstimatedPrayerTimes(new Date(2026, 9, 15, 12), DEFAULT_LOCATION);
    expect(night.next.time).toBe(tomorrow.fajr);
    expect(night.next.prayer).toBe("fajr");
    expect(night.current.prayer).toBe("isha");
    expect(morning.next).toEqual(night.next);
    expect(morning.current).toEqual(night.current);
    expect(morning.remainingMinutes).toBe(night.remainingMinutes - 2);
    expect(morning.remainingPercent).toBeLessThan(night.remainingPercent);
  });

  it("uses the selected timezone and actual elapsed instants through Cairo's DST change", () => {
    const first = getPrayerTimeline(new Date("2026-10-29T23:30:00+03:00"), DEFAULT_LOCATION);
    const second = getPrayerTimeline(new Date("2026-10-30T00:30:00+02:00"), DEFAULT_LOCATION);
    expect(second.next.at).toBe(first.next.at);
    expect(second.remainingMinutes).toBe(first.remainingMinutes - 120);
    const midnight = getPrayerTimeline(new Date("2026-10-14T23:30:00Z"), {
      ...DEFAULT_LOCATION,
      timeZone: "Asia/Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
    });
    expect(midnight.next.at).toBeGreaterThan(Date.parse("2026-10-14T23:30:00Z"));
    expect(midnight.next.prayer).toBe("dhuhr");
    expect(midnight.remainingPercent).toBeGreaterThan(0);
    expect(midnight.remainingPercent).toBeLessThanOrEqual(100);
  });

  it("keeps today's past prayers recordable while counting down to tomorrow's Fajr", () => {
    const models = buildPrayerCardModels(new Date("2026-10-14T23:00:00+03:00"), "en", DEFAULT_LOCATION);
    const dhuhr = models.find((model) => model.prayer === "dhuhr")!;
    expect(dhuhr.state).toBe("past");
    expect(dhuhr.isRecordable).toBe(true);
    expect(dhuhr.isOpenable).toBe(true);
    const fajr = models.find((model) => model.prayer === "fajr")!;
    expect(fajr.state).toBe("next");
    expect(fajr.countdown).toMatch(/^\d\d:\d\d left$/);
    expect(fajr.remainingPercent).toBeGreaterThan(0);
  });

  it("recovers invalid timezone input without losing the timing overview", () => {
    expect(() =>
      getPrayerTimeline(new Date("2026-10-14T14:00:00Z"), { ...DEFAULT_LOCATION, timeZone: "invalid/zone" }),
    ).not.toThrow();
  });
});
