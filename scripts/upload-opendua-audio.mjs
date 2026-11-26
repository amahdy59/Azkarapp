/** Authoring only: publishes the three owner-accepted, immutable original MP3s. */
import { readFileSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { pathToFileURL } from "node:url";
import { URL } from "node:url";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const { fetch, AbortSignal } = globalThis;

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();

export async function uploadImmutableAudio({ variant, bytes, configuration, fetchImpl = fetch, timeoutMs = 30_000 }) {
  if (bytes.length !== variant.byteSize || hash(bytes) !== variant.sha256)
    throw new Error("Local recording checksum/size mismatch");
  if (!/^[\w.-]+(?:\/[\w.-]+)*$/.test(variant.relativePath) || variant.relativePath.includes(".."))
    throw new Error("Unsafe recording path");
  const publicUrl = new URL(variant.relativePath, `${configuration.publicBase.replace(/\/+$/, "")}/`);
  const existing = await fetchImpl(publicUrl, { signal: AbortSignal.timeout(timeoutMs) });
  if (existing.ok) {
    if (hash(Buffer.from(await existing.arrayBuffer())) !== variant.sha256)
      throw new Error("Existing immutable recording differs; refusing overwrite");
    return "reused";
  }
  if (existing.status !== 404) throw new Error(`Public recording check failed: HTTP ${existing.status}`);
  const { accessKey, secretKey, bucket, endpoint } = configuration;
  if (!accessKey || !secretKey || !bucket || !endpoint) throw new Error("Missing Azkar R2 upload configuration");
  const url = new URL(`/${encodeURIComponent(bucket)}/${variant.relativePath}`, endpoint);
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = date.slice(0, 8);
  const headers = {
    "cache-control": "public, max-age=31536000, immutable",
    "content-type": variant.mimeType,
    host: url.host,
    "x-amz-content-sha256": variant.sha256,
    "x-amz-date": date,
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}\n`)
    .join("");
  const canonical = ["PUT", url.pathname, "", canonicalHeaders, signedHeaders, variant.sha256].join("\n");
  const scope = `${day}/auto/s3/aws4_request`;
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, day), "auto"), "s3"), "aws4_request");
  const signature = hmac(signingKey, `AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).toString("hex");
  const response = await fetchImpl(url, {
    method: "PUT",
    headers: {
      ...headers,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: bytes,
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`R2 upload failed: HTTP ${response.status}`);
  return "uploaded";
}

export function loadAudioUploadConfiguration(file) {
  const values = Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .flatMap((line) => {
        const match = /^\s*([A-Z_0-9]+)\s*=\s*(.*?)\s*$/.exec(line);
        return match ? [[match[1], match[2].replace(/^['"]|['"]$/g, "")]] : [];
      }),
  );
  return {
    accessKey: values.AZKAR_R2_ACCESS_KEY_ID,
    secretKey: values.AZKAR_R2_SECRET_ACCESS_KEY,
    bucket: values.AZKAR_R2_BUCKET_NAME,
    endpoint: values.R2_ENDPOINT || values.R2_S3_API_ENDPOINT,
    publicBase: values.VITE_AUDIO_BASE_URL || "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev",
  };
}

export async function verifyHostedAudio(variant, configuration, timeoutMs = 45_000) {
  const publicUrl = new URL(variant.relativePath, `${configuration.publicBase}/`);
  const response = await fetch(publicUrl, {
    headers: { Origin: "https://amahdy59.github.io" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== variant.sha256)
    throw new Error("Public recording checksum verification failed");
  if (!response.headers.get("content-type")?.includes("audio/mpeg")) throw new Error("Incorrect recording MIME");
  if (response.headers.get("access-control-allow-origin") !== "https://amahdy59.github.io")
    throw new Error("Production recording CORS unavailable");
  const range = await fetch(publicUrl, { headers: { Range: "bytes=0-15" }, signal: AbortSignal.timeout(30_000) });
  if (range.status !== 206 || (await range.arrayBuffer()).byteLength !== 16)
    throw new Error("Recording byte ranges unavailable");
}

async function main() {
  const configIndex = process.argv.indexOf("--env-file");
  if (configIndex < 0 || !process.argv[configIndex + 1]) throw new Error("Required: --env-file <local configuration>");
  const configuration = loadAudioUploadConfiguration(process.argv[configIndex + 1]);
  const pilot = JSON.parse(readFileSync("docs/audio/opendua-pilot/pilot.json", "utf8"));
  const acceptance = JSON.parse(readFileSync("docs/audio/opendua-pilot/activation.json", "utf8"));
  const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
  for (const candidate of pilot.candidates) {
    const variant = AUDIO_CATALOG.assets[candidate.assetId].segments
      .flatMap((segment) => segment.variants)
      .find((entry) => entry.voiceId === pilot.voiceId);
    if (
      !variant ||
      variant.reviewStatus !== "approved" ||
      variant.sha256 !== candidate.sha256 ||
      !variant.reviewedBy ||
      !variant.reviewedAt ||
      !acceptance.recordings.some((entry) => entry.assetId === candidate.assetId && entry.sha256 === variant.sha256)
    )
      throw new Error("Recording is not bound to the owner acceptance record");
    const bytes = readFileSync(`docs/audio/opendua-pilot/media/${candidate.file}`);
    const result = await uploadImmutableAudio({ variant, bytes, configuration });
    await verifyHostedAudio(variant, configuration);
    console.log(`${candidate.file}: ${result}; public checksum, audio MIME, CORS and byte ranges verified.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
