import { dateFromProgressDayKey, getProgressDayKey } from "./progress";

/** Last seven elapsed civil dates within the selected scope, never future bars. */
export function recordedPageRhythm(start: string, end: string, today: string, counts: ReadonlyMap<string, number>) {
  const last = end < today ? end : today;
  const date = dateFromProgressDayKey(last);
  const points: { dayKey: string; count: number }[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(date);
    day.setDate(day.getDate() - offset);
    const dayKey = getProgressDayKey(day, 0);
    if (dayKey >= start && dayKey <= last) points.push({ dayKey, count: counts.get(dayKey) ?? 0 });
  }
  return points;
}
