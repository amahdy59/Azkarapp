import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Card } from "../../components/Card";
import { PrayerCalculationPicker } from "../../components/PrayerCalculationPicker";
import { Modal, ResponsiveSheet, SheetHeader } from "../../components/ResponsiveSheet";
import { PrayerCitySearch } from "../../components/PrayerCitySearch";
import { useNow } from "../../hooks/useNow";
import { FormField } from "../../components/FormField";
import { Button } from "../../components/ui/button";
import { ChevronDown, MapPin } from "../../components/icons";
import { t } from "../../i18n";
import {
  CALCULATION_METHODS,
  DEFAULT_LOCATION,
  detectUserCoordinates,
  formatUtcOffset,
  getTimeZoneStatus,
} from "../../content/prayerCalculation";
import {
  displayLocationName,
  PRAYER_LOCATION_PRESETS,
  searchPrayerLocations,
  type PrayerLocationPreset,
} from "../../content/prayerLocations";
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
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const cityTrigger = useRef<HTMLButtonElement>(null);
  const manualSaveTrigger = useRef<HTMLButtonElement>(null);
  const noticeTrigger = useRef<HTMLElement | null>(null);
  const noticeDescriptionId = useId();
  const direction = isArabic ? "rtl" : "ltr";
  // Which coordinate the last save attempt rejected, so the message can sit on
  // that field rather than only in the status line under the form.
  const [invalidCoordinates, setInvalidCoordinates] = useState({ latitude: false, longitude: false });
  const locationRequestId = useRef(0);
  const now = useNow();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const location = locationSettings ?? DEFAULT_LOCATION;
  const timeZone = location.timeZone ?? DEFAULT_LOCATION.timeZone;
  // City typing and method selection do not repeat a year's Intl samples.
  // The existing clock reconciles dates on foregrounding and pauses when hidden.
  const timeZoneStatus = useMemo(
    () => getTimeZoneStatus(new Date(year, month, day, 12), timeZone),
    [year, month, day, timeZone],
  );
  const selectedCity = PRAYER_LOCATION_PRESETS.find(
    (city) =>
      city.latitude === location.latitude &&
      city.longitude === location.longitude &&
      city.timeZone === location.timeZone &&
      [city.nameEnglish, city.nameArabic].includes(location.cityName ?? ""),
  );
  const methodOptions = Object.values(CALCULATION_METHODS).map((method) => ({
    id: method.id,
    label: isArabic ? method.nameArabic : method.nameEnglish,
    shortLabel: t(language, `prayerLocation.methodShort${method.id}`),
  }));
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

  const handleDetectLocation = async (trigger: HTMLButtonElement) => {
    const requestId = ++locationRequestId.current;
    setIsDetectingLocation(true);
    setLocationStatus(null);
    setLocationStatusIsError(false);
    setNoticeOpen(false);
    setAnnouncement(t(language, "notifications.detectingLocation"));
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
      setAnnouncement("");
      noticeTrigger.current = trigger;
      setNoticeOpen(true);
    }
  };

  const handleMethodChange = (methodId: number) => {
    if (!onLocationChange || !CALCULATION_METHODS[methodId]) return;
    // A pending detection must not overwrite a newer manual choice.
    locationRequestId.current += 1;
    setIsDetectingLocation(false);

    const updatedLocation = {
      ...(locationSettings ?? DEFAULT_LOCATION),
      calculationMethod: methodId,
    };
    onLocationChange(updatedLocation);
    setAnnouncement(
      t(language, "prayerLocation.methodApplied", {
        method: isArabic ? CALCULATION_METHODS[methodId]!.nameArabic : CALCULATION_METHODS[methodId]!.nameEnglish,
      }),
    );

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
      setAnnouncement(t(language, "notifications.invalidCoordinates"));
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
    noticeTrigger.current = manualSaveTrigger.current;
    setNoticeOpen(true);
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
    setCityPickerOpen(false);
    setAnnouncement(t(language, "notifications.citySelected", { city: localizedCityName }));
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
    <div className="prayer-location-panel flex h-full min-h-0 flex-col">
      <SubHeader title={t(language, "settings.prayerTimesAndLocation")} onBack={onBack} language={language} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3" data-testid="prayer-location-scroll">
        <Card as="section" padding="md" aria-labelledby="prayer-location-title" className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <MapPin size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="prayer-location-title" className="text-label text-muted-foreground">
                {t(language, "prayerLocation.locationUsed")}
              </h2>
              <p className="text-xl font-bold text-foreground" data-testid="prayer-location-name">
                {displayLocationName(location, language)}
              </p>
              <p className="text-label leading-relaxed text-muted-foreground">
                {selectedCity && !location.autoDetect && (
                  <>
                    {isArabic ? selectedCity.countryArabic : selectedCity.countryEnglish}
                    {" · "}
                  </>
                )}
                {location.autoDetect ? (
                  <bdi dir="ltr">
                    {location.latitude?.toFixed(2)}°, {location.longitude?.toFixed(2)}°
                  </bdi>
                ) : (
                  t(language, "prayerLocation.savedLocation")
                )}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              onClick={(event) => void handleDetectLocation(event.currentTarget)}
              disabled={isDetectingLocation}
              className="w-full"
            >
              {t(
                language,
                isDetectingLocation ? "notifications.detectingLocation" : "prayerLocation.useCurrentLocation",
              )}
            </Button>
            <Button
              ref={cityTrigger}
              type="button"
              variant="outline"
              className="w-full"
              aria-haspopup="dialog"
              aria-expanded={cityPickerOpen}
              onClick={(event) => {
                // Starting a manual flow supersedes an outstanding GPS lookup.
                locationRequestId.current += 1;
                setIsDetectingLocation(false);
                setAnnouncement("");
                event.currentTarget.focus({ preventScroll: true });
                setCityPickerOpen(true);
              }}
            >
              {t(language, "prayerLocation.chooseAnotherCity")}
            </Button>
          </div>
          <div
            className="flex flex-wrap items-center justify-between gap-2 text-label"
            data-testid="daylight-saving-status"
          >
            <bdi dir="ltr" className="font-semibold text-foreground">
              {timeZoneStatus.timeZone}
            </bdi>
            <bdi dir="ltr" className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">
              {formatUtcOffset(timeZoneStatus.currentOffsetHours)}
            </bdi>
          </div>
          <details className="group border-t border-border/40 pt-2">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg text-label font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              {t(language, "prayerLocation.timeZoneDetails")}
              <ChevronDown
                size={16}
                className="shrink-0 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="space-y-2 pt-2 text-label leading-relaxed text-muted-foreground">
              <p>
                {t(
                  language,
                  timeZoneStatus.daylightSavingActive
                    ? "notifications.daylightSavingActive"
                    : timeZoneStatus.observesDaylightSaving
                      ? "notifications.standardTimeActive"
                      : "notifications.noSeasonalTimeChange",
                )}
              </p>
              <p>
                {t(
                  language,
                  location.autoDetect ? "prayerLocation.deviceTimeZoneHint" : "notifications.manualTimeZoneHint",
                )}
              </p>
            </div>
          </details>
        </Card>
        <Card as="section" padding="md">
          <PrayerCalculationPicker
            language={language}
            options={methodOptions}
            value={location.calculationMethod ?? 5}
            onChange={handleMethodChange}
          />
        </Card>
        <Card as="section" padding="md">
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              <span className="min-w-0">
                {t(language, "settings.advancedPrayer")}
                <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                  {t(language, "prayerLocation.advancedHint")}
                </span>
              </span>
              <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-4 pt-2">
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
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                  ref={manualSaveTrigger}
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
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          </details>
        </Card>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
      <ResponsiveSheet
        open={cityPickerOpen}
        onClose={() => setCityPickerOpen(false)}
        title={t(language, "notifications.chooseCity")}
        direction={direction}
        language={language}
        protectedSurface
        focusOnOpen
        testId="prayer-city-sheet"
        drawerClassName="prayer-settings-surface"
        dialogClassName="prayer-settings-surface"
        onCloseAutoFocus={(event) => {
          if (cityTrigger.current?.isConnected) {
            event.preventDefault();
            cityTrigger.current.focus({ preventScroll: true });
          }
        }}
      >
        <SheetHeader
          title={t(language, "notifications.chooseCity")}
          language={language}
          onClose={() => setCityPickerOpen(false)}
          className="prayer-settings-heading"
        />
        <PrayerCitySearch
          language={language}
          query={citySearch}
          onQueryChange={setCitySearch}
          results={cityResults}
          onSelect={handleCitySelect}
          selectedId={selectedCity?.id}
        />
      </ResponsiveSheet>
      <Modal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        title={t(language, "prayerLocation.noticeTitle")}
        describedById={noticeDescriptionId}
        direction={direction}
        language={language}
        protectedSurface
        showCloseButton={false}
        testId="prayer-location-notice"
        className="prayer-settings-surface"
        onCloseAutoFocus={(event) => {
          if (noticeTrigger.current?.isConnected) {
            event.preventDefault();
            noticeTrigger.current.focus({ preventScroll: true });
          }
        }}
      >
        <SheetHeader
          title={t(language, "prayerLocation.noticeTitle")}
          language={language}
          onClose={() => setNoticeOpen(false)}
          className="prayer-settings-heading"
        />
        <p
          id={noticeDescriptionId}
          className={`min-h-0 overflow-y-auto px-5 py-4 text-sm leading-relaxed ${locationStatusIsError ? "text-destructive" : "text-foreground"}`}
        >
          {locationStatus}
        </p>
        <div className="shrink-0 border-t border-border/40 p-4">
          <Button className="w-full" onClick={() => setNoticeOpen(false)}>
            {t(language, "common.close")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
