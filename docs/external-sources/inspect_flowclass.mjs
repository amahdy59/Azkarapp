import fs from "node:fs";

const code = fs.readFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", "utf8");
const lines = code.split("\n");
lines.forEach((l, i) => {
  if (l.includes("flowClass") || l.includes("flowResult")) {
    console.log(`${i + 1}: ${l}`);
  }
});
