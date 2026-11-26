/** Explicit authoring operation. Never enabled by app startup or ordinary CI. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { URL } from "node:url";
const { fetch, AbortSignal } = globalThis;
import { loadAudioUploadConfiguration, uploadImmutableAudio, verifyHostedAudio } from "./upload-opendua-audio.mjs";

const configIndex = process.argv.indexOf("--env-file");
if (configIndex < 0 || !process.argv[configIndex + 1]) throw new Error("Required: --env-file <private configuration>");
const configuration = loadAudioUploadConfiguration(process.argv[configIndex + 1]);
const evidence = JSON.parse(await readFile("docs/audio/expanded-library/evidence.json", "utf8"));
const recordings = [...new Map(evidence.recordings.map((item) => [item.relativePath, item])).values()];
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (next < recordings.length) {
      const item = recordings[next++];
      const source = new URL(item.sourceUrl);
      if (
        !item.fullDecodePassed ||
        !/^[a-f0-9]{64}$/.test(item.sha256) ||
        !["https://cdn.mp3quran.net", "https://audio.opendua.org"].includes(source.origin) ||
        !/^(?:quran\/mp3quran|dua\/opendua\/muhammad-jumah)\/[\w./-]+\.mp3$/.test(item.relativePath) ||
        item.relativePath.includes("..")
      )
        throw new Error("Recording lacks exact verified source identity");
      const response = await fetch(source, { signal: AbortSignal.timeout(600_000) });
      if (!response.ok) throw new Error(`Source HTTP ${response.status} for ${item.file}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length !== item.byteSize || createHash("sha256").update(bytes).digest("hex") !== item.sha256)
        throw new Error(`Changed source identity for ${item.file}`);
      const variant = { ...item, mimeType: "audio/mpeg" };
      const result = await uploadImmutableAudio({ variant, bytes, configuration, timeoutMs: 600_000 });
      await verifyHostedAudio(variant, configuration, 600_000);
      results.push({
        relativePath: item.relativePath,
        sha256: item.sha256,
        byteSize: item.byteSize,
        result,
        checks: ["source-sha256", "immutable-upload", "public-sha256", "audio-mime", "production-cors", "byte-ranges"],
      });
      console.log(`Verified ${results.length}/${recordings.length}: ${item.file}`);
    }
  }),
);
await mkdir("output/audio-ingestion", { recursive: true });
await writeFile("output/audio-ingestion/verification.json", JSON.stringify(results, null, 2) + "\n");
console.log(`Verified ${results.length} immutable recordings. No app/default preferences were changed.`);
