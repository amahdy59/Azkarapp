import fs from "node:fs";

const pages = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));

for (const p of pages) {
  if (p.page <= 3) continue;
  const chars = p.lines.join(" ").length;
  console.log(`Page ${p.page}: lines=${p.lines.length}, chars=${chars}, chapter="${p.chapter}"`);
}
