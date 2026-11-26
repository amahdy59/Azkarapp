/** Authoring only. Downloads pending review copies; never uploads or enables audio. */
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { URL } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const { fetch, AbortSignal } = globalThis;

const catalogueUrl = "https://opendua.org/v0.0.4/catalogue.json";
const licenceUrl = "https://opendua.org/licence/audio";
const destination = "docs/audio/opendua-pilot";
const selections = [
  { assetId: "wu-hm-3", entryId: "entry-000003", file: "OD-003.mp3" },
  { assetId: "friday-dua-22", entryId: "entry-000046", file: "OD-046.mp3" },
  { assetId: "m-hm-91", entryId: "entry-000254", file: "OD-254.mp3" },
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function fetchBytes(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
async function writeImmutable(file, bytes) {
  let previous;
  try {
    previous = await readFile(file);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (previous && hash(previous) !== hash(bytes)) throw new Error(`Refusing to replace different bytes: ${file}`);
  if (!previous) await writeFile(file, bytes);
}

const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
const { normalizeArabicForAudioMatching } = loadTypeScriptModule("src/app/audio/arabicMatching.ts");
const catalogueBytes = await fetchBytes(catalogueUrl);
const catalogue = JSON.parse(catalogueBytes);
const licenceBytes = await fetchBytes(licenceUrl);
await mkdir(`${destination}/media`, { recursive: true });
await writeImmutable(`${destination}/catalogue.json`, catalogueBytes);
await writeImmutable(`${destination}/audio-licence.html`, licenceBytes);
const candidates = [];
for (const selection of selections) {
  const asset = AUDIO_CATALOG.assets[selection.assetId];
  const entry = catalogue.entries.find((entry) => entry.id === selection.entryId);
  if (!asset || asset.contentKind !== "dua" || asset.segments.length !== 1 || !entry)
    throw new Error(`Invalid explicit selection ${selection.assetId}`);
  const steps = entry.variations.flatMap((variation) => variation.steps);
  const step = steps.find((step) =>
    step.recordings?.some((recording) => new URL(recording.url).pathname.endsWith(`/${selection.file}`)),
  );
  const transcriptArabic = step?.items?.map((item) => item.dua?.arabic ?? "").join(" ");
  if (
    !transcriptArabic ||
    normalizeArabicForAudioMatching(transcriptArabic) !== normalizeArabicForAudioMatching(asset.canonicalArabicText)
  )
    throw new Error(`Transcript mismatch for ${selection.assetId}`);
  const recording = step.recordings.find((recording) => new URL(recording.url).pathname.endsWith(`/${selection.file}`));
  const sourceUrl = `https://audio.opendua.org/hisn/v0.0.2/${selection.file}`;
  if (recording.url !== sourceUrl || recording.reciterId !== "reciter-0001")
    throw new Error("Unexpected recording identity");
  const bytes = await fetchBytes(sourceUrl);
  if (bytes.length < 1000 || !(bytes.subarray(0, 3).toString() === "ID3" || bytes[0] === 0xff))
    throw new Error(`Not an MP3: ${selection.file}`);
  await writeImmutable(`${destination}/media/${selection.file}`, bytes);
  candidates.push({
    ...selection,
    segmentId: asset.segments[0].id,
    recordingId: recording.id,
    transcriptArabic,
    sourceUrl,
    sourceDeclaredDurationMs: recording.durationSeconds * 1000,
    byteSize: bytes.length,
    sha256: hash(bytes),
    relativePath: `dua/opendua/muhammad-jumah/v0.0.2/${selection.file}`,
    reviewStatus: "pending",
  });
}
const manifest = {
  catalogueUrl,
  catalogueSha256: hash(catalogueBytes),
  dataVersion: "0.0.4",
  audioVersion: "0.0.2",
  licenceUrl,
  licenceSha256: hash(licenceBytes),
  licence: "CC-BY-4.0",
  attribution: "Recitation by Muhammad Jumah for OpenDua.",
  voiceId: "opendua-muhammad-jumah",
  voiceName: "Muhammad Jumah",
  voiceNameArabic: "محمد جمعة",
  candidates,
};
await writeImmutable(`${destination}/pilot.json`, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
console.log(
  `Prepared ${candidates.length} pending recordings (${candidates.reduce((n, c) => n + c.byteSize, 0)} bytes). Existing audio is unchanged.`,
);
