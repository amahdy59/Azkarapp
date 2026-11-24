import fs from "node:fs";

const pages = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));
const p20 = pages.find((p) => p.page === 20);
console.log("Page 20 lines:", p20.lines);
console.log("Total chars in lines:", p20.lines.join(" ").length);
