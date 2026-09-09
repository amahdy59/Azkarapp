import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { getEstimatedPrayerTimes } from "../content/prayerTimes";
import {
  getLocationBasedReminders,
  getDuePrayerReminder,
  getDueReminder,
  getNextReminderDelay,
  synchronizeReminderTimes,
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
