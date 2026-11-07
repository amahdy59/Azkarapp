import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { useForegroundReminders } from "./useForegroundReminders";

const delivery = vi.hoisted(() => ({ show: vi.fn(), permission: "denied" }));
vi.mock("../notifications", () => ({
  readNotificationPermission: () => delivery.permission,
  showBrowserNotification: delivery.show,
}));
let testDay = 13;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, testDay++, 7, 30, 10));
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
  it("honors delivery history written by the previous app version", async () => {
    const { getProgressDayKey } = await import("../progress");
    localStorage.setItem(
      "azkarapp.foreground-reminders.v1",
      JSON.stringify({ morning: getProgressDayKey(new Date(), 4) }),
    );
    delivery.permission = "granted";
    const { unmount } = renderHook(() => useForegroundReminders(props));
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(delivery.show).not.toHaveBeenCalled();
    unmount();
  });
  it("resumes when permission is granted outside the app and does not duplicate delivery on focus", async () => {
    const { unmount } = renderHook(() => useForegroundReminders(props));
    expect(delivery.show).not.toHaveBeenCalled();
    delivery.permission = "granted";
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(delivery.show).toHaveBeenCalledOnce();
    expect(delivery.show).toHaveBeenCalledWith(
      "Morning adhkar",
      expect.objectContaining({ body: expect.stringMatching(/Bukhari|Muslim|Abu Dawud/), lang: "en", dir: "ltr" }),
      expect.any(Function),
    );
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(delivery.show).toHaveBeenCalledOnce();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("claims a dated occurrence across concurrent mounts and effect restarts", async () => {
    delivery.permission = "granted";
    let finish!: (sent: boolean) => void;
    delivery.show.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
    );
    const first = renderHook(() => useForegroundReminders(props));
    const second = renderHook(() => useForegroundReminders(props));
    await act(async () => {
      await Promise.resolve();
    });
    expect(delivery.show).toHaveBeenCalledOnce();
    await act(async () => finish(true));
    first.unmount();
    second.unmount();
    const again = renderHook(() => useForegroundReminders(props));
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(delivery.show).toHaveBeenCalledOnce();
    again.unmount();
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
  it("schedules a selected pre-Fajr reminder after in-app permission is granted", async () => {
    const now = new Date(2026, 9, 16, 0, 0);
    const { contextReminderPlan } = await import("../contextReminders");
    const reminders = { ...DEFAULT_APP_STATE.settings.reminders, beforeFajrDua: { enabled: true } };
    const event = contextReminderPlan(reminders, undefined, now)[0]!;
    vi.setSystemTime(new Date(event.at - 1000));
    const { unmount } = renderHook(() => useForegroundReminders({ ...props, reminders }));
    delivery.permission = "granted";
    await act(async () => {
      window.dispatchEvent(new Event("azkar-notification-permission"));
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(delivery.show).toHaveBeenCalledOnce();
    expect(delivery.show.mock.calls[0]![1].data.url).toContain("comprehensive-duas");
    expect(delivery.show.mock.calls[0]![0]).toBe("Dua before Fajr");
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(delivery.show).toHaveBeenCalledOnce();
    unmount();
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
