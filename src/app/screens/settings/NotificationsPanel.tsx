import { useState } from "react";
import { Bell, CheckCircle2, Info } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, ReminderSettings } from "../../types";
import { SubHeader } from "./SettingsPrimitives";

type BrowserNotificationPermission = NotificationPermission | "unsupported";
type ReminderKind = "morning" | "evening" | "before_sleep";

function readNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function permissionCopy(permission: BrowserNotificationPermission, language: AppLanguage) {
  switch (permission) {
    case "granted":
      return t(language, "notifications.permissionGranted");
    case "denied":
      return t(language, "notifications.permissionDenied");
    case "unsupported":
      return t(language, "notifications.permissionUnsupported");
    default:
      return t(language, "notifications.permissionDefault");
  }
}

function ReminderScheduleRow({
  kind,
  language,
  schedule,
  onToggle,
  onTimeChange,
}: {
  kind: ReminderKind;
  language: AppLanguage;
  schedule: ReminderSettings[ReminderKind];
  onToggle: () => void;
  onTimeChange: (time: string) => void;
}) {
  const label = t(language, `notifications.${kind}`);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Bell size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9375rem] font-bold text-foreground">{label}</span>
          <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">
            {schedule.enabled ? t(language, "notifications.enabled") : t(language, "notifications.disabled")}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-label={label}
          aria-checked={schedule.enabled}
          onClick={onToggle}
          className="flex h-11 w-12 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span
            aria-hidden="true"
            className={`relative h-7 w-12 rounded-full border transition-colors ${schedule.enabled ? "border-primary bg-primary" : "border-border-control bg-muted"}`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full shadow-sm transition-[inset] ${schedule.enabled ? "bg-primary-foreground" : "bg-foreground"}`}
              style={{ insetInlineStart: schedule.enabled ? "1.5rem" : "0.25rem" }}
            />
          </span>
        </button>
      </div>
      <label
        className="mt-4 flex items-center justify-between gap-3 text-[0.875rem] font-semibold text-foreground"
        htmlFor={`${kind}-reminder-time`}
      >
        <span>{label}</span>
        <input
          id={`${kind}-reminder-time`}
          type="time"
          value={schedule.time}
          disabled={!schedule.enabled}
          onChange={(event) => onTimeChange(event.target.value)}
          className="h-11 rounded-xl border border-border-control bg-background px-3 text-[0.875rem] font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          dir="ltr"
        />
      </label>
    </div>
  );
}

export function NotificationsPanel({
  language,
  reminders,
  onRemindersChange,
  onBack,
}: {
  language: AppLanguage;
  reminders: ReminderSettings;
  onRemindersChange: (value: ReminderSettings) => void;
  onBack: () => void;
}) {
  const [permission, setPermission] = useState<BrowserNotificationPermission>(readNotificationPermission);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequestError, setHasRequestError] = useState(false);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }

    try {
      setHasRequestError(false);
      setIsRequesting(true);
      const next = await Notification.requestPermission();
      setPermission(next);
      return next;
    } catch {
      setHasRequestError(true);
      return permission;
    } finally {
      setIsRequesting(false);
    }
  };

  const updateSchedule = (kind: ReminderKind, update: Partial<ReminderSettings[ReminderKind]>) => {
    onRemindersChange({
      ...reminders,
      [kind]: { ...reminders[kind], ...update },
    });
  };

  const toggleSchedule = async (kind: ReminderKind) => {
    const enabling = !reminders[kind].enabled;
    if (enabling && permission === "default") {
      const next = await requestPermission();
      if (next !== "granted") {
        return;
      }
    }
    if (enabling && permission !== "granted") {
      return;
    }
    updateSchedule(kind, { enabled: enabling });
  };

  const anyReminderEnabled = reminders.morning.enabled || reminders.evening.enabled || reminders.before_sleep.enabled;

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "notifications.title")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="notification-availability">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted"
              aria-hidden="true"
            >
              <Info size={22} className="text-primary" />
            </span>
            <div>
              <h2 id="notification-availability" className="text-[1.0625rem] font-semibold text-foreground">
                {t(language, "notifications.availability")}
              </h2>
              <p className="mt-1 text-[0.875rem] leading-[22px] text-muted-foreground">
                {t(language, "notifications.availabilityBody")}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="notification-permission">
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
              <h2 id="notification-permission" className="text-[1.0625rem] font-semibold text-foreground">
                {t(language, "notifications.permission")}
              </h2>
              <p className="mt-1 text-[0.875rem] leading-[22px] text-muted-foreground">
                {permissionCopy(permission, language)}
              </p>
            </div>
          </div>

          {permission === "default" && (
            <button
              type="button"
              onClick={() => void requestPermission()}
              disabled={isRequesting}
              className="mt-4 min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isRequesting
                ? t(language, "notifications.requestingPermission")
                : t(language, "notifications.requestPermission")}
            </button>
          )}

          {hasRequestError && (
            <p className="mt-3 text-[0.875rem] text-destructive" role="alert">
              {t(language, "notifications.permissionError")}
            </p>
          )}
        </section>

        <section aria-labelledby="gentle-reminders-title">
          <div className="mb-3 px-1">
            <h2 id="gentle-reminders-title" className="text-[1.0625rem] font-bold text-foreground">
              {t(language, "notifications.scheduleTitle")}
            </h2>
            <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">
              {t(language, "notifications.scheduleHint")}
            </p>
          </div>
          <div className="space-y-3">
            {(["morning", "evening", "before_sleep"] as const).map((kind) => (
              <ReminderScheduleRow
                key={kind}
                kind={kind}
                language={language}
                schedule={reminders[kind]}
                onToggle={() => void toggleSchedule(kind)}
                onTimeChange={(time) => updateSchedule(kind, { time })}
              />
            ))}
          </div>
          <label
            htmlFor="only-when-incomplete"
            className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-start focus-within:ring-[3px] focus-within:ring-ring"
          >
            <input
              id="only-when-incomplete"
              type="checkbox"
              aria-label={t(language, "notifications.onlyIfIncomplete")}
              checked={reminders.onlyWhenIncomplete}
              onChange={(event) => onRemindersChange({ ...reminders, onlyWhenIncomplete: event.target.checked })}
              className="mt-0.5 size-5 accent-primary"
            />
            <span>
              <span className="block text-[0.875rem] font-bold text-foreground">
                {t(language, "notifications.onlyIfIncomplete")}
              </span>
              <span className="mt-1 block text-[0.8125rem] leading-5 text-muted-foreground">
                {t(language, "notifications.onlyIfIncompleteHint")}
              </span>
            </span>
          </label>
          {anyReminderEnabled && permission === "granted" && (
            <p
              className="mt-3 rounded-xl bg-primary/10 px-4 py-3 text-[0.8125rem] leading-5 text-foreground"
              role="status"
            >
              {t(language, "notifications.activeNotice")}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
