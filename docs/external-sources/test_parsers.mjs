import fs from "node:fs";

const pages = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));
const p4 = pages.find((p) => p.page === 4);
const p5 = pages.find((p) => p.page === 5);

console.log("P4 lines:\n", p4.lines.join("\n"));
console.log("P5 lines:\n", p5.lines.join("\n"));
