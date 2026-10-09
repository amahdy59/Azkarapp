import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const file = "src/app/releaseHistory.data.json";
const current = JSON.parse(readFileSync("public/release-notes.json", "utf8"));
const history = JSON.parse(readFileSync(file, "utf8"));
const updated = [current, ...history.filter((entry) => entry.release !== current.release)];
writeFileSync(file, JSON.stringify(updated, null, 2) + "\n");
writeFileSync("src/app/release-history.bin", gzipSync(JSON.stringify(updated), { level: 9 }));
console.log(
  `Archived release ${current.release}; ${history.length + (history.some((entry) => entry.release === current.release) ? 0 : 1)} releases retained.`,
);
