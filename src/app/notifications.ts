import { isNativeAndroid } from "./native/platform";
import { nativeNotificationPermission, refreshNativeNotificationPermission } from "./native/reminders";

export type BrowserNotificationPermission = NotificationPermission | "unsupported";

export function readNotificationPermission(): BrowserNotificationPermission {
  if (isNativeAndroid()) return nativeNotificationPermission();
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (isNativeAndroid()) return refreshNativeNotificationPermission(true);
  return "Notification" in window ? Notification.requestPermission() : "unsupported";
}

/** Use an already active worker; `ready` can remain pending forever on an unregistered page. */
export async function showBrowserNotification(
  title: string,
  options: NotificationOptions,
  isCurrent: () => boolean = () => true,
): Promise<boolean> {
  try {
    if (!isCurrent() || readNotificationPermission() !== "granted") return false;
    if (isNativeAndroid()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      if (!isCurrent()) return false;
      await LocalNotifications.schedule({
        notifications: [{ id: 9999, title, body: options.body ?? "", extra: { route: "#/settings/notifications" } }],
      });
      return true;
    }
    const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (!isCurrent() || readNotificationPermission() !== "granted") return false;
    if (registration?.active) await registration.showNotification(title, options);
    else new Notification(title, options);
    return true;
  } catch {
    // Mobile browsers may require an active worker and reject the constructor.
    return false;
  }
}
