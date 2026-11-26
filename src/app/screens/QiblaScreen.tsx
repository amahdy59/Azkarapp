import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Compass, HelpCircle, Info, MapPin, RefreshCw } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { QiblaCompassDial } from "../components/QiblaCompassDial";
import { Modal, ResponsiveSheet, SheetHeader } from "../components/ResponsiveSheet";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import { getMagneticDeclination } from "../content/geomagnetic";
import { detectUserCoordinates, type CoordinateDetectionResult } from "../content/prayerCalculation";
import { displayLocationName } from "../content/prayerLocations";
import { formatNumerals } from "../formatting";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useNow } from "../hooks/useNow";
import { useQiblaCompass } from "../hooks/useQiblaCompass";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
import { getKaabaDistance, getQiblaBearing, getQiblaTurn, normalizeDegrees } from "../qibla";
import type { AppLanguage, LocationSettings } from "../types";
import "./qibla-screen.css";

export { headingFromOrientation } from "../hooks/useQiblaCompass";
type DeviceLocation = Extract<CoordinateDetectionResult, { ok: true }>;

export function QiblaScreen({
  language,
  direction,
  locationSettings,
  reduceMotion,
  hapticFeedback = false,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  locationSettings?: LocationSettings;
  reduceMotion: boolean;
  hapticFeedback?: boolean;
  onBack: () => void;
}) {
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationNoticeOpen, setLocationNoticeOpen] = useState(false);
  const [locationWarningMeters, setLocationWarningMeters] = useState<number | null>(null);
  const locationTrigger = useRef<HTMLButtonElement>(null);
  const locationDescriptionId = useId();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aligned, setAligned] = useState(false);
  const mounted = useRef(true),
    locationRequest = useRef(0),
    alignmentArmed = useRef(true);
  const dayKey = useNow().toISOString().slice(0, 10);
  const showDesktopGuide = useMediaQuery("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  const savedLatitude = locationSettings?.latitude,
    savedLongitude = locationSettings?.longitude;
  const savedCoordinates =
    typeof savedLatitude === "number" &&
    Number.isFinite(savedLatitude) &&
    Math.abs(savedLatitude) <= 90 &&
    typeof savedLongitude === "number" &&
    Number.isFinite(savedLongitude) &&
    Math.abs(savedLongitude) <= 180
      ? { latitude: savedLatitude, longitude: savedLongitude }
      : null;
  const coordinates = deviceLocation ?? savedCoordinates;
  const latitude = coordinates?.latitude,
    longitude = coordinates?.longitude;
  const declination = useMemo(
    () =>
      latitude !== undefined && longitude !== undefined
        ? getMagneticDeclination(latitude, longitude, new Date(`${dayKey}T00:00:00Z`), deviceLocation?.altitude ?? 0)
        : null,
    [latitude, longitude, dayKey, deviceLocation?.altitude],
  );
  const compass = useQiblaCompass(declination, !showDesktopGuide);
  const bearing = coordinates ? getQiblaBearing(coordinates.latitude, coordinates.longitude) : null;
  const distanceKm = coordinates ? getKaabaDistance(coordinates.latitude, coordinates.longitude) : null;
  const degrees = bearing === null ? "" : formatNumerals(Math.round(bearing), language);
  const turn = bearing === null || !compass.reading ? null : getQiblaTurn(bearing, compass.reading.heading);
  const rawTurn = bearing === null || !compass.reading ? null : getQiblaTurn(bearing, compass.reading.rawHeading);
  const nearTarget = turn !== null && rawTurn !== null && Math.abs(turn) <= 3 && Math.abs(rawTurn) <= 3;
  const knownAccuracy = compass.reading?.accuracy !== null && compass.reading?.accuracy !== undefined;
  const leftAlignment = rawTurn === null || Math.abs(rawTurn) > 5;
  const locationLabel = deviceLocation
    ? displayLocationName(
        {
          latitude: deviceLocation.latitude,
          longitude: deviceLocation.longitude,
          cityName: "",
          autoDetect: true,
          calculationMethod: locationSettings?.calculationMethod ?? 5,
        },
        language,
      )!
    : (displayLocationName(locationSettings, language) ??
      t(language, coordinates ? "qibla.savedLocation" : "qibla.noLocation"));
  const sourceLabel = t(language, deviceLocation ? "qibla.deviceLocation" : "qibla.usingSavedLocation");
  const canRetryCompass = ["stale", "unavailable", "unsupported", "denied"].includes(compass.status);
  const locationTime = deviceLocation?.timestamp
    ? new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(deviceLocation.timestamp)
    : null;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (leftAlignment) alignmentArmed.current = true;
  }, [leftAlignment]);
  useEffect(() => {
    setAligned(false);
    if (!nearTarget || !knownAccuracy) return;
    const timer = window.setTimeout(() => {
      setAligned(true);
      if (alignmentArmed.current) {
        vibrateIfEnabled(hapticFeedback, 15);
        alignmentArmed.current = false;
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [nearTarget, knownAccuracy, hapticFeedback]);
  const detectLocation = async () => {
    const id = ++locationRequest.current;
    setIsLocating(true);
    setLocationMessage(null);
    const result = await detectUserCoordinates({ maximumAge: 0 });
    if (!mounted.current || id !== locationRequest.current) return;
    setLocationWarningMeters(
      result.ok && result.accuracy !== undefined && result.accuracy > 100 ? Math.ceil(result.accuracy) : null,
    );
    if (result.ok) {
      setDeviceLocation(result);
      setLocationMessage(t(language, "qibla.locationReady"));
    } else setLocationMessage(t(language, `qibla.location${result.reason[0]!.toUpperCase()}${result.reason.slice(1)}`));
    setIsLocating(false);
    setLocationNoticeOpen(true);
  };
  const openDetails = (trigger: HTMLButtonElement, help = false) => {
    trigger.focus({ preventScroll: true });
    setHelpOpen(help);
    setDetailsOpen(true);
  };
  const statusText = (() => {
    switch (compass.status) {
      case "off":
        return t(language, "qibla.staticLabel");
      case "permissionRequired":
        return t(language, "qibla.permissionNeeded");
      case "live":
        return knownAccuracy
          ? t(language, "qibla.headingAccuracy", {
              degrees: formatNumerals(Math.ceil(compass.reading!.accuracy!), language),
            })
          : t(language, "qibla.headingAccuracyUnknown");
      case "poor":
        return t(language, "qibla.compassPoor");
      case "stale":
        return t(language, "qibla.compassStale");
      case "paused":
        return t(language, "qibla.compassPaused");
      case "referenceUnavailable":
        return t(language, "qibla.referenceUnavailable");
      default:
        return t(language, `qibla.compass${compass.status[0]!.toUpperCase()}${compass.status.slice(1)}`);
    }
  })();
  const compactStatus = t(
    language,
    `qibla.${
      (
        {
          off: "staticLabel",
          permissionRequired: "permissionNeededShort",
          waiting: "compassWaitingShort",
          live: "phoneTopHint",
          poor: "compassPoorShort",
          stale: "compassStaleShort",
          paused: "compassPausedShort",
          denied: "compassDeniedShort",
          unsupported: "compassUnavailableShort",
          unavailable: "compassUnavailableShort",
          referenceUnavailable: "referenceUnavailableShort",
        } as const
      )[compass.status]
    }`,
  );
  const guidance = aligned
    ? t(language, "qibla.aligned")
    : nearTarget
      ? t(language, knownAccuracy ? "qibla.holdSteady" : "qibla.approximateAlignment")
      : turn === null
        ? t(language, "qibla.bearing", { degrees })
        : t(language, turn > 0 ? "qibla.turnRight" : "qibla.turnLeft", {
            degrees: formatNumerals(Math.round(Math.abs(turn)), language),
          });
  // Announce direction/state changes, not each high-frequency degree update.
  const turnAnnouncement = aligned
    ? t(language, "qibla.aligned")
    : nearTarget
      ? t(language, "qibla.holdSteady")
      : turn === null
        ? ""
        : t(language, turn > 0 ? "qibla.turnRightShort" : "qibla.turnLeftShort");
  const bearingText = t(language, "qibla.trueBearing", { degrees });
  const distanceText =
    distanceKm === null
      ? ""
      : t(language, "qibla.distanceToKaaba", {
          distance: formatNumerals(distanceKm.toLocaleString("en-US"), language),
        });
  const cardinalKeys = ["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"] as const;
  const detailRows = [
    [t(language, "qibla.locationSource"), sourceLabel],
    [
      t(language, "qibla.locationAccuracy"),
      deviceLocation?.accuracy !== undefined
        ? t(language, "qibla.accuracyMeters", { meters: formatNumerals(Math.ceil(deviceLocation.accuracy), language) })
        : t(language, "qibla.notAvailable"),
    ],
    [t(language, "qibla.locationAcquired"), locationTime ?? t(language, "qibla.notAvailable")],
    [t(language, "qibla.title"), bearing === null ? t(language, "qibla.notAvailable") : bearingText],
    [t(language, "qibla.distanceLabel"), distanceText || t(language, "qibla.notAvailable")],
  ];
  return (
    <ScreenContainer className="qibla-screen overflow-y-auto" dir={direction} screenName={t(language, "qibla.title")}>
      <div className="qibla-frame relative z-10 mx-auto flex w-full max-w-7xl flex-col">
        <Header
          title={t(language, "qibla.title")}
          onBack={onBack}
          language={language}
          right={
            <Button
              variant="ghost"
              size="sm"
              aria-haspopup="dialog"
              aria-label={t(language, "qibla.details")}
              onClick={(event) => openDetails(event.currentTarget)}
            >
              <Info size={18} aria-hidden="true" />
              <span className="qibla-details-label">{t(language, "qibla.details")}</span>
            </Button>
          }
        />
        <div
          className={`qibla-layout grid min-w-0 gap-6 px-page py-2 ${showDesktopGuide ? "lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)]" : ""}`}
        >
          <section className="qibla-main mx-auto w-full min-w-0 max-w-md" aria-label={t(language, "qibla.title")}>
            <div
              data-testid="qibla-location"
              className="qibla-location-row flex w-full min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2"
            >
              <MapPin size={22} className="shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1 basis-24 break-words">
                <h2 className="text-base font-bold text-foreground">{locationLabel}</h2>
                {coordinates && <p className="sr-only">{sourceLabel}</p>}
              </div>
              <Button
                ref={locationTrigger}
                size="sm"
                variant={coordinates ? "ghost" : "default"}
                disabled={isLocating}
                aria-busy={isLocating}
                onClick={() => void detectLocation()}
                aria-label={
                  isLocating
                    ? t(language, "qibla.locating")
                    : deviceLocation
                      ? `${t(language, "qibla.refreshLocation")}: ${t(language, "qibla.useCurrentLocation")}`
                      : t(language, "qibla.useMyLocation")
                }
              >
                <RefreshCw size={18} aria-hidden="true" />
                {t(
                  language,
                  isLocating ? "qibla.locating" : deviceLocation ? "qibla.refreshLocation" : "qibla.useMyLocation",
                )}
              </Button>
            </div>
            {bearing === null ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Compass size={40} className="text-primary" aria-hidden="true" />
                <h2 className="text-title font-bold">{t(language, "qibla.locationNeeded")}</h2>
                <p className="text-sm text-muted-foreground">{t(language, "qibla.locationNeededHint")}</p>
              </div>
            ) : (
              <>
                <p
                  role="status"
                  aria-label={statusText}
                  title={statusText}
                  className="qibla-mode text-center text-sm text-muted-foreground"
                >
                  {compactStatus}
                </p>
                <div className="qibla-dial-slot">
                  <figure
                    className="qibla-dial m-0"
                    role="img"
                    aria-label={t(language, "qibla.directionVisualLabel", { degrees })}
                  >
                    <QiblaCompassDial
                      rotation={turn ?? bearing}
                      northRotation={compass.reading ? normalizeDegrees(-compass.reading.heading) : 0}
                      reduceMotion={reduceMotion}
                      language={language}
                      aligned={aligned}
                      live={turn !== null}
                    />
                  </figure>
                </div>
                <div className="qibla-direction w-full text-center">
                  <h2
                    id="qibla-guidance"
                    aria-label={guidance}
                    className="flex min-h-8 items-center justify-center gap-2 text-2xl font-extrabold leading-normal text-foreground"
                  >
                    {aligned && <Check size={24} className="shrink-0 text-primary" aria-hidden="true" />}
                    {turn === null ? `${degrees}°` : aligned ? t(language, "qibla.alignedShort") : guidance}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(language, `qibla.${cardinalKeys[Math.round(normalizeDegrees(bearing) / 45) % 8]!}`)}
                  </p>
                </div>
                <span role="status" className="sr-only">
                  {turnAnnouncement}
                </span>
                <div className="qibla-actions w-full">
                  {!showDesktopGuide && compass.status === "permissionRequired" && (
                    <Button
                      className="w-full"
                      disabled={compass.requesting}
                      aria-busy={compass.requesting}
                      onClick={() => void compass.requestAccess()}
                    >
                      <Compass size={18} aria-hidden="true" />
                      {t(language, "qibla.allowCompass")}
                    </Button>
                  )}
                  {!showDesktopGuide && canRetryCompass && (
                    <Button
                      variant="default"
                      className="w-full"
                      disabled={compass.requesting}
                      onClick={() => void compass.retry()}
                    >
                      <RefreshCw size={18} aria-hidden="true" />
                      {t(language, "qibla.retryCompass")}
                    </Button>
                  )}
                  {compass.status === "poor" && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      aria-haspopup="dialog"
                      onClick={(event) => openDetails(event.currentTarget, true)}
                    >
                      <HelpCircle size={18} aria-hidden="true" />
                      {t(language, "qibla.calibrateCompass")}
                    </Button>
                  )}
                </div>
              </>
            )}
          </section>
          {showDesktopGuide && (
            <section className="h-fit rounded-3xl border border-border/50 bg-card p-5">
              <h2 className="text-title font-bold">{t(language, "qibla.desktopGuideTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t(language, "qibla.desktopGuideHint", { degrees })}</p>
              <ol className="mt-4 list-inside list-decimal space-y-3 text-sm leading-relaxed">
                {(["desktopGuideNorth", "desktopGuideTurn", "desktopGuideAlign"] as const).map((key) => (
                  <li key={key}>{t(language, `qibla.${key}`, { degrees })}</li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
      <Modal
        open={locationNoticeOpen}
        onClose={() => setLocationNoticeOpen(false)}
        title={t(language, "qibla.locationNoticeTitle")}
        describedById={locationDescriptionId}
        direction={direction}
        language={language}
        showCloseButton={false}
        testId="qibla-location-notice"
        protectedSurface
        maxWidthClassName="max-w-md"
        className="qibla-details-surface"
        onCloseAutoFocus={(event) => {
          if (!locationTrigger.current?.isConnected) return;
          event.preventDefault();
          locationTrigger.current.focus({ preventScroll: true });
        }}
      >
        <SheetHeader
          title={t(language, "qibla.locationNoticeTitle")}
          onClose={() => setLocationNoticeOpen(false)}
          direction={direction}
          language={language}
        />
        <div id={locationDescriptionId} className="min-h-0 space-y-3 overflow-y-auto px-5 py-4 text-sm leading-relaxed">
          <p>{locationMessage}</p>
          {locationWarningMeters !== null && (
            <p data-testid="qibla-location-warning" className="text-muted-foreground">
              {t(language, "qibla.locationApproximate", {
                meters: formatNumerals(locationWarningMeters, language),
              })}
            </p>
          )}
        </div>
        <div className="shrink-0 border-t border-border/50 p-4">
          <Button className="w-full" onClick={() => setLocationNoticeOpen(false)}>
            {t(language, "common.close")}
          </Button>
        </div>
      </Modal>
      <ResponsiveSheet
        protectedSurface
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={t(language, "qibla.detailsTitle")}
        direction={direction}
        language={language}
        focusOnOpen
        testId="qibla-details"
        drawerClassName="qibla-details-surface"
        dialogClassName="qibla-details-surface"
      >
        <SheetHeader
          title={t(language, "qibla.detailsTitle")}
          onClose={() => setDetailsOpen(false)}
          direction={direction}
          language={language}
        />
        <div className="min-h-0 overflow-y-auto px-5 py-4">
          <div className="mb-3 space-y-2 text-sm leading-relaxed">
            <p>{statusText}</p>
            <p className="text-muted-foreground">
              {t(language, compass.reading ? "qibla.phoneTopHint" : "qibla.staticDoesNotTrack")}
            </p>
          </div>
          <h2 className="text-base font-bold">{locationLabel}</h2>
          <dl className="mt-3 divide-y divide-border/50 text-sm">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="min-w-0 break-words text-end font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {coordinates && (
            <div className="mt-3 rounded-xl border border-border/60 p-3 text-sm">
              <p className="text-muted-foreground">{t(language, "qibla.coordinates")}</p>
              <p dir="ltr" className="mt-1 break-words text-center font-medium">
                {coordinates.latitude.toFixed(5)}°, {coordinates.longitude.toFixed(5)}°
              </p>
            </div>
          )}
          <div className="mt-3 rounded-xl border border-border/60 p-3 text-sm leading-relaxed">
            <p className="font-semibold">
              {compass.reading && knownAccuracy
                ? t(language, "qibla.headingAccuracy", {
                    degrees: formatNumerals(Math.ceil(compass.reading.accuracy!), language),
                  })
                : t(language, "qibla.headingAccuracyUnknown")}
            </p>
            <p className="mt-1 text-muted-foreground">{t(language, "qibla.accuracyCaution")}</p>
          </div>
          <details open={helpOpen} onToggle={(event) => setHelpOpen(event.currentTarget.open)} className="mt-3">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              {t(language, "qibla.accuracyTips")}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="space-y-3 py-2 text-sm leading-relaxed text-muted-foreground">
              <p>{t(language, "qibla.calibrationHint")}</p>
              <p>{t(language, "qibla.liveCompassHint")}</p>
              <p>{t(language, "qibla.staticHint")}</p>
              <p>{t(language, "qibla.northReferenceHint")}</p>
            </div>
          </details>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t(language, "qibla.locationPrivacy")}</p>
          {deviceLocation && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t(language, "qibla.prayerLocationUnchanged")}
            </p>
          )}
        </div>
        <div className="shrink-0 border-t border-border/50 p-4">
          <Button className="w-full" onClick={() => setDetailsOpen(false)}>
            {t(language, "common.close")}
          </Button>
        </div>
      </ResponsiveSheet>
    </ScreenContainer>
  );
}
