import { useEffect, useRef, useState } from "react";
import { FIELD_CONTROL_CLASS, FIELD_LABEL_CLASS, FormField } from "../../components/FormField";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { MapPin } from "../../components/icons";
import { t } from "../../i18n";
import {
  CALCULATION_METHODS,
  DEFAULT_LOCATION,
  detectUserCoordinates,
  formatUtcOffset,
  getTimeZoneStatus,
} from "../../content/prayerCalculation";
import { searchPrayerLocations, type PrayerLocationPreset } from "../../content/prayerLocations";
import type { AppLanguage, LocationSettings } from "../../types";
import { SubHeader } from "./SettingsPrimitives";

export function PrayerLocationPanel({
  language,
  locationSettings,
  onLocationChange,
  onBack,
}: {
  language: AppLanguage;
  locationSettings?: LocationSettings;
  onLocationChange?: (value: LocationSettings) => void;
  onBack: () => void;
}) {
  const isArabic = language === "ar";
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationStatusIsError, setLocationStatusIsError] = useState(false);
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

  useEffect(
    () => () => {
      locationRequestId.current += 1;
    },
    [],
  );

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

      /* The time zone came back from the prayer-times API's metadata, which
         meant sending the reader's coordinates to a third party to learn
         something the device already knows: `detectUserCoordinates` reads it
         from `Intl.DateTimeFormat`. Times are calculated here, so there is
         nothing left to wait for and nothing deferred to report. */
      setLocationStatus(t(language, "notifications.locationUpdated"));
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
    // A pending detection must not overwrite a newer manual choice.
    locationRequestId.current += 1;
    setIsDetectingLocation(false);

    const updatedLocation = {
      ...(locationSettings ?? DEFAULT_LOCATION),
      calculationMethod: methodId,
    };
    onLocationChange(updatedLocation);

    /* Changing the method used to refetch. The calculation is local, so the
       new method applies to the next render without a request. */
  };

  const handleManualLocationSave = () => {
    const latitude = Number(latitudeDraft);
    const longitude = Number(longitudeDraft);
    const latitudeInvalid = !latitudeDraft.trim() || !Number.isFinite(latitude) || latitude < -90 || latitude > 90;
    const longitudeInvalid =
      !longitudeDraft.trim() || !Number.isFinite(longitude) || longitude < -180 || longitude > 180;
    setInvalidCoordinates({ latitude: latitudeInvalid, longitude: longitudeInvalid });
    if (latitudeInvalid || longitudeInvalid) {
      setLocationStatus(t(language, "notifications.invalidCoordinates"));
      setLocationStatusIsError(true);
      return;
    }
    locationRequestId.current += 1;
    setIsDetectingLocation(false);
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
    setIsDetectingLocation(false);
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
    locationRequestId.current += 1;
    setIsDetectingLocation(false);
    onLocationChange?.({
      ...(locationSettings ?? DEFAULT_LOCATION),
      adjustments: {
        ...locationSettings?.adjustments,
        [prayer]: Math.max(-120, Math.min(120, Number.isFinite(value) ? Math.round(value) : 0)),
      },
    });
  };

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "settings.prayerTimesAndLocation")} onBack={onBack} language={language} />
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
              <h2 id="prayer-location-title" className="text-title font-semibold text-foreground">
                {t(language, "notifications.locationPrayerTimes")}
              </h2>
              <p className="mt-1 text-sm leading-[22px] text-muted-foreground">
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
              <strong className="text-label text-foreground" dir="ltr">
                {timeZoneStatus.timeZone}
              </strong>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary" dir="ltr">
                {formatUtcOffset(timeZoneStatus.currentOffsetHours)}
              </span>
            </div>
            <p className="mt-2 text-label font-semibold text-foreground">
              {t(
                language,
                timeZoneStatus.daylightSavingActive
                  ? "notifications.daylightSavingActive"
                  : timeZoneStatus.observesDaylightSaving
                    ? "notifications.standardTimeActive"
                    : "notifications.noSeasonalTimeChange",
              )}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
                className={`rounded-lg p-2.5 text-label font-medium ${locationStatusIsError ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"}`}
                role={locationStatusIsError ? "alert" : "status"}
              >
                {locationStatus}
              </p>
            )}

            <div className="pt-2">
              <p id="calculation-method-label" className="mb-1.5 block text-sm font-bold text-foreground">
                {t(language, "notifications.calculationMethod")}
              </p>
              <Select
                value={String(locationSettings?.calculationMethod ?? 5)}
                onValueChange={(value) => void handleMethodChange(Number(value))}
                dir={isArabic ? "rtl" : "ltr"}
              >
                <SelectTrigger
                  id="calculation-method-select"
                  aria-labelledby="calculation-method-label"
                  className="font-semibold"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CALCULATION_METHODS).map((method) => (
                    <SelectItem key={method.id} value={String(method.id)}>
                      {isArabic ? method.nameArabic : method.nameEnglish}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <fieldset className="space-y-2 border-t border-border pt-4">
              <legend className="mb-2 text-sm font-bold text-foreground">
                {t(language, "notifications.chooseCity")}
              </legend>
              <p className="text-xs leading-5 text-muted-foreground">{t(language, "notifications.citySearchHint")}</p>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="city-search" className={FIELD_LABEL_CLASS}>
                  {t(language, "notifications.citySearchLabel")}
                </label>
                <input
                  id="city-search"
                  type="search"
                  value={citySearch}
                  onChange={(event) => setCitySearch(event.target.value)}
                  placeholder={t(language, "notifications.citySearchPlaceholder")}
                  className={FIELD_CONTROL_CLASS}
                />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
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
                            <span className="block text-label font-bold">{cityName}</span>
                            <span className="block text-xs text-muted-foreground">{countryName}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-xl bg-muted p-3 text-label text-muted-foreground" role="status">
                  {t(language, "notifications.noCitiesFound")}
                </p>
              )}
            </fieldset>

            <fieldset className="space-y-2 border-t border-border pt-4">
              <legend className="mb-2 text-sm font-bold text-foreground">
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
              <legend className="mb-2 text-sm font-bold text-foreground">
                {t(language, "notifications.manualMinuteAdjustments")}
              </legend>
              <p className="mb-3 text-xs leading-5 text-muted-foreground">
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
                  <label key={prayer} className="text-xs font-semibold text-muted-foreground">
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
                      className="mt-1 min-h-11 w-full rounded-lg border border-border-control bg-background px-2 text-center text-sm text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>
      </div>
    </div>
  );
}
