import fs from "node:fs";

// ================= UPDATE BOOK 2 =================
let b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");

// Update .content-flow and .section-box
const oldB2Flow = `.content-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2.8mm;
      overflow: hidden;
      padding: 1mm 0;
    }

    .section-box {
      background: \${t.canvasBg};
      border: 0.75px solid \${t.divider};
      border-radius: 6px;
      padding: 3.2mm 4.2mm;
    }`;

const newB2Flow = `.content-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 3.5mm;
      overflow: hidden;
      padding: 1mm 0;
    }

    .section-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: \${t.canvasBg};
      border: 0.75px solid \${t.divider};
      border-radius: 6px;
      padding: 4.2mm 5.2mm;
    }`;

b2 = b2.replace(oldB2Flow, newB2Flow);

// Update .mistakes-container and .mistake-card
const oldB2Mistakes = `.mistakes-container {
      display: flex;
      flex-direction: column;
      gap: 1.8mm;
      justify-content: flex-start;
    }
    .mistake-card {
      background: \${t.canvasBg};
      border: 0.75px solid \${t.divider};
      border-right: 3.5px solid #E11D48;
      border-radius: 6px;
      padding: 2.4mm 3.4mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.5pt;
      line-height: 1.6;
    }`;

const newB2Mistakes = `.mistakes-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.8mm;
      justify-content: space-between;
    }
    .mistake-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: \${t.canvasBg};
      border: 0.75px solid \${t.divider};
      border-right: 3.5px solid #E11D48;
      border-radius: 6px;
      padding: 2.2mm 3.4mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.5pt;
      line-height: 1.55;
    }`;

b2 = b2.replace(oldB2Mistakes, newB2Mistakes);
fs.writeFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", b2, "utf8");
console.log("Successfully updated Book 2 geometry");

// ================= UPDATE BOOK 3 =================
let b3 = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");

const oldB3Flow = `    /* Devotional Body & Hadith Flow (Proportional Full-Page Geometry) */
    .devotional-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 3.5mm;
      overflow: hidden;
      padding: 1.5mm 0;
    }

    .hadith-flow {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hadith-card {
      background: \${t.canvasBg};
      border: 1px solid \${t.divider};
      border-right: 3.5px solid \${t.gold};
      border-radius: 8px;
      padding: 5mm 6mm;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 50mm;
    }

    .hadith-text {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 500;
      font-size: 11.2pt;
      line-height: 1.95;
      color: \${t.text};
      text-align: justify;
    }

    /* Density Modifiers */
    .page.density-sparse-center .hadith-card {
      padding: 7mm 8mm;
      min-height: 70mm;
    }
    .page.density-sparse-center .hadith-text {
      font-size: 12.8pt;
      line-height: 2.15;
      text-align: center;
    }
    .page.density-roomy .hadith-card {
      padding: 6mm 7mm;
      min-height: 60mm;
    }
    .page.density-roomy .hadith-text {
      font-size: 11.8pt;
      line-height: 2.05;
      text-align: justify;
    }
    .page.density-normal .hadith-card {
      padding: 4.2mm 5.2mm;
    }`;

const newB3Flow = `    /* Devotional Body & Hadith Flow (Proportional Full-Page Geometry) */
    .devotional-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 3.5mm;
      overflow: hidden;
      padding: 1.5mm 0;
    }

    .hadith-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hadith-card {
      flex: 1;
      background: \${t.canvasBg};
      border: 1px solid \${t.divider};
      border-right: 3.5px solid \${t.gold};
      border-radius: 8px;
      padding: 6mm 7.5mm;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hadith-text {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 500;
      font-size: 11.2pt;
      line-height: 1.95;
      color: \${t.text};
      text-align: justify;
    }

    /* Density Modifiers */
    .page.density-sparse-center .hadith-card {
      padding: 8mm 9mm;
    }
    .page.density-sparse-center .hadith-text {
      font-size: 13pt;
      line-height: 2.25;
      text-align: center;
    }
    .page.density-roomy .hadith-card {
      padding: 7mm 8mm;
    }
    .page.density-roomy .hadith-text {
      font-size: 12pt;
      line-height: 2.1;
      text-align: justify;
    }
    .page.density-normal .hadith-card {
      padding: 5mm 6mm;
    }
    .page.density-normal .hadith-text {
      font-size: 11pt;
      line-height: 1.95;
      text-align: justify;
    }
    .page.density-dense .hadith-card {
      padding: 3.2mm 4.2mm;
    }
    .page.density-dense .hadith-text {
      font-size: 9.6pt;
      line-height: 1.62;
      text-align: justify;
    }`;

b3 = b3.replace(oldB3Flow, newB3Flow);
fs.writeFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", b3, "utf8");
console.log("Successfully updated Book 3 geometry");
