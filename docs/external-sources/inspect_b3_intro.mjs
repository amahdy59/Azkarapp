import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));

for (let i = 4; i <= 16; i++) {
  const p = b3.find((x) => x.page === i);
  console.log(`=== Page ${i}: ${p?.chapter} ===`);
  console.log((p?.lines || []).join("\n").slice(0, 300));
}
