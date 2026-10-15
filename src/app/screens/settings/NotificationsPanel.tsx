import { isNativeAndroid } from "../../native/platform";
import { refreshNativeNotificationPermission } from "../../native/reminders";
import { useEffect, useRef, useState } from "react";
import {
  readNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
  type BrowserNotificationPermission,
} from "../../notifications";
import { ToggleTrack } from "../../components/SettingsRow";
import { FIELD_CONTROL_CLASS } from "../../components/FormField";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Bell, CheckCircle2, ChevronDown } from "../../components/icons";
import { t } from "../../i18n";
import { formatNumerals } from "../../formatting";

import type { AppLanguage, PrayerName, PrayerReminderLeadMinutes, ReminderSettings } from "../../types";
import { SubHeader } from "./SettingsPrimitives";

type ReminderKind = "morning" | "evening" | "before_sleep" | "after_prayer";

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
    <div className="border-b border-border/40 p-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Bell size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-subtitle font-bold text-foreground">{label}</span>
          <span className="mt-0.5 block text-label text-muted-foreground">
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
          <ToggleTrack checked={schedule.enabled} />
        </button>
      </div>
      <label
        className="mt-4 flex flex-col gap-1.5 text-label font-bold text-foreground"
        htmlFor={`${kind}-reminder-time`}
      >
        <span>{t(language, "notifications.timeLabel")}</span>
        <input
          id={`${kind}-reminder-time`}
          type="time"
          value={schedule.time}
          disabled={!schedule.enabled}
          onChange={(event) => onTimeChange(event.target.value)}
          className={FIELD_CONTROL_CLASS}
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
  const isArabic = language === "ar";
  const [permission, setPermission] = useState<BrowserNotificationPermission>(readNotificationPermission);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequestError, setHasRequestError] = useState(false);
  const [permissionAttemptBlocked, setPermissionAttemptBlocked] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const testPending = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const refreshPermission = () => {
      if (document.visibilityState !== "visible") return;
      if (isNativeAndroid())
        void refreshNativeNotificationPermission()
          .then(setPermission)
          .catch(() => setHasRequestError(true));
      else setPermission(readNotificationPermission());
      setPermissionAttemptBlocked(false);
      setHasRequestError(false);
    };
    refreshPermission();
    const nativePermissionChanged = () => setPermission(readNotificationPermission());
    window.addEventListener("azkar-notification-permission", nativePermissionChanged);
    window.addEventListener("focus", refreshPermission);
    document.addEventListener("visibilitychange", refreshPermission);
    return () => {
      mounted.current = false;
      window.removeEventListener("azkar-notification-permission", nativePermissionChanged);
      window.removeEventListener("focus", refreshPermission);
      document.removeEventListener("visibilitychange", refreshPermission);
    };
  }, []);

  const requestPermission = async () => {
    if (!isNativeAndroid() && !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }

    try {
      setHasRequestError(false);
      setPermissionAttemptBlocked(false);
      setIsRequesting(true);
      const next = await requestNotificationPermission();
      setPermission(next);
      setPermissionAttemptBlocked(next !== "granted");
      return next;
    } catch {
      setHasRequestError(true);
      return permission;
    } finally {
      setIsRequesting(false);
    }
  };

  const sendTestNotification = async () => {
    if (testPending.current) return;
    testPending.current = true;
    setIsTesting(true);
    setTestStatus(null);
    try {
      const options: NotificationOptions = {
        body: t(language, "notifications.testBody"),
        icon: `${window.location.origin}${import.meta.env.BASE_URL}192.png`,
        badge: `${window.location.origin}${import.meta.env.BASE_URL}192.png`,
        tag: "azkar-test",
        data: { url: `${import.meta.env.BASE_URL}#/settings/notifications` },
      };
      const sent = await showBrowserNotification(
        t(language, "notifications.testTitle"),
        options,
        () => mounted.current,
      );
      if (mounted.current) {
        setPermission(readNotificationPermission());
        setTestStatus(t(language, sent ? "notifications.testSent" : "notifications.testFailed"));
      }
    } finally {
      testPending.current = false;
      if (mounted.current) setIsTesting(false);
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
    const effectivePermission = enabling && permission === "default" ? await requestPermission() : permission;
    if (enabling && effectivePermission !== "granted") {
      setPermissionAttemptBlocked(true);
      return;
    }
    updateSchedule(kind, { enabled: enabling });
  };

  const togglePrayerReminder = async () => {
    const enabling = !reminders.prayer.enabled;
    const effectivePermission = enabling && permission === "default" ? await requestPermission() : permission;
    if (enabling && effectivePermission !== "granted") {
      setPermissionAttemptBlocked(true);
      return;
    }
    onRemindersChange({ ...reminders, prayer: { ...reminders.prayer, enabled: enabling } });
  };

  const anyReminderEnabled =
    reminders.prayer.enabled ||
    reminders.morning.enabled ||
    reminders.evening.enabled ||
    reminders.before_sleep.enabled ||
    reminders.after_prayer.enabled;

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "notifications.title")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        <p className="text-sm text-muted-foreground">{t(language, "notifications.availabilityShort")}</p>

        <section
          className="rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
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
              <h2 id="notification-permission" className="text-title font-semibold text-foreground">
                {t(language, "notifications.permission")}
              </h2>
              <p className="mt-1 text-sm leading-[22px] text-muted-foreground">
                {permissionCopy(permission, language)}
              </p>
            </div>
          </div>

          {permission === "default" && (
            <Button
              type="button"
              onClick={() => void requestPermission()}
              disabled={isRequesting}
              className="mt-4 w-full"
            >
              {isRequesting
                ? t(language, "notifications.requestingPermission")
                : t(language, "notifications.requestPermission")}
            </Button>
          )}

          {hasRequestError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {t(language, "notifications.permissionError")}
            </p>
          )}
          {(permission === "denied" || permission === "unsupported") && (
            <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-label leading-5 text-foreground">
              {t(language, "notifications.permissionBlockedAction")}
            </p>
          )}
          {permissionAttemptBlocked && (
            <p className="mt-3 text-sm font-semibold text-destructive" role="alert">
              {t(language, "notifications.permissionRequired")}
            </p>
          )}
        </section>

        <section
          className="rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
          aria-labelledby="prayer-reminders-title"
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Bell size={21} />
            </span>
            <span className="min-w-0 flex-1 text-start">
              <h2 id="prayer-reminders-title" className="text-title font-bold text-foreground">
                {t(language, "notifications.prayerReminders")}
              </h2>
            </span>
            <button
              type="button"
              role="switch"
              aria-label={t(language, "notifications.prayerReminders")}
              aria-checked={reminders.prayer.enabled}
              onClick={() => void togglePrayerReminder()}
              className="flex h-11 w-12 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <ToggleTrack checked={reminders.prayer.enabled} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-1.5 text-label font-bold text-foreground">
            <span id="prayer-reminder-lead-label">{t(language, "notifications.prayerReminderLead")}</span>
            <Select
              value={String(reminders.prayer.leadMinutes)}
              disabled={!reminders.prayer.enabled}
              onValueChange={(value) =>
                onRemindersChange({
                  ...reminders,
                  prayer: {
                    ...reminders.prayer,
                    leadMinutes: Number(value) as PrayerReminderLeadMinutes,
                  },
                })
              }
              dir={isArabic ? "rtl" : "ltr"}
            >
              <SelectTrigger
                id="prayer-reminder-lead"
                aria-labelledby="prayer-reminder-lead-label"
                className="font-semibold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 5, 10, 15, 20, 30].map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {minutes === 0
                      ? t(language, "notifications.atPrayerTime")
                      : t(language, "notifications.minutesBefore", { minutes: formatNumerals(minutes, language) })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <fieldset className="mt-4 space-y-2">
            <legend className="text-label font-bold text-foreground">
              {t(language, "notifications.prayerSelection")}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((prayer: PrayerName) => {
                const selected = reminders.prayer.prayers?.includes(prayer) ?? true;
                return (
                  <label
                    key={prayer}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-border/50 px-3 text-sm font-semibold"
                  >
                    <input
                      type="checkbox"
                      disabled={!reminders.prayer.enabled}
                      checked={selected}
                      onChange={() =>
                        onRemindersChange({
                          ...reminders,
                          prayer: {
                            ...reminders.prayer,
                            prayers: selected
                              ? (reminders.prayer.prayers ?? ["fajr", "dhuhr", "asr", "maghrib", "isha"]).filter(
                                  (item) => item !== prayer,
                                )
                              : [...(reminders.prayer.prayers ?? []), prayer],
                          },
                        })
                      }
                      className="size-4 accent-primary"
                    />
                    {t(language, `notifications.${prayer}`)}
                  </label>
                );
              })}
            </div>
          </fieldset>
          {permission === "granted" && (
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              disabled={isTesting}
              onClick={() => void sendTestNotification()}
            >
              {t(language, isTesting ? "notifications.testSending" : "notifications.testNotification")}
            </Button>
          )}
          {testStatus && (
            <p className="mt-2 text-label text-muted-foreground" role="status">
              {testStatus}
            </p>
          )}
        </section>

        <section aria-labelledby="gentle-reminders-title">
          <div className="mb-3 px-1">
            <h2 id="gentle-reminders-title" className="text-title font-bold text-foreground">
              {t(language, "notifications.scheduleTitle")}
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            {(["morning", "evening", "before_sleep", "after_prayer"] as const).map((kind) => (
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
            className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 rounded-3xl border border-border/40 bg-card p-4 text-start shadow-raised focus-within:ring-[3px] focus-within:ring-ring"
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
              <span className="block text-sm font-bold text-foreground">
                {t(language, "notifications.onlyIfIncomplete")}
              </span>
              <span className="mt-1 block text-label leading-5 text-muted-foreground">
                {t(language, "notifications.onlyIfIncompleteHint")}
              </span>
            </span>
          </label>
          {anyReminderEnabled && permission === "granted" && (
            <p className="mt-3 rounded-xl bg-primary/10 px-4 py-3 text-label leading-5 text-foreground" role="status">
              {t(language, isNativeAndroid() ? "notifications.nativeActiveNotice" : "notifications.activeNotice")}
            </p>
          )}
        </section>
        <details className="group border-t border-border/40">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            {t(language, "settings.moreDetails")}
            <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
          </summary>
          <p className="text-sm text-muted-foreground">
            {t(language, isNativeAndroid() ? "notifications.nativeAvailabilityBody" : "notifications.availabilityBody")}
          </p>
        </details>
      </div>
    </div>
  );
}
