import type { LocationSettings } from "../types";
import type { PrayerName, PrayerTimes } from "./prayerTimes";

export interface CalculationMethodInfo {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  fajrAngle: number;
  ishaAngle: number;
  ishaMinutes?: number;
}

const EGYPTIAN_METHOD: CalculationMethodInfo = {
  id: 5,
  nameArabic: "الهيئة المصرية العامة للمساحة",
  nameEnglish: "Egyptian General Authority of Survey",
  fajrAngle: 19.5,
  ishaAngle: 17.5,
};

export const CALCULATION_METHODS: Record<number, CalculationMethodInfo> = {
  5: EGYPTIAN_METHOD,
  4: {
    id: 4,
    nameArabic: "جامعة أم القرى بمكة المكرمة",
    nameEnglish: "Umm Al-Qura University, Makkah",
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaMinutes: 90,
  },
  3: {
    id: 3,
    nameArabic: "رابطة العالم الإسلامي",
    nameEnglish: "Muslim World League",
    fajrAngle: 18,
    ishaAngle: 17,
  },
  2: {
    id: 2,
    nameArabic: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)",
    nameEnglish: "Islamic Society of North America (ISNA)",
    fajrAngle: 15,
    ishaAngle: 15,
  },
  1: {
    id: 1,
    nameArabic: "جامعة العلوم الإسلامية بكراتشي",
    nameEnglish: "University of Islamic Sciences, Karachi",
    fajrAngle: 18,
    ishaAngle: 18,
  },
};

export const DEFAULT_LOCATION: LocationSettings = {
  latitude: 30.0444,
  longitude: 31.2357,
  cityName: "Cairo",
  calculationMethod: 5,
  autoDetect: false,
  timeZone: "Africa/Cairo",
  adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
};

const PRAYER_NAMES: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/**
 * The prefixes the old network path wrote under.
 *
 * Taken from the keys it actually used, not from what they might sensibly have
 * been called: a cleanup keyed on a guessed prefix removes nothing at all, and
 * says it succeeded.
 */
const LEGACY_CACHE_PREFIXES = ["azkarapp.prayer_times_cache.", "azkarapp.prayer_time_zone."];

/**
 * Clears what the old network path left on the device.
 *
 * Prayer times were fetched from a third party and cached here, keyed by the
 * reader's coordinates. Nothing writes that cache now — the times are
 * calculated on the device — so what remains is a residue of a service the app
 * no longer uses, holding a record of where someone was. It is removed on
 * startup rather than left to expire, because the point of dropping the
 * network path was that those coordinates should not be sitting anywhere.
 */
export function pruneExpiredPrayerTimes(_reference: Date): void {
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key && LEGACY_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))) window.localStorage.removeItem(key);
    }
  } catch {
    // Leftover cache is wasted space, not a fault; prayer times are unaffected.
  }
}

function normalizeHours(hours: number): number {
  return ((hours % 24) + 24) % 24;
}

function formatHours(hours: number): string {
  const roundedMinutes = Math.round(normalizeHours(hours) * 60) % (24 * 60);
  const hour = Math.floor(roundedMinutes / 60);
  const minute = roundedMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function timeToMinutes(value: string): number {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}

function minutesToTime(value: number): string {
  const normalized = ((value % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

export function applyPrayerAdjustments(times: PrayerTimes, adjustments: LocationSettings["adjustments"]): PrayerTimes {
  if (!adjustments) return times;
  return Object.fromEntries(
    PRAYER_NAMES.map((prayer) => {
      const adjustment = adjustments[prayer];
      const safeAdjustment = typeof adjustment === "number" && Number.isFinite(adjustment) ? adjustment : 0;
      return [prayer, minutesToTime(timeToMinutes(times[prayer]) + Math.round(safeAdjustment))];
    }),
  ) as unknown as PrayerTimes;
}

/**
 * Returns the UTC offset for the chosen IANA timezone on the requested date.
 * This keeps offline calculations correct across DST transitions even when the
 * selected prayer location differs from the device's current timezone.
 */
export function getTimeZoneOffsetHours(date: Date, timeZone?: string): number {
  if (!timeZone) return -date.getTimezoneOffset() / 60;
  try {
    const reference = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(reference);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const asUtc = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );
    return (asUtc - reference.getTime()) / 3_600_000;
  } catch {
    return -date.getTimezoneOffset() / 60;
  }
}

export interface TimeZoneStatus {
  timeZone: string;
  currentOffsetHours: number;
  standardOffsetHours: number;
  observesDaylightSaving: boolean;
  daylightSavingActive: boolean;
}

export function getTimeZoneStatus(date: Date = new Date(), timeZone?: string): TimeZoneStatus {
  const resolvedTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const offsets = Array.from({ length: 12 }, (_, month) =>
    getTimeZoneOffsetHours(new Date(date.getFullYear(), month, 15, 12), resolvedTimeZone),
  );
  const standardOffsetHours = Math.min(...offsets);
  const currentOffsetHours = getTimeZoneOffsetHours(date, resolvedTimeZone);
  const observesDaylightSaving = offsets.some((offset) => offset !== standardOffsetHours);

  return {
    timeZone: resolvedTimeZone,
    currentOffsetHours,
    standardOffsetHours,
    observesDaylightSaving,
    daylightSavingActive: observesDaylightSaving && currentOffsetHours > standardOffsetHours,
  };
}

export function formatUtcOffset(offsetHours: number): string {
  const sign = offsetHours >= 0 ? "+" : "-";
  const absoluteMinutes = Math.round(Math.abs(offsetHours) * 60);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Calculates daily prayer times locally using solar position formulas.
 * Standard (shadow factor 1) Asr is used, matching Aladhan's default school.
 */
export function calculateOfflinePrayerTimes(
  date: Date = new Date(),
  latitude: number = DEFAULT_LOCATION.latitude ?? 30.0444,
  longitude: number = DEFAULT_LOCATION.longitude ?? 31.2357,
  methodId: number = DEFAULT_LOCATION.calculationMethod,
  timeZone: string | undefined = DEFAULT_LOCATION.timeZone,
): PrayerTimes {
  const method = CALCULATION_METHODS[methodId] ?? EGYPTIAN_METHOD;
  const lat = Math.max(-89.8, Math.min(89.8, latitude));
  const lng = Math.max(-180, Math.min(180, longitude));
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const julianDay =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  const daysSinceJ2000 = julianDay - 2451545;

  const meanAnomaly = (357.529 + 0.98560028 * daysSinceJ2000) % 360;
  const meanAnomalyRad = (meanAnomaly * Math.PI) / 180;
  const meanLongitude = (280.459 + 0.98564736 * daysSinceJ2000) % 360;
  const solarLongitude = (meanLongitude + 1.915 * Math.sin(meanAnomalyRad) + 0.02 * Math.sin(2 * meanAnomalyRad)) % 360;
  const solarLongitudeRad = (solarLongitude * Math.PI) / 180;
  const obliquityRad = ((23.439 - 0.00000036 * daysSinceJ2000) * Math.PI) / 180;
  const declinationRad = Math.asin(Math.sin(obliquityRad) * Math.sin(solarLongitudeRad));

  const rightAscension =
    (Math.atan2(Math.cos(obliquityRad) * Math.sin(solarLongitudeRad), Math.cos(solarLongitudeRad)) * 180) / Math.PI;
  const normalizedRightAscension = rightAscension < 0 ? rightAscension + 360 : rightAscension;
  let equationOfTimeHours = meanLongitude / 15 - normalizedRightAscension / 15;
  if (equationOfTimeHours > 12) equationOfTimeHours -= 24;
  if (equationOfTimeHours < -12) equationOfTimeHours += 24;

  const solarNoon = 12 + getTimeZoneOffsetHours(date, timeZone) - lng / 15 - equationOfTimeHours;
  const latitudeRad = (lat * Math.PI) / 180;

  const hourAngleForAltitude = (altitudeDegrees: number): number | null => {
    const altitudeRad = (altitudeDegrees * Math.PI) / 180;
    const denominator = Math.cos(latitudeRad) * Math.cos(declinationRad);
    if (Math.abs(denominator) < Number.EPSILON) return null;
    const cosine = (Math.sin(altitudeRad) - Math.sin(latitudeRad) * Math.sin(declinationRad)) / denominator;
    if (cosine < -1 || cosine > 1) return null;
    return (Math.acos(cosine) * 180) / Math.PI / 15;
  };

  const fajrAngle = hourAngleForAltitude(-method.fajrAngle);
  const sunsetAngle = hourAngleForAltitude(-0.833);
  const asrAltitude = (Math.atan(1 / (1 + Math.tan(Math.abs(latitudeRad - declinationRad)))) * 180) / Math.PI;
  const asrAngle = hourAngleForAltitude(asrAltitude);

  const sunriseAngle = hourAngleForAltitude(-0.833);
  // When twilight never reaches the selected angle, use that angle as a
  // fraction of the real night (angle / 60). This preserves ordering without
  // changing the selected calculation authority's normal-day result.
  const nightHours = sunsetAngle !== null && sunriseAngle !== null ? 24 - 2 * sunsetAngle : null;
  const highLatitudePortion = (angle: number) => (nightHours === null ? null : (angle / 60) * nightHours);
  const fajr = solarNoon - (fajrAngle ?? (sunsetAngle ?? 6) + (highLatitudePortion(method.fajrAngle) ?? 1.5));
  const dhuhr = solarNoon + 2 / 60;
  const asr = solarNoon + (asrAngle ?? 3);
  const maghrib = solarNoon + (sunsetAngle ?? 6);
  const ishaAngle = method.ishaAngle > 0 ? hourAngleForAltitude(-method.ishaAngle) : null;
  const isha =
    method.ishaMinutes !== undefined
      ? maghrib + method.ishaMinutes / 60
      : solarNoon + (ishaAngle ?? (sunsetAngle ?? 6) + (highLatitudePortion(method.ishaAngle) ?? 1.5));

  return {
    fajr: formatHours(fajr),
    dhuhr: formatHours(dhuhr),
    asr: formatHours(asr),
    maghrib: formatHours(maghrib),
    isha: formatHours(isha),
  };
}

export function getPrayerTimes(date: Date = new Date(), location?: LocationSettings): PrayerTimes {
  const latitude = location?.latitude ?? DEFAULT_LOCATION.latitude ?? 30.0444;
  const longitude = location?.longitude ?? DEFAULT_LOCATION.longitude ?? 31.2357;
  const method = location?.calculationMethod ?? DEFAULT_LOCATION.calculationMethod;
  const baseTimes = calculateOfflinePrayerTimes(
    date,
    latitude,
    longitude,
    method,
    location?.timeZone ?? DEFAULT_LOCATION.timeZone,
  );
  return applyPrayerAdjustments(baseTimes, location?.adjustments);
}

export type CoordinateDetectionResult =
  | { ok: true; latitude: number; longitude: number; timeZone?: string }
  | { ok: false; reason: "unsupported" | "denied" | "unavailable" | "timeout" | "unknown" };

export async function detectUserCoordinates(): Promise<CoordinateDetectionResult> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return { ok: false, reason: "unsupported" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let timeZone: string | undefined;
        try {
          timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
          timeZone = undefined;
        }
        resolve({
          ok: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timeZone,
        });
      },
      (error) => {
        const reason =
          error.code === 1 ? "denied" : error.code === 2 ? "unavailable" : error.code === 3 ? "timeout" : "unknown";
        resolve({ ok: false, reason });
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 300_000 },
    );
  });
}
