import type { CategoryId, RitualGroupId, RoutineCategoryId, RoutineMode, Zikr, ZikrDraft, ZikrGroupId } from "../types";
import type { PrayerName } from "./prayerTimes";
import { applyContentReview } from "./contentReview";
import { FASTING_RAMADAN_AZKAR } from "./fastingRamadan";
import { IN_PRAYER_AZKAR } from "./inPrayerSupplications";

const MORNING_AZKAR: ZikrDraft[] = [
  {
    id: "m-hm-75a",
    category: "morning",
    orderIndex: 0,
    arabicText:
      "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f\u060c \u0648\u064e\u0627\u0644\u0635\u0651\u064e\u0644\u0627\u064e\u0629\u064f \u0648\u064e\u0627\u0644\u0633\u0651\u064e\u0644\u0627\u064e\u0645\u064f \u0639\u064e\u0644\u064e\u0649 \u0645\u064e\u0646\u0652 \u0644\u0627\u064e \u0646\u064e\u0628\u0650\u064a\u0651\u064e \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f",
    transliteration:
      "Al\u1e25amdulill\u0101hi wa\u1e25dah, wa\u1e63-\u1e63al\u0101tu was-sal\u0101mu \u02bfal\u0101 man l\u0101 nabiyya ba\u02bfdah.",
    translation:
      "All praise is due to Allah alone, and prayers and peace be upon the one after whom there is no Prophet.",
    benefit: "The merit of sitting in remembrance from Fajr until sunrise, and from 'Asr until sunset.",
    benefitArabic: "فضل مجالسة الذاكرين من صلاة الفجر حتى تطلع الشمس، ومن العصر حتى تغرب.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud no. 3667; Hisn al-Muslim 75a.",
    preferredTiming:
      "Morning: after Fajr until sunrise. Evening: after \u2018Asr until sunset as a strong recommended dhikr sitting.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0644\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u0639\u064f\u062f\u064e \u0645\u064e\u0639\u064e \u0642\u064e\u0648\u0652\u0645\u064d \u064a\u064e\u0630\u0652\u0643\u064f\u0631\u064f\u0648\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0645\u0650\u0646\u0652 \u0635\u064e\u0644\u0627\u064e\u0629\u0650 \u0627\u0644\u0652\u063a\u064e\u062f\u064e\u0627\u0629\u0650 \u062d\u064e\u062a\u0651\u064e\u0649 \u062a\u064e\u0637\u0652\u0644\u064f\u0639\u064e \u0627\u0644\u0634\u0651\u064e\u0645\u0652\u0633\u064f \u0623\u064e\u062d\u064e\u0628\u0651\u064f \u0625\u0650\u0644\u064e\u064a\u0651\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0646\u0652 \u0623\u064f\u0639\u0652\u062a\u0650\u0642\u064e \u0623\u064e\u0631\u0652\u0628\u064e\u0639\u064e\u0629\u064b \u0645\u0650\u0646\u0652 \u0648\u064e\u0644\u064e\u062f\u0650 \u0625\u0650\u0633\u0652\u0645\u064e\u0627\u0639\u0650\u064a\u0644\u064e، وَلِأَنْ أَقْعُدَ مَعَ قَوْمٍ يَذْكُرُونَ اللَّهَ \u0648\u0645\u0646 \u0635\u0644\u0627\u0629 \u0627\u0644\u0639\u0635\u0631 \u0625\u0644\u0649 \u0623\u0646 \u062a\u063a\u0631\u0628 \u0627\u0644\u0634\u0645\u0633\u00bb \u0628\u0645\u0639\u0646\u0627\u0647.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “That I should sit with a people remembering Allah from the dawn prayer until the sun rises is dearer to me than freeing four of the descendants of Isma‘il; and that I should sit with a people remembering Allah from the afternoon prayer until the sun sets…” — reported to this effect.",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Included as the opening item of the morning/evening chapter.",
    sourceUrl: "https://sunnah.com/hisn%3A75a",
  },
  {
    id: "m-hm-75",
    category: "morning",
    orderIndex: 4,
    hasSeekRefuge: true,
    surahNameArabic: "البَقَرَة (آيَةُ الكُرْسِيِّ)",
    surahNameEnglish: "Al-Baqarah (Ayah Al-Kursi)",
    arabicText:
      "\ufd3f\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e \u0627\u0644\u0652\u062d\u064e\u064a\u0651\u064f \u0627\u0644\u0652\u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f \u0644\u0627\u064e \u062a\u064e\u0623\u0652\u062e\u064f\u0630\u064f\u0647\u064f \u0633\u0650\u0646\u064e\u0629\u064c \u0648\u064e\u0644\u0627\u064e \u0646\u064e\u0648\u0652\u0645\u064c \u0644\u0651\u064e\u0647\u064f \u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0645\u064e\u0646 \u0630\u064e\u0627 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064e\u0634\u0652\u0641\u064e\u0639\u064f \u0639\u0650\u0646\u0652\u062f\u064e\u0647\u064f \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0625\u0650\u0630\u0652\u0646\u0650\u0647\u0650 \u064a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0645\u064e\u0627 \u0628\u064e\u064a\u0652\u0646\u064e \u0623\u064e\u064a\u0652\u062f\u0650\u064a\u0647\u0650\u0645\u0652 \u0648\u064e\u0645\u064e\u0627 \u062e\u064e\u0644\u0652\u0641\u064e\u0647\u064f\u0645\u0652 \u0648\u064e\u0644\u0627\u064e \u064a\u064f\u062d\u0650\u064a\u0637\u064f\u0648\u0646\u064e \u0628\u0650\u0634\u064e\u064a\u0652\u0621\u064d \u0645\u0651\u0650\u0646\u0652 \u0639\u0650\u0644\u0652\u0645\u0650\u0647\u0650 \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0645\u064e\u0627 \u0634\u064e\u0627\u0621 \u0648\u064e\u0633\u0650\u0639\u064e \u0643\u064f\u0631\u0652\u0633\u0650\u064a\u0651\u064f\u0647\u064f \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u064e \u0648\u064e\u0644\u0627\u064e \u064a\u064e\u0624\u064f\u0648\u062f\u064f\u0647\u064f \u062d\u0650\u0641\u0652\u0638\u064f\u0647\u064f\u0645\u064e\u0627 \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u064f\ufd3e",
    transliteration:
      "All\u0101hu l\u0101 il\u0101ha ill\u0101 huwa \u2019l-\u1e24ayyul-Qayy\u016bm, l\u0101 ta\u2019khudhuhu sinatun wa l\u0101 nawm, lahu m\u0101 fis-sam\u0101w\u0101ti wa m\u0101 fil-ar\u1e0d, man dhal-ladh\u012b yashfa\u02bfu \u02bfindahu ill\u0101 bi\u2019idhnih, ya\u02bflamu m\u0101 bayna ayd\u012bhim wa m\u0101 khalfahum, wa l\u0101 yu\u1e25\u012b\u1e6d\u016bna bi shay\u2019in min \u02bfilmihi ill\u0101 bim\u0101 sh\u0101\u2019, wasi\u02bfa kursiyyuhus-sam\u0101w\u0101ti wal-ar\u1e0d, wa l\u0101 ya\u2019\u016bduhu \u1e25if\u1e93uhum\u0101, wa huwal-\u02bfAliyyul-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah\u2014there is none worthy of worship except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and earth. None can intercede except by His permission. He knows what is before and behind them; they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and earth, and preserving them does not tire Him. He is the Most High, the Magnificent.",
    benefit: "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Qur\u2019an 2:255; Al-Hakim 1/562; Hisn al-Muslim 75.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0623\u064f\u062c\u064a\u0631 \u0645\u0646 \u0627\u0644\u062c\u0646 \u062d\u062a\u0649 \u064a\u0645\u0633\u064a\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0623\u064f\u062c\u064a\u0631 \u0645\u0646\u0647\u0645 \u062d\u062a\u0649 \u064a\u0635\u0628\u062d.",
    hadithTextEnglish:
      "It is reported that whoever says it in the morning is protected from the jinn until the evening, and whoever says it in the evening is protected from them until the morning.",
    authenticityNote:
      "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A75",
  },
  {
    id: "m-hm-76a",
    category: "morning",
    isSurah: true,
    surahNameArabic: "الإِخْلَاص",
    surahNameEnglish: "Al-Ikhlas",
    surahType: "مكية",
    verseCount: 4,
    hasBasmalah: true,
    orderIndex: 5,
    arabicText:
      "\ufd3f\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c \u06dd \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0627\u0644\u0635\u0651\u064e\u0645\u064e\u062f\u064f \u06dd \u0644\u064e\u0645\u0652 \u064a\u064e\u0644\u0650\u062f\u0652 \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064f\u0648\u0644\u064e\u062f\u0652 \u06dd \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064e\u0643\u064f\u0646 \u0644\u0651\u064e\u0647\u064f \u0643\u064f\u0641\u064f\u0648\u0627\u064b \u0623\u064e\u062d\u064e\u062f\u064c\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul huwall\u0101hu a\u1e25ad. All\u0101hu\u1e63-\u1e63amad. Lam yalid wa lam y\u016blad. Wa lam yakun lahu kufuwan a\u1e25ad.",
    translation:
      "Say: He is Allah, One. Allah, the Self-Sufficient. He neither begets nor is begotten, and none is comparable to Him.",
    benefit: "With the two refuge surahs, three times morning and evening: they suffice you against everything.",
    benefitArabic: "مع المعوذتين ثلاثًا صباحًا ومساءً؛ تكفيك من كل شيء.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0645\u0646 \u0633\u0623\u0644\u0647 \u0645\u0627 \u064a\u0642\u0648\u0644 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d \u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u0649: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said to the one who asked him what to say morning and evening: “Say: ‘Say: He is Allah, One’ and the two suras of refuge, evening and morning, three times; they will suffice you against everything.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Falaq and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "m-hm-76b",
    category: "morning",
    isSurah: true,
    surahNameArabic: "الفَلَق",
    surahNameEnglish: "Al-Falaq",
    surahType: "مكية",
    verseCount: 5,
    hasBasmalah: true,
    orderIndex: 6,
    arabicText:
      "\ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0641\u064e\u0644\u064e\u0642\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u062e\u064e\u0644\u064e\u0642\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u063a\u064e\u0627\u0633\u0650\u0642\u064d \u0625\u0650\u0630\u064e\u0627 \u0648\u064e\u0642\u064e\u0628\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0641\u0651\u064e\u0627\u062b\u064e\u0627\u062a\u0650 \u0641\u0650\u064a \u0627\u0644\u0652\u0639\u064f\u0642\u064e\u062f\u0650 \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u062d\u064e\u0627\u0633\u0650\u062f\u064d \u0625\u0650\u0630\u064e\u0627 \u062d\u064e\u0633\u064e\u062f\u064e\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbil-falaq. Min sharri m\u0101 khalaq. Wa min sharri gh\u0101siqin idh\u0101 waqab. Wa min sharrin-naff\u0101th\u0101ti fil-\u02bfuqad. Wa min sharri \u1e25\u0101sidin idh\u0101 \u1e25asad.",
    translation:
      "Say: I seek refuge in the Lord of daybreak, from the evil of what He created, from the evil of darkness when it settles, from the evil of those who blow on knots, and from the evil of the envier when he envies.",
    benefit: "With al-Ikhlas and an-Nas, three times morning and evening: they suffice you against everything.",
    benefitArabic: "مع الإخلاص والناس ثلاثًا صباحًا ومساءً؛ تكفيك من كل شيء.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “Say: ‘Say: He is Allah, One’ and the two suras of refuge, evening and morning, three times; they will suffice you against everything.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "m-hm-76c",
    category: "morning",
    isSurah: true,
    surahNameArabic: "النَّاس",
    surahNameEnglish: "An-Nas",
    surahType: "مكية",
    verseCount: 6,
    hasBasmalah: true,
    orderIndex: 7,
    arabicText:
      "\ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u064e\u0644\u0650\u0643\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0625\u0650\u0644\u064e\u0647\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0652\u0648\u064e\u0633\u0652\u0648\u064e\u0627\u0633\u0650 \u0627\u0644\u0652\u062e\u064e\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064f\u0648\u064e\u0633\u0652\u0648\u0650\u0633\u064f \u0641\u0650\u064a \u0635\u064f\u062f\u064f\u0648\u0631\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u062c\u0650\u0646\u0651\u064e\u0629\u0650 \u0648\u064e\u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbin-n\u0101s. Malikin-n\u0101s. Il\u0101hin-n\u0101s. Min sharril-wasw\u0101sil-khann\u0101s. Alladh\u012b yuwaswisu f\u012b \u1e63ud\u016brin-n\u0101s. Minal-jinnati wan-n\u0101s.",
    translation:
      "Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the retreating whisperer who whispers in people\u2019s hearts, from jinn and mankind.",
    benefit: "With al-Ikhlas and al-Falaq, three times morning and evening: they suffice you against everything.",
    benefitArabic: "مع الإخلاص والفلق ثلاثًا صباحًا ومساءً؛ تكفيك من كل شيء.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “Say: ‘Say: He is Allah, One’ and the two suras of refuge, evening and morning, three times; they will suffice you against everything.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and al-Falaq three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "m-hm-77m",
    category: "morning",
    orderIndex: 1,
    arabicText:
      "\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u064e \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u0650 \u0648\u064e\u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u0650 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064e\u0633\u064e\u0644\u0650 \u0648\u064e\u0633\u064f\u0648\u0621\u0650 \u0627\u0644\u0652\u0643\u0650\u0628\u064e\u0631\u0650. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0646\u0651\u064e\u0627\u0631\u0650 \u0648\u064e\u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650.",
    transliteration:
      "A\u1e63ba\u1e25n\u0101 wa a\u1e63ba\u1e25al-mulku lill\u0101h, wal\u1e25amdu lill\u0101h, l\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br. Rabbi as\u2019aluka khayra m\u0101 f\u012b h\u0101dh\u0101 \u2019l-yawmi wa khayra m\u0101 ba\u02bfdah, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012b h\u0101dh\u0101 \u2019l-yawmi wa sharri m\u0101 ba\u02bfdah. Rabbi a\u02bf\u016bdhu bika minal-kasali wa s\u016b\u2019il-kibar. Rabbi a\u02bf\u016bdhu bika min \u02bfadh\u0101bin fin-n\u0101ri wa \u02bfadh\u0101bin fil-qabr.",
    translation:
      "We have entered the morning and dominion belongs to Allah. Praise is for Allah. None is worthy of worship but Allah alone, without partner; His is the dominion and praise, and He is able to do all things. My Lord, I ask You for the good of this day and what follows it, and I seek refuge in You from the evil of this day and what follows it. My Lord, I seek refuge in You from laziness and the hardships of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.",
    benefit:
      "The Prophet's ﷺ own morning and evening remembrance: affirming Allah's dominion and asking for the good of the day.",
    benefitArabic: "من هدي النبي ﷺ في صباحه ومسائه: إقرار بأن المُلك لله وسؤال خير هذا اليوم.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 4/2088; Hisn al-Muslim 77.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0625\u0630\u0627 \u0623\u0635\u0628\u062d \u0642\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0630\u0643\u0631\u060c \u0648\u0641\u064a \u0631\u0648\u0627\u064a\u0629 \u0645\u0633\u0644\u0645: \u00ab\u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u0649 \u0642\u0627\u0644: \u0623\u0645\u0633\u064a\u0646\u0627 \u0648\u0623\u0645\u0633\u0649 \u0627\u0644\u0645\u0644\u0643 \u0644\u0644\u0647، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ، وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ، وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ، وَعَذَابٍ فِي الْقَبْرِ\u00bb \u0645\u0639 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u064a\u0648\u0645 \u0625\u0644\u0649 \u0627\u0644\u0644\u064a\u0644\u0629.",
    hadithTextEnglish:
      "The Prophet ﷺ said this remembrance when he rose in the morning. In Muslim's narration: “and when evening came he said: We have reached the evening, and the dominion has reached the evening belonging to Allah. Praise be to Allah. There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things. My Lord, I ask You for the good of this night and the good that follows it, and I seek refuge in You from the evil of this night and the evil that follows it. My Lord, I seek refuge in You from idleness and the misery of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave” — with the day changed to the night.",
    authenticityNote: "Sahih Muslim.",
    notes: "Use the evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A77",
  },
  {
    id: "m-hm-78m",
    category: "morning",
    orderIndex: 2,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0628\u0650\u0643\u064e \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u062d\u0652\u064a\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u0645\u064f\u0648\u062a\u064f\u060c \u0648\u064e\u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e \u0627\u0644\u0646\u0651\u064f\u0634\u064f\u0648\u0631\u064f.",
    transliteration:
      "All\u0101humma bika a\u1e63ba\u1e25n\u0101, wa bika amsayn\u0101, wa bika na\u1e25y\u0101, wa bika nam\u016bt, wa ilaykan-nush\u016br.",
    translation:
      "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
    benefit: "Taught by the Prophet ﷺ to his companions: that living, dying and the resurrection are by Allah alone.",
    benefitArabic: "مما علّمه النبي ﷺ أصحابه: أن الحياة والموت والنشور بالله وحده.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi 5/466; Abu Dawud 4/317; Ibn Majah; Hisn al-Muslim 78.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: كَانَ النَّبِيُّ ﷺ يُعَلِّمُ أَصْحَابَهُ يَقُولُ: إِذَا أَصْبَحَ أَحَدُكُمْ فَلْيَقُلْ: «اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) said: The Prophet ﷺ used to teach his companions, saying: When one of you rises in the morning, let him say: “O Allah, by You we have reached the morning and by You we have reached the evening; by You we live and by You we die, and to You is the resurrection.”",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "Use the evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A78",
  },
  {
    id: "m-hm-79",
    category: "morning",
    orderIndex: 13,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0631\u064e\u0628\u0651\u0650\u064a \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u062e\u064e\u0644\u064e\u0642\u0652\u062a\u064e\u0646\u0650\u064a \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0639\u064e\u0647\u0652\u062f\u0650\u0643\u064e \u0648\u064e\u0648\u064e\u0639\u0652\u062f\u0650\u0643\u064e \u0645\u064e\u0627 \u0627\u0633\u0652\u062a\u064e\u0637\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0635\u064e\u0646\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0644\u064e\u0643\u064e \u0628\u0650\u0646\u0650\u0639\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0639\u064e\u0644\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0628\u0650\u0630\u064e\u0646\u0652\u0628\u0650\u064a\u060c \u0641\u064e\u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a\u060c \u0641\u064e\u0625\u0650\u0646\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u064a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0630\u0651\u064f\u0646\u064f\u0648\u0628\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma anta Rabb\u012b l\u0101 il\u0101ha ill\u0101 ant, khalaqtan\u012b wa ana \u02bfabduk, wa ana \u02bfal\u0101 \u02bfahdika wa wa\u02bfdika m\u0101 ista\u1e6da\u02bft, a\u02bf\u016bdhu bika min sharri m\u0101 \u1e63ana\u02bft, ab\u016b\u2019u laka bini\u02bfmatika \u02bfalayy, wa ab\u016b\u2019u bidhanb\u012b, faghfir l\u012b, fa innahu l\u0101 yaghfirudh-dhun\u016bba ill\u0101 ant.",
    translation:
      "O Allah, You are my Lord; none is worthy of worship but You. You created me and I am Your servant. I keep Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 7/150; Hisn al-Muslim 79.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0633\u064e\u064a\u0651\u0650\u062f\u064f \u0627\u0644\u0650\u0627\u0633\u0652\u062a\u0650\u063a\u0652\u0641\u064e\u0627\u0631\u0650 أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ\u00bb \u062b\u0645 \u0630\u0643\u0631\u0647\u060c \u0648\u0642\u0627\u0644: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u0651\u064e\u0647\u064e\u0627\u0631\u0650 \u0645\u064f\u0648\u0642\u0650\u0646\u064b\u0627 \u0628\u0650\u0647\u064e\u0627 \u0641\u064e\u0645\u064e\u0627\u062a\u064e \u0645\u0650\u0646\u0652 \u064a\u064e\u0648\u0652\u0645\u0650\u0647\u0650 قَبْلَ أَنْ يُمْسِيَ، \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u060c \u0648\u064e\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u0650 وَهُوَ مُوقِنٌ بِهَا، فَمَاتَ قَبْلَ أَنْ يُصْبِحَ، \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “The best manner of seeking forgiveness is to say: O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I hold to Your covenant and Your promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You.” Then he said: “Whoever says it during the day with certainty in it and dies that day before evening is among the people of Paradise; and whoever says it at night with certainty in it and dies before morning is among the people of Paradise.”",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A79",
  },
  {
    id: "m-hm-80m",
    category: "morning",
    orderIndex: 16,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u062a\u064f \u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f \u062d\u064e\u0645\u064e\u0644\u064e\u0629\u064e \u0639\u064e\u0631\u0652\u0634\u0650\u0643\u064e\u060c \u0648\u064e\u0645\u064e\u0644\u0627\u064e\u0626\u0650\u0643\u064e\u062a\u064e\u0643\u064e\u060c \u0648\u064e\u062c\u064e\u0645\u0650\u064a\u0639\u064e \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0623\u064e\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u0651\u064e \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064b\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e \u0648\u064e\u0631\u064e\u0633\u064f\u0648\u0644\u064f\u0643\u064e.",
    transliteration:
      "All\u0101humma inn\u012b a\u1e63ba\u1e25tu ush-hiduka, wa ush-hidu \u1e25amalata \u02bfarshik, wa mal\u0101\u2019ikataka, wa jam\u012b\u02bfa khalqik, annaka antall\u0101hu l\u0101 il\u0101ha ill\u0101 ant, wa\u1e25daka l\u0101 shar\u012bka lak, wa anna Mu\u1e25ammadan \u02bfabduka wa ras\u016bluk.",
    translation:
      "O Allah, this morning I call You, the bearers of Your Throne, Your angels, and all Your creation to witness that You are Allah; none is worthy of worship but You alone, without partner, and that Muhammad is Your servant and Messenger.",
    benefit: "Said four times morning or evening, Allah frees the one who says it from the Fire.",
    benefitArabic: "من قالها أربعًا حين يصبح أو يمسي أعتقه الله من النار.",
    repetitionCount: 4,
    countLabel: "4",
    sourceReference:
      "Abu Dawud 4/317; Al-Bukhari in Al-Adab al-Mufrad; An-Nasa\u2019i; Ibn as-Sunni; Hisn al-Muslim 80.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0623\u0648 \u064a\u0645\u0633\u064a \u0645\u0631\u0629 \u0623\u0639\u062a\u0642 \u0627\u0644\u0644\u0647 \u0631\u0628\u0639\u064e\u0647 \u0645\u0646 \u0627\u0644\u0646\u0627\u0631\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0645\u0631\u062a\u064a\u0646 \u0623\u0639\u062a\u0642 \u0646\u0635\u0641\u0647\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0623\u0639\u062a\u0642 \u062b\u0644\u0627\u062b\u0629 \u0623\u0631\u0628\u0627\u0639\u0647\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0623\u0631\u0628\u0639\u064b\u0627 \u0623\u0639\u062a\u0642\u0647 \u0627\u0644\u0644\u0647 \u0645\u0646 \u0627\u0644\u0646\u0627\u0631.",
    hadithTextEnglish:
      "It is reported that whoever says it once in the morning or the evening, Allah frees a quarter of him from the Fire; whoever says it twice, a half; whoever says it three times, three quarters; and whoever says it four times, Allah frees him from the Fire.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A80",
  },
  {
    id: "m-hm-81m",
    category: "morning",
    orderIndex: 17,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0645\u064e\u0627 \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u064e \u0628\u0650\u064a \u0645\u0650\u0646\u0652 \u0646\u0650\u0639\u0652\u0645\u064e\u0629\u064d\u060c \u0623\u064e\u0648\u0652 \u0628\u0650\u0623\u064e\u062d\u064e\u062f\u064d \u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0641\u064e\u0645\u0650\u0646\u0652\u0643\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0641\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0634\u0651\u064f\u0643\u0652\u0631\u064f.",
    transliteration:
      "All\u0101humma m\u0101 a\u1e63ba\u1e25a b\u012b min ni\u02bfmatin, aw bi-a\u1e25adin min khalqik, fa minka wa\u1e25daka l\u0101 shar\u012bka lak, falakal-\u1e25amdu wa lakash-shukr.",
    translation:
      "O Allah, whatever blessing has reached me or any of Your creation this morning is from You alone, without partner; all praise and thanks belong to You.",
    benefit: "Saying it in the morning fulfils the gratitude owed for that day, and in the evening for that night.",
    benefitArabic: "من قالها حين يصبح فقد أدّى شكر يومه، ومن قالها حين يمسي فقد أدّى شكر ليلته.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Abu Dawud 4/318; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 7; Ibn as-Sunni no. 41; Ibn Hibban no. 2361; Hisn al-Muslim 81.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0641\u0642\u062f \u0623\u062f\u0651\u0649 \u0634\u0643\u0631 \u064a\u0648\u0645\u0647\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0641\u0642\u062f \u0623\u062f\u0651\u0649 \u0634\u0643\u0631 \u0644\u064a\u0644\u062a\u0647.",
    hadithTextEnglish:
      "It is reported that whoever says it in the morning has fulfilled the thanks owed for his day, and whoever says it in the evening has fulfilled the thanks owed for his night.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A81",
  },
  {
    id: "m-hm-82",
    category: "morning",
    orderIndex: 10,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u062f\u064e\u0646\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0633\u064e\u0645\u0652\u0639\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u0635\u064e\u0631\u0650\u064a\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064f\u0641\u0652\u0631\u0650 \u0648\u064e\u0627\u0644\u0652\u0641\u064e\u0642\u0652\u0631\u0650\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u0650 \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma \u02bf\u0101fin\u012b f\u012b badan\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b sam\u02bf\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b ba\u1e63ar\u012b, l\u0101 il\u0101ha ill\u0101 ant. All\u0101humma inn\u012b a\u02bf\u016bdhu bika mina \u2019l-kufri wal-faqr, wa a\u02bf\u016bdhu bika min \u02bfadh\u0101bil-qabr, l\u0101 il\u0101ha ill\u0101 ant.",
    translation:
      "O Allah, grant me wellbeing in my body. O Allah, preserve my hearing. O Allah, preserve my sight. None is worthy of worship but You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None is worthy of worship but You.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/324; Ahmad 5/42; An-Nasa\u2019i; Ibn as-Sunni; Al-Adab al-Mufrad; Hisn al-Muslim 82.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0639\u0644\u0651\u0645 \u0623\u0646 \u064a\u0642\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u062f\u0639\u0627\u0621 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062d\u064a\u0646 \u064a\u0645\u0633\u064a.",
    hadithTextEnglish:
      "The Prophet ﷺ taught that this supplication be said three times in the morning and three times in the evening.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A82",
  },
  {
    id: "m-hm-83",
    category: "morning",
    orderIndex: 12,
    arabicText:
      "\u062d\u064e\u0633\u0652\u0628\u0650\u064a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e\u060c \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650 \u062a\u064e\u0648\u064e\u0643\u0651\u064e\u0644\u0652\u062a\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0631\u064e\u0628\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0631\u0652\u0634\u0650 \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650.",
    transliteration:
      "\u1e24asbiyall\u0101hu l\u0101 il\u0101ha ill\u0101 huwa, \u02bfalayhi tawakkalt, wa huwa Rabbul-\u02bfArshil-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah is sufficient for me. None is worthy of worship but Him. Upon Him I rely, and He is the Lord of the Mighty Throne.",
    benefit: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Ibn as-Sunni no. 71; Abu Dawud 4/321; Hisn al-Muslim 83.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "عَنْ أَبِي الدَّرْدَاءِ رضي الله عنه قَالَ: مَنْ قَالَ إِذَا أَصْبَحَ وَإِذَا أَمْسَى: «حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ» سَبْعَ مَرَّاتٍ كَفَاهُ اللَّهُ مَا أَهَمَّهُ.",
    hadithTextEnglish:
      "Abu al-Darda’ (may Allah be pleased with him) said: Whoever says in the morning and in the evening: “Allah is sufficient for me; there is no god but He. On Him I rely, and He is the Lord of the Mighty Throne” seven times, Allah will suffice him in whatever troubles him.",
    authenticityNote: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A83",
  },
  {
    id: "m-hm-84",
    category: "morning",
    orderIndex: 9,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u0627\u0644\u062f\u0651\u064f\u0646\u0652\u064a\u064e\u0627 \u0648\u064e\u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u062f\u0650\u064a\u0646\u0650\u064a \u0648\u064e\u062f\u064f\u0646\u0652\u064a\u064e\u0627\u064a\u064e \u0648\u064e\u0623\u064e\u0647\u0652\u0644\u0650\u064a \u0648\u064e\u0645\u064e\u0627\u0644\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u0633\u0652\u062a\u064f\u0631\u0652 \u0639\u064e\u0648\u0652\u0631\u064e\u0627\u062a\u0650\u064a\u060c \u0648\u064e\u0622\u0645\u0650\u0646\u0652 \u0631\u064e\u0648\u0652\u0639\u064e\u0627\u062a\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0646\u0650\u064a \u0645\u0650\u0646\u0652 \u0628\u064e\u064a\u0652\u0646\u0650 \u064a\u064e\u062f\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0641\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u064a\u064e\u0645\u0650\u064a\u0646\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u0634\u0650\u0645\u064e\u0627\u0644\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0641\u064e\u0648\u0652\u0642\u0650\u064a\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0639\u064e\u0638\u064e\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0646\u0652 \u0623\u064f\u063a\u0652\u062a\u064e\u0627\u0644\u064e \u0645\u0650\u0646\u0652 \u062a\u064e\u062d\u0652\u062a\u0650\u064a.",
    transliteration:
      "All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata fid-duny\u0101 wal-\u0101khirah. All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata f\u012b d\u012bn\u012b wa duny\u0101ya wa ahl\u012b wa m\u0101l\u012b. All\u0101hummastur \u02bfawr\u0101t\u012b, wa \u0101min raw\u02bf\u0101t\u012b. All\u0101humma\u1e25fa\u1e93n\u012b min bayni yadayya, wa min khalf\u012b, wa \u02bfan yam\u012bn\u012b, wa \u02bfan shim\u0101l\u012b, wa min fawq\u012b, wa a\u02bf\u016bdhu bi\u02bfa\u1e93amatika an ught\u0101la min ta\u1e25t\u012b.",
    translation:
      "O Allah, I ask You for pardon and wellbeing in this world and the Hereafter. O Allah, I ask You for pardon and wellbeing in my religion, worldly life, family, and wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from in front, behind, my right, my left, and above; and I seek refuge in Your greatness from being taken from beneath me.",
    benefit: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud; Ibn Majah; Ahmad; An-Nasa\u2019i; Hisn al-Muslim 84.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رضي الله عنهما قَالَ: لَمْ يَكُنْ رَسُولُ اللَّهِ ﷺ يَدَعُ هَؤُلاَءِ الدَّعَوَاتِ حِينَ يُمْسِي وَحِينَ يُصْبِحُ: «اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي».",
    hadithTextEnglish:
      "‘Abdullah ibn ‘Umar (may Allah be pleased with them both) said: The Messenger of Allah ﷺ never left these supplications, evening and morning: “O Allah, I ask You for wellbeing in this world and the next. O Allah, I ask You for pardon and wellbeing in my religion, my worldly life, my family and my property. O Allah, conceal my faults and calm my fears. O Allah, guard me from before me and behind me, from my right and my left and from above me, and I seek refuge in Your greatness from being taken unawares from beneath me.”",
    authenticityNote: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A84",
  },
  {
    id: "m-hm-85",
    category: "morning",
    orderIndex: 11,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0644\u0650\u0645\u064e \u0627\u0644\u0652\u063a\u064e\u064a\u0652\u0628\u0650 \u0648\u064e\u0627\u0644\u0634\u0651\u064e\u0647\u064e\u0627\u062f\u064e\u0629\u0650\u060c \u0641\u064e\u0627\u0637\u0650\u0631\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650\u060c \u0631\u064e\u0628\u0651\u064e \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0648\u064e\u0645\u064e\u0644\u0650\u064a\u0643\u064e\u0647\u064f\u060c \u0623\u064e\u0634\u0652\u0647\u064e\u062f\u064f \u0623\u064e\u0646\u0652 \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0646\u064e\u0641\u0652\u0633\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u0634\u0650\u0631\u0652\u0643\u0650\u0647\u0650\u060c \u0648\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u062a\u064e\u0631\u0650\u0641\u064e \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0633\u064f\u0648\u0621\u064b\u0627\u060c \u0623\u064e\u0648\u0652 \u0623\u064e\u062c\u064f\u0631\u0651\u064e\u0647\u064f \u0625\u0650\u0644\u064e\u0649 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064d.",
    transliteration:
      "All\u0101humma \u02bf\u0101limal-ghaybi wash-shah\u0101dah, f\u0101\u1e6diras-sam\u0101w\u0101ti wal-ar\u1e0d, Rabba kulli shay\u2019in wa mal\u012bkah, ash-hadu an l\u0101 il\u0101ha ill\u0101 ant, a\u02bf\u016bdhu bika min sharri nafs\u012b, wa min sharrish-shay\u1e6d\u0101ni wa shirkih, wa an aqtarifa \u02bfal\u0101 nafs\u012b s\u016b\u2019an, aw ajurrahu il\u0101 Muslim.",
    translation:
      "O Allah, Knower of the unseen and the witnessed, Creator of the heavens and the earth, Lord and Sovereign of everything. I bear witness that none is worthy of worship but You. I seek refuge in You from the evil of myself, from the evil of Satan and his shirk, and from committing evil against myself or bringing it upon a Muslim.",
    benefit: "The Prophet ﷺ instructed Abu Bakr to say it morning, evening, and on going to bed.",
    benefitArabic: "أمر النبي ﷺ أبا بكر أن يقولها إذا أصبح وإذا أمسى وإذا أخذ مضجعه.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi; Abu Dawud 4/317; Hisn al-Muslim 85/109.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0623\u0628\u064a \u0628\u0643\u0631 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647: \u00ab\u0642\u064f\u0644\u0652\u0647\u064f \u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u062e\u064e\u0630\u0652\u062a\u064e \u0645\u064e\u0636\u0652\u062c\u064e\u0639\u064e\u0643\u064e\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said to Abu Bakr (may Allah be pleased with him): “Say it when you rise in the morning, when you reach the evening, and when you take to your bed.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Also appears in before-sleep adhkar.",
    sourceUrl: "https://sunnah.com/hisn%3A85",
  },
  {
    id: "m-hm-86",
    category: "morning",
    orderIndex: 8,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0644\u0627\u064e \u064a\u064e\u0636\u064f\u0631\u0651\u064f \u0645\u064e\u0639\u064e \u0627\u0633\u0652\u0645\u0650\u0647\u0650 \u0634\u064e\u064a\u0652\u0621\u064c \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0648\u064e\u0644\u0627\u064e \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0621\u0650\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f.",
    transliteration:
      "Bismill\u0101hilladh\u012b l\u0101 ya\u1e0durru ma\u02bfa ismihi shay\u2019un fil-ar\u1e0di wa l\u0101 fis-sam\u0101\u2019, wa huwas-Sam\u012b\u02bful-\u02bfAl\u012bm.",
    translation:
      "In the Name of Allah, with whose Name nothing in the earth or the heaven can harm, and He is the All-Hearing, All-Knowing.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/323; At-Tirmidhi 5/465; Ibn Majah; Ahmad; Hisn al-Muslim 86.",
    preferredTiming: "Morning after Fajr; evening after ‘Asr/sunset window.",
    hadithText:
      "عَنْ عُثْمَانَ بْنِ عَفَّانَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَا مِنْ عَبْدٍ يَقُولُ فِي صَبَاحِ كُلِّ يَوْمٍ وَمَسَاءِ كُلِّ لَيْلَةٍ: بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ، ثَلَاثَ مَرَّاتٍ، فَيَضُرَّهُ شَيْءٌ».",
    hadithTextEnglish:
      "‘Uthman ibn ‘Affan (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “No servant says, on the morning of every day and the evening of every night: In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing — three times — and anything then harms him.”",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A86",
  },
  {
    id: "m-hm-87",
    category: "morning",
    orderIndex: 14,
    arabicText:
      "\u0631\u064e\u0636\u0650\u064a\u062a\u064f \u0628\u0650\u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650 \u062f\u0650\u064a\u0646\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa \u0646\u064e\u0628\u0650\u064a\u0651\u064b\u0627.",
    transliteration:
      "Ra\u1e0d\u012btu bill\u0101hi Rabba, wa bil-Isl\u0101mi d\u012bna, wa bi-Mu\u1e25ammadin \ufdfa nabiyya.",
    translation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad \ufdfa as my Prophet.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Ahmad 4/337; An-Nasa\u2019i; Ibn as-Sunni; At-Tirmidhi 5/465; Hisn al-Muslim 87.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0643\u0627\u0646 \u062d\u0642\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0644\u0647 \u0623\u0646 \u064a\u0631\u0636\u064a\u0647 \u064a\u0648\u0645 \u0627\u0644\u0642\u064a\u0627\u0645\u0629.",
    hadithTextEnglish:
      "It is reported that whoever says it three times in the morning and three times in the evening, it is a right upon Allah to please him on the Day of Resurrection.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A87",
  },
  {
    id: "m-hm-88",
    category: "morning",
    orderIndex: 18,
    arabicText:
      "\u064a\u064e\u0627 \u062d\u064e\u064a\u0651\u064f \u064a\u064e\u0627 \u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f\u060c \u0628\u0650\u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0650\u064a\u062b\u064f\u060c \u0623\u064e\u0635\u0652\u0644\u0650\u062d\u0652 \u0644\u0650\u064a \u0634\u064e\u0623\u0652\u0646\u0650\u064a \u0643\u064f\u0644\u0651\u064e\u0647\u064f\u060c \u0648\u064e\u0644\u0627\u064e \u062a\u064e\u0643\u0650\u0644\u0652\u0646\u0650\u064a \u0625\u0650\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0637\u064e\u0631\u0652\u0641\u064e\u0629\u064e \u0639\u064e\u064a\u0652\u0646\u064d.",
    transliteration:
      "Y\u0101 \u1e24ayyu y\u0101 Qayy\u016bm, bira\u1e25matika astagh\u012bth, a\u1e63li\u1e25 l\u012b sha\u2019n\u012b kullah, wa l\u0101 takiln\u012b il\u0101 nafs\u012b \u1e6darfata \u02bfayn.",
    translation:
      "O Ever-Living, O Sustainer, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself even for the blink of an eye.",
    benefit: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Hakim; Al-Albani, Sahih al-Jami\u02bf; Hisn al-Muslim 88.",
    preferredTiming: "Morning after Fajr; evening after ‘Asr/sunset window.",
    hadithText:
      "عَنْ أَنَسِ بْنِ مَالِكٍ رضي الله عنه قَالَ: قَالَ النَّبِيُّ ﷺ لِفَاطِمَةَ رَضِيَ اللَّهُ عَنْهَا: «مَا يَمْنَعُكِ أَنْ تَسْمَعِي مَا أُوصِيكِ بِهِ؟ أَنْ تَقُولِي إِذَا أَصْبَحْتِ وَإِذَا أَمْسَيْتِ: يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ».",
    hadithTextEnglish:
      "Anas ibn Malik (may Allah be pleased with him) said: The Prophet ﷺ said to Fatimah (may Allah be pleased with her): “What keeps you from hearing what I counsel you with? Say, when you rise in the morning and when you reach the evening: O Ever-Living, O Sustainer, by Your mercy I seek help. Set right all my affairs, and do not entrust me to myself for the blink of an eye.”",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A88",
  },
  {
    id: "m-hm-89m",
    category: "morning",
    orderIndex: 3,
    arabicText:
      "\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u064e \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u0650: \u0641\u064e\u062a\u0652\u062d\u064e\u0647\u064f\u060c \u0648\u064e\u0646\u064e\u0635\u0652\u0631\u064e\u0647\u064f\u060c \u0648\u064e\u0646\u064f\u0648\u0631\u064e\u0647\u064f\u060c \u0648\u064e\u0628\u064e\u0631\u064e\u0643\u064e\u062a\u064e\u0647\u064f\u060c \u0648\u064e\u0647\u064f\u062f\u064e\u0627\u0647\u064f\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a\u0647\u0650 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f.",
    transliteration:
      "A\u1e63ba\u1e25n\u0101 wa a\u1e63ba\u1e25al-mulku lill\u0101hi Rabbil-\u02bf\u0101lam\u012bn. All\u0101humma inn\u012b as\u2019aluka khayra h\u0101dh\u0101 \u2019l-yawm: fat\u1e25ahu, wa na\u1e63rahu, wa n\u016brahu, wa barakatahu, wa hud\u0101h, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012bhi wa sharri m\u0101 ba\u02bfdah.",
    translation:
      "We have entered the morning, and dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this day: its opening, victory, light, blessing, and guidance; and I seek refuge in You from the evil within it and the evil after it.",
    benefit: "Asking for the good of the day or night and seeking refuge from its evil.",
    benefitArabic: "سؤال خير هذا اليوم أو هذه الليلة والاستعاذة من شرها.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/322; Hisn al-Muslim 89.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رضي الله عنه قَالَ: كَانَ نَبِيُّ اللَّهِ ﷺ إِذَا أَمْسَى قَالَ: «أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ، وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ، وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ، وَعَذَابٍ فِي الْقَبْرِ»، وَإِذَا أَصْبَحَ قَالَ ذَلِكَ أَيْضًا: «أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ، وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ، وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ، وَعَذَابٍ فِي الْقَبْرِ».",
    hadithTextEnglish:
      "‘Abdullah ibn Mas‘ud (may Allah be pleased with him) said: When evening came, the Prophet of Allah ﷺ would say: “We have reached the evening, and the dominion has reached the evening belonging to Allah. Praise be to Allah. There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things. My Lord, I ask You for the good of this night and the good that follows it, and I seek refuge in You from the evil of this night and the evil that follows it. My Lord, I seek refuge in You from idleness and the misery of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.” And when morning came he would say the same, with the night changed to the day.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A89",
  },
  {
    id: "m-hm-90m",
    category: "morning",
    orderIndex: 15,
    arabicText:
      "\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0641\u0650\u0637\u0652\u0631\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0643\u064e\u0644\u0650\u0645\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u062e\u0652\u0644\u0627\u064e\u0635\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u062f\u0650\u064a\u0646\u0650 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0645\u0650\u0644\u0651\u064e\u0629\u0650 \u0623\u064e\u0628\u0650\u064a\u0646\u064e\u0627 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e\u060c \u062d\u064e\u0646\u0650\u064a\u0641\u064b\u0627 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064b\u0627\u060c \u0648\u064e\u0645\u064e\u0627 \u0643\u064e\u0627\u0646\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0645\u064f\u0634\u0652\u0631\u0650\u0643\u0650\u064a\u0646\u064e.",
    transliteration:
      "A\u1e63ba\u1e25n\u0101 \u02bfal\u0101 fi\u1e6dratil-Isl\u0101m, wa \u02bfal\u0101 kalimatil-ikhl\u0101\u1e63, wa \u02bfal\u0101 d\u012bni nabiyyin\u0101 Mu\u1e25ammadin \ufdfa, wa \u02bfal\u0101 millati ab\u012bn\u0101 Ibr\u0101h\u012bm, \u1e25an\u012bfan Musliman, wa m\u0101 k\u0101na minal-mushrik\u012bn.",
    translation:
      "We have entered the morning upon the natural religion of Islam, the word of sincerity, the religion of our Prophet Muhammad \ufdfa, and the way of our father Ibrahim, upright and Muslim, and he was not of the polytheists.",
    benefit:
      "Renewing one's entry upon the natural religion of Islam, the word of sincerity, the religion of the Prophet ﷺ and the way of Ibrahim.",
    benefitArabic: "تجديد الدخول على فطرة الإسلام وكلمة الإخلاص ودين النبي ﷺ وملّة إبراهيم.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Ahmad 3/406-407 and 5/123; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 34; At-Tirmidhi 4/209; Hisn al-Muslim 90.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "عَنْ عَبْدِ الرَّحْمَنِ بْنِ أَبْزَى رضي الله عنه عَنِ النَّبِيِّ ﷺ أَنَّهُ كَانَ يَقُولُ إِذَا أَصْبَحَ وَإِذَا أَمْسَى: «أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ».",
    hadithTextEnglish:
      "‘Abd al-Rahman ibn Abza (may Allah be pleased with him) reported from the Prophet ﷺ that he used to say, morning and evening: “We have risen upon the natural way of Islam, upon the word of sincerity, upon the religion of our Prophet Muhammad ﷺ, and upon the creed of our father Ibrahim, upright and submitting; and he was not among those who associate others with Allah.”",
    authenticityNote: "Included in Hisn al-Muslim; grading not displayed on the Sunnah.com page.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A90",
  },
  {
    id: "m-hm-91",
    category: "morning",
    orderIndex: 20,
    arabicText:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650.",
    transliteration: "Sub\u1e25\u0101nall\u0101hi wa bi\u1e25amdih.",
    translation: "Glory and praise be to Allah.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari 4/2071; Hisn al-Muslim 91.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e \u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650 \u0641\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064d \u0645\u0650\u0627\u0626\u064e\u0629\u064e \u0645\u064e\u0631\u0651\u064e\u0629\u064d \u062d\u064f\u0637\u0651\u064e\u062a\u0652 \u062e\u064e\u0637\u064e\u0627\u064a\u064e\u0627\u0647\u064f \u0648\u064e\u0625\u0650\u0646\u0652 \u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0645\u0650\u062b\u0652\u0644\u064e \u0632\u064e\u0628\u064e\u062f\u0650 \u0627\u0644\u0652\u0628\u064e\u062d\u0652\u0631\u0650\u00bb\u060c \u0648\u0648\u0631\u062f \u0641\u0636\u0644\u0647\u0627 \u0635\u0628\u0627\u062d\u064b\u0627 \u0648\u0645\u0633\u0627\u0621\u064b.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “Whoever says: Glory be to Allah and praise be to Him — a hundred times in a day, his sins are wiped away, even were they like the foam of the sea.” Its merit is likewise reported morning and evening.",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A91",
  },
  {
    id: "m-hm-93",
    category: "morning",
    orderIndex: 21,
    arabicText:
      "\u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c.",
    transliteration:
      "L\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br.",
    translation:
      "None is worthy of worship but Allah alone, without partner. His is the dominion and praise, and He is able to do all things.",
    benefit:
      "Said 100 times in a day: the reward of freeing ten slaves, 100 good deeds recorded, 100 sins erased, and a shield from Satan until evening.",
    benefitArabic:
      "من قالها مائة مرة في يومه: عدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حِرزًا من الشيطان حتى يمسي.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari 4/95; Muslim 4/2071; Hisn al-Muslim 93.",
    preferredTiming: "Upon rising in the morning; can be recited any time during the day.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، فِي يَوْمٍ مِائَةَ مَرَّةٍ، كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ، وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ إِلَّا أَحَدٌ عَمِلَ أَكْثَرَ مِنْ ذَلِكَ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever says: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — a hundred times in a day, it is for him the equal of freeing ten slaves, and it is a protection for him from Satan for that day until evening; and no one brings anything better than what he brought, except one who does more than that.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Same wording as HM-92 but with 100 count.",
    sourceUrl: "https://sunnah.com/hisn%3A93",
  },
  {
    id: "m-hm-94",
    category: "morning",
    orderIndex: 22,
    arabicText:
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
    transliteration:
      "Subḥānallāhi wa biḥamdih, ʻadada khalqih, wa riḍā nafsih, wa zinata ʻarshih, wa midāda kalimātih.",
    translation:
      "Glory and praise be to Allah, by the number of His creation, by His pleasure, by the weight of His Throne, and by the extent of His words.",
    benefit: "Sahih Muslim.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Muslim 4/2090; Hisn al-Muslim 94.",
    preferredTiming: "Upon rising in the morning.",
    hadithText:
      "عَنْ جُوَيْرِيَةَ رضي الله عنها أَنَّ النَّبِيَّ ﷺ خَرَجَ مِنْ عِنْدِهَا بُكْرَةً حِينَ صَلَّى الصُّبْحَ وَهِيَ فِي مَسْجِدِهَا ثُمَّ رَجَعَ بَعْدَ أَنْ أَضْحَى وَهِيَ جَالِسَةٌ فَقَالَ: «لَقَدْ قُلْتُ بَعْدَكِ أَرْبَعَ كَلِمَاتٍ ثَلاَثَ مَرَّاتٍ لَوْ وُزِنَتْ بِمَا قُلْتِ مُنْذُ الْيَوْمِ لَوَزَنَتْهُنَّ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ».",
    hadithTextEnglish:
      "Juwayriyah (may Allah be pleased with her) reported that the Prophet ﷺ left her early, after he had prayed the dawn prayer, while she was in her place of prayer; then he returned after the forenoon and she was still sitting. He said: “I have said four words three times since I left you which, if weighed against what you have said since the day began, would outweigh them: Glory be to Allah and praise be to Him, as many as His creation, as pleases Him, as the weight of His Throne, and as the ink of His words.”",
    authenticityNote: "Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A94",
  },
  {
    id: "m-hm-95",
    category: "morning",
    orderIndex: 19,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627\u060c \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0637\u064e\u064a\u0651\u0650\u0628\u064b\u0627\u060c \u0648\u064e\u0639\u064e\u0645\u064e\u0644\u064b\u0627 \u0645\u064f\u062a\u064e\u0642\u064e\u0628\u0651\u064e\u0644\u064b\u0627.",
    transliteration:
      "All\u0101humma inn\u012b as\u2019aluka \u02bfilman n\u0101fi\u02bfa, wa rizqan \u1e6dayyiba, wa \u02bfamalan mutaqabbala.",
    translation: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
    benefit: "Hasan chain according to Ibn al-Qayyim as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Ibn as-Sunni no. 54; Ibn Majah no. 925; Hisn al-Muslim 95.",
    preferredTiming: "After Fajr / upon rising in the morning.",
    hadithText:
      "عَنْ أُمِّ سَلَمَةَ رضي الله عنها أَنَّ النَّبِيَّ ﷺ كَانَ يَقُولُ إِذَا صَلَّى الصُّبْحَ حِينَ يُسَلِّمُ: «اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً».",
    hadithTextEnglish:
      "Umm Salamah (may Allah be pleased with her) reported that the Prophet ﷺ used to say after the dawn prayer, when he gave the salam: “O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.”",
    authenticityNote: "Hasan chain according to Ibn al-Qayyim as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A95",
  },
  {
    id: "m-hm-96",
    category: "morning",
    orderIndex: 23,
    arabicText:
      "\u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0648\u064e\u0623\u064e\u062a\u064f\u0648\u0628\u064f \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650.",
    transliteration: "Astaghfirull\u0101ha wa at\u016bbu ilayh.",
    translation: "I seek Allah\u2019s forgiveness and repent to Him.",
    benefit: "Hisn notes: recite 100 times during the day.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari; Muslim 4/2075; Hisn al-Muslim 96.",
    preferredTiming: "During the day; suitable to include in morning/evening routine.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0642\u0648\u0644 \u0641\u064a \u0627\u0644\u0645\u062c\u0644\u0633 \u0627\u0644\u0648\u0627\u062d\u062f: \u00ab\u0631\u064e\u0628\u0651\u0650 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0648\u064e\u062a\u064f\u0628\u0652 \u0639\u064e\u0644\u064e\u064a\u0651\u064e \u0625\u0650\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u062a\u0651\u064e\u0648\u0651\u064e\u0627\u0628\u064f \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u064f\u00bb \u0645\u0631\u0627\u062a \u0643\u062b\u064a\u0631\u0629\u060c \u0648\u0648\u0631\u062f \u0639\u0646\u0647 \u0627\u0644\u0627\u0633\u062a\u063a\u0641\u0627\u0631 \u0645\u0627\u0626\u0629 \u0645\u0631\u0629 \u0641\u064a \u0627\u0644\u064a\u0648\u0645.",
    hadithTextEnglish:
      "The Prophet ﷺ would say in a single sitting: “My Lord, forgive me and accept my repentance; You are the Ever-Relenting, the Merciful” many times over; and it is reported of him that he sought forgiveness a hundred times a day.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Hisn notes: recite 100 times during the day.",
    sourceUrl: "https://sunnah.com/hisn%3A96",
  },
  {
    id: "m-hm-98",
    category: "morning",
    orderIndex: 24,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0635\u064e\u0644\u0651\u0650 \u0648\u064e\u0633\u064e\u0644\u0651\u0650\u0645\u0652 \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d.",
    transliteration: "All\u0101humma \u1e63alli wa sallim \u02bfal\u0101 nabiyyin\u0101 Mu\u1e25ammad.",
    translation: "O Allah, send prayers and peace upon our Prophet Muhammad.",
    benefit: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 10,
    countLabel: "10",
    sourceReference: "At-Tabarani; Haythami Majma\u02bf az-Zawa\u2019id 10/120; Hisn al-Muslim 98.",
    preferredTiming: "Morning and evening.",
    hadithText:
      "عَنْ أَبِي الدَّرْدَاءِ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ صَلَّى عَلَيَّ حِينَ يُصْبِحُ عَشْرًا، وَحِينَ يُمْسِي عَشْرًا، أَدْرَكَتْهُ شَفَاعَتِي يَوْمَ الْقِيَامَةِ».",
    hadithTextEnglish:
      "Abu al-Darda’ (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Whoever sends blessings upon me ten times in the morning and ten times in the evening, my intercession will reach him on the Day of Resurrection.”",
    authenticityNote: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A98",
  },
];

const EVENING_AZKAR: ZikrDraft[] = [
  {
    id: "e-hm-75a",
    category: "evening",
    orderIndex: 0,
    arabicText:
      "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f\u060c \u0648\u064e\u0627\u0644\u0635\u0651\u064e\u0644\u0627\u064e\u0629\u064f \u0648\u064e\u0627\u0644\u0633\u0651\u064e\u0644\u0627\u064e\u0645\u064f \u0639\u064e\u0644\u064e\u0649 \u0645\u064e\u0646\u0652 \u0644\u0627\u064e \u0646\u064e\u0628\u0650\u064a\u0651\u064e \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f",
    transliteration:
      "Al\u1e25amdulill\u0101hi wa\u1e25dah, wa\u1e63-\u1e63al\u0101tu was-sal\u0101mu \u02bfal\u0101 man l\u0101 nabiyya ba\u02bfdah.",
    translation:
      "All praise is due to Allah alone, and prayers and peace be upon the one after whom there is no Prophet.",
    benefit: "Included as the opening item of the morning/evening chapter.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud no. 3667; Hisn al-Muslim 75a.",
    preferredTiming:
      "Morning: after Fajr until sunrise. Evening: after \u2018Asr until sunset as a strong recommended dhikr sitting.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0644\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u0639\u064f\u062f\u064e \u0645\u064e\u0639\u064e \u0642\u064e\u0648\u0652\u0645\u064d \u064a\u064e\u0630\u0652\u0643\u064f\u0631\u064f\u0648\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0645\u0650\u0646\u0652 \u0635\u064e\u0644\u0627\u064e\u0629\u0650 \u0627\u0644\u0652\u063a\u064e\u062f\u064e\u0627\u0629\u0650 \u062d\u064e\u062a\u0651\u064e\u0649 \u062a\u064e\u0637\u0652\u0644\u064f\u0639\u064e \u0627\u0644\u0634\u0651\u064e\u0645\u0652\u0633\u064f \u0623\u064e\u062d\u064e\u0628\u0651\u064f \u0625\u0650\u0644\u064e\u064a\u0651\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0646\u0652 \u0623\u064f\u0639\u0652\u062a\u0650\u0642\u064e \u0623\u064e\u0631\u0652\u0628\u064e\u0639\u064e\u0629\u064b \u0645\u0650\u0646\u0652 \u0648\u064e\u0644\u064e\u062f\u0650 \u0625\u0650\u0633\u0652\u0645\u064e\u0627\u0639\u0650\u064a\u0644\u064e، وَلِأَنْ أَقْعُدَ مَعَ قَوْمٍ يَذْكُرُونَ اللَّهَ \u0648\u0645\u0646 \u0635\u0644\u0627\u0629 \u0627\u0644\u0639\u0635\u0631 \u0625\u0644\u0649 \u0623\u0646 \u062a\u063a\u0631\u0628 \u0627\u0644\u0634\u0645\u0633\u00bb \u0628\u0645\u0639\u0646\u0627\u0647.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “That I should sit with a people remembering Allah from the dawn prayer until the sun rises is dearer to me than freeing four of the descendants of Isma‘il; and that I should sit with a people remembering Allah from the afternoon prayer until the sun sets…” — reported to this effect.",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Included as the opening item of the morning/evening chapter.",
    sourceUrl: "https://sunnah.com/hisn%3A75a",
  },
  {
    id: "e-hm-75",
    category: "evening",
    orderIndex: 4,
    hasSeekRefuge: true,
    surahNameArabic: "البَقَرَة (آيَةُ الكُرْسِيِّ)",
    surahNameEnglish: "Al-Baqarah (Ayah Al-Kursi)",
    arabicText:
      "\ufd3f\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e \u0627\u0644\u0652\u062d\u064e\u064a\u0651\u064f \u0627\u0644\u0652\u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f \u0644\u0627\u064e \u062a\u064e\u0623\u0652\u062e\u064f\u0630\u064f\u0647\u064f \u0633\u0650\u0646\u064e\u0629\u064c \u0648\u064e\u0644\u0627\u064e \u0646\u064e\u0648\u0652\u0645\u064c \u0644\u0651\u064e\u0647\u064f \u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0645\u064e\u0646 \u0630\u064e\u0627 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064e\u0634\u0652\u0641\u064e\u0639\u064f \u0639\u0650\u0646\u0652\u062f\u064e\u0647\u064f \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0625\u0650\u0630\u0652\u0646\u0650\u0647\u0650 \u064a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0645\u064e\u0627 \u0628\u064e\u064a\u0652\u0646\u064e \u0623\u064e\u064a\u0652\u062f\u0650\u064a\u0647\u0650\u0645\u0652 \u0648\u064e\u0645\u064e\u0627 \u062e\u064e\u0644\u0652\u0641\u064e\u0647\u064f\u0645\u0652 \u0648\u064e\u0644\u0627\u064e \u064a\u064f\u062d\u0650\u064a\u0637\u064f\u0648\u0646\u064e \u0628\u0650\u0634\u064e\u064a\u0652\u0621\u064d \u0645\u0651\u0650\u0646\u0652 \u0639\u0650\u0644\u0652\u0645\u0650\u0647\u0650 \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0645\u064e\u0627 \u0634\u064e\u0627\u0621 \u0648\u064e\u0633\u0650\u0639\u064e \u0643\u064f\u0631\u0652\u0633\u0650\u064a\u0651\u064f\u0647\u064f \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u064e \u0648\u064e\u0644\u0627\u064e \u064a\u064e\u0624\u064f\u0648\u062f\u064f\u0647\u064f \u062d\u0650\u0641\u0652\u0638\u064f\u0647\u064f\u0645\u064e\u0627 \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u064f\ufd3e",
    transliteration:
      "All\u0101hu l\u0101 il\u0101ha ill\u0101 huwa \u2019l-\u1e24ayyul-Qayy\u016bm, l\u0101 ta\u2019khudhuhu sinatun wa l\u0101 nawm, lahu m\u0101 fis-sam\u0101w\u0101ti wa m\u0101 fil-ar\u1e0d, man dhal-ladh\u012b yashfa\u02bfu \u02bfindahu ill\u0101 bi\u2019idhnih, ya\u02bflamu m\u0101 bayna ayd\u012bhim wa m\u0101 khalfahum, wa l\u0101 yu\u1e25\u012b\u1e6d\u016bna bi shay\u2019in min \u02bfilmihi ill\u0101 bim\u0101 sh\u0101\u2019, wasi\u02bfa kursiyyuhus-sam\u0101w\u0101ti wal-ar\u1e0d, wa l\u0101 ya\u2019\u016bduhu \u1e25if\u1e93uhum\u0101, wa huwal-\u02bfAliyyul-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah\u2014there is none worthy of worship except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and earth. None can intercede except by His permission. He knows what is before and behind them; they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and earth, and preserving them does not tire Him. He is the Most High, the Magnificent.",
    benefit: "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Qur\u2019an 2:255; Al-Hakim 1/562; Hisn al-Muslim 75.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0623\u064f\u062c\u064a\u0631 \u0645\u0646 \u0627\u0644\u062c\u0646 \u062d\u062a\u0649 \u064a\u0645\u0633\u064a\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0623\u064f\u062c\u064a\u0631 \u0645\u0646\u0647\u0645 \u062d\u062a\u0649 \u064a\u0635\u0628\u062d.",
    hadithTextEnglish:
      "It is reported that whoever says it in the morning is protected from the jinn until the evening, and whoever says it in the evening is protected from them until the morning.",
    authenticityNote:
      "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A75",
  },
  {
    id: "e-hm-76a",
    category: "evening",
    isSurah: true,
    surahNameArabic: "الإِخْلَاص",
    surahNameEnglish: "Al-Ikhlas",
    surahType: "مكية",
    verseCount: 4,
    hasBasmalah: true,
    orderIndex: 5,
    arabicText:
      "\ufd3f\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c \u06dd \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0627\u0644\u0635\u0651\u064e\u0645\u064e\u062f\u064f \u06dd \u0644\u064e\u0645\u0652 \u064a\u064e\u0644\u0650\u062f\u0652 \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064f\u0648\u0644\u064e\u062f\u0652 \u06dd \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064e\u0643\u064f\u0646 \u0644\u0651\u064e\u0647\u064f \u0643\u064f\u0641\u064f\u0648\u0627\u064b \u0623\u064e\u062d\u064e\u062f\u064c\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul huwall\u0101hu a\u1e25ad. All\u0101hu\u1e63-\u1e63amad. Lam yalid wa lam y\u016blad. Wa lam yakun lahu kufuwan a\u1e25ad.",
    translation:
      "Say: He is Allah, One. Allah, the Self-Sufficient. He neither begets nor is begotten, and none is comparable to Him.",
    benefit: "With the two refuge surahs, three times morning and evening: they suffice you against everything.",
    benefitArabic: "مع المعوذتين ثلاثًا صباحًا ومساءً؛ تكفيك من كل شيء.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0645\u0646 \u0633\u0623\u0644\u0647 \u0645\u0627 \u064a\u0642\u0648\u0644 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d \u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u0649: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said to the one who asked him what to say morning and evening: “Say: ‘Say: He is Allah, One’ and the two suras of refuge, evening and morning, three times; they will suffice you against everything.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Falaq and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "e-hm-76b",
    category: "evening",
    isSurah: true,
    surahNameArabic: "الفَلَق",
    surahNameEnglish: "Al-Falaq",
    surahType: "مكية",
    verseCount: 5,
    hasBasmalah: true,
    orderIndex: 6,
    arabicText:
      "\ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0641\u064e\u0644\u064e\u0644\u064e\u0642\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u062e\u064e\u0644\u064e\u0642\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u063a\u064e\u0627\u0633\u0650\u0642\u064d \u0625\u0650\u0630\u064e\u0627 \u0648\u064e\u0642\u064e\u0628\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0641\u0651\u064e\u0627\u062b\u064e\u0627\u062a\u0650 \u0641\u0650\u064a \u0627\u0644\u0652\u0639\u064f\u0642\u064e\u062f\u0650 \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u062d\u064e\u0627\u0633\u0650\u062f\u064d \u0625\u0650\u0630\u064e\u0627 \u062d\u064e\u0633\u064e\u062f\u064e\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbil-falaq. Min sharri m\u0101 khalaq. Wa min sharri gh\u0101siqin idh\u0101 waqab. Wa min sharrin-naff\u0101th\u0101ti fil-\u02bfuqad. Wa min sharri \u1e25\u0101sidin idh\u0101 \u1e25asad.",
    translation:
      "Say: I seek refuge in the Lord of daybreak, from the evil of what He created, from the evil of darkness when it settles, from the evil of those who blow on knots, and from the evil of the envier when he envies.",
    benefit: "With al-Ikhlas and an-Nas, three times morning and evening: they suffice you against everything.",
    benefitArabic: "مع الإخلاص والناس ثلاثًا صباحًا ومساءً؛ تكفيك من كل شيء.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “Say: ‘Say: He is Allah, One’ and the two suras of refuge, evening and morning, three times; they will suffice you against everything.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "e-hm-76c",
    category: "evening",
    isSurah: true,
    surahNameArabic: "النَّاس",
    surahNameEnglish: "An-Nas",
    surahType: "مكية",
    verseCount: 6,
    hasBasmalah: true,
    orderIndex: 7,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650. \ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u064e\u0644\u0650\u0643\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0625\u0650\u0644\u064e\u0647\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0652\u0648\u064e\u0633\u0652\u0648\u064e\u0627\u0633\u0650 \u0627\u0644\u0652\u062e\u064e\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064f\u0648\u064e\u0633\u0652\u0648\u0650\u0633\u064f \u0641\u0650\u064a \u0635\u064f\u062f\u064f\u0648\u0631\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u062c\u0650\u0646\u0651\u064e\u0629\u0650 \u0648\u064e\u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbin-n\u0101s. Malikin-n\u0101s. Il\u0101hin-n\u0101s. Min sharril-wasw\u0101sil-khann\u0101s. Alladh\u012b yuwaswisu f\u012b \u1e63ud\u016brin-n\u0101s. Minal-jinnati wan-n\u0101s.",
    translation:
      "Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the retreating whisperer who whispers in people\u2019s hearts, from jinn and mankind.",
    benefit: "With al-Ikhlas and al-Falaq, three times morning and evening: they suffice you against everything.",
    benefitArabic: "مع الإخلاص والفلق ثلاثًا صباحًا ومساءً؛ تكفيك من كل شيء.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “Say: ‘Say: He is Allah, One’ and the two suras of refuge, evening and morning, three times; they will suffice you against everything.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and al-Falaq three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "e-hm-77e",
    category: "evening",
    orderIndex: 1,
    arabicText:
      "\u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0645\u0652\u0633\u064e\u0649 \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u0650\u0647\u0650 \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u064e\u0629\u0650 \u0648\u064e\u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u0650\u0647\u0650 \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u064e\u0629\u0650 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064e\u0627. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064e\u0633\u064e\u0644\u0650 \u0648\u064e\u0633\u064f\u0648\u0621\u0650 \u0627\u0644\u0652\u0643\u0650\u0628\u064e\u0631\u0650. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0646\u0651\u064e\u0627\u0631\u0650 \u0648\u064e\u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650.",
    transliteration:
      "Amsayn\u0101 wa amsal-mulku lill\u0101h, wal\u1e25amdu lill\u0101h, l\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br. Rabbi as\u2019aluka khayra m\u0101 f\u012b h\u0101dhihi \u2019l-laylati wa khayra m\u0101 ba\u02bfdah\u0101, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012b h\u0101dhihi \u2019l-laylati wa sharri m\u0101 ba\u02bfdah\u0101. Rabbi a\u02bf\u016bdhu bika minal-kasali wa s\u016b\u2019il-kibar. Rabbi a\u02bf\u016bdhu bika min \u02bfadh\u0101bin fin-n\u0101ri wa \u02bfadh\u0101bin fil-qabr.",
    translation:
      "We have entered the evening and dominion belongs to Allah. Praise is for Allah. None is worthy of worship but Allah alone, without partner; His is the dominion and praise, and He is able to do all things. My Lord, I ask You for the good of this night and what follows it, and I seek refuge in You from the evil of this night and what follows it. My Lord, I seek refuge in You from laziness and the hardships of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.",
    benefit: "Sahih Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 4/2088; Hisn al-Muslim 77.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0625\u0630\u0627 \u0623\u0645\u0633\u0649 \u0642\u0627\u0644 \u0635\u064a\u063a\u0629 \u0627\u0644\u0645\u0633\u0627\u0621: \u00ab\u0623\u0645\u0633\u064a\u0646\u0627 \u0648\u0623\u0645\u0633\u0649 \u0627\u0644\u0645\u0644\u0643 \u0644\u0644\u0647، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ، وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ، وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ، وَعَذَابٍ فِي الْقَبْرِ\u00bb \u0643\u0645\u0627 \u0641\u064a \u0635\u062d\u064a\u062d \u0645\u0633\u0644\u0645.",
    hadithTextEnglish:
      "When evening came the Prophet ﷺ would say the evening form: “We have reached the evening, and the dominion has reached the evening belonging to Allah. Praise be to Allah. There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things. My Lord, I ask You for the good of this night and the good that follows it, and I seek refuge in You from the evil of this night and the evil that follows it. My Lord, I seek refuge in You from idleness and the misery of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave” — as in Sahih Muslim.",
    authenticityNote: "Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A77",
  },
  {
    id: "e-hm-78e",
    category: "evening",
    orderIndex: 2,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0628\u0650\u0643\u064e \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u062d\u0652\u064a\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u0645\u064f\u0648\u062a\u064f\u060c \u0648\u064e\u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e \u0627\u0644\u0652\u0645\u064e\u0635\u0650\u064a\u0631\u064f.",
    transliteration:
      "All\u0101humma bika amsayn\u0101, wa bika a\u1e63ba\u1e25n\u0101, wa bika na\u1e25y\u0101, wa bika nam\u016bt, wa ilaykal-ma\u1e63\u012br.",
    translation:
      "O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the final return.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi 5/466; Abu Dawud 4/317; Ibn Majah; Hisn al-Muslim 78.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: كَانَ النَّبِيُّ ﷺ يُعَلِّمُ أَصْحَابَهُ يَقُولُ: وَإِذَا أَمْسَى فَلْيَقُلْ: «اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) said: The Prophet ﷺ used to teach his companions, saying: And when evening comes, let him say: “O Allah, by You we have reached the evening and by You we have reached the morning; by You we live and by You we die, and to You is the return.”",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A78",
  },
  {
    id: "e-hm-79",
    category: "evening",
    orderIndex: 14,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0631\u064e\u0628\u0651\u0650\u064a \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u062e\u064e\u0644\u064e\u0642\u0652\u062a\u064e\u0646\u0650\u064a \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0639\u064e\u0647\u0652\u062f\u0650\u0643\u064e \u0648\u064e\u0648\u064e\u0639\u0652\u062f\u0650\u0643\u064e \u0645\u064e\u0627 \u0627\u0633\u0652\u062a\u064e\u0637\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0635\u064e\u0646\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0644\u064e\u0643\u064e \u0628\u0650\u0646\u0650\u0639\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0639\u064e\u0644\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0628\u0650\u0630\u064e\u0646\u0652\u0628\u0650\u064a\u060c \u0641\u064e\u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a\u060c \u0641\u064e\u0625\u0650\u0646\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u064a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0630\u0651\u064f\u0646\u064f\u0648\u0628\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma anta Rabb\u012b l\u0101 il\u0101ha ill\u0101 ant, khalaqtan\u012b wa ana \u02bfabduk, wa ana \u02bfal\u0101 \u02bfahdika wa wa\u02bfdika m\u0101 ista\u1e6da\u02bft, a\u02bf\u016bdhu bika min sharri m\u0101 \u1e63ana\u02bft, ab\u016b\u2019u laka bini\u02bfmatika \u02bfalayy, wa ab\u016b\u2019u bidhanb\u012b, faghfir l\u012b, fa innahu l\u0101 yaghfirudh-dhun\u016bba ill\u0101 ant.",
    translation:
      "O Allah, You are my Lord; none is worthy of worship but You. You created me and I am Your servant. I keep Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 7/150; Hisn al-Muslim 79.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0633\u064e\u064a\u0651\u0650\u062f\u064f \u0627\u0644\u0650\u0627\u0633\u0652\u062a\u0650\u063a\u0652\u0641\u064e\u0627\u0631\u0650 أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ\u00bb \u062b\u0645 \u0630\u0643\u0631\u0647\u060c \u0648\u0642\u0627\u0644: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u0651\u064e\u0647\u064e\u0627\u0631\u0650 \u0645\u064f\u0648\u0642\u0650\u0646\u064b\u0627 \u0628\u0650\u0647\u064e\u0627 \u0641\u064e\u0645\u064e\u0627\u062a\u064e \u0645\u0650\u0646\u0652 \u064a\u064e\u0648\u0652\u0645\u0650\u0647\u0650 قَبْلَ أَنْ يُمْسِيَ، \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u060c \u0648\u064e\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u0650 وَهُوَ مُوقِنٌ بِهَا، فَمَاتَ قَبْلَ أَنْ يُصْبِحَ، \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “The best manner of seeking forgiveness is to say: O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I hold to Your covenant and Your promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You.” Then he said: “Whoever says it during the day with certainty in it and dies that day before evening is among the people of Paradise; and whoever says it at night with certainty in it and dies before morning is among the people of Paradise.”",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A79",
  },
  {
    id: "e-hm-80e",
    category: "evening",
    orderIndex: 17,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u062a\u064f \u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f \u062d\u064e\u0645\u064e\u0644\u064e\u0629\u064e \u0639\u064e\u0631\u0652\u0634\u0650\u0643\u064e\u060c \u0648\u064e\u0645\u064e\u0644\u0627\u064e\u0626\u0650\u0643\u064e\u062a\u064e\u0643\u064e\u060c \u0648\u064e\u062c\u064e\u0645\u0650\u064a\u0639\u064e \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0623\u064e\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u0651\u064e \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064b\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e \u0648\u064e\u0631\u064e\u0633\u064f\u0648\u0644\u064f\u0643\u064e.",
    transliteration:
      "All\u0101humma inn\u012b amsaytu ush-hiduka, wa ush-hidu \u1e25amalata \u02bfarshik, wa mal\u0101\u2019ikataka, wa jam\u012b\u02bfa khalqik, annaka antall\u0101hu l\u0101 il\u0101ha ill\u0101 ant, wa\u1e25daka l\u0101 shar\u012bka lak, wa anna Mu\u1e25ammadan \u02bfabduka wa ras\u016bluk.",
    translation:
      "O Allah, this evening I call You, the bearers of Your Throne, Your angels, and all Your creation to witness that You are Allah; none is worthy of worship but You alone, without partner, and that Muhammad is Your servant and Messenger.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 4,
    countLabel: "4",
    sourceReference:
      "Abu Dawud 4/317; Al-Bukhari in Al-Adab al-Mufrad; An-Nasa\u2019i; Ibn as-Sunni; Hisn al-Muslim 80.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f \u0641\u064a \u0641\u0636\u0644\u0647\u0627 \u0641\u064a \u0627\u0644\u0635\u0628\u0627\u062d \u0648\u0627\u0644\u0645\u0633\u0627\u0621: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0623\u0631\u0628\u0639 \u0645\u0631\u0627\u062a \u0623\u0639\u062a\u0642\u0647 \u0627\u0644\u0644\u0647 \u0645\u0646 \u0627\u0644\u0646\u0627\u0631.",
    hadithTextEnglish:
      "Its merit is reported morning and evening: whoever says it four times, Allah frees him from the Fire.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A80",
  },
  {
    id: "e-hm-81e",
    category: "evening",
    orderIndex: 18,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0645\u064e\u0627 \u0623\u064e\u0645\u0652\u0633\u064e\u0649 \u0628\u0650\u064a \u0645\u0650\u0646\u0652 \u0646\u0650\u0639\u0652\u0645\u064e\u0629\u064d\u060c \u0623\u064e\u0648\u0652 \u0628\u0650\u0623\u064e\u062d\u064e\u062f\u064d \u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0641\u064e\u0645\u0650\u0646\u0652\u0643\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0641\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0634\u0651\u064f\u0643\u0652\u0631\u064f.",
    transliteration:
      "All\u0101humma m\u0101 ams\u0101 b\u012b min ni\u02bfmatin, aw bi-a\u1e25adin min khalqik, fa minka wa\u1e25daka l\u0101 shar\u012bka lak, falakal-\u1e25amdu wa lakash-shukr.",
    translation:
      "O Allah, whatever blessing has reached me or any of Your creation this evening is from You alone, without partner; all praise and thanks belong to You.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Abu Dawud 4/318; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 7; Ibn as-Sunni no. 41; Ibn Hibban no. 2361; Hisn al-Muslim 81.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0641\u0642\u062f \u0623\u062f\u0651\u0649 \u0634\u0643\u0631 \u0644\u064a\u0644\u062a\u0647.",
    hadithTextEnglish:
      "It is reported that whoever says it in the evening has fulfilled the thanks owed for his night.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A81",
  },
  {
    id: "e-hm-82",
    category: "evening",
    orderIndex: 11,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u062f\u064e\u0646\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0633\u064e\u0645\u0652\u0639\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u0635\u064e\u0631\u0650\u064a\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064f\u0641\u0652\u0631\u0650 \u0648\u064e\u0627\u0644\u0652\u0641\u064e\u0642\u0652\u0631\u0650\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u0650 \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma \u02bf\u0101fin\u012b f\u012b badan\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b sam\u02bf\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b ba\u1e63ar\u012b, l\u0101 il\u0101ha ill\u0101 ant. All\u0101humma inn\u012b a\u02bf\u016bdhu bika mina \u2019l-kufri wal-faqr, wa a\u02bf\u016bdhu bika min \u02bfadh\u0101bil-qabr, l\u0101 il\u0101ha ill\u0101 ant.",
    translation:
      "O Allah, grant me wellbeing in my body. O Allah, preserve my hearing. O Allah, preserve my sight. None is worthy of worship but You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None is worthy of worship but You.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/324; Ahmad 5/42; An-Nasa\u2019i; Ibn as-Sunni; Al-Adab al-Mufrad; Hisn al-Muslim 82.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0639\u0644\u0651\u0645 \u0623\u0646 \u064a\u0642\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u062f\u0639\u0627\u0621 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062d\u064a\u0646 \u064a\u0645\u0633\u064a.",
    hadithTextEnglish:
      "The Prophet ﷺ taught that this supplication be said three times in the morning and three times in the evening.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A82",
  },
  {
    id: "e-hm-83",
    category: "evening",
    orderIndex: 13,
    arabicText:
      "\u062d\u064e\u0633\u0652\u0628\u0650\u064a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e\u060c \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650 \u062a\u064e\u0648\u064e\u0643\u0651\u064e\u0644\u0652\u062a\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0631\u064e\u0628\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0631\u0652\u0634\u0650 \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650.",
    transliteration:
      "\u1e24asbiyall\u0101hu l\u0101 il\u0101ha ill\u0101 huwa, \u02bfalayhi tawakkalt, wa huwa Rabbul-\u02bfArshil-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah is sufficient for me. None is worthy of worship but Him. Upon Him I rely, and He is the Lord of the Mighty Throne.",
    benefit: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Ibn as-Sunni no. 71; Abu Dawud 4/321; Hisn al-Muslim 83.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "عَنْ أَبِي الدَّرْدَاءِ رضي الله عنه قَالَ: مَنْ قَالَ إِذَا أَصْبَحَ وَإِذَا أَمْسَى: «حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ» سَبْعَ مَرَّاتٍ كَفَاهُ اللَّهُ مَا أَهَمَّهُ.",
    hadithTextEnglish:
      "Abu al-Darda’ (may Allah be pleased with him) said: Whoever says in the morning and in the evening: “Allah is sufficient for me; there is no god but He. On Him I rely, and He is the Lord of the Mighty Throne” seven times, Allah will suffice him in whatever troubles him.",
    authenticityNote: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A83",
  },
  {
    id: "e-hm-84",
    category: "evening",
    orderIndex: 10,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u0627\u0644\u062f\u0651\u064f\u0646\u0652\u064a\u064e\u0627 \u0648\u064e\u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u062f\u0650\u064a\u0646\u0650\u064a \u0648\u064e\u062f\u064f\u0646\u0652\u064a\u064e\u0627\u064a\u064e \u0648\u064e\u0623\u064e\u0647\u0652\u0644\u0650\u064a \u0648\u064e\u0645\u064e\u0627\u0644\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u0633\u0652\u062a\u064f\u0631\u0652 \u0639\u064e\u0648\u0652\u0631\u064e\u0627\u062a\u0650\u064a\u060c \u0648\u064e\u0622\u0645\u0650\u0646\u0652 \u0631\u064e\u0648\u0652\u0639\u064e\u0627\u062a\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0646\u0650\u064a \u0645\u0650\u0646\u0652 \u0628\u064e\u064a\u0652\u0646\u0650 \u064a\u064e\u062f\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0641\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u064a\u064e\u0645\u0650\u064a\u0646\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u0634\u0650\u0645\u064e\u0627\u0644\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0641\u064e\u0648\u0652\u0642\u0650\u064a\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0639\u064e\u0638\u064e\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0646\u0652 \u0623\u064f\u063a\u0652\u062a\u064e\u0627\u0644\u064e \u0645\u0650\u0646\u0652 \u062a\u064e\u062d\u0652\u062a\u0650\u064a.",
    transliteration:
      "All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata fid-duny\u0101 wal-\u0101khirah. All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata f\u012b d\u012bn\u012b wa duny\u0101ya wa ahl\u012b wa m\u0101l\u012b. All\u0101hummastur \u02bfawr\u0101t\u012b, wa \u0101min raw\u02bf\u0101t\u012b. All\u0101humma\u1e25fa\u1e93n\u012b min bayni yadayya, wa min khalf\u012b, wa \u02bfan yam\u012bn\u012b, wa \u02bfan shim\u0101l\u012b, wa min fawq\u012b, wa a\u02bf\u016bdhu bi\u02bfa\u1e93amatika an ught\u0101la min ta\u1e25t\u012b.",
    translation:
      "O Allah, I ask You for pardon and wellbeing in this world and the Hereafter. O Allah, I ask You for pardon and wellbeing in my religion, worldly life, family, and wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from in front, behind, my right, my left, and above; and I seek refuge in Your greatness from being taken from beneath me.",
    benefit: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud; Ibn Majah; Ahmad; An-Nasa\u2019i; Hisn al-Muslim 84.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رضي الله عنهما قَالَ: لَمْ يَكُنْ رَسُولُ اللَّهِ ﷺ يَدَعُ هَؤُلاَءِ الدَّعَوَاتِ حِينَ يُمْسِي وَحِينَ يُصْبِحُ: «اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي».",
    hadithTextEnglish:
      "‘Abdullah ibn ‘Umar (may Allah be pleased with them both) said: The Messenger of Allah ﷺ never left these supplications, evening and morning: “O Allah, I ask You for wellbeing in this world and the next. O Allah, I ask You for pardon and wellbeing in my religion, my worldly life, my family and my property. O Allah, conceal my faults and calm my fears. O Allah, guard me from before me and behind me, from my right and my left and from above me, and I seek refuge in Your greatness from being taken unawares from beneath me.”",
    authenticityNote: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A84",
  },
  {
    id: "e-hm-85",
    category: "evening",
    orderIndex: 12,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0644\u0650\u0645\u064e \u0627\u0644\u0652\u063a\u064e\u064a\u0652\u0628\u0650 \u0648\u064e\u0627\u0644\u0634\u0651\u064e\u0647\u064e\u0627\u062f\u064e\u0629\u0650\u060c \u0641\u064e\u0627\u0637\u0650\u0631\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650\u060c \u0631\u064e\u0628\u0651\u064e \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0648\u064e\u0645\u064e\u0644\u0650\u064a\u0643\u064e\u0647\u064f\u060c \u0623\u064e\u0634\u0652\u0647\u064e\u062f\u064f \u0623\u064e\u0646\u0652 \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0646\u064e\u0641\u0652\u0633\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u0634\u0650\u0631\u0652\u0643\u0650\u0647\u0650\u060c \u0648\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u062a\u064e\u0631\u0650\u0641\u064e \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0633\u064f\u0648\u0621\u064b\u0627\u060c \u0623\u064e\u0648\u0652 \u0623\u064e\u062c\u064f\u0631\u0651\u064e\u0647\u064f \u0625\u0650\u0644\u064e\u0649 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064d.",
    transliteration:
      "All\u0101humma \u02bf\u0101limal-ghaybi wash-shah\u0101dah, f\u0101\u1e6diras-sam\u0101w\u0101ti wal-ar\u1e0d, Rabba kulli shay\u2019in wa mal\u012bkah, ash-hadu an l\u0101 il\u0101ha ill\u0101 ant, a\u02bf\u016bdhu bika min sharri nafs\u012b, wa min sharrish-shay\u1e6d\u0101ni wa shirkih, wa an aqtarifa \u02bfal\u0101 nafs\u012b s\u016b\u2019an, aw ajurrahu il\u0101 Muslim.",
    translation:
      "O Allah, Knower of the unseen and the witnessed, Creator of the heavens and the earth, Lord and Sovereign of everything. I bear witness that none is worthy of worship but You. I seek refuge in You from the evil of myself, from the evil of Satan and his shirk, and from committing evil against myself or bringing it upon a Muslim.",
    benefit: "The Prophet ﷺ instructed Abu Bakr to say it morning, evening, and on going to bed.",
    benefitArabic: "أمر النبي ﷺ أبا بكر أن يقولها إذا أصبح وإذا أمسى وإذا أخذ مضجعه.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi; Abu Dawud 4/317; Hisn al-Muslim 85/109.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0623\u0628\u064a \u0628\u0643\u0631 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647: \u00ab\u0642\u064f\u0644\u0652\u0647\u064f \u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u062e\u064e\u0630\u0652\u062a\u064e \u0645\u064e\u0636\u0652\u062c\u064e\u0639\u064e\u0643\u064e\u00bb.",
    hadithTextEnglish:
      "The Prophet ﷺ said to Abu Bakr (may Allah be pleased with him): “Say it when you rise in the morning, when you reach the evening, and when you take to your bed.”",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Also appears in before-sleep adhkar.",
    sourceUrl: "https://sunnah.com/hisn%3A85",
  },
  {
    id: "e-hm-86",
    category: "evening",
    orderIndex: 8,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0644\u0627\u064e \u064a\u064e\u0636\u064f\u0631\u0651\u064f \u0645\u064e\u0639\u064e \u0627\u0633\u0652\u0645\u0650\u0647\u0650 \u0634\u064e\u064a\u0652\u0621\u064c \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0648\u064e\u0644\u0627\u064e \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0621\u0650\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f.",
    transliteration:
      "Bismill\u0101hilladh\u012b l\u0101 ya\u1e0durru ma\u02bfa ismihi shay\u2019un fil-ar\u1e0di wa l\u0101 fis-sam\u0101\u2019, wa huwas-Sam\u012b\u02bful-\u02bfAl\u012bm.",
    translation:
      "In the Name of Allah, with whose Name nothing in the earth or the heaven can harm, and He is the All-Hearing, All-Knowing.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/323; At-Tirmidhi 5/465; Ibn Majah; Ahmad; Hisn al-Muslim 86.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "عَنْ عُثْمَانَ بْنِ عَفَّانَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَا مِنْ عَبْدٍ يَقُولُ فِي صَبَاحِ كُلِّ يَوْمٍ وَمَسَاءِ كُلِّ لَيْلَةٍ: بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ، ثَلَاثَ مَرَّاتٍ، فَيَضُرَّهُ شَيْءٌ».",
    hadithTextEnglish:
      "‘Uthman ibn ‘Affan (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “No servant says, on the morning of every day and the evening of every night: In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing — three times — and anything then harms him.”",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A86",
  },
  {
    id: "e-hm-87",
    category: "evening",
    orderIndex: 15,
    arabicText:
      "\u0631\u064e\u0636\u0650\u064a\u062a\u064f \u0628\u0650\u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650 \u062f\u0650\u064a\u0646\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa \u0646\u064e\u0628\u0650\u064a\u0651\u064b\u0627.",
    transliteration:
      "Ra\u1e0d\u012btu bill\u0101hi Rabba, wa bil-Isl\u0101mi d\u012bna, wa bi-Mu\u1e25ammadin \ufdfa nabiyya.",
    translation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad \ufdfa as my Prophet.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Ahmad 4/337; An-Nasa\u2019i; Ibn as-Sunni; At-Tirmidhi 5/465; Hisn al-Muslim 87.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0643\u0627\u0646 \u062d\u0642\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0644\u0647 \u0623\u0646 \u064a\u0631\u0636\u064a\u0647 \u064a\u0648\u0645 \u0627\u0644\u0642\u064a\u0627\u0645\u0629.",
    hadithTextEnglish:
      "It is reported that whoever says it three times in the morning and three times in the evening, it is a right upon Allah to please him on the Day of Resurrection.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A87",
  },
  {
    id: "e-hm-88",
    category: "evening",
    orderIndex: 19,
    arabicText:
      "\u064a\u064e\u0627 \u062d\u064e\u064a\u0651\u064f \u064a\u064e\u0627 \u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f\u060c \u0628\u0650\u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0650\u064a\u062b\u064f\u060c \u0623\u064e\u0635\u0652\u0644\u0650\u062d\u0652 \u0644\u0650\u064a \u0634\u064e\u0623\u0652\u0646\u0650\u064a \u0643\u064f\u0644\u0651\u064e\u0647\u064f\u060c \u0648\u064e\u0644\u0627\u064e \u062a\u064e\u0643\u0650\u0644\u0652\u0646\u0650\u064a \u0625\u0650\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0637\u064e\u0631\u0652\u0641\u064e\u0629\u064e \u0639\u064e\u064a\u0652\u0646\u064d.",
    transliteration:
      "Y\u0101 \u1e24ayyu y\u0101 Qayy\u016bm, bira\u1e25matika astagh\u012bth, a\u1e63li\u1e25 l\u012b sha\u2019n\u012b kullah, wa l\u0101 takiln\u012b il\u0101 nafs\u012b \u1e6darfata \u02bfayn.",
    translation:
      "O Ever-Living, O Sustainer, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself even for the blink of an eye.",
    benefit: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Hakim; Al-Albani, Sahih al-Jami\u02bf; Hisn al-Muslim 88.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f \u0623\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0623\u0648\u0635\u0649 \u0641\u0627\u0637\u0645\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647\u0627 \u0623\u0646 \u062a\u0642\u0648\u0644 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d\u062a \u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u064a\u062a: \u00ab\u064a\u0627 \u062d\u064a \u064a\u0627 \u0642\u064a\u0648\u0645 \u0628\u0631\u062d\u0645\u062a\u0643 \u0623\u0633\u062a\u063a\u064a\u062b أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ\u00bb",
    hadithTextEnglish:
      "It is reported that the Prophet ﷺ counselled Fatimah (may Allah be pleased with her) to say, when she rose in the morning and when she reached the evening: “O Ever-Living, O Sustainer, by Your mercy I seek help. Set right all my affairs, and do not entrust me to myself for the blink of an eye.”",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A88",
  },
  {
    id: "e-hm-89e",
    category: "evening",
    orderIndex: 3,
    arabicText:
      "\u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0645\u0652\u0633\u064e\u0649 \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0647\u064e\u0630\u0650\u0647\u0650 \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u064e\u0629\u0650: \u0641\u064e\u062a\u0652\u062d\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0646\u064e\u0635\u0652\u0631\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0646\u064f\u0648\u0631\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0628\u064e\u0631\u064e\u0643\u064e\u062a\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0647\u064f\u062f\u064e\u0627\u0647\u064e\u0627\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a\u0647\u064e\u0627 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064e\u0627.",
    transliteration:
      "Amsayn\u0101 wa amsal-mulku lill\u0101hi Rabbil-\u02bf\u0101lam\u012bn. All\u0101humma inn\u012b as\u2019aluka khayra h\u0101dhihi \u2019l-laylah: fat\u1e25ah\u0101, wa na\u1e63rah\u0101, wa n\u016brah\u0101, wa barakatah\u0101, wa hud\u0101h\u0101, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012bh\u0101 wa sharri m\u0101 ba\u02bfdah\u0101.",
    translation:
      "We have entered the evening, and dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this night: its opening, victory, light, blessing, and guidance; and I seek refuge in You from the evil within it and the evil after it.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/322; Hisn al-Muslim 89.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رضي الله عنه قَالَ: كَانَ نَبِيُّ اللَّهِ ﷺ إِذَا أَمْسَى قَالَ: «أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ، وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ، وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ، وَعَذَابٍ فِي الْقَبْرِ».",
    hadithTextEnglish:
      "‘Abdullah ibn Mas‘ud (may Allah be pleased with him) said: When evening came, the Prophet of Allah ﷺ would say: “We have reached the evening, and the dominion has reached the evening belonging to Allah. Praise be to Allah. There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things. My Lord, I ask You for the good of this night and the good that follows it, and I seek refuge in You from the evil of this night and the evil that follows it. My Lord, I seek refuge in You from idleness and the misery of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.”",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A89",
  },
  {
    id: "e-hm-90e",
    category: "evening",
    orderIndex: 16,
    arabicText:
      "\u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0641\u0650\u0637\u0652\u0631\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0643\u064e\u0644\u0650\u0645\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u062e\u0652\u0644\u0627\u064e\u0635\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u062f\u0650\u064a\u0646\u0650 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0645\u0650\u0644\u0651\u064e\u0629\u0650 \u0623\u064e\u0628\u0650\u064a\u0646\u064e\u0627 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e\u060c \u062d\u064e\u0646\u0650\u064a\u0641\u064b\u0627 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064b\u0627\u060c \u0648\u064e\u0645\u064e\u0627 \u0643\u064e\u0627\u0646\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0645\u064f\u0634\u0652\u0631\u0650\u0643\u0650\u064a\u0646\u064e.",
    transliteration:
      "Amsayn\u0101 \u02bfal\u0101 fi\u1e6dratil-Isl\u0101m, wa \u02bfal\u0101 kalimatil-ikhl\u0101\u1e63, wa \u02bfal\u0101 d\u012bni nabiyyin\u0101 Mu\u1e25ammadin \ufdfa, wa \u02bfal\u0101 millati ab\u012bn\u0101 Ibr\u0101h\u012bm, \u1e25an\u012bfan Musliman, wa m\u0101 k\u0101na minal-mushrik\u012bn.",
    translation:
      "We have entered the evening upon the natural religion of Islam, the word of sincerity, the religion of our Prophet Muhammad \ufdfa, and the way of our father Ibrahim, upright and Muslim, and he was not of the polytheists.",
    benefit: "Included in Hisn al-Muslim; grading not displayed on the Sunnah.com page.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Ahmad 3/406-407 and 5/123; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 34; At-Tirmidhi 4/209; Hisn al-Muslim 90.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "عَنْ عَبْدِ الرَّحْمَنِ بْنِ أَبْزَى رضي الله عنه عَنِ النَّبِيِّ ﷺ أَنَّهُ كَانَ يَقُولُ إِذَا أَصْبَحَ وَإِذَا أَمْسَى: «أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ».",
    hadithTextEnglish:
      "‘Abd al-Rahman ibn Abza (may Allah be pleased with him) reported from the Prophet ﷺ that he used to say, morning and evening: “We have reached the evening upon the natural way of Islam, upon the word of sincerity, upon the religion of our Prophet Muhammad ﷺ, and upon the creed of our father Ibrahim, upright and submitting; and he was not among those who associate others with Allah.”",
    authenticityNote: "Included in Hisn al-Muslim; grading not displayed on the Sunnah.com page.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A90",
  },
  {
    id: "e-hm-91",
    category: "evening",
    orderIndex: 20,
    arabicText:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650.",
    transliteration: "Sub\u1e25\u0101nall\u0101hi wa bi\u1e25amdih.",
    translation: "Glory and praise be to Allah.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari 4/2071; Hisn al-Muslim 91.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e \u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650 \u0641\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064d \u0645\u0650\u0627\u0626\u064e\u0629\u064e \u0645\u064e\u0631\u0651\u064e\u0629\u064d \u062d\u064f\u0637\u0651\u064e\u062a\u0652 \u062e\u064e\u0637\u064e\u0627\u064a\u064e\u0627\u0647\u064f \u0648\u064e\u0625\u0650\u0646\u0652 \u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0645\u0650\u062b\u0652\u0644\u064e \u0632\u064e\u0628\u064e\u062f\u0650 \u0627\u0644\u0652\u0628\u064e\u062d\u0652\u0631\u0650\u00bb\u060c \u0648\u0648\u0631\u062f \u0641\u0636\u0644\u0647\u0627 \u0635\u0628\u0627\u062d\u064b\u0627 \u0648\u0645\u0633\u0627\u0621\u064b.",
    hadithTextEnglish:
      "The Prophet ﷺ said: “Whoever says: Glory be to Allah and praise be to Him — a hundred times in a day, his sins are wiped away, even were they like the foam of the sea.” Its merit is likewise reported morning and evening.",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A91",
  },
  {
    id: "e-hm-92",
    category: "evening",
    orderIndex: 21,
    arabicText:
      "\u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c.",
    transliteration:
      "L\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br.",
    translation:
      "None is worthy of worship but Allah alone, without partner. His is the dominion and praise, and He is able to do all things.",
    benefit:
      "Said 100 times in a day: the reward of freeing ten slaves, 100 good deeds recorded, 100 sins erased, and a shield from Satan until evening.",
    benefitArabic:
      "من قالها مائة مرة في يومه: عدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حِرزًا من الشيطان حتى يمسي.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari 3293; Muslim 2691; Hisn al-Muslim 92–93.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0639\u0646 \u0623\u0628\u064a \u0647\u0631\u064a\u0631\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647 \u0623\u0646 \u0631\u0633\u0648\u0644 \u0627\u0644\u0644\u0647 \ufdfa \u0642\u0627\u0644: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e: \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c\u060c \u0641\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064d \u0645\u0650\u0627\u0626\u064e\u0629\u064e \u0645\u064e\u0631\u0651\u064e\u0629\u064d\u060c \u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0644\u064e\u0647\u064f \u0639\u064e\u062f\u0652\u0644\u064e \u0639\u064e\u0634\u0652\u0631\u0650 \u0631\u0650\u0642\u064e\u0627\u0628\u064d\u060c \u0648\u064e\u0643\u064f\u062a\u0650\u0628\u064e\u062a\u0652 \u0644\u064e\u0647\u064f \u0645\u0650\u0627\u0626\u064e\u0629\u064f \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064d\u060c \u0648\u064e\u0645\u064f\u062d\u0650\u064a\u064e\u062a\u0652 \u0639\u064e\u0646\u0652\u0647\u064f \u0645\u0650\u0627\u0626\u064e\u0629\u064f \u0633\u064e\u064a\u0651\u0650\u0626\u064e\u0629\u064d\u060c \u0648\u064e\u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0644\u064e\u0647\u064f \u062d\u0650\u0631\u0652\u0632\u064b\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u064a\u064e\u0648\u0652\u0645\u064e\u0647\u064f \u0630\u064e\u0644\u0650\u0643\u064e \u062d\u064e\u062a\u0651\u064e\u0649 \u064a\u064f\u0645\u0652\u0633\u0650\u064a\u064e\u060c \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064e\u0623\u0652\u062a\u0650 \u0623\u064e\u062d\u064e\u062f\u064c \u0628\u0650\u0623\u064e\u0641\u0652\u0636\u064e\u0644\u064e \u0645\u0650\u0645\u0651\u064e\u0627 \u062c\u064e\u0627\u0621\u064e \u0628\u0650\u0647\u0650 \u0625\u0650\u0644\u0651\u064e\u0627 \u0623\u064e\u062d\u064e\u062f\u064c \u0639\u064e\u0645\u0650\u0644\u064e \u0623\u064e\u0643\u0652\u062b\u064e\u0631\u064e \u0645\u0650\u0646\u0652 \u0630\u064e\u0644\u0650\u0643\u064e\u00bb.",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever says: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — a hundred times in a day, it is for him the equal of freeing ten slaves, a hundred good deeds are written for him, a hundred sins are erased from him, and it is a protection for him from Satan for that day until evening; and no one brings anything better than what he brought, except one who does more than that.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Same wording as HM-93 but different count and virtue.",
    sourceUrl: "https://sunnah.com/hisn%3A92",
  },
  {
    id: "e-hm-96",
    category: "evening",
    orderIndex: 22,
    arabicText:
      "\u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0648\u064e\u0623\u064e\u062a\u064f\u0648\u0628\u064f \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650.",
    transliteration: "Astaghfirull\u0101ha wa at\u016bbu ilayh.",
    translation: "I seek Allah\u2019s forgiveness and repent to Him.",
    benefit: "Hisn notes: recite 100 times during the day.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari; Muslim 4/2075; Hisn al-Muslim 96.",
    preferredTiming: "During the day; suitable to include in morning/evening routine.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0642\u0648\u0644 \u0641\u064a \u0627\u0644\u0645\u062c\u0644\u0633 \u0627\u0644\u0648\u0627\u062d\u062f: \u00ab\u0631\u064e\u0628\u0651\u0650 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0648\u064e\u062a\u064f\u0628\u0652 \u0639\u064e\u0644\u064e\u064a\u0651\u064e \u0625\u0650\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u062a\u0651\u064e\u0648\u0651\u064e\u0627\u0628\u064f \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u064f\u00bb \u0645\u0631\u0627\u062a \u0643\u062b\u064a\u0631\u0629\u060c \u0648\u0648\u0631\u062f \u0639\u0646\u0647 \u0627\u0644\u0627\u0633\u062a\u063a\u0641\u0627\u0631 \u0645\u0627\u0626\u0629 \u0645\u0631\u0629 \u0641\u064a \u0627\u0644\u064a\u0648\u0645.",
    hadithTextEnglish:
      "The Prophet ﷺ would say in a single sitting: “My Lord, forgive me and accept my repentance; You are the Ever-Relenting, the Merciful” many times over; and it is reported of him that he sought forgiveness a hundred times a day.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Hisn notes: recite 100 times during the day.",
    sourceUrl: "https://sunnah.com/hisn%3A96",
  },
  {
    id: "e-hm-97",
    category: "evening",
    orderIndex: 9,
    arabicText:
      "\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e\u0644\u0650\u0645\u064e\u0627\u062a\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u062a\u0651\u064e\u0627\u0645\u0651\u064e\u0627\u062a\u0650 \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u062e\u064e\u0644\u064e\u0642\u064e.",
    transliteration: "A\u02bf\u016bdhu bikalim\u0101ti-ll\u0101hit-t\u0101mm\u0101ti min sharri m\u0101 khalaq.",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He created.",
    benefit: "Sahih/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Ahmad 2/290; An-Nasa\u2019i; At-Tirmidhi 3/187; Ibn as-Sunni; Hisn al-Muslim 97.",
    preferredTiming: "In the evening.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ رَجُلاً جَاءَ إِلَى النَّبِيِّ ﷺ فَقَالَ: يَا رَسُولَ اللَّهِ مَا لَقِيتُ مِنْ عَقْرَبٍ لَدَغَتْنِي الْبَارِحَةَ، قَالَ: «أَمَا لَوْ قُلْتَ حِينَ أَمْسَيْتَ: أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ، لَمْ تَضُرَّكَ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that a man came to the Prophet ﷺ and said: Messenger of Allah, what I suffered last night from a scorpion that stung me! He said: “Had you said, when you reached the evening: I seek refuge in the perfect words of Allah from the evil of what He has created — it would not have harmed you.”",
    authenticityNote: "Sahih/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A97",
  },
  {
    id: "e-hm-98",
    category: "evening",
    orderIndex: 23,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0635\u064e\u0644\u0651\u0650 \u0648\u064e\u0633\u064e\u0644\u0651\u0650\u0645\u0652 \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d.",
    transliteration: "All\u0101humma \u1e63alli wa sallim \u02bfal\u0101 nabiyyin\u0101 Mu\u1e25ammad.",
    translation: "O Allah, send prayers and peace upon our Prophet Muhammad.",
    benefit: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 10,
    countLabel: "10",
    sourceReference: "At-Tabarani; Haythami Majma\u02bf az-Zawa\u2019id 10/120; Hisn al-Muslim 98.",
    preferredTiming: "Morning and evening.",
    hadithText:
      "عَنْ أَبِي الدَّرْدَاءِ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ صَلَّى عَلَيَّ حِينَ يُصْبِحُ عَشْرًا، وَحِينَ يُمْسِي عَشْرًا، أَدْرَكَتْهُ شَفَاعَتِي يَوْمَ الْقِيَامَةِ».",
    hadithTextEnglish:
      "Abu al-Darda’ (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Whoever sends blessings upon me ten times in the morning and ten times in the evening, my intercession will reach him on the Day of Resurrection.”",
    authenticityNote: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A98",
  },
];

const SLEEP_AZKAR: ZikrDraft[] = [
  {
    id: "s-hm-99-ikhlas",
    category: "before_sleep",
    orderIndex: 2,
    isSurah: true,
    surahNameArabic: "الإِخْلَاص",
    surahNameEnglish: "Al-Ikhlas",
    surahType: "مكية",
    verseCount: 4,
    hasBasmalah: true,
    arabicText:
      "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾﴾",
    transliteration: "Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.",
    translation:
      "Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
    benefit:
      "Gathers palms, blows lightly into them, recites the 3 Surahs, then wipes over as much of the body as possible. Repeated 3 times.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sahih al-Bukhari 5017; Sahih Muslim 2192; Hisn al-Muslim 99.",
    preferredTiming: "Before sleeping, after lying down.",
    hadithText:
      "عَنْ عَائِشَةَ رضي الله عنها أَنَّ النَّبِيَّ ﷺ كَانَ إِذَا أَوَى إِلَى فِرَاشِهِ كُلَّ لَيْلَةٍ جَمَعَ كَفَّيْهِ ثُمَّ نَفَثَ فِيهِمَا فَقَرَأَ فِيهِمَا: «قُلْ هُوَ اللَّهُ أَحَدٌ» وَ«قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ» وَ«قُلْ أَعُوذُ بِرَبِّ النَّاسِ» يَبْدَأُ بِهِمَا عَلَى رَأْسِهِ وَوَجْهِهِ وَمَا أَقْبَلَ مِنْ جَسَدِهِ، يَفْعَلُ ذَلِكَ ثَلَاثَ مَرَّاتٍ، ثُمَّ يَمْسَحُ بِهِمَا مَا اسْتَطَاعَ مِنْ جَسَدِهِ.",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that when the Prophet ﷺ went to his bed each night, he would cup his hands together, breathe into them, and recite into them: “Say: He is Allah, One”, “Say: I seek refuge in the Lord of daybreak”, and “Say: I seek refuge in the Lord of mankind”. Then he would begin with them over his head and his face and the front of his body, doing that three times, and wiping with them as much of his body as he could.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-99-falaq",
    category: "before_sleep",
    orderIndex: 3,
    isSurah: true,
    surahNameArabic: "الفَلَق",
    surahNameEnglish: "Al-Falaq",
    surahType: "مكية",
    verseCount: 5,
    hasBasmalah: true,
    arabicText:
      "﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾﴾",
    transliteration:
      "Qul a'udhu birabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
    translation:
      "Say: I seek refuge in the Lord of daybreak from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.",
    benefit:
      "Protection at bedtime: recited with al-Ikhlas and an-Nas, blowing into the palms and wiping over the body, three times.",
    benefitArabic: "تحصين عند النوم: تُقرأ مع الإخلاص والناس، ويَنفث في كفيه ويمسح بهما جسده ثلاث مرات.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sahih al-Bukhari 5017; Sahih Muslim 2192; Hisn al-Muslim 99.",
    preferredTiming: "Before sleeping, after lying down.",
    hadithText:
      "عَنْ عَائِشَةَ رضي الله عنها أَنَّ النَّبِيَّ ﷺ كَانَ إِذَا أَوَى إِلَى فِرَاشِهِ كُلَّ لَيْلَةٍ جَمَعَ كَفَّيْهِ ثُمَّ نَفَثَ فِيهِمَا فَقَرَأَ فِيهِمَا الْمُعَوِّذَاتِ، ثُمَّ يَمْسَحُ بِهِمَا مَا اسْتَطَاعَ مِنْ جَسَدِهِ.",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that when the Prophet ﷺ went to his bed each night, he would cup his hands together, breathe into them, recite the suras of refuge into them, and then wipe with them as much of his body as he could.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-99-nas",
    category: "before_sleep",
    orderIndex: 4,
    isSurah: true,
    surahNameArabic: "النَّاس",
    surahNameEnglish: "An-Nas",
    surahType: "مكية",
    verseCount: 6,
    hasBasmalah: true,
    arabicText:
      "﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾﴾",
    transliteration:
      "Qul a'udhu birabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
    translation:
      "Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer who whispers into the breasts of mankind, from among the jinn and mankind.",
    benefit:
      "Protection at bedtime: recited with al-Ikhlas and al-Falaq, blowing into the palms and wiping over the body, three times.",
    benefitArabic: "تحصين عند النوم: تُقرأ مع الإخلاص والفلق، ويَنفث في كفيه ويمسح بهما جسده ثلاث مرات.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sahih al-Bukhari 5017; Sahih Muslim 2192; Hisn al-Muslim 99.",
    preferredTiming: "Before sleeping, after lying down.",
    hadithText:
      "عَنْ عَائِشَةَ رضي الله عنها أَنَّ النَّبِيَّ ﷺ كَانَ إِذَا أَوَى إِلَى فِرَاشِهِ كُلَّ لَيْلَةٍ جَمَعَ كَفَّيْهِ ثُمَّ نَفَثَ فِيهِمَا فَقَرَأَ فِيهِمَا الْمُعَوِّذَاتِ، ثُمَّ يَمْسَحُ بِهِمَا مَا اسْتَطَاعَ مِنْ جَسَدِهِ.",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that when the Prophet ﷺ went to his bed each night, he would cup his hands together, breathe into them, recite the suras of refuge into them, and then wipe with them as much of his body as he could.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-100",
    category: "before_sleep",
    orderIndex: 0,
    hasSeekRefuge: true,
    surahNameArabic: "البَقَرَة (آيَةُ الكُرْسِيِّ)",
    surahNameEnglish: "Al-Baqarah (Ayah Al-Kursi)",
    arabicText:
      "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾",
    transliteration:
      "Allahu la ilaha illa huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi'idhnih, ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bishay'im-min 'ilmihi illa bima sha', wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'Aliyyul-'Azim.",
    translation:
      "Allah—there is none worthy of worship except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and earth. None can intercede except by His permission. He knows what is before and behind them; they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and earth, and preserving them does not tire Him. He is the Most High, the Magnificent.",
    benefit:
      "Whoever recites it when lying down to sleep, a guardian from Allah will remain with him and no devil will approach him until morning.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 2311; Hisn al-Muslim 100.",
    preferredTiming: "When lying down to sleep.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه فِي قِصَّةِ الصَّدَقَةِ: دَعْنِي أُعَلِّمْكَ كَلِمَاتٍ يَنْفَعُكَ اللَّهُ بِهَا، قُلْتُ: مَا هِيَ؟ قَالَ: إِذَا أَوَيْتَ إِلَى فِرَاشِكَ فَاقْرَأْ آيَةَ الْكُرْسِيِّ -اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ- حَتَّى تَخْتِمَ الْآيَةَ، فَإِنَّهُ لَنْ يَزَالَ عَلَيْكَ مِنَ اللَّهِ حَافِظٌ وَلاَ يَقْرَبُكَ شَيْطَانٌ حَتَّى تُصْبِحَ. فَقَالَ النَّبِيُّ ﷺ: «صَدَقَكَ وَهُوَ كَذُوبٌ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported, in the account of the charity: “Let me teach you words by which Allah will benefit you.” I said: What are they? He said: When you go to your bed, recite Ayat al-Kursi — “Allah, there is no god but He, the Ever-Living, the Sustainer” — to the end of the verse; a guardian from Allah will remain over you and no devil will come near you until morning. The Prophet ﷺ said: “He told you the truth, though he is a liar.”",
    authenticityNote: "Sahih al-Bukhari.",
  },
  {
    id: "s-hm-101",
    category: "before_sleep",
    orderIndex: 1,
    hasSeekRefuge: true,
    surahNameArabic: "البَقَرَة (٢٨٥ - ٢٨٦)",
    surahNameEnglish: "Al-Baqarah (285-286)",
    arabicText:
      "﴿آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ﴿٢٨٥﴾ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ﴿٢٨٦﴾﴾",
    transliteration: "Amanar-Rasulu bima unzila ilayhi mir-Rabbihi wal-mu'minun... fan-surna 'alal-qawmil-kafirin.",
    translation:
      "The Messenger believes in what was sent down to him from his Lord, and so do the believers... so grant us victory over the disbelieving people.",
    benefit: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 5009; Sahih Muslim 807; Hisn al-Muslim 101.",
    preferredTiming: "At night before sleeping.",
    hadithText:
      "عَنْ أَبِي مَسْعُودٍ رضي الله عنه قَالَ: قَالَ النَّبِيُّ ﷺ: «مَنْ قَرَأَ بِالآيَتَيْنِ مِنْ آخِرِ سُورَةِ الْبَقَرَةِ فِي لَيْلَةٍ كَفَتَاهُ».",
    hadithTextEnglish:
      "Abu Mas‘ud (may Allah be pleased with him) said: The Prophet ﷺ said: “Whoever recites the two verses from the end of Surat al-Baqarah at night, they will suffice him.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-109a",
    category: "before_sleep",
    orderIndex: 5,
    isSurah: true,
    surahNameArabic: "الكَافِرُون",
    surahNameEnglish: "Al-Kafirun",
    surahType: "مكية",
    verseCount: 6,
    hasBasmalah: true,
    arabicText:
      "﴿قُلْ يَا أَيُّهَا الْكَافِرُونَ ﴿١﴾ لَا أَعْبُدُ مَا تَعْبُدُونَ ﴿٢﴾ وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ ﴿٣﴾ وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ ﴿٤﴾ وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ ﴿٥﴾ لَكُمْ دِينُكُمْ وَلِيَ دِينِ ﴿٦﴾﴾",
    transliteration:
      "Qul ya ayyuhal-kafirun. La a'budu ma ta'budun. Wa la antum 'abiduna ma a'bud. Wa la ana 'abidum-ma 'abadtum. Wa la antum 'abiduna ma a'bud. Lakum dinukum wa liya din.",
    translation:
      "Say: O disbelievers! I do not worship what you worship, nor do you worship what I worship... To you be your religion, and to me my religion.",
    benefit: "Reciting Surah Al-Kafirun before sleeping is a disavowal and immunity from shirk (polytheism).",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 5055; Jami' at-Tirmidhi 3403.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عن نَوْفَلٍ الأَشْجَعِيِّ رضي الله عنه أن النبي ﷺ قال له: «اقْرَأْ: ﴿قُلْ يَا أَيُّهَا الْكَافِرُونَ﴾ ثُمَّ نَمْ عَلَى خَاتِمَتِهَا، فَإِنَّهَا بَرَاءَةٌ مِنَ الشِّرْكِ».",
    hadithTextEnglish:
      "Nawfal al-Ashja‘i (may Allah be pleased with him) reported that the Prophet ﷺ said to him: “Recite: ‘Say: O you who disbelieve’, then sleep upon its ending, for it is a declaration of freedom from associating others with Allah.”",
    authenticityNote: "Graded Sahih by al-Albani.",
  },
  {
    id: "s-hm-110a",
    category: "before_sleep",
    orderIndex: 6,
    isSurah: true,
    surahNameArabic: "السَّجْدَة",
    surahNameEnglish: "As-Sajdah",
    surahType: "مكية",
    verseCount: 30,
    mushafPages: [
      { page: 415, startAyah: 1, endAyah: 11 },
      { page: 416, startAyah: 12, endAyah: 20 },
      { page: 417, startAyah: 21, endAyah: 30 },
    ],
    hasBasmalah: true,
    arabicText:
      "﴿الم ﴿١﴾ تَنْزِيلُ الْكِتَابِ لَا رَيْبَ فِيهِ مِنْ رَبِّ الْعَالَمِينَ ﴿٢﴾ أَمْ يَقُولُونَ افْتَرَاهُ ۚ بَلْ هُوَ الْحَقُّ مِنْ رَبِّكَ لِتُنْذِرَ قَوْمًا مَا أَتَاهُمْ مِنْ نَذِيرٍ مِنْ قَبْلِكَ لَعَلَّهُمْ يَهْتَدُونَ ﴿٣﴾ اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ وَمَا بَيْنَهُمَا فِي سِتَّةِ أَيَّامٍ ثُمَّ اسْتَوَىٰ عَلَى الْعَرْشِ ۖ مَا لَكُمْ مِنْ دُونِهِ مِنْ وَلِيٍّ وَلَا شَفِيعٍ ۚ أَفَلَا تَتَذَكَّرُونَ ﴿٤﴾ يُدَبِّرُ الْأَمْرَ مِنَ السَّمَاءِ إِلَى الْأَرْضِ ثُمَّ يَعْرُجُ إِلَيْهِ فِي يَوْمٍ كَانَ مِقْدَارُهُ أَلْفَ سَنَةٍ مِمَّا تَعُدُّونَ ﴿٥﴾ ذَٰلِكَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ الْعَزِيزُ الرَّحِيمُ ﴿٦﴾ الَّذِي أَحْسَنَ كُلَّ شَيْءٍ خَلَقَهُ ۖ وَبَدَأَ خَلْقَ الْإِنْسَانِ مِنْ طِينٍ ﴿٧﴾ ثُمَّ جَعَلَ نَسْلَهُ مِنْ سُلَالَةٍ مِنْ مَاءٍ مَهِينٍ ﴿٨﴾ ثُمَّ سَوَّاهُ وَنَفَخَ فِيهِ مِنْ رُوحِهِ ۖ وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ ۚ قَلِيلًا مَا تَشْكُرُونَ ﴿٩﴾ وَقَالُوا أَإِذَا ضَلَلْنَا فِي الْأَرْضِ أَإِنَّا لَفِي خَلْقٍ جَدِيدٍ ۚ بَلْ هُمْ بِلِقَاءِ رَبِّهِمْ كَافِرُونَ ﴿١٠﴾ قُلْ يَتَوَفَّاكُمْ مَلَكُ الْمَوْتِ الَّذِي وُكِّلَ بِكُمْ ثُمَّ إِلَىٰ رَبِّكُمْ تُرْجَعُونَ ﴿١١﴾ وَلَوْ تَرَىٰ إِذِ الْمُجْرِمُونَ نَاكِسُو رُؤُوسِهِمْ عِنْدَ رَبِّهِمْ رَبَّنَا أَبْصَرْنَا وَسَمِعْنَا فَارْجِعْنَا نَعْمَلْ صَالِحًا إِنَّا مُوقِنُونَ ﴿١٢﴾ وَلَوْ شِئْنَا لَآتَيْنَا كُلَّ نَفْسٍ هُدَاهَا وَلَٰكِنْ حَقَّ الْقَوْلُ مِنِّي لَأَمْلَأَنَّ جَهَنَّمَ مِنَ الْجِنَّةِ وَالنَّاسِ أَجْمَعِينَ ﴿١٣﴾ فَذُوقُوا بِمَا نَسِيتُمْ لِقَاءَ يَوْمِكُمْ هَٰذَا إِنَّا نَسِينَاكُمْ ۖ وَذُوقُوا عَذَابَ الْخُلْدِ بِمَا كُنْتُمْ تَعْمَلُونَ ﴿١٤﴾ إِنَّمَا يُؤْمِنُ بِآيَاتِنَا الَّذِينَ إِذَا ذُكِّرُوا بِهَا خَرُّوا سُجَّدًا وَسَبَّحُوا بِحَمْدِ رَبِّهِمْ وَهُمْ لَا يَسْتَكْبِرُونَ ۩ ﴿١٥﴾ تَتَجَافَىٰ جُنُوبُهُمْ عَنِ الْمَضَاجِعِ يَدْعُونَ رَبَّهُمْ خَوْفًا وَطَمَعًا وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ ﴿١٦﴾ فَلَا تَعْلَمُ نَفْسٌ مَا أُخْفِيَ لَهُمْ مِنْ قُرَّةِ أَعْيُنٍ جَزَاءً بِمَا كَانُوا يَعْمَلُونَ ﴿١٧﴾ أَفَمَنْ كَانَ مُؤْمِنًا كَمَنْ كَانَ فَاسِقًا ۚ لَا يَسْتَوُونَ ﴿١٨﴾ أَمَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ فَلَهُمْ جَنَّاتُ الْمَأْوَىٰ نُزُلًا بِمَا كَانُوا يَعْمَلُونَ ﴿١٩﴾ وَأَمَّا الَّذِينَ فَسَقُوا فَمَأْوَاهُمُ النَّارُ ۖ كُلَّمَا أَرَادُوا أَنْ يَخْرُجُوا مِنْهَا أُعِيدُوا فِيهَا وَقِيلَ لَهُمْ ذُوقُوا عَذَابَ النَّارِ الَّذِي كُنْتُمْ بِهِ تُكَذِّبُونَ ﴿٢٠﴾ وَلَنُذِيقَنَّهُمْ مِنَ الْعَذَابِ الْأَدْنَىٰ دُونَ الْعَذَابِ الْأَكْبَرِ لَعَلَّهُمْ يَرْجِعُونَ ﴿٢١﴾ وَمَنْ أَظْلَمُ مِمَّنْ ذُكِّرَ بِآيَاتِ رَبِّهِ ثُمَّ أَعْرَضَ عَنْهَا ۚ إِنَّا مِنَ الْمُجْرِمِينَ مُنْتَقِمُونَ ﴿٢٢﴾ وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ فَلَا تَكُنْ فِي مِرْيَةٍ مِنْ لِقَائِهِ ۖ وَجَعَلْنَاهُ هُدًى لِبَنِي إِسْرَائِيلَ ﴿٢٣﴾ وَجَعَلْنَا مِنْهُمْ أَئِمَّةً يَهْدُونَ بِأَمْرِنَا لَمَّا صَبَرُوا ۖ وَكَانُوا بِآيَاتِنَا يُوقِنُونَ ﴿٢٤﴾ إِنَّ رَبَّكَ هُوَ يَفْصِلُ بَيْنَهُمْ يَوْمَ الْقِيَامَةِ فِيمَا كَانُوا فِيهِ يَخْتَلِفُونَ ﴿٢٥﴾ أَوَلَمْ يَهْدِ لَهُمْ كَمْ أَهْلَكْنَا مِنْ قَبْلِهِمْ مِنَ الْقُرُونِ يَمْشُونَ فِي مَسَاكِنِهِمْ ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ ۖ أَفَلَا يَسْمَعُونَ ﴿٢٦﴾ أَوَلَمْ يَرَوْا أَنَّا نَسُوقُ الْمَاءَ إِلَى الْأَرْضِ الْجُرُزِ فَنُخْرِجُ بِهِ زَرْعًا تَأْكُلُ مِنْهُ أَنْعَامُهُمْ وَأَنْفُسُهُمْ ۖ أَفَلَا يُبْصِرُونَ ﴿٢٧﴾ وَيَقُولُونَ مَتَىٰ هَٰذَا الْفَتْحُ إِنْ كُنْتُمْ صَادِقِينَ ﴿٢٨﴾ قُلْ يَوْمَ الْفَتْحِ لَا يَنْفَعُ الَّذِينَ كَفَرُوا إِيمَانُهُمْ وَلَا هُمْ يُنْظَرُونَ ﴿٢٩﴾ فَأَعْرِضْ عَنْهُمْ وَانْتَظِرْ إِنَّهُمْ مُنْتَظِرُونَ ﴿٣٠﴾﴾",
    transliteration: "Alif-Lam-Mim. Tanzilul-Kitabi la rayba fihi mir-Rabbil-'alamin...",
    translation: "Alif-Lam-Mim. The revelation of the Book is without doubt from the Lord of the worlds...",
    benefit: "The Prophet ﷺ would not sleep until he recited Surah As-Sajdah and Surah Al-Mulk.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 2892; Sunan an-Nasa'i 10043.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عن جابر رضي الله عنه أَنَّ النَّبِيَّ ﷺ كَانَ لَا يَنَامُ حَتَّى يَقْرَأَ ﴿الم * تَنْزِيلُ﴾ السَّجْدَةَ، وَ ﴿تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ﴾.",
    hadithTextEnglish:
      "Jabir (may Allah be pleased with him) reported that the Prophet ﷺ would not sleep until he had recited “Alif Lam Mim — The revelation” (as-Sajdah) and “Blessed is He in whose hand is the dominion” (al-Mulk).",
    authenticityNote: "Graded Sahih by al-Albani.",
  },
  {
    id: "s-hm-110b",
    category: "before_sleep",
    orderIndex: 7,
    isSurah: true,
    surahNameArabic: "الْمُلْك",
    surahNameEnglish: "Al-Mulk (Tabarak)",
    surahType: "مكية",
    verseCount: 30,
    mushafPages: [
      { page: 562, startAyah: 1, endAyah: 12 },
      { page: 563, startAyah: 13, endAyah: 26 },
      { page: 564, startAyah: 27, endAyah: 30 },
    ],
    hasBasmalah: true,
    arabicText:
      "﴿تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿١﴾ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ ﴿٢﴾ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِنْ تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِنْ فُطُورٍ ﴿٣﴾ ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنْقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ ﴿٤﴾ وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ ﴿٥﴾ وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ ﴿٦﴾ إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ ﴿٧﴾ تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ ﴿٨﴾ قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِنْ شَيْءٍ إِنْ أَنْتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ ﴿٩﴾ وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ ﴿١٠﴾ فَاعْتَرَفُوا بِذَنْبِهِمْ فَسُحْقًا لِأَصْحَابِ السَّعِيرِ ﴿١١﴾ إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُمْ بِالْغَيْبِ لَهُمْ مَغْفِرَةٌ وَأَجْرٌ كَبِيرٌ ﴿١٢﴾ وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ ۖ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ ﴿١٣﴾ أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ ﴿١٤﴾ هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِنْ رِزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ ﴿١٥﴾ أَأَمِنْتُمْ مَنْ فِي السَّمَاءِ أَنْ يَخْسِفَ بِكُمُ الْأَرْضَ فَإِذَا هِيَ تَمُورُ ﴿١٦﴾ أَمْ أَمِنْتُمْ مَنْ فِي السَّمَاءِ أَنْ يُرْسِلَ عَلَيْكُمْ حَاصِبًا ۖ فَسَتَعْلَمُونَ كَيْفَ نَذِيرِ ﴿١٧﴾ وَلَقَدْ كَذَّبَ الَّذِينَ مِنْ قَبْلِهِمْ فَكَيْفَ كَانَ نَكِيرِ ﴿١٨﴾ أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا الرَّحْمَٰنُ ۚ إِنَّهُ بِكُلِّ شَيْءٍ بَصِيرٌ ﴿١٩﴾ أَمَّنْ هَٰذَا الَّذِي هُوَ جُنْدٌ لَكُمْ يَنْصُرُكُمْ مِنْ دُونِ الرَّحْمَٰنِ ۚ إِنِ الْكَافِرُونَ إِلَّا فِي غُرُورٍ ﴿٢٠﴾ أَمَّنْ هَٰذَا الَّذِي يَرْزُقُكُمْ إِنْ أَمْسَكَ رِزْقَهُ ۚ بَلْ لَجُّوا فِي عُتُوٍّ وَنُفُورٍ ﴿٢١﴾ أَفَمَنْ يَمْشِي مُكِبًّا عَلَىٰ وَجْهِهِ أَهْدَىٰ أَمَّنْ يَمْشِي سَوِيًّا عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ ﴿٢٢﴾ قُلْ هُوَ الَّذِي أَنْشَأَكُمْ وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَفْئِدَةَ ۖ قَلِيلًا مَا تَشْكُرُونَ ﴿٢٣﴾ قُلْ هُوَ الَّذِي ذَرَأَكُمْ فِي الْأَرْضِ وَإِلَيْهِ تُحْشَرُونَ ﴿٢٤﴾ وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِنْ كُنْتُمْ صَادِقِينَ ﴿٢٥﴾ قُلْ إِنَّمَا الْعِلْمُ عِنْدَ اللَّهِ وَإِنَّمَا أَنَا نَذِيرٌ مُبِينٌ ﴿٢٦﴾ فَلَمَّا رَأَوْهُ زُلْفَةً سِيئَتْ وُجُوهُ الَّذِينَ كَفَرُوا وَقِيلَ هَٰذَا الَّذِي كُنْتُمْ بِهِ تَدَّعُونَ ﴿٢٧﴾ قُلْ أَرَأَيْتُمْ إِنْ أَهْلَكَنِيَ اللَّهُ وَمَنْ مَعِيَ أَوْ رَحِمَنَا فَمَنْ يُجِيرُ الْكَافِرِينَ مِنْ عَذَابٍ أَلِيمٍ ﴿٢٨﴾ قُلْ هُوَ الرَّحْمَٰنُ آمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا ۖ فَسَتَعْلَمُونَ مَنْ هُوَ فِي ضَلَالٍ مُبِينٍ ﴿٢٩﴾ قُلْ أَرَأَيْتُمْ إِنْ أَصْبَحَ مَاؤُكُمْ غَوْرًا فَمَنْ يَأْتِيكُمْ بِمَاءٍ مَعِينٍ ﴿٣٠﴾﴾",
    transliteration: "Tabarakal-ladhi biyadihil-mulku wa huwa 'ala kulli shay'in qadir...",
    translation: "Blessed is He in Whose Hand is dominion, and He is Able to do all things...",
    benefit:
      "Surah Al-Mulk intercedes for its reciter until he is forgiven and protects against the torment of the grave.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 2891; Sunan Abu Dawud 1400.",
    preferredTiming: "Before sleeping every night.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه عَنِ النَّبِيِّ ﷺ قَالَ: «إِنَّ سُورَةً مِنَ الْقُرْآنِ ثَلَاثُونَ آيَةً شَفَعَتْ لِرَجُلٍ حَتَّى غُفِرَ لَهُ، وَهِيَ سُورَةُ ﴿تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ﴾».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “There is a sura of the Qur’an of thirty verses that interceded for a man until he was forgiven: it is the sura ‘Blessed is He in whose hand is the dominion’.”",
    authenticityNote: "Graded Sahih by al-Albani.",
  },
  {
    id: "s-hm-106-subhanallah",
    category: "before_sleep",
    orderIndex: 14,
    arabicText: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhanallah",
    translation: "Glory be to Allah.",
    benefit: "Recited 33 times before sleeping (Hadith of Ali & Fatima).",
    repetitionCount: 33,
    countLabel: "33",
    sourceReference: "Sahih al-Bukhari 3113; Sahih Muslim 2727; Hisn al-Muslim 106.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عَنْ عَلِيٍّ رضي الله عنه أَنَّ فَاطِمَةَ شَكَتْ مَا تَلْقَى فِي يَدِهَا مِنَ الرَّحَى، فَقَالَ ﷺ: «أَلَا أَدُلُّكُمَا عَلَى خَيْرٍ مِمَّا سَأَلْتُمَا؟ إِذَا أَوَيْتُمَا إِلَى فِرَاشِكُمَا فَكَبِّرَا أَرْبَعًا وَثَلَاثِينَ، وَسَبِّحَا ثَلَاثًا وَثَلَاثِينَ، وَاحْمَدَا ثَلَاثًا وَثَلَاثِينَ، فَهُوَ خَيْرٌ لَكُمَا مِنْ خَادِمٍ».",
    hadithTextEnglish:
      "‘Ali (may Allah be pleased with him) reported that Fatimah complained of what she suffered in her hand from the hand-mill, and the Prophet ﷺ said: “Shall I not direct you both to what is better than what you asked for? When you go to your bed, magnify Allah thirty-four times, glorify Him thirty-three times, and praise Him thirty-three times; that is better for you than a servant.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-106-alhamdulillah",
    category: "before_sleep",
    orderIndex: 15,
    arabicText: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah.",
    benefit: "Recited 33 times before sleeping.",
    repetitionCount: 33,
    countLabel: "33",
    sourceReference: "Sahih al-Bukhari 3113; Sahih Muslim 2727; Hisn al-Muslim 106.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عَنْ عَلِيٍّ رضي الله عنه أَنَّ فَاطِمَةَ شَكَتْ مَا تَلْقَى فِي يَدِهَا مِنَ الرَّحَى، فَقَالَ ﷺ: «أَلَا أَدُلُّكُمَا عَلَى خَيْرٍ مِمَّا سَأَلْتُمَا؟ إِذَا أَوَيْتُمَا إِلَى فِرَاشِكُمَا فَكَبِّرَا أَرْبَعًا وَثَلَاثِينَ، وَسَبِّحَا ثَلَاثًا وَثَلَاثِينَ، وَاحْمَدَا ثَلَاثًا وَثَلَاثِينَ، فَهُوَ خَيْرٌ لَكُمَا مِنْ خَادِمٍ».",
    hadithTextEnglish:
      "‘Ali (may Allah be pleased with him) reported that Fatimah complained of what she suffered in her hand from the hand-mill, and the Prophet ﷺ said: “Shall I not direct you both to what is better than what you asked for? When you go to your bed, magnify Allah thirty-four times, glorify Him thirty-three times, and praise Him thirty-three times; that is better for you than a servant.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-106-allahu-akbar",
    category: "before_sleep",
    orderIndex: 16,
    arabicText: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest.",
    benefit: "Recited 34 times before sleeping.",
    repetitionCount: 34,
    countLabel: "34",
    sourceReference: "Sahih al-Bukhari 3113; Sahih Muslim 2727; Hisn al-Muslim 106.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عَنْ عَلِيٍّ رضي الله عنه أَنَّ فَاطِمَةَ شَكَتْ مَا تَلْقَى فِي يَدِهَا مِنَ الرَّحَى، فَقَالَ ﷺ: «أَلَا أَدُلُّكُمَا عَلَى خَيْرٍ مِمَّا سَأَلْتُمَا؟ إِذَا أَوَيْتُمَا إِلَى فِرَاشِكُمَا فَكَبِّرَا أَرْبَعًا وَثَلَاثِينَ، وَسَبِّحَا ثَلَاثًا وَثَلَاثِينَ، وَاحْمَدَا ثَلَاثًا وَثَلَاثِينَ، فَهُوَ خَيْرٌ لَكُمَا مِنْ خَادِمٍ».",
    hadithTextEnglish:
      "‘Ali (may Allah be pleased with him) reported that Fatimah complained of what she suffered in her hand from the hand-mill, and the Prophet ﷺ said: “Shall I not direct you both to what is better than what you asked for? When you go to your bed, magnify Allah thirty-four times, glorify Him thirty-three times, and praise Him thirty-three times; that is better for you than a servant.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-102",
    category: "before_sleep",
    orderIndex: 8,
    arabicText:
      "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
    transliteration:
      "Bismika Rabbi wada'tu janbi, wa bika arfa'uh, fa in amsakta nafsi farhamha, wa in arsaltaha fahfazha bima tahfazu bihi 'ibadakas-salihin.",
    translation:
      "With Your Name, my Lord, I lay down my side, and by You I raise it. If You take my soul, have mercy on it; and if You release it, protect it as You protect Your righteous servants.",
    benefit: "Recited when lying down to sleep.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6320; Sahih Muslim 2714; Hisn al-Muslim 102.",
    preferredTiming: "When lying down after dusting off the bed.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: قَالَ النَّبِيُّ ﷺ: «إِذَا أَوَى أَحَدُكُمْ إِلَى فِرَاشِهِ فَلْيَنْفُضْ فِرَاشَهُ بِدَاخِلَةِ إِزَارِهِ، فَإِنَّهُ لَا يَدْرِي مَا خَلَفَهُ عَلَيْهِ، ثُمَّ لِيَقُلْ: بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) said: The Prophet ﷺ said: “When one of you goes to his bed, let him dust it down with the inner part of his garment, for he does not know what came upon it after him. Then let him say: In Your name, my Lord, I lay down my side and by You I raise it. If You take my soul, have mercy on it; and if You send it back, guard it with that by which You guard Your righteous servants.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-105",
    category: "before_sleep",
    orderIndex: 9,
    arabicText: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.",
    transliteration: "Bismika Allahumma amutu wa ahya.",
    translation: "In Your Name, O Allah, I die and I live.",
    benefit: "Standard supplication when sleeping.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6312; Sahih Muslim 2711; Hisn al-Muslim 105.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عَنْ حُذَيْفَةَ رضي الله عنه قَالَ: كَانَ النَّبِيُّ ﷺ إِذَا أَخَذَ مَضْجَعَهُ مِنَ اللَّيْلِ وَضَعَ يَدَهُ تَحْتَ خَدِّهِ ثُمَّ يَقُولُ: «اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا».",
    hadithTextEnglish:
      "Hudhayfah (may Allah be pleased with him) said: When the Prophet ﷺ took to his bed at night, he would place his hand under his cheek and say: “O Allah, in Your name I die and I live.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "s-hm-104",
    category: "before_sleep",
    orderIndex: 10,
    arabicText: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
    transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak.",
    translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
    benefit: "Recited 3 times with right hand under cheek.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sunan Abu Dawud 5045; Jami' at-Tirmidhi 3398; Hisn al-Muslim 104.",
    preferredTiming: "When lying down, placing the right hand under the cheek.",
    hadithText:
      "عَنْ حَفْصَةَ رضي الله عنها أَنَّ رَسُولَ اللَّهِ ﷺ كَانَ إِذَا أَرَادَ أَنْ يَرْقُدَ وَضَعَ يَدَهُ الْيُمْنَى تَحْتَ خَدِّهِ ثُمَّ يَقُولُ: «اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ» ثَلاَثَ مِرَارٍ.",
    hadithTextEnglish:
      "Hafsah (may Allah be pleased with her) reported that when the Messenger of Allah ﷺ wished to sleep, he would place his right hand under his cheek and then say three times: “O Allah, protect me from Your punishment on the Day You raise Your servants.”",
    authenticityNote: "Graded Sahih by al-Albani.",
  },
  {
    id: "s-hm-108",
    category: "before_sleep",
    orderIndex: 11,
    arabicText:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ.",
    transliteration:
      "Alhamdu lillahil-ladhi at'amana wa saqana, wa kafana, wa awana, fakam mimman la kafiya lahu wa la mu'wi.",
    translation:
      "Praise be to Allah who fed us, gave us drink, sufficed us, and sheltered us; how many have no one to suffice or shelter them.",
    benefit: "Expresses gratitude for life, food, and shelter before sleep.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2715; Hisn al-Muslim 108.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عَنْ أَنَسٍ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ كَانَ إِذَا أَوَى إِلَى فِرَاشِهِ قَالَ: «الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَكَفَانَا وَآوَانَا، فَكَمْ مِمَّنْ لاَ كَافِيَ لَهُ وَلاَ مُؤْوِيَ».",
    hadithTextEnglish:
      "Anas (may Allah be pleased with him) reported that when the Messenger of Allah ﷺ went to his bed he would say: “Praise be to Allah, who has fed us and given us drink, sufficed us and sheltered us; how many are there who have none to suffice them and none to shelter them.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "s-hm-107",
    category: "before_sleep",
    orderIndex: 12,
    arabicText:
      "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ. اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ، وَأَغْنِنَا مِنَ الْفَقْرِ.",
    transliteration:
      "Allahumma Rabbas-samawatis-sab'i wa Rabbal-'Arshil-'Azim, Rabbana wa Rabba kulli shay', faliqal-habbi wan-nawa, wa munzilat-Tawrati wal-Injili wal-Furqan...",
    translation:
      "O Allah, Lord of the seven heavens and Lord of the Magnificent Throne, our Lord and Lord of everything...",
    benefit: "Deep supplication for debt clearance and spiritual protection.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2713; Hisn al-Muslim 107.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ عَنِ النَّبِيِّ ﷺ أَنَّهُ كَانَ يَدْعُو عِنْدَ النَّوْمِ: «اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ، اللَّهُمَّ أَنْتَ الْأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ، وَأَغْنِنَا مِنَ الْفَقْرِ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported from the Prophet ﷺ that he used to supplicate at bedtime: “O Allah, Lord of the seven heavens and Lord of the Mighty Throne, our Lord and the Lord of everything, Splitter of the grain and the date-stone, Revealer of the Torah, the Gospel and the Criterion — I seek refuge in You from the evil of every thing You hold by its forelock. O Allah, You are the First, so there is nothing before You; You are the Last, so there is nothing after You; You are the Manifest, so there is nothing above You; You are the Hidden, so there is nothing beyond You. Settle our debt for us, and free us from poverty.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "s-hm-109",
    category: "before_sleep",
    orderIndex: 13,
    arabicText:
      "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.",
    transliteration: "Allahumma 'Alimal-ghaybi wash-shahadah, Fatiras-samawati wal-ard...",
    translation: "O Allah, Knower of the unseen and witnessed, Creator of the heavens and earth...",
    benefit: "Protects against self-harm, Satan, and wronging others.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 5067; Jami' at-Tirmidhi 3392; Hisn al-Muslim 109.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ أَبَا بَكْرٍ قَالَ: يَا رَسُولَ اللَّهِ، مُرْنِي بِكَلِمَاتٍ أَقُولُهُنَّ إِذَا أَصْبَحْتُ وَإِذَا أَمْسَيْتُ: «اللَّهُمَّ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَشَرِّ الشَّيْطَانِ وَشِرْكِهِ». قَالَ: «قُلْهُ إِذَا أَصْبَحْتَ وَإِذَا أَمْسَيْتَ وَإِذَا أَخَذْتَ مَضْجَعَكَ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that Abu Bakr said: Messenger of Allah, instruct me with words to say when I rise in the morning and when I reach the evening. He said: “O Allah, Originator of the heavens and the earth, Knower of the unseen and the seen, Lord of everything and its Sovereign — I bear witness that there is no god but You. I seek refuge in You from the evil of my own self, and from the evil of Satan and his associating.” He said: “Say it when you rise in the morning, when you reach the evening, and when you take to your bed.”",
    authenticityNote: "Graded Sahih by al-Albani.",
  },
  {
    id: "s-hm-111",
    category: "before_sleep",
    orderIndex: 17,
    arabicText:
      "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.",
    transliteration:
      "Allahumma aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk, wa alja'tu zahri ilayk, raghbatan wa rahbatan ilayk...",
    translation:
      "O Allah, I submit myself to You, entrust my affair to You, turn my face to You, and lay my back relying upon You... I believe in Your Book that You revealed and Your Prophet whom You sent.",
    benefit:
      "Make it the last supplication before sleep. If you die that night, you die upon natural faith (al-Fitrah).",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 247; Sahih Muslim 2710; Hisn al-Muslim 111.",
    preferredTiming: "Before sleeping; perform wudu, lie on the right side, and make this the final words.",
    hadithText:
      "عَنِ الْبَرَاءِ بْنِ عَازِبٍ رضي الله عنه قَالَ: قَالَ النَّبِيُّ ﷺ: «إِذَا أَتَيْتَ مَضْجَعَكَ فَتَوَضَّأْ وَضُوءَكَ لِلصَّلاَةِ ثُمَّ اضْطَجِعْ عَلَى شِقِّكَ الْأَيْمَنِ، ثُمَّ قُلْ: اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ، وَاجْعَلْهُنَّ آخِرَ مَا تَقُولُ».",
    hadithTextEnglish:
      "Al-Bara’ ibn ‘Azib (may Allah be pleased with him) said: The Prophet ﷺ said: “When you come to your bed, perform ablution as you would for prayer, then lie down on your right side and say: O Allah, I have submitted myself to You, turned my face to You, entrusted my affair to You, and laid my back to You, in hope of You and in fear of You. There is no refuge and no escape from You except to You. I believe in Your Book which You sent down, and in Your Prophet whom You sent.” And make them the last thing you say.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
];

const WAKING_UP_AZKAR: ZikrDraft[] = [
  {
    id: "wu-hm-1",
    category: "waking_up",
    orderIndex: 0,
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
    transliteration: "Alḥamdu lillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr.",
    translation:
      "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 11/113; Muslim 4/2083; Hisn al-Muslim 1.",
    hadithText:
      "عَنْ حُذَيْفَةَ، وَأَبِي ذَرٍّ، رضى الله عنهما قَالاَ كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم إِذَا أَوَى إِلَى فِرَاشِهِ قَالَ: «بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ» وَإِذَا اسْتَيْقَظَ قَالَ: «الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ».",
    hadithTextEnglish:
      "Hudhayfah and Abu Dharr (may Allah be pleased with them both) said: When the Messenger of Allah ﷺ took to his bed he would say: “In Your name, O Allah, I die and I live”; and when he awoke he would say: “Praise be to Allah, who has given us life after causing us to die, and to Him is the resurrection.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "wu-hm-2",
    category: "waking_up",
    orderIndex: 1,
    arabicText:
      "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي.",
    transliteration:
      "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shay’in qadīr. Subḥānallāhi, walḥamdu lillāhi, wa lā ilāha illallāhu, wallāhu akbar, wa lā ḥawla wa lā quwwata illā billāhil-ʿAliyyil-ʿAẓīm. Rabbighfir lī.",
    translation:
      "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. Glory is to Allah. All praise is to Allah. None has the right to be worshipped but Allah. Allah is the Greatest. There is no power and no might except by Allah. My Lord, forgive me.",
    benefit:
      "Whoever says this will be forgiven, and if he supplicates Allah, his prayer will be answered; if he performs ablution and prays, his prayer will be accepted.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 3/39; Hisn al-Muslim 2.",
    hadithText:
      "عَنْ عُبَادَةَ بْنِ الصَّامِتِ رضي الله عنه عَنِ النَّبِيِّ ﷺ قَالَ: «مَنْ تَعَارَّ مِنَ اللَّيْلِ فَقَالَ: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، الْحَمْدُ لِلَّهِ، وَسُبْحَانَ اللَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، ثُمَّ قَالَ: اللَّهُمَّ اغْفِرْ لِي أَوْ دَعَا، اسْتُجِيبَ لَهُ، فَإِنْ تَوَضَّأَ وَصَلَّى قُبِلَتْ صَلاَتُهُ».",
    hadithTextEnglish:
      "‘Ubadah ibn al-Samit (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “Whoever wakes in the night and says: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things. Praise be to Allah; glory be to Allah; there is no god but Allah; Allah is greatest; and there is no power and no strength except with Allah — then says: O Allah, forgive me, or makes some other supplication, he is answered. And if he performs ablution and prays, his prayer is accepted.”",
    authenticityNote: "Sahih al-Bukhari.",
  },
  {
    id: "wu-hm-3",
    category: "waking_up",
    orderIndex: 2,
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.",
    transliteration: "Alhamdu lillahilladhi 'afani fi jasadi, wa radda 'alayya ruhi, wa adhina li bi-dhikrih.",
    translation:
      "All praise is for Allah who restored health to my body, returned my soul to me, and permitted me to remember Him.",
    benefit: "Prophetic praise upon waking in good health and being granted life to remember Allah.",
    benefitArabic: "حمد لله عند الاستيقاظ على معافاة البدن ورد الروح والإذن بذكره سبحانه.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami` at-Tirmidhi 3401 (Hasan).",
    sourceReferenceArabic: "جامع الترمذي ٣٤٠١ (حسن).",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه عَنِ النَّبِيِّ ﷺ قَالَ: «إِذَا اسْتَيْقَظَ أَحَدُكُمْ فَلْيَقُلِ: الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “When one of you wakes up, let him say: All praise is for Allah who restored health to my body, returned my soul to me, and permitted me to remember Him.”",
    authenticityNote: "Hasan according to Al-Albani.",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3401",
  },
  {
    id: "wu-hm-4",
    category: "waking_up",
    orderIndex: 3,
    arabicText:
      "﴿إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِأُولِي الْأَلْبَابِ * الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ﴾",
    transliteration:
      "Inna fi khalqis-samawati wal-ardi wakhtilafil-layli wan-nahari la-ayatin li-ulil-albab. Alladhina yadhkurunallaha qiyaman wa qu'udan wa 'ala junubihim wa yatafakkaruna fi khalqis-samawati wal-ard, Rabbana ma khalaqta hadha batilan subhanaka faqina 'adhaban-nar.",
    translation:
      "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding—who remember Allah while standing or sitting or [lying] on their sides and give thought to the creation of the heavens and the earth: “Our Lord, You did not create this aimlessly; exalted are You; then protect us from the punishment of the Fire.”",
    benefit:
      "Prophetic Sunnah to recite the concluding ten verses of Surah Aal-Imran (190-200) upon waking at night for Tahajjud prayer.",
    benefitArabic: "سنة نبوية عند الاستيقاظ لقيام الليل بقراءة الآيات العشر الخواتيم من سورة آل عمران.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 4569; Sahih Muslim 763; Hisn al-Muslim 4.",
    sourceReferenceArabic: "صحيح البخاري ٤٥٦٩؛ صحيح مسلم ٧٦٣؛ حصن المسلم ٤.",
    hadithText:
      "عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما قَالَ: اسْتَيْقَظَ النَّبِيُّ ﷺ فَجَلَسَ يَمْسَحُ النَّوْمَ عَنْ وَجْهِهِ بِيَدِهِ، ثُمَّ قَرَأَ الْعَشْرَ الْآيَاتِ الْخَوَاتِمَ مِنْ سُورَةِ آلِ عِمْرَانَ.",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) said: The Prophet ﷺ woke up, sat up wiping sleep from his face with his hand, then recited the last ten verses of Surah Aal-Imran.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A4569",
  },
];

const HOME_AZKAR: ZikrDraft[] = [
  {
    id: "home-hm-15",
    category: "home",
    orderIndex: 0,
    arabicText: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.",
    transliteration: "Bismillāh, tawakkaltu ʿalallāh, wa lā ḥawla wa lā quwwata illā billāh.",
    translation:
      "In the Name of Allah, I have placed my trust in Allah, there is no might and no power except by Allah.",
    benefit:
      "When you say this, it will be said to you: 'You are guided, defended and protected.' The devil will go far away from you.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/325; At-Tirmidhi 5/490; Hisn al-Muslim 15.",
    hadithText:
      "عَنْ أَنَسِ بْنِ مَالِكٍ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ قَالَ -يَعْنِي إِذَا خَرَجَ مِنْ بَيْتِهِ-: بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ، يُقَالُ لَهُ: كُفِيتَ وَوُقِيتَ وَهُدِيتَ، وَتَنَحَّى عَنْهُ الشَّيْطَانُ».",
    hadithTextEnglish:
      "Anas ibn Malik (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Whoever says — meaning when he leaves his house — In the name of Allah, I rely upon Allah; there is no power and no strength except with Allah, it is said to him: You are sufficed, protected and guided; and Satan turns away from him.”",
    authenticityNote: "Sahih according to Al-Albani.",
  },
  {
    id: "home-hm-16",
    category: "home",
    orderIndex: 1,
    arabicText: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا.",
    transliteration: "Bismillāhi walajnā, wa bismillāhi kharajnā, wa ʿalā Rabbīnā tawakkalnā.",
    translation: "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we depend.",
    benefit: "To be said upon entering the home. The person should then greet his family.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/325; Hisn al-Muslim 16.",
    hadithText:
      "عَنْ أَبِي مَالِكٍ الأَشْعَرِيِّ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِذَا وَلَجَ الرَّجُلُ بَيْتَهُ فَلْيَقُلْ: اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا، ثُمَّ لْيُسَلِّمْ عَلَى أَهْلِهِ».",
    hadithTextEnglish:
      "Abu Malik al-Ash‘ari (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “When a man enters his house, let him say: O Allah, I ask You for the best of entrances and the best of exits. In the name of Allah we enter, and in the name of Allah we leave, and upon Allah our Lord we rely. Then let him greet his family with peace.”",
    authenticityNote: "Hasan according to Al-Albani.",
    /** Kept for its content, but flagged: Shurayh ibn Ubayd's narration from Abu
     *  Malik has a documented chain gap noted by hadith critics (Abu Hatim), and
     *  IslamQA grades it da'if on that basis despite Al-Albani's hasan grading
     *  above. Shown to the reader rather than silently resolved either way. */
    authenticityLevel: "weak",
  },
  {
    id: "home-hm-17",
    category: "home",
    orderIndex: 2,
    arabicText: "بِسْمِ اللَّهِ، وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
    transliteration: "Bismillah, was-salamu 'alaykum wa rahmatullahi wa barakatuh.",
    translation: "In the name of Allah, and peace be upon you, and the mercy of Allah and His blessings.",
    benefit:
      "Mentioning the name of Allah upon entering home and greeting family prevents Satan from taking lodging or food.",
    benefitArabic: "ذكر اسم الله تعالى عند دخول البيت وإلقاء السلام على الأهل يمنع الشيطان من المبيت والطعام.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2018.",
    sourceReferenceArabic: "صحيح مسلم ٢٠١٨.",
    hadithText:
      "عَنْ جَابِرِ بْنِ عَبْدِ اللَّهِ رضي الله عنهما أَنَّهُ سَمِعَ النَّبِيَّ ﷺ يَقُولُ: «إِذَا دَخَلَ الرَّجُلُ بَيْتَهُ، فَذَكَرَ اللَّهَ عِنْدَ دُخُولِهِ وَعِنْدَ طَعَامِهِ، قَالَ الشَّيْطَانُ: لَا مَبِيتَ لَكُمْ، وَلَا عَشَاءَ».",
    hadithTextEnglish:
      "Jabir ibn ‘Abdillah reported that he heard the Prophet ﷺ saying: “When a person enters his house and mentions Allah when entering and when eating, Satan says (to his companions): ‘You have no place to spend the night and no evening meal.’”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A2018",
  },
  {
    id: "home-hm-18",
    category: "home",
    orderIndex: 3,
    arabicText:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ.",
    transliteration:
      "Allahumma inni a'udhu bika an adilla aw udall, aw azilla aw uzall, aw azlima aw uzlam, aw ajhala aw yujhala 'alayy.",
    translation:
      "O Allah, I seek refuge in You lest I should stray or be led astray, or stumble or be made to stumble, or oppress or be oppressed, or behave ignorantly or be treated with ignorance.",
    benefit: "The Prophet ﷺ never left his home without raising his gaze to the sky and reciting this supplication.",
    benefitArabic:
      "ما كان النبي ﷺ يخرج من بيته إلا رفع بصره إلى السماء وقال هذا الدعاء تعوذاً من الضلال والظلم والزلل.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abi Dawud 5094; Jami` at-Tirmidhi 3427 (Sahih).",
    sourceReferenceArabic: "سنن أبي داود ٥٠٩٤؛ جامع الترمذي ٣٤٢٧ (صحيح).",
    hadithText:
      "عَنْ أُمِّ سَلَمَةَ رضي الله عنها قَالَتْ: مَا خَرَجَ النَّبِيُّ ﷺ مِنْ بَيْتِي قَطُّ إِلَّا رَفَعَ بَصَرَهُ إِلَى السَّمَاءِ فَقَالَ: «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ».",
    hadithTextEnglish:
      "Umm Salamah (may Allah be pleased with her) said: The Prophet ﷺ never left my house without raising his gaze to the heaven and saying: “O Allah, I seek refuge in You lest I should stray or be led astray, or slip or be tripped, or oppress or be oppressed, or act ignorantly or have ignorance acted against me.”",
    authenticityNote: "Sahih according to Al-Albani.",
    sourceUrl: "https://sunnah.com/abudawud%3A5094",
  },
];

const MOSQUE_AZKAR: ZikrDraft[] = [
  {
    id: "msq-hm-20",
    category: "mosque",
    orderIndex: 0,
    arabicText:
      "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ. اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
    transliteration:
      "A‘ūdhu billāhil-‘Aẓīm, wa bi-wajhihil-karīm, wa sulṭānihil-qadīm, minash-shayṭānir-rajīm. Bismillāhi, waṣ-ṣalātu was-salāmu ‘alā rasūlillāh. Allāhummaftaḥ lī abwāba raḥmatik.",
    translation:
      "I seek refuge in Almighty Allah, by His Noble Face, by His primordial power, from Satan the outcast. In the Name of Allah, and blessings and peace be upon the Messenger of Allah. O Allah, open before me the doors of Your mercy.",
    benefit: "Upon entering the mosque. He will be protected from Satan for the rest of the day.",
    benefitArabic: "يُقال عند دخول المسجد؛ يُحفظ قائله من وساوس الشيطان ونزغاته سائر اليوم.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud; Muslim 1/494; Hisn al-Muslim 20.",
    sourceReferenceArabic: "أبو داود؛ صحيح مسلم ١/٤٩٤؛ حصن المسلم ٢٠.",
    hadithText:
      "عَنْ عَبْدِ اللَّهِ بْنِ عَمْرِو بْنِ الْعَاصِ رضي الله عنه عَنِ النَّبِيِّ ﷺ أَنَّهُ كَانَ إِذَا دَخَلَ الْمَسْجِدَ قَالَ: «أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ». قَالَ: فَإِذَا قَالَ ذَلِكَ، قَالَ الشَّيْطَانُ: حُفِظَ مِنِّي سَائِرَ الْيَوْمِ.",
    hadithTextEnglish:
      "‘Abdullah ibn ‘Amr ibn al-‘As (may Allah be pleased with him) reported from the Prophet ﷺ that when he entered the mosque he would say: “I seek refuge in Allah the Immense, in His noble face and His eternal authority, from Satan the accursed.” He said: When he says that, Satan says: He is guarded from me for the rest of the day.",
    authenticityNote: "Sahih Muslim and Abu Dawud (Sahih Al-Albani).",
  },
  {
    id: "msq-hm-21",
    category: "mosque",
    orderIndex: 1,
    arabicText:
      "بِسْمِ اللَّهِ وَالصَّلاَةُ وَالسَّلاَمُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ.",
    transliteration:
      "Bismillāhi waṣ-ṣalātu was-salāmu ʿalā rasūlillāh, Allāhumma innī as’aluka min faḍlik, Allāhummaʿṣimnī minash-shayṭānir-rajīm.",
    translation:
      "In the Name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask for Your favor, O Allah, protect me from Satan the outcast.",
    benefit: "To be said upon leaving the mosque.",
    benefitArabic: "يُقال عند الخروج من المسجد سؤالاً لفضل الله وتوكلاً عليه وحفظاً من الشيطان.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 1/494; Ibn Majah; Hisn al-Muslim 21.",
    sourceReferenceArabic: "صحيح مسلم ١/٤٩٤؛ سنن ابن ماجه؛ حصن المسلم ٢١.",
    hadithText:
      "عَنْ أَبِي أُسَيْدٍ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِذَا دَخَلَ أَحَدُكُمُ الْمَسْجِدَ فَلْيَقُلْ: اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ، وَإِذَا خَرَجَ فَلْيَقُلْ: اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ».",
    hadithTextEnglish:
      "Abu Usayd (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “When one of you enters the mosque, let him say: O Allah, open for me the gates of Your mercy. And when he leaves, let him say: O Allah, I ask You of Your bounty.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "msq-hm-22",
    category: "mosque",
    orderIndex: 2,
    arabicText:
      "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ يَسَارِي نُورًا، وَفَوْقِي نُورًا، وَتَحْتِي نُورًا، وَأَمَامِي نُورًا، وَخَلْفِي نُورًا، وَاجْعَلْ لِي نُورًا.",
    transliteration:
      "Allahummaj-'al fi qalbi nura, wa fi basari nura, wa fi sam'i nura, wa 'an yamini nura, wa 'an yasari nura, wa fawqi nura, wa tahti nura, wa amami nura, wa khalfi nura, waj-'al li nura.",
    translation:
      "O Allah, place light in my heart, light in my sight, light in my hearing, light on my right, light on my left, light above me, light below me, light before me, light behind me, and make for me light.",
    benefit:
      "Supplication while walking to the mosque for congregational prayer, seeking comprehensive divine light in all faculties and directions.",
    benefitArabic: "دعاء الذهاب إلى المسجد لصلاة الجماعة، يسأل العبد ربه نوراً تاماً محيطاً به في جوارحه وجهاته.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 763; Sahih al-Bukhari 6316; Hisn al-Muslim 19.",
    sourceReferenceArabic: "صحيح مسلم ٧٦٣؛ صحيح البخاري ٦٣١٦؛ حصن المسلم ١٩.",
    hadithText:
      "عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما أَنَّ النَّبِيَّ ﷺ خَرَجَ إِلَى الصَّلَاةِ وَهُوَ يَقُولُ: «اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَفِي سَمْعِي نُورًا، وَفِي بَصَرِي نُورًا، وَمِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا، وَمِنْ أَمَامِي نُورًا، وَمِنْ خَلْفِي نُورًا، وَاجْعَلْ فِي نَفْسِي نُورًا، وَأَعْظِمْ لِي نُورًا».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) narrated that the Prophet ﷺ went out to prayer saying: “O Allah, place light in my heart, light on my tongue, light in my hearing, light in my sight, light above me, light below me, light on my right, light on my left, light in front of me, light behind me, light in my soul, and magnify for me light.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A763",
  },
  {
    id: "msq-hm-23",
    category: "mosque",
    orderIndex: 3,
    arabicText: "إِذَا دَخَلَ أَحَدُكُمُ الْمَسْجِدَ فَلَا يَجْلِسْ حَتَّى يُصَلِّيَ رَكْعَتَيْنِ.",
    transliteration: "Idha dakhala ahadukumul-masjida fala yajlis hatta yusalliya rak'atayn.",
    translation: "When one of you enters the mosque, he should not sit down until he prays two rak'ahs.",
    benefit: "Prophetic Sunnah to offer two rak'ahs upon entering the mosque before sitting down (Tahiyyat al-Masjid).",
    benefitArabic: "سنة نبوية مؤكدة بأداء ركعتي تحية المسجد عند الدخول قبل الجلوس تعظيماً لبيت الله.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 1163; Sahih Muslim 714.",
    sourceReferenceArabic: "صحيح البخاري ١١٦٣؛ صحيح مسلم ٧١٤.",
    hadithText:
      "عَنْ أَبِي قَتَادَةَ السَّلَمِيِّ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «إِذَا دَخَلَ أَحَدُكُمُ الْمَسْجِدَ فَلْيَرْكَعْ رَكْعَتَيْنِ قَبْلَ أَنْ يَجْلِسَ».",
    hadithTextEnglish:
      "Abu Qatadah as-Sulami (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “When one of you enters the mosque, let him pray two rak'ahs before he sits down.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A1163",
  },
];

function createAfterPrayerSurah(sourceId: string, id: string, orderIndex: number): ZikrDraft {
  const source = MORNING_AZKAR.find((zikr) => zikr.id === sourceId);
  if (!source) throw new Error(`Missing source surah for after-prayer collection: ${sourceId}`);

  return {
    ...source,
    id,
    category: "after_prayer",
    orderIndex,
    repetitionCount: 1,
    countLabel: "1",
    benefit: "Recited after every prescribed prayer.",
    benefitArabic: "تُقرأ دبر كل صلاة مكتوبة.",
    preferredTiming: "After every obligatory prayer.",
    sourceReference: "Sunan Abi Dawud 1523 (Sahih).",
    sourceReferenceArabic: "سنن أبي داود ١٥٢٣ (صحيح).",
    hadithText:
      "عَنْ عُقْبَةَ بْنِ عَامِرٍ قَالَ: أَمَرَنِي رَسُولُ اللَّهِ ﷺ أَنْ أَقْرَأَ بِالْمُعَوِّذَاتِ دُبُرَ كُلِّ صَلَاةٍ.",
    hadithTextEnglish:
      "‘Uqbah ibn ‘Amir (may Allah be pleased with him) said: The Messenger of Allah ﷺ commanded me to recite the suras of refuge after every prayer.",
    authenticityNote: "Sahih (al-Albani).",
    sourceUrl: "https://sunnah.com/abudawud%3A1523",
    notes: "Recited once here; the morning and evening collections retain their own prescribed counts.",
  };
}

const AFTER_PRAYER_SURAH_AZKAR: ZikrDraft[] = [
  createAfterPrayerSurah("m-hm-76a", "ap-ref-12a", 3),
  createAfterPrayerSurah("m-hm-76b", "ap-ref-12b", 4),
  createAfterPrayerSurah("m-hm-76c", "ap-ref-12c", 5),
];

const AFTER_PRAYER_AZKAR: ZikrDraft[] = [
  {
    id: "ap-ref-1",
    category: "after_prayer",
    orderIndex: 0,
    arabicText: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah (recited 3 times after completing prayer).",
    benefit: "Recited 3 times after every obligatory prayer.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sahih Muslim 591; Hisn al-Muslim 66.",
    hadithText:
      "عن ثوبان رضي الله عنه قال: «كان رسول الله ﷺ إذا انصرف من صلاته استغفر ثلاثاً، وقال: اللهم أنت السلام، ومنك السلام، تباركت يا ذا الجلال والإكرام»",
    hadithTextEnglish:
      "Thawban (may Allah be pleased with him) said: When the Messenger of Allah ﷺ finished his prayer, he would seek forgiveness three times and say: “O Allah, You are Peace, and from You comes peace. Blessed are You, Owner of majesty and honour.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ap-ref-2",
    category: "after_prayer",
    orderIndex: 1,
    arabicText: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Allahumma antas-salamu wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
    translation: "O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
    benefit: "Recited immediately after prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 592; Hisn al-Muslim 66.",
    hadithText:
      "عن ثوبان رضي الله عنه قال: كان رسول الله ﷺ إذا انصرف من صلاته استغفر ثلاثاً وقال: «اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ».",
    hadithTextEnglish:
      "Thawban (may Allah be pleased with him) said: When the Messenger of Allah ﷺ finished his prayer, he would seek forgiveness three times and say: “O Allah, You are Peace, and from You comes peace. Blessed are You, Owner of majesty and honour.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ap-ref-9",
    category: "after_prayer",
    orderIndex: 2,
    arabicText:
      "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾",
    transliteration:
      "A'udhu billahi minash-shaytanir-rajim. Allahu la ilaha illa huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi'idhnih, ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bishay'im-min 'ilmihi illa bima sha', wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'Aliyyul-'Azim.",
    translation:
      "Allah—there is none worthy of worship except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and earth. None can intercede except by His permission. He knows what is before and behind them; they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and earth, and preserving them does not tire Him. He is the Most High, the Magnificent.",
    benefit:
      "Whoever recites Ayat Al-Kursi after each obligatory prayer, nothing prevents him from entering Paradise except death.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan an-Nasa'i 9928; Ibn Hibban 2004; Hisn al-Muslim 31.",
    hadithText:
      "عن أبي أمامة رضي الله عنه قال: قال رسول الله ﷺ: «من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت».",
    hadithTextEnglish:
      "Abu Umamah (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Whoever recites Ayat al-Kursi after every obligatory prayer, nothing keeps him from entering Paradise except that he dies.”",
    authenticityNote: "Graded Sahih by al-Albani.",
  },
  {
    id: "ap-ref-3",
    category: "after_prayer",
    orderIndex: 3,
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
    translation:
      "None has the right to be worshipped except Allah, alone, with no partner. His is the dominion and to Him belongs all praise, and He is over all things capable.",
    benefit: "Affirmation of Tawhid following prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6329; Sahih Muslim 595; Hisn al-Muslim 25.",
    hadithText:
      "عن المغيرة بن شعبة رضي الله عنه أن النبي ﷺ كان يقول في دبر كل صلاة مكتوبة: «لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ».",
    hadithTextEnglish:
      "Al-Mughirah ibn Shu‘bah (may Allah be pleased with him) reported that the Prophet ﷺ used to say after every obligatory prayer: “There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He is capable of all things.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "ap-ref-4",
    category: "after_prayer",
    orderIndex: 4,
    arabicText:
      "اللَّهُمَّ لَا مَانِعَ لِمَا أَعطَيتَ وَلَا مُعطِيَ لِمَا مَنَعتَ وَلَا يَنفَعُ ذَا الجَدِّ مِنكَ الجَدُّ",
    transliteration: "Allahumma la mani'a lima a'tayta wa la mu'tiya lima mana'ta wa la yanfa'u dhal-jaddi minkal-jadd",
    translation:
      "O Allah, none can withhold what You give, and none can give what You withhold, and no wealth or fortune can benefit anyone against You.",
    benefit: "Declares complete submission to Allah's decree after prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 844; Sahih Muslim 593; Hisn al-Muslim 26.",
    hadithText:
      "عن المغيرة بن شعبة رضي الله عنه قال: سمعت النبي ﷺ يقول حين يسلم: «اللَّهُمَّ لَا مَانِعَ لِمَا أَعطَيتَ وَلَا مُعطِيَ لِمَا مَنَعتَ وَلَا يَنفَعُ ذَا الجَدِّ مِنكَ الجَدُّ».",
    hadithTextEnglish:
      "Al-Mughirah ibn Shu‘bah (may Allah be pleased with him) said: I heard the Prophet ﷺ say when he gave the salam: “O Allah, none can withhold what You have given, and none can give what You have withheld, and no fortune can avail its owner against You.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "ap-tasbeeh-subhanallah",
    category: "after_prayer",
    orderIndex: 5,
    arabicText: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhanallah",
    translation: "Glory be to Allah.",
    benefit: "Recited 33 times after obligatory prayer.",
    repetitionCount: 33,
    countLabel: "33",
    sourceReference: "Sahih Muslim 597; Hisn al-Muslim 27.",
    hadithText:
      "عن أبي هريرة رضي الله عنه عن رسول الله ﷺ قال: «من سبح الله في دبر كل صلاة ثلاثاً وثلاثين، وحمد الله ثلاثاً وثلاثين، وكبر الله ثلاثاً وثلاثين، فتلك تسعة وتسعون، وقال تمام المائة: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، غُفرت خطاياه وإن كانت مثل زبد البحر».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever glorifies Allah thirty-three times after every prayer, praises Allah thirty-three times, and magnifies Allah thirty-three times — that is ninety-nine — and completes the hundred with: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — his sins are forgiven, even were they like the foam of the sea.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ap-tasbeeh-alhamdulillah",
    category: "after_prayer",
    orderIndex: 6,
    arabicText: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "Praise be to Allah.",
    benefit: "Recited 33 times after obligatory prayer.",
    repetitionCount: 33,
    countLabel: "33",
    sourceReference: "Sahih Muslim 597; Hisn al-Muslim 27.",
    hadithText:
      "عن أبي هريرة رضي الله عنه عن رسول الله ﷺ قال: «من سبح الله في دبر كل صلاة ثلاثاً وثلاثين، وحمد الله ثلاثاً وثلاثين، وكبر الله ثلاثاً وثلاثين، فتلك تسعة وتسعون، وقال تمام المائة: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، غُفرت خطاياه وإن كانت مثل زبد البحر».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever glorifies Allah thirty-three times after every prayer, praises Allah thirty-three times, and magnifies Allah thirty-three times — that is ninety-nine — and completes the hundred with: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — his sins are forgiven, even were they like the foam of the sea.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ap-tasbeeh-allahuakbar",
    category: "after_prayer",
    orderIndex: 7,
    arabicText: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest.",
    benefit: "Recited 33 times after obligatory prayer.",
    repetitionCount: 33,
    countLabel: "33",
    sourceReference: "Sahih Muslim 597; Hisn al-Muslim 27.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه عَنْ رَسُولِ اللَّهِ ﷺ قَالَ: «مَنْ سَبَّحَ اللَّهَ فِي دُبُرِ كُلِّ صَلَاةٍ ثَلَاثًا وَثَلَاثِينَ، وَحَمِدَ اللَّهَ ثَلَاثًا وَثَلَاثِينَ، وَكَبَّرَ اللَّهَ ثَلَاثًا وَثَلَاثِينَ، فَتِلْكَ تِسْعٌ وَتِسْعُونَ، وَقَالَ تَمَامَ الْمِائَةِ: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، غُفِرَتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever glorifies Allah thirty-three times after every prayer, praises Allah thirty-three times, and magnifies Allah thirty-three times — that is ninety-nine — and completes the hundred with: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — his sins are forgiven, even were they like the foam of the sea.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ap-tasbeeh-tawhid",
    category: "after_prayer",
    orderIndex: 8,
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir",
    translation:
      "None has the right to be worshipped except Allah alone, with no partner. His is the kingdom and praise, and He has power over all things.",
    benefit: "Completed to 100 with Tawhid following the 99 Tasbeehs.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 597; Hisn al-Muslim 27.",
    hadithText:
      "عن أبي هريرة رضي الله عنه عن رسول الله ﷺ قال: «من سبح الله في دبر كل صلاة ثلاثاً وثلاثين، وحمد الله ثلاثاً وثلاثين، وكبر الله ثلاثاً وثلاثين، فتلك تسعة وتسعون، وقال تمام المائة: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، غُفرت خطاياه وإن كانت مثل زبد البحر».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever glorifies Allah thirty-three times after every prayer, praises Allah thirty-three times, and magnifies Allah thirty-three times — that is ninety-nine — and completes the hundred with: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — his sins are forgiven, even were they like the foam of the sea.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ap-ref-6",
    category: "after_prayer",
    orderIndex: 9,
    arabicText: "رَبِّ أَعِنِّي عَلَى ذِكرِكَ وَشُكرِكَ وَحُسنِ عِبَادَتِكَ",
    transliteration: "Rabbi a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    translation: "My Lord, help me to remember You, be grateful to You, and worship You in an excellent manner.",
    benefit: "Advised by the Prophet to Mu'adh bin Jabal to recite after every prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan an-Nasa'i al-Kubra 1226; Mustadrak al-Hakim 1/273; Hisn al-Muslim 28.",
    hadithText:
      "عن معاذ بن جبل رضي الله عنه أن رسول الله ﷺ أخذ بيده وقال: «يا معاذ، والله إني لأحبك، أوصيك يا معاذ لا تدعن في دبر كل صلاة تقول: اللَّهُمَّ أَعِنِّي عَلَى ذِكرِكَ وَشُكرِكَ وَحُسنِ عِبَادَتِكَ».",
    hadithTextEnglish:
      "Mu‘adh ibn Jabal (may Allah be pleased with him) reported that the Messenger of Allah ﷺ took him by the hand and said: “O Mu‘adh, by Allah I love you. I counsel you, Mu‘adh, never to leave saying at the end of every prayer: O Allah, help me to remember You, to thank You, and to worship You well.”",
    authenticityNote: "Sahih (Abu Dawud & An-Nasa'i).",
  },
  {
    id: "ap-ref-7",
    category: "after_prayer",
    orderIndex: 10,
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu yuhyi wa yumitu wa huwa 'ala kulli shay'in qadir",
    translation:
      "None has the right to be worshipped except Allah alone, with no partner. His is the kingdom and praise; He gives life and causes death, and He has power over all things.",
    benefit:
      "Recited 10 times after Fajr and Maghrib before speaking; grants 10 good deeds, erases 10 sins, raises 10 degrees, and protects from Satan and harm.",
    preferredTiming: "Recited 10 times after Fajr and 10 times after Maghrib.",
    repetitionCount: 10,
    countLabel: "10",
    sourceReference: "Jami' at-Tirmidhi 3474; Sunan an-Nasa'i 10234; Hisn al-Muslim 29.",
    hadithText:
      "عَنْ أَبِي ذَرٍّ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ قَالَ فِي دُبُرِ صَلاَةِ الْفَجْرِ وَهُوَ ثَانٍ رِجْلَيْهِ قَبْلَ أَنْ يَتَكَلَّمَ: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، عَشْرَ مَرَّاتٍ كُتِبَتْ لَهُ عَشْرُ حَسَنَاتٍ، وَمُحِيَ عَنْهُ عَشْرُ سَيِّئَاتٍ، وَرُفِعَ لَهُ عَشْرُ دَرَجَاتٍ وَكَانَ لَهُ حِرْزًا مِنْ كُلِّ مَكْرُوهٍ، وَحَرَسًا مِنَ الشَّيْطَانِ».",
    hadithTextEnglish:
      "Abu Dharr (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever says after the dawn prayer, while his legs are still folded and before he speaks: There is no god but Allah alone, with no partner; His is the dominion and His is the praise; He gives life and causes death, and He is capable of all things — ten times, ten good deeds are written for him, ten sins are erased from him, he is raised ten degrees, and it is a protection for him from all that is disliked and a guard against Satan.”",
    authenticityNote: "Graded Sahih/Hasan by al-Albani.",
  },
  {
    id: "ap-ref-11",
    category: "after_prayer",
    orderIndex: 11,
    arabicText: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ",
    transliteration: "Allahumma ajirni min an-nar",
    translation: "O Allah, protect me from the Hellfire.",
    benefit:
      "Recited 7 times after Fajr and Maghrib before speaking; grants protection and immunity from the Hellfire.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Sunan Abu Dawud 5079; Musnad Ahmad 17990; Hisn al-Muslim.",
    preferredTiming: "Recited 7 times after Fajr and 7 times after Maghrib.",
    hadithText:
      "عَنْ الْحَارِثِ بْنِ مُسْلِمٍ التَّمِيمِيِّ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ لِي رَسُولُ اللَّهِ ﷺ: «إِذَا صَلَّيْتَ الصُّبْحَ فَقُلْ قَبْلَ أَنْ تَتَكَلَّمَ: اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ سَبْعَ مَرَّاتٍ، فَإِنَّكَ إِنْ مُتَّ مِنْ يَوْمِكَ ذَلِكَ كَتَبَ اللَّهُ لَكَ جِوَارًا مِنْهَا، وَإِذَا صَلَّيْتَ الْمَغْرِبَ فَقُلْ قَبْلَ أَنْ تَتَكَلَّمَ: اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ سَبْعَ مَرَّاتٍ، فَإِنَّكَ إِنْ مُتَّ مِنْ لَيْلَتِكَ كَتَبَ اللَّهُ لَكَ جِوَارًا مِنْهَا».",
    hadithTextEnglish:
      "Al-Harith ibn Muslim at-Tamimi (may Allah be pleased with him) said: The Messenger of Allah ﷺ said to me: “When you have prayed the dawn prayer, say before you speak: O Allah, protect me from the Fire — seven times; for if you die that day, Allah will write for you protection from it. And when you have prayed Maghrib, say before you speak: O Allah, protect me from the Fire — seven times; for if you die that night, Allah will write for you protection from it.”",
    authenticityNote: "Reported by Abu Dawud and Ahmad.",
  },
  {
    id: "ap-ref-8",
    category: "after_prayer",
    orderIndex: 12,
    arabicText: "اللَّهُمَّ إِنِّي أَسأَلُكَ فِعلَ الخَيرَاتِ وَتَركَ المُنكَرَاتِ وَحُبَّ المَسَاكِينِ",
    transliteration: "Allahumma inni as'aluka fi'lal-khayrati wa tarkal-munkarati wa hubbal-masakin",
    translation:
      "O Allah, I ask You to grant me the doing of good deeds, the abandoning of evil deeds, and love for the poor.",
    benefit: "Comprehensive supplication after prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 3233; Hisn al-Muslim 30.",
    hadithText:
      "عن ابن عباس رضي الله عنهما عن النبي ﷺ قال الله تعالى: «يا محمد، إذا صليت فقل: اللهم إني أسألك فعل الخيرات وترك المنكرات وحب المساكين، وَأَنْ تَغْفِرَ لِي وَتَرْحَمَنِي، وَتَتُوبَ عَلَيَّ، وَإِذَا أَرَدْتَ بِعِبَادِكَ فِتْنَةً فَاقْبِضْنِي إِلَيْكَ غَيْرَ مَفْتُونٍ».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) reported from the Prophet ﷺ that Allah, exalted is He, said: “O Muhammad, when you pray, say: O Allah, I ask You for the doing of good deeds, the leaving of wrongs, and the love of the poor; and that You forgive me, have mercy on me, and accept my repentance. And when You intend a trial for Your servants, take me to You untried.”",
    authenticityNote: "Sahih at-Tirmidhi.",
  },
  {
    id: "ap-ref-10",
    category: "after_prayer",
    orderIndex: 13,
    arabicText: "اللَّهُمَّ إِنِّي أَسأَلُكَ عِلمًا نَافِعًا وَرِزقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
    transliteration: "Allahumma inni as'aluka 'ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbala",
    translation: "O Allah, I ask You for beneficial knowledge, wholesome provision, and accepted deeds.",
    benefit: "Recited after Fajr prayer.",
    preferredTiming: "Recited after Fajr prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Ibn Majah 925; Hisn al-Muslim 32.",
    hadithText:
      "عن أم سلمة رضي الله عنها أن النبي ﷺ كان يقول إذا صلى الصبح حين يسلم: «اللَّهُمَّ إِنِّي أَسأَلُكَ عِلمًا نَافِعًا وَرِزقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا».",
    hadithTextEnglish:
      "Umm Salamah (may Allah be pleased with her) reported that the Prophet ﷺ used to say after the dawn prayer, when he gave the salam: “O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.”",
    authenticityNote: "Authenticated by al-Albani.",
  },
  ...AFTER_PRAYER_SURAH_AZKAR,
];

const RESTROOM_AZKAR: ZikrDraft[] = [
  {
    id: "pur-ref-1",
    category: "restroom",
    orderIndex: 0,
    arabicText: "بِسمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    benefit: "Said before wudu.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 101; Sunan Ibn Majah 399; Hisn al-Muslim 8.",
    hadithText:
      "عن أبي هريرة رضي الله عنه عن النبي ﷺ قال: «لا صلاة لمن لا وضوء له، ولا وضوء لمن لم يذكر اسم الله عليه».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “There is no prayer for one who has no ablution, and no ablution for one who does not mention the name of Allah over it.”",
    authenticityNote: "Hasan (Abu Dawud & Ibn Majah).",
  },
  {
    id: "pur-ref-2",
    category: "restroom",
    orderIndex: 1,
    arabicText: "اللَّهُمَّ اغفِر لِي ذَنبِي وَوَسِّع لِي فِي دَارِي وَبَارِك لِي فِي رِزقِي",
    transliteration: "Allahummaghfir li dhanbi wa wassi' li fi dari wa barik li fi rizqi",
    translation: "O Allah, forgive my sin, expand my dwelling for me, and bless my provision.",
    benefit: "Supplication during purification.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Ibn Majah 299.",
    hadithText:
      "عن أبي موسى الأشعري رضي الله عنه قال: أتيت النبي ﷺ بوضوء فتوضأ فسمعته يدعو يقول: «اللَّهُمَّ اغفِر لِي ذَنبِي وَوَسِّع لِي فِي دَارِي وَبَارِك لِي فِي رِزقِي».",
    hadithTextEnglish:
      "Abu Musa al-Ash‘ari (may Allah be pleased with him) said: I brought the Prophet ﷺ water for ablution and he performed it, and I heard him supplicating: “O Allah, forgive me my sin, make my dwelling spacious for me, and bless me in my provision.”",
    authenticityNote: "Hasan by al-Albani.",
  },
  {
    id: "pur-ref-3",
    category: "restroom",
    orderIndex: 2,
    arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الخُبُثِ وَالخَبَائِثِ",
    transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
    translation: "O Allah, I seek refuge in You from the male and female devils.",
    benefit: "Recited before entering the toilet.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 142; Sahih Muslim 375; Hisn al-Muslim 6.",
    hadithText:
      "عن أنس بن مالك رضي الله عنه قال: كان النبي ﷺ إذا دخل الخلاء قال: «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الخُبُثِ وَالخَبَائِثِ».",
    hadithTextEnglish:
      "Anas ibn Malik (may Allah be pleased with him) said: When the Prophet ﷺ entered the privy he would say: “O Allah, I seek refuge in You from male and female devils.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "pur-ref-4",
    category: "restroom",
    orderIndex: 3,
    arabicText: "غُفرَانَكَ",
    transliteration: "Ghufranak",
    translation: "I ask Your forgiveness.",
    benefit: "Recited upon leaving the toilet.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 30; Jami' at-Tirmidhi 7; Hisn al-Muslim 7.",
    hadithText: "عن عائشة رضي الله عنها قَالَت: كَانَ النَّبِيُّ ﷺ إِذَا خَرَجَ مِنَ الخَلَاءِ قَالَ: «غُفرَانَكَ».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) said: When the Prophet ﷺ came out of the privy he would say: “I seek Your forgiveness.”",
    authenticityNote: "Hasan (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "pur-ref-5",
    category: "restroom",
    orderIndex: 4,
    arabicText:
      "أَشهَدُ أَن لَا إِلَهَ إِلَّا اللَّهُ وَحدَهُ لَا شَرِيكَ لَهُ وَأَشهَدُ أَنَّ مُحَمَّدًا عَبدُهُ وَرَسُولُهُ",
    transliteration:
      "Ashhadu an la ilaha illallahu wahdahu la sharika lahu wa ashhadu anna Muhammadan 'abduhu wa Rasuluh",
    translation:
      "I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and His Messenger.",
    benefit: "Recited after completing wudu — opens all eight gates of Paradise to enter from whichever one pleases.",
    benefitArabic: "دعاء الفراغ من الوضوء؛ تُفتح لقائله أبواب الجنة الثمانية يدخل من أيها شاء.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 234; Jami` at-Tirmidhi 55; Hisn al-Muslim 9.",
    sourceReferenceArabic: "صحيح مسلم ٢٣٤؛ جامع الترمذي ٥٥؛ حصن المسلم ٩.",
    hadithText:
      "عَنْ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَا مِنْكُمْ مِنْ أَحَدٍ يَتَوَضَّأُ فَيُبْلِغُ -أَوْ فَيُسْبِغُ- الْوُضُوءَ ثُمَّ يَقُولُ: أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا عَبْدُ اللَّهِ وَرَسُولُهُ، إِلَّا فُتِحَتْ لَهُ أَبْوَابُ الْجَنَّةِ الثَّمَانِيَةُ يَدْخُلُ مِنْ أَيِّهَا شَاءَ»، وَزَادَ التِّرْمِذِيُّ: «اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ».",
    hadithTextEnglish:
      "‘Umar ibn al-Khattab (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “There is not one of you who performs ablution and does it thoroughly, then says: I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and His Messenger — except that the eight gates of Paradise are opened for him to enter from whichever he wills.” At-Tirmidhi added: “O Allah, make me among those who constantly repent and make me among those who purify themselves.”",
    authenticityNote: "Sahih according to Al-Albani.",
  },
  {
    id: "pur-ref-6",
    category: "restroom",
    orderIndex: 5,
    arabicText: "سُبحَانَكَ اللَّهُمَّ وَبِحَمدِكَ أَشهَدُ أَن لَا إِلَهَ إِلَّا أَنتَ أَستَغفِرُكَ وَأَتُوبُ إِلَيكَ",
    transliteration: "Subhanakallahumma wa bihamdika ashhadu an la ilaha illa anta astaghfiruka wa atubu ilaik",
    translation:
      "Glory be to You, O Allah, and with Your praise I bear witness that there is no god but You. I seek Your forgiveness and turn to You in repentance.",
    benefit: "Recited after wudu.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 3/153; Sunan an-Nasa'i; Hisn al-Muslim 10.",
    hadithText:
      "عن أبي سعيد الخدري رضي الله عنه عن النبي ﷺ قال: «من توضأ فقال: سبحانك اللهم وبحمدك أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ، كُتب في رق ثم طُبع بطابع فلم يُكسر إلى يوم القيامة».",
    hadithTextEnglish:
      "Abu Sa‘id al-Khudri (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “Whoever performs ablution and then says: Glory be to You, O Allah, and praise be to You; I bear witness that there is no god but You; I seek Your forgiveness and turn to You in repentance — it is written on a parchment, then sealed with a seal, and it is not broken until the Day of Resurrection.”",
    authenticityNote: "Authenticated by al-Albani.",
  },
];

const FOOD_DRINK_AZKAR: ZikrDraft[] = [
  {
    id: "fd-ref-1",
    category: "food_drink",
    orderIndex: 0,
    arabicText: "بِسمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    benefit: "Recited before eating.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 3/347; Jami' at-Tirmidhi 4/288; Hisn al-Muslim 178.",
    hadithText:
      "عن عائشة رضي الله عنها أن رسول الله ﷺ قال: «إذا أكل أحدكم فليذكر اسم الله تعالى، فَإِنْ نَسِيَ أَنْ يَذْكُرَ اسْمَ اللَّهِ تَعَالَى فِي أَوَّلِهِ فَلْيَقُلْ: بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that the Messenger of Allah ﷺ said: “When one of you eats, let him mention the name of Allah, exalted is He. If he forgets to mention the name of Allah at the beginning, let him say: In the name of Allah, at its beginning and at its end.”",
    authenticityNote: "Sahih (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "fd-ref-2",
    category: "food_drink",
    orderIndex: 1,
    arabicText: "بِسمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ",
    transliteration: "Bismillahi fi awwalihi wa akhirih",
    translation: "In the name of Allah at its beginning and at its end.",
    benefit: "Recited if forgotten at the start of eating.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 3767; Jami' at-Tirmidhi 1858; Hisn al-Muslim 178.",
    hadithText: "عن عائشة رضي الله عنها أن رسول الله ﷺ قال: «فإن نسي في أوله فليقل: بسم الله في أوله وآخره».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that the Messenger of Allah ﷺ said: “If he forgets at the beginning, let him say: In the name of Allah, at its beginning and at its end.”",
    authenticityNote: "Sahih (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "fd-ref-3",
    category: "food_drink",
    orderIndex: 2,
    arabicText: "الحَمدُ لِلَّهِ الَّذِي أَطعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسلِمِينَ",
    transliteration: "Alhamdu lillahi-lladhi at'amana wa saqana wa ja'alana muslimin",
    translation: "All praise is for Allah Who fed us and gave us drink and made us Muslims.",
    benefit: "Recited after eating.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 3850; Jami' at-Tirmidhi 3457; Hisn al-Muslim 180.",
    sourceReferenceArabic: "سنن أبي داود ٣٨٥٠؛ جامع الترمذي ٣٤٥٧؛ حصن المسلم ١٨٠.",
    hadithText:
      "عن أبي سعيد الخدري رضي الله عنه أن النبي ﷺ كان إذا فرغ من طعامه قال: «الحمد لله الذي أطعمنا وسقانا وجعلنا مسلمين».",
    hadithTextEnglish:
      "Abu Sa‘id al-Khudri (may Allah be pleased with him) reported that when the Prophet ﷺ finished his meal, he would say: “Praise be to Allah Who fed us, gave us drink, and made us Muslims.”",
    authenticityNote: "Hasan (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "fd-ref-4",
    category: "food_drink",
    orderIndex: 3,
    arabicText:
      "الحَمدُ لِلَّهِ حَمدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ غَيرَ مَكفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُستَغنًى عَنهُ رَبَّنَا",
    transliteration:
      "Alhamdu lillahi hamdan kathiran tayyiban mubarakan fihi, ghayra makfiyyin wa la muwadda'in wa la mustaghnan 'anhu Rabbana",
    translation:
      "All praise to Allah, abundant pure praise, blessed in it, indispensable, not bade farewell to, and not dispensed with, O our Lord.",
    benefit: "Recited after completing a meal.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 7/84; Hisn al-Muslim 180.",
    hadithText:
      "عن أبي أمامة رضي الله عنه أن النبي ﷺ كان إذا رفع مائدته قال: «الحَمدُ لِلَّهِ حَمدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ غَيرَ مَكفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُستَغنًى عَنهُ رَبَّنَا».",
    hadithTextEnglish:
      "Abu Umamah (may Allah be pleased with him) reported that when the Prophet ﷺ had his table cleared he would say: “Praise be to Allah, abundant, good and blessed praise; a praise never enough, never bidden farewell, never dispensed with — our Lord.”",
    authenticityNote: "Sahih al-Bukhari.",
  },
  {
    id: "fd-ref-5",
    category: "food_drink",
    orderIndex: 4,
    arabicText: "اللَّهُمَّ بَارِك لَنَا فِيهِ وَأَطعِمنَا خَيرًا مِنهُ",
    transliteration: "Allahumma barik lana fihi wa at'imna khayran minh",
    translation: "O Allah, bless it for us and feed us something better than it.",
    benefit: "Recited when served food.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 5/506; Hisn al-Muslim 181.",
    hadithText:
      "عن ابن عباس رضي الله عنهما قال: قال رسول الله ﷺ: «من أطعمه الله طعاماً فليقل: اللهم بارك لنا فيه وأطعمنا خيراً منه».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) said: The Messenger of Allah ﷺ said: “Whoever Allah has fed with food, let him say: O Allah, bless it for us and feed us better than it.”",
    authenticityNote: "Sahih by al-Albani.",
  },
  {
    id: "fd-ref-6",
    category: "food_drink",
    orderIndex: 5,
    arabicText: "اللَّهُمَّ أَطعِم مَن أَطعَمَنِي وَاسقِ مَن سَقَانِي",
    transliteration: "Allahumma at'im man at'amani wasqi man saqani",
    translation: "O Allah, feed the one who fed me and give drink to the one who gave me drink.",
    benefit: "Dua for the host who served food/drink.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2055; Hisn al-Muslim 182.",
    hadithText:
      "عن المقداد رضي الله عنه في حديثه الطويل عن النبي ﷺ أنه دعا فقال: «اللَّهُمَّ أَطعِم مَن أَطعَمَنِي وَاسقِ مَن سَقَانِي».",
    hadithTextEnglish:
      "Al-Miqdad (may Allah be pleased with him), in his long report from the Prophet ﷺ, said that he supplicated: “O Allah, feed whoever has fed me, and give drink to whoever has given me drink.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "fd-ref-7",
    category: "food_drink",
    orderIndex: 6,
    arabicText: "أَفطَرَ عِندَكُمُ الصَّائِمُونَ وَأَكَلَ طَعَامَكُمُ الأَبرَارُ وَصَلَّت عَلَيكُمُ المَلَائِكَةُ",
    transliteration: "Aftara 'indakumus-sa'imuna wa akala ta'amakumul-abraru wa sallat 'alaykumul-mala'ikah",
    translation:
      "May the fasting break their fast with you, may the righteous eat your food, and may the angels send blessings upon you.",
    benefit: "Recited when hosted for Iftar or a meal.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 3854; Sunan Ibn Majah 1747; Hisn al-Muslim 183.",
    hadithText:
      "عن أنس بن مالك رضي الله عنه أن النبي ﷺ جاء إلى سعد بن عبادة فجاء بخبز وزيت فأكل، ثم قال النبي ﷺ: «أَفطَرَ عِندَكُمُ الصَّائِمُونَ وَأَكَلَ طَعَامَكُمُ الأَبرَارُ وَصَلَّت عَلَيكُمُ المَلَائِكَةُ».",
    hadithTextEnglish:
      "Anas ibn Malik (may Allah be pleased with him) reported that the Prophet ﷺ came to Sa‘d ibn ‘Ubadah, who brought bread and oil, and he ate. Then the Prophet ﷺ said: “May the fasting break their fast with you, may the righteous eat your food, and may the angels send blessings upon you.”",
    authenticityNote: "Sahih (Abu Dawud).",
  },
  {
    id: "fd-ref-8",
    category: "food_drink",
    orderIndex: 7,
    arabicText: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ",
    transliteration: "Allahumma barik lana fihi wa zidna minh.",
    translation: "O Allah, bless it for us and increase it for us.",
    benefit: "Supplication when drinking milk; milk is uniquely sufficient for both sustenance and thirst.",
    benefitArabic: "دعاء شرب اللبن والحليب؛ فإن اللبن يُجزئ عن الطعام والشراب جميعاً.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 3730; Jami' at-Tirmidhi 3455; Hisn al-Muslim 181.",
    sourceReferenceArabic: "سنن أبي داود ٣٧٣٠؛ جامع الترمذي ٣٤٥٥؛ حصن المسلم ١٨١.",
    hadithText:
      "عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ سَقَاهُ اللَّهُ لَبَنًا فَلْيَقُلْ: اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ، فَإِنَّهُ لَيْسَ شَيْءٌ يُجْزِئُ مَكَانَ الطَّعَامِ وَالشَّرَابِ غَيْرُ اللَّبَنِ».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) narrated that the Messenger of Allah ﷺ said: “Whomever Allah gives milk to drink, let him say: O Allah, bless it for us and give us more of it, for nothing suffices for food and drink except milk.”",
    authenticityNote: "Hasan according to Al-Albani.",
    sourceUrl: "https://sunnah.com/abudawud%3A3730",
  },
  {
    id: "fd-ref-9",
    category: "food_drink",
    orderIndex: 8,
    arabicText:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا الطَّعَامَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahilladhi at'amani hadhat-ta'ama wa razaqanihi min ghayri hawlin minni wa la quwwah.",
    translation:
      "All praise is for Allah Who fed me this food and provided it for me without any might or power on my part.",
    benefit: "Whoever recites this upon completing a meal will have his past sins forgiven.",
    benefitArabic: "من قال هذا عند الفراغ من طعامه غُفر له ما تقدم من ذنبه.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 4023; Jami' at-Tirmidhi 3458; Hisn al-Muslim 179.",
    sourceReferenceArabic: "سنن أبي داود ٤٠٢٣؛ جامع الترمذي ٣٤٥٨؛ حصن المسلم ١٧٩.",
    hadithText:
      "عَنْ مُعَاذِ بْنِ أَنَسٍ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ أَكَلَ طَعَامًا فَقَالَ: الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ».",
    hadithTextEnglish:
      "Mu‘adh ibn Anas (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever eats food and says: Praise be to Allah Who has fed me this and provided it for me without any might or power from myself — his past sins will be forgiven.”",
    authenticityNote: "Hasan according to Al-Albani.",
    sourceUrl: "https://sunnah.com/abudawud%3A4023",
  },
];

const CLOTHING_AZKAR: ZikrDraft[] = [
  {
    id: "clo-ref-1",
    category: "clothing",
    orderIndex: 0,
    arabicText: "الحَمدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِن غَيرِ حَولٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahi-lladhi kasani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation:
      "All praise is for Allah Who clothed me with this and provided it for me, without any might or power from myself.",
    benefit: "Said when wearing a garment.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 4023; Jami' at-Tirmidhi 3458; Hisn al-Muslim 2.",
    hadithText:
      "عن معاذ بن أنس رضي الله عنه أن رسول الله ﷺ قال: «من لبس ثوباً فقال: الحمد لله الذي كساني هذا ورزقنيه من غير حول مني ولا قوة غُفر له ما تقدم من ذنبه».",
    hadithTextEnglish:
      "Mu‘adh ibn Anas (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever puts on a garment and says: Praise be to Allah, who has clothed me with this and provided it for me with no power or strength of my own — is forgiven what has gone before of his sin.”",
    authenticityNote: "Hasan (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "clo-ref-2",
    category: "clothing",
    orderIndex: 1,
    arabicText:
      "اللَّهُمَّ لَكَ الحَمدُ أَنتَ كَسَوتَنِيهِ أَسأَلُكَ خَيرَهُ وَخَيرَ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِن شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
    transliteration:
      "Allahumma lakal-hamdu anta kasawtanihi, as'aluka khayrahu wa khayra ma suni'a lahu, wa a'udhu bika min sharrihi wa sharri ma suni'a lah",
    translation:
      "O Allah, to You is all praise. You have clothed me with it. I ask You for its good and the good of what it was made for, and I seek refuge in You from its evil and the evil of what it was made for.",
    benefit: "Said when putting on a new garment.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 4020; Jami' at-Tirmidhi 1767; Hisn al-Muslim 3.",
    hadithText:
      "عن أبي سعيد الخدري رضي الله عنه قال: كان رسول الله ﷺ إذا استجد ثوباً سماه باسمه ثم يقول: «اللَّهُمَّ لَكَ الحَمدُ أَنتَ كَسَوتَنِيهِ أَسْأَلُكَ خَيْرَهُ وَخَيْرَ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ».",
    hadithTextEnglish:
      "Abu Sa‘id al-Khudri (may Allah be pleased with him) said: When the Messenger of Allah ﷺ put on a new garment, he would name it by its name and then say: “O Allah, Yours is the praise. You have clothed me with it. I ask You for its good and the good of what it was made for, and I seek refuge in You from its evil and the evil of what it was made for.”",
    authenticityNote: "Hasan (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "clo-ref-3",
    category: "clothing",
    orderIndex: 2,
    arabicText: "تُبلِي وَيُخلِفُ اللَّهُ",
    transliteration: "Tubli wa yukhlifullah",
    translation: "Wear it out and may Allah replace it.",
    benefit: "Said to someone wearing a new garment.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 4020; Hisn al-Muslim 4.",
    hadithText:
      "عن أم خالد بنت خالد بن سعيد رضي الله عنها قَالَت: أُتِيَ النَّبِيُّ ﷺ بِثِيَابٍ فِيهَا خَمِيصَةٌ سَوْدَاءُ صَغِيرَةٌ فَكَسَاهَا إِيَّاهَا وَقَالَ: «تُبْلِي وَيُخْلِفُ اللَّهُ تَعَالَى».",
    hadithTextEnglish:
      "Umm Khalid bint Khalid ibn Sa‘id (may Allah be pleased with her) said: Some garments were brought to the Prophet ﷺ, among them a small black cloak, and he clothed her in it and said: “Wear it until it is worn out, and may Allah, exalted is He, give a replacement.”",
    authenticityNote: "Authenticated.",
  },
  {
    id: "clo-ref-4",
    category: "clothing",
    orderIndex: 3,
    arabicText: "بِسمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    benefit: "Said before undressing to shield from jinn.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Ibn Majah 297; Jami' at-Tirmidhi; Hisn al-Muslim 5.",
    hadithText:
      "عن علي بن أبي طالب رضي الله عنه أن رسول الله ﷺ قال: «ستر ما بين أعين الجن وعورات بني آدم إذا وضع أحدهم ثوبه أن يقول: بسم الله».",
    hadithTextEnglish:
      "‘Ali ibn Abi Talib (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “The screen between the eyes of the jinn and the nakedness of the children of Adam is that, when one of them takes off his garment, he says: In the name of Allah.”",
    authenticityNote: "Authenticated.",
  },
];

const TRAVEL_AZKAR: ZikrDraft[] = [
  {
    id: "tr-ref-1",
    category: "travel",
    orderIndex: 0,
    arabicText:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ\n\n﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ﴾\n\nاللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ",
    transliteration:
      "Allahu Akbar, Allahu Akbar, Allahu Akbar. Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinina wa inna ila Rabbina lamunqalibun. Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda, Allahumma hawwin 'alayna safarana hadha watwi 'anna bu'dah, Allahumma antas-Sahibu fis-safari, wal-khalifatu fil-ahl, Allahumma inni a'udhu bika min wa'tha'is-safari, wa ka'abatil-manzari, wa su'il-munqalabi fil-mali wal-ahl.",
    translation:
      "Allah is the Greatest (3×). Glory be to Him Who has subjected this to us, and we could never have it by our efforts, and surely to our Lord we will return. O Allah, we ask You on this journey of ours for righteousness, piety, and deeds that please You. O Allah, make this journey easy for us and shorten its distance. O Allah, You are the Companion on the journey and the Guardian over the family. O Allah, I seek refuge in You from the hardship of travel, a depressing sight, and an ill-fated return in wealth and family.",
    benefit:
      "Prophetic supplication recited when mounting transport and setting out on travel — full narration from Sahih Muslim.",
    benefitArabic: "دعاء ركوب الدابة ووسائل السفر والخروج في الرحلة؛ يستعين به المسافر بربه في سفره وأهله وماله وولده.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 1342; Sunan Abu Dawud 2599; Hisn al-Muslim 75–76.",
    sourceReferenceArabic: "صحيح مسلم ١٣٤٢؛ سنن أبي داود ٢٥٩٩؛ حصن المسلم ٧٥–٧٦.",
    hadithText:
      "عَنِ ابْنِ عُمَرَ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ كَانَ إِذَا اسْتَوَى عَلَى بَعِيرِهِ خَارِجًا إِلَى سَفَرٍ، كَبَّرَ ثَلاَثًا، ثُمَّ قَالَ: «سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ وَالْوَلَدِ».",
    hadithTextEnglish:
      "Ibn ‘Umar (may Allah be pleased with them both) reported that when the Messenger of Allah ﷺ mounted his camel setting out on a journey, he would say Allahu Akbar three times, then say: “Glory be to Him who has subjected this to us... O Allah, we ask You on this journey of ours for righteousness and mindfulness of You, and for deeds that please You. O Allah, make this journey of ours easy for us and fold up its distance for us. O Allah, You are the Companion on the journey and the Guardian over the family. O Allah, I seek refuge in You from the hardship of travel, from a sight that brings sorrow, and from an ill return in property, family and children.”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A1342a",
  },
  {
    id: "tr-ref-2",
    category: "travel",
    orderIndex: 1,
    arabicText: "اللَّهُ أَكْبَرُ (عِنْدَ الصُّعُودِ)، سُبْحَانَ اللَّهِ (عِنْدَ النُّزُولِ)",
    transliteration: "Allahu Akbar (when ascending), Subhanallah (when descending).",
    translation: "Allah is the Greatest (when ascending heights), Glory be to Allah (when descending valleys).",
    benefit:
      "Sunnah of the Companions during travel: saying Takbir upon rising to elevations and Tasbih upon descending.",
    benefitArabic: "سنة السفر بالتكبير عند صعود المرتفعات والتسبيح عند النزول في المنحدرات والأودية.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 2993; Hisn al-Muslim 79.",
    sourceReferenceArabic: "صحيح البخاري ٢٩٩٣؛ حصن المسلم ٧٩.",
    hadithText:
      "عَنْ جَابِرِ بْنِ عَبْدِ اللَّهِ رضي الله عنهما قَالَ: «كُنَّا إِذَا صَعِدْنَا كَبَّرْنَا، وَإِذَا نَزَلْنَا سَبَّحْنَا».",
    hadithTextEnglish:
      "Jabir ibn ‘Abdillah (may Allah be pleased with them both) said: “Whenever we went up high ground we said Allahu Akbar, and whenever we descended we said Subhanallah.”",
    authenticityNote: "Sahih al-Bukhari.",
    sourceUrl: "https://sunnah.com/bukhari%3A2993",
  },
  {
    id: "tr-ref-3",
    category: "travel",
    orderIndex: 2,
    arabicText: "أَسْتَوْدِعُكُمُ اللَّهَ الَّذِي لَا تَضِيعُ وَدَائِعُهُ",
    transliteration: "Astawdi'ukumullahalladhi la tadi'u wada'i'uh.",
    translation: "I place you in the trust of Allah, whose trusts are never lost.",
    benefit: "Supplication of the departing traveler when bidding farewell to family and those staying behind.",
    benefitArabic: "دعاء المسافر لمن يودّعه من الأهل والمقيمين مستودعاً إياهم عند حفظ الله الذي لا تضيع ودائعه.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Ibn Majah 2825; Musnad Ahmad 8690; Hisn al-Muslim 78.",
    sourceReferenceArabic: "سنن ابن ماجه ٢٨٢٥؛ مسند أحمد ٨٦٩٠؛ حصن المسلم ٧٨.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: وَدَّعَنِي رَسُولُ اللَّهِ ﷺ فَقَالَ: «أَسْتَوْدِعُكَ اللَّهَ الَّذِي لَا تَضِيعُ وَدَائِعُهُ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported: The Messenger of Allah ﷺ bade me farewell saying: “I place you in the trust of Allah, whose trusts are never lost.”",
    authenticityNote: "Sahih according to Al-Albani.",
    sourceUrl: "https://sunnah.com/ibnmajah%3A2825",
  },
  {
    id: "tr-ref-5",
    category: "travel",
    orderIndex: 3,
    arabicText: "أَسْتَوْدِعُ اللَّهَ دِينَكَ، وَأَمَانَتَكَ، وَخَوَاتِيمَ عَمَلِكَ",
    transliteration: "Astawdi'ullaha dinaka, wa amanataka, wa khawatima 'amalik.",
    translation: "I place in Allah's trust your religion, your commitments, and the conclusions of your deeds.",
    benefit: "Supplication of the resident when bidding farewell to a traveler setting out on a journey.",
    benefitArabic: "دعاء المقيم للمسافر عند توديعه بحفظ دينه وأمانته وخاتمة أعماله.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 2600; Jami' at-Tirmidhi 3443; Hisn al-Muslim 77.",
    sourceReferenceArabic: "سنن أبي داود ٢٦٠٠؛ جامع الترمذي ٣٤٤٣؛ حصن المسلم ٧٧.",
    hadithText:
      "عَنِ ابْنِ عُمَرَ رضي الله عنهما قَالَ: كَانَ رَسُولُ اللَّهِ ﷺ إِذَا وَدَّعَ رَجُلًا أَخَذَ بِيَدِهِ فَلَا يَدَعُهَا حَتَّى يَكُونَ الرَّجُلُ هُوَ يَدَعُ يَدَهُ، ثُمَّ يَقُولُ: «أَسْتَوْدِعُ اللَّهَ دِينَكَ، وَأَمَانَتَكَ، وَخَوَاتِيمَ عَمَلِكَ».",
    hadithTextEnglish:
      "Ibn ‘Umar reported: When the Messenger of Allah ﷺ bade farewell to someone, he would take his hand and say: “I entrust to Allah your religion, your trust, and the end of your deeds.”",
    authenticityNote: "Sahih according to Al-Albani.",
    sourceUrl: "https://sunnah.com/abudawud%3A2600",
  },
  {
    id: "tr-ref-6",
    category: "travel",
    orderIndex: 4,
    arabicText:
      "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الْأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ، فَإِنَّا نَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا وَخَيْرَ مَا فِيهَا، وَنَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا",
    transliteration:
      "Allahumma Rabbas-samawatis-sab'i wa ma azlalna, wa Rabbal-aradina-sab'i wa ma aqlalna, wa Rabbash-shayatini wa ma adlalna, wa Rabbar-riyahi wa ma dharayna, fa inna nas'aluka khayra hadhihil-qaryati wa khayra ahliha wa khayra ma fiha, wa na'udhu bika min sharriha wa sharri ahliha wa sharri ma fiha.",
    translation:
      "O Allah, Lord of the seven heavens and all they overshadow, Lord of the seven earths and all they carry, Lord of the devils and all they lead astray, Lord of the winds and all they scatter: We ask You for the good of this town, the good of its people, and the good within it; and we seek refuge in You from its evil, the evil of its people, and the evil within it.",
    benefit: "Recited when entering a town, city, or new destination.",
    benefitArabic: "دعاء دخول القرية أو البلدة أو المدينة التي يقصدها المسافر.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Ibn Hibban 2697; Al-Hakim 1/442; Hisn al-Muslim 80.",
    sourceReferenceArabic: "صحيح ابن حبان ٢٦٩٧؛ المستدرك ١/٤٤٢؛ حصن المسلم ٨٠.",
    hadithText:
      "عَنْ صُهَيْبٍ رضي الله عنه أَنَّ النَّبِيَّ ﷺ لَمْ يَرَ قَرْيَةً يُرِيدُ دُخُولَهَا إِلاَّ قَالَ حِينَ يَرَاهَا: «اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ، فَإِنَّا نَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا، وَنَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا» الدُّعَاءَ.",
    hadithTextEnglish:
      "Suhayb (may Allah be pleased with him) reported that the Prophet ﷺ never saw a town he meant to enter without saying, on seeing it: “O Allah, Lord of the seven heavens and all they overshadow... we ask You for the good of this town and the good of its people, and we seek refuge in You from its evil...”",
    authenticityNote: "Graded Hasan by Al-Albani; Sahih Ibn Hibban.",
    sourceUrl: "https://sunnah.com/hisn%3A80",
  },
  {
    id: "tr-ref-7",
    category: "travel",
    orderIndex: 5,
    arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi-kalimatil-lahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    benefit:
      "Whoever stops at a lodging or resting place during journey and says this, nothing will harm him until he departs.",
    benefitArabic: "دعاء النزول في منزل أو استراحة في السفر؛ لا يضر قائله شيء حتى يرتحل من منزله ذلك.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2708; Hisn al-Muslim 81.",
    sourceReferenceArabic: "صحيح مسلم ٢٧٠٨؛ حصن المسلم ٨١.",
    hadithText:
      "عَنْ خَوْلَةَ بِنْتِ حَكِيمٍ السُّلَمِيَّةِ رضي الله عنها قَالَتْ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «مَنْ نَزَلَ مَنْزِلًا ثُمَّ قَالَ: أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ، لَمْ يَضُرَّهُ شَيْءٌ حَتَّى يَرْتَحِلَ مِنْ مَنْزِلِهِ ذَلِكَ».",
    hadithTextEnglish:
      "Khawlah bint Hakim said: I heard the Messenger of Allah ﷺ saying: “Whoever stops at a place and says: I seek refuge in the perfect words of Allah from the evil of what He has created, nothing will harm him until he departs from that place.”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A2708",
  },
  {
    id: "tr-ref-8",
    category: "travel",
    orderIndex: 6,
    arabicText:
      "سَمِعَ سَامِعٌ بِحَمْدِ اللَّهِ وَحُسْنِ بَلَائِهِ عَلَيْنَا، رَبَّنَا صَاحِبْنَا وَأَفْضِلْ عَلَيْنَا، عَائِذًا بِاللَّهِ مِنَ النَّارِ",
    transliteration:
      "Sami'a sami'un bi-hamdillahi wa husni bala'ihi 'alayna. Rabbana sahibna wa afdil 'alayna, 'a'idhan billahi minan-nar.",
    translation:
      "May a listener bear witness to our praise of Allah and His good favor upon us. Our Lord, accompany us and bestow Your favors upon us; seeking refuge in Allah from the Fire.",
    benefit: "Prophetic supplication recited during travel at the time of pre-dawn (Sahar).",
    benefitArabic: "دعاء المسافر إذا كان في وقت السحر وقبل طلوع الفجر.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2718; Hisn al-Muslim 82.",
    sourceReferenceArabic: "صحيح مسلم ٢٧١٨؛ حصن المسلم ٨٢.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ النَّبِيَّ ﷺ كَانَ إِذَا كَانَ فِي سَفَرٍ وَأَسْحَرَ يَقُولُ: «سَمِعَ سَامِعٌ بِحَمْدِ اللَّهِ وَحُسْنِ بَلَائِهِ عَلَيْنَا، رَبَّنَا صَاحِبْنَا وَأَفْضِلْ عَلَيْنَا، عَائِذًا بِاللَّهِ مِنَ النَّارِ».",
    hadithTextEnglish:
      "Abu Hurayrah reported that when the Prophet ﷺ was on a journey at pre-dawn, he would say: “May a listener hear our praising Allah and His good testing of us. Our Lord, accompany us and show favor to us, while we seek refuge in Allah from the Fire.”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A2718",
  },
  {
    id: "tr-ref-4",
    category: "travel",
    orderIndex: 7,
    arabicText:
      "آيِبُونَ تائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ\n\nاللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْقَلَبِ، وَسُوءِ الْمَنْظَرِ فِي الْمَالِ وَالْأَهْلِ",
    transliteration:
      "A'ibuna ta'ibuna 'abiduna li-Rabbina hamidun. Allahumma inni a'udhu bika min wa'tha'is-safari, wa ka'abatil-munqalabi, wa su'il-manzari fil-mali wal-ahl.",
    translation:
      "We return, repenting, worshipping, and praising our Lord. O Allah, I seek refuge in You from the hardship of travel, a depressing return, and an ill-fated sight in wealth and family.",
    benefit: "Recited when returning from travel to one's home — narration from Sahih Muslim.",
    benefitArabic: "دعاء القفول والرجوع من السفر في صحيح مسلم؛ تجديد للتوبة والحمد والاستعاذة.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 1342; Hisn al-Muslim 76.",
    sourceReferenceArabic: "صحيح مسلم ١٣٤٢؛ حصن المسلم ٧٦.",
    hadithText:
      "عَنِ ابْنِ عُمَرَ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ كَانَ إِذَا رَجَعَ مِنْ سَفَرٍ قَالَهُنَّ وَزَادَ فِيهِنَّ: «آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ»، وَفِي رِوَايَةٍ: «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمُنْقَلَبِ، وَسُوءِ الْمَنْظَرِ فِي الْمَالِ وَالْأَهْلِ».",
    hadithTextEnglish:
      "Ibn ‘Umar reported that when the Messenger of Allah ﷺ returned from a journey, he would say the words of the travel supplication and add: “We return repenting, worshipping, and praising our Lord...”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A1342a",
  },
  {
    id: "tr-ref-9",
    category: "travel",
    orderIndex: 8,
    arabicText:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ، صَدَقَ اللَّهُ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ",
    transliteration:
      "Allahu Akbar, Allahu Akbar, Allahu Akbar. La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir. A'ibuna ta'ibuna 'abiduna li-Rabbina hamidun. Sadaqallahu wa'dah, wa nasara 'abdah, wa hazamal-ahzaba wahdah.",
    translation:
      "Allah is the Greatest (3×). There is no god but Allah alone, with no partner. His is the dominion and His is all praise, and He is capable of all things. We return, repenting, worshipping, and praising our Lord. Allah fulfilled His promise, granted victory to His servant, and defeated the confederates alone.",
    benefit: "Prophetic supplication upon returning from an expedition, Hajj, or journey at elevated ground.",
    benefitArabic: "دعاء الرجوع والقفول من السفر عند مشارف البلدة أو التلال المرتفعة في صحيحي البخاري ومسلم.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 1797, 3084; Sahih Muslim 1344; Hisn al-Muslim 77–78.",
    sourceReferenceArabic: "صحيح البخاري ١٧٩٧، ٣٠٨٤؛ صحيح مسلم ١٣٤٤؛ حصن المسلم ٧٧–٧٨.",
    hadithText:
      "عَنِ ابْنِ عُمَرَ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ كَانَ إِذَا قَفَلَ مِنْ جَيْشٍ أَوْ سَرِيَّةٍ أَوْ حَجٍّ أَوْ عُمْرَةٍ، كَبَّرَ عَلَى كُلِّ شَرَفٍ مِنَ الْأَرْضِ ثَلَاثَ تَكْبِيرَاتٍ، ثُمَّ قَالَ: «لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ، صَدَقَ اللَّهُ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ».",
    hadithTextEnglish:
      "Ibn ‘Umar reported that whenever the Messenger of Allah ﷺ returned from an expedition, Hajj, or ‘Umrah, he would say Allahu Akbar three times on every elevated place, and then say: “There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things. We return repenting, worshipping, and praising our Lord. Allah fulfilled His promise, granted victory to His servant, and defeated the confederates alone.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A1797",
  },
];

const DISTRESS_ANXIETY_AZKAR: ZikrDraft[] = [
  {
    id: "da-ref-1",
    category: "distress_anxiety",
    orderIndex: 0,
    arabicText:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الهَمِّ وَالحَزَنِ وَالعَجزِ وَالكَسَلِ وَالبُخلِ وَالجُبنِ وَغَلَبَةِ الدَّينِ وَقَهرِ الرِّجَالِ",
    transliteration:
      "Allahumma inni a'udhu bika minal-hammi wal-hazani wal-'ajzi wal-kasali wal-bukhli wal-jubni wa ghalabatid-dayni wa qahrir-rijal",
    translation:
      "O Allah, I seek refuge in You from worry and sadness, weakness and laziness, miserliness and cowardice, debt overpowering me and men dominating me.",
    benefit: "Comprehensive refuge against grief, debt, and hardship.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6363; Sunan Abu Dawud 1555; Hisn al-Muslim 120.",
    hadithText:
      "عن أنس بن مالك رضي الله عنه قال: كنت أخدم رسول الله ﷺ فكنت أسمعه يكثر أن يقول: «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الهَمِّ وَالحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ».",
    hadithTextEnglish:
      "Anas ibn Malik (may Allah be pleased with him) said: I used to serve the Messenger of Allah ﷺ, and I would often hear him say: “O Allah, I seek refuge in You from anxiety and grief, from incapacity and idleness, from cowardice and miserliness, from the burden of debt and from being overpowered by men.”",
    authenticityNote: "Sahih al-Bukhari and Sunan Abu Dawud.",
  },
  {
    id: "da-ref-2",
    category: "distress_anxiety",
    orderIndex: 1,
    arabicText: "لَا إِلَهَ إِلَّا أَنتَ سُبحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translation:
      "None has the right to be worshipped but You, Glory be to You. Indeed I have been of the wrongdoers (Dua of Yunus).",
    benefit: "No Muslim supplicates with this in any distress except that Allah relieves him.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 3505; Quran 21:87; Hisn al-Muslim 121.",
    hadithText:
      "عن سعد بن أبي وقاص رضي الله عنه قال: قال رسول الله ﷺ: «دعوة ذي النون إذ دعا وهو في بطن الحوت: لا إله إلا أنت سبحانك إني كنت من الظالمين، فإنه لم يدع بها رجل مسلم في شيء قط إلا استجاب الله له».",
    hadithTextEnglish:
      "Sa‘d ibn Abi Waqqas (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “The supplication of Dhu al-Nun when he called upon Allah from within the belly of the whale: There is no god but You; glory be to You; I was indeed among the wrongdoers. No Muslim man ever supplicates with it for anything but that Allah answers him.”",
    authenticityNote: "Authenticated.",
  },
  {
    id: "da-ref-3",
    category: "distress_anxiety",
    orderIndex: 2,
    arabicText: "اللَّهُ اللَّهُ رَبِّي لَا أُشرِكُ بِهِ شَيئًا",
    transliteration: "Allah Allahu Rabbi la ushriku bihi shay'a",
    translation: "Allah, Allah is my Lord, I associate nothing with Him.",
    benefit: "Remedy during severe emotional or spiritual distress.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 1525; Hisn al-Muslim 122.",
    hadithText:
      "عن أسماء بنت عميس رضي الله عنها قالت: قال لي رسول الله ﷺ: «ألا أعلمك كلمات تقولينهن عند الكرب: الله الله ربي لا أشرك به شيئاً».",
    hadithTextEnglish:
      "Asma’ bint ‘Umays (may Allah be pleased with her) said: The Messenger of Allah ﷺ said to me: “Shall I not teach you words to say at a time of distress: Allah, Allah is my Lord; I associate nothing with Him.”",
    authenticityNote: "Authenticated.",
  },
  {
    id: "da-ref-4",
    category: "distress_anxiety",
    orderIndex: 3,
    arabicText:
      "اللَّهُمَّ رَحمَتَكَ أَرجُو فَلَا تَكِلنِي إِلَى نَفسِي طَرفَةَ عَينٍ وَأَصلِح لِي شَأنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنتَ",
    transliteration:
      "Allahumma rahmataka arju fala takilni ila nafsi tarfata 'aynin wa aslih li sha'ni kullahu la ilaha illa ant",
    translation:
      "O Allah, I hope for Your mercy, so do not entrust me to myself for the blink of an eye, and set right all my affairs. There is no god but You.",
    benefit: "Dua of the distressed person.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 5090; Hisn al-Muslim 123.",
    hadithText:
      "عن أبي بكرة رضي الله عنه أن رسول الله ﷺ قال: «دعوات المكروب: اللَّهُمَّ رَحمَتَكَ أَرجُو فَلَا تَكِلنِي إِلَى نَفسِي طَرفَةَ عَينٍ وَأَصلِح لِي شَأنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنتَ».",
    hadithTextEnglish:
      "Abu Bakrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “The supplications of one in distress: O Allah, it is Your mercy I hope for, so do not entrust me to myself for the blink of an eye; set right all my affairs. There is no god but You.”",
    authenticityNote: "Authenticated.",
  },
  {
    id: "da-ref-5",
    category: "distress_anxiety",
    orderIndex: 4,
    arabicText: "حَسبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ العَرشِ العَظِيمِ",
    transliteration: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa Rabbul-'Arshil-'Azim",
    translation:
      "Sufficient for me is Allah; there is no god but Him. On Him I have relied, and He is the Lord of the Mighty Throne.",
    benefit: "Recited 7 times; Allah will suffice him in whatever grieves him.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Sunan Abu Dawud 5081; Ibn al-Sunni; Hisn al-Muslim 124.",
    hadithText:
      "عَنْ أَبِي الدَّرْدَاءِ رضي الله عنه قَالَ: مَنْ قَالَ إِذَا أَصْبَحَ وَإِذَا أَمْسَى: «حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ» سَبْعَ مَرَّاتٍ كَفَاهُ اللَّهُ مَا أَهَمَّهُ.",
    hadithTextEnglish:
      "Abu al-Darda’ (may Allah be pleased with him) said: Whoever says in the morning and in the evening: “Allah is sufficient for me; there is no god but He. On Him I rely, and He is the Lord of the Mighty Throne” seven times, Allah will suffice him in whatever troubles him.",
    authenticityNote: "Hasan by al-Albani.",
  },
  {
    id: "da-ref-6",
    category: "distress_anxiety",
    orderIndex: 5,
    arabicText:
      "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ، سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي.",
    transliteration:
      "Allāhumma innī ‘abduk, ibnu ‘abdik, ibnu amatik, nāṣiyatī biyadik, māḍin fiyya ḥukmuk, ‘adlun fiyya qaḍā’uk. As’aluka bikulli ismin huwa lak, sammayta bihi nafsak, aw anzaltahu fī kitābik, aw ‘allamtahu aḥadan min khalqik, aw ista’tharta bihi fī ‘ilmil-ghaybi ‘indak, an taj‘alal-Qur’āna rabī‘a qalbī, wa nūra ṣadrī, wa jalā’a ḥuznī, wa dhahāba hammī.",
    translation:
      "O Allah, I am Your servant, the son of Your servant and the son of Your maidservant. My forelock is in Your hand; Your command over me is executed and Your decree concerning me is just. I ask You by every name belonging to You—by which You named Yourself, revealed in Your Book, taught any of Your creation, or kept with You in knowledge of the unseen—to make the Qur’an the spring of my heart, the light of my chest, the remover of my sadness, and the reliever of my distress.",
    benefit: "Removes grief and anxiety and replaces sorrow with joy and relief.",
    benefitArabic: "يُذهب الله به الهم والحزن ويُبدل صاحبه مكانه فرجاً وانشراحاً.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Musnad Ahmad 3712; Sahih Ibn Hibban 972; Hisn al-Muslim 120.",
    sourceReferenceArabic: "مسند أحمد ٣٧١٢؛ صحيح ابن حبان ٩٧٢؛ حصن المسلم ١٢٠.",
    hadithText:
      "عن عبد الله بن مسعود رضي الله عنه قال: قال رسول الله ﷺ: «ما أصاب أحداً قط هم ولا حزن فقال: اللهم إني عبدك وابن عبدك وابن أمتك، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي، إلا أذهب الله همه وأبدله مكانه فرجاً».",
    hadithTextEnglish:
      "‘Abdullah ibn Mas‘ud (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “No one is ever struck by anxiety or grief and says: O Allah, I am Your servant, son of Your servant, son of Your maidservant... except that Allah takes away his anxiety and gives him relief in its place.”",
    authenticityNote: "Authenticated by Ibn Hibban and al-Albani.",
    sourceUrl: "https://sunnah.com/hisn%3A120",
  },
  {
    id: "da-ref-7",
    category: "distress_anxiety",
    orderIndex: 6,
    arabicText: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    transliteration: "Allahummak-fini bi-halalika 'an haramik, wa aghnini bi-fadlika 'amman siwak.",
    translation:
      "O Allah, suffice me with what You have made lawful against what You have made unlawful, and enrich me with Your bounty above all others.",
    benefit: "Supplication for settling debt and relieving financial hardship, even if debts were like a mountain.",
    benefitArabic: "دعاء قضاء الدين وتفريج الكرب المالي، ولو كان على العبد مثل جبل صِير ديناً أداه الله عنه.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami` at-Tirmidhi 3563; Hisn al-Muslim 136.",
    sourceReferenceArabic: "جامع الترمذي ٣٥٦٣؛ حصن المسلم ١٣٦.",
    hadithText:
      "عَنْ عَلِيٍّ رضي الله عنه أَنَّ مُكَاتَبًا جَاءَهُ فَقَالَ: إِنِّي عَجَزْتُ عَنْ كِتَابَتِي فَأَعِنِّي. قَالَ: أَلَا أُعَلِّمُكَ كَلِمَاتٍ عَلَّمَنِيهِنَّ رَسُولُ اللَّهِ ﷺ لَوْ كَانَ عَلَيْكَ مِثْلُ جَبَلِ صِيرٍ دَيْنًا أَدَّاهُ اللَّهُ عَنْكَ؟ قَالَ: «قُلِ: اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ».",
    hadithTextEnglish:
      "‘Ali (may Allah be pleased with him) said: “Shall I not teach you words that the Messenger of Allah ﷺ taught me, which, if you had a debt like Mount Seer, Allah would pay it for you? Say: O Allah! Suffice me with Your lawful against Your prohibited, and make me independent of all those besides You by Your grace.”",
    authenticityNote: "Hasan according to Al-Albani.",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3563",
  },
  {
    id: "da-ref-8",
    category: "distress_anxiety",
    orderIndex: 7,
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    transliteration:
      "La ilaha illallahul-'Azimul-Halim, la ilaha illallahu Rabbul-'Arshil-'Azim, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Karim.",
    translation:
      "There is no god but Allah, the Magnificent, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.",
    benefit: "The Prophetic supplication at times of severe distress and calamity (Dua al-Karb).",
    benefitArabic: "دعاء الكرب العظيم الذي كان النبي ﷺ يدعو به عند الشدائد والنوازل.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6346; Sahih Muslim 2730; Hisn al-Muslim 121.",
    sourceReferenceArabic: "صحيح البخاري ٦٣٤٦؛ صحيح مسلم ٢٧٣٠؛ حصن المسلم ١٢١.",
    hadithText:
      "عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ كَانَ يَقُولُ عِنْدَ الْكَرْبِ: «لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) narrated that the Messenger of Allah ﷺ used to say at times of distress: “There is no god but Allah, the Immense, the Clement; there is no god but Allah, Lord of the Mighty Throne; there is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A6346",
  },
];

const ILLNESS_RUQYAH_AZKAR: ZikrDraft[] = [
  {
    id: "ir-ref-1",
    category: "illness_ruqyah",
    orderIndex: 0,
    arabicText: "أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدرَتِهِ مِن شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
    transliteration: "A'udhu bi-'izzatillahi wa qudratihi min sharri ma ajidu wa uhadhir",
    translation: "I seek refuge in Allah's might and power from the evil of what I feel and fear.",
    benefit: "Place hand on the painful area, say Bismillah three times, and repeat this supplication seven times.",
    benefitArabic:
      "يضع يده على الموضع الذي يؤلمه من جسده ويقول: بسم الله ثلاثاً، ويقول سبع مرات: أعوذ بالله وقدرته من شر ما أجد وأحاذر.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Sahih Muslim 2202; Hisn al-Muslim 131.",
    sourceReferenceArabic: "صحيح مسلم ٢٢٠٢؛ حصن المسلم ١٣١.",
    hadithText:
      "عن عثمان بن أبي العاص رضي الله عنه أنه شكى إلى رسول الله ﷺ وجعاً، فقال له رسول الله ﷺ: «ضع يدك على الذي يلمس من جسدك وقل: باسم الله ثلاثاً، وقل سبع مرات: أَعُوذُ بِاللَّهِ وَقُدرَتِهِ مِن شَرِّ مَا أَجِدُ وَأُحَاذِرُ».",
    hadithTextEnglish:
      "‘Uthman ibn Abi al-‘As (may Allah be pleased with him) complained to the Messenger of Allah ﷺ of a pain, and the Messenger of Allah ﷺ said to him: “Place your hand on the part of your body that hurts and say: In the name of Allah — three times; and say seven times: I seek refuge in Allah and His power from the evil of what I find and what I fear.”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A2202",
  },
  {
    id: "ir-ref-2",
    category: "illness_ruqyah",
    orderIndex: 1,
    arabicText:
      "اللَّهُمَّ رَبَّ النَّاسِ أَذهِبِ البَأسَ اشفِهِ وَأَنتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
    transliteration:
      "Allahumma Rabban-nasi adh-hibil-ba'sa ishfihi wa antash-Shafi la shifa'a illa shifa'uka shifa'an la yughadiru saqama",
    translation:
      "O Allah, Lord of mankind, remove the harm and heal him, for You are the Healer. There is no healing except Your healing.",
    benefit: "Ruqyah dua for visiting a sick person.",
    benefitArabic: "دعاء رقية المريض وعيادته بطلب الشفاء التام من رب الناس.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 7/131; Sahih Muslim 2191; Hisn al-Muslim 129.",
    sourceReferenceArabic: "صحيح البخاري ٧/١٣١؛ صحيح مسلم ٢١٩١؛ حصن المسلم ١٢٩.",
    hadithText:
      "عن عائشة رضي الله عنها أن النبي ﷺ كان يعوذ بعض أهله يمسح بيمينه ويقول: «اللَّهُمَّ رَبَّ النَّاسِ أَذهِبِ البَأسَ اشفِهِ وَأَنتَ الشَّافِي، لَا شَافِيَ إِلَّا أَنْتَ، شِفَاءً لَا يُغَادِرُ سَقَمًا».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that the Prophet ﷺ would seek protection for some of his family, wiping with his right hand and saying: “O Allah, Lord of mankind, remove the harm; heal him, for You are the Healer. There is no healer but You — a healing that leaves no illness behind.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "ir-ref-3",
    category: "illness_ruqyah",
    orderIndex: 2,
    arabicText:
      "بِاسمِ اللَّهِ يُبرِيكَ وَمِن كُلِّ دَاءٍ يَشفِيكَ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ وَشَرِّ كُلِّ ذِي عَينٍ",
    transliteration:
      "Bismillahi yubrika wa min kulli da'in yashfika wa min sharri hasidin idha hasada wa sharri kulli dhi 'ayn",
    translation:
      "In the name of Allah He will cure you, from every disease He will heal you, from the evil of the envier when he envies and from every evil eye.",
    benefit: "Prophetic ruqyah for healing and protection.",
    benefitArabic: "رقية جبريل عليه السلام للنبي ﷺ للشفاء من كل داء وحسد وعين.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sahih Muslim 2186; Hisn al-Muslim 130.",
    sourceReferenceArabic: "صحيح مسلم ٢١٨٦؛ حصن المسلم ١٣٠.",
    hadithText:
      "عن عائشة رضي الله عنها أن رسول الله ﷺ كان إذا اشتكى رقاه جبريل عليه السلام فقال: «بِاسمِ اللَّهِ يُبرِيكَ وَمِن كُلِّ دَاءٍ يَشفِيكَ، مِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ، وَشَرِّ كُلِّ ذِي عَيْنٍ».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that when the Messenger of Allah ﷺ fell ill, Jibril (peace be upon him) would recite over him: “In the name of Allah, may He cure you and heal you from every disease; from the evil of an envier when he envies, and the evil of every evil eye.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ir-ref-4",
    category: "illness_ruqyah",
    orderIndex: 3,
    arabicText: "أَسأَلُ اللَّهَ العَظِيمَ رَبَّ العَرشِ العَظِيمِ أَن يَشفِيَكَ",
    transliteration: "As'alullahal-'Azima Rabbal-'Arshil-'Azimi an yashfiyak",
    translation: "I ask Allah the Magnificent, Lord of the Magnificent Throne, to cure you.",
    benefit: "Recited 7 times when visiting the sick.",
    benefitArabic: "يُقال ٧ مرات عند عيادة المريض مالم يحضره أجله فيعافيه الله.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Sunan Abu Dawud 3106; Jami' at-Tirmidhi 2083; Hisn al-Muslim 128.",
    sourceReferenceArabic: "سنن أبي داود ٣١٠٦؛ جامع الترمذي ٢٠٨٣؛ حصن المسلم ١٢٨.",
    hadithText:
      "عن ابن عباس رضي الله عنهما عن النبي ﷺ قال: «من عاد مريضاً لم يحضر أجله فقال عنده سبع مرار: أسأل الله العظيم رب العرش العظيم أن يشفيك إلا عافاه الله من ذلك المرض».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) reported from the Prophet ﷺ that he said: “No one visits a sick person whose time has not yet come and says beside him seven times: I ask Allah the Immense, Lord of the Mighty Throne, to heal you — except that Allah restores him to health from that illness.”",
    authenticityNote: "Sahih (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "ir-ref-5",
    category: "illness_ruqyah",
    orderIndex: 4,
    arabicText:
      "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\n\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\n\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾",
    transliteration: "Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas.",
    translation:
      "The Three Quls (Surahs 112, 113, 114) — recited into cupped hands and wiped over the body for Ruqyah.",
    benefit:
      "Prophetic practice before sleep or when feeling ill: reciting the Three Quls into hands and wiping over the body.",
    benefitArabic: "سنة نبوية قبل النوم وعند المرض بجمع الكفين والنفث فيهما بالمعوذات ومسح الجسد.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sahih al-Bukhari 5017; Sahih Muslim 2192; Hisn al-Muslim 132.",
    sourceReferenceArabic: "صحيح البخاري ٥٠١٧؛ صحيح مسلم ٢١٩٢؛ حصن المسلم ١٣٢.",
    hadithText:
      "عن عائشة رضي الله عنها أن النبي ﷺ كان إذا أوى إلى فراشه كل ليلة جمع كفيه ثم نفث فيهما فقرأ فيهما: قل هو الله أحد وقل أعوذ برب الفلق وقل أعوذ برب الناس، ثم يمسح بهما ما استطاع من جسده، يبدأ بهما على رأسه ووجهه وما أقبل من جسده، يفعل ذلك ثلاث مرات.",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that when the Prophet ﷺ went to his bed each night, he would cup his hands together, breathe into them, and recite into them: “Say: He is Allah, One”, “Say: I seek refuge in the Lord of daybreak”, and “Say: I seek refuge in the Lord of mankind”. Then he would wipe with them as much of his body as he could, beginning with his head, his face and the front of his body, doing that three times.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A5017",
  },
  {
    id: "ir-ref-6",
    category: "illness_ruqyah",
    orderIndex: 5,
    arabicText:
      "بِسمِ اللَّهِ أَرقِيكَ مِن كُلِّ شَيءٍ يُؤذِيكَ مِن شَرِّ كُلِّ نَفسٍ أَو عَينٍ حَاسِدٍ اللَّهُ يَشفِيكَ بِسمِ اللَّهِ أَرقِيكَ",
    transliteration:
      "Bismillahi arqika min kulli shay'in yu'dhika min sharri kulli nafsin aw 'ayni hasidin Allahu yashfika bismillahi arqik",
    translation:
      "In the name of Allah I perform ruqyah for you, from everything that harms you, from the evil of every soul or envious eye.",
    benefit: "Ruqyah Jibril recited for the Prophet ﷺ.",
    benefitArabic: "رقية نبوية مباركة من كل ما يؤذي ومن كل نفس أو عين حاسد.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sahih Muslim 2186; Hisn al-Muslim 133.",
    sourceReferenceArabic: "صحيح مسلم ٢١٨٦؛ حصن المسلم ١٣٣.",
    hadithText:
      "عن أبي سعيد الخدري رضي الله عنه أن جبريل أتى النبي ﷺ فقال: يا محمد اشتكيت؟ فقال: نعم، قال: «بِسمِ اللَّهِ أَرقِيكَ مِن كُلِّ شَيءٍ يُؤذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِاسْمِ اللَّهِ أَرْقِيكَ».",
    hadithTextEnglish:
      "Abu Sa‘id al-Khudri (may Allah be pleased with him) reported that Jibril came to the Prophet ﷺ and said: Muhammad, are you ill? He said: Yes. He said: “In the name of Allah I recite over you, from everything that harms you, from the evil of every soul or envious eye. May Allah heal you. In the name of Allah I recite over you.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ir-ref-7",
    category: "illness_ruqyah",
    orderIndex: 6,
    arabicText: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah.",
    translation: "There is no god but Allah.",
    benefit:
      "Exhorting the dying to say La ilaha illallah; whoever's last words are La ilaha illallah enters Paradise.",
    benefitArabic: "تلقين المحتضر لا إله إلا الله؛ فمن كان آخر كلامه من الدنيا لا إله إلا الله دخل الجنة.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 916, 917; Sunan Abi Dawud 3116; Hisn al-Muslim 138.",
    sourceReferenceArabic: "صحيح مسلم ٩١٦، ٩١٧؛ سنن أبي داود ٣١١٦؛ حصن المسلم ١٣٨.",
    hadithText:
      "عَنْ أَبِي سَعِيدٍ الْخُدْرِيِّ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «لَقِّنُوا مَوْتَاكُمْ لَا إِلَهَ إِلَّا اللَّهُ»، وَعَنْ مُعَاذِ بْنِ جَبَلٍ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ كَانَ آخِرُ كَلَامِهِ لَا إِلَهَ إِلَّا اللَّهُ دَخَلَ الْجَنَّةَ».",
    hadithTextEnglish:
      "Abu Sa‘id al-Khudri reported that the Messenger of Allah ﷺ said: “Exhort your dying ones to say: There is no god but Allah.” And Mu‘adh ibn Jabal reported that the Messenger of Allah ﷺ said: “He whose last words are: There is no god but Allah, will enter Paradise.”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A916",
  },
];

const SOCIAL_COMMUNITY_AZKAR: ZikrDraft[] = [
  {
    id: "sc-ref-1",
    category: "social_community",
    orderIndex: 0,
    arabicText: "السَّلَامُ عَلَيكُم وَرَحمَةُ اللَّهِ وَبَرَكَاتُهُ",
    transliteration: "Assalamu 'alaykum wa rahmatullahi wa barakatuh",
    translation: "Peace, mercy, and blessings of Allah be upon you.",
    benefit: "Complete Islamic greeting earning 30 rewards.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 5195; Hisn al-Muslim 72.",
    hadithText:
      "عن عمران بن حصين رضي الله عنهما قال: جاء رجل إلى النبي ﷺ فقال: السلام عليكم، فرد عليه وقال: «عشر»، ثم جاء آخر فقال: السلام عليكم ورحمة الله، فرد عليه وقال: «عشرون»، ثم جاء آخر فقال: السلام عليكم ورحمة الله وبركاته، فرد عليه وقال: «ثلاثون».",
    hadithTextEnglish:
      "‘Imran ibn Husayn (may Allah be pleased with them both) said: A man came to the Prophet ﷺ and said: Peace be upon you. He returned the greeting and said: “Ten.” Then another came and said: Peace be upon you and the mercy of Allah. He returned it and said: “Twenty.” Then another came and said: Peace be upon you and the mercy of Allah and His blessings. He returned it and said: “Thirty.”",
    authenticityNote: "Sahih (Abu Dawud).",
  },
  {
    id: "sc-ref-2",
    category: "social_community",
    orderIndex: 1,
    arabicText: "وَعَلَيكُمُ السَّلَامُ وَرَحمَةُ اللَّهِ وَبَرَكَاتُهُ",
    transliteration: "Wa 'alaykumus-salamu wa rahmatullahi wa barakatuh",
    translation: "And upon you peace, and the mercy and blessings of Allah.",
    benefit: "Complete response to Islamic greeting.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 5195; Hisn al-Muslim 72.",
    hadithText:
      "عن عائشة رضي الله عنها قالت: قال لي رسول الله ﷺ: «هذا جبريل يقرأ عليك السلام»، فقلت: «وعليه السلام ورحمة الله وبركاته».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) said: The Messenger of Allah ﷺ said to me: “This is Jibril, sending you greetings of peace.” I said: “And upon him be peace, and the mercy of Allah and His blessings.”",
    authenticityNote: "Sahih (Abu Dawud).",
  },
  {
    id: "sc-ref-3",
    category: "social_community",
    orderIndex: 2,
    arabicText: "يَرحَمُكَ اللَّهُ",
    transliteration: "Yarhamukallah",
    translation: "May Allah have mercy on you (response to sneezer who said Alhamdulillah).",
    benefit: "Obligatory response when a brother praises Allah after sneezing.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 7/125; Hisn al-Muslim 188.",
    hadithText:
      "عن أبي هريرة رضي الله عنه عن النبي ﷺ قال: «إذا عطس أحدكم فليقل: الحمد لله، وليقل له أخوه أو صاحبه: يرحمك الله، فَإِذَا قَالَ لَهُ: يَرْحَمُكَ اللَّهُ، فَلْيَقُلْ: يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “When one of you sneezes, let him say: Praise be to Allah; and let his brother or companion say to him: May Allah have mercy on you. And when he says to him: May Allah have mercy on you, let him reply: May Allah guide you and set your affairs right.”",
    authenticityNote: "Sahih al-Bukhari.",
  },
  {
    id: "sc-ref-4",
    category: "social_community",
    orderIndex: 3,
    arabicText: "يَهدِيكُمُ اللَّهُ وَيُصلِحُ بَالَكُم",
    transliteration: "Yahdikumullahu wa yuslihu balakum",
    translation: "May Allah guide you and improve your condition.",
    benefit: "Sneezer's response to 'Yarhamukallah'.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 7/125; Hisn al-Muslim 188.",
    hadithText: "عن أبي هريرة رضي الله عنه عن النبي ﷺ قال: «فإذا قال له يرحمك الله، فليقل: يهديكم الله ويصلح بالكم».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “And when he says to him: May Allah have mercy on you, let him reply: May Allah guide you and set your affairs right.”",
    authenticityNote: "Sahih al-Bukhari.",
  },
  {
    id: "sc-ref-5",
    category: "social_community",
    orderIndex: 4,
    arabicText: "جَزَاكَ اللَّهُ خَيرًا",
    transliteration: "Jazakallahu khayran",
    translation: "May Allah reward you with good.",
    benefit: "Best expression of gratitude to someone doing a favor.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 2035.",
    hadithText:
      "عن أسامة بن زيد رضي الله عنهما قال: قال رسول الله ﷺ: «من صُنع إليه معروف فقال لفاعله: جزاك الله خيراً فقد أبلغ في الثناء».",
    hadithTextEnglish:
      "Usamah ibn Zayd (may Allah be pleased with them both) said: The Messenger of Allah ﷺ said: “Whoever has a kindness done for him and says to the one who did it: May Allah reward you with good — has given praise in full.”",
    authenticityNote: "Authenticated.",
  },
  {
    id: "sc-ref-6",
    category: "social_community",
    orderIndex: 5,
    arabicText: "بَارَكَ اللَّهُ فِيكَ",
    transliteration: "Barakallahu fik",
    translation: "May Allah bless you.",
    benefit: "Prophetic supplication of blessing for a Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Various Sahih narrations.",
    hadithText:
      "عن عائشة رضي الله عنها أن النبي ﷺ كان إذا أُهديت له شاة قال: «ما فعلوا؟» فتقول عائشة: يدعون لهم، فيقول النبي ﷺ: «وبارك الله فيهم، نرد عليهم مثل ما قالوا ويبقى لنا أجرنا».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that when a sheep was given to the Prophet ﷺ as a gift, he would ask: “What did they do?” ‘A’ishah would say: They are praying for them. The Prophet ﷺ would say: “And may Allah bless them. We return to them the like of what they said, and our own reward remains for us.”",
    authenticityNote: "Sahih.",
  },
  {
    id: "sc-ref-7",
    category: "social_community",
    orderIndex: 6,
    arabicText: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيكَ وَجَمَعَ بَينَكُمَا فِي خَيرٍ",
    transliteration: "Barakallahu laka wa baraka 'alayka wa jama'a baynakuma fi khayr",
    translation: "May Allah bless you and bestow blessings upon you and bring you together in goodness.",
    benefit: "Dua for a newly married couple.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 2130; Jami' at-Tirmidhi 1091; Hisn al-Muslim 98.",
    hadithText:
      "عن أبي هريرة رضي الله عنه أن النبي ﷺ كان إذا رفأ الإنسان إذا تزوج قال: «بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيكَ وَجَمَعَ بَينَكُمَا فِي خَيرٍ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that when the Prophet ﷺ congratulated a person on marrying, he would say: “May Allah bless you, and send blessings upon you, and join you both in good.”",
    authenticityNote: "Sahih (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "sc-ref-8",
    category: "social_community",
    orderIndex: 7,
    arabicText:
      "إِنَّا لِلَّهِ وَإِنَّا إِلَيهِ رَاجِعُونَ، اللَّهُمَّ أْجُرنِي فِي مُصِيبَتِي وَأَخلِف لِي خَيرًا مِنَها",
    transliteration: "Inna lillahi wa inna ilaihi raji'un, Allahumma'-jurni fi musibati wa akhlif li khayran minha",
    translation:
      "Indeed we belong to Allah and to Him we shall return. O Allah, reward me in my affliction and replace it with something better.",
    benefit: "Recited upon experiencing a calamity or loss.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 918; Hisn al-Muslim 134.",
    hadithText:
      "عن أم سلمة رضي الله عنها قالت: سمعت رسول الله ﷺ يقول: «ما من مسلم تصيبه مصيبة فيقول ما أمره الله: إنا لله وإنا إليه راجعون، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا، إلا أخلف الله له خيراً منها».",
    hadithTextEnglish:
      "Umm Salamah (may Allah be pleased with her) said: I heard the Messenger of Allah ﷺ say: “There is no Muslim struck by an affliction who says what Allah has commanded him — We belong to Allah and to Him we return; O Allah, reward me in my affliction and give me something better than it in its place — except that Allah gives him something better than it in its place.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "sc-ref-9",
    category: "social_community",
    orderIndex: 8,
    arabicText: "اللَّهُمَّ اغفِر لَهُ وَارفَع دَرَجَتَهُ فِي المَهدِيِّينَ وَاخْلُفْهُ فِي عَقِبِهِ فِي الْغَابِرِينَ",
    transliteration: "Allahummaghfir lahu warfa' darajatahu fil-mahdiyyina wakhlufhu fi 'aqibihi fil-ghabirin",
    translation:
      "O Allah, forgive him and elevate his station among the rightly-guided and be a successor in his affairs for his family.",
    benefit: "Dua upon visiting or hearing of a deceased Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 920; Hisn al-Muslim 135.",
    hadithText:
      "عن أم سلمة رضي الله عنها قالت: دخل رسول الله ﷺ على أبي سلمة وقد شق بصره فأغمضه ثم قال: «اللَّهُمَّ اغفِر لِأَبِي سَلَمَةَ وَارفَع دَرَجَتَهُ فِي المَهدِيِّينَ، وَاخْلُفْهُ فِي عَقِبِهِ فِي الْغَابِرِينَ، وَاغْفِرْ لَنَا وَلَهُ يَا رَبَّ الْعَالَمِينَ، وَافْسَحْ لَهُ فِي قَبْرِهِ، وَنَوِّرْ لَهُ فِيهِ».",
    hadithTextEnglish:
      "Umm Salamah (may Allah be pleased with her) said: The Messenger of Allah ﷺ came in upon Abu Salamah when his eyes were fixed in death, and he closed them. Then he said: “O Allah, forgive Abu Salamah, raise his rank among those who are guided, be a successor to what he left behind among those who remain, forgive us and him, Lord of the worlds, make his grave spacious for him, and give him light within it.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "sc-ref-10",
    category: "social_community",
    orderIndex: 9,
    arabicText:
      "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    transliteration: "Subhanakallahumma wa bihamdika, ashhadu an la ilaha illa Anta, astaghfiruka wa atubu ilayk.",
    translation:
      "Glory be to You, O Allah, and praise be to You. I bear witness that there is no god but You. I seek Your forgiveness and repent to You.",
    benefit: "Expiation of any unintentional idle talk or shortcomings in a gathering or sitting (Kafarat al-Majlis).",
    benefitArabic: "كفارة المجلس؛ ما من جالس في مجلس يكثر فيه لغطه فيقوله إلا غفر الله له ما كان في مجلسه.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami` at-Tirmidhi 3433; Sunan Abi Dawud 4859; Hisn al-Muslim 196.",
    sourceReferenceArabic: "جامع الترمذي ٣٤٣٣؛ سنن أبي داود ٤٨٥٩؛ حصن المسلم ١٩٦.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ جَلَسَ فِي مَجْلِسٍ فَكَثُرَ فِيهِ لَغَطُهُ، فَقَالَ قَبْلَ أَنْ يَقُومَ مِنْ مَجْلِسِهِ ذَلِكَ: سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ، إِلَّا غُفِرَ لَهُ مَا كَانَ فِي مَجْلِسِهِ ذَلِكَ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever sits in a gathering where there is much idle talk, and says before standing up: ‘Glory be to You, O Allah, and praise be to You; I testify that there is no god but You; I seek Your forgiveness and repent to You’ — whatever occurred in that gathering will be forgiven for him.”",
    authenticityNote: "Sahih according to Al-Albani.",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3433",
  },
  {
    id: "sc-ref-11",
    category: "social_community",
    orderIndex: 10,
    arabicText: "بِسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا",
    transliteration: "Bismillahi, Allahumma jannibnash-shaytana, wa jannibish-shaytana ma razaqtana.",
    translation:
      "In the name of Allah. O Allah, keep Satan away from us, and keep Satan away from what You bestow upon us.",
    benefit:
      "Supplication before marital intimacy / sexual intercourse with one's wife; if a child is decreed from that union, Satan will never harm them.",
    benefitArabic: "دعاء الجماع وإتيان الزوجة؛ فإن يُقَدَّر بينهما ولد لم يضره الشيطان أبداً.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6388; Sahih Muslim 1434; Hisn al-Muslim 190.",
    sourceReferenceArabic: "صحيح البخاري ٦٣٨٨؛ صحيح مسلم ١٤٣٤؛ حصن المسلم ١٩٠.",
    hadithText:
      "عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما قَالَ: قَالَ النَّبِيُّ ﷺ: «لَوْ أَنَّ أَحَدَكُمْ إِذَا أَرَادَ أَنْ يَأْتِيَ أَهْلَهُ قَالَ: بِاسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا، فَإِنَّهُ إِنْ يُقَدَّرْ بَيْنَهُمَا وَلَدٌ فِي ذَلِكَ لَمْ يَضُرَّهُ شَيْطَانٌ أَبَدًا».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) narrated that the Prophet ﷺ said: “If any of you, when intending to have marital relations with his wife, says: ‘In the name of Allah, O Allah, protect us from Satan and protect whatever You provide for us from Satan’ — then if a child is decreed for them from that, Satan will never be able to harm him.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A6388",
  },
  {
    id: "sc-ref-12",
    category: "social_community",
    orderIndex: 11,
    arabicText:
      "أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    transliteration: "U'idhuka bi-kalimatil-lahit-tammah, min kulli shaytanin wa hammah, wa min kulli 'aynin lammah.",
    translation:
      "I seek protection for you in the perfect words of Allah, from every devil and poisonous creature, and from every envious eye.",
    benefit:
      "Prophetic supplication for seeking Allah's protection for newborn children from evil, malice, and the evil eye.",
    benefitArabic: "تعويذ نبوي للأولاد والأطفال بحفظ الله التام من الشياطين والهوام وكل عين لامة.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 3371; Hisn al-Muslim 146.",
    sourceReferenceArabic: "صحيح البخاري ٣٣٧١؛ حصن المسلم ١٤٦.",
    hadithText:
      "عَنِ ابْنِ عَبَّاسٍ رضي الله عنهما قَالَ: كَانَ النَّبِيُّ ﷺ يُعَوِّذُ الْحَسَنَ وَالْحُسَيْنَ: «أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ» وَيَقُولُ: «إِنَّ أَبَاكُمَا كَانَ يُعَوِّذُ بِهَا إِسْمَاعِيلَ وَإِسْحَاقَ».",
    hadithTextEnglish:
      "Ibn ‘Abbas (may Allah be pleased with them both) narrated that the Prophet ﷺ used to seek refuge for Al-Hasan and Al-Husayn: “I seek refuge for you both in the perfect words of Allah, from every devil and poisonous reptile, and from every evil eye.” And he would say: “Your forefather used to seek refuge with them for Isma‘il and Ishaq.”",
    authenticityNote: "Sahih al-Bukhari.",
    sourceUrl: "https://sunnah.com/bukhari%3A3371",
  },
  {
    id: "sc-ref-13",
    category: "social_community",
    orderIndex: 12,
    arabicText:
      "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا",
    transliteration:
      "Alhamdu lillahilladhi 'afani mimmabtalaaka bihi, wa faddalani 'ala kathirin mimman khalaqa tafdila.",
    translation:
      "All praise is for Allah who spared me from what He afflicted you with, and favored me over much of what He created.",
    benefit:
      "Whoever sees an afflicted person and recites this quietly will be shielded from that trial for the rest of their life.",
    benefitArabic: "من رأى مبتلى فقالها سراً عافاه الله من ذلك البلاء كائناً ما كان ما عاش.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami` at-Tirmidhi 3431; Hisn al-Muslim 198.",
    sourceReferenceArabic: "جامع الترمذي ٣٤٣١؛ حصن المسلم ١٩٨.",
    hadithText:
      "عَنِ ابْنِ عُمَرَ رضي الله عنهما أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ رَأَى مُبْتَلًى فَقَالَ: الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا، لَمْ يُصِبْهُ ذَلِكَ الْبَلَاءُ كَائِنًا مَا كَانَ مَا عَاشَ».",
    hadithTextEnglish:
      "Ibn ‘Umar reported that the Messenger of Allah ﷺ said: “Whoever sees an afflicted person and says: ‘Praise be to Allah Who spared me from what He has afflicted you with, and has favored me over many of those He created’ — that affliction will not strike him as long as he lives.”",
    authenticityNote: "Hasan according to Al-Albani.",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3431",
  },
  {
    id: "sc-ref-14",
    category: "social_community",
    orderIndex: 13,
    arabicText: "مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ، اللَّهُمَّ بَارِكْ فِيهِ",
    transliteration: "Ma sha' Allah, la quwwata illa billah, Allahumma barik fih.",
    translation: "What Allah wills; there is no power except by Allah. O Allah, bless it.",
    benefit:
      "Supplication upon admiring one's own possessions or someone else's blessing, invoking Barakah and repelling the evil eye.",
    benefitArabic: "ما يقوله المرء إذا رأى ما يعجبه من ماله أو ولده أو أخيه طلباً للبركة ودفعاً للعين والحسد.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muwatta Malik 1746; Musnad Ahmad 15700.",
    sourceReferenceArabic: "موطأ مالك ١٧٤٦؛ مسند أحمد ١٥٧٠٠.",
    hadithText:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «إِذَا رَأَى أَحَدُكُمْ مِنْ أَخِيهِ، أَوْ مِنْ نَفْسِهِ، أَوْ مِنْ مَالِهِ مَا يُعْجِبُهُ فَلْيُبَرِّكْهُ، فَإِنَّ الْعَيْنَ حَقٌّ».",
    hadithTextEnglish:
      "The Messenger of Allah ﷺ said: “When one of you sees in his brother, in himself, or in his wealth something that pleases him, let him pray for blessings for it, for the evil eye is real.”",
    authenticityNote: "Sahih according to Al-Albani.",
    sourceUrl: "https://sunnah.com/ahmad%3A15700",
  },
];

const NATURAL_EVENTS_AZKAR: ZikrDraft[] = [
  {
    id: "ne-ref-1",
    category: "natural_events",
    orderIndex: 0,
    arabicText:
      "اللَّهُمَّ إِنِّي أَسأَلُكَ خَيرَهَا وَخَيرَ مَا فِيهَا وَأَعُوذُ بِكَ مِن شَرِّهَا وَشَرِّ مَا فِيهَا",
    transliteration: "Allahumma inni as'aluka khayraha wa khayra ma fiha wa a'udhu bika min sharriha wa sharri ma fiha",
    translation:
      "O Allah, I ask You for its good and what good is in it, and I seek refuge in You from its evil and what evil is in it.",
    benefit: "Recited when strong winds blow.",
    benefitArabic: "دعاء هبوب الريح والعواصف؛ يسأل الله خيرها ويتعوذ به من شرها وما أرسلت به.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 899; Hisn al-Muslim 170.",
    sourceReferenceArabic: "صحيح مسلم ٨٩٩؛ حصن المسلم ١٧٠.",
    hadithText:
      "عن عائشة رضي الله عنها قالت: كان النبي ﷺ إذا عصفت الريح قال: «اللَّهُمَّ إِنِّي أَسأَلُكَ خَيرَهَا وَخَيرَ مَا فِيهَا، وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا فِيهَا، وَشَرِّ مَا أُرْسِلَتْ بِهِ».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) said: When the wind blew hard, the Prophet ﷺ would say: “O Allah, I ask You for its good, the good that is in it, and the good it was sent with; and I seek refuge in You from its evil, the evil that is in it, and the evil it was sent with.”",
    authenticityNote: "Sahih Muslim.",
    sourceUrl: "https://sunnah.com/muslim%3A899",
  },
  {
    id: "ne-ref-2",
    category: "natural_events",
    orderIndex: 1,
    arabicText: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    transliteration: "Allahumma sayyiban nafi'a",
    translation: "O Allah, make it beneficial rain.",
    benefit: "Recited when rain starts falling.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 2/518; Hisn al-Muslim 171.",
    hadithText: "عن عائشة رضي الله عنها أن رسول الله ﷺ كان إذا رأى المطر قال: «اللَّهُمَّ صَيِّبًا نَافِعًا».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) reported that when the Messenger of Allah ﷺ saw rain he would say: “O Allah, a downpour of benefit.”",
    authenticityNote: "Sahih al-Bukhari.",
  },
  {
    id: "ne-ref-3",
    category: "natural_events",
    orderIndex: 2,
    arabicText: "مُطِرنَا بِفَضلِ اللَّهِ وَرَحمَتِهِ",
    transliteration: "Mutirna bi-fadlillahi wa rahmathih",
    translation: "We have been given rain by the grace and mercy of Allah.",
    benefit: "Recited after rain stops.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 846; Sahih Muslim 71; Hisn al-Muslim 172.",
    hadithText:
      "عن زيد بن خالد الجهني رضي الله عنه قال: صَلَّى لَنَا رَسُولُ اللَّهِ ﷺ صَلَاةَ الصُّبْحِ بِالْحُدَيْبِيَةِ عَلَى إِثْرِ سَمَاءٍ كَانَتْ مِنَ اللَّيْلِ، فَلَمَّا انْصَرَفَ أَقْبَلَ عَلَى النَّاسِ فَقَالَ: «هَلْ تَدْرُونَ مَاذَا قَالَ رَبُّكُمْ؟» قَالُوا: اللَّهُ وَرَسُولُهُ أَعْلَمُ. قَالَ: «قَالَ: أَصْبَحَ مِنْ عِبَادِي مُؤْمِنٌ بِي وَكَافِرٌ؛ فَأَمَّا مَنْ قَالَ: مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ، فَذَلِكَ مُؤْمِنٌ بِي كَافِرٌ بِالْكَوْكَبِ، وَأَمَّا مَنْ قَالَ: مُطِرْنَا بِنَوْءِ كَذَا وَكَذَا، فَذَلِكَ كَافِرٌ بِي مُؤْمِنٌ بِالْكَوْكَبِ».",
    hadithTextEnglish:
      "Zayd ibn Khalid al-Juhani (may Allah be pleased with him) said: The Messenger of Allah ﷺ led us in the dawn prayer at al-Hudaybiyah after rain had fallen in the night. When he finished he turned to the people and said: “Do you know what your Lord has said?” They said: Allah and His Messenger know best. He said: “He said: This morning some of My servants believe in Me and some disbelieve. As for the one who said: We have been given rain by the grace of Allah and His mercy — he believes in Me and disbelieves in the stars. And as for the one who said: We have been given rain by such and such a star — he disbelieves in Me and believes in the stars.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "ne-ref-4",
    category: "natural_events",
    orderIndex: 3,
    arabicText: "سُبحَانَ الَّذِي يُسَبِّحُ الرَّعدُ بِحَمدِهِ وَالمَلَائِكَةُ مِن خِيفَتِهِ",
    transliteration: "Subhanalladhi yusabbihur-ra'du bi-hamdihi wal-mala'ikatu min khifatih",
    translation: "Glory be to the One Whom the thunder glorifies with His praise, and the angels from fear of Him.",
    benefit: "Recited upon hearing thunder.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muwatta Imam Malik 2/992; Hisn al-Muslim 173.",
    hadithText:
      "عن عبد الله بن الزبير رضي الله عنهما أنه كان إذا سمع الرعد ترك الحديث وقال: «سُبحَانَ الَّذِي يُسَبِّحُ الرَّعدُ بِحَمدِهِ وَالمَلَائِكَةُ مِن خِيفَتِهِ» ثم يقول: إن هذا لوعيد شديد لأهل الأرض.",
    hadithTextEnglish:
      "‘Abdullah ibn al-Zubayr (may Allah be pleased with them both) would stop speaking when he heard thunder and say: “Glory be to Him whom the thunder glorifies with praise, and the angels too, out of awe of Him.” Then he would say: This is a severe warning to the people of the earth.",
    authenticityNote: "Authenticated by al-Albani.",
  },
  {
    id: "ne-ref-5",
    category: "natural_events",
    orderIndex: 4,
    arabicText:
      "اللَّهُمَّ أَهِلَّهُ عَلَينَا بِالأَمنِ وَالإِيمَانِ وَالسَّلَامَةِ وَالإِسلَامِ رَبِّي وَرَبُّكَ اللَّهُ",
    transliteration: "Allahumma ahillahu 'alayna bil-amni wal-imani was-salamati wal-Islami, Rabbi wa Rabbukallah",
    translation:
      "O Allah, let this crescent moon rise on us with security, faith, safety, and Islam. My Lord and your Lord is Allah.",
    benefit: "Recited upon sighting the new crescent moon.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami' at-Tirmidhi 3451; Hisn al-Muslim 168.",
    hadithText:
      "عن طلحة بن عبيد الله رضي الله عنه أن النبي ﷺ كان إذا رأى الهلال قال: «اللَّهُمَّ أَهِلَّهُ عَلَينَا بِالأَمنِ وَالإِيمَانِ وَالسَّلَامَةِ وَالإِسلَامِ رَبِّي وَرَبُّكَ اللَّهُ».",
    hadithTextEnglish:
      "Talhah ibn ‘Ubaydullah (may Allah be pleased with him) reported that when the Prophet ﷺ saw the new moon he would say: “O Allah, bring it over us with security and faith, with safety and Islam. My Lord and your Lord is Allah.”",
    authenticityNote: "Authenticated.",
  },
  {
    id: "ne-ref-6",
    category: "natural_events",
    orderIndex: 5,
    arabicText: "اللَّهُمَّ إِنِّي أَسأَلُكَ خَيرَهَا وَأَعُوذُ بِكَ مِن شَرِّهَا",
    transliteration: "Allahumma inni as'aluka khayraha wa a'udhu bika min sharriha",
    translation:
      "O Allah, I ask You for its good and I seek refuge in You from its evil (Dua during solar/lunar eclipse).",
    benefit: "Recited during eclipse prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Abu Dawud 1194; Sunan Ibn Majah 1264.",
    hadithText:
      "عَنْ عَائِشَةَ رضي الله عنها قَالَتْ: خَسَفَتِ الشَّمْسُ فِي عَهْدِ رَسُولِ اللَّهِ ﷺ فَصَلَّى رَسُولُ اللَّهِ ﷺ بِالنَّاسِ، فَقَامَ فَأَطَالَ الْقِيَامَ، ثُمَّ رَكَعَ فَأَطَالَ الرُّكُوعَ، ثُمَّ قَامَ فَأَطَالَ الْقِيَامَ وَهُوَ دُونَ الْقِيَامِ الْأَوَّلِ، ثُمَّ رَكَعَ فَأَطَالَ الرُّكُوعَ وَهُوَ دُونَ الرُّكُوعِ الْأَوَّلِ، ثُمَّ سَجَدَ فَأَطَالَ السُّجُودَ، ثُمَّ فَعَلَ فِي الرَّكْعَةِ الثَّانِيَةِ مِثْلَ مَا فَعَلَ فِي الْأُولَى، ثُمَّ انْصَرَفَ وَقَدِ انْجَلَتِ الشَّمْسُ، فَخَطَبَ النَّاسَ، فَحَمِدَ اللَّهَ وَأَثْنَى عَلَيْهِ، ثُمَّ قَالَ: «إِنَّ الشَّمْسَ وَالْقَمَرَ آيَتَانِ مِنْ آيَاتِ اللَّهِ لَا يَنْخَسِفَانِ لِمَوْتِ أَحَدٍ وَلَا لِحَيَاتِهِ، فَإِذَا رَأَيْتُمْ ذَلِكَ فَادْعُوا اللَّهَ وَكَبِّرُوا، وَصَلُّوا وَتَصَدَّقُوا».",
    hadithTextEnglish:
      "‘A’ishah (may Allah be pleased with her) said: The sun was eclipsed in the time of the Messenger of Allah ﷺ, and he led the people in prayer. He stood and made the standing long, then bowed and made the bowing long, then stood again and made the standing long, though shorter than the first, then bowed and made the bowing long, though shorter than the first, then prostrated and made the prostration long; and he did in the second cycle as he had done in the first. Then he finished, and the sun had cleared. He addressed the people, praised Allah and extolled Him, then said: “The sun and the moon are two signs among the signs of Allah. They are not eclipsed for the death of anyone, nor for his life. So when you see that, call upon Allah, magnify Him, pray, and give in charity.”",
    authenticityNote: "Sahih.",
  },
  {
    id: "ne-ref-7",
    category: "natural_events",
    orderIndex: 6,
    arabicText:
      "اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا، اللَّهُمَّ عَلَى الْآكَامِ وَالظِّرَابِ، وَبُطُونِ الْأَوْدِيَةِ، وَمَنَابِتِ الشَّجَرِ",
    transliteration:
      "Allahumma hawalayna wa la 'alayna, Allahumma 'alal-akami waz-zirabi, wa butunil-awdiyati, wa manabitish-shajar.",
    translation:
      "O Allah, around us and not upon us. O Allah, upon the plateaus, the hills, the bottoms of the valleys, and where the trees grow.",
    benefit: "Supplication when rain becomes torrential and damage or flooding is feared (al-Istisah).",
    benefitArabic: "دعاء الاستصحاء وصرف المطر إذا كثر وخيف منه الضرر على البيوت والأنفس.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 1014; Sahih Muslim 897; Hisn al-Muslim 175.",
    sourceReferenceArabic: "صحيح البخاري ١٠١٤؛ صحيح مسلم ٨٩٧؛ حصن المسلم ١٧٥.",
    hadithText:
      "عَنْ أَنَسِ بْنِ مَالِكٍ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ دَعَا لَمَّا كَثُرَ الْمَطَرُ فَقَالَ: «اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا، اللَّهُمَّ عَلَى الْآكَامِ وَالظِّرَابِ، وَبُطُونِ الْأَوْدِيَةِ، وَمَنَابِتِ الشَّجَرِ».",
    hadithTextEnglish:
      "Anas ibn Malik (may Allah be pleased with him) reported that the Messenger of Allah ﷺ supplicated when rain was torrential: “O Allah, around us and not upon us. O Allah, on the plateaus, the hills, the valley floors, and where the trees grow.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A1014",
  },
];

const MISCELLANEOUS_AZKAR: ZikrDraft[] = [
  {
    id: "misc-ref-1",
    category: "miscellaneous",
    orderIndex: 0,
    arabicText: "اللَّهُمَّ اهدِنِي وَسَدِّدنِي",
    transliteration: "Allahummahdini wa saddidni",
    translation: "O Allah, guide me and set me right.",
    benefit: "Prophetic supplication for divine guidance and firmness.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2725; Hisn al-Muslim 127.",
    hadithText:
      "عن علي بن أبي طالب رضي الله عنه قال: قال لي رسول الله ﷺ: «قل: اللهم اهدني وسددني، واذكر بالهدى هدايتك الطريق، وبالسداد سداد السهم».",
    hadithTextEnglish:
      "‘Ali ibn Abi Talib (may Allah be pleased with him) said: The Messenger of Allah ﷺ said to me: “Say: O Allah, guide me and set me straight — and by guidance call to mind being guided on a road, and by straightness the straightness of an arrow.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "misc-ref-2",
    category: "miscellaneous",
    orderIndex: 1,
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحدَهُ لَا شَرِيكَ لَهُ لَهُ المُلكُ وَلَهُ الحَمدُ وَهُوَ عَلَى كُلِّ شَيءٍ قَدِيرٌ",
    transliteration:
      "La ilaha illallahu wahdahu la sharika lahu lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir",
    translation:
      "None has the right to be worshipped but Allah alone, with no partner. To Him belongs dominion and praise, and He is All-Capable.",
    benefit:
      "100 times daily — equals freeing 10 slaves, grants 100 good deeds, erases 100 sins, shields from Shaytan.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Sahih al-Bukhari 3293; Sahih Muslim 2691; Hisn al-Muslim 152.",
    hadithText:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، فِي يَوْمٍ مِائَةَ مَرَّةٍ، كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ، وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ إِلَّا أَحَدٌ عَمِلَ أَكْثَرَ مِنْ ذَلِكَ».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever says: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — a hundred times in a day, it is for him the equal of freeing ten slaves, a hundred good deeds are written for him, a hundred sins are erased from him, and it is a protection for him from Satan for that day until evening; and no one brings anything better than what he brought, except one who does more than that.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "misc-ref-3",
    category: "miscellaneous",
    orderIndex: 2,
    arabicText: "سُبحَانَ اللَّهِ وَبِحَمدِهِ",
    transliteration: "Subhanallahi wa bihamdih",
    translation: "Glory be to Allah and with His praise (100 times daily).",
    benefit: "Forgives sins even if they are as abundant as the foam of the sea.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Sahih al-Bukhari 6042; Sahih Muslim 2691; Hisn al-Muslim 153.",
    hadithText:
      "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: «من قال سبحان الله وبحمده في يوم مائة مرة حُطت خطاياه وإن كانت مثل زبد البحر».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever says: Glory be to Allah and praise be to Him — a hundred times in a day, his sins are wiped away, even were they like the foam of the sea.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "misc-ref-4",
    category: "miscellaneous",
    orderIndex: 3,
    arabicText: "سُبحَانَ اللَّهِ وَبِحَمدِهِ سُبحَانَ اللَّهِ العَظِيمِ",
    transliteration: "Subhanallahi wa bihamdihi Subhanallahil-'Azim",
    translation: "Glory be to Allah and with His praise; Glory be to Allah the Magnificent.",
    benefit: "Two phrases light on the tongue, heavy on the balance, beloved to the Most Merciful.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 7563; Sahih Muslim 2694; Hisn al-Muslim 154.",
    hadithText:
      "عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: «كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم».",
    hadithTextEnglish:
      "Abu Hurayrah (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Two words are light upon the tongue, heavy in the scale, beloved to the Most Merciful: Glory be to Allah and praise be to Him; glory be to Allah the Immense.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "misc-ref-5",
    category: "miscellaneous",
    orderIndex: 4,
    arabicText: "اللَّهُمَّ إِنِّي أَسأَلُكَ العَفوَ وَالعَافِيَةَ فِي الدُّنيَا وَالآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah",
    translation: "O Allah, I ask You for pardon and well-being in this world and the next.",
    benefit: "Most comprehensive plea for protection in life and the afterlife.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sunan Ibn Majah 3871; Hisn al-Muslim 126.",
    hadithText:
      "عن ابن عمر رضي الله عنهما قال: لم يكن رسول الله ﷺ يدع هؤلاء الدعوات حين يمسي وحين يصبح: «اللَّهُمَّ إِنِّي أَسأَلُكَ العَفوَ وَالعَافِيَةَ فِي الدُّنيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي».",
    hadithTextEnglish:
      "Ibn ‘Umar (may Allah be pleased with them both) said: The Messenger of Allah ﷺ never left these supplications, evening and morning: “O Allah, I ask You for pardon and wellbeing in this world and the next. O Allah, I ask You for pardon and wellbeing in my religion, my worldly life, my family and my property. O Allah, conceal my faults and calm my fears. O Allah, guard me from before me and behind me, from my right and my left and from above me, and I seek refuge in Your greatness from being taken unawares from beneath me.”",
    authenticityNote: "Sahih by al-Albani.",
  },
  {
    id: "misc-ref-6",
    category: "miscellaneous",
    orderIndex: 5,
    arabicText: "لَا حَولَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    translation: "There is no might nor power except with Allah.",
    benefit: "A treasure from the treasures of Paradise.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 4409; Sahih Muslim 2704; Hisn al-Muslim 155.",
    hadithText:
      "عن أبا موسى الأشعري رضي الله عنه قال: قال لي رسول الله ﷺ: «ألا أدلك على كنز من كنوز الجنة؟ قلت: بلى يا رسول الله، قال: لا حول ولا قوة إلا بالله».",
    hadithTextEnglish:
      "Abu Musa al-Ash‘ari (may Allah be pleased with him) said: The Messenger of Allah ﷺ said to me: “Shall I not direct you to a treasure from the treasures of Paradise?” I said: Yes, Messenger of Allah. He said: “There is no power and no strength except with Allah.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "misc-ref-7",
    category: "miscellaneous",
    orderIndex: 6,
    arabicText: "اللَّهُمَّ اغفِر لِي وَارحَمنِي وَاهدِني وَارزُقنِي",
    transliteration: "Allahummaghfir li warhamni wahdini warzuqni",
    translation: "O Allah, forgive me, have mercy on me, guide me, and provide for me.",
    benefit: "Gathers all goodness of this life and the next.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih Muslim 2696; Hisn al-Muslim 156.",
    hadithText:
      "عن طارق بن أشيم رضي الله عنه قال: كان الرجل إذا أسلم علمه النبي ﷺ الصلاة ثم أمره أن يدعو بهؤلاء الكلمات: «اللَّهُمَّ اغفِر لِي وَارحَمنِي وَاهدِني وَارزُقنِي».",
    hadithTextEnglish:
      "Tariq ibn Ashyam (may Allah be pleased with him) said: When a man accepted Islam, the Prophet ﷺ would teach him the prayer, then instruct him to supplicate with these words: “O Allah, forgive me, have mercy on me, guide me, and provide for me.”",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "misc-ref-8",
    category: "miscellaneous",
    orderIndex: 7,
    arabicText:
      "اللَّهُمَّ أَنتَ رَبِّي لَا إِلَهَ إِلَّا أَنتَ خَلَقتَنِي وَأَنَا عَبدُكَ وَأَنَا عَلَى عَهدِكَ وَوَعدِكَ مَا استَطَعتُ أَعُوذُ بِكَ مِن شَرِّ مَا صَنَعتُ أَبُوءُ لَكَ بِنِعمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنبِي فَاغفِر لِي فَإِنَّهُ لَا يَغفِرُ الذُّنُوبَ إِلَّا أَنتَ",
    transliteration:
      "Allahumma anta Rabbi la ilaha illa anta khalaqtani wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi-ni'matika 'alayya wa abu'u bi-dhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa ant",
    translation:
      "Sayyid al-Istighfar: O Allah, You are my Lord. None has the right to be worshipped but You. You created me and I am Your servant, and I hold to Your covenant and Your promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    benefit:
      "The Master Supplication for Forgiveness. Whoever recites it with conviction during day or night and dies will enter Paradise.",
    benefitArabic: "سيد الاستغفار؛ من قاله موقناً به فمات من يومه أو ليلته فهو من أهل الجنة.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6306; Hisn al-Muslim 69.",
    sourceReferenceArabic: "صحيح البخاري ٦٣٠٦؛ حصن المسلم ٦٩.",
    hadithText:
      "عن شداد بن أوس رضي الله عنه عن النبي ﷺ قال: «سَيِّدُ الِاسْتِغْفَارِ أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ». قَالَ: «وَمَنْ قَالَهَا مِنَ النَّهَارِ مُوقِنًا بِهَا فَمَاتَ مِنْ يَوْمِهِ قَبْلَ أَنْ يُمْسِيَ فَهُوَ مِنْ أَهْلِ الْجَنَّةِ، وَمَنْ قَالَهَا مِنَ اللَّيْلِ وَهُوَ مُوقِنٌ بِهَا فَمَاتَ قَبْلَ أَنْ يُصْبِحَ فَهُوَ مِنْ أَهْلِ الْجَنَّةِ».",
    hadithTextEnglish:
      "Shaddad ibn Aws (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “The master supplication for forgiveness is that you say: O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I hold to Your covenant and Your promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You Your favour upon me, and I acknowledge before You my sin, so forgive me — for none forgives sins but You.” He said: “Whoever says it during the day, certain of it, and dies that day before evening, is among the people of Paradise; and whoever says it at night, certain of it, and dies before morning, is among the people of Paradise.”",
    authenticityNote: "Sahih al-Bukhari.",
  },
  {
    id: "misc-ref-9",
    category: "miscellaneous",
    orderIndex: 8,
    arabicText:
      "بِسمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسمِهِ شَيءٌ فِي الأَرضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ",
    transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim",
    translation:
      "In the name of Allah with Whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, All-Knowing.",
    benefit: "Whoever recites it 3 times, nothing will harm him.",
    benefitArabic: "من قالها ثلاثاً في الصباح والمساء لم يضره شيء.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Sunan Abu Dawud 5088; Jami' at-Tirmidhi 3388; Hisn al-Muslim 70.",
    sourceReferenceArabic: "سنن أبي داود ٥٠٨٨؛ جامع الترمذي ٣٣٨٨؛ حصن المسلم ٧٠.",
    hadithText:
      "عن عثمان بن عفان رضي الله عنه قال: قال رسول الله ﷺ: «ما من عبد يقول في صباح كل يوم ومساء كل ليلة: بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم ثلاث مرات لم يضره شيء».",
    hadithTextEnglish:
      "‘Uthman ibn ‘Affan (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “No servant says, on the morning of every day and the evening of every night: In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing — three times — and anything then harms him.”",
    authenticityNote: "Sahih (Abu Dawud & At-Tirmidhi).",
  },
  {
    id: "misc-ref-10",
    category: "miscellaneous",
    orderIndex: 9,
    arabicText:
      "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ. اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ.",
    transliteration:
      "Allahumma inni astakhiruka bi-'ilmika wa astaqdiruka bi-qudratika wa as'aluka min fadlikal-'azim, fa-innaka taqdiru wa la aqdir, wa ta'lamu wa la a'lam, wa Anta 'Allamul-ghuyub. Allahumma in kunta ta'lamu anna hadhal-amra khayrun li fi dini wa ma'ashi wa 'aqibati amri faqdurhu li wa yassirhu li thumma barik li fih. Wa in kunta ta'lamu anna hadhal-amra sharrun li fi dini wa ma'ashi wa 'aqibati amri fasrifhu 'anni wasrifni 'anhu waqdur liyal-khayra haythu kana thumma ardini bih.",
    translation:
      "O Allah, I seek Your counsel through Your knowledge, and I seek power through Your power, and I ask You from Your great favor; for You have power and I have none, and You know and I do not know, and You are the Knower of the unseen. O Allah, if You know that this matter is good for me in my religion, my livelihood, and the end of my affair, then decree it for me, facilitate it for me, and then bless me in it. And if You know that this matter is bad for me in my religion, my livelihood, and the end of my affair, then turn it away from me and turn me away from it, and decree for me what is good wherever it may be, and make me pleased with it.",
    benefit: "The Prophetic supplication of Istikharah, taught by the Prophet ﷺ to seek Allah's guidance in decisions.",
    benefitArabic: "دعاء صلاة الاستخارة النبوي لسؤال الله التوفيق والتيسير في القرارات والأمور كلها.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 1162; Hisn al-Muslim 93.",
    sourceReferenceArabic: "صحيح البخاري ١١٦٢؛ حصن المسلم ٩٣.",
    hadithText:
      "عَنْ جَابِرِ بْنِ عَبْدِ اللَّهِ رضي الله عنهما قَالَ: كَانَ رَسُولُ اللَّهِ ﷺ يُعَلِّمُنَا الِاسْتِخَارَةَ فِي الْأُمُورِ كُلِّهَا كَمَا يُعَلِّمُنَا السُّورَةَ مِنَ الْقُرْآنِ، يَقُولُ: «إِذَا هَمَّ أَحَدُكُمْ بِالْأَمْرِ فَلْيَرْكَعْ رَكْعَتَيْنِ مِنْ غَيْرِ الْفَرِيضَةِ ثُمَّ لِيَقُلْ: اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ...» الحديث.",
    hadithTextEnglish:
      "Jabir ibn ‘Abdullah narrated: The Messenger of Allah ﷺ used to teach us Istikharah in all matters just as he taught us a surah from the Qur'an. He said: “If any of you intends to undertake an affair, let him pray two non-obligatory rak'ahs and then say: O Allah, I seek Your counsel through Your knowledge...”",
    authenticityNote: "Sahih al-Bukhari.",
    sourceUrl: "https://sunnah.com/bukhari%3A1162",
  },
  {
    id: "misc-ref-11",
    category: "miscellaneous",
    orderIndex: 10,
    arabicText:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, yuhyi wa yumit, wa huwa hayyun la yamut, biyadihil-khayr, wa huwa 'ala kulli shay'in qadir.",
    translation:
      "None has the right to be worshipped except Allah alone, without partner. To Him belongs the dominion and to Him belongs praise. He gives life and causes death, and He is Living and never dies. In His hand is all good, and He is over all things capable.",
    benefit:
      "Said when entering the market: one million good deeds recorded, one million sins erased, and elevated one million degrees.",
    benefitArabic: "دعاء دخول السوق؛ يكتب الله لقائله ألف ألف حسنة ويمحو عنه ألف ألف سيئة ويرفع له ألف ألف درجة.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Jami` at-Tirmidhi 3428; Hisn al-Muslim 200.",
    sourceReferenceArabic: "جامع الترمذي ٣٤٢٨؛ حصن المسلم ٢٠٠.",
    hadithText:
      "عَنْ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ دَخَلَ السُّوقَ فَقَالَ: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، كَتَبَ اللَّهُ لَهُ أَلْفَ أَلْفِ حَسَنَةٍ، وَمَحَا عَنْهُ أَلْفَ أَلْفِ سَيِّئَةٍ، وَرَفَعَ لَهُ أَلْفَ أَلْفِ دَرَجَةٍ».",
    hadithTextEnglish:
      "‘Umar ibn al-Khattab narrated that the Messenger of Allah ﷺ said: “Whoever enters the market and says: ‘There is no god but Allah alone, without partner; His is the kingdom, and His is the praise; He gives life and causes death, and He is Ever-Living and never dies; in His Hand is all good, and He is capable of all things’ — Allah writes for him one million good deeds, erases from him one million sins, and raises him one million degrees.”",
    authenticityNote: "Hasan according to Al-Albani.",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3428",
  },
  {
    id: "misc-ref-12",
    category: "miscellaneous",
    orderIndex: 11,
    arabicText:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ",
    transliteration: "Allahumma inni a'udhu bika an ushrika bika wa ana a'lam, wa astaghfiruka lima la a'lam.",
    translation:
      "O Allah, I seek refuge in You from knowingly associating any partner with You, and I ask Your forgiveness for that which I do not know.",
    benefit: "Supplication to safeguard the heart from ostentation and subtle association of partners (minor Shirk).",
    benefitArabic: "دعاء الحماية من الشرك الخفي والرياء وسؤال المغفرة مما لا يعلمه العبد.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Al-Adab Al-Mufrad 716; Musnad Ahmad 19606; Hisn al-Muslim 203.",
    sourceReferenceArabic: "الأدب المفرد ٧١٦؛ مسند أحمد ١٩٦٠٦؛ حصن المسلم ٢٠٣.",
    hadithText:
      "عَنْ مَعْقِلِ بْنِ يَسَارٍ رضي الله عنه عَنْ أَبِي بَكْرٍ الصِّدِّيقِ رضي الله عنه قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «الشِّرْكُ فِيكُمْ أَخْفَى مِنْ دَبِيبِ النَّمْلِ، وَلَكِنْ سَأَدُلُّكَ عَلَى شَيْءٍ إِذَا فَعَلْتَهُ أَذْهَبَ عَنْكَ صِغَارَ الشِّرْكِ وَكِبَارَهُ: تَقُولُ: اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ، تَقُولُهَا ثَلَاثَ مَرَّاتٍ».",
    hadithTextEnglish:
      "Abu Bakr as-Siddiq narrated that the Messenger of Allah ﷺ said: “Shirk in you is more subtle than the creeping of ants, but I will guide you to something that, if you do it, will remove minor and major shirk from you: Say: O Allah, I seek refuge in You from associating anything with You while I know, and I seek Your forgiveness for what I do not know — three times.”",
    authenticityNote: "Sahih according to Al-Albani.",
    sourceUrl: "https://sunnah.com/adab%3A716",
  },
  {
    id: "misc-ref-13",
    category: "miscellaneous",
    orderIndex: 12,
    arabicText: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
    transliteration: "Rabbigh-fir li wa tub 'alayya, innaka Antat-Tawwabur-Rahim.",
    translation:
      "My Lord, forgive me and accept my repentance; indeed, You are the Accepter of Repentance, the Merciful.",
    benefit: "The Companions counted the Prophet ﷺ saying this one hundred times in a single gathering.",
    benefitArabic: "استغفار نبوي كان يعدّه الصحابة للنبي ﷺ في المجلس الواحد مائة مرة.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Sunan Abu Dawud 1516; Jami' at-Tirmidhi 3434; Hisn al-Muslim 208.",
    sourceReferenceArabic: "سنن أبي داود ١٥١٦؛ جامع الترمذي ٣٤٣٤؛ حصن المسلم ٢٠٨.",
    hadithText:
      "عَنِ ابْنِ عُمَرَ رضي الله عنهما قَالَ: إِنْ كُنَّا لَنَعُدُّ لِرَسُولِ اللَّهِ ﷺ فِي الْمَجْلِسِ الْوَاحِدِ مِائَةَ مَرَّةٍ: «رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ».",
    hadithTextEnglish:
      "Ibn ‘Umar said: We counted the Messenger of Allah ﷺ saying a hundred times in a single gathering: “My Lord, forgive me and accept my repentance; surely You are the One who accepts repentance, the Merciful.”",
    authenticityNote: "Sahih according to Al-Albani.",
    sourceUrl: "https://sunnah.com/abudawud%3A1516",
  },
  {
    id: "misc-ref-14",
    category: "miscellaneous",
    orderIndex: 13,
    arabicText: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajim.",
    translation: "I seek refuge in Allah from Satan the accursed.",
    benefit: "The Prophetic remedy for extinguishing rage and anger.",
    benefitArabic: "علاج الغضب النبوي بالاستعاذة بالله من وساوس الشيطان ونزغاته.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Sahih al-Bukhari 6115; Sahih Muslim 2610; Hisn al-Muslim 201.",
    sourceReferenceArabic: "صحيح البخاري ٦١١٥؛ صحيح مسلم ٢٦١٠؛ حصن المسلم ٢٠١.",
    hadithText:
      "عَنْ سُلَيْمَانَ بْنِ صُرَدٍ رضي الله عنه قَالَ: اسْتَبَّ رَجُلَانِ عِنْدَ النَّبِيِّ ﷺ فَجَعَلَ أَحَدُهُمَا يَغْضَبُ وَيَحْمَرُّ وَجْهُهُ، فَقَالَ النَّبِيُّ ﷺ: «إِنِّي لَأَعْلَمُ كَلِمَةً لَوْ قَالَهَا لَذَهَبَ عَنْهُ مَا يَجِدُ: أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ».",
    hadithTextEnglish:
      "Sulayman ibn Surad said: Two men reviled each other in the presence of the Prophet ﷺ and one became angry and his face turned red. The Prophet ﷺ said: “I know a word that if he were to say it, what he feels would leave him: I seek refuge in Allah from Satan the accursed.”",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/bukhari%3A6115",
  },
];

const eveningPerfectWords = EVENING_AZKAR.find((zikr) => zikr.id === "e-hm-97");
if (eveningPerfectWords) {
  MORNING_AZKAR.push({
    ...eveningPerfectWords,
    id: "m-hm-97",
    category: "morning",
    orderIndex: 0,
  });
}

type ArrangementItem = {
  id: string;
  core: boolean;
  ritualGroupId?: RitualGroupId;
};

type ArrangementGroup = {
  groupId: ZikrGroupId;
  items: ArrangementItem[];
};

const ROUTINE_ARRANGEMENTS: Record<RoutineCategoryId, ArrangementGroup[]> = {
  morning: [
    {
      groupId: "begin",
      items: [
        { id: "m-hm-77m", core: true },
        { id: "m-hm-78m", core: true },
        { id: "m-hm-89m", core: false },
      ],
    },
    {
      groupId: "quran_protection",
      items: [
        { id: "m-hm-75", core: true },
        { id: "m-hm-76a", core: true, ritualGroupId: "three_quls" },
        { id: "m-hm-76b", core: true, ritualGroupId: "three_quls" },
        { id: "m-hm-76c", core: true, ritualGroupId: "three_quls" },
      ],
    },
    {
      groupId: "dua_protection",
      items: [
        { id: "m-hm-97", core: true },
        { id: "m-hm-86", core: true },
        { id: "m-hm-84", core: true },
        { id: "m-hm-82", core: false },
        { id: "m-hm-85", core: false },
        { id: "m-hm-83", core: false },
      ],
    },
    {
      groupId: "renew",
      items: [
        { id: "m-hm-79", core: true },
        { id: "m-hm-87", core: true },
        { id: "m-hm-90m", core: false },
        { id: "m-hm-80m", core: false },
        { id: "m-hm-81m", core: false },
      ],
    },
    {
      groupId: "ask",
      items: [
        { id: "m-hm-88", core: true },
        { id: "m-hm-95", core: true },
      ],
    },
    {
      groupId: "repeat",
      items: [
        { id: "m-hm-91", core: true },
        { id: "m-hm-93", core: false },
        { id: "m-hm-94", core: false },
        { id: "m-hm-96", core: false },
        { id: "m-hm-98", core: false },
      ],
    },
  ],
  evening: [
    {
      groupId: "begin",
      items: [
        { id: "e-hm-77e", core: true },
        { id: "e-hm-78e", core: true },
        { id: "e-hm-89e", core: false },
      ],
    },
    {
      groupId: "quran_protection",
      items: [
        { id: "e-hm-75", core: true },
        { id: "e-hm-76a", core: true, ritualGroupId: "three_quls" },
        { id: "e-hm-76b", core: true, ritualGroupId: "three_quls" },
        { id: "e-hm-76c", core: true, ritualGroupId: "three_quls" },
      ],
    },
    {
      groupId: "dua_protection",
      items: [
        { id: "e-hm-86", core: true },
        { id: "e-hm-97", core: true },
        { id: "e-hm-84", core: true },
        { id: "e-hm-82", core: false },
        { id: "e-hm-85", core: false },
        { id: "e-hm-83", core: false },
      ],
    },
    {
      groupId: "renew",
      items: [
        { id: "e-hm-79", core: true },
        { id: "e-hm-87", core: true },
        { id: "e-hm-90e", core: false },
        { id: "e-hm-80e", core: false },
        { id: "e-hm-81e", core: false },
      ],
    },
    {
      groupId: "ask",
      items: [{ id: "e-hm-88", core: true }],
    },
    {
      groupId: "repeat",
      items: [
        { id: "e-hm-91", core: true },
        { id: "e-hm-92", core: false },
        { id: "e-hm-96", core: false },
        { id: "e-hm-98", core: false },
      ],
    },
  ],
  before_sleep: [
    {
      groupId: "quran_protection",
      items: [
        { id: "s-hm-100", core: true },
        { id: "s-hm-101", core: true },
        { id: "s-hm-99-ikhlas", core: true, ritualGroupId: "three_quls" },
        { id: "s-hm-99-falaq", core: true, ritualGroupId: "three_quls" },
        { id: "s-hm-99-nas", core: true, ritualGroupId: "three_quls" },
        { id: "s-hm-109a", core: false },
        { id: "s-hm-110a", core: true },
        { id: "s-hm-110b", core: false },
      ],
    },
    {
      groupId: "ask",
      items: [
        { id: "s-hm-102", core: true },
        { id: "s-hm-105", core: true },
        { id: "s-hm-104", core: true },
        { id: "s-hm-108", core: false },
        { id: "s-hm-107", core: false },
        { id: "s-hm-109", core: false },
      ],
    },
    {
      groupId: "settle",
      items: [
        { id: "s-hm-106-subhanallah", core: true, ritualGroupId: "tasbih_fatimah" },
        { id: "s-hm-106-alhamdulillah", core: true, ritualGroupId: "tasbih_fatimah" },
        { id: "s-hm-106-allahu-akbar", core: true, ritualGroupId: "tasbih_fatimah" },
      ],
    },
    {
      groupId: "final",
      items: [{ id: "s-hm-111", core: true }],
    },
  ],
  after_prayer: [
    {
      groupId: "begin",
      items: [
        // Shared after every obligatory prayer (core)
        { id: "ap-ref-1", core: true },
        { id: "ap-ref-2", core: true },
      ],
    },
    {
      groupId: "quran_protection",
      items: [
        { id: "ap-ref-9", core: true }, // Ayat al-Kursi
        { id: "ap-ref-12a", core: true, ritualGroupId: "three_quls" },
        { id: "ap-ref-12b", core: true, ritualGroupId: "three_quls" },
        { id: "ap-ref-12c", core: true, ritualGroupId: "three_quls" },
      ],
    },
    {
      groupId: "renew",
      items: [
        { id: "ap-ref-3", core: true },
        { id: "ap-ref-4", core: true },
      ],
    },
    {
      groupId: "repeat",
      items: [
        { id: "ap-tasbeeh-subhanallah", core: true, ritualGroupId: "tasbih_fatimah" },
        { id: "ap-tasbeeh-alhamdulillah", core: true, ritualGroupId: "tasbih_fatimah" },
        { id: "ap-tasbeeh-allahuakbar", core: true, ritualGroupId: "tasbih_fatimah" },
        { id: "ap-tasbeeh-tawhid", core: true },
      ],
    },
    {
      groupId: "ask",
      items: [
        { id: "ap-ref-6", core: true },
        { id: "ap-ref-8", core: false }, // comprehensive dua — complete mode only
        // Prayer-specific additions — complete mode only; filtered per prayer below.
        { id: "ap-ref-7", core: false }, // 10× Tawhid after Fajr/Maghrib
        { id: "ap-ref-11", core: false }, // 7× protection after Fajr/Maghrib
        { id: "ap-ref-10", core: false }, // Fajr dua for knowledge/provision
      ],
    },
  ],
};

const ROUTINE_INTRODUCTION_IDS: Record<"morning" | "evening", string> = {
  morning: "m-hm-75a",
  evening: "e-hm-75a",
};

function applyRoutineArrangement(category: RoutineCategoryId, azkar: ZikrDraft[]) {
  const byId = new Map(azkar.map((zikr) => [zikr.id, zikr]));
  let orderIndex = 0;

  for (const [groupOrder, group] of ROUTINE_ARRANGEMENTS[category].entries()) {
    for (const [itemOrder, item] of group.items.entries()) {
      const zikr = byId.get(item.id);
      if (!zikr) {
        throw new Error(`Missing arranged zikr: ${category}:${item.id}`);
      }
      Object.assign(zikr, {
        orderIndex,
        groupId: group.groupId,
        groupOrder,
        itemOrder,
        includedInCore: item.core,
        ...(item.ritualGroupId ? { ritualGroupId: item.ritualGroupId } : {}),
      });
      orderIndex += 1;
    }
  }

  const introductionId =
    category === "morning" || category === "evening" ? ROUTINE_INTRODUCTION_IDS[category] : undefined;
  if (introductionId) {
    const introduction = byId.get(introductionId);
    if (introduction) {
      introduction.isCollectionIntroduction = true;
      introduction.includedInCore = false;
    }
  }
}

applyRoutineArrangement("morning", MORNING_AZKAR);
applyRoutineArrangement("evening", EVENING_AZKAR);
applyRoutineArrangement("before_sleep", SLEEP_AZKAR);
applyRoutineArrangement("after_prayer", AFTER_PRAYER_AZKAR);

const ALL_AZKAR = applyContentReview([
  ...MORNING_AZKAR,
  ...EVENING_AZKAR,
  ...SLEEP_AZKAR,
  ...WAKING_UP_AZKAR,
  ...HOME_AZKAR,
  ...MOSQUE_AZKAR,
  ...AFTER_PRAYER_AZKAR,
  ...IN_PRAYER_AZKAR,
  ...FASTING_RAMADAN_AZKAR,
  ...RESTROOM_AZKAR,
  ...FOOD_DRINK_AZKAR,
  ...CLOTHING_AZKAR,
  ...TRAVEL_AZKAR,
  ...DISTRESS_ANXIETY_AZKAR,
  ...ILLNESS_RUQYAH_AZKAR,
  ...SOCIAL_COMMUNITY_AZKAR,
  ...NATURAL_EVENTS_AZKAR,
  ...MISCELLANEOUS_AZKAR,
]);

const LAZY_AZKAR: Partial<Record<CategoryId, Zikr[]>> = {};

const registerLazyCollection = (category: CategoryId, items: ZikrDraft[]) => {
  LAZY_AZKAR[category] = applyContentReview(items);
};

const isRoutineCategory = (cat: CategoryId): cat is RoutineCategoryId =>
  cat === "morning" || cat === "evening" || cat === "before_sleep" || cat === "after_prayer";

const getAzkarByCategory = (cat: CategoryId) =>
  (LAZY_AZKAR[cat] ?? ALL_AZKAR)
    .filter((z) => z.category === cat && !z.isCollectionIntroduction)
    .sort((a, b) => a.orderIndex - b.orderIndex);

const getAzkarForMode = (cat: CategoryId, mode: RoutineMode = "complete") => {
  const azkar = getAzkarByCategory(cat);
  return isRoutineCategory(cat) && mode === "core" ? azkar.filter((zikr) => zikr.includedInCore) : azkar;
};

const AFTER_PRAYER_SPECIFIC_IDS: Readonly<Record<PrayerName, readonly string[]>> = {
  fajr: ["ap-ref-7", "ap-ref-10"],
  dhuhr: [],
  asr: [],
  maghrib: ["ap-ref-7"],
  isha: [],
};

const ALL_AFTER_PRAYER_SPECIFIC_IDS = new Set(Object.values(AFTER_PRAYER_SPECIFIC_IDS).flat());

/** Shared adhkar stay in every flow; timing-specific additions appear only where established. */
const getAzkarForPrayer = (prayer: PrayerName, mode: RoutineMode = "complete") => {
  const prayerSpecificIds = new Set(AFTER_PRAYER_SPECIFIC_IDS[prayer]);
  return getAzkarForMode("after_prayer", mode).filter(
    (zikr) => !ALL_AFTER_PRAYER_SPECIFIC_IDS.has(zikr.id) || prayerSpecificIds.has(zikr.id),
  );
};

const getCollectionIntroduction = (cat: CategoryId) =>
  (LAZY_AZKAR[cat] ?? ALL_AZKAR).find((zikr) => zikr.category === cat && zikr.isCollectionIntroduction);

const getRoutineStepCount = (cat: RoutineCategoryId, mode: RoutineMode, prayer?: PrayerName) => {
  const seenRituals = new Set<RitualGroupId>();
  const azkar = cat === "after_prayer" && prayer ? getAzkarForPrayer(prayer, mode) : getAzkarForMode(cat, mode);
  return azkar.reduce((count, zikr) => {
    if (!zikr.ritualGroupId) {
      return count + 1;
    }
    if (seenRituals.has(zikr.ritualGroupId)) {
      return count;
    }
    seenRituals.add(zikr.ritualGroupId);
    return count + 1;
  }, 0);
};

const getRoutineProgress = (cat: RoutineCategoryId, mode: RoutineMode, completedIds: Iterable<string>) => {
  const azkar = getAzkarForMode(cat, mode);
  const completed = new Set(completedIds);
  if (mode === "complete") {
    return {
      done: azkar.filter((zikr) => completed.has(zikr.id)).length,
      total: azkar.length,
    };
  }

  const ritualItems = new Map<RitualGroupId, Zikr[]>();
  const standalone = azkar.filter((zikr) => {
    if (!zikr.ritualGroupId) return true;
    const items = ritualItems.get(zikr.ritualGroupId) ?? [];
    items.push(zikr);
    ritualItems.set(zikr.ritualGroupId, items);
    return false;
  });
  return {
    done:
      standalone.filter((zikr) => completed.has(zikr.id)).length +
      [...ritualItems.values()].filter((items) => items.every((zikr) => completed.has(zikr.id))).length,
    total: standalone.length + ritualItems.size,
  };
};

const getCategoryTotal = (cat: CategoryId) => getAzkarByCategory(cat).length;

const ZIKR_LABELS: Record<string, string> = Object.fromEntries(
  ALL_AZKAR.map((z) => [z.id, z.translation.split(".")[0] ?? z.transliteration]),
);

/** Estimates expected completion time in minutes based on total text length and repetitions of visible azkar. */
function estimateCompletionMinutes(azkar: Zikr[]): number {
  if (!azkar || azkar.length === 0) return 0;

  let totalSeconds = 0;
  for (const zikr of azkar) {
    if (zikr.isCollectionIntroduction) continue;
    const text = zikr.arabicText || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const reps = zikr.repetitionCount || 1;

    // Recitation pace: ~2.2 words per second + pause per rep
    const baseSecPerRep = Math.max(1.2, words / 2.2);

    const zikrSeconds =
      reps > 10 ? 10 * baseSecPerRep + (reps - 10) * Math.min(baseSecPerRep * 0.35, 0.6) : reps * baseSecPerRep;

    totalSeconds += zikrSeconds;
  }

  return Math.max(1, Math.round(totalSeconds / 60));
}

export {
  ALL_AZKAR,
  EVENING_AZKAR,
  MORNING_AZKAR,
  SLEEP_AZKAR,
  WAKING_UP_AZKAR,
  HOME_AZKAR,
  MOSQUE_AZKAR,
  AFTER_PRAYER_AZKAR,
  FASTING_RAMADAN_AZKAR,
  IN_PRAYER_AZKAR,
  RESTROOM_AZKAR,
  FOOD_DRINK_AZKAR,
  CLOTHING_AZKAR,
  TRAVEL_AZKAR,
  DISTRESS_ANXIETY_AZKAR,
  ILLNESS_RUQYAH_AZKAR,
  SOCIAL_COMMUNITY_AZKAR,
  NATURAL_EVENTS_AZKAR,
  MISCELLANEOUS_AZKAR,
  ZIKR_LABELS,
  ROUTINE_ARRANGEMENTS,
  getAzkarForMode,
  getAzkarForPrayer,
  getAzkarByCategory,
  getCollectionIntroduction,
  getCategoryTotal,
  getRoutineProgress,
  getRoutineStepCount,
  isRoutineCategory,
  estimateCompletionMinutes,
  registerLazyCollection,
};
