import { afterEach, describe, expect, it, vi } from "vitest";
import { canSuggestVoluntaryFast, getReminderPlan, reminderCivilTime } from "./reminderPlan";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { locationTime } from "./content/locationTime";
import { getPrayerTimeline } from "./prayerTimeline";
import type { ReminderContext } from "./types";

afterEach(() => vi.restoreAllMocks());
const location = { ...DEFAULT_LOCATION, timeZone: "Africa/Cairo" };
const at = (date: string, time: string) =>
  new Date(locationTime(new Date(`${date}T12:00:00`), time, location.timeZone));
const plan = (now: Date, contexts: ReminderContext[] = ["morning", "general"]) =>
  getReminderPlan({ now, location, contexts });

describe("combined reminder plan", () => {
  it("keeps dated immediate prayer windows ahead of broad topics", () => {
    const clock = at("2026-10-14", "12:00");
    const timeline = getPrayerTimeline(clock, location);
    const after = plan(new Date(timeline.current.at + 10 * 60_000));
    expect(after.contexts[0]).toBe(timeline.current.prayer);
    const before = plan(new Date(timeline.next.at - 10 * 60_000));
    expect(before.contexts[0]).toBe(timeline.next.prayer === "fajr" ? "before_fajr" : timeline.next.prayer);
    expect(plan(new Date(timeline.current.at + 10 * 60_000), ["after_prayer", "general"]).contexts[0]).toBe(
      "after_prayer",
    );
  });

  it("shows advance fasting for 45 minutes on Wednesday and Sunday, without claiming that display timing is Sunnah", () => {
    for (const day of ["2026-10-14", "2026-10-18"]) {
      const times = getPrayerTimeline(at(day, "12:00"), location).prayerTimes;
      const start = at(day, times.asr).getTime() + 45 * 60_000;
      expect(plan(new Date(start - 60_000)).contexts[0]).not.toBe("fasting_tomorrow");
      expect(plan(new Date(start)).contexts[0]).toBe("fasting_tomorrow");
      expect(plan(new Date(start + 44 * 60_000)).contexts[0]).toBe("fasting_tomorrow");
      expect(plan(new Date(start + 45 * 60_000)).contexts[0]).not.toBe("fasting_tomorrow");
    }
    expect(plan(at("2026-10-15", "16:00")).contexts).not.toContain("fasting_tomorrow");
  });

  it("keeps Friday's last hour specific instead of labeling the whole afternoon as that hour", () => {
    const maghrib = getPrayerTimeline(at("2026-10-16", "12:00"), location).prayerTimes.maghrib;
    const end = at("2026-10-16", maghrib).getTime();
    expect(plan(new Date(end - 90 * 60_000), ["friday_after_asr", "friday", "general"]).contexts).not.toContain(
      "friday_after_asr",
    );
    expect(plan(new Date(end - 45 * 60_000), ["friday", "general"]).contexts[0]).toBe("friday_after_asr");
    expect(plan(new Date(end), ["friday_after_asr", "friday", "general"]).contexts[0]).toBe("maghrib");
  });

  it("preserves night and extended devotional slots and allows daytime topic variety", () => {
    expect(plan(at("2026-10-14", "03:00"), ["last_third", "general"]).contexts[0]).toBe("last_third");
    expect(plan(at("2026-10-14", "03:00"), ["last_third", "general"]).key).toContain("-s45-");
    expect(plan(at("2026-10-14", "22:00"), ["before_sleep", "general"]).contexts[0]).toBe("before_sleep");
    expect(plan(at("2026-10-14", "10:00"), ["dhuha", "morning", "general"]).key).toContain("-s45-");
    const contexts = new Set<string>();
    for (let day = 12; day < 19; day++)
      for (let hour = 9; hour < 19; hour++)
        for (const minute of ["05", "35"]) {
          contexts.add(plan(at(`2026-10-${day}`, `${hour}:${minute}`)).contexts[0]!);
        }
    for (const topic of ["character", "helping_others", "general_dua", "fasting_virtue", "morning"])
      expect(contexts.has(topic)).toBe(true);
  });

  it("is stable within a slot and follows selected civil time across device-zone and midnight differences", () => {
    expect(plan(at("2026-10-14", "14:02"))).toEqual(plan(at("2026-10-14", "14:29")));
    expect(plan(at("2026-10-14", "14:30")).key).not.toBe(plan(at("2026-10-14", "14:29")).key);
    const utcInstant = new Date("2026-10-14T22:30:00Z");
    const civil = reminderCivilTime(utcInstant, location);
    expect(civil.getDate()).toBe(15);
    expect(civil.getHours()).toBe(1);
    expect(plan(utcInstant).key).toMatch(/^2026-10-15-/);
    expect(reminderCivilTime(utcInstant, { ...location, timeZone: "invalid/zone" }).getTime()).toBe(
      utcInstant.getTime(),
    );
  });
});

describe("voluntary fasting exclusions", () => {
  it("excludes Ramadan, both Eids and Tashriq, including a conservative uncertainty margin", () => {
    for (const day of ["2026-02-25", "2026-03-20", "2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30"]) {
      expect(canSuggestVoluntaryFast(new Date(`${day}T12:00:00`)), day).toBe(false);
    }
    expect(canSuggestVoluntaryFast(new Date("2026-10-15T12:00:00"))).toBe(true);
    expect(canSuggestVoluntaryFast(new Date("2026-05-25T12:00:00"), 2)).toBe(false);
  });

  it("cannot surface weekly fasting contexts when the target day is excluded", () => {
    const now = at("2026-02-25", "16:00");
    const result = plan(now, ["monday", "thursday", "general"]);
    expect(result.contexts).not.toContain("monday");
    expect(result.contexts).not.toContain("thursday");
    expect(result.contexts).not.toContain("fasting_tomorrow");
    expect(result.contexts).not.toContain("fasting_virtue");
  });

  it("fails closed when the calendar is unsupported", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      calendar: "gregory",
    } as Intl.ResolvedDateTimeFormatOptions);
    expect(canSuggestVoluntaryFast(new Date())).toBe(false);
  });

  it("does not infer Hijri dates when formatting fails", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "formatToParts").mockImplementation(() => {
      throw new Error("unavailable");
    });
    expect(canSuggestVoluntaryFast(new Date())).toBe(false);
  });
});
