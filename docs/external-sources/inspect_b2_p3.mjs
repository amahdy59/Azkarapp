import fs from "node:fs";

const b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");
const p3Start = b2.indexOf("<!-- ================= PAGE 3");
const p4Start = b2.indexOf("<!-- ================= PAGE 4");
console.log(b2.slice(p3Start, p4Start));
