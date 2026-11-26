import fs from "node:fs";

const pagesData = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf-8"));

for (const p of pagesData) {
  if (p.page >= 130) {
    console.log(`Page ${p.page}: Chapter: ${p.chapter}, Lines: ${p.lines?.length}`);
    if (p.lines?.length < 10) {
      console.log(p.lines);
    }
  }
}
