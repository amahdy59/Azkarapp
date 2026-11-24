import fs from "node:fs";

const b1 = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));
const qcfRegex = /[\uFB50-\uFDF9\uFDFB-\uFDFF\uFE70-\uFEFF\uE000-\uF8FF]/g;

const checkPages = [4, 5, 6, 7, 9, 12, 15, 16, 26, 32, 34, 46];
checkPages.forEach((num) => {
  const p = b1.find((x) => x.page === num);
  const fullText = (p?.lines || []).join(" ");
  const matches = fullText.match(qcfRegex) || [];
  console.log(`=== Book 1 Page ${num} (${p?.chapter}) - ${matches.length} matches ===`);
  matches.slice(0, 5).forEach((m) => {
    const idx = fullText.indexOf(m);
    console.log(
      "  Match:",
      m,
      "code:",
      m.charCodeAt(0).toString(16),
      "Context:",
      fullText.slice(Math.max(0, idx - 20), Math.min(fullText.length, idx + 30)),
    );
  });
});
