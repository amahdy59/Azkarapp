import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "./state";
import { reminderOccurrences } from "./reminderOccurrences";
import { locationCalendarDate, locationTime } from "./content/locationTime";
import { getEstimatedPrayerTimes } from "./content/prayerTimes";
import { parseHash } from "./routing";
import { buildNativeReminderPlan } from "./native/reminderPlan";
import { notificationCopy } from "./notificationCopy";

describe("dated reminder occurrences", () => {
  it.each(["Asia/Tokyo", "America/New_York", "Africa/Cairo"])(
    "uses %s prayer dates across month and DST boundaries",
    (timeZone) => {
      const state = structuredClone(DEFAULT_APP_STATE);
      state.settings.location = { ...state.settings.location!, timeZone };
      state.settings.reminders.prayer = { enabled: true, leadMinutes: 10, prayers: ["asr"] };
      const now = new Date("2026-10-31T20:00:00Z");
      const events = reminderOccurrences(state.settings.reminders, [], state.settings.location, 4, now);
      expect(events.length).toBeGreaterThan(4);
      for (const event of events) {
        const date = locationCalendarDate(new Date(event.at), timeZone);
        const clock = getEstimatedPrayerTimes(date, state.settings.location).asr;
        expect(event.at).toBe(locationTime(date, clock, timeZone) - 10 * 60_000);
        expect(event.route).toBe("#/prayer/asr");
        expect(parseHash(event.route)).toBeTruthy();
        const native = buildNativeReminderPlan(state, now).find((entry) => entry.at === event.at)!;
        expect(native.body).toBe(
          notificationCopy(state.settings.language, event, event.dateKey, event.prayerTime).body,
        );
      }
    },
  );

  it("expires prayer leads and pre-Fajr messages before their relevant window ends", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    state.settings.reminders.prayer = { enabled: true, leadMinutes: 5, prayers: ["fajr"] };
    state.settings.reminders.beforeFajrDua = { enabled: true };
    const now = new Date("2026-11-05T00:00:00Z");
    const events = reminderOccurrences(state.settings.reminders, [], state.settings.location, 4, now);
    const prayer = events.find((event) => event.kind === "prayer")!;
    const after = reminderOccurrences(
      state.settings.reminders,
      [],
      state.settings.location,
      4,
      new Date(prayer.expiresAt),
    );
    expect(after.some((event) => event.key === prayer.key)).toBe(false);
    const dua = events.find((event) => event.kind === "beforeFajrDua")!;
    expect(dua.expiresAt).toBeLessThanOrEqual(prayer.at);
  });

  it("keeps simultaneous selected events distinct and routes routine slugs correctly", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    state.settings.reminders.before_sleep = { enabled: true, time: "22:00" };
    state.settings.reminders.after_prayer = { enabled: true, time: "22:00" };
    const now = new Date(2026, 10, 5, 21);
    const events = reminderOccurrences(state.settings.reminders, [], undefined, 4, now);
    expect(new Set(events.map((event) => event.key)).size).toBe(events.length);
    expect(events[0].at).toBe(events[1].at);
    expect(events.map((event) => event.route)).toContain("#/azkar/before-sleep");
    expect(events.map((event) => event.route)).toContain("#/azkar/after-prayer");
  });
});
