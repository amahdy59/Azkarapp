import fs from "node:fs";

let b2 = fs.readFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", "utf8");

const p2Start = b2.indexOf("<!-- ================= PAGE 2: TABLE OF CONTENTS ================= -->");
const p3Start = b2.indexOf("<!-- ================= PAGE 3: OFFICIAL APPROVAL & ROADMAP ================= -->");

console.log("Found p2Start:", p2Start, "p3Start:", p3Start);

const fixedP2 = `<!-- ================= PAGE 2: TABLE OF CONTENTS ================= -->
  <div class="page" id="p-2">
    <div class="page-frame-outer"></div>
    <div class="page-frame-inner"></div>
    <div class="page-header">
      <div class="header-book-title">\${ICONS.bookOpen}<span>دليل المعتمر</span></div>
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

  `;

b2 = b2.slice(0, p2Start) + fixedP2 + b2.slice(p3Start);

// Also ensure .toc-item-leader is properly defined in CSS
if (!b2.includes(".toc-item-leader")) {
  const cssTarget = "    .toc-item {";
  const leaderCss = `    .toc-item-leader {
      flex: 1;
      border-bottom: 1px dotted \${t.divider};
      margin: 0 2mm;
      min-width: 5mm;
      height: 1px;
    }
    .toc-item-page {
      font-weight: 700;
      color: \${t.gold};
      min-width: 8mm;
      text-align: left;
    }
`;
  b2 = b2.replace(cssTarget, leaderCss + cssTarget);
}

fs.writeFileSync("docs/external-sources/generate_book2_dalil_al_mutamir.mjs", b2, "utf8");
console.log("Successfully fixed Book 2 Page 2 TOC!");
