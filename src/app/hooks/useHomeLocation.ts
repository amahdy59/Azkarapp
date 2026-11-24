import { useEffect, useRef, useState } from "react";
import { DEFAULT_LOCATION, detectUserCoordinates, type CoordinateDetectionResult } from "../content/prayerCalculation";
import { t } from "../i18n";
import type { AppLanguage, LocationSettings } from "../types";

/** Explicit, screen-owned detection; the App callback owns persistence/reminders. */
export function useHomeLocation(
  language: AppLanguage,
  location: LocationSettings | undefined,
  onChange?: (value: LocationSettings) => void,
) {
  const request = useRef(0);
  const busy = useRef(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    request.current += 1;
    busy.current = false;
    setLocating(false);
    return () => {
      request.current += 1;
      busy.current = false;
    };
  }, [location]);
  const refresh = async () => {
    if (busy.current || !onChange) return;
    busy.current = true;
    const id = ++request.current;
    setLocating(true);
    setMessage(null);
    let result: CoordinateDetectionResult;
    try {
      result = await detectUserCoordinates({ maximumAge: 0 });
    } catch {
      result = { ok: false, reason: "unknown" };
    }
    if (id !== request.current) return;
    if (result.ok) {
      onChange({
        ...(location ?? DEFAULT_LOCATION),
        latitude: result.latitude,
        longitude: result.longitude,
        cityName: `${result.latitude.toFixed(2)}°, ${result.longitude.toFixed(2)}°`,
        autoDetect: true,
        timeZone: result.timeZone ?? DEFAULT_LOCATION.timeZone,
      });
      setMessage(t(language, "notifications.locationUpdated"));
    } else {
      const reason = result.reason === "unknown" ? "Error" : result.reason[0]!.toUpperCase() + result.reason.slice(1);
      setMessage(t(language, `notifications.location${reason}`));
    }
    busy.current = false;
    setLocating(false);
  };
  return { locating, message, refresh, dismiss: () => setMessage(null) };
}
