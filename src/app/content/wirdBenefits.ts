import type { BenefitEvidence } from "./zikrBenefits";

/**
 * Evidence for keeping a wird — a fixed daily portion of remembrance — rather
 * than for any single zikr. The Zikr benefits index answers "what does this
 * dhikr earn?"; this one answers "why keep to it every day?".
 *
 * DRAFTED FOR REVIEW. Every item below is a well-known primary text cited to
 * its collection and number, but the selection and the English renderings are
 * this app's, not a scholar's. They should be checked before they are treated
 * as settled — see docs/agent/DECISION_LOG.md (DEC-081).
 *
 * Companions and later scholars share one section, the way classical works
 * group آثار السلف, because the point each makes is the same: a small, steady
 * portion outlasts a large, occasional one.
 */

export type WirdBenefitSection = "quran" | "hadith" | "salaf";

export interface WirdEvidence extends Omit<BenefitEvidence, "kind"> {
  kind: WirdBenefitSection;
  /** Who is being quoted. Only used by the salaf section. */
  attribution?: { ar: string; en: string };
}

const QURAN_URL = (surah: number, verses: string) => `https://quran.com/${surah}/${verses}`;
const SUNNAH_URL = (reference: string) => `https://sunnah.com/${reference}`;
const DORAR_SEARCH = (query: string) => `https://www.dorar.net/hadith/search?q=${encodeURIComponent(query)}`;

export const WIRD_QURAN_EVIDENCE: readonly WirdEvidence[] = [
  {
    id: "wird-quran-33-41",
    kind: "quran",
    title: { ar: "الأحزاب ٤١-٤٢", en: "Qur'an 33:41-42" },
    text: {
      ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا ۝ وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا",
      en: "O you who believe, remember Allah with much remembrance, and glorify Him morning and evening.",
    },
    source: { ar: "القرآن الكريم ٣٣:٤١-٤٢", en: "Qur'an 33:41-42" },
    sourceUrl: QURAN_URL(33, "41-42"),
  },
  {
    id: "wird-quran-7-205",
    kind: "quran",
    title: { ar: "الأعراف ٢٠٥", en: "Qur'an 7:205" },
    text: {
      ar: "وَاذْكُر رَّبَّكَ فِي نَفْسِكَ تَضَرُّعًا وَخِيفَةً وَدُونَ الْجَهْرِ مِنَ الْقَوْلِ بِالْغُدُوِّ وَالْآصَالِ وَلَا تَكُن مِّنَ الْغَافِلِينَ",
      en: "And remember your Lord within yourself, humbly and in awe, without raising your voice, in the mornings and the evenings — and do not be among the heedless.",
    },
    source: { ar: "القرآن الكريم ٧:٢٠٥", en: "Qur'an 7:205" },
    sourceUrl: QURAN_URL(7, "205"),
  },
  {
    id: "wird-quran-20-130",
    kind: "quran",
    title: { ar: "طه ١٣٠", en: "Qur'an 20:130" },
    text: {
      ar: "وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا ۖ وَمِنْ آنَاءِ اللَّيْلِ فَسَبِّحْ وَأَطْرَافَ النَّهَارِ لَعَلَّكَ تَرْضَىٰ",
      en: "And glorify your Lord with praise before the rising of the sun and before its setting, and glorify Him during the hours of the night and at the ends of the day, that you may find contentment.",
    },
    source: { ar: "القرآن الكريم ٢٠:١٣٠", en: "Qur'an 20:130" },
    sourceUrl: QURAN_URL(20, "130"),
  },
  {
    id: "wird-quran-70-23",
    kind: "quran",
    title: { ar: "المعارج ٢٢-٢٣", en: "Qur'an 70:22-23" },
    text: {
      ar: "إِلَّا الْمُصَلِّينَ ۝ الَّذِينَ هُمْ عَلَىٰ صَلَاتِهِمْ دَائِمُونَ",
      en: "Except those who pray — those who are constant in their prayer.",
    },
    source: { ar: "القرآن الكريم ٧٠:٢٢-٢٣", en: "Qur'an 70:22-23" },
    sourceUrl: QURAN_URL(70, "22-23"),
  },
  {
    id: "wird-quran-24-37",
    kind: "quran",
    title: { ar: "النور ٣٧", en: "Qur'an 24:37" },
    text: {
      ar: "رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ",
      en: "Men whom neither trade nor sale distracts from the remembrance of Allah, from establishing prayer, and from giving zakah.",
    },
    source: { ar: "القرآن الكريم ٢٤:٣٧", en: "Qur'an 24:37" },
    sourceUrl: QURAN_URL(24, "37"),
  },
  {
    id: "wird-quran-57-16",
    kind: "quran",
    title: { ar: "الحديد ١٦", en: "Qur'an 57:16" },
    text: {
      ar: "أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن تَخْشَعَ قُلُوبُهُمْ لِذِكْرِ اللَّهِ وَمَا نَزَلَ مِنَ الْحَقِّ",
      en: "Has the time not come for those who believe that their hearts should become humbly submissive at the remembrance of Allah and what has come down of the truth?",
    },
    source: { ar: "القرآن الكريم ٥٧:١٦", en: "Qur'an 57:16" },
    sourceUrl: QURAN_URL(57, "16"),
  },
];

export const WIRD_HADITH_EVIDENCE: readonly WirdEvidence[] = [
  {
    id: "wird-hadith-travel-illness",
    kind: "hadith",
    title: { ar: "يجري أجره وأنت مريض أو مسافر", en: "The reward continues in illness and travel" },
    text: {
      ar: "إِذَا مَرِضَ الْعَبْدُ أَوْ سَافَرَ، كُتِبَ لَهُ مِثْلُ مَا كَانَ يَعْمَلُ مُقِيمًا صَحِيحًا",
      en: "When a servant falls ill or travels, there is written for him the like of what he used to do when resident and healthy.",
    },
    source: {
      ar: "رواه البخاري ٢٩٩٦ عن أبي موسى الأشعري رضي الله عنه",
      en: "Al-Bukhari 2996, from Abu Musa al-Ash'ari",
    },
    sourceUrl: SUNNAH_URL("bukhari:2996"),
  },
  {
    id: "wird-hadith-most-beloved",
    kind: "hadith",
    title: { ar: "أحب العمل أدومه", en: "The most beloved deed is the most constant" },
    text: {
      ar: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      en: "The deeds most beloved to Allah are the most constant, even if they are few.",
    },
    source: { ar: "رواه مسلم ٧٨٣ عن عائشة رضي الله عنها", en: "Muslim 783, from A'ishah" },
    sourceUrl: SUNNAH_URL("muslim:783"),
  },
  {
    id: "wird-hadith-missed-hizb",
    kind: "hadith",
    title: { ar: "إذا فاتك وردك", en: "When you sleep through your portion" },
    text: {
      ar: "مَنْ نَامَ عَنْ حِزْبِهِ أَوْ عَنْ شَيْءٍ مِنْهُ، فَقَرَأَهُ فِيمَا بَيْنَ صَلَاةِ الْفَجْرِ وَصَلَاةِ الظُّهْرِ، كُتِبَ لَهُ كَأَنَّمَا قَرَأَهُ مِنَ اللَّيْلِ",
      en: "Whoever sleeps through his portion, or part of it, and reads it between the Fajr prayer and the Dhuhr prayer, it is written for him as though he had read it in the night.",
    },
    source: { ar: "رواه مسلم ٧٤٧ عن عمر بن الخطاب رضي الله عنه", en: "Muslim 747, from 'Umar ibn al-Khattab" },
    sourceUrl: SUNNAH_URL("muslim:747"),
  },
  {
    id: "wird-hadith-deema",
    kind: "hadith",
    title: { ar: "كان عمله ديمة", en: "His deed was constant rain" },
    text: {
      ar: "سُئِلَتْ عَائِشَةُ رَضِيَ اللَّهُ عَنْهَا: هَلْ كَانَ النَّبِيُّ ﷺ يَخُصُّ مِنَ الْأَيَّامِ شَيْئًا؟ قَالَتْ: لَا، كَانَ عَمَلُهُ دِيمَةً",
      en: "A'ishah was asked whether the Prophet ﷺ singled out any days. She said: No — his deed was like steady rain.",
    },
    source: { ar: "رواه البخاري ١٩٨٧ ومسلم ٧٨٣", en: "Al-Bukhari 1987; Muslim 783" },
    sourceUrl: SUNNAH_URL("bukhari:1987"),
  },
  {
    id: "wird-hadith-do-not-abandon",
    kind: "hadith",
    title: { ar: "لا تترك ما اعتدت", en: "Do not abandon what you began" },
    text: {
      ar: "يَا عَبْدَ اللَّهِ، لَا تَكُنْ مِثْلَ فُلَانٍ، كَانَ يَقُومُ اللَّيْلَ فَتَرَكَ قِيَامَ اللَّيْلِ",
      en: "O 'Abdullah, do not be like so-and-so: he used to pray at night, then he abandoned the night prayer.",
    },
    source: {
      ar: "رواه البخاري ١١٥٢ عن عبد الله بن عمرو رضي الله عنهما",
      en: "Al-Bukhari 1152, from 'Abdullah ibn 'Amr",
    },
    sourceUrl: SUNNAH_URL("bukhari:1152"),
  },
  {
    id: "wird-hadith-take-what-you-can",
    kind: "hadith",
    title: { ar: "خذ ما تطيق", en: "Take on what you can sustain" },
    text: {
      ar: "خُذُوا مِنَ الْأَعْمَالِ مَا تُطِيقُونَ، فَإِنَّ اللَّهَ لَا يَمَلُّ حَتَّى تَمَلُّوا",
      en: "Take on only what you can sustain, for Allah does not tire until you tire.",
    },
    source: { ar: "رواه البخاري ١٩٧٠ ومسلم ٧٨٢", en: "Al-Bukhari 1970; Muslim 782" },
    sourceUrl: SUNNAH_URL("bukhari:1970"),
  },
  {
    id: "wird-hadith-mufarridoon",
    kind: "hadith",
    title: { ar: "سبق المفرِّدون", en: "The mufarridun have gone ahead" },
    text: {
      ar: "سَبَقَ الْمُفَرِّدُونَ. قَالُوا: وَمَا الْمُفَرِّدُونَ يَا رَسُولَ اللَّهِ؟ قَالَ: الذَّاكِرُونَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتُ",
      en: "The mufarridun have gone ahead. They asked: And who are the mufarridun, O Messenger of Allah? He said: Those men and women who remember Allah much.",
    },
    source: { ar: "رواه مسلم ٢٦٧٦ عن أبي هريرة رضي الله عنه", en: "Muslim 2676, from Abu Hurayrah" },
    sourceUrl: SUNNAH_URL("muslim:2676"),
  },
  {
    id: "wird-hadith-living-and-dead",
    kind: "hadith",
    title: { ar: "الحي والميت", en: "The living and the dead" },
    text: {
      ar: "مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لَا يَذْكُرُ رَبَّهُ، مَثَلُ الْحَيِّ وَالْمَيِّتِ",
      en: "The likeness of the one who remembers his Lord and the one who does not is the likeness of the living and the dead.",
    },
    source: { ar: "رواه البخاري ٦٤٠٧ عن أبي موسى رضي الله عنه", en: "Al-Bukhari 6407, from Abu Musa" },
    sourceUrl: SUNNAH_URL("bukhari:6407"),
  },
];

export const WIRD_SALAF_EVIDENCE: readonly WirdEvidence[] = [
  {
    id: "wird-salaf-umar-account",
    kind: "salaf",
    title: { ar: "حاسبوا أنفسكم", en: "Call yourselves to account" },
    attribution: { ar: "عمر بن الخطاب رضي الله عنه", en: "'Umar ibn al-Khattab" },
    text: {
      ar: "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوهَا قَبْلَ أَنْ تُوزَنُوا",
      en: "Call yourselves to account before you are called to account, and weigh your deeds before they are weighed for you.",
    },
    source: { ar: "أثر عن عمر بن الخطاب رضي الله عنه", en: "Reported from 'Umar ibn al-Khattab" },
    sourceUrl: DORAR_SEARCH("حاسبوا أنفسكم قبل أن تحاسبوا"),
  },
  {
    id: "wird-salaf-ibn-masud-day",
    kind: "salaf",
    title: { ar: "يوم نقص فيه الأجل", en: "A day that shortened my term" },
    attribution: { ar: "عبد الله بن مسعود رضي الله عنه", en: "'Abdullah ibn Mas'ud" },
    text: {
      ar: "مَا نَدِمْتُ عَلَى شَيْءٍ نَدَمِي عَلَى يَوْمٍ غَرَبَتْ شَمْسُهُ، نَقَصَ فِيهِ أَجَلِي، وَلَمْ يَزِدْ فِيهِ عَمَلِي",
      en: "I have regretted nothing as I regret a day whose sun has set, in which my term grew shorter and my deeds did not grow.",
    },
    source: { ar: "أثر عن ابن مسعود رضي الله عنه", en: "Reported from Ibn Mas'ud" },
    sourceUrl: DORAR_SEARCH("ما ندمت على شيء ندمي على يوم غربت شمسه"),
  },
  {
    id: "wird-salaf-hasan-days",
    kind: "salaf",
    title: { ar: "إنما أنت أيام", en: "You are only a number of days" },
    attribution: { ar: "الحسن البصري رحمه الله", en: "Al-Hasan al-Basri" },
    text: {
      ar: "ابْنَ آدَمَ، إِنَّمَا أَنْتَ أَيَّامٌ، كُلَّمَا ذَهَبَ يَوْمٌ ذَهَبَ بَعْضُكَ",
      en: "Son of Adam, you are only a number of days: whenever a day passes, part of you has passed with it.",
    },
    source: { ar: "أثر عن الحسن البصري رحمه الله", en: "Reported from al-Hasan al-Basri" },
    sourceUrl: DORAR_SEARCH("إنما أنت أيام كلما ذهب يوم ذهب بعضك"),
  },
  {
    id: "wird-salaf-ibn-taymiyyah-water",
    kind: "salaf",
    title: { ar: "الذكر للقلب كالماء للسمك", en: "Remembrance is to the heart what water is to the fish" },
    attribution: { ar: "شيخ الإسلام ابن تيمية رحمه الله", en: "Ibn Taymiyyah" },
    text: {
      ar: "الذِّكْرُ لِلْقَلْبِ مِثْلُ الْمَاءِ لِلسَّمَكِ، فَكَيْفَ يَكُونُ حَالُ السَّمَكِ إِذَا فَارَقَ الْمَاءَ؟",
      en: "Remembrance is to the heart what water is to the fish. What becomes of the fish once it leaves the water?",
    },
    source: { ar: "نقله ابن القيم في الوابل الصيب", en: "Quoted by Ibn al-Qayyim in al-Wabil al-Sayyib" },
    sourceUrl: DORAR_SEARCH("الذكر للقلب مثل الماء للسمك"),
  },
  {
    id: "wird-salaf-ibn-alqayyim-food",
    kind: "salaf",
    title: { ar: "الذكر قوت القلب", en: "Remembrance is the heart's sustenance" },
    attribution: { ar: "ابن القيم رحمه الله", en: "Ibn al-Qayyim" },
    text: {
      ar: "الذِّكْرُ قُوتُ الْقَلْبِ وَالرُّوحِ، فَإِذَا فَقَدَهُ الْعَبْدُ صَارَ بِمَنْزِلَةِ الْجِسْمِ إِذَا حِيلَ بَيْنَهُ وَبَيْنَ قُوتِهِ",
      en: "Remembrance is the sustenance of the heart and the soul; when a servant is deprived of it he becomes like a body kept from its food.",
    },
    source: { ar: "ابن القيم، الوابل الصيب", en: "Ibn al-Qayyim, al-Wabil al-Sayyib" },
    sourceUrl: DORAR_SEARCH("الذكر قوت القلب والروح"),
  },
];

export const WIRD_EVIDENCE_BY_SECTION: Readonly<Record<WirdBenefitSection, readonly WirdEvidence[]>> = {
  quran: WIRD_QURAN_EVIDENCE,
  hadith: WIRD_HADITH_EVIDENCE,
  salaf: WIRD_SALAF_EVIDENCE,
};

export const WIRD_SECTION_ORDER: readonly WirdBenefitSection[] = ["quran", "hadith", "salaf"];
