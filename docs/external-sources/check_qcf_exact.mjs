import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
// Match characters that are QCF Quranic glyphs (like ﰁ, ﭸ, ﮀ, etc., excluding standard Arabic, standard diacritics, and U+FDFA ﷺ)
const qcfRegex = /[\uFB50-\uFDF9\uFDFB-\uFDFF\uFE70-\uFEFF\uE000-\uF8FF]/;

const qcfPages = [];
b3.forEach((p) => {
  const fullText = (p.lines || []).join(" ");
  if (qcfRegex.test(fullText)) {
    qcfPages.push(p.page);
  }
});

console.log("Book 3 pages with QCF Quranic glyphs (excluding standard ﷺ):", qcfPages);
