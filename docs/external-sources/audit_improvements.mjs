import fs from "node:fs";

const b1 = fs.readFileSync("docs/external-sources/book1_al_mukhtar/al_mukhtar_light.html", "utf8");
const b2 = fs.readFileSync("docs/external-sources/book2_dalil_al_mutamir/dalil_al_mutamir_light.html", "utf8");
const b3 = fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html", "utf8");

console.log("Book 1 has TOC links (href=):", b1.includes("href="));
console.log("Book 2 has TOC links (href=):", b2.includes("href="));
console.log("Book 3 has TOC links (href=):", b3.includes("href="));
console.log("Book 1 repetition badges:", b1.includes("repetition-badge") || b1.includes("count-pill"));
console.log("Book 2 visual flowchart/roadmap:", b2.includes("roadmap") || b2.includes("timeline"));
console.log("Book 3 chapter bookmark anchors:", b3.includes('id="chapter-'));
