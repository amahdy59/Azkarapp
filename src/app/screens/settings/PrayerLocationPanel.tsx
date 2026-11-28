import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Card } from "../../components/Card";
import { PrayerCalculationPicker } from "../../components/PrayerCalculationPicker";
import { PrayerMinuteAdjustments } from "../../components/PrayerMinuteAdjustments";
import { Modal, ResponsiveSheet, SheetHeader } from "../../components/ResponsiveSheet";
import { PrayerCitySearch } from "../../components/PrayerCitySearch";
import { SelectField } from "../../components/SelectField";
import { useNow } from "../../hooks/useNow";
import { Button } from "../../components/ui/button";
import { ChevronDown, MapPin } from "../../components/icons";
import { t } from "../../i18n";
import {
  CALCULATION_METHODS,
  DEFAULT_LOCATION,
  detectUserCoordinates,
  formatUtcOffset,
  getTimeZoneOffsetHours,
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
  const [citySearch, setCitySearch] = useState("");
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const cityTrigger = useRef<HTMLButtonElement>(null);
  const noticeTrigger = useRef<HTMLElement | null>(null);
  const noticeDescriptionId = useId();
  const direction = isArabic ? "rtl" : "ltr";
  const locationRequestId = useRef(0);
  const now = useNow();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const location = locationSettings ?? DEFAULT_LOCATION;
  const timeZone = location.timeZone ?? DEFAULT_LOCATION.timeZone!;
  // Search/selection does not repeat annual Intl sampling. Foreground/date/zone
  // changes still reconcile through the existing visibility-aware clock.
  const timeZoneStatus = useMemo(
    () => getTimeZoneStatus(new Date(year, month, day, 12), timeZone),
    [year, month, day, timeZone],
  );
  const timeZoneOptions = useMemo(() => {
    const date = new Date(year, month, day, 12);
    const zones = new Map<string, string>();
    for (const city of PRAYER_LOCATION_PRESETS) {
      if (zones.has(city.timeZone)) continue;
      zones.set(
        city.timeZone,
        t(language, "prayerLocation.cityCountry", {
          city: isArabic ? city.nameArabic : city.nameEnglish,
          country: isArabic ? city.countryArabic : city.countryEnglish,
        }),
      );
    }
    // Existing custom zones remain selected and are never silently rewritten.
    if (!zones.has(timeZone)) zones.set(timeZone, timeZone.replaceAll("_", " "));
    return [...zones].map(([value, label]) => ({
      value,
      label: `${label} · ${formatUtcOffset(getTimeZoneOffsetHours(date, value))}`,
    }));
  }, [year, month, day, timeZone, language, isArabic]);
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
  const cityResults = citySearch.trim()
    ? searchPrayerLocations(citySearch, PRAYER_LOCATION_PRESETS.length)
    : [...PRAYER_LOCATION_PRESETS];

  useEffect(
    () => () => {
      locationRequestId.current += 1;
    },
    [],
  );

  const cancelDetection = () => {
    locationRequestId.current += 1;
    setIsDetectingLocation(false);
  };

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
        ...location,
        latitude: result.latitude,
        longitude: result.longitude,
        cityName: `${result.latitude.toFixed(2)}°, ${result.longitude.toFixed(2)}°`,
        autoDetect: true,
        timeZone: result.timeZone ?? DEFAULT_LOCATION.timeZone,
      };
      onLocationChange(detectedLocation);
      setLocationStatus(
        `${t(language, "notifications.locationUpdated")} ${displayLocationName(detectedLocation, language)}`,
      );
    } else {
      const reasonKey =
        result.ok || result.reason === "unknown"
          ? "Error"
          : `${result.reason[0]!.toUpperCase()}${result.reason.slice(1)}`;
      setLocationStatus(t(language, `notifications.location${reasonKey}`));
      setLocationStatusIsError(true);
    }
    setIsDetectingLocation(false);
    setAnnouncement("");
    noticeTrigger.current = trigger;
    setNoticeOpen(true);
  };

  const handleMethodChange = (methodId: number) => {
    if (!onLocationChange || !CALCULATION_METHODS[methodId]) return;
    cancelDetection();
    onLocationChange({ ...location, calculationMethod: methodId });
    setAnnouncement(
      t(language, "prayerLocation.methodApplied", {
        method: isArabic ? CALCULATION_METHODS[methodId]!.nameArabic : CALCULATION_METHODS[methodId]!.nameEnglish,
      }),
    );
  };

  const handleCitySelect = (city: PrayerLocationPreset) => {
    cancelDetection();
    onLocationChange?.({
      ...location,
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: city.nameEnglish,
      autoDetect: false,
      timeZone: city.timeZone,
    });
    setCityPickerOpen(false);
    setAnnouncement(t(language, "notifications.citySelected", { city: isArabic ? city.nameArabic : city.nameEnglish }));
  };

  const handleTimeZoneChange = (value: string) => {
    if (!timeZoneOptions.some((option) => option.value === value)) return;
    cancelDetection();
    onLocationChange?.({ ...location, timeZone: value });
    setAnnouncement(t(language, "prayerLocation.timeZoneApplied"));
  };

  const handleAdjustmentChange = (prayer: keyof NonNullable<LocationSettings["adjustments"]>, value: number) => {
    cancelDetection();
    const minutes = Math.max(-120, Math.min(120, Math.round(value)));
    onLocationChange?.({ ...location, adjustments: { ...location.adjustments, [prayer]: minutes } });
    setAnnouncement(
      t(language, "prayerLocation.adjustmentApplied", {
        prayer: t(language, `notifications.${prayer}`),
        value: new Intl.NumberFormat(language, { signDisplay: "exceptZero" }).format(minutes),
      }),
    );
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
              <p className="text-label text-muted-foreground">
                {t(language, location.autoDetect ? "prayerLocation.deviceLocation" : "prayerLocation.savedLocation")}
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
                cancelDetection();
                setAnnouncement("");
                setCitySearch("");
                event.currentTarget.focus({ preventScroll: true });
                setCityPickerOpen(true);
              }}
            >
              {t(language, "prayerLocation.chooseAnotherCity")}
            </Button>
          </div>
        </Card>
        <Card as="section" padding="md" className="space-y-4">
          <PrayerCalculationPicker
            language={language}
            options={methodOptions}
            value={location.calculationMethod ?? 5}
            onChange={handleMethodChange}
          />
          <details className="group border-t border-border/40 pt-2" data-testid="prayer-more-settings">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg text-label font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              {t(language, "prayerLocation.moreSettings")}
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="space-y-4 pt-3">
              <SelectField
                label={t(language, "prayerLocation.timeZone")}
                hint={t(language, "prayerLocation.automaticTimeZoneHint")}
                value={timeZone}
                options={timeZoneOptions}
                onChange={handleTimeZoneChange}
                direction={direction}
                contentClassName="prayer-method-popup"
              />
              <div
                className="space-y-2 text-xs leading-relaxed text-muted-foreground"
                data-testid="daylight-saving-status"
              >
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
              </div>
              <PrayerMinuteAdjustments
                language={language}
                value={location.adjustments ?? {}}
                onChange={handleAdjustmentChange}
                onReset={() => {
                  cancelDetection();
                  onLocationChange?.({ ...location, adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 } });
                  setAnnouncement(t(language, "prayerLocation.adjustmentsReset"));
                }}
              />
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
          emptyMessage={t(language, "prayerLocation.noCitiesFound")}
          resultsLabel={t(language, citySearch.trim() ? "notifications.cityResults" : "prayerLocation.allCities")}
          searchLabel={t(language, "prayerLocation.citySearchOptional")}
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
        maxWidthClassName="max-w-md"
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
