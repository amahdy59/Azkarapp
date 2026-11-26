import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");

// 1. Add id="p-X" to all page divs in Book 2
let pageCounter = 0;
code = code.replace(/<div class="page"/g, () => {
  pageCounter++;
  return `<div class="page" id="p-${pageCounter}"`;
});

// 2. Make TOC items clickable <a> links on Page 2
const pageMap = {
  "١. المواقيت المكانية وأحكام الإحرام": 5,
  "٢. سنن الإحرام والتلبية المشروعة": 6,
  "٣. محظورات الإحرام وما يباح للمحرم": 7,
  "٤. صفة الطواف وسننه وأدعيته": 8,
  "٥. صفة السعي بين الصفا والمروة": 9,
  "٦. الحلق والتقصير والتحلل": 9,
  "٧. أخطاء شائعة في الإحرام والطواف والسعي والتحلل": 10,
  "٨. فضل المدينة المنورة وآداب زيارة المسجد النبوي": 11,
  "٩. السلام على النبي ﷺ وصاحبيه وزيارة الروضة وقباء": 12,
  "١٠. التوسل وأحكامه (المشروع والممنوع)": 13,
  "١١. نصائح وتوجيهات للمعتمرين وللمرأة المعتمرة": 14,
  "١٢. المختار من أدعية الحرم والمشاعر ومصادر الكتاب الـ ١٦": 15,
};

for (const [title, pNum] of Object.entries(pageMap)) {
  const target = `<div class="toc-item">\n          <span class="toc-item-title">${title}</span>`;
  const replacement = `<a href="#p-${pNum}" class="toc-item">\n          <span class="toc-item-title">${title}</span>`;
  code = code.replace(target, replacement);
}
// Close any open <a> for toc-items
code = code.replace(
  /<span class="toc-item-page">([^<]+)<\/span>\n {8}<\/div>/g,
  '<span class="toc-item-page">$1</span>\n        </a>',
);

// 3. Make header chapter titles link back to TOC (p-2)
code = code.replace(
  /<div class="header-chapter">([^<]+)<\/div>/g,
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">$1 ↰</a>',
);
// On page 2 (TOC), remove the return link
code = code.replace(
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">الفهرس ↰</a>',
  '<div class="header-chapter">الفهرس</div>',
);

// 4. Add the Infographic Umrah Roadmap on Page 3
const p3Start = code.indexOf("<!-- ================= PAGE 3: OFFICIAL APPROVAL ================= -->");
const p4Start = code.indexOf("<!-- ================= PAGE 4: VIRTUES & PREPARATION ================= -->");

const newP3 = `<!-- ================= PAGE 3: OFFICIAL APPROVAL & ROADMAP ================= -->
  <div class="page" id="p-3">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">\${ICONS.bookOpen}<span>دليل المعتمر</span></div>
      <a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">مُقَدِّمَةُ الرِّئَاسَةِ وَخَرِيطَةُ المَنَاسِكِ ↰</a>
    </div>

    <div class="content-flow">
      <div class="chapter-banner" style="margin-bottom:2mm;">
        <div class="chapter-badge"><span>✦</span><span>إِشَادَةٌ وَتَقْدِيمٌ رَسْمِيٌّ</span></div>
        <h2 class="chapter-title">كَلِمَةُ وِكَالَةِ شُؤُونِ المَسْجِدِ النَّبَوِيِّ وَخَرِيطَةُ المَنَاسِكِ</h2>
      </div>

      <div class="section-box gold-accent" style="padding:2.8mm 3.8mm;">
        <div class="section-title" style="color:\${t.gold}; font-size:8pt; margin-bottom:1mm;">تَقْدِيمُ الوِكَالَةِ لِلطَّبْعَةِ:</div>
        <div class="dua-matn" style="font-size:8.4pt; line-height:1.65; margin:0;">
          «فَإِنَّ وِكَالَةَ الرِّئَاسَةِ العَامَّةِ لِشُؤُونِ المَسْجِدِ النَّبَوِيِّ الشَّرِيفِ، انْطِلَاقًا مِنْ حِرْصِهَا عَلَى تَبْصِيرِ قَاصِدِي الحَرَمَيْنِ، قَدِ اعْتَنَتْ بِمُرَاجَعَةِ وَنَشْرِ هَذَا الكِتَابِ المُبَارَكِ: «دَلِيلِ المُعْتَمِرِ» لِيَكُونَ عَوْنًا لِلْمُسْلِمِ عَلَى أَدَاءِ نُسُكِهِ عَلَى الوَجْهِ الصَّحِيحِ المَشْرُوعِ وَفْقَ هَدْيِ رَسُولِ اللهِ ﷺ.»
        </div>
      </div>

      <!-- VISUAL INFOGRAPHIC UMRAH ROADMAP -->
      <div class="roadmap-box">
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

  `;

code = code.slice(0, p3Start) + newP3 + code.slice(p4Start);

// 5. Add Roadmap and Clickable TOC CSS
const b2CssTarget = "    .toc-item {";
const newB2Css = `    .toc-item {
      display: flex;
      align-items: baseline;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
      text-decoration: none;
      color: inherit;
      transition: color 0.15s ease;
    }
    .toc-item:hover {
      color: \${t.gold};
    }

    /* Visual Roadmap Infographic */
    .roadmap-box {
      background: \${t.goldLight};
      border: 1px solid \${t.frameOuter};
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
      color: \${t.gold};
      border-bottom: 0.5px solid \${t.divider};
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
      background: \${t.canvasBg};
      border: 0.5px solid \${t.divider};
      border-radius: 6px;
      padding: 2mm 2.5mm;
      text-decoration: none;
      color: inherit;
      transition: transform 0.1s ease, border-color 0.1s ease;
    }
    .roadmap-card:hover {
      border-color: \${t.gold};
    }
    .step-num-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4.8mm;
      height: 4.8mm;
      border-radius: 50%;
      background: \${t.gold};
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
      color: \${t.text};
    }
    .step-desc {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.6pt;
      line-height: 1.35;
      color: \${t.textMuted};
    }
`;

code = code.replace(b2CssTarget, newB2Css);

fs.writeFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", code, "utf8");
console.log("Successfully applied Book 2 interactive navigation and visual Umrah roadmap!");
