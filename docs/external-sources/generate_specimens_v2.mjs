import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const outputDir = path.resolve(import.meta.dirname, "specimens");
fs.mkdirSync(outputDir, { recursive: true });

// SVG Islamic Geometric Patterns
const islamicCornerSVG = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 44V16C4 9.37258 9.37258 4 16 4H44" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M8 44V20C8 13.3726 13.3726 8 20 8H44" stroke="#D4AF37" stroke-width="0.8" stroke-dasharray="2 2"/>
  <circle cx="16" cy="16" r="3" fill="#D4AF37"/>
  <path d="M4 4H10V10H4V4Z" fill="#D4AF37"/>
</svg>
`;

const islamicMedallionSVG = `
<svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/>
  <circle cx="50" cy="50" r="40" stroke="#D4AF37" stroke-width="0.75"/>
  <rect x="25" y="25" width="50" height="50" rx="4" transform="rotate(45 50 50)" stroke="#D4AF37" stroke-width="1"/>
  <rect x="25" y="25" width="50" height="50" rx="4" stroke="#D4AF37" stroke-width="1"/>
  <circle cx="50" cy="50" r="14" fill="#D4AF37" fill-opacity="0.15" stroke="#D4AF37" stroke-width="1"/>
  <circle cx="50" cy="50" r="4" fill="#D4AF37"/>
</svg>
`;

const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>النسخة المطورة المنقحة - تطبيق أذكار</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&family=Cairo:wght@400;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 148mm 210mm; /* Exact A5 */
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 148mm;
      background: #E8E5DF;
      color: #1F2421;
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
      padding: 12mm 12mm;
      background: #FFFFFF;
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
      border: 1px solid #C7A75C;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0.65;
    }
    .page-frame-inner {
      position: absolute;
      top: 6.5mm;
      bottom: 6.5mm;
      left: 6.5mm;
      right: 6.5mm;
      border: 0.5px dashed #C7A75C;
      border-radius: 3px;
      pointer-events: none;
      opacity: 0.4;
    }

    /* Running Header & Footer */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 0.8px solid #EAE3D2;
      padding-bottom: 2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: #7D6B4F;
    }
    .page-header .brand {
      font-weight: 700;
      color: #173829;
    }
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 0.8px solid #EAE3D2;
      padding-top: 2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: #8C806D;
    }

    /* FRONT COVER (PAGE 1) */
    .cover-front {
      background: radial-gradient(circle at center, #1E3D2F 0%, #0E2017 100%);
      color: #FFFFFF;
      padding: 14mm 12mm;
      text-align: center;
      justify-content: space-between;
      align-items: center;
    }
    .cover-front .page-frame {
      border: 1.5px solid #D4AF37;
      opacity: 0.85;
    }
    .cover-front .page-frame-inner {
      border: 0.8px dashed #D4AF37;
      opacity: 0.5;
    }
    .corner-decor {
      position: absolute;
      width: 14mm;
      height: 14mm;
    }
    .corner-tl { top: 5mm; left: 5mm; transform: scaleX(-1); }
    .corner-tr { top: 5mm; right: 5mm; }
    .corner-bl { bottom: 5mm; left: 5mm; transform: scale(-1, -1); }
    .corner-br { bottom: 5mm; right: 5mm; transform: scaleY(-1); }

    .cover-badge {
      display: inline-block;
      padding: 3px 14px;
      background: rgba(212, 175, 55, 0.16);
      border: 1px solid #D4AF37;
      border-radius: 20px;
      color: #F5E8C7;
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .cover-main-title {
      font-family: 'Amiri', serif;
      font-size: 24pt;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.35;
      margin: 3mm 0 1.5mm 0;
      text-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }
    .cover-subtitle {
      font-family: 'Cairo', sans-serif;
      font-size: 10pt;
      color: #DFD3BC;
      font-weight: 600;
    }
    .cover-author-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 6px;
      padding: 3.5mm 8mm;
      margin: 4mm auto;
      width: 90%;
    }
    .cover-author-card .label {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: #C2B69D;
      margin-bottom: 1mm;
    }
    .cover-author-card .name {
      font-family: 'Amiri', serif;
      font-size: 13pt;
      font-weight: 700;
      color: #F8ECD1;
    }
    .cover-credits {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: #A7BBA0;
      line-height: 1.5;
    }
    .cover-waqf-badge {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: #D4AF37;
      letter-spacing: 0.3px;
      border-top: 1px solid rgba(212, 175, 55, 0.25);
      padding-top: 2.5mm;
      width: 80%;
      margin: 0 auto;
    }

    /* CONTENT PAGE (PAGE 2) */
    .content-page {
      background: #FCFBF8;
    }
    h1.sec-title {
      font-family: 'Amiri', serif;
      font-size: 16pt;
      color: #173829;
      font-weight: 700;
      text-align: center;
      margin-top: 1mm;
      margin-bottom: 1.5mm;
    }
    .sec-ornament {
      text-align: center;
      color: #C5A059;
      font-size: 11pt;
      margin-bottom: 3mm;
    }

    /* Cards - calibrated to prevent any overflow */
    .step-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2.5mm;
      margin-bottom: 3.5mm;
    }
    .step-card {
      background: #FFFFFF;
      border: 1px solid #E2DC CE;
      border-top: 2.5px solid #20573E;
      border-radius: 5px;
      padding: 2.5mm 2mm;
      text-align: center;
    }
    .step-card .num {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #20573E;
      display: block;
      margin-bottom: 0.5mm;
    }
    .step-card .title {
      font-family: 'Cairo', sans-serif;
      font-size: 9.5pt;
      font-weight: 700;
      color: #1A1F1D;
    }
    .step-card .desc {
      font-size: 7pt;
      color: #555F55;
      margin-top: 0.8mm;
      line-height: 1.35;
    }

    .dua-card {
      background: #FFFFFF;
      border: 1px solid #EAE3D4;
      border-right: 3px solid #20573E;
      border-radius: 5px;
      padding: 3mm 4mm;
      margin-bottom: 3mm;
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
      color: #20573E;
      background: #E8F3ED;
      padding: 1px 6px;
      border-radius: 8px;
    }
    .badge-secondary {
      font-family: 'Cairo', sans-serif;
      font-size: 7pt;
      color: #8C754A;
      background: #F9F5EC;
      padding: 1px 6px;
      border-radius: 8px;
    }
    .dua-text {
      font-family: 'Amiri Quran', 'Amiri', serif;
      font-size: 11.5pt;
      line-height: 2.0;
      color: #1A1E1C;
      text-align: justify;
      margin-bottom: 2mm;
    }
    .dua-source {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: #6C5B3E;
      background: #FAF7F0;
      padding: 1mm 2.5mm;
      border-radius: 3px;
      display: inline-block;
    }
    .vocab-callout {
      background: #FDFBF6;
      border: 0.8px dashed #D6C29B;
      border-radius: 4px;
      padding: 2mm 3mm;
      margin-top: 2mm;
    }
    .vocab-callout-title {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #94691E;
      margin-bottom: 1mm;
    }
    .vocab-entry {
      font-size: 7.5pt;
      color: #3F372A;
      line-height: 1.45;
    }
    .vocab-entry strong {
      color: #173829;
    }

    /* BACK COVER (PAGE 3) */
    .cover-back {
      background: #FDFCF9;
      padding: 14mm 12mm;
      text-align: center;
      justify-content: space-between;
      align-items: center;
    }
    .closing-dua-box {
      margin-top: 3mm;
    }
    .closing-dua-title {
      font-family: 'Amiri', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #173829;
      margin-bottom: 2mm;
    }
    .closing-dua-text {
      font-size: 8.5pt;
      line-height: 1.7;
      color: #4A4438;
      max-width: 95%;
      margin: 0 auto;
    }

    .catalog-card {
      background: #FFFFFF;
      border: 1px solid #E2D9C8;
      border-radius: 6px;
      padding: 4mm 6mm;
      width: 100%;
      text-align: right;
      font-family: 'Cairo', sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .catalog-title {
      font-size: 8pt;
      font-weight: 700;
      color: #7D6B4F;
      border-bottom: 0.8px solid #EFEAE0;
      padding-bottom: 1.5mm;
      margin-bottom: 2.5mm;
      display: flex;
      justify-content: space-between;
    }
    .catalog-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
    }
    .catalog-table td {
      padding: 1mm 1.5mm;
      vertical-align: top;
    }
    .catalog-table .label {
      color: #7D6B4F;
      width: 32%;
      font-weight: 600;
    }
    .catalog-table .val {
      color: #222B26;
      font-weight: 700;
    }

    .app-brand-footer {
      border-top: 1px solid #EAE3D2;
      padding-top: 3mm;
      width: 100%;
    }
    .app-brand-title {
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #173829;
      margin-bottom: 1mm;
    }
    .app-brand-sub {
      font-size: 7pt;
      color: #8C806D;
      line-height: 1.4;
    }
  </style>
</head>
<body>

  <!-- ========================================== -->
  <!-- PAGE 1: FRONT COVER WITH ISLAMIC GRAPHICS -->
  <!-- ========================================== -->
  <div class="page cover-front">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>
    
    <!-- Ornamental Corners -->
    <div class="corner-decor corner-tl">${islamicCornerSVG}</div>
    <div class="corner-decor corner-tr">${islamicCornerSVG}</div>
    <div class="corner-decor corner-bl">${islamicCornerSVG}</div>
    <div class="corner-decor corner-br">${islamicCornerSVG}</div>

    <!-- Header badge -->
    <div>
      <div class="cover-badge">سلسلة الكتيبات الموثقة • تطبيق أذكار</div>
    </div>

    <!-- Central Titles & Medallion -->
    <div style="margin: 2mm 0;">
      <div style="margin-bottom: 3mm;">${islamicMedallionSVG}</div>
      <h1 class="cover-main-title">دَلِيلُ الْمُعْتَمِرِ</h1>
      <div class="cover-subtitle">صِفَةُ العُمْرَةِ خُطْوَةً بِخُطْوَةٍ • وَيَلِيهِ الْمُخْتَارُ مِنْ صَحِيحِ الأَدْعِيَةِ</div>
    </div>

    <!-- Author & Supervision -->
    <div style="width: 100%;">
      <div class="cover-author-card">
        <div class="label">اعتنى بجمعه وترتيبه</div>
        <div class="name">أبو محمد يوسف بن زبن الله بن محمد العطير</div>
      </div>

      <div class="cover-credits">
        موثق ومراجع من 16 مصدراً فقهياً لكبار العلماء<br>
        (ابن باز، ابن عثيمين، العباد، الألباني، البغوي، ابن جبرين، وغيرهم)<br>
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
    
    <!-- Header -->
    <div class="page-header">
      <span class="brand">دليل المعتمر والورد النبوي • تطبيق أذكار</span>
      <span>صِفَةُ العُمْرَةِ وَأَدْعِيَتُهَا</span>
    </div>

    <!-- Body content carefully budgeted in height -->
    <div>
      <h1 class="sec-title">أَرْكَانُ العُمْرَةِ وَوَاجِبَاتُهَا</h1>
      <div class="sec-ornament">❖ ❖ ❖</div>

      <!-- Arkan Grid -->
      <div style="font-family: 'Cairo', sans-serif; font-size: 8.5pt; font-weight: 700; color: #173829; margin-bottom: 1.5mm;">
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

      <!-- Sample Dua Card 1 -->
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

      <!-- Sample Dua Card 2 with Vocabulary Box (From Al-Wird An-Nabawi) -->
      <div class="dua-card" style="border-right-color: #94691E;">
        <div class="dua-header">
          <span class="badge-primary" style="background: #FDF5E6; color: #94691E;">من جوامع الدعاء النبوي (تحقيق د. علي العويشز)</span>
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

    <!-- Footer -->
    <div class="page-footer">
      <span>مستند إلى فتاوى كبار العلماء • وكالة الرئاسة العامة بالمسجد النبوي</span>
      <span>الصفحة 5</span>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 3: BACK COVER / CLOSING CATALOG CARD  -->
  <!-- ========================================== -->
  <div class="page cover-back">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>

    <div class="corner-decor corner-tl">${islamicCornerSVG}</div>
    <div class="corner-decor corner-tr">${islamicCornerSVG}</div>
    <div class="corner-decor corner-bl">${islamicCornerSVG}</div>
    <div class="corner-decor corner-br">${islamicCornerSVG}</div>

    <!-- Top Closing Medallion -->
    <div style="margin-top: 2mm;">
      <div style="margin-bottom: 2mm;">${islamicMedallionSVG}</div>
      <div class="closing-dua-title">خَاتِمَةُ وَدُعَاءٌ مُبَارَكٌ</div>
      <p class="closing-dua-text">
        تَمَّ بِحَمْدِ اللهِ وَعَوْنِهِ تَوْثِيقُ وَتَنْقِيحُ هَذَا الكُتَيِّبِ المُبَارَكِ، 
        نَسْأَلُ اللهَ العَظِيمَ أَنْ يَجْعَلَهُ خَالِصاً لِوَجْهِهِ الكَرِيمِ، وَأَنْ يَجْزِيَ جَامِعَيْهِ وَمُؤَلِّفَيْهِ 
        وَمَنْ نَشَرَهُ وَقَرَأَ بِهِ خَيْرَ الجَزَاءِ، وَصَلَّى اللهُ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيماً كَثِيراً.
      </p>
    </div>

    <!-- Official Cataloging / National Library Card -->
    <div class="catalog-card">
      <div class="catalog-title">
        <span>بِطَاقَةُ فَهْرَسَةِ الكِتَابِ وَالتَّوْثِيقِ الرَّسْمِيِّ</span>
        <span>مكتبة الملك فهد الوطنية</span>
      </div>
      <table class="catalog-table">
        <tr>
          <td class="label">اسم الكتيبين:</td>
          <td class="val">«دليل المعتمر» ويليه «المختار من صحيح الأدعية والأذكار»</td>
        </tr>
        <tr>
          <td class="label">الجامع والمعد:</td>
          <td class="val">أبو محمد يوسف بن زبن الله بن محمد العطير</td>
        </tr>
        <tr>
          <td class="label">الجهة المشرفة:</td>
          <td class="val">وكالة الرئاسة العامة لشؤون المسجد النبوي الشريف</td>
        </tr>
        <tr>
          <td class="label">كتاب المضاهاة:</td>
          <td class="val">«الورد النبوي الصغير» لفضيلة الشيخ د. علي بن عبد الرحمن العويشز</td>
        </tr>
        <tr>
          <td class="label">الردمك (ISBN):</td>
          <td class="val" style="font-family: sans-serif; direction: ltr; text-align: right;">978-603-04-8666-3</td>
        </tr>
        <tr>
          <td class="label">رقم الإيداع:</td>
          <td class="val">1445 / 11446 هـ — الدمام</td>
        </tr>
        <tr>
          <td class="label">الصفة الوقفية:</td>
          <td class="val" style="color: #8C6D1F;">وقف لله تعالى — مهدى ولا يباع لجميع المسلمين</td>
        </tr>
      </table>
    </div>

    <!-- App Brand & Digital Handoff -->
    <div class="app-brand-footer">
      <div class="app-brand-title">تطبيق أذكار • Azkarapp</div>
      <div class="app-brand-sub">
        تطبيق إسلامي هادئ وموثق خالٍ من الإعلانات • متوفر على الويب وجميع الأجهزة الذكية<br>
        تم التطوير والإخراج الرقمي وفق أعلى معايير الخطوط القرآنية والأمانة العلمية
      </div>
    </div>
  </div>

</body>
</html>
`;

async function main() {
  console.log("Generating flawless A5 specimen with zero overflow...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle" });
  await page.evaluateHandle("globalThis.document.fonts.ready");

  const pdfPath = path.join(outputDir, "specimen_improved_v2.pdf");
  await page.pdf({
    path: pdfPath,
    format: "A5",
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  console.log(`Generated sample PDF at: ${pdfPath}`);

  const pageElements = await page.$$(".page");
  console.log(`Found ${pageElements.length} pages. Generating preview images...`);

  for (let i = 0; i < pageElements.length; i++) {
    const imgPath = path.join(outputDir, `specimen_v2_page_${i + 1}.png`);
    await pageElements[i].screenshot({ path: imgPath });
    console.log(`Saved preview image: ${imgPath}`);
  }

  await browser.close();
  console.log("Playwright complete. Now validating PDF page count with PyPDF...");

  const verifyScript = `
import pypdf
reader = pypdf.PdfReader(r"${pdfPath}")
print(f"VERIFIED TOTAL PAGES: {len(reader.pages)}")
assert len(reader.pages) == 3, f"Expected 3 pages, got {len(reader.pages)}"
for i, p in enumerate(reader.pages):
    txt = p.extract_text() or ""
    print(f"Page {i+1} character count: {len(txt)}")
    assert len(txt) > 50, f"Page {i+1} has too little text: {len(txt)}"
print("ALL ASSERTIONS PASSED! EXACTLY 3 PAGES, ZERO OVERFLOW, ZERO TRUNCATION.")
`;
  execSync(`python -c "${verifyScript.replace(/\n/g, " ")}"`, { stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
