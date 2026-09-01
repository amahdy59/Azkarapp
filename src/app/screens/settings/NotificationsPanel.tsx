import { useEffect, useRef, useState } from "react";
import { FIELD_CONTROL_CLASS, FormField } from "../../components/FormField";
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
import { searchPrayerLocations, type PrayerLocationPreset } from "../../content/prayerLocations";
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
        className="mt-4 flex flex-col gap-1.5 text-[0.8125rem] font-bold text-foreground"
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
  const [citySearch, setCitySearch] = useState("");
  // Which coordinate the last save attempt rejected, so the message can sit on
  // that field rather than only in the status line under the form.
  const [invalidCoordinates, setInvalidCoordinates] = useState({ latitude: false, longitude: false });
  const locationRequestId = useRef(0);
  const timeZoneStatus = getTimeZoneStatus(new Date(), locationSettings?.timeZone ?? DEFAULT_LOCATION.timeZone);
  const cityResults = searchPrayerLocations(citySearch);

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
    const latitudeInvalid = !Number.isFinite(latitude) || latitude < -90 || latitude > 90;
    const longitudeInvalid = !Number.isFinite(longitude) || longitude < -180 || longitude > 180;
    setInvalidCoordinates({ latitude: latitudeInvalid, longitude: longitudeInvalid });
    if (latitudeInvalid || longitudeInvalid) {
      setLocationStatus(t(language, "notifications.invalidCoordinates"));
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

  const handleCitySelect = (location: PrayerLocationPreset) => {
    locationRequestId.current += 1;
    const localizedCityName = isArabic ? location.nameArabic : location.nameEnglish;
    setCityDraft(location.nameEnglish);
    setTimeZoneDraft(location.timeZone);
    setLatitudeDraft(String(location.latitude));
    setLongitudeDraft(String(location.longitude));
    onLocationChange?.({
      ...(locationSettings ?? DEFAULT_LOCATION),
      latitude: location.latitude,
      longitude: location.longitude,
      cityName: location.nameEnglish,
      autoDetect: false,
      timeZone: location.timeZone,
    });
    setLocationStatus(t(language, "notifications.citySelected", { city: localizedCityName }));
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
                {t(language, "notifications.prayerCalculationDescription")}
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
              {t(
                language,
                timeZoneStatus.daylightSavingActive
                  ? "notifications.daylightSavingActive"
                  : timeZoneStatus.observesDaylightSaving
                    ? "notifications.standardTimeActive"
                    : "notifications.noSeasonalTimeChange",
              )}
            </p>
            <p className="mt-1 text-[0.75rem] leading-5 text-muted-foreground">
              {t(
                language,
                locationSettings?.autoDetect
                  ? "notifications.automaticTimeZoneHint"
                  : "notifications.manualTimeZoneHint",
              )}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <Button type="button" onClick={handleDetectLocation} disabled={isDetectingLocation} className="w-full">
              {isDetectingLocation
                ? t(language, "notifications.detectingLocation")
                : t(language, "notifications.detectLocation")}
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
                {t(language, "notifications.chooseCity")}
              </legend>
              <p className="text-[0.75rem] leading-5 text-muted-foreground">
                {t(language, "notifications.citySearchHint")}
              </p>
              <input
                type="search"
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                placeholder={t(language, "notifications.citySearchPlaceholder")}
                aria-label={t(language, "notifications.citySearchLabel")}
                className="h-11 w-full rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground"
              />
              <p className="text-[0.75rem] font-semibold text-muted-foreground">
                {t(language, citySearch.trim() ? "notifications.cityResults" : "notifications.popularCities")}
              </p>
              {cityResults.length > 0 ? (
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {cityResults.map((location) => {
                    const cityName = isArabic ? location.nameArabic : location.nameEnglish;
                    const countryName = isArabic ? location.countryArabic : location.countryEnglish;
                    const isSelected =
                      locationSettings?.latitude === location.latitude &&
                      locationSettings?.longitude === location.longitude;
                    return (
                      <li key={location.id}>
                        <button
                          type="button"
                          onClick={() => handleCitySelect(location)}
                          aria-pressed={isSelected}
                          className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-border-control bg-background px-3 py-2 text-start text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/10"
                        >
                          <MapPin size={17} className="shrink-0 text-primary" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block text-[0.8125rem] font-bold">{cityName}</span>
                            <span className="block text-[0.75rem] text-muted-foreground">{countryName}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-xl bg-muted p-3 text-[0.8125rem] text-muted-foreground" role="status">
                  {t(language, "notifications.noCitiesFound")}
                </p>
              )}
            </fieldset>

            <fieldset className="space-y-2 border-t border-border pt-4">
              <legend className="mb-2 text-[0.875rem] font-bold text-foreground">
                {t(language, "notifications.manualLocation")}
              </legend>
              <FormField
                label={t(language, "notifications.cityName")}
                type="text"
                value={cityDraft}
                onChange={(event) => setCityDraft(event.target.value)}
              />
              <FormField
                label={t(language, "notifications.timeZoneLabel")}
                type="text"
                value={timeZoneDraft}
                onChange={(event) => setTimeZoneDraft(event.target.value)}
                placeholder={t(language, "notifications.timeZonePlaceholder")}
                dir="ltr"
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  label={t(language, "notifications.latitude")}
                  type="number"
                  min="-90"
                  max="90"
                  step="0.0001"
                  value={latitudeDraft}
                  onChange={(event) => {
                    setLatitudeDraft(event.target.value);
                    setInvalidCoordinates((current) => ({ ...current, latitude: false }));
                  }}
                  error={invalidCoordinates.latitude ? t(language, "notifications.latitudeRange") : undefined}
                  inputMode="decimal"
                  dir="ltr"
                />
                <FormField
                  label={t(language, "notifications.longitude")}
                  type="number"
                  min="-180"
                  max="180"
                  step="0.0001"
                  value={longitudeDraft}
                  onChange={(event) => {
                    setLongitudeDraft(event.target.value);
                    setInvalidCoordinates((current) => ({ ...current, longitude: false }));
                  }}
                  error={invalidCoordinates.longitude ? t(language, "notifications.longitudeRange") : undefined}
                  inputMode="decimal"
                  dir="ltr"
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
                {t(language, "notifications.minuteAdjustmentHint")}
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
                      inputMode="numeric"
                      onWheel={(event) => event.currentTarget.blur()}
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
