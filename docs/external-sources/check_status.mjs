import fs from "node:fs";

const b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");
console.log('B2 has id="p-1":', b2.includes('id="p-1"'));
console.log("B2 has roadmap-box:", b2.includes("roadmap-box"));

const b3 = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");
console.log('B3 has id="p-1":', b3.includes('id="p-1"'));
console.log("B3 has repetition badges:", b3.includes("repetition-badge"));
console.log("B3 has virtue callouts:", b3.includes("virtue-callout"));
