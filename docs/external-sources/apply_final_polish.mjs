import fs from "node:fs";

// 1. Polish Book 2 Page 3
let b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");

b2 = b2.replace(
  '<div class="section-box gold-accent" style="padding:2.8mm 3.8mm;">',
  '<div class="section-box gold-accent" style="flex:initial; padding:3.5mm 4.5mm; margin-bottom:2mm;">',
);
b2 = b2.replace('<div class="roadmap-box">', '<div class="roadmap-box" style="flex:1; justify-content:space-around;">');

fs.writeFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", b2, "utf8");
console.log("Polished Book 2 Page 3 roadmap balance!");

// 2. Polish Book 3 TOC & Page 11
let b3 = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");

// Increase TOC gap and font size
b3 = b3.replace(
  "gap: 1.4mm;\n      flex: 1;\n      justify-content: center;\n      padding: 1.5mm 3mm;",
  "gap: 2.8mm;\n      flex: 1;\n      justify-content: space-evenly;\n      padding: 4mm 5mm;",
);
b3 = b3.replace(
  ".toc-item {\n      display: flex;\n      align-items: baseline;\n      text-decoration: none;\n      color: inherit;\n      font-family: 'IBM Plex Arabic', sans-serif;\n      font-size: 7.2pt;",
  ".toc-item {\n      display: flex;\n      align-items: baseline;\n      text-decoration: none;\n      color: inherit;\n      font-family: 'IBM Plex Arabic', sans-serif;\n      font-size: 8.4pt;",
);

// Ensure Page 11 gets roomy density
b3 = b3.replace(
  'const totalChars = fullText.length + (p.vocab || []).join(" ").length;',
  'const totalChars = fullText.length + (p.vocab || []).join(" ").length;\n    if (p.page === 11) { densityClass = "density-roomy"; }',
);

fs.writeFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", b3, "utf8");
console.log("Polished Book 3 TOC and Page 11 typography!");
