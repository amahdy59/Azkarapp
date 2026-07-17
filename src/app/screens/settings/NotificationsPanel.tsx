import { useState } from "react";
import { Bell, CheckCircle2, Info } from "../../components/icons";
import { SubHeader } from "./SettingsPrimitives";

type BrowserNotificationPermission = NotificationPermission | "unsupported";

function readNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function permissionCopy(permission: BrowserNotificationPermission) {
  switch (permission) {
    case "granted":
      return "Browser permission is granted. Scheduled reminders are not configured in this build yet.";
    case "denied":
      return "Browser permission is blocked. You can change it from your browser or device settings.";
    case "unsupported":
      return "This browser does not support web notifications.";
    default:
      return "Permission has not been requested.";
  }
}

export function NotificationsPanel({ onBack }: { onBack: () => void }) {
  const [permission, setPermission] = useState<BrowserNotificationPermission>(readNotificationPermission);
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    try {
      setErrorMessage("");
      setIsRequesting(true);
      setPermission(await Notification.requestPermission());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not request notification permission.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3">
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="notification-availability">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted"
              aria-hidden="true"
            >
              <Info size={22} className="text-primary" />
            </span>
            <div>
              <h2 id="notification-availability" className="text-[17px] font-semibold text-foreground">
                Reminder availability
              </h2>
              <p className="mt-1 text-[14px] leading-[22px] text-muted-foreground">
                Scheduled reminders require a push service and are not active in this build. Your azkar and progress
                continue to work offline.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mt-4 rounded-2xl border border-border bg-card p-5"
          aria-labelledby="notification-permission"
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted"
              aria-hidden="true"
            >
              {permission === "granted" ? (
                <CheckCircle2 size={22} className="text-primary" />
              ) : (
                <Bell size={22} className="text-primary" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="notification-permission" className="text-[17px] font-semibold text-foreground">
                Browser permission
              </h2>
              <p className="mt-1 text-[14px] leading-[22px] text-muted-foreground">{permissionCopy(permission)}</p>
            </div>
          </div>

          {permission === "default" && (
            <button
              type="button"
              onClick={requestPermission}
              disabled={isRequesting}
              className="mt-4 min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isRequesting ? "Requesting permission…" : "Enable browser notifications"}
            </button>
          )}

          {errorMessage && (
            <p className="mt-3 text-[14px] text-destructive" role="alert">
              {errorMessage} Check your browser settings and try again.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
