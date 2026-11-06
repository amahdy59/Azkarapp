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
import { BAQARAH_METADATA } from "./baqarahMetadata";

export const BAQARAH_SURAH: ZikrDraft = {
  ...BAQARAH_METADATA,
  mushafPages: ${JSON.stringify(mushafPages, null, 2)},
  arabicText: ${JSON.stringify(arabicText)},
  transliteration: ${JSON.stringify(transliteration)},
  translation: ${JSON.stringify(translation)},
};
`;

fs.writeFileSync(path.resolve("src/app/content/baqarahSurah.ts"), content, "utf8");
console.log("Successfully generated src/app/content/baqarahSurah.ts");
