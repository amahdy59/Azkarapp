import fs from "node:fs";

const pages = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));
const p9 = pages.find((p) => p.page === 9);
console.log("Page 9 chapter:", p9.chapter);
console.log("Page 9 lines:", p9.lines);
