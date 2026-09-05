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
  /** The same narration in English. Falls back to the Arabic until supplied. */
  textEnglish?: string;
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
  textEnglish: "“Prayer in congregation surpasses prayer alone by twenty-seven degrees.”",
};

const TWO_COOL_PRAYERS: PrayerVirtue = {
  textArabic: "«مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ»",
  textEnglish: "“Whoever prays the two cool prayers will enter Paradise.”",
  referenceArabic: "صحيح البخاري ٥٧٤، وصحيح مسلم ٦٣٥",
  referenceEnglish: "Sahih al-Bukhari 574; Sahih Muslim 635",
};

const ANGELS_GATHER: PrayerVirtue = {
  textArabic:
    "«يَتَعَاقَبُونَ فِيكُمْ مَلَائِكَةٌ بِاللَّيْلِ وَمَلَائِكَةٌ بِالنَّهَارِ، وَيَجْتَمِعُونَ فِي صَلَاةِ الْفَجْرِ وَصَلَاةِ الْعَصْرِ»",
  textEnglish:
    "“Angels take turns among you by night and by day, and they gather at the dawn prayer and the afternoon prayer.”",
  referenceArabic: "صحيح البخاري ٥٥٥، وصحيح مسلم ٦٣٢",
  referenceEnglish: "Sahih al-Bukhari 555; Sahih Muslim 632",
};

const ISHA_FAJR_VIRTUE_1: PrayerVirtue = {
  textArabic:
    "«مَنْ صَلَّى العِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ، وَمَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ فَكَأَنَّمَا صَلَّى اللَّيْلَ كُلَّهُ»",
  textEnglish:
    "“Whoever prays Isha in congregation, it is as though he stood half the night in prayer; and whoever prays Fajr in congregation, it is as though he prayed the whole night.”",
  referenceArabic: "صحيح مسلم ٦٥٦",
  referenceEnglish: "Sahih Muslim 656",
};

const ISHA_FAJR_VIRTUE_2: PrayerVirtue = {
  textArabic:
    "«أَثْقَلُ الصَّلَاةِ عَلَى المُنَافِقِينَ صَلَاةُ العِشَاءِ وَصَلَاةُ الفَجْرِ، وَلَوْ يَعْلَمُونَ مَا فِيهِمَا لَأَتَوْهُمَا وَلَوْ حَبْوًا»",
  textEnglish:
    "“The heaviest prayers upon the hypocrites are the night prayer and the dawn prayer. Had they known what is in them, they would have come to them even if crawling.”",
  referenceArabic: "صحيح البخاري ٦٥٧؛ صحيح مسلم ٦٥١",
  referenceEnglish: "Sahih al-Bukhari 657; Sahih Muslim 651",
};

export const PRAYER_VIRTUES: Readonly<Record<PrayerName, readonly PrayerVirtue[]>> = Object.freeze({
  fajr: [
    {
      textArabic: "«مَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ فَهُوَ فِي ذِمَّةِ اللَّهِ»",
      referenceArabic: "صحيح مسلم ٦٥٧",
      referenceEnglish: "Sahih Muslim 657",
      textEnglish: "“Whoever prays the dawn prayer in congregation is under the protection of Allah.”",
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
      textEnglish:
        "“The five daily prayers, one Friday to the next, and one Ramadan to the next, are an expiation for what lies between them, so long as the major sins are avoided.”",
      referenceArabic: "صحيح مسلم ٢٣٣",
      referenceEnglish: "Sahih Muslim 233",
    },
    {
      textArabic:
        "«أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ، هَلْ يَبْقَى مِنْ دَرَنِهِ شَيْءٌ؟ قَالُوا: لَا يَبْقَى مِنْ دَرَنِهِ شَيْءٌ، قَالَ: فَذَلِكَ مَثَلُ الصَّلَوَاتِ الْخَمْسِ، يَمْحُو اللَّهُ بِهِنَّ الْخَطَايَا»",
      textEnglish:
        "“Tell me: if there were a river at the door of one of you in which he washed five times a day, would any dirt remain on him?” They said: “No dirt would remain on him.” He said: “That is the likeness of the five daily prayers; by them Allah wipes away sins.”",
      referenceArabic: "صحيح البخاري ٥٢٨، وصحيح مسلم ٦٦٧",
      referenceEnglish: "Sahih al-Bukhari 528; Sahih Muslim 667",
    },
  ],
  asr: [
    TWO_COOL_PRAYERS,
    {
      textArabic: "«مَنْ تَرَكَ صَلَاةَ الْعَصْرِ فَقَدْ حَبِطَ عَمَلُهُ»",
      textEnglish: "“Whoever abandons the afternoon prayer, his deed has been rendered void.”",
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
      textEnglish:
        "“Whoever goes to the mosque in the morning or the evening, Allah prepares for him a place of hospitality in Paradise each time he goes.”",
      referenceArabic: "صحيح البخاري ٦٦٢، وصحيح مسلم ٦٦٩",
      referenceEnglish: "Sahih al-Bukhari 662; Sahih Muslim 669",
    },
    {
      textArabic:
        "«مَنْ تَطَهَّرَ فِي بَيْتِهِ ثُمَّ مَشَى إِلَى بَيْتٍ مِنْ بُيُوتِ اللَّهِ لِيَقْضِيَ فَرِيضَةً مِنْ فَرَائِضِ اللَّهِ، كَانَتْ خَطْوَتَاهُ إِحْدَاهُمَا تَحُطُّ خَطِيئَةً وَالْأُخْرَى تَرْفَعُ دَرَجَةً»",
      referenceArabic: "صحيح مسلم ٦٦٦",
      referenceEnglish: "Sahih Muslim 666",
      textEnglish:
        "“Whoever purifies himself in his house then walks to one of the houses of Allah to fulfil one of the obligations Allah has enjoined — one of his steps wipes away a sin and the other raises him a degree.”",
    },
  ],
  isha: [ISHA_FAJR_VIRTUE_1, ISHA_FAJR_VIRTUE_2, CONGREGATION_DEGREES],
});

export function getPrayerVirtues(prayer: PrayerName): readonly PrayerVirtue[] {
  return PRAYER_VIRTUES[prayer] ?? [];
}
