import { describe, expect, it } from "vitest";
import { contextReminderPlan, recommendedReminders } from "./contextReminders";
import { DEFAULT_APP_STATE, normalizeAppState, mergeAppStates } from "./state";
import { getEstimatedPrayerTimes } from "./content/prayerTimes";
import { locationCalendarDate, locationTime } from "./content/locationTime";
import { getNextReminderDelay } from "./hooks/useForegroundReminders";
import { parseHash } from "./routing";
import { buildNativeReminderPlan } from "./native/reminderPlan";

describe("first-use reminder choices", () => {
  it("preselects requested reminders without mutating prior settings", () => {
    const original = structuredClone(DEFAULT_APP_STATE.settings.reminders);
    const selected = recommendedReminders(original);
    for (const key of ["prayer", "morning", "evening", "before_sleep", "after_prayer", "friday", "fridayDua"] as const)
      expect(selected[key]?.enabled).toBe(true);
    expect(original.prayer.enabled).toBe(false);
    expect(selected.onlyWhenIncomplete).toBe(true);
    expect(selected.beforeFajrDua?.enabled).toBe(false);
    expect(recommendedReminders({ ...original, beforeFajrDua: { enabled: true } }).beforeFajrDua?.enabled).toBe(true);
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
      const reminders = {
        ...recommendedReminders(DEFAULT_APP_STATE.settings.reminders),
        beforeFajrDua: { enabled: true },
      };
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
      const events = native.filter((entry) => entry.route === "#/azkar/comprehensive-duas");
      expect(events.length).toBeGreaterThan(0);
      expect(events.every((entry) => entry.at > now.getTime() && entry.at < now.getTime() + 7 * 86_400_000)).toBe(true);
      expect(new Set(native.map((entry) => entry.id)).size).toBe(native.length);
    },
  );
  it("schedules nothing when all contextual choices are absent or off", () => {
    expect(contextReminderPlan(DEFAULT_APP_STATE.settings.reminders, undefined, new Date())).toEqual([]);
  });
});

describe("optional Friday Salawat and fasting preparation", () => {
  const now = new Date("2026-11-05T00:00:00Z");
  const location = DEFAULT_APP_STATE.settings.location!;
  const zone = location.timeZone!;
  const settings = DEFAULT_APP_STATE.settings;
  const reminders = {
    ...settings.reminders,
    fridaySalawat: { enabled: true },
    fastingPreparation: { enabled: true },
  };

  it("keeps optional reminders off on onboarding and preserves explicit choices through persistence", () => {
    const newChoices = recommendedReminders(settings.reminders);
    expect(newChoices.fridaySalawat?.enabled).toBeFalsy();
    expect(newChoices.fastingPreparation?.enabled).toBeFalsy();
    const local = normalizeAppState({ settings: { reminders } });
    expect(local.settings.reminders).toMatchObject({
      fridaySalawat: { enabled: true },
      fastingPreparation: { enabled: true },
    });
    const merged = mergeAppStates(local, { settings: { reminders: { fridaySalawat: { enabled: false } } } });
    expect(merged.settings.reminders).toMatchObject({
      fridaySalawat: { enabled: false },
      fastingPreparation: { enabled: true },
    });
  });

  it("routes to the existing sections and leaves room around the adjacent prayers", () => {
    const plan = contextReminderPlan(reminders, location, now);
    const friday = plan.find((event) => event.kind === "fridaySalawat")!;
    const fasting = plan.filter((event) => event.kind === "fastingPreparation");
    const fridayDate = locationCalendarDate(new Date(friday.at), zone);
    expect(fridayDate.getDay()).toBe(5);
    expect(friday.at).toBe(locationTime(fridayDate, "10:00", zone));
    expect(parseHash(friday.route)).toEqual({ view: "friday_salawat" });
    expect(fasting).toHaveLength(2);
    for (const event of fasting) {
      const day = locationCalendarDate(new Date(event.at), zone);
      const times = getEstimatedPrayerTimes(day, location);
      expect([0, 3]).toContain(day.getDay());
      expect(event.at - locationTime(day, times.asr, zone)).toBe(45 * 60_000);
      expect(locationTime(day, times.maghrib, zone) - event.expiresAt).toBeGreaterThanOrEqual(30 * 60_000);
      expect(parseHash(event.route)).toMatchObject({ view: "category", categoryId: "fasting_ramadan" });
    }
    const android = buildNativeReminderPlan({ ...DEFAULT_APP_STATE, settings: { ...settings, reminders } }, now);
    expect(android.find((event) => event.route === friday.route)?.body).toContain("1047");
    expect(android.find((event) => event.route === fasting[0]!.route)?.body).toContain("747");
    expect(new Set(android.map(({ id }) => id)).size).toBe(android.length);
  });

  it("finds next Friday with no daily reminders and suppresses fasting during Ramadan", () => {
    const onlyFriday = { ...reminders, fastingPreparation: { enabled: false } };
    expect(getNextReminderDelay(onlyFriday, location, new Date("2026-11-07T00:00:00Z"))).toBeGreaterThan(
      4 * 86_400_000,
    );
    const ramadan = contextReminderPlan(reminders, location, new Date("2026-03-01T00:00:00Z"), 1);
    expect(ramadan.some((event) => event.kind === "fridaySalawat")).toBe(true);
    expect(ramadan.some((event) => event.kind === "fastingPreparation")).toBe(false);
    const nearEid = contextReminderPlan(reminders, location, new Date("2026-05-26T00:00:00Z"));
    expect(
      nearEid.some(
        (event) =>
          event.kind === "fastingPreparation" && locationCalendarDate(new Date(event.at), zone).getDate() === 27,
      ),
    ).toBe(false);
  });
});
