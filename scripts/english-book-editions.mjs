import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { BookOpen, Info, Check, X, List, Download } from "../src/app/components/icons.ts";
import { exactExcerpt, resolveEnglishSamples, clean } from "./english-book-samples.mjs";
import { publicationAssets } from "./publication-assets.mjs";
import { publicationDiagram } from "./publication-diagrams.mjs";
import {
  normalizePublicationPreferences,
  createPublicationPreferenceStore,
  publicationStorage,
  applyPublicationPreferences,
} from "../docs/learning/publication-preferences.mjs";
import { startPublicationReader } from "../docs/learning/publication-reader.mjs";

export const EDITION_OUTPUT = path.resolve("output/pdf/english-book-editions-2026-11-25");
const root = path.resolve(import.meta.dirname, "..");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const hash = (value) => createHash("sha256").update(value).digest("hex");
const icon = (component) =>
  renderToStaticMarkup(React.createElement(component, { size: 20, "aria-hidden": true, focusable: false }));
export const EDITION_FILES = ["english-umrah.json"];

export function validatePublicationMetadata(edition) {
  if (!/^[a-z0-9-]+$/u.test(edition.id)) throw new Error("Invalid publication identity");
  if (!["book", "guide", "hadith-collection"].includes(edition.kind)) throw new Error("Unknown Learn resource kind");
  const presentation = edition.presentation;
  const cover = edition.pages.find((page) => page.sourcePage === presentation?.coverSourcePage);
  const contents = edition.pages.find((page) => page.sourcePage === presentation?.contentsSourcePage);
  if (!cover || cover.title !== edition.title || !contents?.blocks.some((block) => block.type === "contents"))
    throw new Error("Invalid cover/contents source identity");
  const author = cover.blocks[presentation.coverAuthorBlock];
  if (author?.type !== "paragraph" || author.text.replace(/\.$/u, "") !== edition.author.replace(/\.$/u, ""))
    throw new Error("Cover author does not match publication metadata");
  const about = presentation.aboutCoverBlocks;
  if (
    !Array.isArray(about) ||
    new Set(about).size !== about.length ||
    about.includes(presentation.coverAuthorBlock) ||
    about.some((index) => !["paragraph", "note"].includes(cover.blocks[index]?.type))
  )
    throw new Error("Invalid source publication details");
  if (!presentation.draftLabel) throw new Error("Draft coverage label required");
  for (const page of edition.pages)
    for (const block of page.blocks) {
      if (block.type === "contents")
        for (const [target] of block.entries)
          if (!edition.pages.some((unit) => unit.sourcePage === target)) throw new Error("Missing contents target");
      if (
        block.type === "diagram" &&
        (block.sourcePage !== page.sourcePage ||
          !["tawaf", "sai"].includes(block.kind) ||
          !block.title ||
          !block.caption ||
          !block.description)
      )
        throw new Error("Unbound teaching diagram");
    }
}

export async function resolveWirdSourceOverrides() {
  const ledger = JSON.parse(
    await fs.readFile(path.join(root, "docs/learning/english-wird-source-overrides.json"), "utf8"),
  );
  const sourcePath = "docs/external-sources/book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html";
  const bytes = await fs.readFile(path.join(root, sourcePath));
  if (hash(bytes) !== ledger.adaptationBeforeRestorationSha256)
    throw new Error("Wird source changed; reconcile the recorded original-source differences");
  const document = new JSDOM(bytes.toString("utf8")).window.document;
  for (const change of ledger.changes) {
    change.sourceArabic = change.adaptationPages.map((number) => {
      const page = document.querySelector(`#p-${number}`).cloneNode(true);
      page.querySelectorAll(".page-header,.page-footer,svg,[aria-hidden=true]").forEach((node) => node.remove());
      return clean(page.textContent);
    });
    for (const pair of change.quran || []) {
      const matches = document.querySelectorAll(pair.selector);
      if (matches.length !== 1) throw new Error(`Ambiguous Wird source ${pair.ref}`);
      pair.arabic = exactExcerpt(clean(matches[0].textContent), pair.arabicStart, pair.arabicEnd);
      const [surah, ayah] = pair.ref.split(":");
      pair.translationPath = `public/data/translations/en/${surah}.json`;
      const translationBytes = await fs.readFile(path.join(root, pair.translationPath));
      const full = JSON.parse(translationBytes)[ayah];
      pair.english = pair.mode === "excerpt" ? exactExcerpt(full, pair.start, pair.end) : full;
      pair.translationSha256 = hash(translationBytes);
      pair.translator = "Saheeh International";
    }
  }
  return { ...ledger, sourcePath };
}

export async function resolveEnglishEdition(filename) {
  const authoring = JSON.parse(await fs.readFile(path.join(root, "docs/learning", filename), "utf8"));
  if (authoring.status !== "draft-for-review")
    throw new Error("Complete editions still require recorded independent review");
  validatePublicationMetadata(authoring);
  const sourcePath = `docs/external-sources/${authoring.sourceFolder}/${authoring.sourceFile}_light.html`;
  const sourceBytes = await fs.readFile(path.join(root, sourcePath));
  if (authoring.sourceSha256 !== hash(sourceBytes))
    throw new Error(`Arabic source changed; reconcile and review the English authoring: ${authoring.id}`);
  const document = new JSDOM(sourceBytes.toString("utf8")).window.document;
  const sourcePages = new Map();
  for (const page of document.querySelectorAll(".page")) {
    const clone = page.cloneNode(true);
    clone
      .querySelectorAll(".page-header,.page-footer,[aria-hidden=true],svg,.page-frame-outer,.page-frame-inner")
      .forEach((node) => node.remove());
    const number = Number(page.dataset.sourcePage);
    const text = clean(clone.textContent);
    sourcePages.set(number, [sourcePages.get(number), text].filter(Boolean).join(" "));
  }
  const expected = [...sourcePages.keys()];
  const actual = authoring.pages.map((page) => page.sourcePage);
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw new Error(`Missing/duplicated/reordered source pages in ${authoring.id}`);
  const samples = await resolveEnglishSamples();
  const pairs = {};
  for (const [id, binding] of Object.entries(authoring.quranBindings)) {
    if (binding.sampleBinding) {
      const [sampleId, sectionId, ref] = binding.sampleBinding;
      const pair = samples
        .find((sample) => sample.id === sampleId)
        ?.sections.find((section) => section.id === sectionId)
        ?.pairs.find((pair) => pair.ref === ref);
      if (!pair) throw new Error(`Missing accepted sample pair ${id}`);
      pairs[id] = { ...pair, bindingId: id };
      continue;
    }
    const matches = document.querySelectorAll(binding.selector);
    const element = matches[binding.index || 0];
    if (!element || (binding.index === undefined && matches.length !== 1))
      throw new Error(`Ambiguous Qur'an selector ${id}`);
    const arabic = exactExcerpt(clean(element.textContent), binding.arabicStart, binding.arabicEnd);
    const [surah, ayah] = binding.ref.split(":");
    const translationPath = `public/data/translations/en/${surah}.json`;
    const bytes = await fs.readFile(path.join(root, translationPath));
    const fullEnglish = JSON.parse(bytes)[ayah];
    if (!fullEnglish) throw new Error(`Missing English Qur'an ${id}`);
    pairs[id] = {
      ...binding,
      bindingId: id,
      arabic,
      english: binding.mode === "excerpt" ? exactExcerpt(fullEnglish, binding.start, binding.end) : fullEnglish,
      translator: "Saheeh International",
      translationPath,
      translationSha256: hash(bytes),
      sourceUrl: `https://quran.com/${surah}/${ayah}`,
    };
  }
  const used = authoring.pages.flatMap((page) =>
    page.blocks.filter((block) => block.type === "quran").map((block) => block.binding),
  );
  if (new Set(used).size !== used.length || used.length !== Object.keys(pairs).length || used.some((id) => !pairs[id]))
    throw new Error("Missing, unused or repeated Qur'an binding");
  for (const page of authoring.pages) {
    if (!page.title || !page.blocks.length) throw new Error("Incomplete English source unit");
    page.sourceArabic = sourcePages.get(page.sourcePage);
    page.sourceSha256 = hash(page.sourceArabic);
    if (page.image) {
      const image = document.querySelector(page.image.selector);
      if (!image || !image.getAttribute("src")?.startsWith("data:image/")) throw new Error("Source photograph missing");
      page.image.src = image.getAttribute("src");
    }
  }
  return {
    ...authoring,
    sourcePath,
    sourceSha256: hash(sourceBytes),
    pages: authoring.pages,
    pairs,
    artworks: [...document.querySelectorAll(".roadmap-card svg.step-art")].map((svg) => {
      const copy = svg.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("focusable", "false");
      copy.removeAttribute("role");
      copy.removeAttribute("aria-label");
      copy.querySelectorAll("title,desc").forEach((node) => node.remove());
      return copy.outerHTML;
    }),
  };
}

function pairMarkup(pair) {
  const label = pair.opening ? "Surah opening verse" : pair.mode === "excerpt" ? "Qur'anic excerpt" : "Qur'anic verse";
  return `<section class="quran-pair" data-quran-ref="${pair.ref}" aria-label="${label} ${pair.ref}"><div class="pair-reference"><span>${label}</span><a tabindex="0" href="${pair.sourceUrl}">Qur'an ${pair.ref}</a></div><p class="quran-arabic" lang="ar" dir="rtl">${escape(pair.arabic)}</p><div class="meaning"><p class="label">English translation of meaning${pair.mode === "excerpt" ? " · corresponding excerpt" : ""}</p><p lang="en" dir="ltr">${escape(pair.english)}</p><p class="translator">${escape(pair.translator)}</p></div></section>`;
}

function blockMarkup(block, edition) {
  switch (block.type) {
    case "paragraph":
      return `<p>${escape(block.text)}</p>`;
    case "heading":
      return `<h3>${escape(block.text)}</h3>`;
    case "reference":
      return `<p class="source-reference">${block.url ? `<a tabindex="0" href="${block.url}">${escape(block.text)}</a>` : escape(block.text)}</p>`;
    case "quote":
      return `<blockquote><p>${escape(block.text)}</p>${block.reference ? `<footer>${escape(block.reference)}</footer>` : ""}</blockquote>`;
    case "quran":
      return pairMarkup(edition.pairs[block.binding]);
    case "note":
      return `<aside class="context">${icon(Info)}<p>${escape(block.text)}</p></aside>`;
    case "list":
      return `<${block.ordered ? "ol" : "ul"} class="edition-list">${block.items.map((item) => `<li>${escape(item)}</li>`).join("")}</${block.ordered ? "ol" : "ul"}>`;
    case "mistake":
      return `<section class="mistake-card"><h3>${icon(X)}<span>Mistake</span></h3><p>${escape(block.wrong)}</p><h3>${icon(Check)}<span>Correction in the source</span></h3><p>${escape(block.right)}</p></section>`;
    case "contents":
      return contentsMarkup(block.entries);
    case "diagram":
      return publicationDiagram(block);
    case "steps":
      return `<ol class="edition-steps" role="list">${block.items.map((item, index) => `<li><a tabindex="0" href="#p-${item.target}">${edition.artworks[item.artwork - 1]}<span class="step-number">${index + 1}</span><h4>${escape(item.title)}</h4><p>${escape(item.text)}</p></a></li>`).join("")}</ol>`;
    default:
      throw new Error(`Unsupported English block ${block.type}`);
  }
}

function contentsMarkup(entries, printedNumbers = true) {
  return `<nav aria-label="Book contents"><ol class="edition-contents">${entries.map(([page, text]) => `<li><a tabindex="0" href="#p-${page}"><span>${escape(text)}</span><span class="contents-references">${printedNumbers ? `<span class="pdf-reference">PDF p. <span class="pdf-page-number" data-pdf-target="${page}">—</span></span>` : ""}<span>Source p. ${page}</span></span></a></li>`).join("")}</ol></nav>`;
}

function dialogMarkup(id, title, content) {
  return `<dialog id="${id}" class="reader-dialog" data-dropdown-surface aria-labelledby="${id}-title"><div class="dialog-heading"><h2 id="${id}-title">${title}</h2><button type="button" data-close-dialog aria-label="Close ${title.toLowerCase()}" autofocus>${icon(X)}</button></div><div class="dialog-body">${content}</div></dialog>`;
}

function preferenceFunctions() {
  return `const normalizePublicationPreferences=${normalizePublicationPreferences.toString()};const createPublicationPreferenceStore=${createPublicationPreferenceStore.toString()};const publicationStorage=${publicationStorage.toString()};`;
}

export async function editionHtml(edition) {
  validatePublicationMetadata(edition);
  const styles = await publicationAssets("editions");
  const { coverSourcePage, contentsSourcePage, coverAuthorBlock, aboutCoverBlocks, draftLabel } = edition.presentation;
  const cover = edition.pages.find((page) => page.sourcePage === coverSourcePage);
  const entries = edition.pages.flatMap((page) =>
    page.blocks.filter((block) => block.type === "contents").flatMap((block) => block.entries),
  );
  const about = `<details id="about-this-edition" class="publication-about"><summary>About this edition and source credits</summary><div><h2 class="print-about-title">About this edition</h2><p>${escape(edition.scope)} Language and religious-source review remain pending.</p>${aboutCoverBlocks.map((index) => blockMarkup(cover.blocks[index], edition)).join("")}<p>Arabic Qur'an is retained from the supplied Arabic adaptation; English meanings are attributed to Saheeh International from the existing app corpus. Full verses, corresponding excerpts and surah-opening identifiers are distinguished. Verse punctuation follows that corpus.</p><p>Other English is a draft rendering of the supplied adaptation, including its source attributions and rulings. It does not imply independent scholarly approval. Original publication statements are identified as such.</p></div></details>`;
  const units = edition.pages
    .map((page) => {
      const isCover = page.sourcePage === coverSourcePage;
      const body = page.blocks.filter(
        (_, index) => !isCover || (index !== coverAuthorBlock && !aboutCoverBlocks.includes(index)),
      );
      const heading = isCover
        ? `<header class="publication-header"><p class="eyebrow">${icon(BookOpen)}English translation draft</p><h1 id="title-p-${page.sourcePage}">${escape(edition.title)}</h1><p class="author">${escape(cover.blocks[coverAuthorBlock].text)}</p><p class="draft-notice">${escape(draftLabel)} <a tabindex="0" href="#about-this-edition">About this edition</a></p></header>`
        : `<h2 id="title-p-${page.sourcePage}">${escape(page.title)}</h2>`;
      return `<article id="p-${page.sourcePage}" tabindex="-1" class="edition-unit${isCover ? " publication-cover" : ""}" data-source-page="${page.sourcePage}" aria-labelledby="title-p-${page.sourcePage}">${isCover ? heading : ""}<p class="source-page">Arabic source p. ${page.sourcePage}</p>${isCover ? "" : heading}${page.image ? `<figure class="publication-photo"><img src="${page.image.src}" alt="${escape(page.image.alt)}"><figcaption>${escape(page.image.caption)}</figcaption></figure>` : ""}${page.sourcePage === contentsSourcePage ? '<p class="pdf-pagination-help">PDF numbers refer to this English edition; source numbers identify the Arabic adaptation.</p>' : ""}${body.map((block) => blockMarkup(block, edition)).join("")}<a tabindex="0" class="back-to-contents" href="#p-${contentsSourcePage}">Back to contents</a></article>`;
    })
    .join("");
  const options = `<fieldset><legend>Reading text size</legend><div class="size-controls"><button type="button" data-size="minus" aria-label="Decrease reading text size">A−</button><output id="size-value" aria-live="polite">100%</output><button type="button" data-size="plus" aria-label="Increase reading text size">A+</button></div></fieldset><fieldset><legend>Appearance</legend>${["light", "dark", "navy"].map((theme) => `<label><input type="radio" name="theme" value="${theme}"${theme === "light" ? " checked" : ""}>${theme[0].toUpperCase() + theme.slice(1)}</label>`).join("")}</fieldset><a tabindex="0" class="reader-tool-link" id="pdf-link" href="${edition.id}-english-light.pdf" download>${icon(Download)}<span>Download Light PDF</span></a><p id="preference-status" role="status">Reading options are saved on this device when storage is available.</p>`;
  return `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(edition.title)} · English translation draft</title><style>${styles}</style><script>(()=>{${preferenceFunctions()}(${applyPublicationPreferences.toString()})(normalizePublicationPreferences,createPublicationPreferenceStore,publicationStorage);})();</script></head><body data-publication-id="${edition.id}" data-resource-kind="${edition.kind}"><a tabindex="0" class="skip-link" href="#reading">Skip to reading</a><div class="reader-tools" role="region" aria-label="Reading controls"><button type="button" data-open-dialog="contents-dialog" aria-haspopup="dialog" aria-controls="contents-dialog" aria-expanded="false">${icon(List)}<span>Contents</span></button><button type="button" data-open-dialog="options-dialog" aria-haspopup="dialog" aria-controls="options-dialog" aria-expanded="false" aria-label="Reading options"><span>Aa</span></button></div><main id="reading" tabindex="-1">${units}${about}</main>${dialogMarkup("contents-dialog", "Contents", contentsMarkup(entries, false))}${dialogMarkup("options-dialog", "Reading options", options)}<script>(()=>{${preferenceFunctions()}(${startPublicationReader.toString()})(normalizePublicationPreferences,createPublicationPreferenceStore,publicationStorage);})();</script></body></html>`;
}

export async function buildEnglishEditions() {
  const { chromium } = await import("playwright");
  await fs.mkdir(EDITION_OUTPUT, { recursive: true });
  const browser = await chromium.launch();
  const audit = [];
  try {
    const page = await browser.newPage();
    for (const filename of EDITION_FILES) {
      const edition = await resolveEnglishEdition(filename);
      const html = await editionHtml(edition);
      await page.setContent(html, { waitUntil: "load" });
      await page.evaluate(async () => globalThis.document.fonts.ready);
      await page.emulateMedia({ media: "print" });
      await page.locator(".publication-about").evaluate((details) => {
        details.open = true;
      });
      await page.evaluate(() => {
        globalThis.document.documentElement.dataset.pdfAppearance = "light";
      });
      const work = path.join(root, "tmp/pdfs/english-editions");
      await fs.mkdir(work, { recursive: true });
      const preview = path.join(work, `${edition.id}-pagination.pdf`);
      let pagination;
      let stable = false;
      for (let pass = 0; pass < 4; pass++) {
        await page.pdf({ path: preview, printBackground: true, preferCSSPageSize: true });
        const next = JSON.parse(
          execFileSync(
            process.env.BOOK_PYTHON || "python",
            [path.join(root, "scripts/read-publication-pagination.py"), preview],
            { encoding: "utf8" },
          ),
        );
        if (edition.pages.some((unit) => !next.sourcePages[unit.sourcePage]))
          throw new Error("Missing printed source-page label");
        if (pagination && JSON.stringify(next) === JSON.stringify(pagination)) {
          stable = true;
          break;
        }
        pagination = next;
        await page.locator("[data-pdf-target]").evaluateAll((nodes, map) => {
          for (const node of nodes) node.textContent = String(map[node.dataset.pdfTarget]);
        }, pagination.sourcePages);
      }
      if (!stable) throw new Error("English PDF contents pagination did not stabilize");
      await fs.unlink(preview);
      const finalDocument = new JSDOM(html).window.document;
      for (const node of finalDocument.querySelectorAll("[data-pdf-target]"))
        node.textContent = String(pagination.sourcePages[node.dataset.pdfTarget]);
      await fs.writeFile(
        path.join(EDITION_OUTPUT, `${edition.id}-english.html`),
        "<!doctype html>" + finalDocument.documentElement.outerHTML,
      );
      edition.pdfPagination = pagination;
      await fs.writeFile(
        path.join(EDITION_OUTPUT, `${edition.id}-pagination.json`),
        JSON.stringify(pagination, null, 2) + "\n",
      );
      for (const appearance of ["light", "dark", "navy"]) {
        await page.evaluate((appearance) => {
          globalThis.document.documentElement.dataset.pdfAppearance = appearance;
          globalThis.document.documentElement.dataset.theme = "light";
        }, appearance);
        const pdfPath = path.join(EDITION_OUTPUT, `${edition.id}-english-${appearance}.pdf`);
        const footerInk = { light: "#444", dark: "#d0d4c8", navy: "#d0d9ed" }[appearance];
        await page.pdf({
          path: pdfPath,
          printBackground: true,
          preferCSSPageSize: true,
          tagged: true,
          outline: true,
          displayHeaderFooter: true,
          headerTemplate: "<div></div>",
          footerTemplate: `<div style="font-family:Arial,sans-serif;font-size:10px;font-weight:600;color:${footerInk};-webkit-print-color-adjust:exact;print-color-adjust:exact;width:100%;margin:0 12mm;display:flex;justify-content:space-between"><span>${escape(edition.title)} · ENGLISH DRAFT</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
        });
        execFileSync(process.env.BOOK_PYTHON || "python", [
          path.join(root, "docs/external-sources/finalize-book-pdf.py"),
          pdfPath,
        ]);
        execFileSync(process.env.BOOK_PYTHON || "python", [
          path.join(root, "scripts/finalize-english-edition-pdf.py"),
          pdfPath,
          appearance,
        ]);
      }
      await page.emulateMedia({ media: "screen" });
      audit.push({
        ...edition,
        pages: edition.pages.map((sourcePage) => {
          const copy = globalThis.structuredClone(sourcePage);
          if (copy.image) delete copy.image.src;
          return copy;
        }),
      });
      console.log(
        `${edition.id}: ${edition.pages.length} source pages, ${Object.keys(edition.pairs).length} paired Qur'an passages`,
      );
    }
  } finally {
    await browser.close();
  }
  await fs.writeFile(path.join(EDITION_OUTPUT, "source-comparison.json"), JSON.stringify(audit, null, 2) + "\n");
  await fs.writeFile(
    path.join(EDITION_OUTPUT, "wird-original-source-review.json"),
    JSON.stringify(await resolveWirdSourceOverrides(), null, 2) + "\n",
  );
  await fs.writeFile(
    path.join(EDITION_OUTPUT, "index.html"),
    `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>English book drafts for review</title><style>body{margin:0;background:#efede8;color:#20211e;font:1.1rem/1.7 system-ui,sans-serif}main{max-width:48rem;margin:2rem auto;padding:clamp(1rem,5vw,3rem);background:#fbf9f5;border-radius:1rem}h1{line-height:1.25}h2{line-height:1.4}a{color:#72510b;display:inline-flex;align-items:center;min-height:44px;overflow-wrap:anywhere;margin-inline-end:1rem}a:focus-visible{outline:3px solid #72510b;outline-offset:3px}section{border-top:1px solid #b9b5a9;padding-block:1.5rem}svg{vertical-align:middle}.notice{padding:1rem;border-inline-start:3px solid #72510b;background:#f0eade}small{display:block}</style></head><body><main><h1>${icon(BookOpen)} English book drafts</h1><p class="notice">Language and religious-source review remain pending. Each book states its exact source coverage. Qur'an retains Arabic alongside attributed English meanings.</p>${audit.map((edition) => `<section><h2>${escape(edition.title)}</h2><p>${escape(edition.scope)}</p><a tabindex="0" href="${edition.id}-english.html">Read the HTML edition</a><div aria-label="PDF appearances">${["light", "dark", "navy"].map((appearance) => `<a tabindex="0" href="${edition.id}-english-${appearance}.pdf">${appearance[0].toUpperCase() + appearance.slice(1)} PDF</a>`).join("")}</div></section>`).join("")}<p><small>Self-contained HTML includes fonts, illustrations and photographs. Keep the PDFs beside it for its Download PDF control.</small></p></main></body></html>`,
  );
  await fs.writeFile(
    path.join(EDITION_OUTPUT, "READ-ME.txt"),
    `ENGLISH BOOK DRAFTS — 2026-11-25\n\nOpen index.html to choose a reading format. Keep all files together.\n\nCURRENT AUTHORING CHECKPOINT\n${audit.map((edition) => `${edition.title}: ${edition.scope}\n${edition.pages.length} Arabic source units; ${Object.keys(edition.pairs).length} Arabic/English Quran pairs; ${edition.pdfPagination.pages} English PDF pages per appearance.`).join("\n\n")}\nArabic Quran and Saheeh International meanings remain paired. All other English is a draft rendering for review.\n\nHTML: self-contained fonts/images, compact sticky Contents and Reading options, three appearances and 100–200% text-size controls. Options are remembered on this device when browser storage is available; denied storage does not block reading. Source-bound vector diagrams include text alternatives. About this edition retains full coverage and credits.\nPDF: fixed A5, searchable text, semantic tags, Arabic/English language metadata, linked contents with verified English page numbers alongside Arabic source references, and outlines. The pagination sidecar records the source-to-English page map. Light is suitable for printing; Dark and Navy provide continuous dark paper for screen reading.\n\nSOURCE REVIEW\nsource-comparison.json preserves source-page Arabic, hashes, English authoring, exact Quran bindings and the verified pagination map.\nwird-original-source-review.json records the original-based English restoration of the evening narrator chain and complete travel supplication, with repetition, glossary and Quran pairings. It is not a complete English Wird edition.\nSOURCE_REVIEW.md lists the confirmed Al-Mukhtar differences and the next source-correction work.\n\nSTATUS\nFull Al-Mukhtar and Wird English editions are not complete. Original-source reconciliation and independent language/religious-source review remain required. Real-device and screen-reader acceptance is pending; automated evidence does not establish full WCAG or PDF-UA compliance. The current app catalogue still contains its existing Arabic publications. These are local review artifacts.\n`,
  );
  await fs.copyFile(
    path.join(root, "docs/learning/SOURCE_REVIEW_2026_11_25.md"),
    path.join(EDITION_OUTPUT, "SOURCE_REVIEW.md"),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildEnglishEditions();
