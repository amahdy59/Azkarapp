import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", "utf8");

// 1. Filter out 'والصلاة والسلام على رسوله'
code = code.replace(
  'l.includes("والثناءُ عليه") ||',
  'l.includes("والثناءُ عليه") ||\n      l.startsWith("والصلاة والسلام على رسوله") ||',
);

// 2. Only count >= 8 triggers ultra-dense
code = code.replace("if (flowResult.count >= 8 || flowResult.totalChars >= 1250) {", "if (flowResult.count >= 8) {");

fs.writeFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", code, "utf8");
console.log("Updated Book 1 Page 9 filter and ultra-dense threshold");
