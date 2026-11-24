import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));

const introPages = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
introPages.forEach((pNum) => {
  const p = b3.find((x) => x.page === pNum);
  console.log(`\n================ PAGE ${pNum} ================`);
  console.log((p?.lines || []).join("\n"));
});
