import fs from "node:fs";

const b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");

const p5Idx = b2.indexOf("— ص ٥ —");
const p6Idx = b2.indexOf("— ص ٦ —");
const p7Idx = b2.indexOf("— ص ٧ —");

console.log("=== Page 5 in Book 2 ===");
console.log(b2.slice(p5Idx - 600, p5Idx + 100));

console.log("=== Page 6 in Book 2 ===");
console.log(b2.slice(p6Idx - 600, p6Idx + 100));

console.log("=== Page 7 in Book 2 ===");
console.log(b2.slice(p7Idx - 600, p7Idx + 100));
