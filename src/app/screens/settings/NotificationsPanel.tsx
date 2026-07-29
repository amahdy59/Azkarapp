import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Info, MapPin } from "../../components/icons";
import { t } from "../../i18n";
import { CALCULATION_METHODS, DEFAULT_LOCATION, detectUserCoordinates } from "../../content/prayerCalculation";
import type { AppLanguage, LocationSettings, ReminderSettings } from "../../types";
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
  const [latitudeDraft, setLatitudeDraft] = useState(String(locationSettings?.latitude ?? ""));
  const [longitudeDraft, setLongitudeDraft] = useState(String(locationSettings?.longitude ?? ""));
  const [cityDraft, setCityDraft] = useState(locationSettings?.cityName ?? "");
  const [timeZoneDraft, setTimeZoneDraft] = useState(locationSettings?.timeZone ?? "");

  useEffect(() => {
    setLatitudeDraft(String(locationSettings?.latitude ?? ""));
    setLongitudeDraft(String(locationSettings?.longitude ?? ""));
    setCityDraft(locationSettings?.cityName ?? "");
    setTimeZoneDraft(locationSettings?.timeZone ?? "");
  }, [locationSettings?.cityName, locationSettings?.latitude, locationSettings?.longitude, locationSettings?.timeZone]);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationStatus(null);
    const coords = await detectUserCoordinates();
    setIsDetectingLocation(false);

    if (coords && onLocationChange) {
      onLocationChange({
        ...(locationSettings ?? { calculationMethod: 5, autoDetect: true }),
        latitude: coords.latitude,
        longitude: coords.longitude,
        cityName: `${coords.latitude.toFixed(2)}°, ${coords.longitude.toFixed(2)}°`,
        autoDetect: true,
        timeZone: coords.timeZone,
      });
      setLocationStatus(isArabic ? "تم تحديث الموقع بنجاح!" : "Location updated successfully!");
    } else {
      setLocationStatus(
        isArabic
          ? "تعذر تحديد الموقع. يرجى التأكد من السماح بإذن الموقع في المتصفح."
          : "Could not detect location. Please check browser location permissions.",
      );
    }
  };

  const handleMethodChange = (methodId: number) => {
    if (onLocationChange) {
      onLocationChange({
        ...(locationSettings ?? DEFAULT_LOCATION),
        calculationMethod: methodId,
      });
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
      return;
    }
    onLocationChange?.({
      ...(locationSettings ?? DEFAULT_LOCATION),
      latitude,
      longitude,
      cityName: cityDraft.trim() || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
      autoDetect: false,
      timeZone: timeZoneDraft.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setLocationStatus(isArabic ? "تم حفظ الموقع اليدوي." : "Manual location saved.");
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
        {/* Location & Prayer Times Section */}
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="prayer-location-title">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <MapPin size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="prayer-location-title" className="text-[1.0625rem] font-semibold text-foreground">
                {isArabic ? "الموقع ومواقيت الصلاة" : "Location & Prayer Times"}
              </h2>
              <p className="mt-1 text-[0.875rem] leading-[22px] text-muted-foreground">
                {isArabic
                  ? "يتم حساب مواقيت الصلاة بدقة بناءً على موقعك الجغرافي والتوقيت الصيفي."
                  : "Prayer times are calculated accurately based on your location and local DST."}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60 transition-colors"
            >
              {isDetectingLocation
                ? isArabic
                  ? "جارٍ تحديد الموقع..."
                  : "Detecting location..."
                : isArabic
                  ? "تحديد موقعي تلقائيًا"
                  : "Detect My Location"}
            </button>

            {locationStatus && (
              <p className="text-[0.8125rem] font-medium text-foreground bg-muted p-2.5 rounded-lg">{locationStatus}</p>
            )}

            <div className="pt-2">
              <label
                htmlFor="calculation-method-select"
                className="block text-[0.875rem] font-bold text-foreground mb-1.5"
              >
                {isArabic ? "طريقة حساب مواقيت الصلاة" : "Calculation Method"}
              </label>
              <select
                id="calculation-method-select"
                value={locationSettings?.calculationMethod ?? 5}
                onChange={(e) => handleMethodChange(Number(e.target.value))}
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
                {isArabic ? "تحديد الموقع يدويًا" : "Manual Location"}
              </legend>
              <input
                type="text"
                value={cityDraft}
                onChange={(event) => setCityDraft(event.target.value)}
                placeholder={isArabic ? "اسم المدينة" : "City name"}
                aria-label={isArabic ? "اسم المدينة" : "City name"}
                className="h-11 w-full rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground"
              />
              <input
                type="text"
                value={timeZoneDraft}
                onChange={(event) => setTimeZoneDraft(event.target.value)}
                placeholder={isArabic ? "المنطقة الزمنية، مثال: Africa/Cairo" : "Time zone, e.g. Africa/Cairo"}
                aria-label={isArabic ? "المنطقة الزمنية" : "IANA time zone"}
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
                  placeholder={isArabic ? "خط العرض" : "Latitude"}
                  aria-label={isArabic ? "خط العرض" : "Latitude"}
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
                  placeholder={isArabic ? "خط الطول" : "Longitude"}
                  aria-label={isArabic ? "خط الطول" : "Longitude"}
                  dir="ltr"
                  className="h-11 min-w-0 rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground"
                />
              </div>
              <button
                type="button"
                onClick={handleManualLocationSave}
                className="min-h-11 w-full rounded-xl border border-primary px-4 font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                {isArabic ? "حفظ الموقع" : "Save Location"}
              </button>
            </fieldset>

            <fieldset className="border-t border-border pt-4">
              <legend className="mb-2 text-[0.875rem] font-bold text-foreground">
                {isArabic ? "تعديل الدقائق يدويًا" : "Manual Minute Adjustments"}
              </legend>
              <p className="mb-3 text-[0.75rem] leading-5 text-muted-foreground">
                {isArabic
                  ? "استخدم قيمة موجبة أو سالبة لضبط كل صلاة (من ‎-120 إلى 120 دقيقة)."
                  : "Use positive or negative values per prayer (-120 to 120 minutes)."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["fajr", isArabic ? "الفجر" : "Fajr"],
                    ["dhuhr", isArabic ? "الظهر" : "Dhuhr"],
                    ["asr", isArabic ? "العصر" : "Asr"],
                    ["maghrib", isArabic ? "المغرب" : "Maghrib"],
                    ["isha", isArabic ? "العشاء" : "Isha"],
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
