export type BrowserNotificationPermission = NotificationPermission | "unsupported";

export function readNotificationPermission(): BrowserNotificationPermission {
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}

/** Use an already active worker; `ready` can remain pending forever on an unregistered page. */
export async function showBrowserNotification(
  title: string,
  options: NotificationOptions,
  isCurrent: () => boolean = () => true,
): Promise<boolean> {
  try {
    if (!isCurrent() || readNotificationPermission() !== "granted") return false;
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
