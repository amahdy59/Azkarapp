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
    const sessions = [
      {
        id: "morning-1",
        category: "morning" as const,
        completedAt: new Date(2026, 6, 17, 6, 45).toISOString(),
        completedCount: 26,
        totalCount: 26,
        durationSeconds: 120,
        isComplete: true,
      },
    ];

    expect(getDueReminder(reminders, sessions, morningTime)).toBeNull();
  });
});
