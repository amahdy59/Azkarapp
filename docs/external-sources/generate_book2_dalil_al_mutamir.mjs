import { chromium } from "playwright";
import { exportBookEdition } from "./book-presentation.mjs";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "book2_dalil_al_mutamir");
fs.mkdirSync(outputDir, { recursive: true });

const fonts = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "fonts_base64.json"), "utf-8"));

const asset = (name) =>
  `data:image/jpeg;base64,${fs.readFileSync(path.join(import.meta.dirname, "assets", name)).toString("base64")}`;
const kaabaImgBase64 = asset("holy-site-1.jpg");
const safaMarwaImgBase64 = asset("holy-site-2.jpg");
const prophetsMosqueImgBase64 = asset("holy-site-3.jpg");

const ICONS = {
  bookOpen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  sparkles: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
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

function buildHtml(theme) {
  const t = THEMES[theme];

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>دليل المعتمر — الطبعة الرقمية الفاخرة</title>
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
      font-family: 'Amiri Quran', serif;
      font-size: 11.5pt;
      font-weight: 700;
      color: ${t.text};
      margin: 0;
      line-height: 1.3;
    }

    /* Editorial Content Flow */
    .content-flow {
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
      background: ${t.canvasBg};
      border: 0.75px solid ${t.divider};
      border-radius: 6px;
      padding: 4.2mm 5.2mm;
    }
    .section-box.gold-accent {
      border-right: 3px solid ${t.gold};
    }
    .section-box.emerald-accent {
      border-right: 3px solid ${t.emerald};
    }
    .section-box.amber-accent {
      border-right: 3px solid ${t.amber};
    }

    .section-title {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.6pt;
      font-weight: 700;
      margin-bottom: 1.6mm;
      display: flex;
      align-items: center;
      gap: 2mm;
    }

    .dua-matn {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 500;
      font-size: 10.2pt;
      line-height: 1.85;
      color: ${t.text};
      text-align: justify;
      margin: 1.2mm 0;
    }
    .dua-matn-center {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 600;
      font-size: 10.8pt;
      line-height: 1.85;
      color: ${t.gold};
      text-align: center;
      margin: 1.5mm 0;
    }

    .body-text {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.5pt;
      line-height: 1.75;
      color: ${t.text};
      text-align: justify;
    }

    .step-item {
      display: flex;
      align-items: baseline;
      gap: 2.5mm;
      margin-bottom: 1.8mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.5pt;
      line-height: 1.75;
    }
    .step-num {
      font-weight: 700;
      color: ${t.gold};
      background: ${t.goldLight};
      border: 0.6px solid ${t.frameOuter};
      border-radius: 50%;
      width: 5.2mm;
      height: 5.2mm;
      line-height: 5.2mm;
      text-align: center;
      flex-shrink: 0;
      font-size: 7.2pt;
    }
    .step-text {
      flex: 1;
    }

    .takhrij {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7pt;
      color: ${t.textMuted};
      margin-top: 1mm;
      white-space: nowrap;
    }

    /* Photo Hero Box */
    .photo-hero-box {
      width: 100%;
      height: 48mm;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 2mm;
      position: relative;
      border: 1px solid ${t.frameOuter};
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }

    /* Common Mistakes Layout (Page 10) */
    .mistakes-container {
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
      background: ${t.canvasBg};
      border: 0.75px solid ${t.divider};
      border-right: 3.5px solid #E11D48;
      border-radius: 6px;
      padding: 2.2mm 3.4mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.5pt;
      line-height: 1.55;
    }
    .mistake-row {
      display: flex;
      align-items: baseline;
      gap: 1.8mm;
      color: #BE123C;
      font-weight: 600;
      margin-bottom: 1mm;
    }
    .mistake-tag {
      font-weight: 700;
      color: #E11D48;
      font-size: 7.8pt;
      white-space: nowrap;
    }
    .correct-row {
      display: flex;
      align-items: baseline;
      gap: 1.8mm;
      color: ${t.text};
    }
    .correct-tag {
      font-weight: 700;
      color: #059669;
      font-size: 7.8pt;
      white-space: nowrap;
    }
    .photo-hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .photo-hero-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 75%, transparent 100%);
      color: #FFFFFF;
      padding: 1.8mm 3.5mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Table of Contents */
    .toc-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
      padding: 1mm 2mm;
    }
    .toc-item {
      display: flex;
      align-items: baseline;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
      text-decoration: none;
      color: inherit;
      transition: color 0.15s ease;
    }
    .toc-item:hover {
      color: ${t.gold};
    }

    /* Visual Roadmap Infographic */
    .roadmap-box {
      background: ${t.goldLight};
      border: 1px solid ${t.frameOuter};
      border-radius: 8px;
      padding: 3mm 4mm;
      display: flex;
      flex-direction: column;
      gap: 2mm;
    }
    .roadmap-header {
      display: flex;
      align-items: center;
      gap: 2mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.2pt;
      font-weight: 700;
      color: ${t.gold};
      border-bottom: 0.5px solid ${t.divider};
      padding-bottom: 1.2mm;
    }
    .roadmap-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.8mm 3mm;
    }
    .roadmap-card {
      display: flex;
      align-items: flex-start;
      gap: 2mm;
      background: ${t.canvasBg};
      border: 0.5px solid ${t.divider};
      border-radius: 6px;
      padding: 2mm 2.5mm;
      text-decoration: none;
      color: inherit;
      transition: transform 0.1s ease, border-color 0.1s ease;
    }
    .roadmap-card:hover {
      border-color: ${t.gold};
    }
    .step-num-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4.8mm;
      height: 4.8mm;
      border-radius: 50%;
      background: ${t.gold};
      color: #FFFFFF;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
      font-weight: 700;
      flex-shrink: 0;
    }
    .step-body {
      display: flex;
      flex-direction: column;
      gap: 0.4mm;
    }
    .step-title {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.8pt;
      font-weight: 700;
      color: ${t.text};
    }
    .step-desc {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.6pt;
      line-height: 1.35;
      color: ${t.textMuted};
    }

      display: flex;
      align-items: baseline;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
    }
    .toc-item-title {
      font-weight: 600;
      white-space: nowrap;
    }
    .toc-item-leader {
      flex: 1;
      border-bottom: 1px dotted ${t.divider};
      margin: 0 2mm;
      height: 1px;
    }
    .toc-item-page {
      font-weight: 700;
      color: ${t.gold};
      background: ${t.goldLight};
      padding: 0.2mm 2.2mm;
      border-radius: 8px;
      font-size: 6.8pt;
    }

    .mistake-card {
      background: ${t.canvasBg};
      border: 0.75px solid ${t.divider};
      border-radius: 6px;
      padding: 2.2mm 3.5mm;
      margin-bottom: 2mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.4pt;
      line-height: 1.65;
    }
    .mistake-tag {
      color: #DC2626;
      font-weight: 700;
      margin-left: 1mm;
    }
    .correct-tag {
      color: #16A34A;
      font-weight: 700;
      margin-left: 1mm;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: COVER ================= -->
  <div class="page" id="p-1" style="background:${t.coverBg}; color:${t.coverText}; text-align:center;">
    <div class="page-frame-outer" style="border-color:${t.gold}; opacity:0.75;"></div>
    <div class="page-frame-inner" style="border-color:${t.gold}; opacity:0.4;"></div>

    <div style="margin-top:14mm;">
      <div style="font-family:'IBM Plex Arabic'; font-size:8.5pt; color:${t.gold}; font-weight:700; letter-spacing:1px; margin-bottom:5mm;">
        بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
      </div>
      <div style="display:inline-block; border-bottom:2px solid ${t.gold}; padding-bottom:3.5mm; margin-bottom:6mm;">
        <h1 style="font-family:'Amiri Quran'; font-size:28pt; font-weight:700; color:#FFFFFF; margin:0; line-height:1.25;">
          دَلِيلُ المُعْتَمِرِ
        </h1>
        <div style="font-family:'IBM Plex Arabic'; font-size:11.5pt; color:${t.gold}; font-weight:700; margin-top:2mm;">
          صِفَةُ العُمْرَةِ • أَخْطَاءٌ شَائِعَةٌ • زِيَارَةُ المَدِينَةِ • الأَدْعِيَةُ وَالأَذْكَارُ
        </div>
      </div>
      <div style="font-family:'IBM Plex Arabic'; font-size:7.8pt; color:#CCCCCC; margin-bottom:10mm;">
        كِتَابٌ جَامِعٌ لِأَحْكَامِ المَنَاسِكِ عَلَى ضَوْءِ الكِتَابِ وَالسُّنَّةِ الصَّحِيحَةِ
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.035); border:1px solid ${t.gold}; border-radius:8px; padding:5.5mm; margin:0 4mm;">
      <div style="font-family:'IBM Plex Arabic'; font-size:7pt; color:${t.gold}; margin-bottom:2mm;">اعْتَنَى بِجَمْعِهِ:</div>
      <div style="font-family:'Amiri Quran'; font-size:14pt; font-weight:700; color:#FFFFFF;">أَبُو مُحَمَّدٍ يُوسُفُ بْنُ زَبْنِ اللهِ العُطَيْرِ</div>
      <div style="font-family:'IBM Plex Arabic'; font-size:6.8pt; color:#AAAAAA; margin-top:2.5mm;">
        بِإِشْرَافِ وَمُرَاجَعَةِ وِكَالَةِ الرِّئَاسَةِ العَامَّةِ لِشُؤُونِ المَسْجِدِ النَّبَوِيِّ الشَّرِيفِ
      </div>
    </div>

    <div style="margin-bottom:12mm;">
      <div style="display:inline-block; background:${t.gold}; color:#000000; font-family:'IBM Plex Arabic'; font-size:6.8pt; font-weight:700; padding:1.2mm 4mm; border-radius:20px; margin-bottom:2.5mm;">
        طَبْعَةٌ رَقْمِيَّةٌ مُعْتَمَدَةٌ مُوَثَّقَةٌ
      </div>
      <div style="font-family:'IBM Plex Arabic'; font-size:6.8pt; color:${t.gold};">
        يُوَزَّعُ مَجَّانًا وَلَا يُبَاعُ • وَقْفٌ للهِ تَعَالَى
      </div>
    </div>
  </div>

  <!-- ================= PAGE 2: TABLE OF CONTENTS ================= -->
  <div class="page" id="p-2">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">فِهْرِسُ المَوْضُوعَاتِ</div>
    </div>

    <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
      <div class="chapter-banner" style="margin-bottom:2mm;">
        <div class="chapter-badge"><span>✦</span><span>دَلِيلُ أَبْوَابِ الكِتَابِ</span></div>
        <h2 class="chapter-title" style="font-size:13pt;">فِهْرِسُ مَوْضُوعَاتِ دَلِيلِ المُعْتَمِرِ</h2>
      </div>

      <div class="toc-grid">
        <a href="#p-4" class="toc-item">
          <span class="toc-item-title">١. فضل العمرة والترغيب فيها والمبادرة إليها</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ٤</span>
        </a>
        <a href="#p-5" class="toc-item">
          <span class="toc-item-title">٢. أحكام السفر والمواقيت المكانية الخمسة وإحرام الجو</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ٥</span>
        </a>
        <a href="#p-6" class="toc-item">
          <span class="toc-item-title">٣. سنن الإحرام والتلبية والاشتراط وعمرة الصبي</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ٦</span>
        </a>
        <a href="#p-7" class="toc-item">
          <span class="toc-item-title">٤. محظورات الإحرام التسعة وما يباح للمحرم</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ٧</span>
        </a>
        <a href="#p-8" class="toc-item">
          <span class="toc-item-title">٥. دخول مكة والمسجد الحرام وأحكام الطواف حول الكعبة</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ٨</span>
        </a>
        <a href="#p-9" class="toc-item">
          <span class="toc-item-title">٦. السعي بين الصفا والمروة والحلق والتقصير والتحلل</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ٩</span>
        </a>
        <a href="#p-10" class="toc-item">
          <span class="toc-item-title">٧. أخطاء شائعة في الإحرام والطواف والسعي والتحلل</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ١٠</span>
        </a>
        <a href="#p-11" class="toc-item">
          <span class="toc-item-title">٨. فضل المدينة المنورة وآداب زيارة المسجد النبوي</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ١١</span>
        </a>
        <a href="#p-12" class="toc-item">
          <span class="toc-item-title">٩. السلام على النبي ﷺ وصاحبيه وزيارة الروضة وقباء</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ١٢</span>
        </a>
        <a href="#p-13" class="toc-item">
          <span class="toc-item-title">١٠. التوسل وأحكامه (المشروع والممنوع)</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ١٣</span>
        </a>
        <a href="#p-14" class="toc-item">
          <span class="toc-item-title">١١. نصائح وتوجيهات للمعتمرين وللمرأة المعتمرة</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ١٤</span>
        </a>
        <a href="#p-15" class="toc-item">
          <span class="toc-item-title">١٢. المختار من أدعية الحرم والمشاعر ومصادر الكتاب الـ ١٦</span>
          <span class="toc-item-leader"></span>
          <span class="toc-item-page">ص ١٥</span>
        </a>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٢ —</span>
      <span>الفهرس</span>
    </div>
  </div>

  <!-- ================= PAGE 3: OFFICIAL APPROVAL & ROADMAP ================= -->
  <div class="page" id="p-3">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">مُقَدِّمَةُ الرِّئَاسَةِ وَخَرِيطَةُ المَنَاسِكِ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner" style="margin-bottom:2mm;">
        <div class="chapter-badge"><span>✦</span><span>إِشَادَةٌ وَتَقْدِيمٌ رَسْمِيٌّ</span></div>
        <h2 class="chapter-title">كَلِمَةُ وِكَالَةِ شُؤُونِ المَسْجِدِ النَّبَوِيِّ وَخَرِيطَةُ المَنَاسِكِ</h2>
      </div>

      <div class="section-box gold-accent" style="flex:initial; padding:3.5mm 4.5mm; margin-bottom:2mm;">
        <div class="section-title" style="color:${t.gold}; font-size:8pt; margin-bottom:1mm;">تَقْدِيمُ الوِكَالَةِ لِلطَّبْعَةِ:</div>
        <div class="dua-matn" style="font-size:8.4pt; line-height:1.65; margin:0;">
          «فَإِنَّ وِكَالَةَ الرِّئَاسَةِ العَامَّةِ لِشُؤُونِ المَسْجِدِ النَّبَوِيِّ الشَّرِيفِ، انْطِلَاقًا مِنْ حِرْصِهَا عَلَى تَبْصِيرِ قَاصِدِي الحَرَمَيْنِ، قَدِ اعْتَنَتْ بِمُرَاجَعَةِ وَنَشْرِ هَذَا الكِتَابِ المُبَارَكِ: «دَلِيلِ المُعْتَمِرِ» لِيَكُونَ عَوْنًا لِلْمُسْلِمِ عَلَى أَدَاءِ نُسُكِهِ عَلَى الوَجْهِ الصَّحِيحِ المَشْرُوعِ وَفْقَ هَدْيِ رَسُولِ اللهِ ﷺ.»
        </div>
      </div>

      <!-- VISUAL INFOGRAPHIC UMRAH ROADMAP -->
      <div class="roadmap-box" style="flex:1; justify-content:space-around;">
        <div class="roadmap-header">
          <span>🗺️</span>
          <span>خَرِيطَةُ مَسَارِ مَنَاسِكِ العُمْرَةِ (المَرَاحِلُ التَّنْفِيذِيَّةُ السِّتّ)</span>
        </div>
        <div class="roadmap-grid">
          <a href="#p-5" class="roadmap-card">
            <div class="step-num-pill">١</div>
            <div class="step-body">
              <div class="step-title">الإِحْرَامُ مِنَ المِيقَاتِ</div>
              <div class="step-desc">اغتسال وتجرد ونية وتلبية: «لَبَّيْكَ عُمْرَةً»</div>
            </div>
          </a>
          <a href="#p-8" class="roadmap-card">
            <div class="step-num-pill">٢</div>
            <div class="step-body">
              <div class="step-title">طَوَافُ العُمْرَةِ</div>
              <div class="step-desc">٧ أشواط بالبيت بدءاً بالحجر الأسود واضطباع للرجل</div>
            </div>
          </a>
          <a href="#p-8" class="roadmap-card">
            <div class="step-num-pill">٣</div>
            <div class="step-body">
              <div class="step-title">رَكْعَتَا الطَّوَافِ</div>
              <div class="step-desc">خلف مقام إبراهيم، يُقرأ فيهما بالكافرون والإخلاص</div>
            </div>
          </a>
          <a href="#p-8" class="roadmap-card">
            <div class="step-num-pill">٤</div>
            <div class="step-body">
              <div class="step-title">الشُّرْبُ مِنْ زَمْزَمَ</div>
              <div class="step-desc">التضلع بالماء المبارك واستحضار النية والدعاء</div>
            </div>
          </a>
          <a href="#p-9" class="roadmap-card">
            <div class="step-num-pill">٥</div>
            <div class="step-body">
              <div class="step-title">السَّعْيُ بَيْنَ الصَّفَا وَالمَرْوَةِ</div>
              <div class="step-desc">٧ أشواط بدءاً بالصفا وختاماً بالمروة والذكر عليها</div>
            </div>
          </a>
          <a href="#p-9" class="roadmap-card">
            <div class="step-num-pill">٦</div>
            <div class="step-body">
              <div class="step-title">الحَلْقُ أَوِ التَّقْصِيرُ</div>
              <div class="step-desc">الحلق للرجل (أفضل) أو التقصير لجميع الرأس، وقص أنملة للمرأة</div>
            </div>
          </a>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٣ —</span>
      <span>مقدمة الرئاسة وخريطة المناسك</span>
    </div>
  </div>

  <!-- ================= PAGE 4: VIRTUES & PREPARATION ================= -->
  <div class="page" id="p-4">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">فَضْلُ العُمْرَةِ وَالمُبَادَرَةُ إِلَيْهَا ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>فَضَائِلُ النُّسُكِ</span></div>
        <h2 class="chapter-title">فَضْلُ العُمْرَةِ وَوُجُوبُهَا وَالتَّوْبَةُ النَّصُوحُ</h2>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">فَضْلُ العُمْرَةِ فِي السُّنَّةِ النَّبَوِيَّةِ الصَّحِيحَةِ:</div>
        <div class="dua-matn">
          «العُمْرَةُ إِلَى العُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا، وَالحَجُّ المَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الجَنَّةُ»
        </div>
        <div class="takhrij">📚 متفق عليه من حديث أبي هريرة رضي الله عنه</div>
      </div>

      <div class="section-box gold-accent">
        <div class="dua-matn">
          «تَابِعُوا بَيْنَ الحَجِّ وَالعُمْرَةِ، فَإِنَّهُمَا يَنْفِيَانِ الفَقْرَ وَالذُّنُوبَ كَمَا يَنْفِي الكِيرُ خَبَثَ الحَدِيدِ وَالذَّهَبِ وَالفِضَّةِ»
        </div>
        <div class="takhrij">📚 رواه الترمذي والنسائي بإسناد صحيح</div>
      </div>

      <div class="section-box amber-accent">
        <div class="section-title" style="color:${t.amber};">مَا يَجِبُ عَلَى قَاصِدِ العُمْرَةِ قَبْلَ سَفَرِهِ:</div>
        <div class="body-text">
          ١. <strong>التَّوْبَةُ النَّصُوحُ:</strong> الإقلاع عن المعاصي، والندم على ما فات، والعزم الصادق على عدم العودة.<br>
          ٢. <strong>رَدُّ المَظَالِمِ:</strong> قضاء الديون واستحلال أصحاب الحقوق ورد الأمانات لأهلها.<br>
          ٣. <strong>النَّفَقَةُ الحَلَالُ:</strong> أن تكون نفقته من كسب طيب مبارك، فإن الله تعالى طيب لا يقبل إلا طيباً.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٤ —</span>
      <span>فضل العمرة والتوبة</span>
    </div>
  </div>

  <!-- ================= PAGE 5: TRAVEL & MIQATS ================= -->
  <div class="page" id="p-5">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">السَّفَرُ وَالمَوَاقِيتُ المَكَانِيَّةُ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>المَوَاقِيتُ الشَّرْعِيَّةُ</span></div>
        <h2 class="chapter-title">آدَابُ السَّفَرِ وَالمَوَاقِيتُ المَكَانِيَّةُ الخَمْسَةُ</h2>
      </div>

      <div class="section-box gold-accent">
        <div class="section-title" style="color:${t.gold};">دُعَاءُ رُكُوبِ الطَّائِرَةِ أَوْ المَرْكَبَةِ:</div>
        <div class="dua-matn">
          «سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى، وَمِنَ العَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ»
        </div>
        <div class="takhrij">📚 رواه مسلم في صحيحه من حديث ابن عمر رضي الله عنهما</div>
      </div>

      <div class="section-box amber-accent">
        <div class="section-title" style="color:${t.amber};">المَوَاقِيتُ المَكَانِيَّةُ الخَمْسَةُ الَّتِي وَقَّتَهَا النَّبِيُّ ﷺ:</div>
        <div class="body-text">
          • <strong>ذُو الحُلَيْفَةِ (أَبْيَارُ عَلِيٍّ):</strong> ميقات أهل المدينة ومن مرّ بها (أبعد المواقيت عن مكة، ٤٢٠ كم).<br>
          • <strong>الجُحْفَةُ (رَابِغٌ):</strong> ميقات أهل الشام ومصر والمغرب ومن حاذاهم.<br>
          • <strong>يَلَمْلَمُ (السَّعْدِيَّةُ):</strong> ميقات أهل اليمن ومن حاذاهم.<br>
          • <strong>قَرْنُ المَنَازِلِ (السَّيْلُ الكَبِيرُ / وَادِي مُحْرِمٍ):</strong> ميقات أهل نجد والطائف والخليج.<br>
          • <strong>ذَاتُ عِرْقٍ:</strong> ميقات أهل العراق والمشرق.<br>
          <div style="margin-top:1.5mm; color:${t.amber}; font-weight:700;">
            ⚠️ تَنْبِيهُ المُسَافِرِ جَوًّا: يجب على راكب الطائرة أن يحرم إذا حاذى الميقات في الجو، ولا يؤخر إحرامه حتى يهبط في مطار جدة.
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٥ —</span>
      <span>المواقيت المكانية</span>
    </div>
  </div>

  <!-- ================= PAGE 6: IHRAM SUNNAHS & TALBIYAH ================= -->
  <div class="page" id="p-6">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">سُنَنُ الإِحْرَامِ وَالتَّلْبِيَةُ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>أَحْكَامُ الإِحْرَامِ</span></div>
        <h2 class="chapter-title">مَا يُسَنُّ عِنْدَ الإِحْرَامِ وَأَحْكَامُ التَّلْبِيَةِ المَشْرُوعَةِ</h2>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">سُنَنُ الإِحْرَامِ عِنْدَ المِيقَاتِ:</div>
        <div class="body-text">
          ١. <strong>الاِغْتِسَالُ وَالتَّنَظُّفُ:</strong> يسن للرجل والمرأة (حتى الحائض والنفساء) أخذ ما يحتاج إليه من شعر الإبط والعانة وقص الأظفار.<br>
          ٢. <strong>التَّطَيُّبُ:</strong> يسن للرجل تطيب بدنه ورأسه بأحسن طيب دون ثياب إحرامه.<br>
          ٣. <strong>لِبَاسُ الإِحْرَامِ:</strong> يتجرد الرجل من المخيط ويلبس إزاراً ورداءً أبيضين نظيفين ونعلين. أما المرأة فتلبس ملابسها العادية الساترة بغير تبرج ولا تلبس النقاب والقفازين.
        </div>
      </div>

      <div class="section-box gold-accent">
        <div class="section-title" style="color:${t.gold};">صِيغَةُ التَّلْبِيَةِ النَّبَوِيَّةِ المَشْرُوعَةِ:</div>
        <div class="dua-matn-center">
          «لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الحَمْدَ وَالنِّعْمَةَ لَكَ وَالمُلْكَ، لاَ شَرِيكَ لَكَ»
        </div>
        <div class="body-text" style="text-align:center;">
          يرفع الرجل صوته بها، وتخفض المرأة صوتها، ويستمر المعتمر في التلبية حتى يبتدئ الطواف فيقطعها.
        </div>
      </div>

      <div class="section-box amber-accent">
        <div class="section-title" style="color:${t.amber};">الاِشْتِرَاطُ عِنْدَ الإِحْرَامِ:</div>
        <div class="body-text">
          إن خاف المعتمر عارضاً يمنعه من إتمام نسكه (كمرض أو احتجاز)، سنّ له أن يشترط قائلاً: «اللَّهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي»، فإن حبسه حابس تحلل ولا فدية عليه.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٦ —</span>
      <span>سنن الإحرام والتلبية</span>
    </div>
  </div>

  <!-- ================= PAGE 7: PROHIBITIONS OF IHRAM ================= -->
  <div class="page" id="p-7">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">مَحْظُورَاتُ الإِحْرَامِ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>فِقْهُ الإِحْرَامِ</span></div>
        <h2 class="chapter-title">مَحْظُورَاتُ الإِحْرَامِ التِّسْعَةُ وَمَا يُبَاحُ لِلْمُحْرِمِ</h2>
      </div>

      <div class="section-box amber-accent">
        <div class="section-title" style="color:${t.amber};">المَحْظُورَاتُ التِّسْعَةُ (مَا يَحْرُمُ عَلَى المُحْرِمِ بَعْدَ نِيَّتِهِ):</div>
        <div class="body-text">
          ١. <strong>إِزَالَةُ الشَّعْرِ:</strong> من الرأس أو سائر البدن بحلق أو قص.<br>
          ٢. <strong>تَقْلِيمُ الأَظْفَارِ:</strong> من اليدين أو الرجلين.<br>
          ٣. <strong>تَغْطِيَةُ الرَّأْسِ:</strong> بملاصق كالطاقية والغترة (خاص بالرجل).<br>
          ٤. <strong>لُبْسُ المَخِيطِ:</strong> المفصل على البدن كالثوب والفنيلة والسراويل والخف (خاص بالرجل).<br>
          ٥. <strong>الطِّيبُ:</strong> استعمال الطيب في الثوب أو البدن أو الشم قصداً.<br>
          ٦. <strong>صَيْدُ البَرِّ:</strong> قتله أو صيده أو الدلالة عليه.<br>
          ٧. <strong>عَقْدُ النِّكَاحِ:</strong> لنفسه أو لغيره بولاية أو وكالة.<br>
          ٨. <strong>الجِمَاعُ وَمُقَدِّمَاتُهُ:</strong> وهو أعظم المحظورات، ويفسد العمرة قبل الطواف والسعي.<br>
          ٩. <strong>المُبَاشَرَةُ بِشَهْوَةٍ:</strong> دون الفرج كالتقبيل واللمس بشهوة.
        </div>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">مَا يُبَاحُ لِلْمُحْرِمِ بِلَا كَرَاهَةٍ:</div>
        <div class="body-text">
          حمل المتاع على الرأس • الاستظلال بالمظلة وسقف المركبة • لبس النظارة وساعة اليد والخاتم وحزام النقود • الاغتسال بصابون غير معطر • فقع الدمل وقلع الضرس وحك الرأس برفق.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٧ —</span>
      <span>محظورات الإحرام</span>
    </div>
  </div>

  <!-- ================= PAGE 8: TAWAF WITH REAL KAABA PHOTOGRAPHY ================= -->
  <div class="page" id="p-8">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">صِفَةُ العُمْرَةِ • الطَّوَافُ حَوْلَ الكَعْبَةِ ↰</a>
    </div>

    <div class="content-flow">
      <!-- Photorealistic Kaaba Hero Box -->
      <div class="photo-hero-box">
        <img class="photo-hero-img" src="${kaabaImgBase64}" alt="الكعبة المشرفة وصحن المطاف بالمسجد الحرام" />
        <div class="photo-hero-overlay">
          <span>الكَعْبَةُ المُشَرَّفَةُ — يَبْدَأُ الطَّوَافُ مِنْ مَحَاذَاةِ الحَجَرِ الأَسْوَدِ وَيُخْتَمُ بِهِ</span>
          <span>المَسْجِدُ الحَرَامُ بِمَكَّةَ</span>
        </div>
      </div>

      <div class="chapter-banner" style="margin-bottom:1mm;">
        <div class="chapter-badge"><span>✦</span><span>رُكْنُ الطَّوَافِ</span></div>
        <h2 class="chapter-title">أَحْكَامُ وَسُنَنُ الطَّوَافِ حَوْلَ الكَعْبَةِ (٧ أَشْوَاطٍ)</h2>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">صِفَةُ الطَّوَافِ المَشْرُوعَةِ:</div>
        
        <div class="step-item">
          <span class="step-num">١</span>
          <span class="step-text"><strong>البِدَايَةُ:</strong> يبدأ الطواف من محاذاة الحجر الأسود جاعلاً الكعبة عن يساره، ويستلمه أو يشير إليه بيمينه قائلاً: «الله أكبر».</span>
        </div>
        <div class="step-item">
          <span class="step-num">٢</span>
          <span class="step-text"><strong>الاِضْطِبَاعُ:</strong> كشف الكتف الأيمن للرجل في جميع أشواط طواف العمرة فقط.</span>
        </div>
        <div class="step-item">
          <span class="step-num">٣</span>
          <span class="step-text"><strong>الرَّمَلُ:</strong> إسراع الخطى مع تقاربها في الأشواط الثلاثة الأولى للرجل دون المرأة.</span>
        </div>
        <div class="step-item">
          <span class="step-num">٤</span>
          <span class="step-text"><strong>بَيْنَ الرُّكْنَيْنِ:</strong> يسن بين الركن اليماني والحجر الأسود قول: «رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ».</span>
        </div>
        <div class="step-item">
          <span class="step-num">٥</span>
          <span class="step-text"><strong>رَكْعَتَا الطَّوَافِ:</strong> يصلي بعد إتمام ٧ أشواط ركعتين خلف مقام إبراهيم، يقرأ بـ ﴿قُلْ يَا أَيُّهَا الْكَافِرُونَ﴾ و ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾.</span>
        </div>
        <div class="takhrij" style="margin-top:2.5mm; border-top:0.5px solid ${t.divider}; padding-top:1.5mm;">
          [صحيح مسلم: كتاب الحج، باب حجة النبي ﷺ رقم ١٢١٨]
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٨ —</span>
      <span>الطواف حول الكعبة</span>
    </div>
  </div>

  <!-- ================= PAGE 9: SA'I WITH REAL SAFA MARWA PHOTOGRAPHY ================= -->
  <div class="page" id="p-9">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">صِفَةُ العُمْرَةِ • السَّعْيُ وَالتَّحَلُّلُ ↰</a>
    </div>

    <div class="content-flow">
      <!-- Photorealistic Safa & Marwa Hero Box -->
      <div class="photo-hero-box">
        <img class="photo-hero-img" src="${safaMarwaImgBase64}" alt="المسعى الشريف بين الصفا والمروة" />
        <div class="photo-hero-overlay">
          <span>المَسْعَى الشَّرِيفُ — السَّعْيُ ٧ أَشْوَاطٍ يَبْدَأُ بِالصَّفَا وَيُخْتَمُ بِالمَرْوَةِ</span>
          <span>بَيْنَ الصَّفَا وَالمَرْوَةِ</span>
        </div>
      </div>

      <div class="chapter-banner" style="margin-bottom:1mm;">
        <div class="chapter-badge"><span>✦</span><span>رُكْنُ السَّعْيِ</span></div>
        <h2 class="chapter-title">السَّعْيُ بَيْنَ الصَّفَا وَالمَرْوَةِ وَالحَلْقُ وَالتَّحَلُّلُ</h2>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">صِفَةُ السَّعْيِ المَشْرُوعَةِ:</div>
        
        <div class="step-item">
          <span class="step-num">١</span>
          <span class="step-text"><strong>البِدَايَةُ بِالصَّفَا:</strong> يقرأ عند الدنو منه: ﴿إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ﴾ «نَبْدَأُ بِمَا بَدَأَ اللهُ بِهِ».</span>
        </div>
        <div class="step-item">
          <span class="step-num">٢</span>
          <span class="step-text"><strong>الذِّكْرُ عَلَى الصَّفَا:</strong> يستقبل الكعبة ويدعو: «لاَ إِلَهَ إِلَّا اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ...».</span>
        </div>
        <div class="step-item">
          <span class="step-num">٣</span>
          <span class="step-text"><strong>الهَرْوَلَةُ:</strong> يهرول الرجل إسراعاً بين العلمين الأخضرين دون المرأة.</span>
        </div>
        <div class="step-item">
          <span class="step-num">٤</span>
          <span class="step-text"><strong>المَرْوَةُ:</strong> يختم الشوط عند المروة ويدعو مثل الصفا، وهكذا ٧ أشواط كاملة تختم عند المروة.</span>
        </div>
        <div class="step-item">
          <span class="step-num">٥</span>
          <span class="step-text"><strong>الحَلْقُ وَالتَّقْصِيرُ:</strong> يحلق الرجل رأسه كله أو يقصره، والمرأة تقصر قدر أنملة. وبذلك يتم التحلل كاملاً.</span>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٩ —</span>
      <span>السعي والحلق والتحلل</span>
    </div>
  </div>

  <!-- ================= PAGE 10: COMMON MISTAKES & CORRECTIONS ================= -->
  <div class="page" id="p-10">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">أَخْطَاءٌ شَائِعَةٌ وَتَصْحِيحُهَا ↰</a>
    </div>

    <div style="flex:1; display:flex; flex-direction:column;">
      <div class="chapter-banner" style="margin-bottom:2mm;">
        <div class="chapter-badge"><span>✦</span><span>تَنْبِيهَاتٌ فِقْهِيَّةٌ</span></div>
        <h2 class="chapter-title">أَخْطَاءٌ يَقَعُ فِيهَا بَعْضُ المُعْتَمِرِينَ وَبَيَانُ صَوَابِهَا</h2>
      </div>

      <div class="mistakes-container">
        <div class="mistake-card">
          <div class="mistake-row"><span class="mistake-tag">❌ الخَطَأُ الأول:</span> الطواف من داخل حِجْر إسماعيل.</div>
          <div class="correct-row"><span class="correct-tag">✔️ الصَّوَابُ:</span> الحِجْر من الكعبة المشرفة، ومن طاف من داخله لم يطف بالبيت وبطل شوطه.</div>
        </div>

        <div class="mistake-card">
          <div class="mistake-row"><span class="mistake-tag">❌ الخَطَأُ الثاني:</span> الطواف والدعاء جماعياً بصوت مرتفع خلف قائد.</div>
          <div class="correct-row"><span class="correct-tag">✔️ الصَّوَابُ:</span> بدعة محدثة تشوش على الطائفين، والمشروع أن يدعو كل معتمر لنفسه خاشعاً متضرعاً.</div>
        </div>

        <div class="mistake-card">
          <div class="mistake-row"><span class="mistake-tag">❌ الخَطَأُ الثالث:</span> مسح جدران الكعبة وأستارها ومقام إبراهيم طلباً للبركة.</div>
          <div class="correct-row"><span class="correct-tag">✔️ الصَّوَابُ:</span> لا يمسح إلا الحجر الأسود والركن اليماني اتباعاً للسنة الصحيحة.</div>
        </div>

        <div class="mistake-card">
          <div class="mistake-row"><span class="mistake-tag">❌ الخَطَأُ الرابع:</span> مزاحمة الناس ومضايقتهم لتقبيل الحجر الأسود.</div>
          <div class="correct-row"><span class="correct-tag">✔️ الصَّوَابُ:</span> تقبيل الحجر سنة وإيذاء المسلمين محرم، ويكفي استلامه أو الإشارة والتكبير من بعيد.</div>
        </div>

        <div class="mistake-card">
          <div class="mistake-row"><span class="mistake-tag">❌ الخَطَأُ الخامس:</span> تخصيص كل شوط من أشواط الطواف والسعي بدعاء معين.</div>
          <div class="correct-row"><span class="correct-tag">✔️ الصَّوَابُ:</span> لم يرد عن النبي ﷺ تخصيص دعاء لكل شوط، بل يدعو بما يفتح الله عليه من خيري الدنيا والآخرة.</div>
        </div>

        <div class="mistake-card">
          <div class="mistake-row"><span class="mistake-tag">❌ الخَطَأُ السادس:</span> أخذ شعرات معدودة من جهة واحدة من الرأس عند التحلل.</div>
          <div class="correct-row"><span class="correct-tag">✔️ الصَّوَابُ:</span> لا يجزئ ذلك، بل الواجب تعميم شعر الرأس كله بالتقصير أو حلقه بالكامل.</div>
        </div>
      </div>

      <div class="section-box gold-accent" style="padding:2.5mm 3.8mm; margin-top:2mm;">
        <div class="section-title" style="color:${t.gold}; font-size:8.4pt; margin-bottom:1mm;">💡 قَاعِدَةٌ ذَهَبِيَّةٌ لِلْمُعْتَمِرِ:</div>
        <div class="body-text" style="font-size:8pt; line-height:1.6;">«الأصل في العبادات التوقيف؛ فاتبع هدي النبي ﷺ وأخلص النية لله، وتجنب الابتداع، واحرص على السكينة والرفق بالمسلمين».</div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٠ —</span>
      <span>أخطاء شائعة وتصحيحها</span>
    </div>
  </div>

  <!-- ================= PAGE 11: MADINAH WITH PROPHET'S MOSQUE REAL PHOTOGRAPHY ================= -->
  <div class="page" id="p-11">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">فَضْلُ المَدِينَةِ وَآدَابُ الزِّيَارَةِ ↰</a>
    </div>

    <div class="content-flow">
      <!-- Photorealistic Prophet's Mosque Hero Box -->
      <div class="photo-hero-box">
        <img class="photo-hero-img" src="${prophetsMosqueImgBase64}" alt="المسجد النبوي الشريف والقبة الخضراء بالمدينة المنورة" />
        <div class="photo-hero-overlay">
          <span>المَسْجِدُ النَّبَوِيُّ الشَّرِيفُ — صَلَاةٌ فِيهِ تَعْدِلُ أَلْفَ صَلَاةٍ فِيمَا سِوَاهُ</span>
          <span>طَيْبَةُ الطَّيِّبَةُ</span>
        </div>
      </div>

      <div class="chapter-banner" style="margin-bottom:1mm;">
        <div class="chapter-badge"><span>✦</span><span>طَيْبَةُ الطَّيِّبَةُ</span></div>
        <h2 class="chapter-title">فَضْلُ المَدِينَةِ المُنَوَّرَةِ وَآدَابُ زِيَارَةِ المَسْجِدِ النَّبَوِيِّ</h2>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">فَضْلُ المَسْجِدِ النَّبَوِيِّ الشَّرِيفِ:</div>
        <div class="dua-matn">
          «صَلَاةٌ فِي مَسْجِدِي هَذَا خَيْرٌ مِنْ أَلْفِ صَلَاةٍ فِيمَا سِوَاهُ إِلَّا المَسْجِدَ الحَرَامَ»
        </div>
        <div class="takhrij">📚 متفق عليه من حديث أبي هريرة رضي الله عنه</div>
      </div>

      <div class="section-box gold-accent">
        <div class="section-title" style="color:${t.gold};">آدَابُ زِيَارَةِ المَسْجِدِ النَّبَوِيِّ:</div>
        <div class="body-text">
          • ليس لزيارة المسجد النبوي إحرام ولا تلبية ولا تعلق لها بصحة العمرة، بل هي سنة مستقلة مشروعة في كل وقت.<br>
          • يسن التطهر ودخول المسجد بسكينة وتقديم الرجل اليمنى وصلاة ركعتين تحية المسجد.<br>
          • الحرص على الصلاة في الروضة الشريفة لقوله ﷺ: «مَا بَيْنَ بَيْتِي وَمِنْبَرِي رَوْضَةٌ مِنْ رِيَاضِ الجَنَّةِ».
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١١ —</span>
      <span>فضل المدينة وزيارة المسجد</span>
    </div>
  </div>

  <!-- ================= PAGE 12: SALAM ON PROPHET & PROPHET'S MOSQUE PHOTOGRAPHY ================= -->
  <div class="page" id="p-12">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">السَّلَامُ عَلَى النَّبِيِّ ﷺ وَصَاحِبَيْهِ ↰</a>
    </div>

    <div class="content-flow">
      <!-- Photorealistic Prophet's Mosque & Green Dome Hero Box -->
      <div class="photo-hero-box" style="height:48mm; margin-bottom:1.8mm;">
        <img class="photo-hero-img" src="${prophetsMosqueImgBase64}" alt="المسجد النبوي الشريف والقبة الخضراء والمواجهة الشريفة" />
        <div class="photo-hero-overlay">
          <span>المَسْجِدُ النَّبَوِيُّ الشَّرِيفُ — القُبَّةُ الخَضْرَاءُ وَالمُوَاجَهَةُ الشَّرِيفَةُ</span>
          <span>طَيْبَةُ الطَّيِّبَةُ</span>
        </div>
      </div>

      <div class="chapter-banner" style="margin-bottom:1.5mm;">
        <div class="chapter-badge"><span>✦</span><span>المُوَاجَهَةُ الشَّرِيفَةُ</span></div>
        <h2 class="chapter-title">صِفَةُ السَّلَامِ عَلَى النَّبِيِّ ﷺ وَعَلَى صَاحِبَيْهِ رضي الله عنهما</h2>
      </div>

      <div class="section-box gold-accent" style="padding:2.6mm 3.8mm; margin-bottom:1.6mm;">
        <div class="section-title" style="color:${t.gold}; font-size:8.4pt; margin-bottom:1mm;">السَّلَامُ الشَّرْعِيُّ عَلَى النَّبِيِّ ﷺ بِسَكِينَةٍ وَأَدَبٍ:</div>
        <div class="dua-matn" style="font-size:9.6pt; line-height:1.75; margin:0;">
          «السَّلَامُ عَلَيْكَ يَا رَسُولَ اللهِ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ، أَشْهَدُ أَنَّكَ قَدْ بَلَّغْتَ الرِّسَالَةَ، وَأَدَّيْتَ الأَمَانَةَ، وَنَصَحْتَ الأُمَّةَ، وَجَاهَدْتَ فِي اللهِ حَقَّ جِهَادِهِ، فَجَزَاكَ اللهُ عَنْ أُمَّتِكَ أَفْضَلَ مَا جَزَى نَبِيًّا عَنْ أُمَّتِهِ».
        </div>
      </div>

      <div class="section-box emerald-accent" style="padding:2.4mm 3.8mm; margin-bottom:1.5mm;">
        <div class="section-title" style="color:${t.emerald}; font-size:8.2pt; margin-bottom:1mm;">السَّلَامُ عَلَى الصِّدِّيقِ وَالفَارُوقِ رَضِيَ اللهُ عَنْهُمَا:</div>
        <div class="body-text" style="font-size:8.2pt; line-height:1.65;">
          • <strong>أَبُو بَكْرٍ الصِّدِّيقُ:</strong> يخطو خطوة ذات اليمين فيقول: «السلام عليك يا أبا بكر خليفة رسول الله ﷺ ورضي عنك وجزاك عن أمة محمد خيراً».<br>
          • <strong>عُمَرُ بْنُ الخَطَّابِ:</strong> يخطو خطوة أخرى ذات اليمين فيقول: «السلام عليك يا عمر أمير المؤمنين ورضي عنك وجزاك عن أمة محمد خيراً».
        </div>
      </div>

      <div class="section-box amber-accent" style="padding:2mm 3.6mm;">
        <div class="body-text" style="font-size:7.6pt; line-height:1.5; color:${t.textMuted};">
          • <strong>أَدَبُ الزِّيَارَةِ:</strong> يقف الزائر بخشوع وسكينة خافضاً صوته مستقبلاً الحجرة الشريفة، ثم يمضي برفق دون إطالة تجنباً لمزاحمة المسلمين.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٢ —</span>
      <span>السلام على النبي ﷺ وصاحبيه</span>
    </div>
  </div>

  <!-- ================= PAGE 13: TAWASSUL & ITS RULINGS ================= -->
  <div class="page" id="p-13">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">التَّوَسُّلُ وَأَحْكَامُهُ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>عَقِيدَةُ التَّوْحِيدِ</span></div>
        <h2 class="chapter-title">التَّوَسُّلُ: مَفْهُومُهُ وَأَقْسَامُهُ المَشْرُوعَةُ وَالمَمْنُوعَةُ</h2>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">التَّوَسُّلُ المَشْرُوعُ ثَلَاثَةُ أَقْسَامٍ:</div>
        <div class="body-text">
          ١. <strong>بِأَسْمَاءِ اللهِ وَصِفَاتِهِ:</strong> كقوله تعالى: ﴿وَلِلَّهِ الأَسْمَاءُ الحُسْنَى فَادْعُوهُ بِهَا﴾، وكقولك: «اللهم إني أسألك بأنك أنت الرحمن الرحيم أن ترحمني».<br>
          ٢. <strong>بِالعَمَلِ الصَّالِحِ:</strong> كقوله تعالى: ﴿رَبَّنَا آمَنَّا بِمَا أَنزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ﴾، وكحديث أصحاب الغار الثلاثة.<br>
          ٣. <strong>بِدُعَاءِ الرَّجُلِ الصَّالِحِ الحَيِّ الحَاضِرِ:</strong> أن تطلب منه أن يدعو الله لك حال حياته كما كان الصحابة يطلبون من النبي ﷺ أن يستسقي لهم.
        </div>
      </div>

      <div class="section-box amber-accent">
        <div class="section-title" style="color:${t.amber};">التَّوَسُّلُ المَمْنُوعُ المُخَالِفُ لِلتَّوْحِيدِ:</div>
        <div class="body-text">
          • <strong>دُعَاءُ الأَمْوَاتِ وَالاِسْتِغَاثَةُ بِهِمْ:</strong> طلب قضاء الحوائج أو تفريج الكربات من الميت أو الغائب، وهذا شرك أكبر ينافي أصل التوحيد.<br>
          • <strong>التَّوَسُّلُ بِجَاهِ المَخْلُوقِ أَوْ ذَاتِهِ:</strong> كقول «أسألك بجاه نبيك أو بجاه فلان»، وهو بدعة محرمة وذريعة إلى الشرك.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٣ —</span>
      <span>التوسل المشروع والممنوع</span>
    </div>
  </div>

  <!-- ================= PAGE 14: ADVICES FOR PILGRIMS & SISTERS ================= -->
  <div class="page" id="p-14">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">نَصَائِحُ لِلْمُعْتَمِرِينَ وَالزَّائِرَاتِ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>إِرْشَادَاتٌ وَتَوْجِيهَاتٌ</span></div>
        <h2 class="chapter-title">تَوْجِيهَاتٌ جَامِعَةٌ لِلْمُعْتَمِرِينَ وَنَصَائِحُ خَاصَّةٌ لِلْمَرْأَةِ</h2>
      </div>

      <div class="section-box emerald-accent">
        <div class="section-title" style="color:${t.emerald};">تَوْجِيهَاتٌ عَامَّةٌ لِضُيُوفِ الرَّحْمَنِ:</div>
        <div class="body-text">
          • استحضار عظمة الزمان والمكان، وصيانة اللسان عن المراء والجدال وفضول الكلام.<br>
          • الحرص على السكينة والوقار والرفق بالآخرين في المطاف والمسعى وقطار الحرمين والمصاعد.<br>
          • الحذر من الانشغال بالتصوير وسيلفي العبادة، واستثمار الدقائق في الضراعة والدعاء.
        </div>
      </div>

      <div class="section-box amber-accent">
        <div class="section-title" style="color:${t.amber};">نَصَائِحُ خَاصَّةٌ لِلْأُخْتِ المُعْتَمِرَةِ وَالزَّائِرَةِ:</div>
        <div class="body-text">
          • <strong>الحِجَابُ وَالسِّتْرُ:</strong> الحرص على اللباس الساتر الفضفاض غير الشفاف ولا المعطر.<br>
          • <strong>تَجَنُّبُ مُزَاحَمَةِ الرِّجَالِ:</strong> الطواف في أطراف المطاف والابتعاد عن مواطن التزاحم الشديد.<br>
          • <strong>خَفْضُ الصَّوْتِ:</strong> خفض الصوت في التلبية والدعاء وقراءة القرآن.<br>
          • <strong>المَحْرَمُ الشَّرْعِيُّ:</strong> عدم السفر لأداء العمرة أو الزيارة بغير محرم لحديث: «لَا تُسَافِرِ المَرْأَةُ إِلَّا مَعَ ذِي مَحْرَمٍ».
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٤ —</span>
      <span>نصائح المعتمرين والزائرات</span>
    </div>
  </div>

  <!-- ================= PAGE 15: DUAS IN HARAM & 16 SOURCES ================= -->
  <div class="page" id="p-15">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">الأَدْعِيَةُ وَمَصَادِرُ الكِتَابِ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>جَوَامِعُ الكَلِمِ وَالمَصَادِرُ</span></div>
        <h2 class="chapter-title">جَوَامِعُ الدُّعَاءِ المَأْثُورِ وَمَصَادِرُ كِتَابِ «دَلِيلِ المُعْتَمِرِ»</h2>
      </div>

      <div class="section-box gold-accent">
        <div class="section-title" style="color:${t.gold};">مِنْ جَوَامِعِ الدُّعَاءِ المَأْثُورِ فِي الحَرَمَيْنِ الشَّرِيفَيْنِ:</div>
        <div class="dua-matn">
          «اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِ مَا سَأَلَكَ عَبْدُكَ وَنَبِيُّكَ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا عَاذَ بِهِ عَبْدُكَ وَنَبِيُّكَ»
        </div>
      </div>

      <div class="section-box">
        <div class="section-title" style="color:${t.gold};">مَصَادِرُ الكِتَابِ الـ ١٦ المُرَاجَعَةُ وَالمُعْتَمَدَةُ:</div>
        <div class="body-text" style="font-size:6.6pt; line-height:1.5;">
          ١- التحقيق والإيضاح لمسائل الحج والعمرة والزيارة (ابن باز) • ٢- مجموع فتاوى ومقالات (ابن باز) • ٣- المنهج لمريد العمرة والحج (ابن عثيمين) • ٤- أخطاء يرتكبها بعض الحجاج (ابن عثيمين) • ٥- جلسات الحج • ٦- مجموع فتاوى ورسائل ابن عثيمين • ٧- فقه العبادات (ابن عثيمين) • ٨- فضل المدينة وآداب سكناها (العباد) • ٩- أدعية وأذكار من الكتاب والسنة (العباد) • ١٠- صحيح الترغيب والترهيب (الألباني) • ١١- شرح السنة (البغوي) • ١٢- الإفصاح شرح التحقيق (الجبرين) • ١٣- دروس عقدية مستفادة من الحج (البدر) • ١٤- الدعاء من الكتاب والسنة (القحطاني) • ١٥- آداب زيارة المسجد النبوي (رئاسة شؤون المسجد النبوي) • ١٦- صفة العمرة ويليه جوامع الدعاء (رئاسة المسجد الحرام).
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٥ —</span>
      <span>مصادر الكتاب والمراجع</span>
    </div>
  </div>

  <!-- ================= PAGE 16: BACK COVER & WAQF ================= -->
  <div class="page" id="p-16" style="background:${t.coverBg}; color:${t.coverText}; text-align:center;">
    <div class="page-frame-outer" style="border-color:${t.gold}; opacity:0.75;"></div>
    <div class="page-frame-inner" style="border-color:${t.gold}; opacity:0.4;"></div>

    <div style="margin-top:14mm;">
      <div style="font-family:'IBM Plex Arabic'; font-size:8pt; color:${t.gold}; font-weight:700;">خَاتِمَةُ دَلِيلِ المُعْتَمِرِ</div>
      <h2 style="font-family:'Amiri Quran'; font-size:24pt; font-weight:700; color:#FFFFFF; margin:3mm 0;">
        تَمَّ بِحَمْدِ اللهِ وَتَوْفِيقِهِ
      </h2>
      <div style="font-family:'IBM Plex Arabic'; font-size:7.8pt; color:#DDDDDD; max-width:105mm; margin:0 auto 10mm auto; line-height:1.65;">
        نَسْأَلُ اللهَ الكَرِيمَ أَنْ يَجْعَلَ هَذَا العَمَلَ خَالِصًا لِوَجْهِهِ الكَرِيمِ، مُوجِبًا لِرِضْوَانِهِ، وَأَنْ يَتَقَبَّلَ مِنْ جَمِيعِ ضُيُوفِ الرَّحْمَنِ حَجَّهُمْ وَعُمْرَتَهُمْ وَزِيَارَتَهُمْ، وَأَنْ يَرُدَّهُمْ إِلَى بِلَادِهِمْ سَالِمِينَ غَانِمِينَ مَغْفُورًا لَهُمْ.
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.035); border:1px solid ${t.gold}; border-radius:8px; padding:6mm; margin:0 6mm;">
      <div style="font-family:'IBM Plex Arabic'; font-size:7.5pt; color:${t.gold}; margin-bottom:2mm;">حُقُوقُ الطَّبْعِ وَالنَّشْرِ:</div>
      <div style="font-family:'IBM Plex Arabic'; font-size:8.5pt; font-weight:700; color:#FFFFFF;">
        وَقْفٌ للهِ تَعَالَى لِكُلِّ مُسْلِمٍ
      </div>
      <div style="font-family:'IBM Plex Arabic'; font-size:7pt; color:#AAAAAA; margin-top:2mm; line-height:1.5;">
        يُسْمَحُ بِطِبَاعَتِهِ وَنَشْرِهِ وَتَوْزِيعِهِ مَجَّانًا دُونَ تَعْدِيلٍ عَلَى نُصُوصِهِ الشَّرْعِيَّةِ المُرَاجَعَةِ.<br>
        جَزَى اللهُ خَيْرًا كُلَّ مَنْ أَعَانَ عَلَى نَشْرِهِ وَتَوْزِيعِهِ.
      </div>
    </div>

    <div style="margin-bottom:12mm;">
      <div style="font-family:'Amiri Quran'; font-size:11.5pt; color:${t.gold}; margin-bottom:1.5mm;">
        «سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ»
      </div>
      <div style="font-family:'IBM Plex Arabic'; font-size:6.8pt; color:#888888;">
        تَمَّ الإِخْرَاجُ الرَّقْمِيُّ فِي رَبِيعِ الآخِرِ ١٤٤٨ هـ
      </div>
    </div>
  </div>

</body>
</html>`;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const themes = ["light", "dark", "navy"];

  try {
    for (const th of themes) {
      console.log(`Generating Luxury Book 2 (${th})...`);
      const page = await browser.newPage();
      const htmlContent = buildHtml(th);

      const htmlPath = path.join(outputDir, `dalil_al_mutamir_${th}.html`);
      const pdfPath = htmlPath.replace(/\.html$/, ".pdf");
      await exportBookEdition(page, { html: htmlContent, htmlPath, pdfPath, book: 2, theme: th });

      const stat = fs.statSync(pdfPath);
      console.log(`Generated: ${pdfPath} (${(stat.size / 1024).toFixed(1)} KB)`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log("Book 2 regenerated with Luxury Typography & Design!");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
