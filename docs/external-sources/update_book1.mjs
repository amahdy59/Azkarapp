import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", "utf8");

// Update flowClass logic
const oldFlowClass = `    let flowClass = "flow-normal";
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

const newFlowClass = `    let flowClass = "flow-normal";
    if (flowResult.count >= 8 || flowResult.totalChars >= 1250) {
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

code = code.replace(oldFlowClass, newFlowClass);

// Update CSS
const cssAnchor = "/* Devotional Flow (Structured Luxury Card Geometry) */";
const cssAnchorIdx = code.indexOf(cssAnchor);
const cssEndAnchor = "/* Introduction Page Luxury Elements (Pages 4 & 5) */";
const cssEndIdx = code.indexOf(cssEndAnchor);

const newFlowCss = `/* Devotional Flow (Structured Luxury Card Geometry) */
    .devotional-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding: 1mm 0;
    }

    .dua-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: \${t.canvasBg};
      border: 1px solid \${t.divider};
      border-right: 3.5px solid \${t.gold};
      border-radius: 6px;
      padding: 3.5mm 4.5mm;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      gap: 1.5mm;
    }

    .dua-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      margin-bottom: 0.5mm;
    }

    .dua-card-meta-right {
      display: flex;
      align-items: center;
      gap: 2mm;
    }

    .dua-num-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: \${t.goldLight};
      color: \${t.gold};
      border: 1px solid \${t.frameOuter};
      border-radius: 12px;
      font-weight: 700;
      font-size: 7.2pt;
      padding: 0.3mm 2.2mm;
      line-height: 1.2;
    }

    .narrator-line {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.6pt;
      font-weight: 600;
      color: \${t.textMuted};
    }

    .dua-text {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 500;
      font-size: 10.6pt;
      line-height: 1.88;
      color: \${t.text};
      text-align: justify;
    }

    .takhrij-inline {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      font-weight: 500;
      color: \${t.textMuted};
      background: \${t.goldLight};
      padding: 0.4mm 2mm;
      border-radius: 4px;
      border: 0.5px solid \${t.divider};
      white-space: nowrap;
    }

    /* 0. SPARSE (Single Card) - Full Proportional Center */
    .devotional-flow.flow-sparse {
      gap: 0;
    }
    .devotional-flow.flow-sparse .dua-card {
      padding: 8mm 9mm;
      border-right-width: 4px;
    }
    .devotional-flow.flow-sparse .dua-text {
      font-size: 13pt;
      line-height: 2.3;
      text-align: center;
    }

    /* 1. ROOMY (2-3 cards) - Balanced Equal Flex */
    .devotional-flow.flow-roomy {
      gap: 4.5mm;
    }
    .devotional-flow.flow-roomy .dua-card {
      padding: 5mm 6.5mm;
      gap: 2mm;
    }
    .devotional-flow.flow-roomy .dua-text {
      font-size: 11.6pt;
      line-height: 2.05;
    }
    .devotional-flow.flow-roomy .dua-num-pill {
      font-size: 7.8pt;
      padding: 0.35mm 2.6mm;
    }
    .devotional-flow.flow-roomy .narrator-line {
      font-size: 8pt;
    }
    .devotional-flow.flow-roomy .takhrij-inline {
      font-size: 7.2pt;
      padding: 0.45mm 2.4mm;
    }

    /* 2. NORMAL (4-5 cards) - Proportional Flex */
    .devotional-flow.flow-normal {
      gap: 3mm;
    }
    .devotional-flow.flow-normal .dua-card {
      padding: 3.2mm 4.5mm;
      gap: 1.2mm;
    }
    .devotional-flow.flow-normal .dua-text {
      font-size: 10.6pt;
      line-height: 1.88;
    }
    .devotional-flow.flow-normal .dua-num-pill {
      font-size: 7.2pt;
      padding: 0.3mm 2.2mm;
    }
    .devotional-flow.flow-normal .narrator-line {
      font-size: 7.6pt;
    }
    .devotional-flow.flow-normal .takhrij-inline {
      font-size: 6.8pt;
      padding: 0.4mm 2mm;
    }

    /* 3. DENSE (6-7 cards) - Compact top-aligned */
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
    }
    .devotional-flow.flow-dense .dua-num-pill {
      font-size: 6.6pt;
      padding: 0.2mm 1.8mm;
    }
    .devotional-flow.flow-dense .narrator-line {
      font-size: 7pt;
    }
    .devotional-flow.flow-dense .takhrij-inline {
      font-size: 6.2pt;
      padding: 0.25mm 1.6mm;
    }

    /* 4. ULTRA-DENSE (8+ cards, e.g. Page 12) - Micro-gap, guaranteed fit */
    .devotional-flow.flow-ultra-dense {
      justify-content: flex-start;
      gap: 1.1mm;
    }
    .devotional-flow.flow-ultra-dense .dua-card {
      flex: 0 0 auto;
      padding: 1.4mm 2.4mm;
      gap: 0.5mm;
      border-right-width: 2.5px;
    }
    .devotional-flow.flow-ultra-dense .dua-card-header {
      margin-bottom: 0.1mm;
    }
    .devotional-flow.flow-ultra-dense .dua-text {
      font-size: 8.5pt;
      line-height: 1.46;
    }
    .devotional-flow.flow-ultra-dense .dua-num-pill {
      font-size: 6.2pt;
      padding: 0.15mm 1.5mm;
    }
    .devotional-flow.flow-ultra-dense .narrator-line {
      font-size: 6.6pt;
    }
    .devotional-flow.flow-ultra-dense .takhrij-inline {
      font-size: 6pt;
      padding: 0.2mm 1.4mm;
    }

    `;

code = code.slice(0, cssAnchorIdx) + newFlowCss + code.slice(cssEndIdx);

fs.writeFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", code, "utf8");
console.log("Successfully refined Book 1 flow logic and CSS");
