import type { PrayerSunnah } from "./prayerSunnah";
import type { PrayerVirtue } from "./prayerVirtues";

/** Product-owner approved 2026-10-16; not an independent scholarly review.
 * Sources: https://sunnah.com/muslim:881a, :882a and :857a.
 * Friday uses one after-Sunnah checkbox, retaining the persisted Dhuhr key.
 */
export const JUMUAH_SUNNAH: readonly PrayerSunnah[] = [
  {
    before: 0,
    after: 4,
    rank: "optional",
    evidence: {
      textArabic: "«إِذَا صَلَّى أَحَدُكُمُ الْجُمُعَةَ فَلْيُصَلِّ بَعْدَهَا أَرْبَعًا»",
      textEnglish: "“When one of you prays Jumu‘ah, let him pray four rak‘ahs afterwards.”",
      referenceArabic: "صحيح مسلم ٨٨١ أ",
      referenceEnglish: "Sahih Muslim 881a",
    },
  },
  {
    before: 0,
    after: 2,
    rank: "optional",
    evidence: {
      textArabic:
        "أَنَّهُ كَانَ إِذَا صَلَّى الْجُمُعَةَ انْصَرَفَ فَسَجَدَ سَجْدَتَيْنِ فِي بَيْتِهِ ثُمَّ قَالَ كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يَصْنَعُ ذَلِكَ",
      textEnglish:
        "Ibn ‘Umar would leave after Jumu‘ah and pray two rak‘ahs in his home. He then said that the Messenger of Allah ﷺ used to do so.",
      referenceArabic: "صحيح مسلم ٨٨٢ أ — عن ابن عمر",
      referenceEnglish: "Sahih Muslim 882a — reported from Ibn ‘Umar",
    },
  },
];

export const JUMUAH_VIRTUE: PrayerVirtue = {
  textArabic:
    "«مَنِ اغْتَسَلَ ثُمَّ أَتَى الْجُمُعَةَ فَصَلَّى مَا قُدِّرَ لَهُ ثُمَّ أَنْصَتَ حَتَّى يَفْرُغَ مِنْ خُطْبَتِهِ ثُمَّ يُصَلِّيَ مَعَهُ غُفِرَ لَهُ مَا بَيْنَهُ وَبَيْنَ الْجُمُعَةِ الأُخْرَى وَفَضْلَ ثَلاَثَةِ أَيَّامٍ»",
  textEnglish:
    "“Whoever bathes, comes to Jumu‘ah, prays what is allotted to him, then listens quietly until the sermon ends and prays with the imam, is forgiven for the interval until the next Jumu‘ah and three additional days.”",
  referenceArabic: "صحيح مسلم ٨٥٧ أ",
  referenceEnglish: "Sahih Muslim 857a",
};
