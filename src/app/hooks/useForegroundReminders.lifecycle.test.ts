import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { useForegroundReminders } from "./useForegroundReminders";

const delivery = vi.hoisted(() => ({ show: vi.fn(), permission: "denied" }));
vi.mock("../notifications", () => ({
  readNotificationPermission: () => delivery.permission,
  showBrowserNotification: delivery.show,
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 13, 7, 30, 10));
  localStorage.clear();
  delivery.permission = "denied";
  delivery.show.mockReset().mockResolvedValue(true);
});
afterEach(() => vi.useRealTimers());

describe("reminder lifecycle", () => {
  const props = {
    reminders: { ...DEFAULT_APP_STATE.settings.reminders, morning: { enabled: true, time: "07:30" } },
    dailyCompletions: [],
    progressDayStartHour: 4,
    language: "en" as const,
  };
  it("resumes when permission is granted outside the app and does not duplicate delivery on focus", async () => {
    const { unmount } = renderHook(() => useForegroundReminders(props));
    expect(delivery.show).not.toHaveBeenCalled();
    delivery.permission = "granted";
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(delivery.show).toHaveBeenCalledOnce();
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(delivery.show).toHaveBeenCalledOnce();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not deliver after permission is revoked before a scheduled reminder", async () => {
    delivery.permission = "granted";
    vi.setSystemTime(new Date(2026, 9, 13, 7, 29));
    renderHook(() => useForegroundReminders(props));
    delivery.permission = "denied";
    await act(async () => vi.advanceTimersByTimeAsync(61_000));
    expect(delivery.show).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("invalidates pending delivery when leaving or changing schedules", async () => {
    delivery.permission = "granted";
    delivery.show.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderHook(() => useForegroundReminders(props));
    const isCurrent = delivery.show.mock.calls[0]![2] as () => boolean;
    expect(isCurrent()).toBe(true);
    unmount();
    expect(isCurrent()).toBe(false);
  });
});
