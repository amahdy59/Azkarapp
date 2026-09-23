// WGS84 point used by Google Qibla Finder for the Kaaba.
const KAABA_LATITUDE = 21.4224779;
const KAABA_LONGITUDE = 39.8251832;

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

/** Initial great-circle bearing from the reader's position to the Kaaba. */
export function getQiblaBearing(latitude: number, longitude: number): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitude1 = toRadians(latitude);
  const latitude2 = toRadians(KAABA_LATITUDE);
  const longitudeDelta = toRadians(KAABA_LONGITUDE - longitude);
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x =
    Math.cos(latitude1) * Math.sin(latitude2) - Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);

  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

/** Signed shortest turn from the device heading to Qibla: positive is clockwise. */
export function getQiblaTurn(bearing: number, heading: number): number {
  const turn = normalizeDegrees(bearing - heading);
  return turn > 180 ? turn - 360 : turn;
}

/** Smooth sensor jitter across the 0/360 seam without delaying large turns. */
export function smoothCompassHeading(previous: number | null, next: number): number {
  if (previous === null) return normalizeDegrees(next);
  const shortestDelta = ((next - previous + 540) % 360) - 180;
  if (Math.abs(shortestDelta) >= 45) return normalizeDegrees(next);
  return normalizeDegrees(previous + shortestDelta * 0.25);
}

/** Great-circle distance to the Kaaba in kilometers. */
export function getKaabaDistance(latitude: number, longitude: number): number {
  const EARTH_RADIUS_KM = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA_LATITUDE);
  const dLat = toRadians(KAABA_LATITUDE - latitude);
  const dLon = toRadians(KAABA_LONGITUDE - longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_KM * c);
}
