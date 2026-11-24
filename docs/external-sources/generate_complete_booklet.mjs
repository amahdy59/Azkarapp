import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "specimens");
fs.mkdirSync(outputDir, { recursive: true });

// Untitled UI Style Icons
const ICONS = {
  compass: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fill-opacity="0.2"/></svg>`,
  rotateCcw: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,
  footsteps: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 8l-4-4-4 4"/><path d="M7 20l4 4 4-4"/><circle cx="12" cy="12" r="2"/></svg>`,
  scissors: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  bookOpen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  lightbulb: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z" fill="currentColor" fill-opacity="0.15"/></svg>`,
  shieldAlert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  mapPin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

const THEMES = [
  {
    id: "light",
    name: "الوضع الفاتح (Light / Warm Paper)",
    bg: "#F8F5F0",
    cardBg: "#FFFFFF",
    text: "#171717",
    textMuted: "#585160",
    gold: "#A97F36",
    goldLight: "rgba(169, 127, 54, 0.12)",
    emerald: "#166534",
    emeraldBg: "#F0FDF4",
    emeraldBorder: "#BBF7D0",
    amber: "#B45309",
    amberBg: "#FFFBEB",
    amberBorder: "#FDE68A",
    border: "#E8E1D1",
    borderSubtle: "#DCD4C0",
    coverBg: "radial-gradient(circle at 50% 30%, #1A4734 0%, #0D261C 100%)",
    coverText: "#FFFFFF",
  },
  {
    id: "navy",
    name: "الوضع النيلي الملكي (Midnight Navy)",
    bg: "#0A1228",
    cardBg: "#111B35",
    text: "#F5F0E8",
    textMuted: "#CBD5E1",
    gold: "#F0C14B",
    goldLight: "rgba(240, 193, 75, 0.16)",
    emerald: "#34D399",
    emeraldBg: "rgba(52, 211, 153, 0.12)",
    emeraldBorder: "#064E3B",
    amber: "#FBBF24",
    amberBg: "rgba(251, 191, 36, 0.12)",
    amberBorder: "#78350F",
    border: "#23355C",
    borderSubtle: "#334A75",
    coverBg: "radial-gradient(circle at 50% 30%, #162B5E 0%, #070E22 100%)",
    coverText: "#F5F0E8",
  },
];

function buildFullBookHTML(t) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>دليل المعتمر والمختار من صحيح الأدعية والأذكار - ${t.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&family=Cairo:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 148mm 210mm; /* Standard A5 */
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

    /* Outer ornamental border */
    .page-frame {
      position: absolute;
      top: 4.5mm;
      bottom: 4.5mm;
      left: 4.5mm;
      right: 4.5mm;
      border: 1px solid ${t.gold};
      border-radius: 5px;
      pointer-events: none;
      opacity: 0.45;
    }

    /* CLEAN USER-CENTRIC HEADER & FOOTER (NO JARGON) */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid ${t.border};
      padding-bottom: 2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 600;
      color: ${t.textMuted};
    }
    .header-book-title {
      color: ${t.gold};
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .header-chapter {
      font-size: 8pt;
      color: ${t.textMuted};
    }

    /* THE MINIMAL, SACRED, USER-FOCUSED FOOTER */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid ${t.border};
      padding-top: 2.5mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: ${t.textMuted};
    }
    .footer-left {
      font-size: 7.5pt;
      color: ${t.textMuted};
    }
    .footer-page-pill {
      font-weight: 700;
      color: ${t.gold};
      background: ${t.goldLight};
      padding: 1.5px 10px;
      border-radius: 12px;
      border: 0.6px solid ${t.gold};
      font-size: 8pt;
    }
    .footer-right {
      font-size: 7.5pt;
      color: ${t.textMuted};
    }

    /* Cards and content blocks */
    .chapter-heading-box {
      text-align: center;
      margin-bottom: 2.5mm;
    }
    .chapter-title {
      font-family: 'Amiri', serif;
      font-size: 16.5pt;
      font-weight: 700;
      color: ${t.gold};
    }
    .chapter-sub {
      font-family: 'Cairo', sans-serif;
      font-size: 7.8pt;
      color: ${t.textMuted};
    }

    .card {
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-radius: 6px;
      padding: 3mm 4mm;
      margin-bottom: 2.5mm;
    }

    .dua-matn {
      font-family: 'Amiri Quran', 'Amiri', serif;
      font-size: 12pt;
      line-height: 2.1;
      color: ${t.text};
      text-align: justify;
      margin-bottom: 2mm;
    }
    .takhrij-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Cairo', sans-serif;
      font-size: 7.2pt;
      color: ${t.textMuted};
    }
    .badge-takhrij {
      background: rgba(125, 125, 125, 0.08);
      padding: 0.8mm 2.5mm;
      border-radius: 4px;
    }

    .vocab-box {
      background: ${t.bg};
      border: 1px solid ${t.borderSubtle};
      border-radius: 5px;
      padding: 2mm 3mm;
      margin-top: 2mm;
      font-size: 7.3pt;
      color: ${t.textMuted};
      line-height: 1.45;
    }
    .vocab-box strong {
      color: ${t.text};
    }

    /* Stepper & Action Cards */
    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2mm;
      margin-bottom: 2.5mm;
    }
    .action-card {
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-radius: 6px;
      padding: 2.5mm 2mm;
      text-align: center;
    }
    .action-card-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      margin: 0 auto 1.5mm auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .action-card-title {
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: ${t.text};
      margin-bottom: 0.5mm;
    }
    .action-card-desc {
      font-size: 6.8pt;
      color: ${t.textMuted};
      line-height: 1.35;
    }

    /* Table of contents styling */
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 1.8mm 0;
      border-bottom: 0.8px dashed ${t.border};
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: ${t.text};
    }
    .toc-item .dots {
      flex: 1;
      border-bottom: 1px dotted ${t.borderSubtle};
      margin: 0 2mm;
    }
    .toc-item .page-num {
      color: ${t.gold};
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: FRONT COVER ================= -->
  <div class="page" style="background: ${t.coverBg}; color: ${t.coverText}; text-align: center; padding: 14mm 12mm;">
    <div class="page-frame" style="border-color: ${t.gold}; opacity: 0.65;"></div>
    
    <div style="font-family: 'Cairo', sans-serif; font-size: 8.5pt; color: ${t.gold}; font-weight: 700;">
      سلسلة الكتيبات المباركة • الإصدار الموثق
    </div>

    <div>
      <h1 style="font-family: 'Amiri', serif; font-size: 26pt; font-weight: 700; color: #FFFFFF; line-height: 1.3; text-shadow: 0 2px 8px rgba(0,0,0,0.6);">
        دَلِيلُ الْمُعْتَمِرِ
      </h1>
      <div style="font-family: 'Cairo', sans-serif; font-size: 11pt; color: #E7E2D6; font-weight: 600; margin-top: 1mm;">
        صِفَةُ العُمْرَةِ خُطْوَةً بِخُطْوَةٍ • وَيَلِيهِ الْمُخْتَارُ مِنْ صَحِيحِ الأَدْعِيَةِ
      </div>
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; margin-top: 2mm;">
        ${t.name}
      </div>
    </div>

    <!-- Visual Journey Ribbon -->
    <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 3mm 4mm; width: 100%;">
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; font-weight: 700; margin-bottom: 2mm;">
        مَرَاحِلُ النُّسُكِ التَّفْصِيلِيَّةُ
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:1mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.compass}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">الإحرام</span>
        </div>
        <span style="color:${t.gold}; font-size:8pt;">➔</span>
        <div style="display:flex; flex-direction:column; align-items:center; gap:1mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.rotateCcw}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">الطواف</span>
        </div>
        <span style="color:${t.gold}; font-size:8pt;">➔</span>
        <div style="display:flex; flex-direction:column; align-items:center; gap:1mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.footsteps}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">السعي</span>
        </div>
        <span style="color:${t.gold}; font-size:8pt;">➔</span>
        <div style="display:flex; flex-direction:column; align-items:center; gap:1mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.scissors}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">التحلل</span>
        </div>
      </div>
    </div>

    <!-- Author & Sponsorship -->
    <div style="width: 100%;">
      <div style="background: rgba(0,0,0,0.25); border: 1px solid ${t.gold}; border-radius: 6px; padding: 2.5mm 6mm; margin: 0 auto 2mm auto;">
        <div style="font-family: 'Cairo', sans-serif; font-size: 7.2pt; color: #C8BFAD;">اعتنى بجمعه وترتيبه</div>
        <div style="font-family: 'Amiri', serif; font-size: 13.5pt; font-weight: 700; color: #FFFDF8;">أبو محمد يوسف بن زبن الله بن محمد العطير</div>
      </div>
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: #C2D0BE; line-height: 1.45;">
        موثق ومراجع من 16 مصدراً فقهياً لكبار العلماء<br>
        بإشراف وكالة الرئاسة العامة لشؤون المسجد النبوي الشريف
      </div>
    </div>

    <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 1.5mm; width: 85%; margin: 0 auto;">
      وَقْفٌ لِلَّهِ تَعَالَى • مُهْدَى وَلَا يُبَاعُ • طَبْعَةٌ رَقْمِيَّةٌ مُحَقَّقَةٌ 1446هـ
    </div>
  </div>

  <!-- ================= PAGE 2: TABLE OF CONTENTS ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">فِهْرِسُ المَوْضُوعَاتِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">فِهْرِسُ الكِتَابِ</h2>
        <div class="chapter-sub">دليل شامل لجميع أبواب ومناسك وأذكار الكتاب</div>
      </div>

      <div class="card" style="padding: 4mm 5mm;">
        <div class="toc-item"><span>المقدمة ومنهج جمع الكتاب ومصادره</span><span class="dots"></span><span class="page-num">ص ٣</span></div>
        <div class="toc-item"><span>أركان العمرة الثلاثة (الإحرام، الطواف، السعي)</span><span class="dots"></span><span class="page-num">ص ٤</span></div>
        <div class="toc-item"><span>واجبات العمرة ومحظورات الإحرام</span><span class="dots"></span><span class="page-num">ص ٥</span></div>
        <div class="toc-item"><span>سنن العمرة وآدابها المستحبة</span><span class="dots"></span><span class="page-num">ص ٦</span></div>
        <div class="toc-item"><span>الأدعية والأذكار المستحبة في الطواف</span><span class="dots"></span><span class="page-num">ص ٧</span></div>
        <div class="toc-item"><span>الأدعية والأذكار المستحبة في السعي</span><span class="dots"></span><span class="page-num">ص ٨</span></div>
        <div class="toc-item"><span>أدعية الصلاة (الاستفتاح، الركوع، السجود)</span><span class="dots"></span><span class="page-num">ص ٩</span></div>
        <div class="toc-item"><span>أذكار الصباح والمساء واليوم والليلة</span><span class="dots"></span><span class="page-num">ص ١٠</span></div>
        <div class="toc-item"><span>فضل المدينة المنورة وآداب زيارة المسجد النبوي</span><span class="dots"></span><span class="page-num">ص ١١</span></div>
        <div class="toc-item"><span>أخطاء شائعة يقع فيها بعض المعتمرين</span><span class="dots"></span><span class="page-num">ص ١٢</span></div>
        <div class="toc-item"><span>ثبت المراجع الـ 16 وبطاقة الفهرسة الوطنية</span><span class="dots"></span><span class="page-num">ص ١٣</span></div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٢ —</span>
      <span class="footer-left">الفهرس</span>
    </div>
  </div>

  <!-- ================= PAGE 3: INTRO & SCHOLARLY METHOD ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">المُقَدِّمَةُ وَالمَنْهَجُ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">مُقَدِّمَةُ الكِتَابِ</h2>
        <div class="chapter-sub">في فضل العمرة والدعاء وأهمية استحضار النية الصالحة</div>
      </div>

      <div class="card">
        <div style="font-family: 'Amiri', serif; font-size: 11pt; line-height: 1.8; color: ${t.text}; text-align: justify;">
          إن الحمد لله نحمده ونستعينه ونستغفره، ونعوذ بالله من شرور أنفسنا وسيئات أعمالنا، من يهده الله فلا مضل له ومن يضلل فلا هادي له. أما بعد:
          فإن العمرة من أعظم العبادات التي يتقرب بها العبد إلى مولاه، قال النبي ﷺ: «العُمْرَةُ إِلَى العُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا، وَالحَجُّ المَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الجَنَّةُ» [متفق عليه].
        </div>
      </div>

      <div class="card" style="border-right: 3px solid ${t.gold};">
        <div style="font-family: 'Cairo', sans-serif; font-size: 8.5pt; font-weight: 700; color: ${t.gold}; margin-bottom: 1.5mm;">
          منهج إعداد هذا الدليل:
        </div>
        <p style="font-size: 7.5pt; line-height: 1.5; color: ${t.textMuted};">
          اعتمد في تحرير مسائل هذا الدليل وأدعيته على ما ثبت في الكتاب والسنة النبوية الصحيحة، وفق فتاوى وتوجيهات أئمة العلم الأجلاء كفضيلة الشيخ عبد العزيز بن باز والشيخ محمد بن صالح العثيمين والشيخ عبد المحسن العباد البدر والشيخ الألباني رحمهم الله جميعاً.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٣ —</span>
      <span class="footer-left">المقدمة</span>
    </div>
  </div>

  <!-- ================= PAGE 4: ARKAN AL-UMRAH ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">صِفَةُ العُمْرَةِ • الأَرْكَان</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">أَرْكَانُ العُمْرَةِ الثَّلَاثَةُ</h2>
        <div class="chapter-sub">الأركان لا تصح العمرة إلا بها جميعاً ولا تجبر بدم</div>
      </div>

      <div class="action-grid">
        <div class="action-card" style="border-top: 2.5px solid ${t.emerald};">
          <div class="action-card-icon" style="background:${t.emeraldBg}; color:${t.emerald};">${ICONS.compass}</div>
          <div class="action-card-title">١. الإِحْرَام</div>
          <div class="action-card-desc">وهو نية الدخول في النسك من الميقات المكاني المحدد لقوله ﷺ: «إنما الأعمال بالنيات».</div>
        </div>
        <div class="action-card" style="border-top: 2.5px solid ${t.emerald};">
          <div class="action-card-icon" style="background:${t.emeraldBg}; color:${t.emerald};">${ICONS.rotateCcw}</div>
          <div class="action-card-title">٢. الطَّوَاف</div>
          <div class="action-card-desc">سبعة أشواط كاملة حول الكعبة المشرفة، يبدأ بالحجر الأسود ويختم به في كل شوط.</div>
        </div>
        <div class="action-card" style="border-top: 2.5px solid ${t.emerald};">
          <div class="action-card-icon" style="background:${t.emeraldBg}; color:${t.emerald};">${ICONS.footsteps}</div>
          <div class="action-card-title">٣. السَّعْي</div>
          <div class="action-card-desc">سبعة أشواط بين الصفا والمروة؛ يبدأ بالصفا ويختم بالمروة بعد تمام الطواف.</div>
        </div>
      </div>

      <div class="card" style="border-right: 3.5px solid ${t.emerald};">
        <div style="font-family: 'Cairo', sans-serif; font-size: 8pt; font-weight: 700; color: ${t.emerald}; margin-bottom: 1mm;">
          ضابط الركن في الشريعة:
        </div>
        <p style="font-size: 7.5pt; line-height: 1.5; color: ${t.textMuted};">
          الركن هو ما كان جزءاً من حقيقة العبادة وماهيتها؛ فإذا ترك المعتمر الإحرام أو الطواف أو السعي لم تصح عمرته حتى يأتي به، ولا يجزئه عن تركه ذبح فدية أو صيام.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٤ —</span>
      <span class="footer-left">الأركان</span>
    </div>
  </div>

  <!-- ================= PAGE 5: WAJIBAT & PROHIBITIONS ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">صِفَةُ العُمْرَةِ • الوَاجِبَات</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">وَاجِبَاتُ العُمْرَةِ وَمَحْظُورَاتُ الإِحْرَامِ</h2>
        <div class="chapter-sub">ما يجب في النسك ويجبر تركه بدم مع التنبيه على المحظورات</div>
      </div>

      <div class="action-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="action-card" style="border-top: 2.5px solid ${t.amber};">
          <div class="action-card-icon" style="background:${t.amberBg}; color:${t.amber};">${ICONS.compass}</div>
          <div class="action-card-title">الواجب الأول: الإحرام من الميقات</div>
          <div class="action-card-desc">الإحرام من الميقات المكاني لمن مر به، أو من الحل لأهل مكة.</div>
        </div>
        <div class="action-card" style="border-top: 2.5px solid ${t.amber};">
          <div class="action-card-icon" style="background:${t.amberBg}; color:${t.amber};">${ICONS.scissors}</div>
          <div class="action-card-title">الواجب الثاني: الحلق أو التقصير</div>
          <div class="action-card-desc">حلق شعر الرأس أو تقصيره للرجل، وتقصير قدر أنملة للمرأة.</div>
        </div>
      </div>

      <div class="card" style="border-right: 3.5px solid ${t.amber};">
        <div style="font-family: 'Cairo', sans-serif; font-size: 8pt; font-weight: 700; color: ${t.amber}; margin-bottom: 1mm;">
          محظورات الإحرام التسعة:
        </div>
        <div style="font-size: 7.2pt; line-height: 1.5; color: ${t.textMuted};">
          ١. إزالة الشعر • ٢. تقليم الأظفار • ٣. استعمال الطيب • ٤. تغطية الرأس بملاصق للرجل • ٥. لبس المخيط للرجل • ٦. قتل الصيد • ٧. عقد النكاح • ٨. المباشرة بشهوة • ٩. الجماع وهو أغلظها.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٥ —</span>
      <span class="footer-left">الواجبات</span>
    </div>
  </div>

  <!-- ================= PAGE 6: TAWAF SUPPLICATIONS ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">أَدْعِيَةُ الطَّوَافِ المَأْثُورَةِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">أَدْعِيَةُ وَأَذْكَارُ الطَّوَافِ</h2>
        <div class="chapter-sub">ما يسن قوله عند استلام الحجر الأسود وبين الركنين</div>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; margin-bottom:1.5mm;">
          <span style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold};">عند محاذاة الحجر الأسود في ابتداء كل شوط</span>
          <span style="font-family:'Cairo'; font-size:7pt; color:${t.textMuted};">التكبير سنة</span>
        </div>
        <div class="dua-matn">
          «بِسْمِ اللهِ، وَاللهُ أَكْبَرُ»
        </div>
        <div class="takhrij-row">
          <span class="badge-takhrij">📚 ثبت عن ابن عباس رضي الله عنهما في صحيح البخاري</span>
        </div>
      </div>

      <div class="card" style="border-right: 3px solid ${t.gold};">
        <div style="display:flex; justify-content:space-between; margin-bottom:1.5mm;">
          <span style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold};">بين الركن اليماني والحجر الأسود</span>
          <span style="font-family:'Cairo'; font-size:7pt; color:${t.emerald}; font-weight:700;">سنة مؤكدة</span>
        </div>
        <div class="dua-matn">
          «رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»
        </div>
        <div class="takhrij-row">
          <span class="badge-takhrij">📚 رواه أبو داود (١٨٩٢) وأحمد وصححه النووي والألباني</span>
        </div>
        <div class="vocab-box">
          • <strong>فِي الدُّنْيَا حَسَنَةً:</strong> العافية، والرزق الطيب، والذرية الصالحة.<br>
          • <strong>وَفِي الْآخِرَةِ حَسَنَةً:</strong> دخول الجنة، والنجاة من النار، والفوز برضوان الله.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٦ —</span>
      <span class="footer-left">أدعية الطواف</span>
    </div>
  </div>

  <!-- ================= PAGE 7: SA'I SUPPLICATIONS ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">أَدْعِيَةُ السَّعْيِ بَيْنَ الصَّفَا وَالمَرْوَةِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">أَدْعِيَةُ السَّعْيِ المَأْثُورَةِ</h2>
        <div class="chapter-sub">ما يقال عند صعود الصفا والمروة وفي أثناء السعي</div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">
          عند الدنو من الصفا لبدء السعي (يقرأ الآية مرة واحدة):
        </div>
        <div class="dua-matn">
          «إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، نَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ»
        </div>
        <div class="takhrij-row"><span class="badge-takhrij">📚 صحيح مسلم من حديث جابر رضي الله عنه</span></div>
      </div>

      <div class="card" style="border-right: 3px solid ${t.gold};">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">
          الذكر والدعاء على الصفا والمروة (يكرره ٣ مرات مع الدعاء بينهما):
        </div>
        <div class="dua-matn">
          «اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ»
        </div>
        <div class="takhrij-row"><span class="badge-takhrij">📚 صحيح مسلم (رقم ١٢١٨)</span></div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٧ —</span>
      <span class="footer-left">أدعية السعي</span>
    </div>
  </div>

  <!-- ================= PAGE 8: SALAH SUPPLICATIONS ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية</span></div>
      <div class="header-chapter">أَدْعِيَةُ الصَّلَاةِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">أَدْعِيَةُ الاسْتِفْتَاحِ وَالرُّكُوعِ وَالسُّجُودِ</h2>
        <div class="chapter-sub">من أصح ما ثبت عن النبي ﷺ في صفة صلاته</div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">دعاء الاستفتاح:</div>
        <div class="dua-matn">
          «اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالثَّلْجِ وَالْمَاءِ وَالْبَرَدِ»
        </div>
        <div class="takhrij-row"><span class="badge-takhrij">📚 متفق عليه من حديث أبي هريرة رضي الله عنه</span></div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">في الركوع والسجود:</div>
        <div class="dua-matn">
          «سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ، اللَّهُمَّ اغْفِرْ لِي»
        </div>
        <div class="takhrij-row"><span class="badge-takhrij">📚 متفق عليه من حديث عائشة رضي الله عنها</span></div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">صحيح الأدعية</span>
      <span class="footer-page-pill">— ص ٨ —</span>
      <span class="footer-left">أدعية الصلاة</span>
    </div>
  </div>

  <!-- ================= PAGE 9: MORNING & EVENING AZKAR ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية</span></div>
      <div class="header-chapter">أَذْكَارُ الصَّبَاحِ وَالمَسَاءِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">صَفْوَةُ أَذْكَارِ الصَّبَاحِ وَالمَسَاءِ</h2>
        <div class="chapter-sub">الحصن الحصين للمسلم في يومه وليلته</div>
      </div>

      <div class="card" style="border-right: 3px solid ${t.gold};">
        <div style="display:flex; justify-content:space-between; margin-bottom:1mm;">
          <span style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold};">سيد الاستغفار</span>
          <span style="font-family:'Cairo'; font-size:7pt; color:${t.textMuted};">مرة صباحاً ومساءً</span>
        </div>
        <div class="dua-matn">
          «اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ»
        </div>
        <div class="takhrij-row"><span class="badge-takhrij">📚 رواه البخاري (رقم ٦٣٠٦) من حديث شداد بن أوس</span></div>
        <div class="vocab-box">
          • <strong>أَبُوءُ لَكَ:</strong> أقر وأعترف بنعمتك علي وبذنبي وتقصيري.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">صحيح الأدعية</span>
      <span class="footer-page-pill">— ص ٩ —</span>
      <span class="footer-left">الصباح والمساء</span>
    </div>
  </div>

  <!-- ================= PAGE 10: SLEEP & WAKING ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية</span></div>
      <div class="header-chapter">أَذْكَارُ النَّوْمِ وَالاسْتِيقَاظِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">أَذْكَارُ النَّوْمِ وَالاسْتِيقَاظِ</h2>
        <div class="chapter-sub">ما يسن للمسلم عند إرادة النوم وعند انتباهه</div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">عند إرادة النوم:</div>
        <div class="dua-matn">
          «بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ»
        </div>
        <div class="takhrij-row"><span class="badge-takhrij">📚 متفق عليه من حديث أبي هريرة رضي الله عنه</span></div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">عند الاستيقاظ من النوم:</div>
        <div class="dua-matn">
          «الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ»
        </div>
        <div class="takhrij-row"><span class="badge-takhrij">📚 متفق عليه من حديث حذيفة رضي الله عنه</span></div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">صحيح الأدعية</span>
      <span class="footer-page-pill">— ص ١٠ —</span>
      <span class="footer-left">أذكار النوم</span>
    </div>
  </div>

  <!-- ================= PAGE 11: MADINAH VISIT ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">فَضْلُ المَدِينَةِ وَآدَابُ الزِّيَارَةِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">فَضْلُ المَدِينَةِ وَزِيَارَةِ المَسْجِدِ النَّبَوِيِّ</h2>
        <div class="chapter-sub">الصلاة فيه خير من ألف صلاة فيما سواه إلا المسجد الحرام</div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:8pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">آداب زيارة المسجد النبوي الشريف:</div>
        <p style="font-size:7.5pt; line-height:1.6; color:${t.textMuted};">
          ١. يقصد الزائر الصلاة في المسجد النبوي؛ فالصلاة فيه تعدل ألف صلاة.<br>
          ٢. يستحب صلاة تحية المسجد في الروضة الشريفة إن تيسر.<br>
          ٣. يسن السلام على النبي ﷺ بأدب وخفض صوت قائلاً: «السلام عليك يا رسول الله ورحمة الله وبركاته»، ثم السلام على أبي بكر وعمر رضي الله عنهما.<br>
          ٤. يسن زيارة مسجد قباء والصلاة فيه (تعدل أجر عمرة)، وزيارة شهداء أحد وأهل البقيع للدعاء لهم.
        </p>
      </div>

      <div class="card" style="border-right: 3px solid ${t.amber};">
        <div style="font-family:'Cairo'; font-size:7.8pt; font-weight:700; color:${t.amber}; margin-bottom:1mm;">تنبيه عقدي مهم:</div>
        <p style="font-size:7.2pt; line-height:1.5; color:${t.textMuted};">
          لا يجوز دعاء النبي ﷺ أو طلب الشفاعة منه بعد وفاته، ولا التمسح بالحجرة أو تقبيل الجدران والشبابيك؛ فالعبادة والدعاء لله وحده لا شريك له.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١١ —</span>
      <span class="footer-left">زيارة المدينة</span>
    </div>
  </div>

  <!-- ================= PAGE 12: COMMON MISTAKES ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">أَخْطَاءٌ شَائِعَةٌ وَتَوْجِيهَاتٌ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">أَخْطَاءٌ يَقَعُ فِيهَا بَعْضُ المُعْتَمِرِينَ</h2>
        <div class="chapter-sub">مستخلصة من كتاب الشيخ ابن عثيمين والشيخ ابن باز</div>
      </div>

      <div class="card">
        <div style="font-size:7.5pt; line-height:1.6; color:${t.textMuted};">
          • <strong>تجاوز الميقات دون إحرام:</strong> يقع فيه من يقدم بالطائرة؛ والواجب الإحرام عند محاذاة الميقات جواً.<br>
          • <strong>اعتقاد دعاء خاص لكل شوط:</strong> لا يوجد في السنة دعاء مخصص لكل شوط في الطواف أو السعي، بل يدعو بما شاء من خيري الدنيا والآخرة.<br>
          • <strong>التزاحم الشديد لتقبيل الحجر الأسود:</strong> السنة استلامه أو الإشارة إليه دون مزاحمة أو إيذاء للمسلمين.<br>
          • <strong>قص أطراف يسيرة من جهة واحدة:</strong> الواجب على الرجل تقصير جميع الرأس أو حلقه، لا أخذ خصلة واحدة.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٢ —</span>
      <span class="footer-left">أخطاء شائعة</span>
    </div>
  </div>

  <!-- ================= PAGE 13: 16 REFERENCES MATRIX ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">ثَبَتُ المَرَاجِعِ وَالمَصَادِرِ</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">ثَبَتُ المَرَاجِعِ الفِقْهِيَّةِ الـ 16</h2>
        <div class="chapter-sub">المصادر الفقهية المعتمدة التي بنيت عليها أحكام هذا الدليل</div>
      </div>

      <div class="card" style="padding: 2.5mm 3.5mm;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5mm 3mm; font-size:6.8pt; line-height:1.35; color:${t.textMuted};">
          <div>١. «التحقيق والإيضاح» للشيخ ابن باز.</div>
          <div>٢. «مجموع فتاوى ومقالات» للشيخ ابن باز.</div>
          <div>٣. «المنهج لمريد العمرة والحج» للشيخ ابن عثيمين.</div>
          <div>٤. «أخطاء يرتكبها بعض الحجاج» للشيخ ابن عثيمين.</div>
          <div>٥. «جلسات الحج» للشيخ ابن عثيمين.</div>
          <div>٦. «مجموع فتاوى ورسائل» للشيخ ابن عثيمين.</div>
          <div>٧. «فقه العبادات» للشيخ ابن عثيمين.</div>
          <div>٨. «فضل المدينة وآداب زيارتها» للشيخ عبد المحسن العباد.</div>
          <div>٩. «أدعية وأذكار من الكتاب والسنة» للشيخ العباد.</div>
          <div>١٠. «صحيح الترغيب والترهيب» للعلامة الألباني.</div>
          <div>١١. «شرح السنة» للإمام البغوي رحمه الله.</div>
          <div>١٢. «الإفصاح شرح التحقيق» للشيخ ابن جبرين.</div>
          <div>١٣. «دروس عقدية مستفادة من الحج» للشيخ عبد الرزاق البدر.</div>
          <div>١٤. «الدعاء من الكتاب والسنة» للشيخ سعيد القحطاني.</div>
          <div>١٥. «آداب زيارة المسجد النبوي» وكالة شؤون المسجد النبوي.</div>
          <div>١٦. «صفة العمرة وجوامع الدعاء» إدارة شؤون الحرم المكي.</div>
        </div>
      </div>

      <div class="card" style="display:flex; justify-content:space-between; align-items:center; font-size:7.2pt;">
        <div>
          <div><strong>الردمك المعتمد (ISBN):</strong> 978-603-04-8666-3</div>
          <div><strong>الإيداع الوطني:</strong> 1445 / 11446 هـ — مكتبة الملك فهد الوطنية</div>
        </div>
        <div style="text-align:left;">
          <div>🔗 <a href="https://alialowashez.com/9007/" style="color:${t.gold}; text-decoration:none;">موقع د. علي العويشز</a></div>
          <div>🔗 <a href="https://azkar.app" style="color:${t.gold}; text-decoration:none;">تطبيق أذكار azkar.app</a></div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span class="footer-right">دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٣ —</span>
      <span class="footer-left">ثبت المراجع</span>
    </div>
  </div>

  <!-- ================= PAGE 14: BACK COVER ================= -->
  <div class="page" style="background: ${t.coverBg}; color: ${t.coverText}; text-align: center; padding: 14mm 12mm;">
    <div class="page-frame" style="border-color: ${t.gold}; opacity: 0.65;"></div>

    <div style="font-family: 'Cairo', sans-serif; font-size: 8pt; color: ${t.gold}; font-weight: 700;">
      خَاتِمَةُ الكِتَابِ وَالدُّعَاءُ
    </div>

    <div>
      <h2 style="font-family: 'Amiri', serif; font-size: 18pt; font-weight: 700; color: #FFFFFF; margin-bottom: 2mm;">
        تَمَّ بِحَمْدِ اللهِ وَعَوْنِهِ
      </h2>
      <p style="font-family: 'Amiri', serif; font-size: 10.5pt; line-height: 1.8; color: #EAE5D9; max-width: 90%; margin: 0 auto;">
        نَسْأَلُ اللهَ العَظِيمَ أَنْ يَجْعَلَ هَذَا العَمَلَ خَالِصاً لِوَجْهِهِ الكَرِيمِ، وَأَنْ يَجْزِيَ جَامِعَيْهِ وَمُؤَلِّفَيْهِ وَمَنْ قَرَأَهُ وَنَشَرَهُ خَيْرَ الجَزَاءِ، وَصَلَّى اللهُ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيماً كَثِيراً.
      </p>
    </div>

    <div style="background: rgba(0,0,0,0.25); border: 1px solid ${t.gold}; border-radius: 6px; padding: 3mm 6mm; width: 90%; margin: 0 auto;">
      <div style="font-family: 'Cairo', sans-serif; font-size: 8pt; font-weight: 700; color: ${t.gold}; margin-bottom: 1mm;">
        تطبيق أذكار • Azkarapp
      </div>
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.2pt; color: #CBD5E1; line-height: 1.4;">
        تطبيق إسلامي هادئ وموثق خالٍ من الإعلانات<br>
        متاح مجاناً للجميع عبر الويب وجميع الأجهزة الذكية
      </div>
    </div>

    <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 2mm; width: 85%; margin: 0 auto;">
      وَقْفٌ لِلَّهِ تَعَالَى • مُهْدَى وَلَا يُبَاعُ • 1446هـ / 2026م
    </div>
  </div>

</body>
</html>
`;
}

async function main() {
  console.log("Generating Complete 14-Page Comprehensive Editions...");
  const browser = await chromium.launch();

  for (const t of THEMES) {
    console.log(`Rendering Full Book: ${t.name} (${t.id})...`);
    const page = await browser.newPage();
    const html = buildFullBookHTML(t);

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluateHandle("globalThis.document.fonts.ready");

    const pdfPath = path.join(outputDir, `dalil_al_mutamir_full_${t.id}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: "A5",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    console.log(`Saved Full PDF: ${pdfPath}`);

    // Screenshot first 3 pages and sample middle pages
    const pageElements = await page.$$(".page");
    console.log(`Total Pages Rendered: ${pageElements.length}`);

    // Take screenshot of Page 2 (TOC), Page 4 (Arkan), Page 6 (Tawaf), Page 13 (References)
    const samples = [1, 2, 4, 6, 13];
    for (const pNum of samples) {
      if (pNum <= pageElements.length) {
        const imgPath = path.join(outputDir, `full_${t.id}_page_${pNum}.png`);
        await pageElements[pNum - 1].screenshot({ path: imgPath });
        console.log(`Saved preview: ${imgPath}`);
      }
    }

    await page.close();
  }

  await browser.close();
  console.log("All complete editions generated successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
