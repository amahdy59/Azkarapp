import { chromium } from "playwright";
import { exportBookEdition } from "./book-presentation.mjs";
import { correctedSourceChapter, correctedSourcePage } from "./book-content.mjs";
import { wirdContents, wirdChapterStarts, wirdInlineHeading } from "./wird-source-navigation.mjs";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "book3_al_wird_an_nabawi");
fs.mkdirSync(outputDir, { recursive: true });

const pagesData = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, "book3_al_wird_an_nabawi_pages.json"), "utf-8"),
);
const fonts = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "fonts_base64.json"), "utf-8"));

const ICONS = {
  bookOpen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  sparkles: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  bulb: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
};

const THEMES = {
  light: {
    name: "light",
    bg: "#FBF9F5",
    canvasBg: "#FFFFFF",
    frameOuter: "#C5A869",
    frameInner: "#E8DCC4",
    text: "#1C1917",
    textMuted: "#6B655B",
    gold: "#9E7422",
    goldLight: "#F7F3EA",
    amber: "#A15C07",
    emerald: "#136F48",
    divider: "#E4DAC6",
    coverBg: "linear-gradient(145deg, #181512 0%, #2A241E 100%)",
    coverText: "#F5F0E8",
  },
  dark: {
    name: "dark",
    bg: "#0F0E0D",
    canvasBg: "#171513",
    frameOuter: "#B8860B",
    frameInner: "#383127",
    text: "#F5F0E8",
    textMuted: "#9E9484",
    gold: "#D4AF37",
    goldLight: "#262016",
    amber: "#F59E0B",
    emerald: "#10B981",
    divider: "#332C22",
    coverBg: "linear-gradient(145deg, #0A0908 0%, #1A1714 100%)",
    coverText: "#F5F0E8",
  },
  navy: {
    name: "navy",
    bg: "#0A1124",
    canvasBg: "#101B36",
    frameOuter: "#C99D32",
    frameInner: "#243763",
    text: "#F5F0E8",
    textMuted: "#8F9EB8",
    gold: "#E5B942",
    goldLight: "#18274C",
    amber: "#FBBF24",
    emerald: "#34D399",
    divider: "#1F3158",
    coverBg: "linear-gradient(145deg, #050B1A 0%, #0F1C38 100%)",
    coverText: "#F5F0E8",
  },
};

function toArabicNumeral(n) {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

function cleanWirdLine(l) {
  let s = l;
  s = s.replace(/[\t\s]*♣/g, " ❖ ");
  s = s.replace(/[◙╚]/g, " ");
  s = s.replace(/\s*«\s*/g, " «");
  s = s.replace(/\s*»\s*/g, "» ");
  s = s.replace(/[ \t]{2,}/g, " ").trim();
  return s;
}

function formatHadithContent(text, t) {
  let res = text;
  // Style Quranic verses ﴿...﴾ with Amiri Quran and gold color
  res = res.replace(/﴿([^﴾]+)﴾/g, (m, ayah) => {
    return `<span class="quran-quote" style="font-family:'Amiri Quran', serif; color:${t.gold}; font-weight:700;">﴿${ayah}﴾</span>`;
  });
  // Style bracketed references [ ... ]
  res = res.replace(/(\[[^\]]+\])/g, (m, ref) => {
    return `<span class="ayah-ref-inline" style="font-family:'IBM Plex Arabic'; font-size:7.4pt; color:${t.textMuted}; background:${t.goldLight}; padding:0.2mm 2mm; border-radius:4px; border:0.5px solid ${t.divider}; margin:0 1mm;">${ref}</span>`;
  });
  return res;
}

function buildHtml(theme) {
  const t = THEMES[theme];
  let pagesHtml = "";

  for (const original of pagesData) {
    const p = { ...original, chapter: correctedSourceChapter("al-wird-an-nabawi", original) };
    if (p.page === 1) {
      pagesHtml += `<div class="page" id="p-1" style="background:${t.coverBg}; color:${t.coverText}; text-align:center;">
        <div class="page-frame-outer"></div><div class="source-cover">${correctedSourcePage("al-wird-an-nabawi", original)}</div>
      </div>`;
      continue;
    }

    if ([2, 3, 137].includes(p.page)) {
      pagesHtml += `<div class="page" id="p-${p.page}" style="background:${t.bg}; color:${t.text};">
        <div class="page-header"><div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div></div>
        <div class="devotional-body"><h2 class="chapter-title">${p.chapter}</h2>${correctedSourcePage("al-wird-an-nabawi", original)}</div>
        <div class="page-footer"><span>الورد النبوي (الصغير)</span><span class="footer-page-pill">— ص ${toArabicNumeral(p.page)} —</span></div>
      </div>`;
      continue;
    }

    if (p.page === 17) {
      // Original PDF p17 is a blank divider; retain its reading identity.
      pagesHtml += `<div class="page" id="p-17" style="background:${t.bg}; color:${t.text};">
        <div class="page-header"><div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div></div>
        <div class="devotional-body"><h2 class="chapter-title">صفحة فاصلة</h2><aside class="source-note">هذه الصفحة فاصلة بيضاء في الأصل.</aside></div>
        <div class="page-footer"><span>الورد النبوي (الصغير)</span><span class="footer-page-pill">— ص ١٧ —</span></div>
      </div>`;
      continue;
    }

    // Dedicated Table of Contents rendering (Pages 134, 135, 136)
    if (p.page >= 134 && p.page <= 136) {
      const partNumber = p.page === 134 ? "الأَوَّلُ" : p.page === 135 ? "الثَّانِي" : "الثَّالِثُ";
      const tocItems = wirdContents.filter((item) => item.contentsPdfPage === p.page);

      pagesHtml += `
      <div class="page" id="p-${p.page}" style="background:${t.bg}; color:${t.text};">
        <div class="page-frame-outer"></div>
        <div class="page-frame-inner"></div>

        <div class="page-header">
          <div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div>
          <div class="header-chapter">فِهْرِسُ المَوْضُوعَاتِ</div>
        </div>

        <div class="devotional-body" style="justify-content:flex-start; gap:2mm;">
          <div class="chapter-banner" style="margin-bottom:1.5mm;">
            <div class="chapter-badge"><span>✦</span><span>فِهْرِسُ الكِتَابِ</span></div>
            <h2 class="chapter-title" style="font-size:11pt;">فِهْرِسُ المَوْضُوعَاتِ — الجُزْءُ ${partNumber}</h2>
          </div>

          <div class="toc-container">
            ${tocItems
              .map(
                (item) => `
            <a href="#p-${item.pdfPage}" class="toc-item">
              <span class="toc-item-title">${item.title}</span>
              <span class="toc-item-dots"></span>
              <span class="toc-item-page">${toArabicNumeral(item.pdfPage)}</span>
            </a>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="page-footer">
          <span>الورد النبوي (الصغير)</span>
          <span class="footer-page-pill">— ص ${toArabicNumeral(p.page)} —</span>
          <span>فهرس الموضوعات</span>
        </div>
      </div>
      `;
      continue;
    }

    // Normal Devotional Content Pages
    const inlineHeading = wirdInlineHeading(p.page);
    const isChapterStart = wirdChapterStarts.has(p.page) && !inlineHeading;

    // Clean and group lines
    const cleanedLines = (p.lines || []).map(cleanWirdLine).filter((l) => l && l !== p.chapter);
    const correctedHtml = correctedSourcePage("al-wird-an-nabawi", original);
    let fullText = cleanedLines.join(" ").trim();
    fullText = fullText
      .replace(/^\s*[.،]?\s*[»«]\s*/, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    let readingHtml = correctedHtml || formatHadithContent(fullText, t);
    if (inlineHeading?.headingPlacement.beforeLine !== undefined && !correctedHtml) {
      const boundary = inlineHeading.headingPlacement.beforeLine;
      const part = (lines) => formatHadithContent(lines.map(cleanWirdLine).filter(Boolean).join(" "), t);
      readingHtml = `<p class="body-text">${part(original.lines.slice(0, boundary))}</p><h3 class="section-title">${inlineHeading.title}</h3><p class="body-text">${part(original.lines.slice(boundary))}</p>`;
    }
    const totalChars = fullText.length + (p.vocab || []).join(" ").length;
    let densityClass = p.page === 11 ? "density-roomy" : "density-normal";
    if (p.page !== 11) {
      if (totalChars > 850) {
        densityClass = "density-dense";
      } else if (totalChars < 680 && (!p.vocab || p.vocab.length <= 3)) {
        densityClass = fullText.length < 180 ? "density-sparse-center" : "density-roomy";
      }
    }

    pagesHtml += `
    <div class="page ${densityClass}" id="p-${p.page}" style="background:${t.bg}; color:${t.text};">
      <div class="page-frame-outer"></div>
      <div class="page-frame-inner"></div>

      <div class="page-header">
        <div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div>
        <a href="#p-134" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">${p.chapter} ↰</a>
      </div>

      <div class="devotional-body">
        ${
          isChapterStart
            ? `
        <div class="chapter-banner">
          <div class="chapter-badge"><span>✦</span><span>أَدْعِيَةُ السُّنَّةِ الصَّحِيحَةِ</span></div>
          <h2 class="chapter-title">${p.chapter}</h2>
        </div>
        `
            : ""
        }

<div class="hadith-flow"><div class="hadith-card"><div class="hadith-text">${readingHtml}</div></div></div>

        ${
          !correctedHtml && p.vocab && p.vocab.length > 0
            ? `
        <div class="vocab-panel">
          <div class="vocab-title">${ICONS.bulb}<span>بَيَانُ غَرِيبِ الحَدِيثِ وَالمَعَانِي:</span></div>
          ${p.vocab.map((v) => `<div class="vocab-item">${v.replace(/^-\s*/, "• ")}</div>`).join("")}
        </div>
        `
            : ""
        }
      </div>

      <div class="page-footer">
        <span>الورد النبوي (الصغير)</span>
        <span class="footer-page-pill">— ص ${toArabicNumeral(p.page)} —</span>
        <span>${p.chapter}</span>
      </div>
    </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>الورد النبوي (الصغير) — د. علي العويشز</title>
  <style>
    @font-face {
      font-family: 'Amiri Quran';
      src: url('data:font/woff2;base64,${fonts.amiri}') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex400}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex500}') format('woff2');
      font-weight: 500;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex600}') format('woff2');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex700}') format('woff2');
      font-weight: 700;
      font-style: normal;
    }

    @page { size: 148mm 210mm; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    body {
      margin: 0;
      padding: 0;
      font-family: 'IBM Plex Arabic', sans-serif;
      background: ${t.bg};
      color: ${t.text};
      direction: rtl;
    }

    .page {
      width: 148mm;
      height: 210mm;
      max-height: 210mm;
      overflow: hidden;
      page-break-after: always;
      position: relative;
      padding: 8.5mm 11mm 8.5mm 11mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${t.bg};
    }

    /* Double Ornamental Frame */
    .page-frame-outer {
      position: absolute;
      top: 3.5mm;
      bottom: 3.5mm;
      right: 3.5mm;
      left: 3.5mm;
      border: 1px solid ${t.frameOuter};
      border-radius: 4px;
      pointer-events: none;
    }
    .page-frame-inner {
      position: absolute;
      top: 5mm;
      bottom: 5mm;
      right: 5mm;
      left: 5mm;
      border: 0.5px solid ${t.frameInner};
      border-radius: 3px;
      pointer-events: none;
    }

    /* Sacred Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5mm;
      margin-bottom: 2mm;
      border-bottom: 0.75px solid ${t.divider};
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      position: relative;
      z-index: 5;
    }
    .header-book-title {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      font-weight: 700;
      color: ${t.gold};
    }
    .header-chapter {
      font-weight: 600;
      color: ${t.textMuted};
    }

    /* Sacred Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5mm;
      margin-top: auto;
      border-top: 0.75px solid ${t.divider};
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.6pt;
      color: ${t.textMuted};
      position: relative;
      z-index: 5;
      background: ${t.bg};
    }
    .footer-page-pill {
      font-weight: 700;
      font-size: 7.2pt;
      padding: 0.4mm 3mm;
      border-radius: 12px;
      border: 0.75px solid ${t.frameOuter};
      background: ${t.canvasBg};
      color: ${t.gold};
    }

    /* Chapter Title Banner */
    .chapter-banner {
      text-align: center;
      margin-bottom: 2.2mm;
      padding-bottom: 1mm;
      position: relative;
    }
    .chapter-badge {
      display: inline-flex;
      align-items: center;
      gap: 1.5mm;
      background: ${t.goldLight};
      border: 1px solid ${t.frameOuter};
      color: ${t.gold};
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      font-weight: 700;
      padding: 0.5mm 2.5mm;
      border-radius: 20px;
      margin-bottom: 1mm;
    }
    .chapter-title {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 12.5pt;
      font-weight: 700;
      color: ${t.text};
      margin: 0;
      line-height: 1.25;
    }

    /* Devotional Body & Hadith Flow (Proportional Full-Page Geometry) */
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

    /* TOC Interactive Styles */
    .toc-container {
      display: flex;
      flex-direction: column;
      gap: 2.8mm;
      flex: 1;
      justify-content: space-evenly;
      padding: 4mm 5mm;
      background: ${t.canvasBg};
      border: 1px solid ${t.divider};
      border-radius: 8px;
    }
    .toc-item {
      display: flex;
      align-items: baseline;
      text-decoration: none;
      color: inherit;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.4pt;
      transition: color 0.15s ease;
    }
    .toc-item:hover {
      color: ${t.gold};
    }
    .toc-item-title {
      font-weight: 600;
      white-space: nowrap;
    }
    .toc-item-dots {
      flex: 1;
      border-bottom: 1px dotted ${t.divider};
      margin: 0 2mm;
      min-width: 5mm;
      height: 1px;
    }
    .toc-item-page {
      font-weight: 700;
      color: ${t.gold};
      min-width: 6mm;
      text-align: left;
    }

    /* Repetition & Virtue Badges */
    .repeat-pill {
      display: inline-flex;
      align-items: center;
      gap: 1mm;
      background: ${t.goldLight};
      color: ${t.amber};
      border: 0.75px solid ${t.amber};
      border-radius: 10px;
      font-weight: 700;
      font-size: 6.8pt;
      padding: 0.2mm 2.2mm;
      line-height: 1.2;
    }
    .virtue-callout {
      display: flex;
      align-items: baseline;
      gap: 1.5mm;
      background: rgba(19, 111, 72, 0.05);
      border: 0.5px solid ${t.emerald};
      border-radius: 4px;
      padding: 1mm 2.2mm;
      margin-top: 1.8mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
      color: ${t.text};
    }
    .virtue-tag {
      font-weight: 700;
      color: ${t.emerald};
      white-space: nowrap;
    }
    .hadith-card {
      flex: 1;
      background: ${t.canvasBg};
      border: 1px solid ${t.divider};
      border-right: 3.5px solid ${t.gold};
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
      color: ${t.text};
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
    }
    .page.density-normal .hadith-text {
      font-size: 11pt;
      line-height: 1.9;
      text-align: justify;
    }
    .page.density-dense .hadith-card {
      padding: 2.8mm 3.8mm;
    }
    .page.density-dense .hadith-text {
      font-size: 9.8pt;
      line-height: 1.72;
      text-align: justify;
    }

    /* Scholarly Footnote Panel (Gharib Al-Hadith) */
    .vocab-panel {
      background: ${t.goldLight};
      border: 0.75px solid ${t.divider};
      border-right: 3.5px solid ${t.gold};
      border-radius: 6px;
      padding: 3.5mm 5mm;
    }
    .vocab-title {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: ${t.amber};
      margin-bottom: 1.5mm;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .vocab-item {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.8pt;
      color: ${t.textMuted};
      line-height: 1.65;
      margin-bottom: 1mm;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const themes = ["light", "dark", "navy"];

  try {
    for (const th of themes) {
      console.log(`Generating Luxury Book 3 (${th})...`);
      const page = await browser.newPage();
      const htmlContent = buildHtml(th);

      const htmlPath = path.join(outputDir, `al_wird_an_nabawi_${th}.html`);
      const pdfPath = htmlPath.replace(/\.html$/, ".pdf");
      await exportBookEdition(page, { html: htmlContent, htmlPath, pdfPath, book: 3, theme: th });

      const stat = fs.statSync(pdfPath);
      console.log(`Generated: ${pdfPath} (${(stat.size / 1024).toFixed(1)} KB)`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log("Book 3 regenerated with Luxury Typography & Design!");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
