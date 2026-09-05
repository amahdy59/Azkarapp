import type { PrayerName } from "../types";

/**
 * DRAFTED FOR REVIEW — awaiting sign-off from a qualified reviewer.
 *
 * The rawātib: the confirmed voluntary rak'ahs attached to each obligatory
 * prayer. Twelve in a day and night, which is the set the narration of Umm
 * Habibah names — two before Fajr, four before Dhuhr and two after it, two
 * after Maghrib, two after Isha.
 *
 * What is deliberately absent: the unconfirmed rak'ahs (four before Asr, two
 * before Maghrib, two before Isha). They are a different ruling, and putting
 * them on the same line as the confirmed ones would present them as the same
 * thing. Asr therefore carries no rawātib here and its card does not render.
 *
 * Counts only, and one line of copy each. This sits on the surface someone
 * opens to record a prayer, not in a reading screen: what it has to answer is
 * "how many, and when", and anything longer turns a prompt into a lesson.
 */
export interface PrayerSunnah {
  /** Confirmed rak'ahs before the fard. */
  before: number;
  /** Confirmed rak'ahs after the fard. */
  after: number;
}

const RAWATIB: Record<PrayerName, PrayerSunnah> = {
  fajr: { before: 2, after: 0 },
  dhuhr: { before: 4, after: 2 },
  asr: { before: 0, after: 0 },
  maghrib: { before: 0, after: 2 },
  isha: { before: 0, after: 2 },
};

/** The confirmed rawātib for a prayer, or null where there are none. */
export function getPrayerSunnah(prayer: PrayerName): PrayerSunnah | null {
  const sunnah = RAWATIB[prayer];
  return sunnah.before === 0 && sunnah.after === 0 ? null : sunnah;
}

/**
 * The whole set, for the twelve-rak'ah total the narration names. Exported so
 * a test can hold the content to it rather than trusting the table above.
 */
export const RAWATIB_TOTAL = Object.values(RAWATIB).reduce((total, s) => total + s.before + s.after, 0);
