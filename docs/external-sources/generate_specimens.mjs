import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "specimens");
fs.mkdirSync(outputDir, { recursive: true });

const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>نموذج تحسين الكتيبات - تطبيق أذكار</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&family=Cairo:wght@500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A5 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Noto Naskh Arabic', 'Amiri', serif;
      background-color: #FAF8F5;
      color: #24292F;
      direction: rtl;
      text-align: right;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      width: 148mm;
      min-height: 210mm;
      padding: 16mm 14mm;
      margin: 0 auto 10mm auto;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      position: relative;
      border: 1px solid #EAE5D9;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    /* Frame & Islamic border */
    .page::before {
      content: "";
      position: absolute;
      top: 5mm;
      bottom: 5mm;
      left: 5mm;
      right: 5mm;
      border: 1px solid #D4AF37;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0.6;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #EAE5D9;
      padding-bottom: 3mm;
      margin-bottom: 6mm;
      font-family: 'Cairo', sans-serif;
      font-size: 9pt;
      color: #79684C;
    }
    .page-header .brand {
      font-weight: 700;
      color: #1E3A2B;
    }
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #EAE5D9;
      padding-top: 3mm;
      margin-top: 6mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      color: #8C8270;
    }
    
    /* Cover Styling */
    .cover {
      background: linear-gradient(135deg, #1B382B 0%, #0F2018 100%);
      color: #FFFFFF;
      text-align: center;
      justify-content: center;
      align-items: center;
      padding: 20mm 15mm;
    }
    .cover::before {
      border-color: #D4AF37;
      opacity: 0.8;
      border-width: 1.5px;
    }
    .cover-badge {
      display: inline-block;
      padding: 4px 14px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid #D4AF37;
      border-radius: 20px;
      color: #F3E5AB;
      font-family: 'Cairo', sans-serif;
      font-size: 9.5pt;
      margin-bottom: 8mm;
      letter-spacing: 0.5px;
    }
    .cover-title {
      font-family: 'Amiri', serif;
      font-size: 28pt;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.4;
      margin-bottom: 4mm;
      text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .cover-subtitle {
      font-family: 'Cairo', sans-serif;
      font-size: 13pt;
      color: #E2D7C3;
      margin-bottom: 12mm;
      font-weight: 600;
    }
    .cover-divider {
      width: 60mm;
      height: 2px;
      background: linear-gradient(90deg, transparent, #D4AF37, transparent);
      margin: 0 auto 12mm auto;
    }
    .cover-author-box {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      padding: 6mm 10mm;
      margin-bottom: 12mm;
      width: 100%;
    }
    .cover-author-label {
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      color: #C2B69D;
      margin-bottom: 2mm;
    }
    .cover-author-name {
      font-family: 'Amiri', serif;
      font-size: 15pt;
      font-weight: 700;
      color: #F7E9C8;
    }
    .cover-supervision {
      font-family: 'Cairo', sans-serif;
      font-size: 9pt;
      color: #A3B899;
      line-height: 1.6;
    }
    .cover-waqf {
      margin-top: 8mm;
      font-family: 'Cairo', sans-serif;
      font-size: 9pt;
      color: #D4AF37;
      letter-spacing: 0.5px;
    }

    /* Content Styling */
    h1.chapter-title {
      font-family: 'Amiri', serif;
      font-size: 20pt;
      color: #1A392A;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3mm;
    }
    .chapter-ornament {
      text-align: center;
      color: #C5A059;
      font-size: 14pt;
      margin-bottom: 5mm;
    }
    .infobox-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 3mm;
      margin-bottom: 6mm;
    }
    .info-card {
      background: #F9F7F2;
      border: 1px solid #E5DECF;
      border-radius: 6px;
      padding: 3.5mm 2.5mm;
      text-align: center;
    }
    .info-card.active {
      background: #EFF6F1;
      border-color: #2D6A4F;
    }
    .info-card .number {
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #2D6A4F;
      display: block;
      margin-bottom: 1mm;
    }
    .info-card .title {
      font-family: 'Cairo', sans-serif;
      font-size: 10.5pt;
      font-weight: 700;
      color: #1F2421;
    }
    .info-card .desc {
      font-family: 'Noto Naskh Arabic', serif;
      font-size: 8pt;
      color: #5C675B;
      margin-top: 1mm;
      line-height: 1.3;
    }
    
    /* Zikr Card Styling */
    .zikr-card {
      background: #FFFFFF;
      border: 1px solid #EBE6DB;
      border-right: 3.5px solid #2D6A4F;
      border-radius: 6px;
      padding: 4mm 5mm;
      margin-bottom: 4mm;
    }
    .zikr-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2mm;
    }
    .zikr-num {
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #2D6A4F;
      background: #E8F3EC;
      padding: 1px 7px;
      border-radius: 10px;
    }
    .zikr-repeat {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: #8C7853;
      background: #F8F4EB;
      padding: 1px 7px;
      border-radius: 10px;
    }
    .zikr-matn {
      font-family: 'Amiri Quran', 'Amiri', serif;
      font-size: 13.5pt;
      line-height: 2.2;
      color: #1A1F1D;
      text-align: justify;
      margin-bottom: 3mm;
    }
    .zikr-takhrij {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      color: #726245;
      background: #FAF8F3;
      padding: 1.5mm 3mm;
      border-radius: 4px;
      display: inline-block;
    }
    
    /* Linguistic / Gharib Al Hadith Callout Box */
    .vocab-box {
      background: #FDF9F2;
      border: 1px dashed #D6C29A;
      border-radius: 6px;
      padding: 3mm 4mm;
      margin-top: 2.5mm;
    }
    .vocab-title {
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      font-weight: 700;
      color: #9C7127;
      margin-bottom: 1.5mm;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .vocab-item {
      font-size: 8.5pt;
      color: #4A4031;
      line-height: 1.5;
      margin-bottom: 1mm;
    }
    .vocab-item strong {
      color: #1F2421;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page cover">
    <div>
      <div class="cover-badge">إصدار رقمي منقح وموثق • تطبيق أذكار</div>
      <h1 class="cover-title">دَلِيلُ الْمُعْتَمِرِ</h1>
      <div class="cover-subtitle">صفة العمرة خطوة بخطوة • ويليه المختار من صحيح الأدعية والأذكار</div>
      <div class="cover-divider"></div>
      
      <div class="cover-author-box">
        <div class="cover-author-label">اعتنى بجمعه وإعداده</div>
        <div class="cover-author-name">أبو محمد يوسف بن زبن الله بن محمد العطير</div>
      </div>

      <div class="cover-supervision">
        مراجع وموثق من 16 مصدراً فقهياً لكبار العلماء<br>
        بإشراف وكالة الرئاسة العامة لشؤون المسجد النبوي الشريف
      </div>

      <div class="cover-waqf">وقف لله تعالى • مهدى ولا يباع • متاح مجاناً للجميع</div>
    </div>
  </div>

  <!-- PAGE 2: DIAGRAMMATIC UMRAH STEPS (Replacing the scanned image with crisp vector design) -->
  <div class="page">
    <div>
      <div class="page-header">
        <span class="brand">تطبيق أذكار • سلسلة الإصدارات النافعة</span>
        <span>دليل المعتمر — صفة النسك</span>
      </div>

      <h1 class="chapter-title">أَرْكَانُ وَوَاجِبَاتُ العُمْرَةِ</h1>
      <div class="chapter-ornament">✤ ✤ ✤</div>

      <div style="font-family: 'Cairo', sans-serif; font-size: 9.5pt; font-weight: 700; color: #1B4D3E; margin-bottom: 2mm;">
        أولاً: أركان العمرة (ثلاثة لا تصح العمرة إلا بها)
      </div>

      <div class="infobox-grid">
        <div class="info-card active">
          <span class="number">الركن ①</span>
          <div class="title">الإِحْرَام</div>
          <div class="desc">وهو نية الدخول في النسك من الميقات المحدد.</div>
        </div>
        <div class="info-card active">
          <span class="number">الركن ②</span>
          <div class="title">الطَّوَاف</div>
          <div class="desc">سبعة أشواط حول الكعبة المشرفة ابتداءً من الحجر الأسود.</div>
        </div>
        <div class="info-card active">
          <span class="number">الركن ③</span>
          <div class="title">السَّعْي</div>
          <div class="desc">سبعة أشواط بين الصفا والمروة يبدأ بالصفا ويختم بالمروة.</div>
        </div>
      </div>

      <div style="font-family: 'Cairo', sans-serif; font-size: 9.5pt; font-weight: 700; color: #8A5A12; margin-top: 4mm; margin-bottom: 2mm;">
        ثانياً: واجبات العمرة (اثنان يجبان في النسك وجبرهما دم)
      </div>

      <div class="infobox-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="info-card">
          <span class="number" style="color: #8A5A12;">الواجب ①</span>
          <div class="title">الإحرام من الميقات</div>
          <div class="desc">الإحرام من الميقات المكاني لمن مرّ به، أو من الحل لأهل مكة.</div>
        </div>
        <div class="info-card">
          <span class="number" style="color: #8A5A12;">الواجب ②</span>
          <div class="title">الحلق أو التقصير</div>
          <div class="desc">الحلق لجميع شعر الرأس للرجل أو تقصيره، وتقصير قيد أنملة للمرأة.</div>
        </div>
      </div>

      <div class="zikr-card" style="margin-top: 5mm; border-right-color: #8A5A12;">
        <div class="zikr-card-header">
          <span class="zikr-num" style="background: #FDF3E3; color: #8A5A12;">تنبيه فقهي معتمد</span>
          <span class="zikr-repeat">المصدر: التحقيق والإيضاح للشيخ ابن باز</span>
        </div>
        <p style="font-size: 9.5pt; line-height: 1.7; color: #3A352B;">
          الركن لا يسقط بحال ولا يصح النسك بدونه، بينما الواجب إذا تركه المعتمر ناسياً أو عامداً يلزمه فدية (ذبح شاة في مكة توزع على فقرائها) وتصح عمرته، والسنة من أتى بها أُجر ومن تركها فعمرته تامة صحيحة.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>مستند لـ 16 مرجعاً فقهياً معتمداً</span>
      <span>الصفحة 5</span>
    </div>
  </div>

  <!-- PAGE 3: SAMPLE FROM AL-WIRD AN-NABAWI (WITH VOCABULARY AND TASHKEEL) -->
  <div class="page">
    <div>
      <div class="page-header">
        <span class="brand">الوردُ النبويُّ الصغير • الشيخ د. علي العويشز</span>
        <span>أذكار النوم وما يلحق به</span>
      </div>

      <h1 class="chapter-title">مِنْ أَدْعِيَةِ وَأَذْكَارِ الصَّلَاةِ</h1>
      <div class="chapter-ornament">✤ ✤ ✤</div>

      <!-- Zikr 1 -->
      <div class="zikr-card">
        <div class="zikr-card-header">
          <span class="zikr-num">الدعاء للميت في الصلاة عليه</span>
          <span class="zikr-repeat">رقم الحديث: 1</span>
        </div>
        <div class="zikr-matn">
          «اللَّهُمَّ اغْفِرْ لَهُ، وَارْحَمْهُ، وَعَافِهِ، وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الْأَبْيَضَ مِنَ الدَّنَسِ»
        </div>
        <div class="zikr-takhrij">
          📚 رواه مسلم في صحيحه (رقم 963) من حديث عوف بن مالك رضي الله عنه.
        </div>
        
        <!-- Vocabulary / Gharib Callout -->
        <div class="vocab-box">
          <div class="vocab-title">
            <span>📖</span>
            <span>بَيَانُ غَرِيبِ الكَلِمَاتِ وَمَعَانِيهَا (من تحقيق د. علي العويشز):</span>
          </div>
          <div class="vocab-item">
            • <strong>أَكْرِمْ نُزُلَهُ:</strong> النُّزُل هو ما يُعَدُّ للضّيف إكراماً له، والمعنى: أحسن ضيافته وجزيل ثوابه عندك.
          </div>
          <div class="vocab-item">
            • <strong>وَسِّعْ مُدْخَلَهُ:</strong> أي اجعل مواضع دخوله واسعة رحبة، كقبره ومنازله الأخروية في الجنان.
          </div>
        </div>
      </div>

      <!-- Zikr 2 -->
      <div class="zikr-card">
        <div class="zikr-card-header">
          <span class="zikr-num">دعاء الزيارة والسلام على أهل القبور</span>
          <span class="zikr-repeat">رقم الحديث: 2</span>
        </div>
        <div class="zikr-matn">
          «السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللهُ بِكُمْ لَاحِقُونَ، أَنْتُمْ لَنَا فَرَطٌ، وَنَحْنُ لَكُمْ تَبَعٌ، أَسْأَلُ اللهَ لَنَا وَلَكُمُ الْعَافِيَةَ»
        </div>
        <div class="zikr-takhrij">
          📚 أخرجه مسلم من حديث عائشة رضي الله عنها، وزيادة (أَنْتُمْ لَنَا فَرَطٌ) عند أحمد والنسائي بإسناد صحيح.
        </div>
        <div class="vocab-box">
          <div class="vocab-item">
            • <strong>فَرَطٌ:</strong> أي متقدّمون وسابقون لنا إلى الدار الآخرة، ونحن قادمون على إثركم.
          </div>
        </div>
      </div>

    </div>

    <div class="page-footer">
      <span>فهرسة مكتبة الملك فهد الوطنية: ردمك 978-603-04-8666-3</span>
      <span>الصفحة 128</span>
    </div>
  </div>

</body>
</html>
`;

async function main() {
  console.log("Launching Chromium via Playwright...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  // Wait for Google Fonts to be rendered
  await page.evaluateHandle("globalThis.document.fonts.ready");

  const pdfPath = path.join(outputDir, "specimen_improved_booklets.pdf");
  await page.pdf({
    path: pdfPath,
    format: "A5",
    printBackground: true,
    margin: {
      top: "0",
      bottom: "0",
      left: "0",
      right: "0",
    },
  });
  console.log(`Generated sample PDF at: ${pdfPath}`);

  // Take screenshots of each page to show the user visual proof!
  const pageElements = await page.$$(".page");
  console.log(`Found ${pageElements.length} pages. Generating image previews...`);

  for (let i = 0; i < pageElements.length; i++) {
    const imgPath = path.join(outputDir, `specimen_page_${i + 1}.png`);
    await pageElements[i].screenshot({ path: imgPath });
    console.log(`Saved preview image: ${imgPath}`);
  }

  await browser.close();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
