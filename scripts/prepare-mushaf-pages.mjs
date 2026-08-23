/**
 * Mushaf page preparation
 * -----------------------
 * Rebuilds `public/data/mushaf/<page>.json` so that every page carries the
 * official QCF v2 (King Fahd Complex, Madani, 15 lines) layout:
 *
 *   - `lineNumber` comes from the reference layout, not from whatever the
 *     original scrape produced. Page 599 was a worked example of the drift:
 *     the shipped file put 10 words on line 1 where the reference puts 12, and
 *     placed the surah-break slots on lines 3/4 and 10/11 instead of 6/7 and
 *     12/13. Rendering a reference layout with non-reference line breaks is why
 *     lines overflowed the page edge.
 *   - `qcfCode` is baked in, so a page turn needs zero calls to api.quran.com
 *     at runtime and the glyph rendering works offline.
 *
 * The reviewed Uthmani `text` of every word is preserved byte for byte — this
 * script never rewrites Qur'anic text, only the layout metadata beside it
 * (AGENTS.md §8). A page is written only when every word matches one-to-one.
 *
 * Usage: node scripts/prepare-mushaf-pages.mjs [--pages 1-604] [--dry-run]
 */

/* global fetch */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API_ROOT = "https://api.quran.com/api/v4";
const PAGE_DIRECTORY = path.resolve("public/data/mushaf");
const TOTAL_PAGES = 604;
const CONCURRENCY = 6;
const MAX_ATTEMPTS = 4;

function parseRange(value) {
  if (!value) return { from: 1, to: TOTAL_PAGES };
  const [from, to] = value.split("-").map(Number);
  return { from: from || 1, to: to || from || TOTAL_PAGES };
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const range = parseRange(
  args[args.indexOf("--pages") + 1] && args.includes("--pages") ? args[args.indexOf("--pages") + 1] : "",
);

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchReferencePage(page) {
  const words = new Map();
  let apiPage = 1;
  let totalApiPages;

  do {
    const url = `${API_ROOT}/verses/by_page/${page}?words=true&word_fields=code_v2,text_qpc_hafs&per_page=50&page=${apiPage}`;
    let payload;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        payload = await response.json();
        break;
      } catch (error) {
        if (attempt === MAX_ATTEMPTS) throw error;
        await sleep(attempt * 750);
      }
    }

    if (!Array.isArray(payload?.verses)) throw new Error("unexpected payload shape");
    for (const verse of payload.verses) {
      for (const word of verse.words ?? []) {
        if (typeof word.position !== "number" || typeof word.line_number !== "number") {
          throw new Error(`word metadata missing on ${verse.verse_key}`);
        }
        words.set(`${verse.verse_key}:${word.position}`, {
          lineNumber: word.line_number,
          code: typeof word.code_v2 === "string" ? word.code_v2 : "",
          isEnd: word.char_type_name === "end" ? 1 : 0,
        });
      }
    }

    totalApiPages = payload.pagination?.total_pages ?? 1;
    apiPage += 1;
  } while (apiPage <= totalApiPages);

  return words;
}

async function preparePage(page) {
  const filePath = path.join(PAGE_DIRECTORY, `${page}.json`);
  const local = JSON.parse(await readFile(filePath, "utf8"));
  const reference = await fetchReferencePage(page);

  const problems = [];
  const next = local.map((verse) => ({
    k: verse.k,
    w: verse.w.map((word) => {
      const [position, , isEnd, text] = word;
      const match = reference.get(`${verse.k}:${position}`);
      if (!match) {
        problems.push(`${verse.k}:${position} missing from the reference layout`);
        return word;
      }
      if (match.isEnd !== isEnd) {
        problems.push(`${verse.k}:${position} disagrees on the ayah-marker flag`);
      }
      if (!match.code) {
        problems.push(`${verse.k}:${position} has no code_v2 glyph`);
      }
      return match.code
        ? [position, match.lineNumber, isEnd, text, match.code]
        : [position, match.lineNumber, isEnd, text];
    }),
  }));

  const usedLines = new Set();
  for (const verse of next) for (const word of verse.w) usedLines.add(word[1]);
  for (const line of usedLines) {
    if (!Number.isInteger(line) || line < 1 || line > 15) problems.push(`line ${line} is outside the 15-line grid`);
  }

  if (problems.length > 0) {
    return { page, written: false, problems };
  }

  const serialised = JSON.stringify(next);
  if (!dryRun) await writeFile(filePath, serialised, "utf8");
  return { page, written: !dryRun, bytes: serialised.length, problems: [] };
}

const queue = [];
for (let page = range.from; page <= range.to; page += 1) queue.push(page);

const failures = [];
let done = 0;

async function worker() {
  while (queue.length > 0) {
    const page = queue.shift();
    try {
      const result = await preparePage(page);
      if (result.problems.length > 0) {
        failures.push({ page, problems: result.problems.slice(0, 4) });
      }
    } catch (error) {
      failures.push({ page, problems: [error.message] });
    }
    done += 1;
    if (done % 25 === 0) process.stdout.write(`  prepared ${done}/${range.to - range.from + 1} pages\n`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

if (failures.length > 0) {
  console.error(`\n${failures.length} page(s) were left untouched:`);
  for (const failure of failures.sort((a, b) => a.page - b.page)) {
    console.error(`  page ${failure.page}: ${failure.problems.join("; ")}`);
  }
  process.exitCode = 1;
} else {
  console.log(`\nAll ${range.to - range.from + 1} pages match the QCF v2 reference layout.`);
}
