import { isNativeAndroid } from "./native/platform";
import { nativeNotificationPermission, refreshNativeNotificationPermission } from "./native/reminders";
import { parseHash } from "./routing";

export function notificationTarget(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, window.location.origin + import.meta.env.BASE_URL);
    const base = new URL(import.meta.env.BASE_URL, window.location.origin);
    return url.origin === base.origin && url.pathname === base.pathname && !url.search && parseHash(url.hash)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export type BrowserNotificationPermission = NotificationPermission | "unsupported";

/** iOS tab sessions need installation guidance, never an unusable permission action. */
export function notificationSetupEnvironment(): "android" | "ios-browser" | "browser" {
  if (isNativeAndroid()) return "android";
  const appleMobile =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)").matches === true;
  return appleMobile && !installed ? "ios-browser" : "browser";
}

export function readNotificationPermission(): BrowserNotificationPermission {
  if (isNativeAndroid()) return nativeNotificationPermission();
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (isNativeAndroid()) return refreshNativeNotificationPermission(true);
  const permission = "Notification" in window ? await Notification.requestPermission() : "unsupported";
  window.dispatchEvent(new Event("azkar-notification-permission"));
  return permission;
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
    else {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        notification.close();
        const target = notificationTarget(options.data?.url);
        if (target) {
          window.focus();
          window.location.hash = new URL(target).hash;
        }
      };
    }
    return true;
  } catch {
    // Mobile browsers may require an active worker and reject the constructor.
    return false;
  }
}
