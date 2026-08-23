/**
 * Reviewed ghareeb (difficult-word) glosses, from the single pinned source the
 * app cites.
 *
 * Two outputs, because two readers need them differently:
 *
 *   - `src/app/content/quranWordMeanings.data.json` — the surahs the azkar
 *     reader shows, bundled so that path stays synchronous and offline.
 *   - `public/data/word-meanings/<surah>.json` — all 114, fetched a surah at a
 *     time by the Mushaf, which can land on any page of the Qur'an. Bundling
 *     1.03 MB to serve one page at a time would be paid by every visitor.
 *
 * The source is checksum-pinned, so the two outputs can never drift apart or
 * silently pick up an upstream edit.
 */

/* global fetch, URL */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/Quran-Summer-of-Code/Learn-Quran-App/1ce3f8194b161e2760eaf6b23235627e1a4ca9fb/Quran/surasMaany.json";
const SOURCE_SHA1 = "561c89c3451ac9e71255a52b493c17db54450da5";
/**
 * Surahs this generator sources, bundled whole so the azkar reader's path stays
 * synchronous and offline.
 */
const SOURCED_SURAHS = [18, 32, 67, 109, 112, 113, 114];

/**
 * Surahs whose glosses are reviewed separately and are NOT this source's.
 *
 * Al-Baqarah's three passages were written by hand — different wording and
 * different orthography from the pinned source — and were simply missing from
 * this script's list, so a re-run silently replaced reviewed text with the
 * source's. They are carried across from the existing output untouched: a
 * generator may add to reviewed content, never overwrite it (AGENTS.md §8).
 */
const PRESERVED_SURAHS = ["2"];

const OUTPUT_PATH = new URL("../src/app/content/quranWordMeanings.data.json", import.meta.url);
const PAGE_OUTPUT_DIRECTORY = new URL("../public/data/word-meanings/", import.meta.url);

const localSourcePath = process.argv[2];
const source = localSourcePath
  ? await readFile(localSourcePath, "utf8")
  : await fetch(SOURCE_URL).then((response) => {
      if (!response.ok) {
        throw new Error(`Could not download Quran word meanings: ${response.status}`);
      }
      return response.text();
    });
const actualSha1 = createHash("sha1").update(source).digest("hex");
if (actualSha1 !== SOURCE_SHA1) {
  throw new Error(`Quran word-meaning source checksum mismatch: ${actualSha1}`);
}

const chapters = JSON.parse(source);
if (chapters.length !== 114) throw new Error(`Expected 114 chapters, found ${chapters.length}`);

const existing = JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
const preserved = Object.fromEntries(
  PRESERVED_SURAHS.map((surah) => {
    if (!existing[surah]) throw new Error(`Reviewed surah ${surah} is missing from ${OUTPUT_PATH.pathname}`);
    return [surah, existing[surah]];
  }),
);
const bundled = {
  ...preserved,
  ...Object.fromEntries(SOURCED_SURAHS.map((surah) => [surah, chapters[surah - 1]])),
};
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify(bundled, null, 2)}
`,
  "utf8",
);

await mkdir(PAGE_OUTPUT_DIRECTORY, { recursive: true });
let verses = 0;
let words = 0;
for (let surah = 1; surah <= 114; surah += 1) {
  const chapter = chapters[surah - 1] ?? {};
  for (const ayah of Object.keys(chapter)) {
    verses += 1;
    words += Object.keys(chapter[ayah]).length;
  }
  await writeFile(new URL(`${surah}.json`, PAGE_OUTPUT_DIRECTORY), JSON.stringify(chapter), "utf8");
}

console.log(
  `Bundled ${Object.keys(bundled).length} surahs for the azkar reader ` +
    `(${PRESERVED_SURAHS.length} reviewed separately, carried across untouched); ` +
    `wrote all 114 for the Mushaf (${verses} verses, ${words} word meanings).`,
);
