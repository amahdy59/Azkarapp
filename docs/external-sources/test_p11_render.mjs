import fs from "node:fs";

const b3 = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
const p11 = b3.find((x) => x.page === 11);
const text = p11.lines.join(" ");
console.log("Page 11 length:", text.length);
console.log("Page 11 text:", text);
