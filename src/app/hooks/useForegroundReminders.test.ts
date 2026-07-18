import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { getDueReminder } from "./useForegroundReminders";

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
