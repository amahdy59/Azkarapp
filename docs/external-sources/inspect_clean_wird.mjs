import fs from "node:fs";

const b3Code = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");
const idx = b3Code.indexOf("function cleanWirdLine");
console.log(b3Code.slice(idx, idx + 600));
