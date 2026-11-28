import fs from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import path from "node:path";

const directory = "docs/learning/audit";
const candidatePath = `${directory}/source-candidates-2026-11-27.json`;
const sha = (value) => createHash("sha256").update(value).digest("hex");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const symbols = {
  "◙": "رضي الله عنه",
  "▲": "رضي الله عنها",
  "╚": "رضي الله عنهم",
  "¶": "رضي الله عنهما",
  "♠": "عليه السلام",
  ﭬ: "رضي الله عنه",
  ﭭ: "رضي الله عنهما",
};
function words(value) {
  return (
    value
      .replace(/[◙▲╚¶♠ﭬﭭ]/g, (symbol) => symbols[symbol])
      .normalize("NFKD")
      .replace(/[\u064b-\u065f\u0670\u06d6-\u06edـ]/g, "")
      .replace(/ٱ/g, "ا")
      .match(/[\u0621-\u064a]+/g) ?? []
  );
}

// This score locates possible omissions/reordering. It is never an approval
// threshold: source transcription, furniture and spelling also change it.
function comparison(source, adaptation) {
  const left = words(source),
    right = words(adaptation);
  let previous = new Uint32Array(right.length + 1);
  for (const a of left) {
    const row = new Uint32Array(right.length + 1);
    for (let index = 1; index <= right.length; index++)
      row[index] = a === right[index - 1] ? previous[index - 1] + 1 : Math.max(previous[index], row[index - 1]);
    previous = row;
  }
  return {
    sourceWords: left.length,
    adaptationWords: right.length,
    orderedCommonWords: previous[right.length],
    exactNormalizedMatch: JSON.stringify(left) === JSON.stringify(right),
  };
}

export function buildBookContentAudit() {
  const candidates = read(candidatePath);
  const catalogue = read("src/app/learning/catalogue.json");
  const paragraphs = read("docs/external-sources/book-source-corrections.json");
  const prose = read("docs/external-sources/book-prose-audit-corrections.json");
  const inputs = [
    candidatePath,
    "src/app/learning/catalogue.json",
    "docs/external-sources/book-source-corrections.json",
    "docs/external-sources/book-prose-audit-corrections.json",
    "docs/external-sources/book-content.mjs",
    "docs/external-sources/wird-source-navigation.json",
    "docs/external-sources/wird-source-navigation.mjs",
    "docs/learning/english-umrah.json",
  ];
  const units = [];
  for (const edition of catalogue) {
    const bytes = fs.readFileSync(`docs/learning/assets/${edition.pack.path}`);
    if (sha(bytes) !== edition.pack.sha256) throw new Error("Audit pack checksum mismatch");
    const pack = JSON.parse(gunzipSync(bytes));
    const source = candidates.sources.find((item) => item.id === edition.id);
    for (const unit of pack.units) {
      const original =
        edition.language === "ar" && edition.id !== "dalil-al-mutamir"
          ? source.pages.find((page) => page.page === unit.sourcePage)
          : undefined;
      if (edition.id !== "dalil-al-mutamir" && !original) throw new Error("Missing original source page");
      const repairs = [...paragraphs.changes, ...prose.changes].filter(
        (change) => change.book === edition.id && change.page === unit.sourcePage,
      );
      const scan = original ? comparison(original.text, unit.text) : null;
      units.push({
        book: edition.id,
        language: edition.language,
        unitId: unit.id,
        sourcePage: unit.sourcePage,
        packSha256: edition.pack.sha256,
        textSha256: sha(unit.text),
        originalPdfSha256: source.originalPdfSha256,
        originalPage: original?.page ?? null,
        sourceCandidateSha256: original ? sha(original.text) : null,
        status: original
          ? scan.exactNormalizedMatch
            ? "automated-match-awaiting-manual-review"
            : "discrepant-awaiting-reconciliation"
          : "unresolved-original-mapping",
        sourceConfirmedRepair: repairs.length > 0,
        comparison: scan,
        unresolvedSourceMarks: original?.unresolvedMarks?.length ?? 0,
        independentReview: "pending",
      });
    }
  }
  return {
    schema: 1,
    scope:
      "All 217 available Arabic adaptation units and all 16 English Umrah units. No complete English Al-Mukhtar or Wird edition exists.",
    completion: "incomplete-source-reconciliation",
    publication: "held",
    method:
      "Compare every current checksum-verified native unit with same-page PDF transcription candidates where a page mapping exists. Normalization and ordered word overlap locate differences; they do not establish fidelity, correct vowel marks or independent approval. Umrah's 16 adaptation units do not map one-to-one to its 138-page original. English remains bound to that adaptation, not established as original-faithful.",
    inputs: Object.fromEntries(inputs.map((file) => [file, sha(fs.readFileSync(file))])),
    originals: candidates.sources.map((source) => ({
      id: source.id,
      sha256: source.originalPdfSha256,
      pages: source.pages.length,
      transcriptionStatus: source.transcriptionStatus,
    })),
    units,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = buildBookContentAudit();
  fs.writeFileSync(`${directory}/content-audit-2026-11-27.json`, JSON.stringify(audit, null, 2) + "\n");
  console.log(`${audit.units.length} units inventoried; source reconciliation remains incomplete; publication held.`);
}
