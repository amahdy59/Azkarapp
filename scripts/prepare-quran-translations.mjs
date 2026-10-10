/**
 * Generates offline per-surah English translations (Saheeh International)
 * in `public/data/translations/en/<surah>.json`.
 *
 * Each file is a minimal key-value map: { [ayahNumber: string]: string }.
 * Lazy-loaded per surah so only ~5-25 KB is fetched on demand per surah.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SURAHS } from "../src/app/content/surahInfo.ts";

const OUTPUT_DIR = path.resolve("public/data/translations/en");
const SOURCE_URL = "https://api.alquran.cloud/v1/quran/en.sahih";

async function run() {
  console.log("Fetching English translations from", SOURCE_URL);
  const response = await globalThis.fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch translations: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  const surahs = json.data?.surahs;
  if (!Array.isArray(surahs) || surahs.length !== 114) {
    throw new Error(`Unexpected payload format: expected 114 surahs, got ${surahs?.length}`);
  }

  if (json.data.edition?.identifier !== "en.sahih") throw new Error("Unexpected translation edition");
  // Validate the entire source before replacing any reviewed local chapter.
  for (const [index, surah] of surahs.entries()) {
    const expected = SURAHS[index];
    if (surah.number !== expected.number || surah.ayahs?.length !== expected.versesCount)
      throw new Error(`Unexpected chapter coverage at surah ${expected.number}`);
    for (const [ayahIndex, ayah] of surah.ayahs.entries()) {
      if (ayah.numberInSurah !== ayahIndex + 1 || typeof ayah.text !== "string" || !ayah.text.trim())
        throw new Error(`Invalid verse at ${surah.number}:${ayahIndex + 1}`);
    }
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const surah of surahs) {
    const surahNumber = surah.number;
    const map = {};
    for (const ayah of surah.ayahs) {
      map[String(ayah.numberInSurah)] = ayah.text;
    }
    const targetFile = path.join(OUTPUT_DIR, `${surahNumber}.json`);
    await writeFile(targetFile, JSON.stringify(map), "utf8");
  }

  console.log(`Successfully generated translations for all 114 surahs in ${OUTPUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
