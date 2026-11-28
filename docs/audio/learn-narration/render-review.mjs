/** Render the held authoring draft; no network, synthesis, upload or app mutation. */
import { readFileSync, writeFileSync } from "node:fs";
import { URL } from "node:url";
import process from "node:process";

const data = JSON.parse(readFileSync(new URL("./script-draft.ar.json", import.meta.url), "utf8"));
if (data.generationAllowed || data.uploadAllowed || data.appIntegrationAllowed) {
  throw new Error("This renderer is limited to the held script-review checkpoint");
}
const clips = new Map(data.clips.map((item) => [item.id, item]));
const sources = new Map(data.sources.map((item) => [item.id, item]));
const link = (id) => {
  const source = sources.get(id);
  if (!source) throw new Error(`Unknown source: ${id}`);
  return `[${source.title}](${source.url})`;
};
const references = (ids) => `المصادر: ${ids.map(link).join("؛ ")}.`;
const quoted = (text) => text.split("\n").map((line) => `> ${line}`);
const ar = (value) => new Intl.NumberFormat("ar-EG", { useGrouping: false }).format(value);
const review = [
  "# تعلّم الوضوء والصلاة — النص العربي المقترح",
  "",
  `**نسخة المراجعة ${ar(data.revision)} — ٢٧ نوفمبر ٢٠٢٦.** لم تُنتج تسجيلات ولم تُرفع ملفات صوتية.`,
  "",
  "هذا الملف يضم ما سيُسمع في الدرس: شرح الخطوات، والأذكار، وتعليمات التدريب. شرح الأفعال مبسّط من المصادر، وليس اقتباسًا من الحديث. أمّا نصوص الأذكار والآيات فتبقى مستقلة عنه كما هي. ترد ملاحظات الأدلة والإعداد في [ملف مستقل](REVIEW_NOTES.ar.md).",
  "",
  "نبدأ بتعلّم الوضوء، ثم صلاة المنفرد القادر على القيام، بمثال من ركعتين. بعد ذلك نتعلّم إكمال ثلاث ركعات أو أربع. توجد هيئات وصيغ صحيحة أخرى؛ اختيار إحداها للشرح لا يعني رفض الباقي.",
  "",
  "المقاطع قصيرة، ويمكن إيقافها وإعادتها. تبقى النصوص مقروءة، ويمكن التعلّم دون صوت. لجميع الشخصيات هيئة بلا أعين ظاهرة، وفق اختيار المالك.",
  "",
  "## الوضوء",
  "",
];
for (const module of ["wudu", "prayer"]) {
  if (module === "prayer") review.push("## الصلاة", "");
  for (const stage of data.stages.filter((item) => item.module === module)) {
    const clip = clips.get(stage.explanationClipId);
    review.push(
      `### ${stage.title}`,
      "",
      `<a id="${stage.id}"></a>`,
      "",
      ...quoted(clip.spokenText),
      "",
      references(clip.sourceIds),
      "",
    );
    if (stage.additionalClipIds.length) {
      review.push(
        `**ما نقوله أو نقرؤه:** ${stage.additionalClipIds.map((id) => `[${clips.get(id).title}](#${id})`).join("؛ ")}.`,
        "",
      );
    }
  }
}
review.push(
  "## الأذكار والتلاوة",
  "",
  "تُسمع الأذكار منفصلة عن الشرح، دون إضافة تعليمات داخل ألفاظها. والتلاوة من تسجيل قارئ مراجع، لا من توليد الكلام.",
  "",
);
for (const clip of data.clips.filter((item) => ["devotional-wording", "quran-recitation"].includes(item.role))) {
  review.push(`<a id="${clip.id}"></a>`, "", `### ${clip.title}`, "", ...quoted(clip.spokenText), "");
  if (clip.sourceIds.length) review.push(references(clip.sourceIds), "");
  if (clip.comparisonToExistingContent)
    review.push("هذه رواية مقترحة للدرس، مع بقاء نص التطبيق دون تعديل. [تفصيل المقارنة](REVIEW_NOTES.ar.md#r1).", "");
  if (clip.role === "quran-recitation")
    review.push(`الآيات: ${clip.verseReference}. تُختار لها تلاوة قارئ مراجع قبل إعداد الصوت.`, "");
}
review.push(
  "## تعليمات التدريب والتشجيع",
  "",
  "هذه مقاطع مساعدة أثناء التعلّم، وليست من ألفاظ العبادة. يوضح التعليق سبب الإجابة، ويتيح المحاولة مرة أخرى.",
  "",
);
for (const clip of data.clips.filter((item) => ["interaction", "feedback"].includes(item.role))) {
  review.push(`### ${clip.title}`, "", ...quoted(clip.spokenText), "");
  if (clip.sourceIds.length) review.push(references(clip.sourceIds), "");
}
review.push(
  "## الخطوة التالية",
  "",
  "تُراجع هذه الصياغة والملاحظات المرتبطة بها قبل توليد الصوت. لم تُعتمد التسجيلات أو تُفعّل في التطبيق بعد.",
  "",
);

const notes = [
  "# توثيق الأدلة وملاحظات إعداد الدرس",
  "",
  "**ملاحظات لفريق المحتوى والإنتاج، وليست جزءًا من التسجيل الصوتي.**",
  "",
  "النص المنطوق موجود في [نسخة المراجعة](SCRIPT_REVIEW.ar.md). هذا الملف يبين ما يسند الشرح، وما يحتاج إلى اختيار أو مراجعة قبل الإنتاج. التحقق من الإحالات لا يُعد اعتمادًا شرعيًا مستقلًا أو مراجعة للنطق.",
  "",
  "## أسلوب الصياغة",
  "",
  ...Object.values(data.editorialPolicy).map((item) => `- ${item}`),
  "",
  "## الاستنشاق وتنبيه الصائم",
  "",
];
for (const evidence of data.evidenceHighlights) {
  notes.push(`> ${evidence.quote}`, "", references(evidence.sourceIds), "", evidence.explanationNotSpoken, "");
}
notes.push(
  "المبالغة لغير الصائم هي الصفة الواردة في الحديث. وبيان معناها يُؤخذ من الشرح الفقهي، دون تحويلها إلى توجيه باستعمال العنف، ودون حذف استثناء الصائم. لذلك صار التنبيه جزءًا من شرح الخطوة نفسها.",
  "",
  "## المضمضة والاستنشاق في العرض المتصل",
  "",
);
for (const group of data.sequenceGroups) notes.push(group.explanationNotSpoken, "", references(group.sourceIds), "");
notes.push("## اختيارات ومراجعات قبل الإنتاج", "");
for (const issue of data.reviewIssues)
  notes.push(`<a id="${issue.id.toLowerCase()}"></a>`, "", `### ${issue.id}: ${issue.title}`, "", issue.detail, "");
notes.push("## توثيق كل خطوة وتوجيه عرضها", "");
for (const stage of data.stages) {
  const clip = clips.get(stage.explanationClipId);
  notes.push(
    `### ${stage.id}: ${stage.title}`,
    "",
    `**ما يستند إليه الشرح:** ${stage.evidenceNoteNotSpoken}`,
    "",
    references(clip.sourceIds),
    "",
    `**لإعداد المشهد:** ${stage.visualDirectionNotSpoken}`,
    "",
    `**ملاحظة المحتوى:** ${stage.reviewerNoteNotSpoken}`,
    "",
  );
}
notes.push(
  "## سجل النصوص المأثورة",
  "",
  "تُحسب البصمة من النص المرسل كما هو. يحافظ التحقق على نصوص التطبيق المستعملة حرفيًا، وعلى اختلاف النسخة الجديدة الموثّق بدل إعادة استعمال هويتها القديمة.",
  "",
);
for (const clip of data.clips.filter(
  (item) => item.existingContent || item.comparisonToExistingContent || item.role === "quran-recitation",
)) {
  notes.push(`### ${clip.id}`, "");
  if (clip.existingContent)
    notes.push(
      `مرجع التطبيق: \`${clip.existingContent.file}\`، المعرّف \`${clip.existingContent.id}\`. النص مطابق حرفيًا. التكرار في بيانات المصدر: ${ar(clip.existingContent.existingRepetitionCount)}؛ ويحافظ التسجيل على نصه مرة دون إضافة تكرار مصطنع.`,
      "",
    );
  if (clip.comparisonToExistingContent)
    notes.push(
      `نسخة درس مستقلة عن \`${clip.comparisonToExistingContent.id}\`: «من الخطايا» بدل «من خطاياي» في الجملة الثانية. لم يتغير الأصل. تُراجع R1 قبل التوليد.`,
      "",
    );
  if (clip.role === "quran-recitation")
    notes.push(
      `المصدر المحلي: \`${clip.sourceFile}\`؛ ${clip.verseReference}. محفوظ من بيانات المصحف دون تحويله إلى طلب HeyGen.`,
      "",
    );
  notes.push(`بصمة النص: \`${clip.transcriptSha256}\`.`, "");
}
notes.push("## المصادر", "");
for (const source of data.sources) {
  notes.push(
    `- ${link(source.id)} — \`${source.id}\`، ${source.kind}. اطلع على المرجع في ${source.consultedAt}.${source.gradingNote ? ` ${source.gradingNote}` : ""}${source.editorialNote ? ` ${source.editorialNote}` : ""}`,
  );
}
notes.push(
  "",
  "## الإنتاج وحالة العمل",
  "",
  `عدد المقاطع المقترحة: ${ar(data.inventory.clips)}، منها ${ar(data.inventory.heygenClipsAfterApproval)} مقطعًا لـ HeyGen بعد الموافقة، وموضعان لتلاوة قارئ. عدد المراحل والملاحظات: ${ar(data.inventory.stages)}. لم يُنتج أو يُرفع أي ملف صوتي.`,
  "",
  "- الشرح والأذكار مقاطع مستقلة. يبقى اختيار صوت فعلي مناسب ومراجعة النطق بعد التوليد مطلوبين.",
  "- لا تُقرأ أسماء الملفات، أو الإحالات، أو ملاحظات المشهد، أو سجل المراجعة في الصوت.",
  "- يُحفظ الأصل الصوتي، والنص المرسل، وبيانات الصوت والنموذج، والمدة الحقيقية، وبصمة الملف. توقيت الكلمات لا يُخمن من المدة.",
  "- لا مفاتيح سرية في هذه الملفات. لم تُستخدم مفاتيح HeyGen ولم يُطلب توليد أو رفع. لا يُستعمل تبديل المفاتيح لتجاوز حدود الخدمة.",
  "- إعداد R2 المحلي موجود، لكن صلاحية الرفع لم تُختبر. الرفع اللاحق، بعد الموافقة، إلى مسارات جديدة مرتبطة ببصمة الملف، مع فحص البايتات والنوع وCORS وطلبات النطاق، ودون استبدال ملفات موجودة.",
  "- لا تعديل لواجهة التطبيق أو نصوصه المأثورة أو بيانات المستخدم، ولا commit أو push أو نشر في هذا العمل.",
  "- التفعيل داخل التطبيق خطوة مستقلة بعد مراجعة النص والصوت. إكمال تدريب لا يثبت أداء الصلاة أو صحة أدائها.",
  "",
  "لتحديث الوثيقتين من المسودة المنظمة: `node docs/audio/learn-narration/render-review.mjs`، ثم تنسيق الملفات وفحصها. لا يُعاد تشغيل مولّد النسخة الأولى الموجود في `.cache` لأنه لا يتضمن تعديلات المالك اللاحقة.",
  "",
);
writeFileSync(new URL("./SCRIPT_REVIEW.ar.md", import.meta.url), `${review.join("\n").trimEnd()}\n`);
writeFileSync(new URL("./REVIEW_NOTES.ar.md", import.meta.url), `${notes.join("\n").trimEnd()}\n`);
process.stdout.write(
  `Rendered Arabic script review and separate evidence/production notes for revision ${data.revision}.\n`,
);
