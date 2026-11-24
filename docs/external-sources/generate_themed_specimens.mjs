import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "specimens");
fs.mkdirSync(outputDir, { recursive: true });

// SVG Islamic Ornaments
const getCornerSVG = (goldColor) => `
<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 41V14C3 7.92487 7.92487 3 14 3H41" stroke="${goldColor}" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M7 41V18C7 11.9249 11.9249 7 18 7H41" stroke="${goldColor}" stroke-width="0.75" stroke-dasharray="2 2" opacity="0.6"/>
  <circle cx="15" cy="15" r="2.5" fill="${goldColor}"/>
  <rect x="2.5" y="2.5" width="5" height="5" fill="${goldColor}"/>
</svg>
`;

const getMedallionSVG = (goldColor) => `
<svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" stroke="${goldColor}" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.8"/>
  <circle cx="50" cy="50" r="39" stroke="${goldColor}" stroke-width="0.7"/>
  <rect x="26" y="26" width="48" height="48" rx="3" transform="rotate(45 50 50)" stroke="${goldColor}" stroke-width="1"/>
  <rect x="26" y="26" width="48" height="48" rx="3" stroke="${goldColor}" stroke-width="1"/>
  <circle cx="50" cy="50" r="13" fill="${goldColor}" fill-opacity="0.12" stroke="${goldColor}" stroke-width="0.8"/>
  <circle cx="50" cy="50" r="3.5" fill="${goldColor}"/>
</svg>
`;

const themes = [
  {
    id: "light",
    name: "الوضع الفاتح (Light / Warm Paper)",
    bg: "#F8F5F0",
    cardBg: "#FFFFFF",
    text: "#171717",
    textMuted: "#5C5468",
    cardText: "#171717",
    gold: "#A97F36",
    goldLight: "rgba(169, 127, 54, 0.12)",
    border: "#EAE3D2",
    borderSubtle: "#DCD4C0",
    coverBg: "radial-gradient(circle at center, #234E3C 0%, #11281E 100%)",
    coverText: "#FFFFFF",
    duaBg: "#FFFFFF",
    duaBorder: "#2D6A4F",
    vocabBg: "#FDFBF5",
    vocabBorder: "#D6C4A3",
    catalogBg: "#FFFFFF",
    footerText: "#7D6F5E",
  },
  {
    id: "dark",
    name: "الوضع الداكن (Dark / Pitch OLED)",
    bg: "#0D0D0D",
    cardBg: "#171717",
    text: "#F5F0E8",
    textMuted: "#B0AED0",
    cardText: "#E6E1D8",
    gold: "#D4A020",
    goldLight: "rgba(212, 160, 32, 0.15)",
    border: "#2A2A2A",
    borderSubtle: "#383838",
    coverBg: "radial-gradient(circle at center, #1C1C1C 0%, #080808 100%)",
    coverText: "#F5F0E8",
    duaBg: "#171717",
    duaBorder: "#D4A020",
    vocabBg: "#1E1D1B",
    vocabBorder: "#634E20",
    catalogBg: "#141414",
    footerText: "#8C88A0",
  },
  {
    id: "navy",
    name: "الوضع الليلي الملكي (Midnight Navy)",
    bg: "#0A1228",
    cardBg: "#111B35",
    text: "#F5F0E8",
    textMuted: "#CBD5E1",
    cardText: "#EAEFF8",
    gold: "#E8B420",
    goldLight: "rgba(232, 180, 32, 0.15)",
    border: "#23355C",
    borderSubtle: "#334A75",
    coverBg: "radial-gradient(circle at center, #13244E 0%, #060B1A 100%)",
    coverText: "#F5F0E8",
    duaBg: "#111B35",
    duaBorder: "#3B82F6",
    vocabBg: "#15213E",
    vocabBorder: "#425882",
    catalogBg: "#0E172E",
    footerText: "#8E9EB8",
  },
];

function generateHTML(t) {
  const cornerSVG = getCornerSVG(t.gold);
  const medallionSVG = getMedallionSVG(t.gold);

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>دليل المعتمر - ${t.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&family=Cairo:wght@400;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 148mm 210mm;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 148mm;
      background: ${t.bg};
      color: ${t.text};
      direction: rtl;
      text-align: right;
      font-family: 'Noto Naskh Arabic', 'Amiri', serif;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      width: 148mm;
      height: 210mm;
      max-height: 210mm;
      overflow: hidden;
      padding: 10mm 12mm 9mm 12mm;
      background: ${t.bg};
      position: relative;
      page-break-inside: avoid;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Outer ornamental frame */
    .page-frame {
      position: absolute;
      top: 5mm;
      bottom: 5mm;
      left: 5mm;
      right: 5mm;
      border: 1px solid ${t.gold};
      border-radius: 4px;
      pointer-events: none;
      opacity: 0.6;
    }
    .page-frame-inner {
      position: absolute;
      top: 6.5mm;
      bottom: 6.5mm;
      left: 6.5mm;
      right: 6.5mm;
      border: 0.6px dashed ${t.gold};
      border-radius: 3px;
      pointer-events: none;
      opacity: 0.35;
    }

    /* IMPROVED HEADER & FOOTER (UX / Sizing / Positioning) */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid ${t.border};
      padding-bottom: 2.5mm;
      margin-bottom: 2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 600;
      color: ${t.textMuted};
    }
    .page-header .brand-title {
      color: ${t.gold};
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .page-header .running-chapter {
      color: ${t.textMuted};
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid ${t.border};
      padding-top: 2.5mm;
      margin-top: 2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: ${t.footerText};
    }
    .page-footer .page-number {
      font-weight: 700;
      color: ${t.gold};
      background: ${t.goldLight};
      padding: 1px 9px;
      border-radius: 12px;
      border: 0.5px solid ${t.gold};
    }

    /* FRONT COVER (PAGE 1) */
    .cover-front {
      background: ${t.coverBg};
      color: ${t.coverText};
      text-align: center;
      justify-content: space-between;
      align-items: center;
      padding: 12mm 12mm;
    }
    .corner-decor {
      position: absolute;
      width: 13mm;
      height: 13mm;
    }
    .corner-tl { top: 5mm; left: 5mm; transform: scaleX(-1); }
    .corner-tr { top: 5mm; right: 5mm; }
    .corner-bl { bottom: 5mm; left: 5mm; transform: scale(-1, -1); }
    .corner-br { bottom: 5mm; right: 5mm; transform: scaleY(-1); }

    .cover-badge {
      display: inline-block;
      padding: 3px 14px;
      background: ${t.goldLight};
      border: 1px solid ${t.gold};
      border-radius: 20px;
      color: ${t.gold};
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.4px;
    }
    .cover-main-title {
      font-family: 'Amiri', serif;
      font-size: 25pt;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.35;
      margin: 3mm 0 1.5mm 0;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    }
    .cover-subtitle {
      font-family: 'Cairo', sans-serif;
      font-size: 10.5pt;
      color: #E6E1D8;
      font-weight: 600;
      margin-bottom: 2mm;
    }
    .cover-theme-tag {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: ${t.gold};
      opacity: 0.9;
    }
    .cover-author-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid ${t.gold};
      border-radius: 6px;
      padding: 3.5mm 8mm;
      margin: 3mm auto;
      width: 92%;
    }
    .cover-author-card .label {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: #D4CEBF;
      margin-bottom: 0.5mm;
    }
    .cover-author-card .name {
      font-family: 'Amiri', serif;
      font-size: 13.5pt;
      font-weight: 700;
      color: #FFFDF8;
    }
    .cover-credits {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: #C0CFBA;
      line-height: 1.5;
    }
    .cover-waqf-badge {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      font-weight: 600;
      color: ${t.gold};
      border-top: 1px solid rgba(212, 175, 55, 0.25);
      padding-top: 2mm;
      width: 85%;
      margin: 0 auto;
    }

    /* CONTENT PAGE (PAGE 2) */
    .sec-title {
      font-family: 'Amiri', serif;
      font-size: 16.5pt;
      color: ${t.gold};
      font-weight: 700;
      text-align: center;
      margin: 0.5mm 0 1mm 0;
    }
    .sec-ornament {
      text-align: center;
      color: ${t.gold};
      font-size: 10pt;
      margin-bottom: 2.5mm;
    }

    .step-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2.5mm;
      margin-bottom: 3mm;
    }
    .step-card {
      background: ${t.cardBg};
      border: 1px solid ${t.borderSubtle};
      border-top: 2.5px solid ${t.gold};
      border-radius: 5px;
      padding: 2.5mm 2mm;
      text-align: center;
    }
    .step-card .num {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: ${t.gold};
      display: block;
      margin-bottom: 0.5mm;
    }
    .step-card .title {
      font-family: 'Cairo', sans-serif;
      font-size: 9.5pt;
      font-weight: 700;
      color: ${t.text};
    }
    .step-card .desc {
      font-size: 7.5pt;
      color: ${t.textMuted};
      margin-top: 0.8mm;
      line-height: 1.35;
    }

    .dua-card {
      background: ${t.duaBg};
      border: 1px solid ${t.border};
      border-right: 3.5px solid ${t.duaBorder};
      border-radius: 5px;
      padding: 3mm 4mm;
      margin-bottom: 2.5mm;
    }
    .dua-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5mm;
    }
    .badge-primary {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: ${t.gold};
      background: ${t.goldLight};
      padding: 1px 7px;
      border-radius: 8px;
    }
    .badge-secondary {
      font-family: 'Cairo', sans-serif;
      font-size: 7pt;
      color: ${t.textMuted};
      background: rgba(125, 125, 125, 0.1);
      padding: 1px 6px;
      border-radius: 8px;
    }
    .dua-text {
      font-family: 'Amiri Quran', 'Amiri', serif;
      font-size: 12pt;
      line-height: 2.05;
      color: ${t.cardText};
      text-align: justify;
      margin-bottom: 2mm;
    }
    .dua-source {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: ${t.textMuted};
      background: rgba(125, 125, 125, 0.08);
      padding: 1mm 2.5mm;
      border-radius: 3px;
      display: inline-block;
    }
    .vocab-callout {
      background: ${t.vocabBg};
      border: 0.8px dashed ${t.vocabBorder};
      border-radius: 4px;
      padding: 2mm 3mm;
      margin-top: 2mm;
    }
    .vocab-callout-title {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: ${t.gold};
      margin-bottom: 1mm;
    }
    .vocab-entry {
      font-size: 7.5pt;
      color: ${t.textMuted};
      line-height: 1.45;
    }
    .vocab-entry strong {
      color: ${t.text};
    }

    /* BACK COVER: REFERENCES & SCHOLARLY BIBLIOGRAPHY (PAGE 3) */
    .cover-back {
      background: ${t.bg};
      color: ${t.text};
      padding: 10mm 12mm 9mm 12mm;
      text-align: center;
      justify-content: space-between;
      align-items: center;
    }
    .ref-header-box {
      margin-top: 1mm;
    }
    .ref-main-title {
      font-family: 'Amiri', serif;
      font-size: 15pt;
      font-weight: 700;
      color: ${t.gold};
      margin-bottom: 1mm;
    }
    .ref-subtitle {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: ${t.textMuted};
      line-height: 1.4;
    }

    /* 16 SCHOLARLY REFERENCES GRID */
    .references-container {
      background: ${t.catalogBg};
      border: 1px solid ${t.border};
      border-radius: 6px;
      padding: 3mm 4mm;
      width: 100%;
      text-align: right;
      font-family: 'Cairo', sans-serif;
      margin: 2mm 0;
    }
    .ref-list-title {
      font-size: 8pt;
      font-weight: 700;
      color: ${t.gold};
      border-bottom: 0.8px solid ${t.border};
      padding-bottom: 1mm;
      margin-bottom: 2mm;
      display: flex;
      justify-content: space-between;
    }
    .ref-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2mm 2.5mm;
      font-size: 6.8pt;
      line-height: 1.35;
      color: ${t.textMuted};
    }
    .ref-item {
      display: flex;
      align-items: baseline;
      gap: 1mm;
    }
    .ref-item .num {
      color: ${t.gold};
      font-weight: 700;
      min-width: 3mm;
    }
    .ref-item a {
      color: inherit;
      text-decoration: none;
    }
    .ref-item a:hover {
      color: ${t.gold};
      text-decoration: underline;
    }

    /* Digital Links & National Library Details */
    .digital-links-box {
      background: ${t.cardBg};
      border: 1px solid ${t.borderSubtle};
      border-radius: 5px;
      padding: 2.5mm 4mm;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Cairo', sans-serif;
      font-size: 7.2pt;
    }
    .digital-links-col {
      text-align: right;
    }
    .digital-links-col .badge {
      font-weight: 700;
      color: ${t.gold};
    }
    .digital-links-col a {
      color: ${t.gold};
      text-decoration: none;
      font-weight: 600;
    }

    .closing-signature {
      border-top: 1px solid ${t.border};
      padding-top: 2mm;
      width: 100%;
      font-family: 'Cairo', sans-serif;
      font-size: 7pt;
      color: ${t.footerText};
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>

  <!-- ========================================== -->
  <!-- PAGE 1: FRONT COVER (WITH ISLAMIC GRAPHICS) -->
  <!-- ========================================== -->
  <div class="page cover-front">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>
    
    <div class="corner-decor corner-tl">${cornerSVG}</div>
    <div class="corner-decor corner-tr">${cornerSVG}</div>
    <div class="corner-decor corner-bl">${cornerSVG}</div>
    <div class="corner-decor corner-br">${cornerSVG}</div>

    <!-- Top Badge -->
    <div>
      <div class="cover-badge">سلسلة الإصدارات النافعة • تطبيق أذكار</div>
    </div>

    <!-- Titles & Medallion -->
    <div style="margin: 1.5mm 0;">
      <div style="margin-bottom: 2mm;">${medallionSVG}</div>
      <h1 class="cover-main-title">دَلِيلُ الْمُعْتَمِرِ</h1>
      <div class="cover-subtitle">صِفَةُ العُمْرَةِ خُطْوَةً بِخُطْوَةٍ • وَيَلِيهِ الْمُخْتَارُ مِنْ صَحِيحِ الأَدْعِيَةِ</div>
      <div class="cover-theme-tag">${t.name}</div>
    </div>

    <!-- Author & Supervision -->
    <div style="width: 100%;">
      <div class="cover-author-card">
        <div class="label">اعتنى بجمعه وترتيبه</div>
        <div class="name">أبو محمد يوسف بن زبن الله بن محمد العطير</div>
      </div>

      <div class="cover-credits">
        موثق ومراجع من 16 مصدراً فقهياً لكبار العلماء<br>
        بإشراف وكالة الرئاسة العامة لشؤون المسجد النبوي الشريف
      </div>
    </div>

    <!-- Waqf status -->
    <div class="cover-waqf-badge">
      وَقْفٌ لِلَّهِ تَعَالَى • مُهْدَى وَلَا يُبَاعُ • نُسْخَةٌ رَقْمِيَّةٌ مُحَقَّقَةٌ 1446هـ
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 2: INSIDE CONTENT (ZERO TRUNCATION)   -->
  <!-- ========================================== -->
  <div class="page content-page">
    <div class="page-frame"></div>
    
    <!-- Improved Header -->
    <div class="page-header">
      <div class="brand-title">
        <span>📖</span>
        <span>دليل المعتمر والورد النبوي • تطبيق أذكار</span>
      </div>
      <div class="running-chapter">صِفَةُ العُمْرَةِ وَأَدْعِيَتُهَا</div>
    </div>

    <!-- Body content carefully budgeted in height -->
    <div>
      <h1 class="sec-title">أَرْكَانُ العُمْرَةِ وَوَاجِبَاتُهَا</h1>
      <div class="sec-ornament">❖ ❖ ❖</div>

      <!-- Arkan Grid -->
      <div style="font-family: 'Cairo', sans-serif; font-size: 8.5pt; font-weight: 700; color: ${t.gold}; margin-bottom: 1.5mm;">
        أولاً: أركان العمرة الثلاثة (لا تصح العمرة إلا بها جميعاً):
      </div>

      <div class="step-grid">
        <div class="step-card">
          <span class="num">الركن الأول</span>
          <div class="title">الإِحْرَام</div>
          <div class="desc">وهو نية الدخول في النسك لقوله ﷺ: «إنما الأعمال بالنيات».</div>
        </div>
        <div class="step-card">
          <span class="num">الركن الثاني</span>
          <div class="title">الطَّوَاف</div>
          <div class="desc">سبعة أشواط حول الكعبة، يبدأ بالحجر الأسود ويختم به.</div>
        </div>
        <div class="step-card">
          <span class="num">الركن الثالث</span>
          <div class="title">السَّعْي</div>
          <div class="desc">سبعة أشواط بين الصفا والمروة، يبدأ بالصفا ويختم بالمروة.</div>
        </div>
      </div>

      <!-- Dua Card 1 -->
      <div class="dua-card">
        <div class="dua-header">
          <span class="badge-primary">الدعاء بين الركن اليماني والحجر الأسود</span>
          <span class="badge-secondary">سنة مؤكدة في كل شوط</span>
        </div>
        <div class="dua-text">
          «رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»
        </div>
        <div class="dua-source">
          📚 رواه أبو داود (رقم 1892) وأحمد، وصححه النووي والألباني من حديث عبد الله بن السائب رضي الله عنه.
        </div>
      </div>

      <!-- Dua Card 2 with Vocabulary Box (From Al-Wird An-Nabawi) -->
      <div class="dua-card" style="border-right-color: ${t.gold};">
        <div class="dua-header">
          <span class="badge-primary" style="background: ${t.goldLight}; color: ${t.gold};">من جوامع الدعاء النبوي (تحقيق د. علي العويشز)</span>
          <span class="badge-secondary">رقم 1</span>
        </div>
        <div class="dua-text">
          «اللَّهُمَّ اغْفِرْ لَهُ، وَارْحَمْهُ، وَعَافِهِ، وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ»
        </div>
        <div class="dua-source">
          📚 صحيح مسلم (رقم 963) من حديث عوف بن مالك رضي الله عنه.
        </div>
        <div class="vocab-callout">
          <div class="vocab-callout-title">📖 غريب الحديث والمفردات النبوية:</div>
          <div class="vocab-entry">
            • <strong>أَكْرِمْ نُزُلَهُ:</strong> النُّزُل هو ما يُعَدُّ للضّيف عند قدومه؛ والمعنى: أحسن ضيافته وجزيل ثوابه عندك.<br>
            • <strong>وَسِّعْ مُدْخَلَهُ:</strong> أي اجعل مواضع دخوله واسعة رحبة، كقبره ومنازله الأخروية في الجنة.
          </div>
        </div>
      </div>
    </div>

    <!-- Improved Footer -->
    <div class="page-footer">
      <div>مستند لـ 16 مرجعاً فقهياً • وكالة المسجد النبوي</div>
      <div class="page-number">— ص ٥ —</div>
      <div>تطبيق أذكار • Azkarapp</div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 3: REFERENCES & BIBLIOGRAPHY LIST    -->
  <!-- ========================================== -->
  <div class="page cover-back">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>

    <div class="corner-decor corner-tl">${cornerSVG}</div>
    <div class="corner-decor corner-tr">${cornerSVG}</div>
    <div class="corner-decor corner-bl">${cornerSVG}</div>
    <div class="corner-decor corner-br">${cornerSVG}</div>

    <!-- Header Box -->
    <div class="ref-header-box">
      <h2 class="ref-main-title">ثَبَتُ المَرَاجِعِ وَالمَصَادِرِ المُعْتَمَدَةِ</h2>
      <p class="ref-subtitle">
        المصادر الفقهية والحديثية الـ 16 المحققة التي استند إليها كتيب «دليل المعتمر» و«الورد النبوي»
      </p>
    </div>

    <!-- 16 References in 2 Columns -->
    <div class="references-container">
      <div class="ref-list-title">
        <span>قائمة الكتب المعتمدة لكبار العلماء</span>
        <span>توثيق شرعي معتمد</span>
      </div>
      <div class="ref-grid">
        <div class="ref-item"><span class="num">١.</span><span>«التحقيق والإيضاح» للشيخ ابن باز رحمه الله.</span></div>
        <div class="ref-item"><span class="num">٢.</span><span>«مجموع فتاوى ومقالات» لسماحة الشيخ ابن باز.</span></div>
        <div class="ref-item"><span class="num">٣.</span><span>«المنهج لمريد العمرة والحج» للشيخ ابن عثيمين.</span></div>
        <div class="ref-item"><span class="num">٤.</span><span>«أخطاء يرتكبها بعض الحجاج» للشيخ ابن عثيمين.</span></div>
        <div class="ref-item"><span class="num">٥.</span><span>«جلسات الحج» لفضيلة الشيخ ابن عثيمين رحمه الله.</span></div>
        <div class="ref-item"><span class="num">٦.</span><span>«مجموع فتاوى ورسائل» للشيخ ابن عثيمين.</span></div>
        <div class="ref-item"><span class="num">٧.</span><span>«فقه العبادات» للشيخ محمد بن صالح العثيمين.</span></div>
        <div class="ref-item"><span class="num">٨.</span><span>«فضل المدينة وآداب زيارتها» للشيخ عبد المحسن العباد.</span></div>
        <div class="ref-item"><span class="num">٩.</span><span>«أدعية وأذكار من الكتاب والسنة» للشيخ العباد.</span></div>
        <div class="ref-item"><span class="num">١٠.</span><span>«صحيح الترغيب والترهيب» للعلامة الألباني رحمه الله.</span></div>
        <div class="ref-item"><span class="num">١١.</span><span>«شرح السنة» للإمام الحسين بن مسعود البغوي.</span></div>
        <div class="ref-item"><span class="num">١٢.</span><span>«الإفصاح شرح التحقيق» للشيخ عبد الله بن جبرين.</span></div>
        <div class="ref-item"><span class="num">١٣.</span><span>«دروس عقدية مستفادة من الحج» للشيخ د. عبد الرزاق البدر.</span></div>
        <div class="ref-item"><span class="num">١٤.</span><span>«الدعاء من الكتاب والسنة» للشيخ د. سعيد القحطاني.</span></div>
        <div class="ref-item"><span class="num">١٥.</span><span>«آداب زيارة المسجد النبوي» وكالة المسجد النبوي الشريف.</span></div>
        <div class="ref-item"><span class="num">١٦.</span><span>«صفة العمرة وجوامع الدعاء» إدارة شؤون الحرم المكي.</span></div>
      </div>
    </div>

    <!-- Official Registry & Clickable Digital Links -->
    <div class="digital-links-box">
      <div class="digital-links-col">
        <div><span class="badge">كتاب المضاهاة:</span> «الورد النبوي الصغير» (د. علي العويشز)</div>
        <div><span class="badge">رقم الإيداع:</span> 1445 / 11446 هـ — مكتبة الملك فهد الوطنية</div>
        <div><span class="badge">الردمك (ISBN):</span> <span style="font-family: sans-serif; direction: ltr;">978-603-04-8666-3</span></div>
      </div>
      <div class="digital-links-col" style="text-align: left;">
        <div>🔗 <a href="https://alialowashez.com/9007/">رابط الموقع الرسمي للشيخ د. علي العويشز</a></div>
        <div>🔗 <a href="https://azkar.app">بوابة تطبيق أذكار الرقمية (azkar.app)</a></div>
        <div style="color: ${t.gold}; font-weight: 700; margin-top: 1mm;">وقف لله تعالى • مهدى ولا يباع</div>
      </div>
    </div>

    <!-- Signature Footer -->
    <div class="closing-signature">
      <div>صُمم وأُخرج رقمياً وفق معايير الويب وإمكانية الوصول WCAG 2.2 AA</div>
      <div class="page-number">— ص ٦ —</div>
      <div>تطبيق أذكار • الإصدار 1446هـ / 2026م</div>
    </div>
  </div>

</body>
</html>
`;
}

async function main() {
  console.log("Launching Chromium via Playwright for 3-Theme Generation...");
  const browser = await chromium.launch();

  for (const t of themes) {
    console.log(`\n========================================`);
    console.log(`GENERATING: ${t.name} (${t.id})...`);
    console.log(`========================================`);
    const page = await browser.newPage();
    const html = generateHTML(t);

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluateHandle("globalThis.document.fonts.ready");

    const pdfPath = path.join(outputDir, `specimen_theme_${t.id}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: "A5",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    console.log(`Saved PDF: ${pdfPath}`);

    // Take screenshots of all 3 pages
    const pageElements = await page.$$(".page");
    console.log(`Pages rendered: ${pageElements.length}`);
    for (let i = 0; i < pageElements.length; i++) {
      const imgPath = path.join(outputDir, `specimen_${t.id}_page_${i + 1}.png`);
      await pageElements[i].screenshot({ path: imgPath });
      console.log(`Saved preview: ${imgPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log("\nAll 3 themes generated successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
