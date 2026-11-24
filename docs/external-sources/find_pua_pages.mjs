import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
const b1 = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));

// Check for PUA characters (U+E000 to U+F8FF, U+FB50 to U+FDFF, U+FE70 to U+FEFF, etc.)
const puaRegex = /[\uE000-\uF8FF\uFB50-\uFDFF]/;

const corruptedB3Pages = [];
b3.forEach((p) => {
  const fullText = (p.lines || []).join(" ");
  if (puaRegex.test(fullText)) {
    corruptedB3Pages.push(p.page);
  }
});

const corruptedB1Pages = [];
b1.forEach((p) => {
  const fullText = (p.lines || []).join(" ");
  if (puaRegex.test(fullText)) {
    corruptedB1Pages.push(p.page);
  }
});

console.log("Book 3 pages with PUA / QCF glyph characters:", corruptedB3Pages);
console.log("Book 1 pages with PUA / QCF glyph characters:", corruptedB1Pages);
