import { isNativeAndroid } from "./platform";
import type { NativeReminder } from "./reminderPlan";

let permission: NotificationPermission = "default";
const FIRST_LAUNCH_PERMISSION_KEY = "azkarapp.native-notification-permission-requested.v1";
export const nativeNotificationPermission = () => permission;

export async function refreshNativeNotificationPermission(request = false): Promise<NotificationPermission> {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const result = await (request ? LocalNotifications.requestPermissions() : LocalNotifications.checkPermissions());
  const next = result.display === "granted" ? "granted" : result.display === "denied" ? "denied" : "default";
  if (next !== permission) {
    permission = next;
    window.dispatchEvent(new Event("azkar-notification-permission"));
  }
  return permission;
}

let queue = Promise.resolve();
let revision = 0;
export function replaceNativeReminders(plan: NativeReminder[]): Promise<void> {
  const current = ++revision;
  queue = queue
    .catch(() => {})
    .then(async () => {
      if (!isNativeAndroid() || current !== revision) return;
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const pending = await LocalNotifications.getPending();
      const owned = pending.notifications.filter(({ id }) => id >= 10_000 && id < 20_000);
      if (owned.length) await LocalNotifications.cancel({ notifications: owned.map(({ id }) => ({ id })) });
      if (current !== revision || (await refreshNativeNotificationPermission()) !== "granted" || !plan.length) return;
      await LocalNotifications.schedule({
        notifications: plan.map(({ at, route, ...entry }) => ({
          ...entry,
          schedule: { at: new Date(at), allowWhileIdle: true },
          extra: { route },
        })),
      });
    });
  return queue;
}

export async function initializeNativeNotifications() {
  if (!isNativeAndroid()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
    const route: unknown = notification.extra?.route;
    if (typeof route === "string" && /^#\/(azkar|settings|quran)(\/|$)/.test(route)) window.location.hash = route;
  });
  let requestedOnFirstLaunch = false;
  try {
    requestedOnFirstLaunch = window.localStorage.getItem(FIRST_LAUNCH_PERMISSION_KEY) === "1";
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
    return;
  }
  await refreshNativeNotificationPermission();
}
