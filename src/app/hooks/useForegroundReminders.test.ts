import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { getEstimatedPrayerTimes } from "../content/prayerTimes";
import {
  getLocationBasedReminders,
  getDuePrayerReminder,
  getDueReminder,
  getNextReminderDelay,
  synchronizeReminderTimes,
  getUpcomingNativeReminders,
} from "./useForegroundReminders";

const morningTime = new Date(2026, 6, 17, 7, 30, 30);

describe("getDueReminder", () => {
  it("reminds for each prayer at the selected lead time", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      prayer: { enabled: true, leadMinutes: 15 as const },
    };
    const date = new Date(2026, 6, 17, 12);
    const asr = getEstimatedPrayerTimes(date).asr.split(":").map(Number);
    date.setHours(asr[0]!, asr[1]! - 15, 30, 0);

    expect(getDuePrayerReminder(reminders, undefined, date)).toEqual({
      kind: "prayer",
      prayer: "asr",
      leadMinutes: 15,
    });
    expect(getDuePrayerReminder(reminders, undefined, date, (key) => key === "prayer:asr")).toBeNull();
  });

  it("reminds exactly 10 minutes before prayer when 10 min lead is configured", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      prayer: { enabled: true, leadMinutes: 10 as const },
    };
    const date = new Date(2026, 6, 17, 12);
    const dhuhr = getEstimatedPrayerTimes(date).dhuhr.split(":").map(Number);
    date.setHours(dhuhr[0]!, dhuhr[1]! - 10, 30, 0);

    expect(getDuePrayerReminder(reminders, undefined, date)).toEqual({
      kind: "prayer",
      prayer: "dhuhr",
      leadMinutes: 10,
    });
  });

  it("returns a configured reminder inside its delivery window", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
    };

    expect(getDueReminder(reminders, [], morningTime)).toEqual({ kind: "morning", category: "morning" });
  });

  it("skips an already completed collection when the user chooses that preference", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
      onlyWhenIncomplete: true,
    };
    const dailyCompletions = [
      {
        category: "morning" as const,
        dayKey: "2026-07-17",
        timeZone: "Africa/Cairo",
      },
    ];

    expect(getDueReminder(reminders, dailyCompletions, morningTime, 4)).toBeNull();
  });

  it("skips evening and sleep reminders when completed today", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      evening: { enabled: true, time: "18:30" },
      before_sleep: { enabled: true, time: "22:00" },
      onlyWhenIncomplete: true,
    };
    const dailyCompletions = [
      { category: "evening" as const, dayKey: "2026-07-17", timeZone: "Africa/Cairo" },
      { category: "before_sleep" as const, dayKey: "2026-07-17", timeZone: "Africa/Cairo" },
    ];

    expect(getDueReminder(reminders, dailyCompletions, new Date(2026, 6, 17, 18, 30, 15), 4)).toBeNull();
    expect(getDueReminder(reminders, dailyCompletions, new Date(2026, 6, 17, 22, 0, 15), 4)).toBeNull();
  });

  it("supports a user-chosen before-sleep routine anchor", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      before_sleep: { enabled: true, time: "22:00" },
    };

    expect(getDueReminder(reminders, [], new Date(2026, 6, 17, 22, 0, 30), 4)).toEqual({
      kind: "before_sleep",
      category: "before_sleep",
    });
  });

  it("moves to another due reminder when the first one was already delivered", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
      evening: { enabled: true, time: "07:30" },
    };

    expect(getDueReminder(reminders, [], morningTime, 4, (kind) => kind === "morning")).toEqual({
      kind: "evening",
      category: "evening",
    });
  });
});

describe("efficient reminder scheduling", () => {
  it("sleeps until the next configured time instead of polling", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
    };

    expect(getNextReminderDelay(reminders, undefined, new Date(2026, 6, 17, 7, 0))).toBe(30 * 60_000);
  });

  it("schedules directly to the next prayer lead time", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      prayer: { enabled: true, leadMinutes: 15 as const },
    };
    const date = new Date(2026, 6, 17, 12);
    const [hours, minutes] = getEstimatedPrayerTimes(date).asr.split(":").map(Number);
    const reminderAt = new Date(date);
    reminderAt.setHours(hours!, minutes!, 0, 0);
    reminderAt.setMinutes(reminderAt.getMinutes() - 15);
    const now = new Date(reminderAt.getTime() - 30 * 60_000);

    expect(getNextReminderDelay(reminders, undefined, now)).toBe(30 * 60_000);
  });
});

describe("location-based reminder schedules", () => {
  it("moves all routine reminders to their prayer anchors without changing opt-in state", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
      evening: { enabled: false, time: "18:30" },
      before_sleep: { enabled: true, time: "22:00" },
    };

    expect(
      synchronizeReminderTimes(reminders, {
        fajr: "04:12",
        dhuhr: "12:03",
        asr: "15:28",
        maghrib: "18:42",
        isha: "20:05",
      }),
    ).toEqual({
      ...reminders,
      morning: { enabled: true, time: "04:12" },
      evening: { enabled: false, time: "15:28" },
      before_sleep: { enabled: true, time: "20:05" },
    });
  });

  it("recalculates every reminder when the calculation method changes", () => {
    const date = new Date(2026, 6, 17, 12);
    const baseLocation = {
      latitude: 30.0444,
      longitude: 31.2357,
      cityName: "Cairo",
      calculationMethod: 5,
      autoDetect: false,
      timeZone: "Africa/Cairo",
    };
    const methodFive = getLocationBasedReminders(DEFAULT_APP_STATE.settings.reminders, baseLocation, date);
    const methodFour = getLocationBasedReminders(
      DEFAULT_APP_STATE.settings.reminders,
      { ...baseLocation, calculationMethod: 4 },
      date,
    );

    expect(methodFour.morning.time).not.toBe(methodFive.morning.time);
    expect(methodFour.before_sleep.time).not.toBe(methodFive.before_sleep.time);
    expect(methodFour.evening.time).toBe(methodFive.evening.time);
  });
});

describe("native Android reminder schedules", () => {
  it("keeps configured routine times while calculating prayer reminders from location", () => {
    const location = {
      latitude: 30.0444,
      longitude: 31.2357,
      cityName: "Cairo",
      calculationMethod: 5,
      autoDetect: false,
      timeZone: "Africa/Cairo",
    };
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
      evening: { enabled: false, time: "18:30" },
      before_sleep: { enabled: false, time: "22:00" },
      after_prayer: { enabled: false, time: "13:00" },
      prayer: { enabled: false, leadMinutes: 15 as const },
    };
    const now = new Date(2026, 6, 17, 7, 0);
    const scheduled = getUpcomingNativeReminders(reminders, [], "en", location, now, 1);

    expect(scheduled).toHaveLength(1);
    expect(scheduled[0]!.kind).toBe("morning");
    expect(scheduled[0]!.at).toEqual(new Date(2026, 6, 17, 7, 30));
  });

  it("pre-schedules future reminders in a rolling window with stable OS alarm times", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
      evening: { enabled: false, time: "18:30" },
      before_sleep: { enabled: false, time: "22:00" },
      after_prayer: { enabled: false, time: "13:00" },
      prayer: { enabled: true, leadMinutes: 15 as const },
    };
    const now = new Date(2026, 6, 17, 7, 0);
    const scheduled = getUpcomingNativeReminders(reminders, [], "en", undefined, now, 2);

    expect(scheduled.length).toBe(11);
    expect(scheduled[0]!.at.getTime()).toBeLessThan(scheduled[1]!.at.getTime());
    expect(scheduled.some(({ kind }) => kind === "morning")).toBe(true);
    expect(scheduled.some(({ kind, at }) => kind === "prayer:fajr" && at.getDate() === now.getDate())).toBe(false);
    expect(new Set(scheduled.map(({ id }) => id)).size).toBe(scheduled.length);
    expect(scheduled.every(({ at }) => at > now)).toBe(true);
  });

  it("omits a completed routine for today while retaining later scheduled days", () => {
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
      onlyWhenIncomplete: true,
    };
    const now = new Date(2026, 6, 17, 7, 0);
    const completion = [{ category: "morning" as const, dayKey: "2026-07-17", timeZone: "UTC" }];
    const scheduled = getUpcomingNativeReminders(reminders, completion, "en", undefined, now, 2);

    expect(scheduled.filter(({ kind }) => kind === "morning")).toHaveLength(1);
    expect(scheduled.find(({ kind }) => kind === "morning")!.at.getDate()).toBe(18);
  });

  it("uses date-specific prayer times when building future alarms", () => {
    const location = {
      latitude: 30.0444,
      longitude: 31.2357,
      cityName: "Cairo",
      calculationMethod: 5,
      autoDetect: false,
      timeZone: "Africa/Cairo",
    };
    const reminders = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: "07:30" },
      evening: { enabled: false, time: "18:30" },
      before_sleep: { enabled: false, time: "22:00" },
      prayer: { enabled: true, leadMinutes: 10 as const },
    };
    const now = new Date(2026, 6, 17, 0, 0);
    const scheduled = getUpcomingNativeReminders(reminders, [], "en", location, now, 2);
    const fajr = scheduled.find(({ kind, at }) => kind === "prayer:fajr" && at.getDate() === 18)!;
    const expected = getEstimatedPrayerTimes(new Date(2026, 6, 18, 12), location).fajr;
    const [hours, minutes] = expected.split(":").map(Number);
    const expectedAt = new Date(2026, 6, 18, hours!, minutes! - 10);

    expect(fajr.at.getTime()).toBe(expectedAt.getTime());
  });
});
