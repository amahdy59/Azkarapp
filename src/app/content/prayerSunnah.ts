import type { PrayerName } from "../types";

/**
 * DRAFTED FOR REVIEW — awaiting sign-off from a qualified reviewer.
 *
 * The voluntary rak'ahs attached to each obligatory prayer, in two ranks.
 *
 * `confirmed` is the rawātib: two before Fajr, four before Dhuhr and two after,
 * two after Maghrib, two after Isha — the twelve the narration of Umm Habibah
 * names.
 *
 * `optional` is the rest, which are encouraged without being among those
 * twelve: the four before Asr, and the two before Maghrib. They are a
 * different ruling and the card says so on its face, because a reader who
 * cannot tell them apart is being told something untrue by the layout.
 *
 * Every entry carries the narration it rests on, so the reader can check the
 * claim rather than take the app's word for it, and a reviewer can check the
 * wording rather than take mine. Each is a complete quotation with its
 * collection and number; where a narration is outside the two Sahihs its
 * grading is named.
 */
export type SunnahRank = "confirmed" | "optional";

export interface SunnahEvidence {
  /** Narration text, as transmitted. Never paraphrased. */
  textArabic: string;
  /** Collection and number, e.g. "صحيح مسلم ٧٢٥". */
  referenceArabic: string;
  referenceEnglish: string;
  /** Named only where the narration sits outside Bukhari and Muslim. */
  gradingArabic?: string;
  gradingEnglish?: string;
}

export interface PrayerSunnah {
  /** Confirmed rak'ahs before the fard, and the same after it. */
  before: number;
  after: number;
  rank: SunnahRank;
  evidence: SunnahEvidence;
}

const TWELVE_RAKAHS: SunnahEvidence = {
  textArabic:
    "«مَنْ صَلَّى اثْنَتَيْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بِهِنَّ بَيْتٌ فِي الْجَنَّةِ»",
  referenceArabic: "صحيح مسلم ٧٢٨",
  referenceEnglish: "Sahih Muslim 728",
};

const FAJR_PAIR: SunnahEvidence = {
  textArabic: "«رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا»",
  referenceArabic: "صحيح مسلم ٧٢٥",
  referenceEnglish: "Sahih Muslim 725",
};

const DHUHR_FOUR: SunnahEvidence = {
  textArabic:
    "«مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ»",
  referenceArabic: "سنن أبي داود ١٢٦٩، وسنن الترمذي ٤٢٨",
  referenceEnglish: "Sunan Abi Dawud 1269; Jami' at-Tirmidhi 428",
  gradingArabic: "صححه الألباني",
  gradingEnglish: "Graded sahih by al-Albani",
};

/** The narration the reader asked for: the four before Asr, and their rank. */
const ASR_FOUR: SunnahEvidence = {
  textArabic: "«رَحِمَ اللَّهُ امْرَأً صَلَّى قَبْلَ الْعَصْرِ أَرْبَعًا»",
  referenceArabic: "سنن أبي داود ١٢٧١، وسنن الترمذي ٤٣٠",
  referenceEnglish: "Sunan Abi Dawud 1271; Jami' at-Tirmidhi 430",
  gradingArabic: "حسّنه الألباني",
  gradingEnglish: "Graded hasan by al-Albani",
};

const MAGHRIB_PAIR: SunnahEvidence = {
  textArabic: "«صَلُّوا قَبْلَ صَلَاةِ الْمَغْرِبِ رَكْعَتَيْنِ» ثُمَّ قَالَ فِي الثَّالِثَةِ: «لِمَنْ شَاءَ»",
  referenceArabic: "صحيح البخاري ١١٨٣",
  referenceEnglish: "Sahih al-Bukhari 1183",
};

/**
 * What is due before the fard, and what after it.
 *
 * Asr and Maghrib carry an `optional` entry rather than nothing: encouraged,
 * outside the twelve, and labelled as such wherever it is shown.
 */
const SUNNAH: Record<PrayerName, { before?: PrayerSunnah; after?: PrayerSunnah }> = {
  fajr: {
    before: { before: 2, after: 0, rank: "confirmed", evidence: FAJR_PAIR },
  },
  dhuhr: {
    before: { before: 4, after: 0, rank: "confirmed", evidence: DHUHR_FOUR },
    after: { before: 0, after: 2, rank: "confirmed", evidence: TWELVE_RAKAHS },
  },
  asr: {
    before: { before: 4, after: 0, rank: "optional", evidence: ASR_FOUR },
  },
  maghrib: {
    before: { before: 2, after: 0, rank: "optional", evidence: MAGHRIB_PAIR },
    after: { before: 0, after: 2, rank: "confirmed", evidence: TWELVE_RAKAHS },
  },
  isha: {
    after: { before: 0, after: 2, rank: "confirmed", evidence: TWELVE_RAKAHS },
  },
};

/** What is due at this point in the prayer, or null where there is nothing. */
export function getPrayerSunnah(prayer: PrayerName, position: "before" | "after"): PrayerSunnah | null {
  return SUNNAH[prayer][position] ?? null;
}

/** True where the prayer has anything at all to offer, in either position. */
export function hasPrayerSunnah(prayer: PrayerName): boolean {
  return Boolean(SUNNAH[prayer].before || SUNNAH[prayer].after);
}

/**
 * The confirmed rawātib add to twelve in a day and night, which is the whole
 * claim of the narration they rest on. Exported so a test holds the table to
 * it rather than trusting it.
 */
export const CONFIRMED_RAKAH_TOTAL = Object.values(SUNNAH)
  .flatMap((entry) => [entry.before, entry.after])
  .filter((entry): entry is PrayerSunnah => Boolean(entry) && entry!.rank === "confirmed")
  .reduce((total, entry) => total + entry.before + entry.after, 0);
