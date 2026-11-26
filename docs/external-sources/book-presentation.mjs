import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { format, resolveConfig } from "prettier";
import * as AppIcons from "../../src/app/components/icons.ts";
import { exactNotes } from "./book-content.mjs";

const css = fs.readFileSync(path.join(import.meta.dirname, "book-presentation.css"), "utf8");
const icon = (name) =>
  renderToStaticMarkup(
    React.createElement(AppIcons[name], {
      className: "book-icon",
      width: 18,
      height: 18,
      "aria-hidden": true,
      focusable: false,
    }),
  );
const icons = Object.fromEntries(
  ["BookOpen", "Repeat", "Lightbulb", "List", "Download", "ArrowPrevious", "Route", "Check", "X", "Info"].map(
    (name) => [name, icon(name)],
  ),
);

// Non-interactive illustrations, not a second product icon set. Each linked
// stage retains its complete visible text; the artwork adds no instructions.
const illustrations = [
  '<path d="M16 50V22l10-7 9 8 9-8 10 7v28M18 34h34M26 17v15m18-15v15"/>',
  '<path d="m19 25 17-9 17 9v25H19Z"/><path d="m19 25 17 8 17-8M36 33v17M19 31l17 8 17-8"/><path d="M11 47c-6-16 4-33 21-35m28 10c13 17 2 38-15 39"/>',
  '<path d="M12 51h48M23 51V33l13-15 13 15v18M28 51V37h16v14M18 33h36"/><circle cx="36" cy="27" r="2"/>',
  '<path d="M22 25h28l-3 30H25Zm-2 0h32M30 13c-6 6 6 7 0 13m13-13c-6 6 6 7 0 13M25 41h22"/>',
  '<path d="m10 51 12-22 13 22m2 0 13-22 12 22M20 19h32m-5-5 5 5-5 5M52 60H20m5-5-5 5 5 5"/>',
  '<circle cx="22" cy="50" r="7"/><circle cx="49" cy="50" r="7"/><path d="m26 44 26-28M45 44 19 16M35 35l4 4"/>',
].map(
  (drawing) =>
    `<svg class="step-art" viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawing}</svg>`,
);

export async function enhanceBookDocument({ book, theme, icons, illustrations, notes }) {
  const doc = globalThis.document;
  doc.documentElement.setAttribute("data-edition", theme);
  doc.documentElement.setAttribute("data-book", String(book));
  if (!doc.querySelector('meta[name="viewport"]')) {
    const meta = doc.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1";
    doc.head.append(meta);
  }
  const replaceTag = (element, tag) => {
    const replacement = doc.createElement(tag);
    for (const attr of element.attributes) replacement.setAttribute(attr.name, attr.value);
    while (element.firstChild) replacement.append(element.firstChild);
    element.replaceWith(replacement);
    return replacement;
  };
  const oldColors = {
    "#9e7422": "var(--book-accent)",
    "#6b655b": "var(--book-muted)",
    "#9e9484": "var(--book-muted)",
    "#8f9eb8": "var(--book-muted)",
    "#136f48": "var(--book-green)",
    "#059669": "var(--book-green)",
    "#16a34a": "var(--book-green)",
    "#dc2626": "var(--book-red)",
    "#1c1917": "var(--book-ink)",
    "#f5f0e8": "var(--book-ink)",
  };
  const pages = [...doc.querySelectorAll(".page")];
  for (const [index, p] of pages.entries()) {
    p.id = `p-${index + 1}`;
    p.dataset.sourcePage = String(index + 1);
    const cover = index === 0 || (index === pages.length - 1 && book !== 1);
    if (cover) {
      p.classList.add("book-cover");
      for (const e of p.querySelectorAll("[style]")) {
        const color = e.style.color;
        if (
          color &&
          ![
            "rgb(255, 255, 255)",
            "rgb(204, 204, 204)",
            "rgb(170, 170, 170)",
            "rgb(221, 221, 221)",
            "rgb(136, 136, 136)",
          ].includes(color)
        ) {
          if (e.style.background && e.style.color === "rgb(0, 0, 0)") e.dataset.coverPill = "";
          else e.dataset.coverGold = "";
        }
      }
      if (index === 0) {
        const mark = doc.createElement("div");
        mark.innerHTML =
          '<svg class="book-cover-mark" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="m60 7 16 24 28 6-6 28 10 27-28 7-20 17-20-17-28-7 10-27-6-28 28-6Z"/><path d="m60 18 36 42-36 42L24 60Z"/><circle cx="60" cy="60" r="27"/></svg>';
        p.firstElementChild.after(mark.firstElementChild);
      }
    } else {
      for (const e of p.querySelectorAll("[style]")) {
        const match = e.getAttribute("style").match(/(?:^|;)\s*color:\s*(#[0-9a-f]{6})/i);
        if (match && oldColors[match[1].toLowerCase()]) e.style.color = oldColors[match[1].toLowerCase()];
      }
    }
    for (const header of p.querySelectorAll(".header-book-title")) {
      header.querySelector("svg")?.remove();
      header.insertAdjacentHTML("afterbegin", icons.BookOpen);
    }
    for (const bulb of p.querySelectorAll(".vocab-title svg")) bulb.outerHTML = icons.Lightbulb;
    for (const e of p.querySelectorAll(
      ".page-header,.page-footer,.chapter-badge,.intro-divider-fleuron,.page-frame-outer,.page-frame-inner",
    ))
      e.setAttribute("aria-hidden", "true");
    // Header navigation remains available to keyboard and assistive technology.
    for (const e of p.querySelectorAll(".page-header:has(a)")) e.removeAttribute("aria-hidden");
    for (const link of p.querySelectorAll("a.header-chapter")) {
      link.textContent = "الفهرس";
      link.insertAdjacentHTML("afterbegin", icons.List);
      link.setAttribute("aria-label", "العودة إلى فهرس الموضوعات");
    }
    for (const text of p.querySelectorAll(
      ".dua-text,.hadith-text,.dua-matn,.dua-matn-center,.body-text,.intro-body-p,.advisory-body,.vocab-item",
    )) {
      // A few source panels contain a nested advisory. Wrapping a block in P
      // makes HTML reparsing eject it and changes the paragraph boundary.
      if (!text.querySelector("div,p,ul,ol,section,aside,table")) replaceTag(text, "p");
    }
    for (const text of p.querySelectorAll(
      ".dua-text,.hadith-text,.dua-matn,.dua-matn-center,.body-text,.intro-body-p,.advisory-body,.vocab-item",
    )) {
      text.style.removeProperty("font-size");
      text.style.removeProperty("line-height");
      text.style.removeProperty("text-align");
    }
    for (const title of p.querySelectorAll(".section-title,.vocab-title")) replaceTag(title, "h3");
    for (const panel of p.querySelectorAll(".vocab-panel")) replaceTag(panel, "aside");
    for (const quote of p.querySelectorAll(".dua-text")) {
      if (quote.textContent.trim().startsWith("﴿")) quote.classList.add("quran-quote");
    }
    if (notes[index + 1]) {
      const card = p.querySelector(".hadith-card");
      for (const note of notes[index + 1]) {
        const aside = doc.createElement("aside");
        aside.className = `source-note source-note-${note.kind}`;
        const label = doc.createElement("div");
        label.className = "source-note-title";
        label.innerHTML = note.kind === "repeat" ? icons.Repeat : icons.Lightbulb;
        label.append(doc.createTextNode(note.kind === "repeat" ? "التكرار كما ورد في النص" : "الفضل كما ورد في النص"));
        aside.append(label);
        for (const [i, quote] of note.quotes.entries()) {
          if (i) aside.append(doc.createTextNode(" […] "));
          aside.append(doc.createTextNode(quote));
        }
        card.append(aside);
      }
    }
    for (const [i, card] of [...p.querySelectorAll(".roadmap-card")].entries())
      card.querySelector(".step-num-pill").insertAdjacentHTML("afterend", illustrations[i]);
    const mapTitle = p.querySelector(".roadmap-header");
    if (mapTitle) {
      mapTitle.firstElementChild.innerHTML = icons.Route;
      replaceTag(mapTitle, "h3");
    }
    for (const tag of p.querySelectorAll(".mistake-tag,.correct-tag")) {
      tag.textContent = tag.textContent.replace(/❌|✔️|💡/gu, "").trim();
      tag.insertAdjacentHTML("afterbegin", tag.classList.contains("correct-tag") ? icons.Check : icons.X);
    }
    for (const img of p.querySelectorAll("img")) {
      img.width = img.naturalWidth;
      img.height = img.naturalHeight;
    }
    // Keep source-page anchors stable even when larger text needs a continuation.
    if (!cover) {
      const body = [...p.children].filter(
        (e) => !e.matches(".page-header,.page-footer,.page-frame-outer,.page-frame-inner"),
      );
      const flow = doc.createElement("div");
      flow.className = "book-flow editorial-flow";
      for (const e of body) {
        if (
          e.matches(".devotional-flow,.devotional-body,.content-flow,.intro-page-container,.mistakes-container") ||
          e.style.flex === "1 1 0%" ||
          e.style.flex === "1 1 0px"
        ) {
          // Include panels outside old flow wrappers in pagination as well.
          if (e.matches(".devotional-flow")) flow.className += ` ${e.className}`;
          if (e.matches(".devotional-body")) flow.classList.add("devotional-body");
          while (e.firstChild) flow.append(e.firstChild);
          e.remove();
        } else flow.append(e);
      }
      if (flow.querySelector(".toc-grid,.toc-container")) flow.classList.add("contents-flow");
      const footer = p.querySelector(".page-footer");
      if (footer) footer.before(flow);
      else p.append(flow);
    }
  }
  const main = doc.createElement("main");
  main.id = "book-content";
  for (const p of pages) main.append(p);
  doc.body.append(main);
  const tocPage = book === 3 ? 134 : 2;
  const contents = doc.querySelector(`#p-${tocPage}`);
  const notice = doc.createElement("p");
  notice.className = "source-page-notice";
  notice.textContent = "أرقام الفهرس تتبع صفحات المصدر؛ قد تتوزع صفحة المصدر على أكثر من ورقة لتحسين القراءة.";
  contents.querySelector(".page-footer").before(notice);
  const skip = doc.createElement("a");
  skip.href = "#book-content";
  skip.className = "skip-link";
  skip.textContent = "انتقل إلى الكتاب";
  doc.body.prepend(skip);
  const toolbar = doc.createElement("nav");
  toolbar.className = "book-toolbar";
  toolbar.setAttribute("aria-label", "أدوات قراءة الكتاب");
  toolbar.innerHTML = `<span class="toolbar-title"></span><a href="#p-${tocPage}">${icons.List}الفهرس</a><a class="pdf-download">${icons.Download}PDF</a><button type="button" data-size="minus" aria-label="تصغير النص">أ−</button><output class="reader-size-value" aria-live="polite" aria-label="حجم النص">100%</output><button type="button" data-size="plus" aria-label="تكبير النص">أ+</button>`;
  toolbar.querySelector(".toolbar-title").textContent = doc.title.split(" — ")[0];
  doc.body.prepend(toolbar);
  for (const svg of doc.querySelectorAll("svg")) {
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
  }
}

export async function paginateBookDocument() {
  const doc = globalThis.document;
  const pages = [...doc.querySelectorAll(".page")];
  const number = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  let added = 0;
  for (const original of pages) {
    let p = original;
    let flow = p.querySelector(".book-flow");
    if (!flow) continue;
    // Every direct body child is a semantic unit: a reading, its explanation,
    // an individual instruction panel, or a contents list. Split groups only
    // when a single list itself exceeds a printed sheet.
    for (const list of flow.querySelectorAll(".toc-grid,.toc-container")) {
      if (list.parentElement === flow) {
        while (list.firstElementChild) flow.insertBefore(list.firstElementChild, list);
        list.remove();
      }
    }
    let part = 1;
    while (true) {
      const footer = p.querySelector(".page-footer");
      const bottom = footer ? footer.getBoundingClientRect().top - 8 : p.getBoundingClientRect().bottom - 40;
      const children = [...flow.children];
      const overflowing = children.findIndex((child) => child.getBoundingClientRect().bottom > bottom + 0.5);
      if (overflowing < 0) break;
      let split = overflowing;
      if (split === 0)
        throw new Error(`Unbreakable content exceeds source p${p.dataset.sourcePage}: ${children[0].className}`);
      if (children[split - 1].matches(".chapter-banner,h2,h3")) split--;
      if (split === 0) throw new Error(`Heading and content exceed source p${p.dataset.sourcePage}`);
      // A compact first panel plus a six-stage illustrated sequence can stay
      // together; never shrink devotional type to achieve a fixed page count.
      const next = original.cloneNode(true);
      for (const element of next.querySelectorAll("[id]")) element.removeAttribute("id");
      next.id = `${original.id}-part-${++part}`;
      const nextFlow = next.querySelector(".book-flow");
      nextFlow.replaceChildren();
      // A continuation has no duplicate section heading/outline entry.
      for (const heading of next.querySelectorAll(".chapter-banner")) if (!nextFlow.contains(heading)) heading.remove();
      for (const child of children.slice(split)) nextFlow.append(child);
      next.querySelector(".footer-page-pill").textContent =
        `ص ${number(original.dataset.sourcePage)} · تتمة ${number(part)}`;
      p.after(next);
      p = next;
      flow = nextFlow;
      added++;
      if (part > 15) throw new Error(`Pagination did not converge for ${original.id}`);
    }
  }
  // Balance a short continuation without changing source order. Move only
  // complete adjacent readings/instruction cards, never a part of a quotation.
  const sheets = [...doc.querySelectorAll(".page")];
  for (let i = 1; i < sheets.length; i++) {
    const current = sheets[i];
    const previous = sheets[i - 1];
    if (current.dataset.sourcePage !== previous.dataset.sourcePage) continue;
    const before = previous.querySelector(".book-flow");
    const after = current.querySelector(".book-flow");
    const cards = () =>
      [...before.children].filter((e) => e.matches(".dua-card,.section-box,.mistake-card,a.toc-item"));
    const height = (container) => [...container.children].reduce((sum, e) => sum + e.getBoundingClientRect().height, 0);
    while (cards().length > 1 && height(after) < height(before) * 0.6) {
      const candidate = before.lastElementChild;
      if (!candidate.matches(".dua-card,.section-box,.mistake-card,a.toc-item")) break;
      after.prepend(candidate);
      if (
        after.lastElementChild.getBoundingClientRect().bottom >
        current.querySelector(".page-footer").getBoundingClientRect().top - 8
      ) {
        before.append(candidate);
        break;
      }
    }
  }
  for (const p of doc.querySelectorAll(".page")) {
    const links = [...p.querySelectorAll(".book-flow > a.toc-item")];
    if (links.length) {
      const nav = doc.createElement("nav");
      nav.setAttribute("aria-label", "فهرس الموضوعات");
      const list = doc.createElement("ol");
      list.className = "contents-list";
      links[0].before(nav);
      nav.append(list);
      for (const link of links) {
        const li = doc.createElement("li");
        li.append(link);
        list.append(li);
      }
    }
    const cards = [...p.querySelectorAll(".roadmap-card")];
    if (cards.length) {
      const list = doc.createElement("ol");
      list.className = "roadmap-grid";
      const grid = cards[0].parentElement;
      grid.before(list);
      for (const card of cards) {
        const li = doc.createElement("li");
        li.append(card);
        list.append(li);
      }
      grid.remove();
    }
  }
  return { pages: doc.querySelectorAll(".page").length, continuations: added };
}

export async function exportBookEdition(page, { html, htmlPath, pdfPath, book, theme }) {
  await page.emulateMedia({ media: "print" });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });
  await page.addStyleTag({ content: css });
  const notes =
    book === 3
      ? await page.evaluate(() =>
          Object.fromEntries(
            [...globalThis.document.querySelectorAll(".page")].map((p, i) => [
              i + 1,
              p.querySelector(".hadith-text")?.textContent.replace(/\s+/g, " ").trim() ?? "",
            ]),
          ),
        )
      : {};
  const checkedNotes = Object.fromEntries(Object.entries(notes).map(([n, text]) => [n, exactNotes(text, Number(n))]));
  await page.evaluate(enhanceBookDocument, { book, theme, icons, illustrations, notes: checkedNotes });
  await page.evaluate((pdfName) => {
    const link = globalThis.document.querySelector(".pdf-download");
    link.href = pdfName;
    link.setAttribute("download", "");
  }, path.basename(pdfPath));
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });
  const pagination = await page.evaluate(paginateBookDocument);
  const bad = await page.evaluate(() =>
    [...globalThis.document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute("href").slice(1))
      .filter((id) => !globalThis.document.getElementById(id)),
  );
  if (bad.length) throw new Error(`Broken book destinations: ${bad.join(", ")}`);
  const pdfBytes = await page.pdf({
    format: "A5",
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  // Replace only a complete export. This also avoids OneDrive observing a
  // partially written PDF while Chromium is still producing it.
  const pendingPdf = `${pdfPath}.pending`;
  fs.writeFileSync(pendingPdf, pdfBytes);
  await fs.promises.rename(pendingPdf, pdfPath);
  execFileSync(process.env.BOOK_PYTHON ?? "python", [path.join(import.meta.dirname, "finalize-book-pdf.py"), pdfPath], {
    stdio: "inherit",
  });
  await page.addScriptTag({
    content: `(() => {
    const initialize = () => {
    const root = document.documentElement;
    let size = 1;
    for (const button of document.querySelectorAll('[data-size]')) button.addEventListener('click', () => {
      size = Math.round(Math.min(2, Math.max(1, size + (button.dataset.size === 'plus' ? .25 : -.25))) * 100) / 100;
      root.style.setProperty('--book-size', size);
      document.querySelector('.reader-size-value').textContent = Math.round(size * 100) + '%';
      document.querySelector('[data-size="minus"]').disabled = size <= 1;
      document.querySelector('[data-size="plus"]').disabled = size >= 2;
    });
    document.querySelector('[data-size="minus"]').disabled = true;
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
  })();`,
  });
  fs.writeFileSync(
    htmlPath,
    await format(await page.content(), { ...(await resolveConfig(htmlPath)), filepath: htmlPath }),
    "utf8",
  );
  console.log(`${path.basename(pdfPath)}: ${pagination.pages} tagged pages, ${pagination.continuations} continuations`);
  return pagination;
}
