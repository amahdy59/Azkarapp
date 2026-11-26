/** Upload only the owner's three checksum-bound accepted Al-Mulk recordings. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";
import { loadAudioUploadConfiguration, uploadImmutableAudio, verifyHostedAudio } from "./upload-opendua-audio.mjs";

const configIndex = process.argv.indexOf("--env-file");
if (configIndex < 0 || !process.argv[configIndex + 1]) throw new Error("Required: --env-file <local configuration>");
const configuration = loadAudioUploadConfiguration(process.argv[configIndex + 1]);
const manifest = JSON.parse(readFileSync("docs/audio/quran-reciter-pilot/manifest.json", "utf8"));
const acceptance = JSON.parse(readFileSync("docs/audio/quran-reciter-pilot/activation.json", "utf8"));
const permission = readFileSync("docs/audio/quran-reciter-pilot/provider-permission.html");
if (createHash("sha256").update(permission).digest("hex") !== manifest.permissionSha256)
  throw new Error("Provider copying-permission evidence mismatch");
const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
for (const accepted of acceptance.recordings) {
  const recording = manifest.recordings.find((entry) => entry.readingId === accepted.readingId);
  const variant = AUDIO_CATALOG.assets[accepted.assetId]?.segments
    .flatMap((segment) => segment.variants)
    .find((entry) => entry.voiceId === accepted.voiceId);
  if (
    !recording ||
    !variant ||
    variant.reviewStatus !== "approved" ||
    variant.sha256 !== accepted.sha256 ||
    variant.sha256 !== recording.sha256 ||
    !variant.reviewedBy ||
    !variant.reviewedAt
  )
    throw new Error("Recording is not bound to owner listening acceptance");
  const bytes = readFileSync(`output/quran-reciter-review/media/${recording.file}`);
  console.log(`Verifying/uploading ${recording.nameEnglish} (${(bytes.length / 1_000_000).toFixed(1)} MB original).`);
  const result = await uploadImmutableAudio({ variant, bytes, configuration, timeoutMs: 120_000 });
  await verifyHostedAudio(variant, configuration, 120_000);
  console.log(`${recording.nameEnglish}: ${result}; public checksum, audio MIME, CORS and byte ranges verified.`);
}
