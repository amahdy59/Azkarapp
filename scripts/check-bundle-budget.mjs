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
 *
 * Raised once more in DEC-109, from 160 kB to 164 kB raw, on an explicit user
 * decision. The 160 kB ceiling had drifted to roughly 1 kB of headroom, which
 * is less than one component's worth of styling: it had stopped separating
 * "this feature costs a little CSS" from "the purge broke again", and was
 * failing the first while a 15 kB regression of the second is what it exists to
 * catch. 164 kB restores ~3.7 kB of room without weakening that. The gzip
 * ceiling is deliberately unchanged — it is the number that reflects what is
 * actually shipped over the wire, and it still holds 1.4 kB of headroom.
 */
/**
 * `totalOutput` and `largestFile` walk the whole of dist/, not just dist/assets.
 * Everything copied verbatim from public/ lands outside dist/assets, so until
 * DEC-066 this gate could not see it at all — roughly 24 MB of unreferenced
 * masters, design sources and superseded imagery shipped on every release
 * without the budget noticing (F24/F25). Measured output after that cleanup is
 * ~6.2 MB, so these ceilings hold real headroom while still failing loudly if
 * a source tree is dropped back into public/.
 */
const limits = {
  javascript: 480 * 1024,
  css: 164 * 1024,
  asset: 1024 * 1024,
  javascriptGzip: 140 * 1024,
  cssGzip: 28 * 1024,
  initialGzip: 250 * 1024,
  totalOutput: 9 * 1024 * 1024,
  largestFile: 2 * 1024 * 1024,
};
const distDirectory = path.resolve("dist");
const assetsDirectory = path.resolve("dist/assets");
const entries = await readdir(assetsDirectory);
const failures = [];

async function* walkFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walkFiles(entryPath);
    else yield entryPath;
  }
}

let totalOutputSize = 0;
for await (const filePath of walkFiles(distDirectory)) {
  const size = (await stat(filePath)).size;
  totalOutputSize += size;
  if (size > limits.largestFile) {
    const relativePath = path.relative(distDirectory, filePath).split(path.sep).join("/");
    failures.push(`${relativePath}: ${size} bytes exceeds the ${limits.largestFile} byte single-file limit`);
  }
}
if (totalOutputSize > limits.totalOutput) {
  failures.push(`dist total: ${totalOutputSize} bytes exceeds ${limits.totalOutput} bytes`);
}

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

  /*
   * The audio chunk is deferred on purpose (src/app/audio/lazyAudio.ts loads it
   * in the background after first paint, and vite.config.ts keeps it out of the
   * module preload). It had nonetheless become a static import of the entry:
   * the azkar corpus, which state.ts needs at startup, had been folded into it,
   * so every visitor fetched the audio manifest before the first screen and the
   * deferral was decorative. Under the gzip ceiling alone that cost 121 kB
   * quietly; named here it fails loudly instead.
   */
  const eagerAudio = [...initialFiles].filter((file) => file.split("/").pop().startsWith("audio-"));
  if (eagerAudio.length > 0) {
    failures.push(`Initial route statically imports the deferred audio chunk: ${eagerAudio.join(", ")}`);
  }

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
