import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
export function sourceReviewHtml() {
  const source = JSON.parse(
    fs.readFileSync(path.join(root, "docs/learning/source-editions/umrah-full-source.ar.json"), "utf8"),
  );
  const fonts = JSON.parse(fs.readFileSync(path.join(root, "docs/external-sources/fonts_base64.json"), "utf8"));
  const words = new Map();
  for (const file of fs.readdirSync(path.join(root, "public/data/mushaf")))
    for (const verse of JSON.parse(fs.readFileSync(path.join(root, "public/data/mushaf", file), "utf8")))
      words.set(
        verse.k,
        verse.w.filter((word) => !word[2]),
      );
  const reviewed = source.pages.filter((page) => page.status === "source-image-compared");
  const blockHtml = (block) => {
    if (block.type === "paragraph") return `<p>${escape(block.text)}</p>`;
    if (block.type === "footnote") return `<aside class="source-footnote"><p>${escape(block.text)}</p></aside>`;
    if (block.type === "heading") return `<h3>${escape(block.text)}</h3>`;
    if (block.type === "list") return `<ol>${block.items.map((item) => `<li>${escape(item)}</li>`).join("")}</ol>`;
    if (block.type === "source-diagram")
      return `<figure class="source-labels"><figcaption>تسميات الرسم في المصدر</figcaption><ul>${block.labels.map((label) => `<li>${escape(label)}</li>`).join("")}</ul></figure>`;
    if (block.type === "quran") {
      const text = block.ranges
        .map(([key, start, end]) => {
          const selected = words.get(key)?.filter(([position]) => position >= start && position <= end);
          if (selected?.length !== end - start + 1) throw new Error(`Incomplete source quotation ${key}`);
          return selected.map((word) => word[3]).join(" ");
        })
        .join(" ");
      return `<p class="quran">﴿${escape(text)}﴾</p>`;
    }
    throw new Error(`Unknown source block ${block.type}`);
  };
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دليل المعتمر — مراجعة استعادة الأصل</title><style>
@font-face{font-family:Book;src:url(data:font/woff2;base64,${fonts.plex400}) format('woff2');font-weight:400}@font-face{font-family:Book;src:url(data:font/woff2;base64,${fonts.plex700}) format('woff2');font-weight:700}@font-face{font-family:Quran;src:url(data:font/woff2;base64,${fonts.amiri}) format('woff2')}
*{box-sizing:border-box}html{scroll-padding-block-start:1rem}body{margin:0;background:#efede8;color:#20211e;font:1.125rem/1.95 Book,sans-serif}.review-head,main{width:min(100% - 2rem,54rem);margin-inline:auto}.review-head{padding-block:1.5rem}.review-head p{margin:.25rem 0;color:#53584f}.review-head h1{font-size:1.55rem;margin:0}.review-state{display:block;padding:.75rem 1rem;background:#f0eade;border:1px solid #b9b5a9;border-radius:1rem}.source-unit{background:#fbf9f5;padding:clamp(1rem,4vw,2.5rem);margin-block:0 1.5rem;border:1px solid #b9b5a9;border-radius:1.25rem}.source-unit>header{border-block-end:1px solid #b9b5a9;padding-block-end:.75rem;margin-block-end:1.5rem}.source-unit h2{font-size:1.35rem;margin:.25rem 0}.source-unit h3{font-size:1.15em}.source-unit p{margin-block:.75em;overflow-wrap:anywhere}.source-unit ol,.source-unit ul{padding-inline-start:1.5rem}.source-unit li{margin-block:.5rem}.source-page{color:#53584f;font-size:.85em}.quran{font-family:Quran,serif;font-size:1.5em;line-height:2.2;padding:.75rem;background:#f0eade;border-radius:.75rem}.source-labels{margin:1rem 0;padding:1rem;border:1px solid #b9b5a9;border-radius:.75rem}a{display:inline-flex;min-height:44px;align-items:center;color:#72510b;text-underline-offset:.2em}a:focus-visible{outline:3px solid #72510b;outline-offset:4px}@media print{body{background:white}.review-head{break-after:page}.source-unit{break-after:page;border:0;margin:0;padding:1rem}.quran{background:white}}
</style></head><body><header class="review-head"><h1>دليل المعتمر · استعادة النص الكامل</h1><p class="review-state">نسخة مراجعة محلية غير مكتملة: ${reviewed.length} من ١٣٨ صفحة قورنت بصور المصدر. لا تمثل نشرًا أو اعتمادًا مستقلًا.</p><p>النص العربي قابل للتحديد والتكبير وإعادة التدفق. صفحات لم تُراجع بعد لا تُعرض كنص مكتمل.</p><a href="#p-8">انتقل إلى مقدمة الجامع</a></header><main>${reviewed.map((page) => `<article class="source-unit" id="${page.unitId}" data-source-page="${page.page}"><header><span class="source-page">صفحة ملف المصدر ${page.page}</span><h2>${escape(page.title)}</h2></header>${page.blocks.map(blockHtml).join("")}</article>`).join("")}</main></body></html>`;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const folder = path.join(root, "output/books-audio-review-20261127/full-source-review");
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "umrah-restored-review.html"), sourceReviewHtml());
  console.log("Rendered source-compared pages only; incomplete local review, not an activated edition.");
}
