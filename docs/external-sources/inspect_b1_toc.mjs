import fs from "node:fs";

const b1 = fs.readFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", "utf8");
const tocIdx = b1.indexOf("if (p.page === 2 || p.page === 3)");
console.log(b1.slice(tocIdx, tocIdx + 1200));
