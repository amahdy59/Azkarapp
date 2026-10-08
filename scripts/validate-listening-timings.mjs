import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";
const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
const { LISTENING_TIMING_CATALOG, validateListeningTiming } = loadTypeScriptModule("src/app/audio/listeningTimings.ts");
const { REVIEWED_TIMING_FILES, reviewedTimingFilename } = loadTypeScriptModule("src/app/audio/reviewedTimingFiles.ts");
const annotations = [...LISTENING_TIMING_CATALOG];
for (const file of REVIEWED_TIMING_FILES.filter((item) => item.kind === "listening")) {
  const bytes = fs.readFileSync(path.join("public/data/listening-timings", reviewedTimingFilename(file)));
  if (bytes.length > 750000 || crypto.createHash("sha256").update(bytes).digest("hex") !== file.annotationSha256)
    throw new Error("Reviewed annotation checksum or size differs.");
  const annotation = JSON.parse(bytes.toString("utf8"));
  if (
    annotation.sha256 !== file.sha256 ||
    annotation.textSha256 !== file.textSha256 ||
    annotation.language !== file.language ||
    JSON.stringify(annotation.variantIds) !== JSON.stringify(file.variantIds)
  )
    throw new Error("Reviewed timing file differs from its registration index.");
  annotations.push(annotation);
}
const issues = [],
  seen = new Set();
for (const annotation of annotations) {
  if (crypto.createHash("sha256").update(annotation.transcript, "utf8").digest("hex") !== annotation.textSha256)
    issues.push("Transcript checksum differs.");
  for (const variantId of annotation.variantIds) {
    const identity = `${variantId}:${annotation.language}:${annotation.textSha256}`;
    if (seen.has(identity)) issues.push(`${identity}: ambiguous annotations`);
    seen.add(identity);
    const variants = Object.values(AUDIO_CATALOG.assets)
      .filter((asset) => asset.reviewStatus === "approved")
      .flatMap((asset) =>
        asset.segments.flatMap((segment) =>
          segment.variants.filter((variant) => variant.id === variantId && variant.reviewStatus === "approved"),
        ),
      );
    if (variants.length !== 1) issues.push(`${identity}: missing or ambiguous approved recording`);
    else
      issues.push(
        ...validateListeningTiming(
          annotation,
          { ...variants[0], variantId },
          annotation.transcript,
          annotation.language,
        ),
      );
  }
  if (!annotation.variantIds.length) issues.push("Recording identities missing.");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else console.log(`Listening timings validated: ${annotations.length} independently reviewed exact transcripts.`);
