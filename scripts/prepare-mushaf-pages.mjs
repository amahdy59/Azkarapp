/**
 * Mushaf page preparation
 * -----------------------
 * Rebuilds every `public/data/mushaf/<page>.json` from one source of truth: the
 * official QCF v2 layout (King Fahd Complex, Madani, 15 lines per page).
 *
 * Three things define a printed page, and all three must come from the same
 * edition or the page is a chimera:
 *
 *   1. which words are on the page,
 *   2. which line each word sits on,
 *   3. which glyph draws it.
 *
 * An earlier version took (2) and (3) from the reference but left (1) as it
 * found it, and the two disagree on 25 pages. Page 121 was the worked example:
 * the reference puts verse 5:77 at the foot of page 120, the old assignment put
 * it on 121, so the reader printed 5:77 *after* 5:83 — in page 120's glyphs,
 * which page 121's font cannot draw, so it came out as garbage.
 *
 * The trap is that api.quran.com answers a different question depending on the
 * fields you ask for. `word_fields=page_number` returns the default script's
 * pagination; `word_fields=code_v2,page_number` returns the v2 font's. Only the
 * latter matches the glyphs, so every word here is placed by its *v2*
 * `page_number`, never by the response it happened to arrive in.
 *
 * The reviewed Uthmani `text` of every word is carried across untouched — this
 * script never rewrites Qur'anic text, only the layout around it (AGENTS.md §8).
 * Nothing is written unless every word in the Mushaf is accounted for exactly
 * once, so a partial or reordered rebuild fails loudly instead of shipping.
 *
 * Usage: node scripts/prepare-mushaf-pages.mjs [--dry-run]
 */

/* global fetch */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API_ROOT = "https://api.quran.com/api/v4";
const PAGE_DIRECTORY = path.resolve("public/data/mushaf");
const TOTAL_PAGES = 604;
const LINES_PER_PAGE = 15;
const CONCURRENCY = 6;
const MAX_ATTEMPTS = 4;

const dryRun = process.argv.includes("--dry-run");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function wordKey(verseKey, position) {
  return `${verseKey}:${position}`;
}

/** Verses sort by surah then ayah; words by position within the verse. */
function compareVerseKeys(a, b) {
  const [surahA, ayahA] = a.split(":").map(Number);
  const [surahB, ayahB] = b.split(":").map(Number);
  return surahA - surahB || ayahA - ayahB;
}

/**
 * The reviewed Qur'anic text as it stands today, keyed by verse and position.
 * A rebuild moves words between pages, so the text has to be looked up by
 * identity rather than read from the page being rewritten.
 */
async function readReviewedText() {
  const text = new Map();
  for (let page = 1; page <= TOTAL_PAGES; page += 1) {
    const verses = JSON.parse(await readFile(path.join(PAGE_DIRECTORY, `${page}.json`), "utf8"));
    for (const verse of verses) {
      for (const word of verse.w) {
        const key = wordKey(verse.k, word[0]);
        if (text.has(key)) throw new Error(`${key} appears on more than one page in the current data`);
        text.set(key, word[3]);
      }
    }
  }
  return text;
}

async function fetchJson(url) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
      await sleep(attempt * 750);
    }
  }
  return null;
}

/**
 * Collects every word the reference knows about, bucketed by the page the
 * reference puts it on.
 *
 * A verse that straddles a page break is listed under both pages, so sweeping
 * all 604 responses and trusting each word's own `page_number` covers every
 * boundary without asking for any page twice.
 */
async function collectReferenceWords() {
  const byPage = new Map();
  const seen = new Set();
  const queue = [];
  for (let page = 1; page <= TOTAL_PAGES; page += 1) queue.push(page);

  let fetched = 0;
  async function worker() {
    while (queue.length > 0) {
      const page = queue.shift();
      let apiPage = 1;
      let totalApiPages;
      do {
        const url =
          `${API_ROOT}/verses/by_page/${page}` +
          `?words=true&word_fields=code_v2,page_number&per_page=50&page=${apiPage}`;
        const payload = await fetchJson(url);
        if (!Array.isArray(payload?.verses)) throw new Error(`page ${page}: unexpected payload`);

        for (const verse of payload.verses) {
          for (const word of verse.words ?? []) {
            const key = wordKey(verse.verse_key, word.position);
            if (seen.has(key)) continue;
            if (typeof word.page_number !== "number" || typeof word.line_number !== "number") {
              throw new Error(`${key}: reference is missing page or line`);
            }
            seen.add(key);
            const bucket = byPage.get(word.page_number) ?? [];
            bucket.push({
              verseKey: verse.verse_key,
              position: word.position,
              lineNumber: word.line_number,
              isEnd: word.char_type_name === "end" ? 1 : 0,
              code: typeof word.code_v2 === "string" ? word.code_v2 : "",
            });
            byPage.set(word.page_number, bucket);
          }
        }
        totalApiPages = payload.pagination?.total_pages ?? 1;
        apiPage += 1;
      } while (apiPage <= totalApiPages);

      fetched += 1;
      if (fetched % 50 === 0) process.stdout.write(`  read ${fetched}/${TOTAL_PAGES} reference pages\n`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return byPage;
}

let repairedMarkers = 0;

/**
 * A word may never sit on an earlier line than the word before it in its own
 * verse — that is not a layout choice, it is an impossibility.
 *
 * The reference carries exactly one such record: on page 589 it puts the ayah
 * marker of 84:21 on line 13 while words 3-6 of the same verse are on line 14,
 * which would print the verse number in the middle of the sentence, a line
 * above the words it closes. Pulling the stray word down to the line its
 * predecessor is on is the smallest correction that restores reading order, and
 * it invents nothing.
 */
function settleReadingOrder(words) {
  let line = 0;
  for (const word of words) {
    if (word[1] < line) {
      word[1] = line;
      repairedMarkers += 1;
    }
    line = word[1];
  }
  return words;
}

function buildPage(page, words, reviewedText, problems) {
  const byVerse = new Map();
  for (const word of words) {
    if (word.lineNumber < 1 || word.lineNumber > LINES_PER_PAGE) {
      problems.push(`page ${page}: ${wordKey(word.verseKey, word.position)} is on line ${word.lineNumber}`);
    }
    if (!word.code) {
      problems.push(`page ${page}: ${wordKey(word.verseKey, word.position)} has no code_v2 glyph`);
    }
    const text = reviewedText.get(wordKey(word.verseKey, word.position));
    if (text === undefined) {
      problems.push(`page ${page}: ${wordKey(word.verseKey, word.position)} has no reviewed text`);
      continue;
    }
    const bucket = byVerse.get(word.verseKey) ?? [];
    bucket.push([word.position, word.lineNumber, word.isEnd, text, word.code]);
    byVerse.set(word.verseKey, bucket);
  }

  return [...byVerse.keys()].sort(compareVerseKeys).map((verseKey) => ({
    k: verseKey,
    w: settleReadingOrder(byVerse.get(verseKey).sort((a, b) => a[0] - b[0])),
  }));
}

console.log("Reading the reviewed text that ships today...");
const reviewedText = await readReviewedText();
console.log(`  ${reviewedText.size} words.`);

console.log("Reading the QCF v2 reference layout...");
const referenceWords = await collectReferenceWords();

const problems = [];
const pages = new Map();
let placed = 0;

for (let page = 1; page <= TOTAL_PAGES; page += 1) {
  const words = referenceWords.get(page);
  if (!words || words.length === 0) {
    problems.push(`page ${page}: the reference placed no words here`);
    continue;
  }
  const built = buildPage(page, words, reviewedText, problems);
  placed += built.reduce((sum, verse) => sum + verse.w.length, 0);
  pages.set(page, built);
}

// Every word the Mushaf has must land on exactly one page. Anything less means
// the rebuild would drop or duplicate Qur'an, which is never an acceptable
// trade for a tidier layout.
if (placed !== reviewedText.size) {
  problems.push(`the rebuild places ${placed} words but the reviewed text has ${reviewedText.size}`);
}

if (problems.length > 0) {
  console.error(`\nRefusing to write. ${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 40)) console.error(`  ${problem}`);
  if (problems.length > 40) console.error(`  ...and ${problems.length - 40} more`);
  process.exit(1);
}

let rewritten = 0;
for (const [page, verses] of pages) {
  const serialised = JSON.stringify(verses);
  const filePath = path.join(PAGE_DIRECTORY, `${page}.json`);
  if ((await readFile(filePath, "utf8")) === serialised) continue;
  if (!dryRun) await writeFile(filePath, serialised, "utf8");
  rewritten += 1;
}

console.log(
  `\nAll ${TOTAL_PAGES} pages match the QCF v2 reference: ${placed} words, ` +
    `${repairedMarkers} out-of-order word(s) settled, ` +
    `${rewritten} file(s) ${dryRun ? "would change" : "rewritten"}.`,
);
