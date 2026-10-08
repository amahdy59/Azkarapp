import fs from "node:fs";
import path from "node:path";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const { AUDIO_CATALOG } = loadTypeScriptModule(path.resolve("src/app/audio/audioManifest.ts"));
const { QURAN_TIMING_CATALOG, validateQuranTiming } = loadTypeScriptModule(
  path.resolve("src/app/audio/quranTimings.ts"),
);
const issues = [];
const seen = new Set();
const wordCounts = new Map();
for (const file of fs.readdirSync("public/data/mushaf")) {
  if (!file.endsWith(".json")) continue;
  for (const verse of JSON.parse(fs.readFileSync(path.join("public/data/mushaf", file), "utf8"))) {
    const positions = wordCounts.get(verse.k) ?? new Set();
    for (const word of verse.w) if (!word[2]) positions.add(word[0]);
    wordCounts.set(verse.k, positions);
  }
}
for (const annotation of QURAN_TIMING_CATALOG) {
  const identity = `${annotation.variantId}:${annotation.sha256}`;
  if (seen.has(identity)) issues.push(`${identity}: duplicate annotation`);
  seen.add(identity);
  const candidates = Object.values(AUDIO_CATALOG.assets).flatMap((asset) =>
    asset.segments.flatMap((segment) =>
      segment.variants
        .filter(
          (variant) =>
            variant.id === annotation.variantId &&
            variant.sha256 === annotation.sha256 &&
            variant.reviewStatus === "approved" &&
            asset.reviewStatus === "approved",
        )
        .map((variant) => ({ ...variant, variantId: variant.id, quranReference: segment.quranReference })),
    ),
  );
  if (candidates.length !== 1) {
    issues.push(`${identity}: missing or ambiguous approved recording`);
    continue;
  }
  issues.push(...validateQuranTiming(annotation, candidates[0]).map((issue) => `${identity}: ${issue}`));
  for (const verse of annotation.verses) {
    const positions = wordCounts.get(verse.verseKey);
    if (!positions) issues.push(`${identity}: unknown semantic verse ${verse.verseKey}`);
    if (
      verse.words?.length &&
      (positions?.size !== verse.words.length || verse.words.some((word) => !positions.has(word.position)))
    )
      issues.push(`${identity}: incomplete or mismatched semantic word positions for ${verse.verseKey}`);
  }
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Quran timings validated: ${QURAN_TIMING_CATALOG.length} reviewed recordings. Zero means following remains unavailable.`,
  );
