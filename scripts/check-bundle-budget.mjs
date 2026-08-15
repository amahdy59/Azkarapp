import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

/**
 * The CSS limits were raised from 134 kB / 23 kB in DEC-065. They had been
 * calibrated against a build that silently omitted every utility used only
 * inside src/app/components/ui (DEC-064 / F01), so they were never a ceiling on
 * a correct build — restoring 126 required rules cost 15.7 kB raw / 2.1 kB gzip.
 * The new numbers leave roughly the same proportional headroom over the
 * corrected build as the old ones did over the broken one. Do not raise them
 * again to make a build pass; reduce the CSS instead.
 */
const limits = {
  javascript: 450 * 1024,
  css: 150 * 1024,
  asset: 1024 * 1024,
  javascriptGzip: 130 * 1024,
  cssGzip: 26 * 1024,
  initialGzip: 200 * 1024,
};
const assetsDirectory = path.resolve("dist/assets");
const entries = await readdir(assetsDirectory);
const failures = [];

for (const entry of entries) {
  const filePath = path.join(assetsDirectory, entry);
  const size = (await stat(filePath)).size;
  const limit = entry.endsWith(".js") ? limits.javascript : entry.endsWith(".css") ? limits.css : limits.asset;
  if (size > limit) failures.push(`${entry}: ${size} bytes exceeds ${limit} bytes`);

  if (entry.endsWith(".js") || entry.endsWith(".css")) {
    const compressedSize = gzipSync(await readFile(filePath)).byteLength;
    const compressedLimit = entry.endsWith(".js") ? limits.javascriptGzip : limits.cssGzip;
    if (compressedSize > compressedLimit) {
      failures.push(`${entry}: ${compressedSize} gzip bytes exceeds ${compressedLimit} bytes`);
    }
  }
}

const manifest = JSON.parse(await readFile(path.resolve("dist/.vite/manifest.json"), "utf8"));
const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry);
if (!entryKey) {
  failures.push("Build manifest does not contain an entry chunk.");
} else {
  const initialFiles = new Set();
  const visitManifestEntry = (key) => {
    const item = manifest[key];
    if (!item) return;
    if (item.file) initialFiles.add(item.file);
    for (const cssFile of item.css ?? []) initialFiles.add(cssFile);
    for (const importedKey of item.imports ?? []) visitManifestEntry(importedKey);
  };
  visitManifestEntry(entryKey);

  let initialGzipSize = gzipSync(await readFile(path.resolve("dist/index.html"))).byteLength;
  for (const file of initialFiles) {
    initialGzipSize += gzipSync(await readFile(path.resolve("dist", file))).byteLength;
  }
  if (initialGzipSize > limits.initialGzip) {
    failures.push(`Initial route: ${initialGzipSize} gzip bytes exceeds ${limits.initialGzip} bytes`);
  }
}

if (failures.length) {
  console.error(`Bundle budget exceeded:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("Bundle budget passed.");
