import { PRAYER_NAMES, getEstimatedPrayerTimes } from "./content/prayerTimes";
import { getPrayerSunnah } from "./content/prayerSunnah";
import type { LocationSettings, PrayerName, PrayerTrackingRecord } from "./types";

/**
 * Where a prayer stands, from the clock and from what the reader has recorded.
 *
 * The clock alone cannot answer this. Someone may pray Isha at eleven, or with
 * the jamaa'ah at the adhan, or make it up the next morning — so a recorded
 * prayer outranks the hour every time, and the hour only decides what to offer
 * someone who has recorded nothing yet.
 */
export type PrayerPhase =
  /** Later today, and not soon. */
  | "upcoming"
  /** Close enough that preparing for it is the useful thing to show. */
  | "approaching"
  /** Its time has come in and the next prayer has not. */
  | "now"
  /** The window closed with nothing recorded — missed, not "not yet". */
  | "passed"
  /** The reader said where they prayed it. */
  | "recorded";

export interface PrayerMoment {
  prayer: PrayerName;
  phase: PrayerPhase;
  /** 24-hour "HH:MM", as the prayer-times module reports it. */
  time: string;
  /** Minutes until the adhan; negative once it has passed. */
  minutesUntil: number;
  /**
   * Which rawātib is worth naming. Before the fard while the prayer is still
   * ahead, after it once it is in or done — the two before Fajr and the four
   * before Dhuhr are the whole reason the approach window exists, and they are
   * useless once the prayer has been prayed.
   */
  sunnahFocus: "before" | "after" | null;
  /** Where it was prayed, once that is known. */
  location: "mosque" | "home" | null;
  /** The prayer's own adhkar were completed. */
  adhkarDone: boolean;
  /** The rawātib were prayed. */
  sunnahDone: boolean;
}

/**
 * How long before the adhan the prayer starts leading the screen.
 *
 * Twenty minutes rather than fifteen: the rak'ahs before Fajr and Dhuhr are
 * what this window is for, and a quarter of an hour is not long enough to
 * prepare, walk and pray them. It is also capped at half the gap from the
 * previous prayer, so Maghrib never starts leading while Asr is still the
 * prayer someone is standing in — on a short winter afternoon that gap can be
 * under an hour.
 */
export const APPROACH_LEAD_MINUTES = 20;

function toMinutes(time: string): number {
  const [h, m] = time.split(":");
  return Number(h ?? 0) * 60 + Number(m ?? 0);
}

/** Minutes from the previous prayer's adhan, wrapping Fajr back to Isha. */
function gapFromPrevious(index: number, minutes: readonly number[]): number {
  const current = minutes[index]!;
  if (index === 0) {
    const isha = minutes[minutes.length - 1]!;
    return current + (24 * 60 - isha);
  }
  return current - minutes[index - 1]!;
}

function recordFor(
  records: readonly PrayerTrackingRecord[],
  dayKey: string,
  prayer: PrayerName,
): PrayerTrackingRecord | undefined {
  return records.find((record) => record.dayKey === dayKey && record.prayer === prayer);
}

/**
 * The place a record names.
 *
 * `location` is the field this screen writes; `mosque` is the boolean the
 * tracking cards have always written, and it stays authoritative for records
 * made before the field existed. A false `mosque` is not "at home": it is the
 * absence of a record, which is exactly the distinction the old model could
 * not draw.
 */
export function trackedLocation(record: PrayerTrackingRecord | undefined): "mosque" | "home" | null {
  if (!record) return null;
  if (record.location === "mosque" || record.location === "home") return record.location;
  return record.mosque ? "mosque" : null;
}

/**
 * Everything the prayer surface needs about one prayer, as a pure function of
 * the clock, the location settings and what has been recorded — so it can be
 * held to fixed timestamps in a test rather than to whenever the suite runs.
 */
export function getPrayerMoment({
  prayer,
  now,
  dayKey,
  records,
  location,
}: {
  prayer: PrayerName;
  now: Date;
  dayKey: string;
  records: readonly PrayerTrackingRecord[];
  location?: LocationSettings;
}): PrayerMoment {
  const times = getEstimatedPrayerTimes(now, location);
  const minutes = PRAYER_NAMES.map((name) => toMinutes(times[name]));
  const index = PRAYER_NAMES.indexOf(prayer);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minutesUntil = minutes[index]! - nowMinutes;

  const record = recordFor(records, dayKey, prayer);
  const place = trackedLocation(record);

  const lead = Math.min(APPROACH_LEAD_MINUTES, Math.max(1, Math.floor(gapFromPrevious(index, minutes) / 2)));
  const nextAdhan = index === PRAYER_NAMES.length - 1 ? 24 * 60 : minutes[index + 1]!;

  let phase: PrayerPhase;
  if (place) {
    phase = "recorded";
  } else if (minutesUntil > lead) {
    phase = "upcoming";
  } else if (minutesUntil > 0) {
    phase = "approaching";
  } else if (nowMinutes < nextAdhan) {
    phase = "now";
  } else {
    phase = "passed";
  }

  /* Before the fard while it is still ahead; after it once it is in or done.
     A prayer with nothing in that position names neither — Isha has no sunnah
     before it, Fajr none after. */
  const ahead = phase === "upcoming" || phase === "approaching";
  const wantsBefore = ahead && Boolean(getPrayerSunnah(prayer, "before"));
  const wantsAfter = !ahead && Boolean(getPrayerSunnah(prayer, "after"));

  return {
    prayer,
    phase,
    time: times[prayer],
    minutesUntil,
    sunnahFocus: wantsBefore ? "before" : wantsAfter ? "after" : null,
    location: place,
    adhkarDone: record?.adhkar ?? false,
    sunnahDone: record?.sunnah ?? false,
  };
}

/**
 * The prayer worth leading a screen with, or null when none is.
 *
 * Two prayers can be live at once: for the twenty minutes before Maghrib, Asr
 * is still `now` — its window has not closed — while Maghrib is already
 * `approaching`. Picking between them is a product question, not a clock one,
 * so it is answered here once rather than in each screen that asks.
 *
 * An unrecorded prayer whose time is in comes first: it is the one thing the
 * reader still has to answer, and burying it under the next prayer's countdown
 * is how a prayer goes unrecorded. Only once it is answered does the prayer
 * ahead take the screen, which is the point of the approach window — the
 * rak'ahs before Fajr and Dhuhr need preparing for.
 *
 * Returns null outside those windows. Home then keeps its compact five-prayer
 * strip: a prayer nine hours away has nothing to record and does not deserve a
 * third of the screen.
 */
/**
 * How long after the adhan a prayer still leads.
 *
 * The `now` phase cannot answer this on its own: it lasts until the next
 * prayer, so Fajr is `now` for the seven hours until Dhuhr, and a screen led by
 * the phase alone would carry a prayer card all day — which is the opposite of
 * showing it when it matters. Ninety minutes covers praying, the adhkar that
 * follow and the rawatib, and it leaves the gaps between prayers to the compact
 * five.
 */
export const LEADING_WINDOW_MINUTES = 90;

export function getLeadingPrayerMoment(input: {
  now: Date;
  dayKey: string;
  records: readonly PrayerTrackingRecord[];
  location?: LocationSettings;
}): PrayerMoment | null {
  const moments = PRAYER_NAMES.map((prayer) => getPrayerMoment({ ...input, prayer }));
  const live = moments.filter(
    (moment) =>
      (moment.phase === "now" || moment.phase === "approaching" || moment.phase === "recorded") &&
      moment.minutesUntil > -LEADING_WINDOW_MINUTES,
  );
  if (live.length === 0) return null;

  const unanswered = live.find((moment) => moment.phase === "now" && moment.location === null);
  if (unanswered) return unanswered;

  const approaching = live.find((moment) => moment.phase === "approaching");
  if (approaching) return approaching;

  const current = live.find((moment) => moment.phase === "now");
  if (current) return current;

  /* Whatever was recorded most recently — the reader has just answered it, and
     the adhkar and rawātib that follow it are still the useful thing to offer. */
  return live.reduce((latest, moment) => (moment.minutesUntil > latest.minutesUntil ? moment : latest));
}
