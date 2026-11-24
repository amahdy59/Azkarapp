import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve(import.meta.dirname, "docs/external-sources/book1_al_mukhtar_pages.json");
const pages = JSON.parse(fs.readFileSync(filePath, "utf-8"));

let fixedCount = 0;
pages.forEach((p) => {
  p.lines = p.lines.map((l) => {
    let s = l;
    // Remove leading .» or .« or » from lines
    if (/^[.\s]*[»«]+/.test(s)) {
      s = s.replace(/^[.\s]*[»«]+/, "").trim();
      fixedCount++;
    }
    // Remove trailing .» or .« or » before citations
    s = s.replace(/[.\s]*[»«]+[.\s]*$/, "").trim();
    // Clean misplaced quote dots inside text
    s = s.replace(/\.\s*[»«]\s*/g, " ").replace(/[»«]\s*\.\s*/g, " ");
    return s;
  });
});

console.log(`Cleaned ${fixedCount} lines with inverted quotes.`);
fs.writeFileSync(filePath, JSON.stringify(pages, null, 2), "utf-8");
