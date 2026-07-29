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

const CACHE_KEY_PREFIX = "azkarapp.prayer_times_cache.";
const PRAYER_NAMES: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCacheKey(date: Date, lat: number, lng: number, method: number): string {
  return `${CACHE_KEY_PREFIX}${dateKey(date)}_${lat.toFixed(3)}_${lng.toFixed(3)}_${method}`;
}

function isPrayerTimes(value: unknown): value is PrayerTimes {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Record<PrayerName, unknown>>;
  return PRAYER_NAMES.every((prayer) => typeof candidate[prayer] === "string" && TIME_PATTERN.test(candidate[prayer]));
}

function getCachedPrayerTimes(date: Date, lat: number, lng: number, method: number): PrayerTimes | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getCacheKey(date, lat, lng, method));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPrayerTimes(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function setCachedPrayerTimes(date: Date, lat: number, lng: number, method: number, times: PrayerTimes): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getCacheKey(date, lat, lng, method), JSON.stringify(times));
  } catch {
    // Prayer times still work through the in-memory offline calculation.
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

  const fajr = solarNoon - (fajrAngle ?? 1.5);
  const dhuhr = solarNoon + 2 / 60;
  const asr = solarNoon + (asrAngle ?? 3);
  const maghrib = solarNoon + (sunsetAngle ?? 6);
  const ishaAngle = method.ishaAngle > 0 ? hourAngleForAltitude(-method.ishaAngle) : null;
  const isha = method.ishaMinutes !== undefined ? maghrib + method.ishaMinutes / 60 : solarNoon + (ishaAngle ?? 7.5);

  return {
    fajr: formatHours(fajr),
    dhuhr: formatHours(dhuhr),
    asr: formatHours(asr),
    maghrib: formatHours(maghrib),
    isha: formatHours(isha),
  };
}

function parseApiTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/);
  return match ? `${match[1]}:${match[2]}` : null;
}

export function parseAladhanPrayerTimes(payload: unknown): PrayerTimes | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const timings = (data as { timings?: unknown }).timings;
  if (!timings || typeof timings !== "object") return null;
  const source = timings as Record<string, unknown>;
  const parsed = {
    fajr: parseApiTime(source.Fajr),
    dhuhr: parseApiTime(source.Dhuhr),
    asr: parseApiTime(source.Asr),
    maghrib: parseApiTime(source.Maghrib),
    isha: parseApiTime(source.Isha),
  };
  return Object.values(parsed).every(Boolean) ? (parsed as PrayerTimes) : null;
}

export async function fetchAladhanPrayerTimes(
  date: Date = new Date(),
  latitude: number = DEFAULT_LOCATION.latitude ?? 30.0444,
  longitude: number = DEFAULT_LOCATION.longitude ?? 31.2357,
  methodId: number = DEFAULT_LOCATION.calculationMethod,
): Promise<PrayerTimes | null> {
  const cached = getCachedPrayerTimes(date, latitude, longitude, methodId);
  if (cached) return cached;

  const apiDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    method: String(methodId),
  });
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`https://api.aladhan.com/v1/timings/${apiDate}?${query}`, {
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const times = parseAladhanPrayerTimes(await response.json());
    if (times) setCachedPrayerTimes(date, latitude, longitude, methodId, times);
    return times;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getPrayerTimes(date: Date = new Date(), location?: LocationSettings): PrayerTimes {
  const latitude = location?.latitude ?? DEFAULT_LOCATION.latitude ?? 30.0444;
  const longitude = location?.longitude ?? DEFAULT_LOCATION.longitude ?? 31.2357;
  const method = location?.calculationMethod ?? DEFAULT_LOCATION.calculationMethod;
  const cached = getCachedPrayerTimes(date, latitude, longitude, method);
  const baseTimes =
    cached ??
    calculateOfflinePrayerTimes(date, latitude, longitude, method, location?.timeZone ?? DEFAULT_LOCATION.timeZone);
  return applyPrayerAdjustments(baseTimes, location?.adjustments);
}

export function triggerBackgroundPrayerTimesRefresh(
  date: Date = new Date(),
  location?: LocationSettings,
  onUpdated?: (times: PrayerTimes) => void,
): void {
  const latitude = location?.latitude ?? DEFAULT_LOCATION.latitude ?? 30.0444;
  const longitude = location?.longitude ?? DEFAULT_LOCATION.longitude ?? 31.2357;
  const method = location?.calculationMethod ?? DEFAULT_LOCATION.calculationMethod;
  void fetchAladhanPrayerTimes(date, latitude, longitude, method).then((times) => {
    if (times) onUpdated?.(applyPrayerAdjustments(times, location?.adjustments));
  });
}

export async function detectUserCoordinates(): Promise<{
  latitude: number;
  longitude: number;
  timeZone?: string;
} | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return null;

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
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timeZone,
        });
      },
      () => resolve(null),
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 300_000 },
    );
  });
}
