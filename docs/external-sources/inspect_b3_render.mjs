import fs from "node:fs";

const b3Code = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");
const lines = b3Code.split("\n");
console.log(lines.slice(245, 305).join("\n"));
