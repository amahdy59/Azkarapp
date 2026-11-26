import fs from "node:fs";

const b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");
const p2Start = b2.indexOf('id="p-2"');
const p3Start = b2.indexOf('id="p-3"');

console.log(b2.slice(p2Start, p3Start));
