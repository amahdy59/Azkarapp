# External Devotional Resources Inventory & Documentation

## Document export finish - 2026-11-25

The three generators now share `book-presentation.mjs` and `book-presentation.css`. Each produces a tagged Arabic PDF with real bookmarks and resolved internal links, plus a self-contained responsive HTML companion with embedded fonts/images, keyboard focus, a contents shortcut, a sibling PDF download and reading-size controls from 100% to 200%. These are standalone documents, not a deployed in-app library.

The source pagination remains the contents index: larger type may add a continuation sheet marked with the same source page. Current PDF lengths are **73 / 18 / 138** pages for al-Mukhtar / Umrah / al-Wird, identically across light, dark and navy. The printed original is still identified separately below.

Build with Node/pnpm from the repository and a Python interpreter containing `pypdf`. Set `BOOK_PYTHON` to that interpreter if `python` is not on PATH; the Codex bundled Python already provides pypdf.

```powershell
node docs/external-sources/generate_book1_al_mukhtar.mjs
node docs/external-sources/generate_book2_dalil_al_mutamir.mjs
node docs/external-sources/generate_book3_al_wird_an_nabawi.mjs
pnpm test:run --project tooling scripts/devotional-documents.test.mjs
node docs/external-sources/verify-books.mjs
python docs/external-sources/verify-book-pdfs.py
```

Each export repairs combined Arabic marks in the PDF's Unicode map, without changing its painted glyphs or source wording. Font synthesis is disabled so a synthetic bold face cannot become an inaccessible Type 3 text fallback. Generation fails on incomplete source ranges, missing excerpt text, broken fragment targets or content that cannot fit a sheet at the selected reading size. HTML is formatted with the existing repository Prettier configuration.

`book-content.mjs` records 19 source-identified Quran excerpts restored on al-Mukhtar source pages 32-35, where earlier extraction omitted passages and mismatched several numbered items. The printed source was visually compared; the restored words are copied unchanged from the existing reviewed Mushaf assets, with explicit verse/word ranges. The raw extraction JSON is preserved. This is source comparison by a coding agent, not independent scholarly approval of these external publications.

Wird repetition/virtue notes quote exact existing text, retaining alternatives and time conditions. The old keyword summaries are removed from the active generators: a tenfold reward is not a ten-repeat instruction, and thirty-four is not four. Some passages still inherit transcription/order issues from the previous external-source extraction; this phase does not certify the whole corpus. Independent content and real Arabic screen-reader review remain required before presenting these drafts as fully reviewed publications.

The old `apply_*`, `fix_*`, `update_*` and inspection snippets are historical authoring utilities, **not build steps**. Do not rerun the old string patchers over the finished generators. See [the controlled phase](../agent/phases/DEVOTIONAL_DOCUMENT_FINISH_2026_11_25.md) and [the report](../agent/reports/DEVOTIONAL_DOCUMENT_FINISH_2026_11_25_REPORT.md) for verification and limits.

**فهرس وتوثيق المراجع والكتيبات المأخوذة للدراسة والتطوير**

تم تحميل هذه المراجع وتوثيقها بصيغة Markdown لحفظ النصوص، وسلاسل العزو، والتخريج، وأسماء المؤلفين والكتب لاستخدامها في التخطيط المستقبلي لتطوير تطبيق «أذكار» (Azkarapp).

---

## 1. المرجع الأول: كتيب «المختار من صحيح الأدعية والأذكار»

- **العنوان**: المختار من صحيح الأدعية والأذكار
- **اعتنى بجمعه**: أبو محمد يوسف بن زبن الله بن محمد العطير
- **الطبعة**: الطبعة الثانية عشرة (توزيع مجاني - وقف لله تعالى)
- **الرابط المصدر**: `https://qr1.me-qr.com/mobile/pdf/1b74ccf0-041a-4757-8c49-c61541a568b6`
- **الملف المفرغ**: [`al_mukhtar_extracted.md`](./al_mukhtar_extracted.md)
- **المواصفات الفنية**: 64 صفحة، نصوص رقمية بالكامل (Vector Text).
- **أبرز المحتويات**:
  - الترغيب في الدعاء وآدابه وشروطه.
  - حمد الله والثناء عليه والصلاة على النبي ﷺ.
  - أذكار الصباح والمساء، أذكار النوم والاستيقاظ.
  - أدعية الاستفتاح، الركوع، الرفع من الركوع، السجود، الجلسة بين السجدتين، التشهد، وما بعد الصلاة.
  - أدعية الكرب والهم، الاستخارة، الريح، الرعد، السفر، وأدعية متفرقة.
  - **طريقة التوثيق**: كل ذكر متبوع بتخريجه مباشرة بين معقوفين (مثل: `[البخاري ومسلم]`، `[البخاري]`، `[مسلم]`، `[أبو داود وغيره، بإسناد صحيح]`).

---

## 2. المرجع الثاني: كتاب «دليل المعتمر»

- **العنوان**: دليل المعتمر (ويليه: المختار من صحيح الأدعية والأذكار)
- **اعتنى بجمعه**: أبو محمد يوسف بن زبن الله بن محمد العطير
- **الإشراف والجهة**: وكالة الرئاسة العامة لشؤون المسجد النبوي (مهدى ولا يباع)
- **الرابط المصدر**: `https://cdn.qr-code-generator.com/account2434719/3096527_1.pdf`
- **المواصفات الفنية**: 138 صفحة، مصمم بنظام بطاقات/لوحات ملونة عبر Photoshop CS5.
- **علاقته بالمرجع الأول**: قسم الأدعية والأذكار الوارد فيه (ص 53 إلى ص 117) هو **نفسه تماماً** محتوى كتيب «المختار» المفرغ نصياً في المرجع الأول أعلاه.
- **أقسام الكتاب**:
  1. **صفة العمرة (خطوة خطوة)**: أركان العمرة الثلاثة، واجبات العمرة، سنن العمرة، محظورات الإحرام، مع مخططات ورسومات بيانية واضحة.
  2. **أخطاء شائعة يقع فيها بعض المعتمرين**: في الإحرام، الطواف، السعي، والحلق أو التقصير.
  3. **فضل المدينة المنورة وآداب الزيارة**: آداب زيارة المسجد النبوي، السلام على النبي ﷺ وصاحبيه، زيارة مسجد قباء والبقيع وشهداء أحد.
  4. **المختار من صحيح الأدعية والأذكار**: جوامع الدعاء والأذكار المأثورة.
  5. **نصائح وتوجيهات للمعتمرين والزوار**.
- **المصادر المعتمدة الموثقة في الكتاب (صفحة 3)**:
  1. «التحقيق والإيضاح» لسماحة الشيخ عبد العزيز بن عبد الله بن باز رحمه الله.
  2. «مجموع فتاوى ومقالات متنوعة» للشيخ ابن باز.
  3. «المنهج لمريد العمرة والحج» لفضيلة الشيخ محمد بن صالح العثيمين رحمه الله.
  4. «أخطاء يرتكبها بعض الحجاج» للشيخ ابن عثيمين.
  5. «جلسات الحج» للشيخ ابن عثيمين.
  6. «مجموع فتاوى ورسائل» للشيخ ابن عثيمين.
  7. «فقه العبادات» للشيخ ابن عثيمين.
  8. «فضل المدينة وآداب سكناها وزيارتها» للشيخ العلامة عبد المحسن بن حمد العباد البدر.
  9. «أدعية وأذكار من الكتاب والسنة الصحيحة» للشيخ عبد المحسن العباد.
  10. «صحيح الترغيب والترهيب» للمحدث العلامة محمد ناصر الدين الألباني رحمه الله.
  11. «شرح السنة» للإمام الحسين بن مسعود البغوي رحمه الله.
  12. «الإفصاح شرح التحقيق والإيضاح» للشيخ العلامة عبد الله بن عبد الرحمن الجبرين رحمه الله.
  13. «دروس عقدية مستفادة من الحج» للشيخ د. عبد الرزاق بن عبد المحسن البدر.
  14. «الدعاء من الكتاب والسنة» للشيخ د. سعيد بن علي القحطاني رحمه الله.
  15. «آداب زيارة المسجد النبوي الشريف» إعداد وكالة الرئاسة العامة لشؤون المسجد النبوي.
  16. «صفة العمرة، ويليه من جوامع الدعاء» إعداد إدارة شؤون المصاحف بالمسجد الحرام.

---

## 3. المرجع الثالث: كتاب «الوردُ النَّبَوِيُّ (الصغير)»

- **العنوان**: الوردُ النَّبَوِيُّ (النسخة الصغرى - طبعة ١٤٤٦هـ)
- **المؤلف**: فضيلة الشيخ د. علي بن عبد الرحمن بن عبد الله العويشز
- **الطبعة**: الطبعة الثانية 1446هـ (فهرسة مكتبة الملك فهد الوطنية: ردمك `978-603-04-8666-3`، رقم الإيداع `1445/11446`).
- **الموقع والمصدر**: موقع الشيخ د. علي العويشز `https://alialowashez.com/9007/`
- **الملف المفرغ**: [`al_wird_an_nabawi_extracted.md`](./al_wird_an_nabawi_extracted.md)
- **المواصفات الفنية**: 137 صفحة، نصوص رقمية واضحة ومشكولة بالكامل (134 صفحة نصية).
- **القيمة العلمية المضافة للتطبيق**:
  - **مقدمة تأصيلية رصينة**: فضل الذكر من القرآن والسنة، شروطه، منزلته، وجزاء الذاكرين والذاكرات.
  - **تخريج دقيق للروايات**: يذكر الأئمة المخرجين للحديث (البخاري، مسلم، الترمذي، النسائي، أبو داود، أحمد، ابن ماجه، الحاكم...) وحكم الرواية واختلاف الألفاظ بين الروايات.
  - **شرح غريب الحديث والمفردات**: ميزة فريدة جداً لا توجد في التطبيقات المنافسة؛ يشرح معاني الكلمات النبوية الصعبة مثل:
    - _«أكرم نُزُلَه»_: النزل ما يعد للضيف.
    - _«فرط»_: متقدمون وسابقون.
    - _«لا تنيا»_: لا تبطئا ولا تضعفا.
    - _«وسّع مدخله»_: مواضع دخوله كقبره ومنازله الأخروية.
