import { useCallback, useEffect, useRef, useState } from "react";
import { ResponsiveSheet, SheetHeader } from "../../components/ResponsiveSheet";
import { PrayerCitySearch } from "../../components/PrayerCitySearch";
import { Button } from "../../components/ui/button";
import { Bell, Check, ChevronDown, Locate, MapPin, Search } from "../../components/icons";
import { DEFAULT_LOCATION } from "../../content/prayerCalculation";
import { searchPrayerLocations, type PrayerLocationPreset } from "../../content/prayerLocations";
import { useHomeLocation } from "../../hooks/useHomeLocation";
import {
  notificationSetupEnvironment,
  readNotificationPermission,
  requestNotificationPermission,
} from "../../notifications";
import { CONTEXT_REMINDER_KINDS } from "../../contextReminders";
import { t } from "../../i18n";
import type { AppLanguage, LocationSettings, ReminderSettings } from "../../types";
import "./first-use-setup.css";

const ROUTINES = ["morning", "evening", "before_sleep", "after_prayer"] as const;
const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

/** One optional permission decision, then location only when selected reminders need it. */
export function FirstUseSetup({
  language,
  reminders,
  location,
  needsLocation = false,
  onLocationChange,
  onClose,
}: {
  language: AppLanguage;
  reminders: ReminderSettings;
  location?: LocationSettings;
  needsLocation?: boolean;
  onLocationChange: (value: LocationSettings) => void;
  onClose: () => void;
}) {
  const [permission, setPermission] = useState(readNotificationPermission);
  const [step, setStep] = useState<"notifications" | "location" | "city">("notifications");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [query, setQuery] = useState("");
  const mounted = useRef(false);
  const requesting = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const previousStep = useRef(step);
  const environment = notificationSetupEnvironment();
  const unavailable = permission === "unsupported" || environment === "ios-browser";
  const blocked = permission === "denied";
  const selectedPrayers = reminders.prayer.prayers ?? PRAYERS;
  const prayerSelected = reminders.prayer.enabled && selectedPrayers.length > 0;
  const routines = ROUTINES.filter((kind) => reminders[kind].enabled);
  const contextual = CONTEXT_REMINDER_KINDS.filter((kind) => reminders[kind]?.enabled);
  const anySelected = prayerSelected || routines.length > 0 || contextual.length > 0;
  const locationNeeded = needsLocation && (prayerSelected || contextual.length > 0);
  const finishPermission = useCallback(() => {
    if (locationNeeded) setStep("location");
    else onClose();
  }, [locationNeeded, onClose]);
  const saveLocation = (value: LocationSettings) => {
    onLocationChange(value);
    onClose();
  };
  const deviceLocation = useHomeLocation(language, location, saveLocation);

  useEffect(() => {
    mounted.current = true;
    const refresh = () => {
      if (document.visibilityState === "visible") setPermission(readNotificationPermission());
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("azkar-notification-permission", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      mounted.current = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("azkar-notification-permission", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  useEffect(() => {
    if (permission === "granted" && !unavailable && step === "notifications") finishPermission();
  }, [permission, unavailable, step, finishPermission]);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    if (step === "city") searchInput.current?.focus({ preventScroll: true });
    else heading.current?.focus({ preventScroll: true });
  }, [step]);

  const request = async () => {
    if (requesting.current) return;
    requesting.current = true;
    setBusy(true);
    setError(false);
    setDismissed(false);
    try {
      const value = await requestNotificationPermission();
      if (mounted.current) {
        setPermission(value);
        setDismissed(value === "default");
      }
    } catch {
      if (mounted.current) setError(true);
    } finally {
      requesting.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const selectCity = (city: PrayerLocationPreset) =>
    saveLocation({
      ...(location ?? DEFAULT_LOCATION),
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: city.nameEnglish,
      timeZone: city.timeZone,
      autoDetect: false,
    });
  const title = t(
    language,
    step === "city"
      ? "notifications.chooseCity"
      : step === "location"
        ? "firstUse.locationTitle"
        : unavailable
          ? "firstUse.unsupportedTitle"
          : blocked
            ? "firstUse.blockedTitle"
            : "firstUse.title",
  );
  return (
    <ResponsiveSheet
      origin="bottom"
      open
      onClose={onClose}
      title={t(language, "firstUse.dialogTitle")}
      language={language}
      direction={language === "ar" ? "rtl" : "ltr"}
      testId="first-use-setup"
      protectedSurface
      maxWidthClassName="max-w-[30rem]"
      dialogClassName="first-use-surface"
      drawerClassName="first-use-surface"
    >
      <SheetHeader
        title={step === "city" ? title : t(language, "common.appName")}
        language={language}
        onClose={onClose}
        className="first-use-header"
      />
      {step === "city" ? (
        <>
          <PrayerCitySearch
            language={language}
            query={query}
            onQueryChange={setQuery}
            results={searchPrayerLocations(query)}
            onSelect={selectCity}
            inputRef={searchInput}
            emptyMessage={t(language, "firstUse.noCities")}
          />
          <div className="shrink-0 px-5 pb-3">
            <Button variant="ghost" className="w-full" onClick={() => setStep("location")}>
              {t(language, "common.back")}
            </Button>
          </div>
        </>
      ) : (
        <div className="first-use-content min-h-0 overflow-y-auto" data-vaul-no-drag>
          <div className="first-use-hero">
            <span className="first-use-icon" aria-hidden="true">
              {step === "location" ? <MapPin size={24} /> : <Bell size={24} />}
            </span>
            {step === "location" && (
              <p className="flex items-center gap-2 text-sm" role="status">
                <Check size={18} className="text-primary" aria-hidden="true" />
                {t(language, "firstUse.allowed")}
              </p>
            )}
            <h2 className="first-use-heading text-xl" ref={heading} tabIndex={-1}>
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(
                language,
                step === "location"
                  ? "firstUse.locationIntro"
                  : unavailable
                    ? "firstUse.unsupportedIntro"
                    : blocked
                      ? "firstUse.blockedIntro"
                      : "firstUse.intro",
              )}
            </p>
          </div>
          {step === "location" ? (
            <>
              <div className="first-use-actions">
                <Button
                  className="w-full"
                  disabled={deviceLocation.locating}
                  aria-busy={deviceLocation.locating}
                  onClick={() => void deviceLocation.refresh()}
                >
                  <Locate size={20} aria-hidden="true" />
                  {t(language, deviceLocation.locating ? "notifications.detectingLocation" : "firstUse.useLocation")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={deviceLocation.locating}
                  onClick={() => {
                    deviceLocation.dismiss();
                    setStep("city");
                  }}
                >
                  <Search size={20} aria-hidden="true" />
                  {t(language, "firstUse.chooseCity")}
                </Button>
                <Button variant="ghost" className="w-full" onClick={onClose}>
                  {t(language, "firstUse.later")}
                </Button>
              </div>
              {deviceLocation.message && (
                <p role="status" className="text-sm leading-relaxed">
                  {deviceLocation.message}
                </p>
              )}
              <p className="text-center text-sm leading-relaxed text-muted-foreground">
                {t(language, "firstUse.locationPrivacy")}
              </p>
            </>
          ) : (
            <>
              {!blocked && !unavailable && (
                <div className="first-use-preview" data-testid="first-use-preview">
                  <p className="text-label text-muted-foreground">{t(language, "firstUse.previewLabel")}</p>
                  <div className="flex items-center gap-3">
                    <Bell size={22} className="shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{t(language, "firstUse.previewTitle")}</p>
                      <p className="text-sm text-muted-foreground">{t(language, "firstUse.previewBody")}</p>
                    </div>
                  </div>
                </div>
              )}
              {(blocked || unavailable) && (
                <p className="text-sm text-center">{t(language, "firstUse.readingAvailable")}</p>
              )}
              <details className="first-use-disclosure border-y border-border/40" data-testid="first-use-reminders">
                <summary className="text-sm font-semibold">
                  {t(language, "firstUse.selectedReminders")}
                  <ChevronDown size={18} className="shrink-0" aria-hidden="true" />
                </summary>
                <div className="space-y-3 py-3 text-sm">
                  {anySelected ? (
                    <ul className="space-y-2">
                      {prayerSelected && (
                        <li>
                          {t(language, "notifications.prayerReminders")}:{" "}
                          {selectedPrayers
                            .map((name) => t(language, `notifications.${name}`))
                            .join(language === "ar" ? "، " : ", ")}
                        </li>
                      )}
                      {routines.map((kind) => (
                        <li key={kind}>
                          {t(language, `notifications.${kind}`)} <bdi dir="ltr">{reminders[kind].time}</bdi>
                        </li>
                      ))}
                      {contextual.map((kind) => (
                        <li key={kind}>{t(language, `notifications.${kind}`)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{t(language, "firstUse.noReminders")}</p>
                  )}
                  <a
                    href="#/settings/notifications"
                    onClick={onClose}
                    className="inline-flex min-h-11 items-center rounded-lg text-primary underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    {t(language, "firstUse.reviewReminders")}
                  </a>
                </div>
              </details>
              {(blocked || unavailable) && (
                <details className="first-use-disclosure">
                  <summary className="text-sm font-semibold">
                    {t(language, "firstUse.permissionHelp")}
                    <ChevronDown size={18} className="shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="py-3 text-sm leading-relaxed text-muted-foreground">
                    {t(
                      language,
                      environment === "ios-browser"
                        ? "firstUse.iosHelp"
                        : blocked
                          ? environment === "android"
                            ? "notifications.nativePermissionBlockedAction"
                            : "notifications.permissionBlockedAction"
                          : "firstUse.unsupportedHelp",
                    )}
                  </p>
                </details>
              )}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {t(language, "firstUse.error")}
                </p>
              )}
              {dismissed && (
                <p role="status" className="text-sm">
                  {t(language, "firstUse.dismissed")}
                </p>
              )}
              <div className="first-use-actions">
                {!blocked && !unavailable && anySelected ? (
                  <>
                    <p className="text-center text-sm text-muted-foreground">
                      {t(language, "firstUse.permissionHint")}
                    </p>
                    <Button disabled={busy} aria-busy={busy} className="w-full" onClick={() => void request()}>
                      {t(language, busy ? "notifications.requestingPermission" : "notifications.requestPermission")}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={onClose}>
                      {t(language, "firstUse.later")}
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={onClose}>
                    {t(language, "firstUse.continue")}
                  </Button>
                )}
              </div>
              {environment !== "android" && (
                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                  {t(language, "firstUse.browserDelivery")}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </ResponsiveSheet>
  );
}
