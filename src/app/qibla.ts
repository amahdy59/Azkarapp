const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

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
