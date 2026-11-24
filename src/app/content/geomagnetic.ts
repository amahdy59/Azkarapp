/*
 * Spherical-harmonic evaluation adapted from Android GeomagneticField.
 * Copyright (C) 2009 The Android Open Source Project; Apache-2.0.
 * See docs/third-party/GEOMAGNETIC_LICENSE.txt and PRAYER_TIMES.md.
 * Coefficients: NOAA/BGS WMM2025 (public-domain US Government material).
 */
import { WMM2025_COEFFICIENTS } from "./wmm2025";

export const MAGNETIC_MODEL = { name: "WMM2025", epoch: 2025, validBefore: 2030, reviewBy: "2029-07-01" } as const;

const DEGREE = Math.PI / 180;
const ORDER = 12;
const table = () => Array.from({ length: ORDER + 1 }, (_, n) => new Float64Array(n + 1));
const schmidt = table();
schmidt[0]![0] = 1;
for (let n = 1; n <= ORDER; n++) {
  schmidt[n]![0] = (schmidt[n - 1]![0]! * (2 * n - 1)) / n;
  for (let m = 1; m <= n; m++) {
    schmidt[n]![m] = schmidt[n]![m - 1]! * Math.sqrt(((n - m + 1) * (m === 1 ? 2 : 1)) / (n + m));
  }
}

/** Offline WMM2025; returns null beyond the model's published date/altitude range. */
export function getGeomagneticField(latitude: number, longitude: number, date: Date, altitudeMeters = 0) {
  if (
    ![latitude, longitude, date.getTime(), altitudeMeters].every(Number.isFinite) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    altitudeMeters < -1000 ||
    altitudeMeters > 850000
  )
    return null;
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const decimalYear = year + (date.getTime() - start) / (Date.UTC(year + 1, 0, 1) - start);
  if (decimalYear < MAGNETIC_MODEL.epoch || decimalYear >= MAGNETIC_MODEL.validBefore) return null;
  const elapsed = decimalYear - MAGNETIC_MODEL.epoch;
  const geodetic = Math.max(-89.99999, Math.min(89.99999, latitude)) * DEGREE;
  const lon = longitude * DEGREE;
  const altitude = altitudeMeters / 1000;
  const a2 = 6378.137 ** 2;
  const b2 = 6356.7523142 ** 2;
  const sinLat = Math.sin(geodetic);
  const cosLat = Math.cos(geodetic);
  const surfaceRadius = Math.sqrt(a2 * cosLat ** 2 + b2 * sinLat ** 2);
  const geocentric = Math.atan(
    (Math.tan(geodetic) * (surfaceRadius * altitude + b2)) / (surfaceRadius * altitude + a2),
  );
  const radius = Math.sqrt(
    altitude ** 2 + 2 * altitude * surfaceRadius + (a2 ** 2 * cosLat ** 2 + b2 ** 2 * sinLat ** 2) / surfaceRadius ** 2,
  );
  const theta = Math.PI / 2 - geocentric;
  const cos = Math.cos(theta),
    sin = Math.sin(theta);
  const p = table(),
    derivative = table();
  p[0]![0] = 1;
  for (let n = 1; n <= ORDER; n++) {
    for (let m = 0; m <= n; m++) {
      if (n === m) {
        p[n]![m] = sin * p[n - 1]![m - 1]!;
        derivative[n]![m] = cos * p[n - 1]![m - 1]! + sin * derivative[n - 1]![m - 1]!;
      } else {
        const k = n === 1 || m === n - 1 ? 0 : ((n - 1) ** 2 - m ** 2) / ((2 * n - 1) * (2 * n - 3));
        p[n]![m] = cos * p[n - 1]![m]! - (k ? k * p[n - 2]![m]! : 0);
        derivative[n]![m] = -sin * p[n - 1]![m]! + cos * derivative[n - 1]![m]! - (k ? k * derivative[n - 2]![m]! : 0);
      }
    }
  }
  let x = 0,
    y = 0,
    z = 0;
  for (const [n, m, baseG, baseH, deltaG, deltaH] of WMM2025_COEFFICIENTS) {
    const g = baseG + elapsed * deltaG,
      h = baseH + elapsed * deltaH;
    const sinLon = Math.sin(m * lon),
      cosLon = Math.cos(m * lon);
    const radial = (6371.2 / radius) ** (n + 2) * schmidt[n]![m]!;
    const contribution = g * cosLon + h * sinLon;
    x += radial * contribution * derivative[n]![m]!;
    y += (radial * m * (g * sinLon - h * cosLon) * p[n]![m]!) / Math.cos(geocentric);
    z -= (n + 1) * radial * contribution * p[n]![m]!;
  }
  const difference = geodetic - geocentric;
  const north = x * Math.cos(difference) + z * Math.sin(difference);
  const east = y;
  const down = -x * Math.sin(difference) + z * Math.cos(difference);
  return {
    declination: Math.atan2(east, north) / DEGREE,
    horizontalIntensity: Math.hypot(north, east),
    north,
    east,
    down,
  };
}

/** WMM caution/blackout regions cannot support confident compass guidance. */
export function getMagneticDeclination(latitude: number, longitude: number, date: Date, altitudeMeters = 0) {
  const field = getGeomagneticField(latitude, longitude, date, altitudeMeters);
  return field && field.horizontalIntensity >= 6000 ? field.declination : null;
}
