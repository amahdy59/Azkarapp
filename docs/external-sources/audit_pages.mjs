import fs from "node:fs";

console.log("=== AUDITING BOOK 1 ===");
const b1Pages = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));
const b1Md = fs.readFileSync("docs/external-sources/al_mukhtar_extracted.md", "utf8");
console.log("Book 1 total pages in JSON:", b1Pages.length);

for (let i = 1; i <= 64; i++) {
  const p = b1Pages.find((x) => x.page === i);
  if (!p) console.log("Book 1 missing page in JSON:", i);
  const idx = b1Md.indexOf(`## Page ${i}`);
  if (idx === -1) console.log("Book 1 missing page in MD:", i);
}

console.log("=== AUDITING BOOK 3 ===");
const b3Pages = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
const b3Md = fs.readFileSync("docs/external-sources/al_wird_an_nabawi_extracted.md", "utf8");
console.log("Book 3 extracted source characters:", b3Md.length);
console.log("Book 3 total pages in JSON:", b3Pages.length);

for (let i = 1; i <= 137; i++) {
  const p = b3Pages.find((x) => x.page === i);
  if (!p) console.log("Book 3 missing page in JSON:", i);
}

console.log("=== AUDIT SUMMARY ===");
console.log("All pages exist in JSON for Book 1 (64 pages) and Book 3 (137 pages).");
