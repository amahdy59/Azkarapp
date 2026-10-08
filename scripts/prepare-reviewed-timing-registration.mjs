import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import prettier from "prettier";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";
import { readSemanticWords } from "./listening-alignment-inputs.mjs";

const [reviewedFile, outputDirectory] = process.argv.slice(2);
if (!reviewedFile || !outputDirectory || !path.resolve(outputDirectory).startsWith(path.resolve("output") + path.sep))
  throw new Error(
    "Usage: node scripts/prepare-reviewed-timing-registration.mjs independently-reviewed.json output/proposed-registration",
  );
const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
const { validateListeningTiming } = loadTypeScriptModule("src/app/audio/listeningTimings.ts");
const { validateQuranTiming } = loadTypeScriptModule("src/app/audio/quranTimings.ts");
const { reviewedTimingFilename } = loadTypeScriptModule("src/app/audio/reviewedTimingFiles.ts");
const semantic = readSemanticWords("public/data/mushaf");
const value = JSON.parse(fs.readFileSync(reviewedFile, "utf8"));
const annotations = Array.isArray(value) ? value : [value];
const proposed = [];
for (const annotation of annotations) {
  const quran = Array.isArray(annotation.verses);
  const ids = quran ? [annotation.variantId] : annotation.variantIds;
  if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length)
    throw new Error("Unique approved variant identities required.");
  for (const variantId of ids) {
    const matches = Object.values(AUDIO_CATALOG.assets)
      .filter((asset) => asset.reviewStatus === "approved")
      .flatMap((asset) =>
        asset.segments.flatMap((segment) =>
          segment.variants
            .filter((variant) => variant.id === variantId && variant.reviewStatus === "approved")
            .map((variant) => ({ ...variant, variantId, quranReference: segment.quranReference })),
        ),
      );
    if (matches.length !== 1) throw new Error("Approved recording is missing or ambiguous.");
    const issues = quran
      ? validateQuranTiming(annotation, matches[0])
      : validateListeningTiming(annotation, matches[0], annotation.transcript, annotation.language);
    if (issues.length) throw new Error(issues.join("\n"));
  }
  if (quran) {
    for (const verse of annotation.verses) {
      const words = semantic.get(verse.verseKey);
      if (
        !words ||
        words.length !== verse.words?.length ||
        verse.words.some((word, index) => word.position !== words[index].position)
      )
        throw new Error("Complete canonical Quran word positions required.");
    }
  } else if (crypto.createHash("sha256").update(annotation.transcript, "utf8").digest("hex") !== annotation.textSha256)
    throw new Error("Transcript checksum differs.");
  const bytes = await prettier.format(JSON.stringify(annotation), {
    ...(await prettier.resolveConfig("public/release-notes.json")),
    parser: "json",
  });
  if (Buffer.byteLength(bytes, "utf8") > 750000) throw new Error("Annotation exceeds bounded loading size.");
  const file = {
    kind: quran ? "quran" : "listening",
    variantIds: ids,
    sha256: annotation.sha256,
    annotationSha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    language: quran ? "ar" : annotation.language,
    ...(!quran ? { textSha256: annotation.textSha256 } : {}),
  };
  proposed.push({ file, bytes });
}
fs.mkdirSync(outputDirectory, { recursive: true });
for (const { file, bytes } of proposed)
  fs.writeFileSync(path.join(outputDirectory, reviewedTimingFilename(file)), bytes);
fs.writeFileSync(
  path.join(outputDirectory, "proposed-index.json"),
  JSON.stringify(
    proposed.map((item) => item.file),
    null,
    2,
  ) + "\n",
);
console.log(
  `Prepared ${proposed.length} independently reviewed annotations for code review. No app files or approvals were changed.`,
);
