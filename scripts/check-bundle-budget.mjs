import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const limits = { javascript: 550 * 1024, css: 140 * 1024, asset: 1024 * 1024 };
const assetsDirectory = path.resolve("dist/assets");
const entries = await readdir(assetsDirectory);
const failures = [];

for (const entry of entries) {
  const size = (await stat(path.join(assetsDirectory, entry))).size;
  const limit = entry.endsWith(".js") ? limits.javascript : entry.endsWith(".css") ? limits.css : limits.asset;
  if (size > limit) failures.push(`${entry}: ${size} bytes exceeds ${limit} bytes`);
}

if (failures.length) {
  console.error(`Bundle budget exceeded:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("Bundle budget passed.");
