import type { PrayerName } from "../types";

/**
 * DRAFTED FOR REVIEW — awaiting sign-off from a qualified reviewer.
 *
 * Shown when someone records that they prayed this prayer in congregation, so
 * every narration here is about that: the virtue of the prayer itself or of
 * praying it with the jamaa'ah. Each is from Bukhari or Muslim, the two most
 * widely authenticated collections, with book and number recorded so a
 * reviewer can check the wording rather than take it on trust.
 *
 * Every entry is a complete quotation. A narration cut off before its point,
 * or elided mid-sentence with an ellipsis, reads as a fragment and invites the
 * reader to fill the gap themselves — the guard in the test file enforces this.
 *
 * Three per prayer is the cap. This appears at the moment of an action, not as
 * a reading screen; a longer list would turn an acknowledgement into homework.
 */
export interface PrayerVirtue {
  /** Narration text, as transmitted. Never paraphrased. */
  textArabic: string;
  /** Collection and number, e.g. "صحيح مسلم ٦٥٧". */
  referenceArabic: string;
  referenceEnglish: string;
}

/** Shown under every prayer's narrations, as the user asked. */
export const PRAYER_VIRTUE_CLOSING_ARABIC =
  "تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ صَالِحَ الأَعْمَالِ، سَلِ اللهَ الثَّبَاتَ وَالقَبُولَ";

const CONGREGATION_DEGREES: PrayerVirtue = {
  textArabic: "«صَلَاةُ الْجَمَاعَةِ تَفْضُلُ صَلَاةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً»",
  referenceArabic: "صحيح البخاري ٦٤٥، وصحيح مسلم ٦٥٠",
  referenceEnglish: "Sahih al-Bukhari 645; Sahih Muslim 650",
};

const TWO_COOL_PRAYERS: PrayerVirtue = {
  textArabic: "«مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ»",
  referenceArabic: "صحيح البخاري ٥٧٤، وصحيح مسلم ٦٣٥",
  referenceEnglish: "Sahih al-Bukhari 574; Sahih Muslim 635",
};

const ANGELS_GATHER: PrayerVirtue = {
  textArabic:
    "«يَتَعَاقَبُونَ فِيكُمْ مَلَائِكَةٌ بِاللَّيْلِ وَمَلَائِكَةٌ بِالنَّهَارِ، وَيَجْتَمِعُونَ فِي صَلَاةِ الْفَجْرِ وَصَلَاةِ الْعَصْرِ»",
  referenceArabic: "صحيح البخاري ٥٥٥، وصحيح مسلم ٦٣٢",
  referenceEnglish: "Sahih al-Bukhari 555; Sahih Muslim 632",
};

const ISHA_FAJR_VIRTUE_1: PrayerVirtue = {
  textArabic:
    "«مَنْ صَلَّى العِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ، وَمَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ فَكَأَنَّمَا صَلَّى اللَّيْلَ كُلَّهُ»",
  referenceArabic: "صحيح مسلم ٦٥٦",
  referenceEnglish: "Sahih Muslim 656",
};

const ISHA_FAJR_VIRTUE_2: PrayerVirtue = {
  textArabic:
    "«أَثْقَلُ الصَّلَاةِ عَلَى المُنَافِقِينَ صَلَاةُ العِشَاءِ وَصَلَاةُ الفَجْرِ، وَلَوْ يَعْلَمُونَ مَا فِيهِمَا لَأَتَوْهُمَا وَلَوْ حَبْوًا»",
  referenceArabic: "صحيح البخاري ٦٥٧؛ صحيح مسلم ٦٥١",
  referenceEnglish: "Sahih al-Bukhari 657; Sahih Muslim 651",
};

export const PRAYER_VIRTUES: Readonly<Record<PrayerName, readonly PrayerVirtue[]>> = Object.freeze({
  fajr: [
    {
      textArabic: "«مَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ فَهُوَ فِي ذِمَّةِ اللَّهِ»",
      referenceArabic: "صحيح مسلم ٦٥٧",
      referenceEnglish: "Sahih Muslim 657",
    },
    TWO_COOL_PRAYERS,
    ANGELS_GATHER,
    ISHA_FAJR_VIRTUE_1,
    ISHA_FAJR_VIRTUE_2,
  ],
  dhuhr: [
    CONGREGATION_DEGREES,
    {
      textArabic:
        "«الصَّلَوَاتُ الْخَمْسُ، وَالْجُمُعَةُ إِلَى الْجُمُعَةِ، وَرَمَضَانُ إِلَى رَمَضَانَ، مُكَفِّرَاتٌ مَا بَيْنَهُنَّ إِذَا اجْتُنِبَتِ الْكَبَائِرُ»",
      referenceArabic: "صحيح مسلم ٢٣٣",
      referenceEnglish: "Sahih Muslim 233",
    },
    {
      textArabic:
        "«أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ، هَلْ يَبْقَى مِنْ دَرَنِهِ شَيْءٌ؟ قَالُوا: لَا يَبْقَى مِنْ دَرَنِهِ شَيْءٌ، قَالَ: فَذَلِكَ مَثَلُ الصَّلَوَاتِ الْخَمْسِ، يَمْحُو اللَّهُ بِهِنَّ الْخَطَايَا»",
      referenceArabic: "صحيح البخاري ٥٢٨، وصحيح مسلم ٦٦٧",
      referenceEnglish: "Sahih al-Bukhari 528; Sahih Muslim 667",
    },
  ],
  asr: [
    TWO_COOL_PRAYERS,
    {
      textArabic: "«مَنْ تَرَكَ صَلَاةَ الْعَصْرِ فَقَدْ حَبِطَ عَمَلُهُ»",
      referenceArabic: "صحيح البخاري ٥٥٣",
      referenceEnglish: "Sahih al-Bukhari 553",
    },
    ANGELS_GATHER,
  ],
  maghrib: [
    CONGREGATION_DEGREES,
    {
      textArabic:
        "«مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ، أَعَدَّ اللَّهُ لَهُ نُزُلَهُ مِنَ الْجَنَّةِ كُلَّمَا غَدَا أَوْ رَاحَ»",
      referenceArabic: "صحيح البخاري ٦٦٢، وصحيح مسلم ٦٦٩",
      referenceEnglish: "Sahih al-Bukhari 662; Sahih Muslim 669",
    },
    {
      textArabic:
        "«مَنْ تَطَهَّرَ فِي بَيْتِهِ ثُمَّ مَشَى إِلَى بَيْتٍ مِنْ بُيُوتِ اللَّهِ لِيَقْضِيَ فَرِيضَةً مِنْ فَرَائِضِ اللَّهِ، كَانَتْ خَطْوَتَاهُ إِحْدَاهُمَا تَحُطُّ خَطِيئَةً وَالْأُخْرَى تَرْفَعُ دَرَجَةً»",
      referenceArabic: "صحيح مسلم ٦٦٦",
      referenceEnglish: "Sahih Muslim 666",
    },
  ],
  isha: [ISHA_FAJR_VIRTUE_1, ISHA_FAJR_VIRTUE_2, CONGREGATION_DEGREES],
});

export function getPrayerVirtues(prayer: PrayerName): readonly PrayerVirtue[] {
  return PRAYER_VIRTUES[prayer] ?? [];
}
