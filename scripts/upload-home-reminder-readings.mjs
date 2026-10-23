import { readFileSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { URL } from "node:url";

const { fetch } = globalThis;

// Authoring operation only: credentials never enter Vite or the browser bundle.
const values = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = /^\s*([A-Z_0-9]+)\s*=\s*(.*?)\s*$/.exec(line);
      return match ? [[match[1], match[2].replace(/^['"]|['"]$/g, "")]] : [];
    }),
);
const manifest = JSON.parse(readFileSync("src/app/content/homeReminderManifest.json", "utf8"));
const bytes = readFileSync("src/app/content/home-reminder-readings.bin");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();
if (bytes.length !== manifest.bytes || hash(bytes) !== manifest.sha256)
  throw new Error("Run pack:home-reminders first");
const accessKey = values.AZKAR_R2_ACCESS_KEY_ID;
const secretKey = values.AZKAR_R2_SECRET_ACCESS_KEY;
const bucket = values.AZKAR_R2_BUCKET_NAME;
const endpoint = values.R2_ENDPOINT || values.R2_S3_API_ENDPOINT;
if (!accessKey || !secretKey || !bucket || !endpoint) throw new Error("Missing Azkar R2 upload configuration");

// Content-addressed path: an existing matching object is reused, never overwritten.
const publicUrl = new URL(manifest.url);
const existing = await fetch(publicUrl);
if (existing.ok) {
  if (hash(Buffer.from(await existing.arrayBuffer())) !== manifest.sha256) throw new Error("Existing object differs");
  console.log("Existing immutable R2 object verified; upload unnecessary.");
} else {
  if (existing.status !== 404) throw new Error(`Public object check failed: HTTP ${existing.status}`);
  const url = new URL(`/${encodeURIComponent(bucket)}${publicUrl.pathname}`, endpoint);
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = date.slice(0, 8);
  const headers = {
    "cache-control": "public, max-age=31536000, immutable",
    "content-type": "application/octet-stream",
    host: url.host,
    "x-amz-content-sha256": manifest.sha256,
    "x-amz-date": date,
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}\n`)
    .join("");
  const canonical = ["PUT", url.pathname, "", canonicalHeaders, signedHeaders, manifest.sha256].join("\n");
  const scope = `${day}/auto/s3/aws4_request`;
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, day), "auto"), "s3"), "aws4_request");
  const signature = hmac(signingKey, `AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).toString("hex");
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...headers,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: bytes,
  });
  if (!response.ok) throw new Error(`R2 upload failed: HTTP ${response.status}`);
  console.log(`Uploaded immutable catalogue: ${bytes.length} bytes.`);
}
for (const origin of ["https://wa-zaker.com", "https://amahdy59.github.io", "http://127.0.0.1:4897"]) {
  const response = await fetch(publicUrl, { headers: { Origin: origin } });
  if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== manifest.sha256)
    throw new Error("Public checksum verification failed");
  if (response.headers.get("access-control-allow-origin") !== origin) throw new Error(`CORS unavailable for ${origin}`);
  if (response.headers.has("content-encoding"))
    throw new Error("Unexpected Content-Encoding: the app decodes gzip itself");
  console.log(`Verified public bytes and CORS: ${origin}`);
}
console.log(JSON.stringify(manifest));
