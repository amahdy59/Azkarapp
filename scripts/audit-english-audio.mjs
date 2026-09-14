/* global fetch */
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import path from "node:path";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const root = process.cwd();
const manifest = loadTypeScriptModule(path.join(root, "src/app/audio/audioManifest.ts"));
const baseUrl = (process.env.VITE_AUDIO_BASE_URL || "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev").replace(
  /\/+$/,
  "",
);

const variants = Object.values(manifest.AUDIO_CATALOG.assets).flatMap((asset) =>
  asset.segments.flatMap((segment) =>
    segment.variants.filter((variant) => variant.reviewStatus === "approved" && variant.voiceId === "english-george"),
  ),
);

const inspect = async (variant) => {
  const response = await fetch(`${baseUrl}/${variant.relativePath.replace(/^\/+/, "")}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get("content-type")?.split(";")[0];
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const mp3Magic =
    bytes.subarray(0, 3).toString("ascii") === "ID3" ||
    (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  const problems = [];
  if (response.status !== 200) problems.push(`HTTP ${response.status}`);
  if (mimeType !== "audio/mpeg") problems.push(`MIME ${mimeType ?? "missing"}`);
  if (!mp3Magic) problems.push("invalid MP3 signature");
  if (bytes.length !== variant.byteSize) problems.push(`size ${bytes.length}, manifest ${variant.byteSize}`);
  if (sha256 !== variant.sha256) problems.push(`SHA-256 ${sha256}, manifest ${variant.sha256}`);
  return { variant, problems };
};

const results = [];
for (let index = 0; index < variants.length; index += 8) {
  results.push(...(await Promise.all(variants.slice(index, index + 8).map(inspect))));
}

const failures = results.filter((result) => result.problems.length > 0);
if (failures.length > 0) {
  console.error(`English audio audit failed for ${failures.length} of ${variants.length} approved recording(s):`);
  for (const { variant, problems } of failures) console.error(`- ${variant.id}: ${problems.join("; ")}`);
  process.exitCode = 1;
} else {
  console.log(
    `English audio audit passed: ${variants.length} approved recording(s), each reachable as audio/mpeg with valid MP3 bytes, byte size, and SHA-256.`,
  );
}
