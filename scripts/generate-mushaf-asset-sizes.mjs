/* global fetch, AbortSignal */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { format, resolveConfig } from "prettier";

const source = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/";
await mkdir("output", { recursive: true });
const checkpoint = "output/mushaf-size-observations.json";
const saved = await readFile(checkpoint, "utf8")
  .then(JSON.parse)
  .catch(() => ({}));
const observations = saved.source === source && !process.argv.includes("--refresh") ? saved.observations : [];
const pageBytes = [];
const fontBytes = [];
let nextPage = 1;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (nextPage <= 604) {
      const page = nextPage++;
      const local = await readFile(`public/data/mushaf/${page}.json`);
      pageBytes[page - 1] = local.byteLength;
      let response;
      const observed = observations[page - 1];
      if (observed?.page === page && observed.bytes >= 48) {
        fontBytes[page - 1] = observed.bytes;
        continue;
      }
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await fetch(`${source}p${page}.woff2`, { method: "HEAD", signal: AbortSignal.timeout(15000) });
        } catch {
          /* Retry a transient network failure. */
        }
        if (response?.ok) break;
      }
      const bytes = Number(response?.headers.get("content-length"));
      if (!response?.ok || !Number.isSafeInteger(bytes) || bytes < 48)
        throw new Error(`No measured font size for page ${page}`);
      fontBytes[page - 1] = bytes;
      observations[page - 1] = { page, bytes, etag: response.headers.get("etag") };
      if (page % 24 === 0) {
        await writeFile(checkpoint, JSON.stringify({ source, observations }));
        console.log(`Measured page ${page}`);
      }
    }
  }),
);
const version = createHash("sha256")
  .update(JSON.stringify({ source, pageBytes, fontBytes }))
  .digest("hex")
  .slice(0, 16);
await mkdir("output", { recursive: true });
await writeFile("output/mushaf-size-observations.json", JSON.stringify({ source, observations }, null, 2));
await writeFile(
  "src/app/content/mushafAssetSizes.json",
  await format(JSON.stringify({ version, source, pageBytes, fontBytes }), {
    ...(await resolveConfig("src/app/content/mushafAssetSizes.json")),
    parser: "json",
  }),
);
console.log(`Measured 604 page/font pairs, catalog ${version}`);
