import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
const qcfRegex = /[\uFB50-\uFDF9\uFDFB-\uFDFF\uFE70-\uFEFF\uE000-\uF8FF]/g;

const p11 = b3.find((x) => x.page === 11);
const text = p11.lines.join(" ");
const matches = text.match(qcfRegex);
console.log("Page 11 matches count:", matches?.length);
matches?.forEach((m) => {
  console.log("Match:", m, "hex:", m.charCodeAt(0).toString(16));
});
