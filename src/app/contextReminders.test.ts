import { describe, expect, it } from "vitest";
import { contextReminderPlan, recommendedReminders } from "./contextReminders";
import { DEFAULT_APP_STATE, normalizeAppState, mergeAppStates } from "./state";
import { getEstimatedPrayerTimes } from "./content/prayerTimes";
import { locationCalendarDate, locationTime } from "./content/locationTime";
import { buildNativeReminderPlan } from "./native/reminderPlan";

describe("first-use reminder choices", () => {
  it("preselects requested reminders without mutating prior settings", () => {
    const original = structuredClone(DEFAULT_APP_STATE.settings.reminders);
    const selected = recommendedReminders(original);
    for (const key of [
      "prayer",
      "morning",
      "evening",
      "before_sleep",
      "after_prayer",
      "friday",
      "fridayDua",
      "beforeFajrDua",
    ] as const)
      expect(selected[key]?.enabled).toBe(true);
    expect(original.prayer.enabled).toBe(false);
    expect(selected.onlyWhenIncomplete).toBe(true);
  });
  it("retains existing opt-outs through normalization and merge", () => {
    const state = normalizeAppState({
      settings: {
        reminders: { friday: { enabled: false }, fridayDua: { enabled: true }, beforeFajrDua: { enabled: false } },
      },
    });
    expect(
      mergeAppStates(state, { settings: { reminders: { morning: { enabled: true } } } }).settings.reminders,
    ).toMatchObject({ friday: { enabled: false }, fridayDua: { enabled: true }, beforeFajrDua: { enabled: false } });
    expect(
      normalizeAppState({ settings: { reminders: { prayer: { enabled: false } } } }).settings.reminders.friday,
    ).toBeUndefined();
    expect(
      normalizeAppState({ settings: { reminders: { friday: { enabled: "yes" } } } }).settings.reminders.friday?.enabled,
    ).toBe(false);
  });
});

describe("Friday and pre-Fajr reminders", () => {
  it.each(["Africa/Cairo", "America/New_York", "Asia/Tokyo"])(
    "uses the selected timezone and prayer instants in %s",
    (timeZone) => {
      const now = new Date("2026-10-29T01:00:00Z");
      const coordinates =
        timeZone === "Asia/Tokyo"
          ? { latitude: 35.676, longitude: 139.65 }
          : timeZone === "America/New_York"
            ? { latitude: 40.71, longitude: -74.0 }
            : { latitude: 30.04, longitude: 31.24 };
      const location = { ...DEFAULT_APP_STATE.settings.location!, ...coordinates, timeZone };
      const reminders = recommendedReminders(DEFAULT_APP_STATE.settings.reminders);
      const plan = contextReminderPlan(reminders, location, now);
      expect(plan.filter((event) => event.kind === "beforeFajrDua")).toHaveLength(8);
      for (const event of plan.filter((item) => item.kind === "fridayDua")) {
        const civil = locationCalendarDate(new Date(event.at), timeZone);
        expect(civil.getDay()).toBe(5);
        expect(event.at).toBe(
          locationTime(civil, getEstimatedPrayerTimes(civil, location).maghrib, timeZone) - 60 * 60_000,
        );
      }
      const native = buildNativeReminderPlan(
        { ...DEFAULT_APP_STATE, settings: { ...DEFAULT_APP_STATE.settings, reminders, location } },
        now,
      );
      const events = native.filter((entry) => entry.id >= 19_000);
      expect(events.length).toBeGreaterThan(0);
      expect(events.every((entry) => entry.at > now.getTime() && entry.at < now.getTime() + 7 * 86_400_000)).toBe(true);
      expect(new Set(native.map((entry) => entry.id)).size).toBe(native.length);
    },
  );
  it("schedules nothing when all contextual choices are absent or off", () => {
    expect(contextReminderPlan(DEFAULT_APP_STATE.settings.reminders, undefined, new Date())).toEqual([]);
  });
});
