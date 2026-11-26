import fs from "node:fs";

const b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");

const p2Idx = b2.indexOf("— ص ٢ —");
const p3Idx = b2.indexOf("— ص ٣ —");
const p4Idx = b2.indexOf("— ص ٤ —");

console.log("=== Page 2 in Book 2 ===");
console.log(b2.slice(p2Idx - 600, p2Idx + 100));

console.log("=== Page 3 in Book 2 ===");
console.log(b2.slice(p3Idx - 600, p3Idx + 100));

console.log("=== Page 4 in Book 2 ===");
console.log(b2.slice(p4Idx - 600, p4Idx + 100));
