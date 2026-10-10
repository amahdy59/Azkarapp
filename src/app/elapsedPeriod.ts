/** Calendar coverage includes unrecorded elapsed days, never future dates.
 * UTC arithmetic on date-only keys avoids local DST changing the day count.
 */
export function getElapsedPeriod(startKey: string, periodEndKey: string, now: Date) {
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const endKey = periodEndKey < todayKey ? periodEndKey : todayKey;
  const days = endKey < startKey ? 0 : Math.round((Date.parse(endKey) - Date.parse(startKey)) / 86400000) + 1;
  return { startKey, endKey, days };
}
