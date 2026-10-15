import { beforeEach, describe, expect, it, vi } from "vitest";
import { nativeNotificationPermission, refreshNativeNotificationPermission, replaceNativeReminders } from "./reminders";

const notifications = vi.hoisted(() => ({
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  getPending: vi.fn(),
  cancel: vi.fn(),
  schedule: vi.fn(),
  addListener: vi.fn(),
}));
vi.mock("@capacitor/local-notifications", () => ({ LocalNotifications: notifications }));
vi.mock("./platform", () => ({ isNativeAndroid: () => true }));

beforeEach(() => {
  vi.resetAllMocks();
  window.localStorage.removeItem("azkarapp.native-notification-permission-requested.v1");
  notifications.checkPermissions.mockResolvedValue({ display: "granted" });
  notifications.requestPermissions.mockResolvedValue({ display: "denied" });
  notifications.getPending.mockResolvedValue({ notifications: [{ id: 9999 }, { id: 10_001 }] });
  notifications.cancel.mockResolvedValue(undefined);
  notifications.schedule.mockResolvedValue(undefined);
  notifications.addListener.mockResolvedValue({ remove: vi.fn() });
});

describe("native reminder queue", () => {
  it("requests permissions only through the explicit request boundary", async () => {
    expect(await refreshNativeNotificationPermission()).toBe("granted");
    expect(notifications.requestPermissions).not.toHaveBeenCalled();
    expect(await refreshNativeNotificationPermission(true)).toBe("denied");
    expect(nativeNotificationPermission()).toBe("denied");
  });

  it("requests notification permission on the first native launch and only refreshes it later", async () => {
    const { initializeNativeNotifications } = await import("./reminders");
    await initializeNativeNotifications();
    expect(notifications.requestPermissions).toHaveBeenCalledOnce();

    notifications.requestPermissions.mockClear();
    await initializeNativeNotifications();
    expect(notifications.requestPermissions).not.toHaveBeenCalled();
    expect(notifications.checkPermissions).toHaveBeenCalled();
  });

  it("replaces only owned pending alarms and retains internal click routes", async () => {
    const reminder = {
      id: 10_000,
      title: "Fajr",
      body: "Reminder",
      at: Date.now() + 60_000,
      route: "#/azkar/after-prayer",
    };
    await replaceNativeReminders([reminder]);
    expect(notifications.cancel).toHaveBeenCalledWith({ notifications: [{ id: 10_001 }] });
    expect(notifications.schedule).toHaveBeenCalledWith({
      notifications: [
        {
          id: 10_000,
          title: "Fajr",
          body: "Reminder",
          schedule: { at: new Date(reminder.at), allowWhileIdle: true },
          extra: { route: reminder.route },
        },
      ],
    });
    await replaceNativeReminders([]);
    expect(notifications.schedule).toHaveBeenCalledTimes(1);
  });

  it("recovers after a failed native write and never schedules without permission", async () => {
    notifications.getPending.mockRejectedValueOnce(new Error("native failure"));
    await expect(replaceNativeReminders([])).rejects.toThrow("native failure");
    notifications.checkPermissions.mockResolvedValue({ display: "denied" });
    await replaceNativeReminders([
      { id: 10_000, title: "Routine", body: "Reminder", at: Date.now() + 60_000, route: "#/azkar/morning" },
    ]);
    expect(notifications.schedule).not.toHaveBeenCalled();
  });
});
