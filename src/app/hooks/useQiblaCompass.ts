import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeDegrees, smoothCompassHeading } from "../qibla";
import { MAGNETIC_MODEL } from "../content/geomagnetic";

export type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};
type OrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: (absolute?: boolean) => Promise<"granted" | "denied">;
};
export type CompassStatus =
  | "off"
  | "permissionRequired"
  | "waiting"
  | "live"
  | "poor"
  | "stale"
  | "paused"
  | "denied"
  | "unsupported"
  | "unavailable"
  | "referenceUnavailable";

/** Magnetic north only. Relative alpha and a vertical phone are not a compass. */
export function headingFromOrientation(event: OrientationEventWithCompass, fromAbsoluteEvent = false): number | null {
  if (
    (typeof event.beta === "number" && Math.abs(event.beta) > 45) ||
    (typeof event.gamma === "number" && Math.abs(event.gamma) > 45)
  )
    return null;
  if (typeof event.webkitCompassHeading === "number") {
    return Number.isFinite(event.webkitCompassHeading) &&
      event.webkitCompassHeading >= 0 &&
      event.webkitCompassHeading <= 360
      ? normalizeDegrees(event.webkitCompassHeading)
      : null;
  }
  if ((!fromAbsoluteEvent && event.absolute !== true) || !Number.isFinite(event.alpha)) return null;
  const legacy = (window as typeof window & { orientation?: number }).orientation;
  const screenAngle = window.screen.orientation?.angle ?? legacy ?? 0;
  return normalizeDegrees(360 - event.alpha! + screenAngle);
}

export function useQiblaCompass(declination: number | null, autoStart = false) {
  const [enabled, setEnabled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [status, setStatus] = useState<CompassStatus>("off");
  const [reading, setReading] = useState<{ heading: number; rawHeading: number; accuracy: number | null } | null>(null);
  const mounted = useRef(true);
  const requestId = useRef(0);
  const permissionRequired = useRef(false);
  const accessGranted = useRef(false);
  const requestingAccess = useRef(false);
  useEffect(() => {
    mounted.current = true;
    requestId.current++;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    if (declination === null) {
      setEnabled(false);
      setReading(null);
      setStatus("referenceUnavailable");
      return;
    }
    if (!window.isSecureContext || typeof DeviceOrientationEvent === "undefined") {
      setStatus("unsupported");
      return;
    }
    // Listening never invokes a permission prompt. Previously granted browsers
    // can deliver events immediately; requestPermission stays gesture-owned.
    permissionRequired.current =
      Boolean((DeviceOrientationEvent as OrientationConstructor).requestPermission) && !accessGranted.current;
    setEnabled(true);
  }, [autoStart, declination]);

  useEffect(() => {
    if (!enabled) return;
    let expiry: ReturnType<typeof setTimeout> | undefined;
    let previous: number | null = null;
    const clearExpiry = () => clearTimeout(expiry);
    const listen = (raw: Event) => {
      if (document.visibilityState === "hidden") return;
      const event = raw as OrientationEventWithCompass;
      const magnetic = headingFromOrientation(event, raw.type === "deviceorientationabsolute");
      // Ignore unrelated relative events rather than replacing a valid absolute fix.
      if (
        magnetic === null &&
        event.webkitCompassHeading === undefined &&
        !event.absolute &&
        raw.type !== "deviceorientationabsolute"
      )
        return;
      // Browsers can emit empty orientation events before access is granted.
      // They are not evidence of consent and must not hide the permission action.
      if (permissionRequired.current && magnetic === null) return;
      accessGranted.current = true;
      permissionRequired.current = false;
      const accuracy =
        typeof event.webkitCompassAccuracy === "number" && Number.isFinite(event.webkitCompassAccuracy)
          ? event.webkitCompassAccuracy
          : null;
      if (magnetic === null || (accuracy !== null && (accuracy < 0 || accuracy > 10))) {
        clearExpiry();
        previous = null;
        setReading(null);
        setStatus("poor");
        return;
      }
      if (declination === null || new Date().getUTCFullYear() >= MAGNETIC_MODEL.validBefore) {
        clearExpiry();
        setReading(null);
        setStatus("referenceUnavailable");
        return;
      }
      const rawHeading = normalizeDegrees(magnetic + declination);
      previous = smoothCompassHeading(previous, rawHeading);
      setReading({ heading: previous, rawHeading, accuracy });
      setStatus("live");
      clearExpiry();
      expiry = setTimeout(() => {
        previous = null;
        setReading(null);
        setStatus("stale");
      }, 5000);
    };
    const remove = () => {
      clearExpiry();
      window.removeEventListener("deviceorientationabsolute", listen);
      window.removeEventListener("deviceorientation", listen);
    };
    const resume = () => {
      remove();
      previous = null;
      setReading(null);
      if (document.visibilityState === "hidden") {
        setStatus("paused");
        return;
      }
      setStatus(permissionRequired.current ? "permissionRequired" : "waiting");
      window.addEventListener("deviceorientationabsolute", listen);
      window.addEventListener("deviceorientation", listen);
      expiry = setTimeout(() => setStatus(permissionRequired.current ? "permissionRequired" : "unavailable"), 5000);
    };
    resume();
    document.addEventListener("visibilitychange", resume);
    return () => {
      remove();
      document.removeEventListener("visibilitychange", resume);
    };
  }, [enabled, declination, attempt]);

  const requestAccess = useCallback(async () => {
    if (requestingAccess.current) return;
    if (declination === null) {
      setStatus("referenceUnavailable");
      return;
    }
    if (!window.isSecureContext || typeof DeviceOrientationEvent === "undefined") {
      setStatus("unsupported");
      return;
    }
    const id = ++requestId.current;
    const orientation = DeviceOrientationEvent as OrientationConstructor;
    if (orientation.requestPermission) {
      requestingAccess.current = true;
      setRequesting(true);
      try {
        let permission: "granted" | "denied";
        try {
          permission = await orientation.requestPermission(true);
        } catch (error) {
          if (!(error instanceof TypeError)) throw error;
          permission = await orientation.requestPermission();
        }
        if (!mounted.current || requestId.current !== id) return;
        if (permission !== "granted") {
          accessGranted.current = false;
          permissionRequired.current = true;
          setReading(null);
          setEnabled(false);
          setStatus("denied");
          return;
        }
      } catch {
        if (mounted.current && requestId.current === id) {
          accessGranted.current = false;
          permissionRequired.current = true;
          setReading(null);
          setEnabled(false);
          setStatus("denied");
        }
        return;
      } finally {
        requestingAccess.current = false;
        if (mounted.current && requestId.current === id) setRequesting(false);
      }
    }
    if (mounted.current && requestId.current === id) {
      accessGranted.current = true;
      permissionRequired.current = false;
      setEnabled(true);
      setAttempt((previous) => previous + 1);
    }
  }, [declination]);
  const toggle = useCallback(async () => {
    if (enabled) {
      requestId.current++;
      setEnabled(false);
      setReading(null);
      setStatus("off");
    } else await requestAccess();
  }, [enabled, requestAccess]);
  const retry = useCallback(async () => {
    if (enabled && !permissionRequired.current) {
      setReading(null);
      setStatus("waiting");
      setAttempt((previous) => previous + 1);
    } else await requestAccess();
  }, [enabled, requestAccess]);
  return { enabled, requesting, status, reading, toggle, retry, requestAccess };
}
