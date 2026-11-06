import type { ZikrDraft } from "../types";

export const BAQARAH_METADATA = {
  id: "ir-baqarah",
  category: "illness_ruqyah",
  orderIndex: 9,
  isSurah: true,
  surahNameArabic: "البَقَرَة",
  surahNameEnglish: "Al-Baqarah",
  surahType: "مدنية",
  verseCount: 286,
  hasBasmalah: true,
  benefit:
    "Reciting Surah Al-Baqarah expels devils, protects homes, brings blessings, and serves as a powerful ruqyah.",
  benefitArabic: "سورة البقرة حصن للمسلم ورقية شرعية شافية؛ تطرد الشياطين من البيت وتبطل السحر وتجلب البركة.",
  repetitionCount: 1,
  countLabel: "1",
  sourceReference: "Sahih Muslim 804, 780.",
  sourceReferenceArabic: "صحيح مسلم ٨٠٤، ٧٨٠.",
  hadithText:
    "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: «لا تجعلوا بيوتكم مقابر، إن الشيطان ينفر من البيت الذي تقرأ فيه سورة البقرة». وعن أبي أمامة الباهلي رضي الله عنه قال: سمعت رسول الله ﷺ يقول: «اقرؤوا سورة البقرة، فإن أخذها بركة، وتركها حسرة، ولا تستطيعها البطلة».",
  hadithTextEnglish:
    "Abu Hurairah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Do not make your houses graves; indeed, Satan flees from the house in which Surah Al-Baqarah is recited.” And Abu Umamah (may Allah be pleased with him) reported: I heard the Messenger of Allah ﷺ say: “Recite Surah Al-Baqarah, for taking it is a blessing, leaving it is a grief, and the magicians cannot confront it.”",
  authenticityNote: "Sahih Muslim.",
} satisfies Omit<ZikrDraft, "arabicText" | "translation" | "transliteration" | "mushafPages">;
