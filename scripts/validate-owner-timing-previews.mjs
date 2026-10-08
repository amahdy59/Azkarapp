import fs from "node:fs";
import crypto from "node:crypto";
import { gunzipSync } from "node:zlib";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";
import { collectAlignmentJobs, readSemanticWords } from "./listening-alignment-inputs.mjs";

const { OWNER_TIMING_PACK_SHA, expandOwnerTiming } = loadTypeScriptModule("src/app/audio/ownerTimingPreviews.ts");
const { validateListeningTiming } = loadTypeScriptModule("src/app/audio/listeningTimings.ts");
const { validateQuranTiming } = loadTypeScriptModule("src/app/audio/quranTimings.ts");
const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
const { ALL_AZKAR } = loadTypeScriptModule("src/app/content/azkar.ts");
const { COMPREHENSIVE_DUAS } = loadTypeScriptModule("src/app/content/comprehensiveDuas.ts");
const { FRIDAY_KAHF } = loadTypeScriptModule("src/app/content/fridayKahf.ts");
const { createArabicTextFingerprint } = loadTypeScriptModule("src/app/audio/arabicMatching.ts");
const semantic = readSemanticWords("public/data/mushaf");
const jobs = collectAlignmentJobs(
  AUDIO_CATALOG,
  [...ALL_AZKAR, ...COMPREHENSIVE_DUAS, ...FRIDAY_KAHF],
  createArabicTextFingerprint,
  semantic,
);
const bytes = fs.readFileSync(`public/data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`);
if (bytes.length > 250000 || crypto.createHash("sha256").update(bytes).digest("hex") !== OWNER_TIMING_PACK_SHA)
  throw new Error("Owner pack digest or size differs.");
const decoded = gunzipSync(bytes, { maxOutputLength: 2000000 });
const pack = JSON.parse(decoded);
if (
  pack.version !== 2 ||
  !Array.isArray(pack.records) ||
  pack.records.length > 400 ||
  pack.approval.reviewStatus !== "owner-preview"
)
  throw new Error("Invalid owner preview pack.");
const seen = new Set();
for (const record of pack.records) {
  const job = jobs.find((value) => value.sha256 === record.s && value.language === record.l);
  const candidate = job?.candidates.find((value) => value.textSha256 === record.h);
  if (!job || (!record.q && !candidate)) throw new Error("Recording or exact approved display source missing.");
  const annotation = expandOwnerTiming(pack, record, candidate?.text);
  for (const id of record.v) {
    const key = `${id}:${record.s}:${record.h ?? "quran"}`;
    if (seen.has(key)) throw new Error("Ambiguous owner preview.");
    seen.add(key);
    const segment = Object.values(AUDIO_CATALOG.assets).flatMap((asset) =>
      asset.segments.flatMap((segment) =>
        segment.variants
          .filter((value) => value.id === id && value.sha256 === record.s)
          .map((value) => ({ ...value, variantId: id, quranReference: segment.quranReference })),
      ),
    );
    if (!segment.length) throw new Error("Approved recording identity missing.");
    const issues = record.q
      ? validateQuranTiming(annotation, segment[0])
      : validateListeningTiming(annotation, segment[0], candidate.text, record.l);
    if (issues.length) throw new Error(`${id}: ${issues.join("; ")}`);
  }
  if (record.q)
    for (const verse of annotation.verses) {
      const positions = semantic.get(verse.verseKey);
      if (!positions || verse.words.some((word) => !positions.some((value) => value.position === word.position)))
        throw new Error("Unknown Quran semantic word.");
    }
}
console.log(
  `Validated ${pack.records.length} owner-accepted candidates for ${new Set(pack.records.map((record) => record.s)).size} recordings; ${bytes.length} optional compressed bytes.`,
);
