import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");

// 1. Add formatHadithContent function right before buildHtml
const formatFunc = `function formatHadithContent(text, t) {
  let res = text;
  // Style Quranic verses ﴿...﴾ with Amiri Quran and gold color
  res = res.replace(/﴿([^﴾]+)﴾/g, (m, ayah) => {
    return \`<span class="quran-quote" style="font-family:'Amiri Quran', serif; color:\${t.gold}; font-weight:700;">﴿\${ayah}﴾</span>\`;
  });
  // Style bracketed references [ ... ]
  res = res.replace(/(\\[[^\\]]+\\])/g, (m, ref) => {
    return \`<span class="ayah-ref-inline" style="font-family:'IBM Plex Arabic'; font-size:7.4pt; color:\${t.textMuted}; background:\${t.goldLight}; padding:0.2mm 2mm; border-radius:4px; border:0.5px solid \${t.divider}; margin:0 1mm;">\${ref}</span>\`;
  });
  return res;
}

`;

if (!code.includes("function formatHadithContent")) {
  code = code.replace("function buildHtml(theme) {", formatFunc + "function buildHtml(theme) {");
}

// 2. Wrap fullText in formatHadithContent inside hadith-card
const oldHadithCard = `<div class="hadith-card">
            <div class="hadith-text">\${fullText}</div>
          </div>`;

const newHadithCard = `<div class="hadith-card">
            <div class="hadith-text">\${formatHadithContent(fullText, t)}</div>
          </div>`;

code = code.replace(oldHadithCard, newHadithCard);

fs.writeFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", code, "utf8");
console.log("Successfully integrated formatHadithContent into Book 3 generator");
