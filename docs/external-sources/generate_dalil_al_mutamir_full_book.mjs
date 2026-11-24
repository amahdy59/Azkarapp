import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "specimens");
fs.mkdirSync(outputDir, { recursive: true });

const scratchImgDir = `C:\\\\Users\\\\AhmedMahdy\\\\.gemini\\\\antigravity\\\\brain\\\\4b1887b6-cfd7-403d-a007-472c7efd6742\\\\scratch\\\\holy_sites`;
const kaabaPath = path.join(scratchImgDir, "kaaba.jpg");
const mosquePath = path.join(scratchImgDir, "prophets_mosque.jpg");

const kaabaImgBase64 = fs.existsSync(kaabaPath)
  ? `data:image/jpeg;base64,${fs.readFileSync(kaabaPath).toString("base64")}`
  : "";
const prophetsMosqueImgBase64 = fs.existsSync(mosquePath)
  ? `data:image/jpeg;base64,${fs.readFileSync(mosquePath).toString("base64")}`
  : "";

console.log(`Kaaba Base64 length: ${kaabaImgBase64.length}`);
console.log(`Mosque Base64 length: ${prophetsMosqueImgBase64.length}`);

// Untitled UI Style Icons
const ICONS = {
  compass: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fill-opacity="0.2"/></svg>`,
  rotateCcw: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,
  footsteps: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 8l-4-4-4 4"/><path d="M7 20l4 4 4-4"/><circle cx="12" cy="12" r="2"/></svg>`,
  scissors: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  bookOpen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  shieldAlert: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
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

function buildUmrahBookHTML(t) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>دليل المعتمر - طبعة رقمية كاملة وموثقة</title>
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
      padding: 9.5mm 12mm 8.5mm 12mm;
      background: ${t.bg};
      position: relative;
      page-break-inside: avoid;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

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

    /* CLEAN RUNNING HEADER & MINIMAL FOOTER */
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

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid ${t.border};
      padding-top: 2.2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
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

    .chapter-heading-box {
      text-align: center;
      margin-bottom: 2mm;
    }
    .chapter-title {
      font-family: 'Amiri', serif;
      font-size: 16pt;
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
      margin-bottom: 2mm;
    }

    .dua-matn {
      font-family: 'Amiri Quran', 'Amiri', serif;
      font-size: 11.8pt;
      line-height: 2.1;
      color: ${t.text};
      text-align: justify;
      margin-bottom: 1.5mm;
    }

    /* PHOTOREALISTIC HERO PHOTO BOX */
    .photo-hero-box {
      position: relative;
      width: 100%;
      height: 48mm;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 2.5mm;
      border: 1px solid ${t.border};
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
      padding: 2mm 3.5mm;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
      color: #FFFFFF;
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2mm;
      margin-bottom: 2mm;
    }
    .action-card {
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-radius: 6px;
      padding: 2.5mm 2mm;
      text-align: center;
    }
    .action-card-icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      margin: 0 auto 1mm auto;
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
  </style>
</head>
<body>

  <!-- ================= PAGE 1: COVER (EXCLUSIVE TO DALIL AL-MU'TAMIR) ================= -->
  <div class="page" style="background: ${t.coverBg}; color: ${t.coverText}; text-align: center; padding: 13mm 12mm;">
    <div class="page-frame" style="border-color: ${t.gold}; opacity: 0.65;"></div>

    <div style="font-family: 'Cairo', sans-serif; font-size: 8.5pt; color: ${t.gold}; font-weight: 700;">
      وكالة الرئاسة العامة لشؤون المسجد النبوي الشريف
    </div>

    <div>
      <h1 style="font-family: 'Amiri', serif; font-size: 27pt; font-weight: 700; color: #FFFFFF; line-height: 1.3; text-shadow: 0 2px 8px rgba(0,0,0,0.6);">
        دَلِيلُ الْمُعْتَمِرِ
      </h1>
      <div style="font-family: 'Cairo', sans-serif; font-size: 11pt; color: #E7E2D6; font-weight: 600; margin-top: 1mm;">
        صِفَةُ العُمْرَةِ (خُطْوَةً بِخُطْوَةٍ) • أَخْطَاءٌ يَقَعُ فِيهَا بَعْضُ المُعْتَمِرِينَ • فَضْلُ المَدِينَةِ وَآدَابُ الزِّيَارَةِ
      </div>
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; margin-top: 2mm;">
        ${t.name}
      </div>
    </div>

    <!-- Stepper Ribbon -->
    <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 2.5mm 4mm; width: 100%;">
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.2pt; color: ${t.gold}; font-weight: 700; margin-bottom: 1.5mm;">
        مَحَطَّاتُ النُّسُكِ التَّفْصِيلِيَّةُ
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.8mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.compass}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">الإحرام بالميقات</span>
        </div>
        <span style="color:${t.gold}; font-size:8pt;">➔</span>
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.8mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.rotateCcw}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">الطواف ٧ أشواط</span>
        </div>
        <span style="color:${t.gold}; font-size:8pt;">➔</span>
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.8mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.footsteps}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">السعي ٧ أشواط</span>
        </div>
        <span style="color:${t.gold}; font-size:8pt;">➔</span>
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.8mm; flex:1;">
          <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid ${t.gold}; display:flex; align-items:center; justify-content:center; color:${t.gold};">${ICONS.scissors}</div>
          <span style="font-family:'Cairo'; font-size:6.8pt; color:#EAE5D9;">الحلق أو التقصير</span>
        </div>
      </div>
    </div>

    <!-- Compiler and Supervision -->
    <div style="width: 100%;">
      <div style="background: rgba(0,0,0,0.25); border: 1px solid ${t.gold}; border-radius: 6px; padding: 2.5mm 6mm; margin: 0 auto 1.5mm auto;">
        <div style="font-family: 'Cairo', sans-serif; font-size: 7pt; color: #C8BFAD;">اعتنى بجمعه وترتيبه</div>
        <div style="font-family: 'Amiri', serif; font-size: 13pt; font-weight: 700; color: #FFFDF8;">أبو محمد يوسف بن زبن الله بن محمد العطير</div>
      </div>
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.2pt; color: #C2D0BE; line-height: 1.45;">
        موثق ومراجع من 16 مصدراً فقهياً لكبار العلماء (ابن باز، ابن عثيمين، العباد، الألباني، وغيرهم)
      </div>
    </div>

    <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 1.5mm; width: 85%; margin: 0 auto;">
      وَقْفٌ لِلَّهِ تَعَالَى • مُهْدَى وَلَا يُبَاعُ • طَبْعَةٌ رَقْمِيَّةٌ مُحَقَّقَةٌ 1446هـ
    </div>
  </div>

  <!-- ================= PAGE 2: SOURCES & BIBLIOGRAPHY (FROM ORIGINAL P.3) ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">مَصَادِرُ الكِتَابِ الـ 16</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">مَصَادِرُ الكِتَابِ المُعْتَمَدَةُ</h2>
        <div class="chapter-sub">استند هذا الدليل في تحرير مسائله وفتاواه على 16 مصدراً من أمهات فتاوى كبار العلماء</div>
      </div>

      <div class="card" style="padding: 3mm 4mm;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.8mm 3.5mm; font-size:6.8pt; line-height:1.4; color:${t.textMuted};">
          <div>١. «التحقيق والإيضاح» لسماحة الشيخ عبد العزيز بن باز رحمه الله.</div>
          <div>٢. «مجموع فتاوى ومقالات متنوعة» لسماحة الشيخ ابن باز.</div>
          <div>٣. «المنهج لمريد العمرة والحج» لفضيلة الشيخ محمد بن عثيمين رحمه الله.</div>
          <div>٤. «أخطاء يرتكبها بعض الحجاج» لفضيلة الشيخ ابن عثيمين.</div>
          <div>٥. «جلسات الحج» لفضيلة الشيخ محمد بن صالح العثيمين.</div>
          <div>٦. «مجموع فتاوى ورسائل فضيلة الشيخ ابن عثيمين».</div>
          <div>٧. «فقه العبادات» لفضيلة الشيخ محمد بن صالح العثيمين.</div>
          <div>٨. «فضل المدينة وآداب سكناها وزيارتها» للعلامة عبد المحسن العباد.</div>
          <div>٩. «أدعية وأذكار من الكتاب والسنة الصحيحة» للشيخ عبد المحسن العباد.</div>
          <div>١٠. «صحيح الترغيب والترهيب» للمحدث العلامة محمد ناصر الدين الألباني.</div>
          <div>١١. «شرح السنة» للإمام الحسين بن مسعود البغوي رحمه الله.</div>
          <div>١٢. «الإفصاح شرح التحقيق والإيضاح» للشيخ عبد الله بن جبرين رحمه الله.</div>
          <div>١٣. «دروس عقدية مستفادة من الحج» للشيخ د. عبد الرزاق بن عبد المحسن البدر.</div>
          <div>١٤. «الدعاء من الكتاب والسنة» للشيخ د. سعيد بن علي القحطاني رحمه الله.</div>
          <div>١٥. «آداب زيارة المسجد النبوي الشريف» إعداد وكالة شؤون المسجد النبوي.</div>
          <div>١٦. «صفة العمرة، ويليه من جوامع الدعاء» إعداد إدارة شؤون الحرم المكي.</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٣ —</span>
      <span>مصادر الكتاب</span>
    </div>
  </div>

  <!-- ================= PAGE 3: TRAVEL ETIQUETTE & MIQAT (FROM ORIGINAL P.13-18) ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">صِفَةُ العُمْرَةِ • السَّفَرُ وَالمِيقَات</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">السَّفَرُ وَآدَابُهُ وَالمَوَاقِيتُ المَكَانِيَّةُ</h2>
        <div class="chapter-sub">ما يسن للمسافر قوله والمواقيت الخمسة المحددة شرعاً</div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">دعاء ركوب دابة أو طائرة السفر:</div>
        <div class="dua-matn">
          «سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ»
        </div>
        <div style="font-family:'Cairo'; font-size:7.2pt; color:${t.textMuted};">📚 رواه مسلم في صحيحه من حديث ابن عمر رضي الله عنهما</div>
      </div>

      <div class="card" style="border-right: 3px solid ${t.amber};">
        <div style="font-family:'Cairo'; font-size:7.8pt; font-weight:700; color:${t.amber}; margin-bottom:1mm;">المواقيت المكانية الخمسة:</div>
        <div style="font-size:7.2pt; line-height:1.55; color:${t.textMuted};">
          • <strong>ذو الحليفة (أبيار علي):</strong> ميقات أهل المدينة ومن مر بها.<br>
          • <strong>الجحفة (رابغ):</strong> ميقات أهل الشام ومصر والمغرب ومن حاذاهم.<br>
          • <strong>يلملم (السعدية):</strong> ميقات أهل اليمن.<br>
          • <strong>قرن المنازل (السيل الكبير):</strong> ميقات أهل نجد والطائف والخليج.<br>
          • <strong>ذات عرق:</strong> ميقات أهل العراق والشرق.<br>
          <em>* تنبيه: من قدم بالطائرة وجب عليه الإحرام عند محاذاة الميقات جواً ولا يؤخره إلى جدة.</em>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١٤ —</span>
      <span>السفر والمواقيت</span>
    </div>
  </div>

  <!-- ================= PAGE 4: TAWAF WITH PHOTOREALISTIC KAABA ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">صِفَةُ العُمْرَةِ • الطَّوَافُ حَوْلَ الكَعْبَةِ</div>
    </div>

    <div>
      <!-- Photorealistic Kaaba Hero Box -->
      <div class="photo-hero-box">
        <img class="photo-hero-img" src="${kaabaImgBase64}" alt="الكعبة المشرفة وصحن المطاف" />
        <div class="photo-hero-overlay">
          <span>الكعبة المشرفة — يبدأ الطواف من محاذاة الحجر الأسود ويختم به</span>
          <span>المسجد الحرام بمكة</span>
        </div>
      </div>

      <div class="chapter-heading-box">
        <h2 class="chapter-title" style="font-size:15pt;">أَحْكَامُ وَأَدْعِيَةُ الطَّوَافِ (٧ أَشْوَاطٍ)</h2>
      </div>

      <div class="card" style="border-right: 3px solid ${t.emerald};">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.emerald}; margin-bottom:1mm;">سنن وأحكام الطواف:</div>
        <div style="font-size:7.2pt; line-height:1.5; color:${t.textMuted};">
          ١. <strong>الاضطباع:</strong> كشف الكتف الأيمن للرجل في جميع أشواط طواف القدوم فقط.<br>
          ٢. <strong>الرَّمَل:</strong> الإسراع في المشي مع تقارب الخطى في الأشواط الثلاثة الأولى للرجل دون المرأة.<br>
          ٣. <strong>استلام الحجر الأسود:</strong> يقبله أو يلمسه بيمينه إن تيسر، وإلا أشار إليه بيده مكبراً ولا يزاحم.<br>
          ٤. <strong>بين الركنين:</strong> يسن قول: «رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ».
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٣٨ —</span>
      <span>الطواف حول الكعبة</span>
    </div>
  </div>

  <!-- ================= PAGE 5: SA'I AND HALQ (FROM ORIGINAL P.51-62) ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">صِفَةُ العُمْرَةِ • السَّعْيُ وَالتَّحَلُّل</div>
    </div>

    <div>
      <div class="chapter-heading-box">
        <h2 class="chapter-title">السَّعْيُ بَيْنَ الصَّفَا وَالمَرْوَةِ وَالتَّحَلُّلُ</h2>
        <div class="chapter-sub">يبدأ بالصفا ويختم بالمروة (سبعة أشواط كاملة)</div>
      </div>

      <div class="card">
        <div style="font-family:'Cairo'; font-size:7.5pt; font-weight:700; color:${t.gold}; margin-bottom:1mm;">صفة السعي المشروعة:</div>
        <div style="font-size:7.3pt; line-height:1.55; color:${t.textMuted};">
          • يصعد على الصفا ويستقبل القبلة ويكبر ويهلل ويدعو بما تيسر (يكرر الذكر ٣ مرات).<br>
          • ينحدر نحو المروة ويسعى ماشياً؛ ويسن للرجل الركض الشديد بين العَلَمين الأخضرين فقط دون المرأة.<br>
          • الذهاب من الصفا إلى المروة يُعد **شوطاً واحداً**، والرجوع من المروة إلى الصفا **شوطاً ثانياً**، حتى يكمل سبعة أشواط منتهياً بالمروة.
        </div>
      </div>

      <div class="card" style="border-right: 3.5px solid ${t.amber};">
        <div style="font-family:'Cairo'; font-size:7.8pt; font-weight:700; color:${t.amber}; margin-bottom:1mm;">التحلل بالحلق أو التقصير:</div>
        <div style="font-size:7.3pt; line-height:1.55; color:${t.textMuted};">
          • <strong>الحلق أفضل للرجل:</strong> لدعاء النبي ﷺ للمحلقين بالمغفرة ثلاثاً وللمقصرين واحدة.<br>
          • <strong>التقصير:</strong> يعم جميع شعر رأسه؛ ولا يجزئ أخذ شعرات يسيرة من جوانب الرأس.<br>
          • <strong>المرأة:</strong> تقصر من أطراف شعرها قدر أنملة (نحو ٢ سم) ولا تحلق أبداً.<br>
          <em>* وبتمام الحلق أو التقصير يتحلل المعتمر تحللاً كاملاً ويباح له كل ما حرم عليه بالإحرام.</em>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ٥٥ —</span>
      <span>السعي والتحلل</span>
    </div>
  </div>

  <!-- ================= PAGE 6: MADINAH VISIT WITH PROPHET'S MOSQUE PHOTO ================= -->
  <div class="page">
    <div class="page-frame"></div>
    <div class="page-header">
      <div class="header-book-title">${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <div class="header-chapter">فَضْلُ المَدِينَةِ وَآدَابُ الزِّيَارَةِ</div>
    </div>

    <div>
      <!-- Photorealistic Prophet's Mosque Hero Box -->
      <div class="photo-hero-box">
        <img class="photo-hero-img" src="${prophetsMosqueImgBase64}" alt="المسجد النبوي الشريف والقبة الخضراء" />
        <div class="photo-hero-overlay">
          <span>المسجد النبوي الشريف بالمدينة المنورة — صلاة فيه تعدل ألف صلاة فيما سواه</span>
          <span>طيبة الطيبة</span>
        </div>
      </div>

      <div class="chapter-heading-box">
        <h2 class="chapter-title" style="font-size:15pt;">آدَابُ زِيَارَةِ المَسْجِدِ النَّبَوِيِّ وَالمَزَارَاتِ</h2>
      </div>

      <div class="card">
        <div style="font-size:7.2pt; line-height:1.55; color:${t.textMuted};">
          ١. <strong>المسجد النبوي:</strong> يسن شد الرحال للصلاة فيه، والحرص على الصلاة في الروضة الشريفة.<br>
          ٢. <strong>السلام على النبي ﷺ:</strong> يأتيه الزائر بأدب وخفض صوت ويقول: «السلام عليك يا رسول الله ورحمة الله وبركاته»، ثم يسلم على أبي بكر وعمر رضي الله عنهما.<br>
          ٣. <strong>مسجد قباء:</strong> يسن التطهر في بيته وزيارة مسجد قباء والصلاة فيه (تعدل أجر عمرة).<br>
          ٤. <strong>شهداء أحد والبقيع:</strong> يسن زيارتهم للدعاء لهم والاعتبار وتذكر الآخرة.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>دليل المعتمر</span>
      <span class="footer-page-pill">— ص ١١٨ —</span>
      <span>زيارة المسجد النبوي</span>
    </div>
  </div>

  <!-- ================= PAGE 7: CLOSING & WAQF DECLARATION ================= -->
  <div class="page" style="background: ${t.coverBg}; color: ${t.coverText}; text-align: center; padding: 14mm 12mm;">
    <div class="page-frame" style="border-color: ${t.gold}; opacity: 0.65;"></div>

    <div style="font-family: 'Cairo', sans-serif; font-size: 8pt; color: ${t.gold}; font-weight: 700;">
      خَاتِمَةُ كِتَابِ دَلِيلِ المُعْتَمِرِ
    </div>

    <div>
      <h2 style="font-family: 'Amiri', serif; font-size: 20pt; font-weight: 700; color: #FFFFFF; margin-bottom: 2mm;">
        تَمَّ بِحَمْدِ اللهِ كِتَابُ «دَلِيلِ المُعْتَمِرِ»
      </h2>
      <p style="font-family: 'Amiri', serif; font-size: 11pt; line-height: 1.8; color: #EAE5D9; max-width: 90%; margin: 0 auto;">
        نسأل الله العلي القدير أن يجعل هذه العمرة مبرورة، وسعيكم مشكوراً، وذنبكم مغفوراً، وأن يتقبل منا ومنكم صالح الأعمال، وصلى الله على نبينا محمد وعلى آله وصحبه وسلم.
      </p>
    </div>

    <div style="background: rgba(0,0,0,0.25); border: 1px solid ${t.gold}; border-radius: 6px; padding: 3mm 6mm; width: 90%; margin: 0 auto;">
      <div style="font-family: 'Cairo', sans-serif; font-size: 8pt; font-weight: 700; color: ${t.gold}; margin-bottom: 1mm;">
        إشراف وكالة الرئاسة العامة لشؤون المسجد النبوي الشريف
      </div>
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.2pt; color: #CBD5E1; line-height: 1.4;">
        إصدار رقمي منقح وموثق متاح مجاناً لجميع المسلمين عبر تطبيق أذكار Azkarapp
      </div>
    </div>

    <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 2mm; width: 85%; margin: 0 auto;">
      وَقْفٌ لِلَّهِ تَعَالَى • مُهْدَى وَلَا يُبَاعُ • طَبْعَةُ 1446هـ
    </div>
  </div>

</body>
</html>
`;
}

async function main() {
  console.log("Generating Standalone Dalil Al-Mu'tamir with Real Photography...");
  const browser = await chromium.launch();

  for (const t of THEMES) {
    console.log(`Generating: ${t.name} (${t.id})...`);
    const page = await browser.newPage();
    const html = buildUmrahBookHTML(t);

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluateHandle("globalThis.document.fonts.ready");

    const pdfPath = path.join(outputDir, `dalil_al_mutamir_digital_${t.id}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: "A5",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    console.log(`Saved PDF: ${pdfPath}`);

    const pageElements = await page.$$(".page");
    console.log(`Total Pages: ${pageElements.length}`);
    for (let i = 0; i < pageElements.length; i++) {
      const imgPath = path.join(outputDir, `dalil_al_mutamir_${t.id}_p${i + 1}.png`);
      await pageElements[i].screenshot({ path: imgPath });
      console.log(`Saved page preview: ${imgPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log("Completed Dalil Al-Mu'tamir generation successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
