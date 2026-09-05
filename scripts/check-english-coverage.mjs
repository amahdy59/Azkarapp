import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * How much of the reviewed content an English reader can actually read.
 *
 * The English app was English everywhere except its narrations: `translation`,
 * `benefit`, `authenticityNote` and `sourceReference` were all authored in
 * English, while `hadithText` and the prayer virtues existed only in Arabic. So
 * an English reader met an Arabic paragraph under an English heading, in the
 * one place the app is quoting its evidence.
 *
 * Filling that is content work under review, not a code change, so it arrives
 * in batches. This reports what is left, so the gap is a number that shrinks
 * rather than an impression. A report, not a gate: it prints and exits zero,
 * because a missing translation is a queue, not a defect.
 */
const FILES = execSync('git ls-files "src/app/content/*.ts"', { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter((file) => file && !file.endsWith(".test.ts"));

/** Counts `field:` occurrences, ignoring the interface that declares it. */
function countField(source, field) {
  return (source.match(new RegExp(`^\\s+${field}:`, "gm")) || []).length;
}

const PAIRS = [
  { arabic: "hadithText", english: "hadithTextEnglish", what: "narration" },
  { arabic: "textArabic", english: "textEnglish", what: "narration" },
];

let totalArabic = 0;
let totalEnglish = 0;
const rows = [];

for (const file of FILES) {
  const source = readFileSync(file, "utf8");
  for (const pair of PAIRS) {
    const arabic = countField(source, pair.arabic);
    if (arabic === 0) continue;
    /* The interface declaration matches the same pattern as an entry, so it is
       subtracted — but only for the required field. The optional one is written
       `field?: string`, which the `field:` pattern never matches, and
       subtracting for it too is what made this report say -1 of 11. */
    const declared = source.includes(`${pair.arabic}: string`) ? 1 : 0;
    const arabicCount = arabic - declared;
    const englishCount = countField(source, pair.english);
    totalArabic += arabicCount;
    totalEnglish += englishCount;
    rows.push({ file, what: pair.what, arabicCount, englishCount });
  }
}

const pct = totalArabic === 0 ? 100 : Math.round((totalEnglish / totalArabic) * 100);
console.log(`English narrations: ${totalEnglish} of ${totalArabic} (${pct}%).`);
for (const row of rows.sort((a, b) => a.englishCount / a.arabicCount - b.englishCount / b.arabicCount)) {
  const missing = row.arabicCount - row.englishCount;
  const mark = missing === 0 ? "done" : `${missing} to go`;
  console.log(`  ${row.file}  ${row.englishCount}/${row.arabicCount}  ${mark}`);
}
if (totalEnglish < totalArabic) {
  console.log("\nUntranslated entries still render their Arabic, so nothing is missing from the screen.");
}
