import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { getLocationBasedReminders, getDueReminder, synchronizeReminderTimes } from "./useForegroundReminders";

const morningTime = new Date(2026, 6, 17, 7, 30, 30);

describe("getDueReminder", () => {
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
