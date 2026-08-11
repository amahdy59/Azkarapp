import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Bell, CheckCircle2, Info, MapPin } from "../../components/icons";
import { t } from "../../i18n";
import { InformationCard } from "./InformationCard";
import {
  CALCULATION_METHODS,
  DEFAULT_LOCATION,
  detectUserCoordinates,
  fetchAladhanPrayerData,
  formatUtcOffset,
  getTimeZoneStatus,
} from "../../content/prayerCalculation";
import type { AppLanguage, LocationSettings, ReminderSettings } from "../../types";
import { SubHeader } from "./SettingsPrimitives";

type BrowserNotificationPermission = NotificationPermission | "unsupported";
type ReminderKind = "morning" | "evening" | "before_sleep" | "after_prayer";

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
    <div className="rounded-3xl border border-border/40 bg-card p-4.5 shadow-raised">
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
  locationSettings,
  onRemindersChange,
  onLocationChange,
  onBack,
}: {
  language: AppLanguage;
  reminders: ReminderSettings;
  locationSettings?: LocationSettings;
  onRemindersChange: (value: ReminderSettings) => void;
  onLocationChange?: (value: LocationSettings) => void;
  onBack: () => void;
}) {
  const isArabic = language === "ar";
  const [permission, setPermission] = useState<BrowserNotificationPermission>(readNotificationPermission);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequestError, setHasRequestError] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationStatusIsError, setLocationStatusIsError] = useState(false);
  const [permissionAttemptBlocked, setPermissionAttemptBlocked] = useState(false);
  const [latitudeDraft, setLatitudeDraft] = useState(String(locationSettings?.latitude ?? ""));
  const [longitudeDraft, setLongitudeDraft] = useState(String(locationSettings?.longitude ?? ""));
  const [cityDraft, setCityDraft] = useState(locationSettings?.cityName ?? "");
  const [timeZoneDraft, setTimeZoneDraft] = useState(locationSettings?.timeZone ?? "");
  const locationRequestId = useRef(0);
  const timeZoneStatus = getTimeZoneStatus(new Date(), locationSettings?.timeZone ?? DEFAULT_LOCATION.timeZone);

  useEffect(() => {
    setLatitudeDraft(String(locationSettings?.latitude ?? ""));
    setLongitudeDraft(String(locationSettings?.longitude ?? ""));
    setCityDraft(locationSettings?.cityName ?? "");
    setTimeZoneDraft(locationSettings?.timeZone ?? "");
  }, [locationSettings?.cityName, locationSettings?.latitude, locationSettings?.longitude, locationSettings?.timeZone]);

  const handleDetectLocation = async () => {
    const requestId = ++locationRequestId.current;
    setIsDetectingLocation(true);
    setLocationStatus(null);
    setLocationStatusIsError(false);
    const result = await detectUserCoordinates();
    if (requestId !== locationRequestId.current) return;

    if (result.ok && onLocationChange) {
      const detectedLocation: LocationSettings = {
        ...(locationSettings ?? DEFAULT_LOCATION),
        latitude: result.latitude,
        longitude: result.longitude,
        cityName: `${result.latitude.toFixed(2)}°, ${result.longitude.toFixed(2)}°`,
        autoDetect: true,
        timeZone: result.timeZone ?? DEFAULT_LOCATION.timeZone,
      };
      onLocationChange(detectedLocation);

      const prayerData = await fetchAladhanPrayerData(
        new Date(),
        result.latitude,
        result.longitude,
        detectedLocation.calculationMethod,
      );
      if (prayerData && requestId === locationRequestId.current) {
        onLocationChange({
          ...detectedLocation,
          timeZone: prayerData.timeZone ?? detectedLocation.timeZone,
        });
      }
      setLocationStatus(
        t(language, prayerData ? "notifications.locationUpdated" : "notifications.prayerRefreshDeferred"),
      );
    } else {
      const reasonKey =
        result.ok || result.reason === "unknown"
          ? "Error"
          : `${result.reason[0]!.toUpperCase()}${result.reason.slice(1)}`;
      const key = `notifications.location${reasonKey}`;
      setLocationStatus(t(language, key));
      setLocationStatusIsError(true);
    }
    if (requestId === locationRequestId.current) {
      setIsDetectingLocation(false);
    }
  };

  const handleMethodChange = async (methodId: number) => {
    if (!onLocationChange) return;
    const requestId = ++locationRequestId.current;
    setIsDetectingLocation(false);

    const updatedLocation = {
      ...(locationSettings ?? DEFAULT_LOCATION),
      calculationMethod: methodId,
    };
    onLocationChange(updatedLocation);

    const prayerData = await fetchAladhanPrayerData(
      new Date(),
      updatedLocation.latitude ?? DEFAULT_LOCATION.latitude,
      updatedLocation.longitude ?? DEFAULT_LOCATION.longitude,
      methodId,
    );
    if (prayerData && requestId === locationRequestId.current) {
      onLocationChange({
        ...updatedLocation,
        timeZone: prayerData.timeZone ?? updatedLocation.timeZone,
      });
      setLocationStatus(t(language, "notifications.locationUpdated"));
      setLocationStatusIsError(false);
    } else if (requestId === locationRequestId.current) {
      setLocationStatus(t(language, "notifications.prayerRefreshDeferred"));
      setLocationStatusIsError(false);
    }
  };

  const handleManualLocationSave = () => {
    const latitude = Number(latitudeDraft);
    const longitude = Number(longitudeDraft);
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setLocationStatus(
        isArabic
          ? "أدخل خط عرض بين ‎-90 و90 وخط طول بين ‎-180 و180."
          : "Enter a latitude from -90 to 90 and longitude from -180 to 180.",
      );
      setLocationStatusIsError(true);
      return;
    }
    locationRequestId.current += 1;
    onLocationChange?.({
      ...(locationSettings ?? DEFAULT_LOCATION),
      latitude,
      longitude,
      cityName: cityDraft.trim() || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
      autoDetect: false,
      timeZone: timeZoneDraft.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setLocationStatus(t(language, "notifications.manualLocationSaved"));
    setLocationStatusIsError(false);
  };

  const handleAdjustmentChange = (prayer: keyof NonNullable<LocationSettings["adjustments"]>, value: number) => {
    onLocationChange?.({
      ...(locationSettings ?? DEFAULT_LOCATION),
      adjustments: {
        ...locationSettings?.adjustments,
        [prayer]: Math.max(-120, Math.min(120, Number.isFinite(value) ? Math.round(value) : 0)),
      },
    });
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }

    try {
      setHasRequestError(false);
      setPermissionAttemptBlocked(false);
      setIsRequesting(true);
      const next = await Notification.requestPermission();
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
      setPermissionAttemptBlocked(true);
      return;
    }
    updateSchedule(kind, { enabled: enabling });
  };

  const anyReminderEnabled =
    reminders.morning.enabled ||
    reminders.evening.enabled ||
    reminders.before_sleep.enabled ||
    reminders.after_prayer.enabled;

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "notifications.title")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        {/* Location & Prayer Times Section */}
        <section
          className="rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
          aria-labelledby="prayer-location-title"
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <MapPin size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="prayer-location-title" className="text-[1.0625rem] font-semibold text-foreground">
                {t(language, "notifications.locationPrayerTimes")}
              </h2>
              <p className="mt-1 text-[0.875rem] leading-[22px] text-muted-foreground">
                {isArabic
                  ? "يتم حساب مواقيت الصلاة بدقة بناءً على موقعك الجغرافي والتوقيت الصيفي."
                  : "Prayer times are calculated accurately based on your location and local DST."}
              </p>
            </div>
          </div>

          <div
            className="mt-4 rounded-xl border border-border bg-muted/50 p-3"
            data-testid="daylight-saving-status"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-[0.8125rem] text-foreground" dir="ltr">
                {timeZoneStatus.timeZone}
              </strong>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[0.75rem] font-bold text-primary" dir="ltr">
                {formatUtcOffset(timeZoneStatus.currentOffsetHours)}
              </span>
            </div>
            <p className="mt-2 text-[0.8125rem] font-semibold text-foreground">
              {timeZoneStatus.daylightSavingActive
                ? isArabic
                  ? "التوقيت الصيفي مُفعّل تلقائيًا لهذا التاريخ."
                  : "Daylight saving time is active automatically for this date."
                : timeZoneStatus.observesDaylightSaving
                  ? isArabic
                    ? "التوقيت القياسي مُفعّل حاليًا، وسيُطبّق التوقيت الصيفي تلقائيًا عند بدايته."
                    : "Standard time is active; daylight saving will apply automatically when it begins."
                  : isArabic
                    ? "هذه المنطقة الزمنية لا تستخدم تغييرًا موسميًا للتوقيت."
                    : "This time zone does not use a seasonal daylight-saving change."}
            </p>
            <p className="mt-1 text-[0.75rem] leading-5 text-muted-foreground">
              {locationSettings?.autoDetect
                ? isArabic
                  ? "يتحقق التطبيق من المنطقة الزمنية عبر الإحداثيات عند توفر الاتصال، ويستخدم الإعداد المحفوظ دون اتصال."
                  : "When online, the app checks the time zone from your coordinates; offline, it uses the saved setting."
                : isArabic
                  ? "تُستخدم هذه المنطقة الزمنية لحساب المواقيت دون اتصال."
                  : "This time zone is used for offline prayer calculations."}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <Button type="button" onClick={handleDetectLocation} disabled={isDetectingLocation} className="w-full">
              {isDetectingLocation
                ? isArabic
                  ? "جارٍ تحديد الموقع..."
                  : "Detecting location..."
                : isArabic
                  ? "تحديد موقعي تلقائيًا"
                  : "Detect My Location"}
            </Button>

            {locationStatus && (
              <p
                className={`rounded-lg p-2.5 text-[0.8125rem] font-medium ${locationStatusIsError ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"}`}
                role={locationStatusIsError ? "alert" : "status"}
              >
                {locationStatus}
              </p>
            )}

            <div className="pt-2">
              <label
                htmlFor="calculation-method-select"
                className="block text-[0.875rem] font-bold text-foreground mb-1.5"
              >
                {t(language, "notifications.calculationMethod")}
              </label>
              <select
                id="calculation-method-select"
                value={locationSettings?.calculationMethod ?? 5}
                onChange={(e) => void handleMethodChange(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-border-control bg-background px-3 text-[0.875rem] font-semibold text-foreground"
              >
                {Object.values(CALCULATION_METHODS).map((m) => (
                  <option key={m.id} value={m.id}>
                    {isArabic ? m.nameArabic : m.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="space-y-2 border-t border-border pt-4">
              <legend className="mb-2 text-[0.875rem] font-bold text-foreground">
                {t(language, "notifications.manualLocation")}
              </legend>
              <input
                type="text"
                value={cityDraft}
                onChange={(event) => setCityDraft(event.target.value)}
                placeholder={t(language, "notifications.cityName")}
                aria-label={t(language, "notifications.cityName")}
                className="h-11 w-full rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground"
              />
              <input
                type="text"
                value={timeZoneDraft}
                onChange={(event) => setTimeZoneDraft(event.target.value)}
                placeholder={t(language, "notifications.timeZonePlaceholder")}
                aria-label={t(language, "notifications.timeZoneLabel")}
                dir="ltr"
                className="h-11 w-full rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="0.0001"
                  value={latitudeDraft}
                  onChange={(event) => setLatitudeDraft(event.target.value)}
                  placeholder={t(language, "notifications.latitude")}
                  aria-label={t(language, "notifications.latitude")}
                  dir="ltr"
                  className="h-11 min-w-0 rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground"
                />
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="0.0001"
                  value={longitudeDraft}
                  onChange={(event) => setLongitudeDraft(event.target.value)}
                  placeholder={t(language, "notifications.longitude")}
                  aria-label={t(language, "notifications.longitude")}
                  dir="ltr"
                  className="h-11 min-w-0 rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleManualLocationSave}
                className="w-full border-primary text-primary hover:bg-primary/5"
              >
                {t(language, "notifications.saveLocation")}
              </Button>
            </fieldset>

            <fieldset className="border-t border-border pt-4">
              <legend className="mb-2 text-[0.875rem] font-bold text-foreground">
                {t(language, "notifications.manualMinuteAdjustments")}
              </legend>
              <p className="mb-3 text-[0.75rem] leading-5 text-muted-foreground">
                {isArabic
                  ? "استخدم قيمة موجبة أو سالبة لضبط كل صلاة (من ‎-120 إلى 120 دقيقة)."
                  : "Use positive or negative values per prayer (-120 to 120 minutes)."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["fajr", t(language, "notifications.fajr")],
                    ["dhuhr", t(language, "notifications.dhuhr")],
                    ["asr", t(language, "notifications.asr")],
                    ["maghrib", t(language, "notifications.maghrib")],
                    ["isha", t(language, "notifications.isha")],
                  ] as const
                ).map(([prayer, label]) => (
                  <label key={prayer} className="text-[0.75rem] font-semibold text-muted-foreground">
                    {label}
                    <input
                      type="number"
                      min="-120"
                      max="120"
                      value={locationSettings?.adjustments?.[prayer] ?? 0}
                      onChange={(event) => handleAdjustmentChange(prayer, Number(event.target.value))}
                      dir="ltr"
                      className="mt-1 h-10 w-full rounded-lg border border-border-control bg-background px-2 text-center text-[0.875rem] text-foreground"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <InformationCard
          icon={<Info size={20} aria-hidden="true" />}
          title={t(language, "notifications.availability")}
          body={t(language, "notifications.availabilityBody")}
        />

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
              <h2 id="notification-permission" className="text-[1.0625rem] font-semibold text-foreground">
                {t(language, "notifications.permission")}
              </h2>
              <p className="mt-1 text-[0.875rem] leading-[22px] text-muted-foreground">
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
            <p className="mt-3 text-[0.875rem] text-destructive" role="alert">
              {t(language, "notifications.permissionError")}
            </p>
          )}
          {(permission === "denied" || permission === "unsupported") && (
            <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-[0.8125rem] leading-5 text-foreground">
              {t(language, "notifications.permissionBlockedAction")}
            </p>
          )}
          {permissionAttemptBlocked && (
            <p className="mt-3 text-[0.875rem] font-semibold text-destructive" role="alert">
              {t(language, "notifications.permissionRequired")}
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
