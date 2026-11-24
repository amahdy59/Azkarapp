import fs from "node:fs";

const b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");

const mistIdx = b2.indexOf(".mistakes-container");
if (mistIdx !== -1) {
  console.log(b2.slice(mistIdx, mistIdx + 1000));
} else {
  console.log("Could not find .mistakes-container");
}
