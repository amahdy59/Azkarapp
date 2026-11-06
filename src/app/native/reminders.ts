import { LocalNotifications } from "@capacitor/local-notifications";
import { isNativeAndroid } from "./platform";
import type { NativeReminder } from "./reminderPlan";
import { parseHash } from "../routing";

let permission: NotificationPermission = "default";
const FIRST_LAUNCH_PERMISSION_KEY = "azkarapp.native-notification-permission-requested.v1";
const FIRST_LAUNCH_EXACT_ALARM_KEY = "azkarapp.native-exact-alarm-permission-requested.v1";
export const nativeNotificationPermission = () => permission;

let exactAlarmPermission: NotificationPermission = "default";
export const nativeExactAlarmPermission = () => exactAlarmPermission;

export async function refreshNativeNotificationPermission(request = false): Promise<NotificationPermission> {
  const result = await (request ? LocalNotifications.requestPermissions() : LocalNotifications.checkPermissions());
  const next = result.display === "granted" ? "granted" : result.display === "denied" ? "denied" : "default";
  if (next !== permission) {
    permission = next;
    window.dispatchEvent(new Event("azkar-notification-permission"));
  }
  return permission;
}

export async function refreshNativeExactAlarmPermission(request = false): Promise<NotificationPermission> {
  const result = await (request
    ? LocalNotifications.changeExactNotificationSetting()
    : LocalNotifications.checkExactNotificationSetting());
  const next = result.exact_alarm === "granted" ? "granted" : result.exact_alarm === "denied" ? "denied" : "default";
  if (next !== exactAlarmPermission) {
    exactAlarmPermission = next;
    window.dispatchEvent(new Event("azkar-exact-alarm-permission"));
  }
  return exactAlarmPermission;
}

let queue = Promise.resolve();
let revision = 0;
let queueFailed = false;

export async function inspectNativeReminderQueue() {
  const pending = await LocalNotifications.getPending();
  return { failed: queueFailed, count: pending.notifications.filter(({ id }) => id >= 10_000 && id < 20_000).length };
}
export function replaceNativeReminders(plan: NativeReminder[]): Promise<void> {
  const current = ++revision;
  queue = queue
    .catch(() => {})
    .then(async () => {
      if (!isNativeAndroid() || current !== revision) return;
      const pending = await LocalNotifications.getPending();
      const owned = pending.notifications.filter(
        ({ id, extra }) => (id >= 10_000 && id < 20_000) || extra?.azkarappReminder === true,
      );
      if (owned.length) await LocalNotifications.cancel({ notifications: owned.map(({ id }) => ({ id })) });
      if (current !== revision) return;
      if ((await refreshNativeNotificationPermission()) === "granted" && plan.length)
        await LocalNotifications.schedule({
          notifications: plan.map(({ at, route, ...entry }) => ({
            ...entry,
            largeBody: entry.body,
            schedule: { at: new Date(at), allowWhileIdle: true },
            extra: { route },
          })),
        });
      queueFailed = false;
      window.dispatchEvent(new Event("azkar-reminder-queue"));
    })
    .catch((error) => {
      queueFailed = true;
      window.dispatchEvent(new Event("azkar-reminder-queue"));
      throw error;
    });
  return queue;
}

export async function initializeNativeNotifications() {
  if (!isNativeAndroid()) return;
  await LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
    const route: unknown = notification.extra?.route;
    if (typeof route === "string" && parseHash(route)) window.location.hash = route;
  });
  let requestedOnFirstLaunch = false;
  let requestedExactAlarmOnFirstLaunch = false;
  try {
    requestedOnFirstLaunch = window.localStorage.getItem(FIRST_LAUNCH_PERMISSION_KEY) === "1";
    requestedExactAlarmOnFirstLaunch = window.localStorage.getItem(FIRST_LAUNCH_EXACT_ALARM_KEY) === "1";
  } catch {
    // Permission prompting should still work when storage is unavailable.
  }
  if (!requestedOnFirstLaunch) {
    await refreshNativeNotificationPermission(true);
    try {
      window.localStorage.setItem(FIRST_LAUNCH_PERMISSION_KEY, "1");
    } catch {
      // A later launch will retry if storage is unavailable.
    }
  }
  if (!requestedExactAlarmOnFirstLaunch) {
    await refreshNativeExactAlarmPermission(true);
    try {
      window.localStorage.setItem(FIRST_LAUNCH_EXACT_ALARM_KEY, "1");
    } catch {
      // A later launch will retry if storage is unavailable.
    }
    return;
  }
  await refreshNativeNotificationPermission();
  await refreshNativeExactAlarmPermission();
}
