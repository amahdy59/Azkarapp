/* global fetch, URL */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/Quran-Summer-of-Code/Learn-Quran-App/1ce3f8194b161e2760eaf6b23235627e1a4ca9fb/Quran/surasMaany.json";
const SOURCE_SHA1 = "561c89c3451ac9e71255a52b493c17db54450da5";
const INCLUDED_SURAHS = [18, 32, 67, 109, 112, 113, 114];
const OUTPUT_PATH = new URL("../src/app/content/quranWordMeanings.data.json", import.meta.url);

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
const included = Object.fromEntries(INCLUDED_SURAHS.map((surah) => [surah, chapters[surah - 1]]));

await writeFile(OUTPUT_PATH, `${JSON.stringify(included, null, 2)}\n`, "utf8");

console.log(`Wrote sourced word meanings for ${INCLUDED_SURAHS.length} surahs.`);
