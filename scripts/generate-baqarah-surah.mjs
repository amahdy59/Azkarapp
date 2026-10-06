import fs from "node:fs";
import path from "node:path";

const mushafPages = [];
for (let page = 2; page <= 49; page++) {
  const filePath = path.resolve(`public/data/mushaf/${page}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const ayahs = data.map((v) => parseInt(v.k.split(":")[1]));
  mushafPages.push({
    page,
    startAyah: Math.min(...ayahs),
    endAyah: Math.max(...ayahs),
  });
}

const res = await globalThis.fetch("https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/en/2.json");
const chapter = await res.json();

const arabicNumber = (value) => String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

const verses = chapter.verses.map(({ id, text, transliteration, translation }) => ({
  id,
  text,
  transliteration,
  translation,
}));

const arabicText = verses.map((v) => `${v.text} ﴿${arabicNumber(v.id)}﴾`).join(" ");

const transliteration = verses.map((v) => v.transliteration).join(" ");
const translation = verses.map((v, i) => `${v.translation} (${i + 1})`).join(" ");

const content = `// Generated from quran-json 3.1.2 and Madani Mushaf page definitions (QCF v2).
import type { ZikrDraft } from "../types";

export const BAQARAH_SURAH: ZikrDraft = {
  id: "ir-baqarah",
  category: "illness_ruqyah",
  orderIndex: 7,
  isSurah: true,
  surahNameArabic: "البَقَرَة",
  surahNameEnglish: "Al-Baqarah",
  surahType: "مدنية",
  verseCount: 286,
  mushafPages: ${JSON.stringify(mushafPages, null, 2)},
  hasBasmalah: true,
  arabicText: ${JSON.stringify(arabicText)},
  transliteration: ${JSON.stringify(transliteration)},
  translation: ${JSON.stringify(translation)},
  benefit: "Reciting Surah Al-Baqarah expels devils, protects homes, brings blessings, and serves as a powerful ruqyah.",
  benefitArabic: "سورة البقرة حصن للمسلم ورقية شرعية شافية؛ تطرد الشياطين من البيت وتبطل السحر وتجلب البركة.",
  repetitionCount: 1,
  countLabel: "1",
  sourceReference: "Sahih Muslim 804, 780.",
  sourceReferenceArabic: "صحيح مسلم ٨٠٤، ٧٨٠.",
  hadithText:
    "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: «لا تجعلوا بيوتكم مقابر، إن الشيطان ينفر من البيت الذي تقرأ فيه سورة البقرة». وعن أبي أمامة الباهلي رضي الله عنه قال: سمعت رسول الله ﷺ يقول: «اقرؤوا سورة البقرة، فإن أخذها بركة، وتركها حسرة، ولا تستطيعها البطلة».",
  hadithTextEnglish:
    "Abu Hurairah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Do not make your houses graves; indeed, Satan flees from the house in which Surah Al-Baqarah is recited.” And Abu Umamah (may Allah be pleased with him) reported: I heard the Messenger of Allah ﷺ say: “Recite Surah Al-Baqarah, for taking it is a blessing, leaving it is a grief, and the magicians cannot confront it.”",
  authenticityNote: "صحيح مسلم.",
};
`;

fs.writeFileSync(path.resolve("src/app/content/baqarahSurah.ts"), content, "utf8");
console.log("Successfully generated src/app/content/baqarahSurah.ts");
