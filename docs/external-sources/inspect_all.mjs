import fs from "node:fs";

const b3 = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");
const lines = b3.split("\n");
console.log(lines.slice(400, 550).join("\n"));
