import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", "utf8");

const oldLogic = `    let flowClass;
    if (flowResult.count >= 8 || flowResult.totalChars >= 1100) {
      flowClass = "flow-ultra-dense";
    } else if (flowResult.count >= 6 || flowResult.totalChars >= 850) {
      flowClass = "flow-dense";
    } else if (flowResult.count === 1) {
      flowClass = "flow-sparse";
    } else if (flowResult.count <= 3 || flowResult.totalChars < 600) {
      flowClass = "flow-roomy";
    } else {
      flowClass = "flow-normal";
    }`;

const newLogic = `    let flowClass;
    if (flowResult.count >= 8) {
      flowClass = "flow-ultra-dense";
    } else if (flowResult.count >= 6) {
      flowClass = "flow-dense";
    } else if (flowResult.count === 1) {
      flowClass = "flow-sparse";
    } else if (flowResult.count <= 3) {
      flowClass = "flow-roomy";
    } else {
      flowClass = "flow-normal";
    }`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", code, "utf8");
  console.log("Successfully updated flowClass logic in generate_book1_al_mukhtar.mjs");
} else {
  console.log("Could not find exact oldLogic");
}
