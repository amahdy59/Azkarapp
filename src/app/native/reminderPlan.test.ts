import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { buildNativeReminderPlan, locationTime } from "./reminderPlan";

describe("native reminder plan", () => {
  it("resolves selected-location dates using their own DST offset", () => {
    expect(new Date(locationTime(new Date(2026, 0, 15, 12), "12:00", "Africa/Cairo")).toISOString()).toBe(
      "2026-01-15T10:00:00.000Z",
    );
    expect(new Date(locationTime(new Date(2026, 6, 15, 12), "12:00", "Africa/Cairo")).toISOString()).toBe(
      "2026-07-15T09:00:00.000Z",
    );
  });

  it("honors enabled prayer selection and lead time without leaking location/profile", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    state.settings.reminders.prayer = { enabled: true, leadMinutes: 10, prayers: ["fajr"] };
    const now = new Date("2026-10-15T00:00:00Z");
    const plan = buildNativeReminderPlan(state, now);
    expect(plan).toHaveLength(7);
    expect(plan.every((entry) => entry.at > now.getTime())).toBe(true);
    expect(new Set(plan.map(({ id }) => id)).size).toBe(plan.length);
    expect(JSON.stringify(plan)).not.toMatch(/latitude|longitude|profile|email|credential/);
    state.settings.reminders.prayer.leadMinutes = 0;
    expect(buildNativeReminderPlan(state, now)[0].at - plan[0].at).toBe(10 * 60_000);
    state.settings.reminders.prayer.enabled = false;
    expect(buildNativeReminderPlan(state, now)).toEqual([]);
  });

  it("suppresses completed routines and excludes past due times", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    state.settings.reminders.morning = { enabled: true, time: "23:59" };
    state.settings.reminders.onlyWhenIncomplete = true;
    state.dailyCompletions = [{ category: "morning", dayKey: "2026-10-15", timeZone: "Africa/Cairo" }];
    const plan = buildNativeReminderPlan(state, new Date(2026, 9, 15, 12));
    expect(plan).toHaveLength(6);
    expect(plan[0].route).toBe("#/azkar/morning");
  });
});
