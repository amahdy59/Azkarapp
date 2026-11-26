import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { JSDOM } from "jsdom";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BookOpen, Info, Repeat, Download } from "../src/app/components/icons.ts";
import { publicationAssets } from "./publication-assets.mjs";

const root = path.resolve(import.meta.dirname, "..");
export const SAMPLE_OUTPUT = path.join(root, "output/pdf/english-book-samples-2026-11-25");
export const clean = (value) => value.replace(/\s+/gu, " ").trim();
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
const icon = (Component) =>
  renderToStaticMarkup(React.createElement(Component, { size: 20, "aria-hidden": true, focusable: false }));

export function exactExcerpt(text, start, end) {
  const first = text.indexOf(start);
  const last = text.indexOf(end, first);
  if (first < 0 || last < first || text.indexOf(start, first + 1) !== -1)
    throw new Error(`Ambiguous/missing excerpt: ${start}`);
  return text.slice(first, last + end.length);
}

export async function resolveEnglishSamples() {
  const config = JSON.parse(await fs.readFile(path.join(root, "docs/learning/english-samples.json"), "utf8"));
  if (config.status !== "draft-for-review")
    throw new Error("Sample publication requires explicit reviewed status handling");
  const samples = [];
  for (const sample of config.samples) {
    const sourcePath = `docs/external-sources/${sample.folder}/${sample.file}_light.html`;
    const bytes = await fs.readFile(path.join(root, sourcePath));
    const document = new JSDOM(bytes.toString("utf8")).window.document;
    const sections = [];
    for (const section of sample.sections) {
      const matches = document.querySelectorAll(section.selector);
      if (matches.length !== 1) throw new Error(`Expected one source for ${sample.id}/${section.id}`);
      const element = matches[0];
      const sourceArabic = clean(element.textContent);
      const quotes = [...sourceArabic.matchAll(/﴿([^﴿﴾]+)﴾/gu)].flatMap((match) => match[1].split("❖").map(clean));
      if (section.quran && quotes.length !== section.quran.length && !section.quran.some((quote) => quote.arabicStart))
        throw new Error(`Unpaired Qur'an: ${sample.id}/${section.id}`);
      const pairs = [];
      for (const [index, quote] of (section.quran || []).entries()) {
        const [surah, ayah] = quote.ref.split(":");
        const translationPath = `public/data/translations/en/${surah}.json`;
        const translationBytes = await fs.readFile(path.join(root, translationPath));
        const fullEnglish = JSON.parse(translationBytes)[ayah];
        if (typeof fullEnglish !== "string" || !fullEnglish.trim())
          throw new Error(`Missing English verse ${quote.ref}`);
        const arabic = quote.arabicStart
          ? exactExcerpt(sourceArabic, quote.arabicStart, quote.arabicEnd)
          : quotes[index];
        if (!arabic || !/[\u0600-\u06ff]/u.test(arabic)) throw new Error("Missing source Arabic Qur'an");
        pairs.push({
          ...quote,
          arabic,
          english: quote.mode === "excerpt" ? exactExcerpt(fullEnglish, quote.start, quote.end) : fullEnglish,
          fullEnglish,
          translator: config.quranTranslation,
          translationPath,
          translationSha256: hash(translationBytes),
          sourceUrl: `https://quran.com/${surah}/${ayah}`,
        });
      }
      sections.push({ ...section, sourceArabic, sourceTextSha256: hash(sourceArabic), pairs });
    }
    const image = sample.imageSelector ? document.querySelector(sample.imageSelector)?.getAttribute("src") : undefined;
    samples.push({ ...sample, sourcePath, sourceSha256: hash(bytes), sections, image });
  }
  return samples;
}

function pairMarkup(pair) {
  const label = pair.opening ? "Surah opening verse" : pair.mode === "excerpt" ? "Qur'anic excerpt" : "Qur'anic verse";
  return `<section class="quran-pair" data-quran-ref="${pair.ref}" aria-label="${label} ${pair.ref}">
    <div class="pair-reference"><span>${label}</span><a href="${pair.sourceUrl}">Qur'an ${pair.ref}</a></div>
    <p class="quran-arabic" lang="ar" dir="rtl">${escape(pair.arabic)}</p>
    <div class="meaning"><p class="label">English translation of meaning${pair.mode === "excerpt" ? " · corresponding excerpt" : ""}</p><p lang="en" dir="ltr">${escape(pair.english)}</p><p class="translator">${escape(pair.translator)}</p></div>
  </section>`;
}

export async function sampleHtml(sample) {
  const styles = await publicationAssets("samples");
  const sections = sample.sections
    .map(
      (section) => `<section class="sample-section" aria-labelledby="${section.id}">
    <h2 id="${section.id}">${section.number ? `<span class="number">${escape(section.number)}</span>` : ""}${escape(section.title)}</h2>
    ${section.english ? `<p class="english-body">${escape(section.english).replace("Prophet ﷺ", '<span class="prophet-name">Prophet <span lang="ar" aria-label="peace and blessings be upon him">ﷺ</span></span>')}</p>` : ""}
    ${section.arabicPhrase ? `<p class="arabic-phrase" lang="ar" dir="rtl">${escape(section.arabicPhrase)}</p>` : ""}
    ${section.note ? `<aside class="context">${icon(Info)}<p>${escape(section.note)}</p></aside>` : ""}
    ${section.pairs.map(pairMarkup).join("")}
    ${section.repetition ? `<aside class="context repetition">${icon(Repeat)}<p>${escape(section.repetition)}</p></aside>` : ""}
  </section>`,
    )
    .join("");
  const html = `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>${escape(sample.title)} · English review sample</title><style>${styles}</style></head><body>
  <a class="skip-link" href="#reading">Skip to reading</a>
  <div class="reader-tools" aria-label="Reading controls"><a class="download" href="${sample.id}-english-sample.pdf" download>${icon(Download)}Download sample PDF</a><div class="size-controls"><button type="button" data-size="minus" aria-label="Decrease reading text size">A−</button><output id="size-value" aria-live="polite">100%</output><button type="button" data-size="plus" aria-label="Increase reading text size">A+</button></div><fieldset><legend>Appearance</legend>${["light", "dark", "navy"].map((theme) => `<label><input type="radio" name="theme" value="${theme}"${theme === "light" ? " checked" : ""}>${theme[0].toUpperCase() + theme.slice(1)}</label>`).join("")}</fieldset></div>
  <main id="reading" tabindex="-1"><header class="publication-header"><div class="eyebrow">${icon(BookOpen)}English review sample · ${sample.sourcePage}</div><h1>${escape(sample.title)}</h1><p class="subtitle">${escape(sample.subtitle)}</p><p class="author">${escape(sample.author)}</p><p class="draft-notice">Draft translation for review. This sample is not a complete English edition.</p></header>
  <nav class="sample-contents" aria-label="Sample contents"><p class="label">In this sample</p><ol>${sample.sections.map((section) => `<li><a href="#${section.id}">${escape(section.title)}</a></li>`).join("")}</ol></nav>
  ${sample.image ? `<figure class="publication-photo"><img src="${sample.image}" alt="${escape(sample.imageAlt)}"><figcaption>${escape(sample.imageCaption)}</figcaption></figure>` : ""}
  ${sections}
  <footer class="publication-notes"><h2>Source and translation notes</h2><p>${escape(sample.scope)}</p>${sample.reference ? `<p><a href="${sample.referenceUrl}">${escape(sample.reference)}</a></p>` : ""}<p>Qur'an: Arabic from the supplied book; English meanings from the app's Saheeh International corpus. Verse punctuation follows that corpus. Other English is a draft rendering for review.</p></footer>
  </main><script>(()=>{let size=1;const minus=document.querySelector('[data-size="minus"]');const plus=document.querySelector('[data-size="plus"]');const update=()=>{document.documentElement.style.setProperty('--reading-scale',size);document.querySelector('#size-value').textContent=Math.round(size*100)+'%';minus.disabled=size<=1;plus.disabled=size>=2;};minus.addEventListener('click',()=>{size=Math.max(1,size-.25);update();});plus.addEventListener('click',()=>{size=Math.min(2,size+.25);update();});for(const radio of document.querySelectorAll('[name="theme"]'))radio.addEventListener('change',()=>{document.documentElement.dataset.theme=radio.value;});update();})();</script></body></html>`;
  // Explicit native tab stops keep links in Safari's default Tab navigation.
  return html.replaceAll("<a ", '<a tabindex="0" ');
}

export async function buildEnglishSamples() {
  const { chromium } = await import("playwright");
  const samples = await resolveEnglishSamples();
  await fs.mkdir(SAMPLE_OUTPUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const sample of samples) {
      const html = await sampleHtml(sample);
      const htmlPath = path.join(SAMPLE_OUTPUT, `${sample.id}-english-sample.html`);
      const pdfPath = path.join(SAMPLE_OUTPUT, `${sample.id}-english-sample.pdf`);
      await fs.writeFile(htmlPath, html);
      await page.setContent(html, { waitUntil: "load" });
      await page.evaluate(async () => globalThis.document.fonts.ready);
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: pdfPath,
        preferCSSPageSize: true,
        printBackground: true,
        tagged: true,
        outline: true,
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate: `<div style="font-family:Arial,sans-serif;font-size:9px;color:#555;width:100%;margin:0 12mm;display:flex;justify-content:space-between"><span>ENGLISH REVIEW SAMPLE · Source p. ${sample.sourcePage}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
      });
      execFileSync(process.env.BOOK_PYTHON || "python", [
        path.join(root, "docs/external-sources/finalize-book-pdf.py"),
        pdfPath,
      ]);
      await page.emulateMedia({ media: "screen" });
      console.log(
        `${sample.id}: ${sample.sections.reduce((count, section) => count + section.pairs.length, 0)} paired Qur'an passages`,
      );
    }
    const audit = samples.map((sample) => {
      const copy = { ...sample };
      delete copy.image;
      return copy;
    });
    await fs.writeFile(
      path.join(SAMPLE_OUTPUT, "source-comparison.json"),
      JSON.stringify({ status: "draft-for-review", samples: audit }, null, 2) + "\n",
    );
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildEnglishSamples();
