import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Compass, MapPin } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import { detectUserCoordinates } from "../content/prayerCalculation";
import { formatNumerals } from "../formatting";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { t } from "../i18n";
import { getKaabaDistance, getQiblaBearing, getQiblaTurn, normalizeDegrees, smoothCompassHeading } from "../qibla";
import type { AppLanguage, LocationSettings } from "../types";

type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

type OrientationConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: (absolute?: boolean) => Promise<"granted" | "denied">;
};

async function requestOrientationPermission(
  orientation: OrientationConstructorWithPermission,
): Promise<"granted" | "denied"> {
  if (!orientation.requestPermission) return "granted";

  try {
    return await orientation.requestPermission(true);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    // Safari shipped the permission API before its optional `absolute`
    // argument. Those versions can reject the standards-based call even
    // though their ordinary orientation event exposes webkitCompassHeading.
    return orientation.requestPermission();
  }
}

function screenOrientationAngle(): number {
  const legacyOrientation = (window as typeof window & { orientation?: number }).orientation;
  return window.screen.orientation?.angle ?? legacyOrientation ?? 0;
}

function computeHeadingFromEuler(alpha: number, beta: number, gamma: number): number {
  const rad = Math.PI / 180;
  const x = beta * rad;
  const y = gamma * rad;
  const z = alpha * rad;

  const cY = Math.cos(y);
  const cZ = Math.cos(z);
  const sX = Math.sin(x);
  const sY = Math.sin(y);
  const sZ = Math.sin(z);

  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;

  let heading = Math.atan2(Vx, Vy) * (180 / Math.PI);
  if (heading < 0) heading += 360;
  return normalizeDegrees(heading + screenOrientationAngle());
}

export function headingFromOrientation(event: OrientationEventWithCompass, fromAbsoluteEvent = false): number | null {
  // WebKit uses a negative compass heading to signal an invalid reading.
  if (Number.isFinite(event.webkitCompassHeading) && event.webkitCompassHeading! >= 0) {
    return normalizeDegrees(event.webkitCompassHeading!);
  }
  if (!fromAbsoluteEvent && event.absolute !== true) return null;
  if (!Number.isFinite(event.alpha)) return null;

  if (
    Number.isFinite(event.beta) &&
    Number.isFinite(event.gamma) &&
    (Math.abs(event.beta!) > 5 || Math.abs(event.gamma!) > 5)
  ) {
    return computeHeadingFromEuler(event.alpha!, event.beta!, event.gamma!);
  }

  return normalizeDegrees(360 - event.alpha! + screenOrientationAngle());
}

function cardinalKey(degrees: number): string {
  const keys = ["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"];
  return keys[Math.round(normalizeDegrees(degrees) / 45) % 8]!;
}

function CompassDial({
  rotation,
  northRotation,
  reduceMotion,
  language,
}: {
  rotation: number;
  northRotation: number;
  reduceMotion: boolean;
  language: AppLanguage;
}) {
  const ticks = Array.from({ length: 36 }, (_, index) => index * 10);
  const cardinalLabels = language === "ar" ? ["شمال", "شرق", "جنوب", "غرب"] : ["N", "E", "S", "W"];
  return (
    <svg viewBox="0 0 320 320" className="aspect-square w-full" aria-hidden="true">
      <circle cx="160" cy="160" r="146" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="160" cy="160" r="124" fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.55" />
      <g data-testid="compass-rose" transform={`rotate(${northRotation} 160 160)`}>
        {ticks.map((degrees) => {
          const major = degrees % 90 === 0;
          return (
            <line
              key={degrees}
              x1="160"
              y1={major ? 22 : 27}
              x2="160"
              y2={major ? 40 : 35}
              stroke={major ? "var(--foreground)" : "var(--muted-foreground)"}
              strokeWidth={major ? 3 : 1.5}
              transform={`rotate(${degrees} 160 160)`}
            />
          );
        })}
        <g
          fill="var(--foreground)"
          fontFamily="inherit"
          fontSize={language === "ar" ? "12" : "17"}
          fontWeight="800"
          textAnchor="middle"
        >
          <text x="160" y="58">
            {cardinalLabels[0]}
          </text>
          <text x="263" y="166">
            {cardinalLabels[1]}
          </text>
          <text x="160" y="274">
            {cardinalLabels[2]}
          </text>
          <text x="57" y="166">
            {cardinalLabels[3]}
          </text>
        </g>
      </g>
      <g
        data-testid="qibla-arrow"
        transform={`rotate(${rotation} 160 160)`}
        style={reduceMotion ? undefined : { transition: "transform 180ms ease-out" }}
      >
        <path d="M160 58 181 168 160 151 139 168Z" fill="var(--primary)" />
        <path d="M160 262 181 152 160 169 139 152Z" fill="var(--muted-foreground)" opacity="0.55" />
        <rect x="148" y="42" width="24" height="24" rx="5" fill="var(--primary)" />
        <path d="M153 49h14v11h-14zM156 46h8v3h-8z" fill="var(--primary-foreground)" />
      </g>
      <circle cx="160" cy="160" r="12" fill="var(--background)" stroke="var(--primary)" strokeWidth="6" />
    </svg>
  );
}

export function QiblaScreen({
  language,
  direction,
  locationSettings,
  reduceMotion,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  locationSettings?: LocationSettings;
  reduceMotion: boolean;
  onBack: () => void;
}) {
  const savedCoordinates = useMemo(
    () =>
      Number.isFinite(locationSettings?.latitude) && Number.isFinite(locationSettings?.longitude)
        ? { latitude: locationSettings!.latitude!, longitude: locationSettings!.longitude! }
        : null,
    [locationSettings],
  );
  const [coordinates, setCoordinates] = useState(savedCoordinates);
  const [locationLabel, setLocationLabel] = useState(locationSettings?.cityName ?? null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [compassEnabled, setCompassEnabled] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [compassStatus, setCompassStatus] = useState<string | null>(null);
  const receivedHeading = useRef(false);
  const showDesktopGuide = useMediaQuery("(min-width: 1024px) and (hover: hover) and (pointer: fine)");

  const bearing = useMemo(
    () => (coordinates ? getQiblaBearing(coordinates.latitude, coordinates.longitude) : null),
    [coordinates],
  );
  const distanceKm = useMemo(
    () => (coordinates ? getKaabaDistance(coordinates.latitude, coordinates.longitude) : null),
    [coordinates],
  );
  const turn = bearing === null || heading === null ? null : getQiblaTurn(bearing, heading);
  const dialRotation = turn ?? bearing ?? 0;
  const northRotation = heading === null ? 0 : normalizeDegrees(-heading);
  const roundedBearing = bearing === null ? null : Math.round(bearing);

  useEffect(() => {
    if (!compassEnabled) return;

    const handleOrientation = (rawEvent: Event) => {
      const event = rawEvent as OrientationEventWithCompass;
      const nextHeading = headingFromOrientation(event, rawEvent.type === "deviceorientationabsolute");
      if (nextHeading === null) return;
      receivedHeading.current = true;
      setHeading((previous) => smoothCompassHeading(previous, nextHeading));
      setCompassStatus(null);
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation);
    window.addEventListener("deviceorientation", handleOrientation);
    const timeout = window.setTimeout(() => {
      if (!receivedHeading.current) setCompassStatus(t(language, "qibla.compassUnavailable"));
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [compassEnabled, language]);

  const detectLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationMessage(null);
    const result = await detectUserCoordinates();
    if (result.ok) {
      setCoordinates({ latitude: result.latitude, longitude: result.longitude });
      setLocationLabel(`${result.latitude.toFixed(2)}°, ${result.longitude.toFixed(2)}°`);
      setLocationMessage(t(language, "qibla.locationReady"));
    } else {
      setLocationMessage(t(language, `qibla.location${result.reason[0]!.toUpperCase()}${result.reason.slice(1)}`));
    }
    setIsLocating(false);
  }, [language]);

  const toggleCompass = async () => {
    if (compassEnabled) {
      setCompassEnabled(false);
      setHeading(null);
      receivedHeading.current = false;
      setCompassStatus(null);
      return;
    }
    if (!window.isSecureContext || typeof DeviceOrientationEvent === "undefined") {
      setCompassStatus(t(language, "qibla.compassUnsupported"));
      return;
    }
    const orientation = DeviceOrientationEvent as OrientationConstructorWithPermission;
    if (orientation.requestPermission) {
      try {
        const permission = await requestOrientationPermission(orientation);
        if (permission !== "granted") {
          setCompassStatus(t(language, "qibla.compassDenied"));
          return;
        }
      } catch {
        setCompassStatus(t(language, "qibla.compassDenied"));
        return;
      }
    }
    receivedHeading.current = false;
    setCompassStatus(t(language, "qibla.compassWaiting"));
    setCompassEnabled(true);
  };

  const guidance = (() => {
    if (turn === null) return null;
    const amount = Math.round(Math.abs(turn));
    if (amount <= 3) return t(language, "qibla.aligned");
    return t(language, turn > 0 ? "qibla.turnRight" : "qibla.turnLeft", {
      degrees: formatNumerals(amount, language),
    });
  })();

  return (
    <ScreenContainer className="overflow-y-auto" dir={direction} screenName={t(language, "qibla.title")}>
      <Header
        title={t(language, "qibla.title")}
        subtitle={t(language, "qibla.subtitle")}
        onBack={onBack}
        language={language}
      />
      <div className="mx-auto grid w-full max-w-5xl content-start items-start gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(20rem,1fr)_minmax(16rem,0.7fr)]">
        <section
          className="flex flex-col items-center rounded-3xl border border-border/50 bg-card p-4 shadow-raised sm:p-6"
          aria-labelledby="qibla-bearing"
        >
          {bearing === null ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <MapPin size={40} className="text-primary" aria-hidden="true" />
              <h2 id="qibla-bearing" className="mt-4 text-title font-extrabold text-foreground">
                {t(language, "qibla.locationNeeded")}
              </h2>
              <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
                {t(language, "qibla.locationNeededHint")}
              </p>
            </div>
          ) : (
            <>
              <MapPin size={40} className="text-primary" aria-hidden="true" />
              <h2 id="qibla-bearing" className="mt-2 text-center text-title font-extrabold text-foreground">
                {t(language, "qibla.bearing", { degrees: formatNumerals(roundedBearing!, language) })}
              </h2>
              <p className="mt-1 text-center text-sm font-semibold text-muted-foreground">
                {t(language, `qibla.${cardinalKey(bearing)}`)} · {formatNumerals(roundedBearing!, language)}°
              </p>
              {distanceKm !== null && (
                <p className="mt-1 text-center text-xs font-bold text-primary">
                  {t(language, "qibla.distanceToKaaba", {
                    distance: formatNumerals(distanceKm.toLocaleString(), language),
                  })}
                </p>
              )}
              {!showDesktopGuide && (
                <div className="mt-4 w-full rounded-2xl border border-border/40 bg-muted/20 p-4">
                  <h3 className="text-caption font-bold uppercase tracking-wider text-foreground">
                    {t(language, "qibla.alignmentStepsTitle")}
                  </h3>
                  <ol className="mt-2.5 space-y-2 text-xs font-medium text-muted-foreground">
                    <li className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-micro font-bold text-primary">
                        {formatNumerals(1, language)}
                      </span>
                      <span className="leading-5">{t(language, "qibla.alignmentStep1")}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-micro font-bold text-primary">
                        {formatNumerals(2, language)}
                      </span>
                      <span className="leading-5">
                        {t(language, "qibla.alignmentStep2", {
                          degrees: formatNumerals(roundedBearing!, language),
                          cardinal: t(language, `qibla.${cardinalKey(bearing)}`),
                        })}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-micro font-bold text-primary">
                        {formatNumerals(3, language)}
                      </span>
                      <span className="leading-5">{t(language, "qibla.alignmentStep3")}</span>
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="flex flex-col gap-3">
          <section className="rounded-3xl border border-border/50 bg-card p-5 shadow-raised">
            <div className="flex items-start gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <MapPin size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-subtitle font-extrabold text-foreground">{t(language, "qibla.locationTitle")}</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                  {coordinates
                    ? locationLabel || `${coordinates.latitude.toFixed(2)}°, ${coordinates.longitude.toFixed(2)}°`
                    : t(language, "qibla.noLocation")}
                </p>
              </div>
            </div>
            <Button className="mt-4 min-h-11 w-full" onClick={() => void detectLocation()} disabled={isLocating}>
              {isLocating ? t(language, "qibla.locating") : t(language, "qibla.useCurrentLocation")}
            </Button>
            {locationMessage && (
              <p className="mt-3 text-sm font-semibold text-muted-foreground" role="status" aria-live="polite">
                {locationMessage}
              </p>
            )}
            <p className="mt-3 text-xs font-semibold leading-5 text-muted-foreground">
              {t(language, "qibla.locationPrivacy")}
            </p>
          </section>

          {showDesktopGuide ? (
            <section className="rounded-3xl border border-border/50 bg-card p-5 shadow-raised">
              <div className="flex items-start gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Compass size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-subtitle font-extrabold text-foreground">
                    {t(language, "qibla.desktopGuideTitle")}
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                    {bearing === null
                      ? t(language, "qibla.desktopGuideNeedsLocation")
                      : t(language, "qibla.desktopGuideHint", {
                          degrees: formatNumerals(roundedBearing!, language),
                        })}
                  </p>
                </div>
              </div>
              {bearing !== null && (
                <ol className="mt-4 space-y-3">
                  {(["desktopGuideNorth", "desktopGuideTurn", "desktopGuideAlign"] as const).map((key, index) => (
                    <li key={key} className="flex items-start gap-3 text-sm font-semibold leading-6 text-foreground">
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary"
                        aria-hidden="true"
                      >
                        {formatNumerals(index + 1, language)}
                      </span>
                      <span>
                        {t(language, `qibla.${key}`, {
                          degrees: formatNumerals(roundedBearing!, language),
                        })}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ) : (
            <details
              className="rounded-3xl border border-border/50 bg-card p-5 shadow-raised"
              onToggle={(event) => {
                if (!event.currentTarget.open) {
                  setCompassEnabled(false);
                  setHeading(null);
                  receivedHeading.current = false;
                  setCompassStatus(null);
                }
              }}
            >
              <summary className="min-h-11 cursor-pointer content-center font-bold focus-visible:ring-[3px] focus-visible:ring-ring">
                {t(language, "qibla.liveCompass")}
              </summary>
              <div className="flex items-start gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Compass size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                    {t(language, "qibla.liveCompassHint")}
                  </p>
                </div>
              </div>
              {bearing !== null && (
                <div className="mx-auto w-full max-w-[22rem]">
                  <CompassDial
                    rotation={dialRotation}
                    northRotation={northRotation}
                    reduceMotion={reduceMotion}
                    language={language}
                  />
                  <h3 className="text-center font-bold" aria-live="polite">
                    {guidance ?? t(language, "qibla.compassStatic")}
                  </h3>
                </div>
              )}
              <Button
                className="mt-4 min-h-11 w-full"
                variant={compassEnabled ? "outline" : "default"}
                onClick={() => void toggleCompass()}
                aria-pressed={compassEnabled}
                disabled={bearing === null}
              >
                {compassEnabled ? t(language, "qibla.stopCompass") : t(language, "qibla.startCompass")}
              </Button>
              {compassStatus && (
                <p className="mt-3 text-sm font-semibold text-muted-foreground" role="status" aria-live="polite">
                  {compassStatus}
                </p>
              )}
              <p className="mt-3 text-xs font-semibold leading-5 text-muted-foreground">
                {t(language, "qibla.calibrationHint")}
              </p>
            </details>
          )}
        </aside>
      </div>
    </ScreenContainer>
  );
}
