import type { PrayerTrackingRecord } from "./types";

/**
 * Merging the facts that were device-local until now.
 *
 * The dhikr completions have synced for a while; prayer tracking and the Qur'an
 * wird did not, so recording Fajr at the mosque on a phone left a laptop
 * believing it never happened. That is fine for a tracker read on one device
 * and wrong for anything derived across them.
 *
 * Two rules run through all of this.
 *
 * Nothing recorded is ever dropped. A merge that can lose an act of worship
 * someone recorded is worse than one that occasionally keeps a stale value, so
 * every rule here unions rather than replaces, and a blank never wins over an
 * answer.
 *
 * The result cannot depend on which device is merging. Both devices run this
 * over the same pair and must reach the same answer, or two devices disagree
 * about the same day forever. That is why ties are broken by an ordering on the
 * values themselves rather than by "mine" or "theirs".
 */

/** How many days of history travel. */
export const SYNCED_HISTORY_DAYS = 120;

/** `mosque` is the more specific claim, so it outranks `home`, which outranks silence. */
const LOCATION_RANK = { mosque: 2, home: 1 } as const;

function locationRank(record: PrayerTrackingRecord): number {
  if (record.location) return LOCATION_RANK[record.location];
  // A legacy record carries the same fact in the boolean and no location.
  return record.mosque ? LOCATION_RANK.mosque : 0;
}

const trackingKey = (record: PrayerTrackingRecord) => `${record.dayKey}|${record.prayer}`;

/**
 * Which of two records for the same prayer describes it.
 *
 * `updatedAt` decides when both carry one, so correcting "mosque" to "home" on
 * one device survives the merge — without it a value ordering alone would make
 * that correction impossible, because the stale, higher-ranked value would win
 * on every sync forever.
 *
 * Records written before `updatedAt` existed fall back to the ordering, which
 * keeps the more specific answer and never a blank.
 */
export function pickPrayerRecord(a: PrayerTrackingRecord, b: PrayerTrackingRecord): PrayerTrackingRecord {
  const preferred = a.updatedAt && b.updatedAt ? (a.updatedAt >= b.updatedAt ? a : b) : null;
  const other = preferred === a ? b : preferred === b ? a : null;

  const base = preferred ?? (locationRank(a) >= locationRank(b) ? a : b);
  const merged = preferred ? { ...preferred } : { ...base };

  // The follow-ups are unioned whichever record won: doing the adhkar on one
  // device and the rawatib on another is one prayer with both done.
  const fallback = other ?? (base === a ? b : a);
  merged.adhkar = a.adhkar || b.adhkar;
  merged.sunnah = a.sunnah || b.sunnah || undefined;
  if (!merged.location && fallback.location) merged.location = fallback.location;
  merged.mosque = merged.location ? merged.location === "mosque" : a.mosque || b.mosque;
  return merged;
}

export function mergePrayerTracking(
  local: readonly PrayerTrackingRecord[] = [],
  remote: readonly PrayerTrackingRecord[] = [],
): PrayerTrackingRecord[] {
  const byKey = new Map<string, PrayerTrackingRecord>();
  for (const record of [...local, ...remote]) {
    const key = trackingKey(record);
    const existing = byKey.get(key);
    byKey.set(key, existing ? pickPrayerRecord(existing, record) : record);
  }
  // Sorted so two devices serialise the same array and a pointless write is not
  // mistaken for a change.
  return [...byKey.values()].sort((a, b) => trackingKey(a).localeCompare(trackingKey(b)));
}

/**
 * Pages read, unioned per day.
 *
 * A page read on either device is read. Sorted and de-duplicated because the
 * wird goal counts unique pages, and because an unstable order would make every
 * sync look like a change.
 */
export function mergeWirdHistory(
  local: Record<string, number[]> = {},
  remote: Record<string, number[]> = {},
): Record<string, number[]> {
  const merged: Record<string, number[]> = {};
  for (const dayKey of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const pages = new Set([...(local[dayKey] ?? []), ...(remote[dayKey] ?? [])]);
    merged[dayKey] = [...pages].sort((a, b) => a - b);
  }
  return merged;
}

/**
 * The goal that applied on a given day.
 *
 * These are a record of what was asked of a past day, so an existing entry is
 * never overwritten: rewriting it would silently change whether a day already
 * counted as complete. Only days neither side has recorded are added.
 */
export function mergeQuranWirdDailyGoals(
  local: Record<string, number> = {},
  remote: Record<string, number> = {},
): Record<string, number> {
  return { ...remote, ...local };
}

/** Trims history to what travels, newest first, so the payload stays bounded. */
export function recentDayKeys(dayKeys: readonly string[], days = SYNCED_HISTORY_DAYS): string[] {
  return [...dayKeys].sort().slice(-days);
}
