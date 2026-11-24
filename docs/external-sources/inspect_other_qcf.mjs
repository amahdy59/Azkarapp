import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
const qcfRegex = /[\uFB50-\uFDF9\uFDFB-\uFDFF\uFE70-\uFEFF\uE000-\uF8FF]/g;

const checkPages = [34, 35, 36, 37, 75, 96, 97, 98, 113, 118, 125];
checkPages.forEach((num) => {
  const p = b3.find((x) => x.page === num);
  const fullText = (p?.lines || []).join(" ");
  const matches = fullText.match(qcfRegex) || [];
  console.log(`=== Page ${num} (${p?.chapter}) - ${matches.length} matches ===`);
  matches.slice(0, 5).forEach((m) => {
    const idx = fullText.indexOf(m);
    console.log(
      "  Match:",
      m,
      "code:",
      m.charCodeAt(0).toString(16),
      "Context:",
      fullText.slice(Math.max(0, idx - 30), Math.min(fullText.length, idx + 40)),
    );
  });
});
