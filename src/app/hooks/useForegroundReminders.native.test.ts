import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import type { ReminderSettings } from "../types";

const nativeNotifications = {
  checkPermissions: vi.fn(),
  getPending: vi.fn(),
  cancel: vi.fn(),
  createChannel: vi.fn(),
  schedule: vi.fn(),
};

describe("native reminder delivery", () => {
  afterEach(() => vi.useRealTimers());
  beforeEach(() => {
    // Keep the next-hour reminder on the same date; 23:00 otherwise wraps to midnight.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 20, 12, 0, 0));
    vi.resetModules();
    nativeNotifications.checkPermissions.mockResolvedValue({ display: "granted" });
    nativeNotifications.getPending.mockResolvedValue({ notifications: [] });
    nativeNotifications.cancel.mockResolvedValue(undefined);
    nativeNotifications.createChannel.mockResolvedValue(undefined);
    nativeNotifications.schedule.mockResolvedValue({ notifications: [] });
    vi.doMock("@capacitor/core", () => ({
      Capacitor: { isNativePlatform: () => true, getPlatform: () => "android" },
      registerPlugin: () => nativeNotifications,
    }));
  });

  it("leaves Android scheduling to useNativeServices", async () => {
    const { useForegroundReminders } = await import("./useForegroundReminders");
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const reminders: ReminderSettings = {
      ...DEFAULT_APP_STATE.settings.reminders,
      morning: { enabled: true, time: `${String(now.getHours()).padStart(2, "0")}:00` },
      evening: { enabled: false, time: "18:30" },
      before_sleep: { enabled: false, time: "22:00" },
      after_prayer: { enabled: false, time: "13:00" },
      prayer: { enabled: false, leadMinutes: 15 },
    };

    renderHook(() =>
      useForegroundReminders({
        reminders,
        dailyCompletions: [],
        progressDayStartHour: 4,
        language: "en",
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 20));
    // useNativeServices is the sole native scheduling owner.
    expect(nativeNotifications.schedule).not.toHaveBeenCalled();
    expect(nativeNotifications.createChannel).not.toHaveBeenCalled();
  });
});
