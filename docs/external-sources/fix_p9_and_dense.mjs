import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", "utf8");

// 1. In formatLuxuryFlow, filter out redundant titles
const oldFilter = `    if (
      !l ||
      l === "." ||
      l === ".»" ||
      l === "»" ||
      l === "«" ||
      l === chapter ||
      l === \`سؤال \${chapter}\` ||
      l.startsWith("الترغيب في ") ||
      l.startsWith("من آداب ") ||
      l.startsWith("الفهرس")
    )`;

const newFilter = `    if (
      !l ||
      l === "." ||
      l === ".»" ||
      l === "»" ||
      l === "«" ||
      l === chapter ||
      l === \`سؤال \${chapter}\` ||
      l.startsWith("الأدعية والأذكار") ||
      l.includes("والثناءُ عليه") ||
      l.startsWith("الترغيب في ") ||
      l.startsWith("من آداب ") ||
      l.startsWith("الفهرس")
    )`;

code = code.replace(oldFilter, newFilter);

// 2. In flow-dense CSS, give .dua-card flex: 1
const oldDenseCss = `    /* 3. DENSE (6-7 cards) - Compact top-aligned */
    .devotional-flow.flow-dense {
      gap: 1.8mm;
    }
    .devotional-flow.flow-dense .dua-card {
      padding: 2.2mm 3.2mm;
      gap: 0.8mm;
    }
    .devotional-flow.flow-dense .dua-text {
      font-size: 9.6pt;
      line-height: 1.62;
    }`;

const newDenseCss = `    /* 3. DENSE (6-7 cards) - Proportional Flex */
    .devotional-flow.flow-dense {
      gap: 2mm;
    }
    .devotional-flow.flow-dense .dua-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 2.2mm 3.2mm;
      gap: 0.8mm;
    }
    .devotional-flow.flow-dense .dua-text {
      font-size: 9.6pt;
      line-height: 1.62;
    }`;

code = code.replace(oldDenseCss, newDenseCss);

fs.writeFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", code, "utf8");
console.log("Successfully refined Book 1 filters and flow-dense flex");
