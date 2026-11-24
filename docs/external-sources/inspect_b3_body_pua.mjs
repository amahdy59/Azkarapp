import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
const puaRegex = /[\uE000-\uF8FF\uFB50-\uFDFF]/g;

for (let i = 17; i <= 30; i++) {
  const p = b3.find((x) => x.page === i);
  const fullText = (p?.lines || []).join(" ");
  const matches = fullText.match(puaRegex) || [];
  if (matches.length > 0) {
    console.log(`Page ${i} has ${matches.length} PUA chars. Sample matches:`, matches.slice(0, 10));
    // Let's see context around the match
    const firstMatch = matches[0];
    const idx = fullText.indexOf(firstMatch);
    console.log("Context:", fullText.slice(Math.max(0, idx - 40), Math.min(fullText.length, idx + 60)));
  } else {
    console.log(`Page ${i}: CLEAN (no PUA)`);
  }
}
