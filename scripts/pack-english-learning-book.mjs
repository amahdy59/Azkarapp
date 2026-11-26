import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { JSDOM } from "jsdom";
import { buildEnglishEditions, editionHtml, resolveEnglishEdition, EDITION_OUTPUT } from "./english-book-editions.mjs";

const clean = (text) => text.replace(/\s+/g, " ").trim();
const tags = new Set([
  "header",
  "div",
  "p",
  "span",
  "strong",
  "em",
  "br",
  "ul",
  "ol",
  "li",
  "aside",
  "blockquote",
  "figure",
  "figcaption",
  "h2",
  "h3",
  "h4",
  "a",
  "img",
  "section",
  "footer",
]);
const classes = [
  ["publication-header", "cover"],
  ["publication-photo", "photo"],
  ["quran-pair", "quran"],
  ["quran-arabic", "quote"],
  ["meaning", "meaning"],
  ["pair-reference", "metadata"],
  ["translator", "meta"],
  ["source-reference", "meta"],
  ["context", "note"],
  ["mistake-card", "panel"],
  ["edition-steps", "steps"],
  ["step-number", "number"],
];

/** Converts the same source-verified edition to safe native reader nodes. */
export async function extractEnglishLearningBook(edition, storeAsset) {
  const document = new JSDOM(await editionHtml(edition)).window.document;
  const images = new Map();
  async function node(source) {
    if (source.nodeType === 3) return source.textContent.replace(/\s+/g, " ");
    if (
      source.nodeType !== 1 ||
      source.matches("script,style,.back-to-contents,.source-page,.pdf-reference,.pdf-pagination-help,.draft-notice")
    )
      return null;
    if (source.matches(".teaching-diagram")) {
      return {
        tag: "diagram",
        diagram: source.dataset.diagram,
        label: clean(source.querySelector("h4").textContent),
        alt: clean(source.querySelector("desc").textContent),
        children: (await Promise.all([...source.querySelector("figcaption").childNodes].map(node))).filter(Boolean),
      };
    }
    if (source.matches(".edition-steps svg")) {
      const artwork = [...document.querySelectorAll(".edition-steps > li")].indexOf(source.closest("li")) + 1;
      if (artwork < 1 || artwork > 6) throw new Error("Unknown English Umrah stage");
      return { tag: "illustration", artwork, children: [] };
    }
    if (source.matches('svg,[aria-hidden="true"]')) return null;
    const original = source.tagName.toLowerCase();
    const tag = original === "h1" ? "h2" : tags.has(original) ? original : "div";
    if (tag === "img") {
      const match = source.getAttribute("src")?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s);
      if (!match) throw new Error("English publication image must be embedded");
      const asset = await storeAsset(Buffer.from(match[2], "base64"), match[1], match[1].split("/")[1]);
      images.set(asset.path, asset);
      return { tag, asset: asset.path, alt: source.getAttribute("alt") || "", children: [] };
    }
    const children = (await Promise.all([...source.childNodes].map(node))).filter((value) => value !== null);
    if (!children.length && tag !== "br") return null;
    const result = { tag, children };
    const className = classes.find(([name]) => source.classList.contains(name))?.[1];
    if (className) result.className = className;
    if (source.matches(".edition-steps > li > a")) result.className = "panel";
    const lang = source.getAttribute("lang");
    if (lang === "ar" || lang === "en") result.lang = lang;
    const dir = source.getAttribute("dir");
    if (dir === "rtl" || dir === "ltr") result.dir = dir;
    const href = source.getAttribute("href");
    const target = href?.match(/^#(p-[1-9]\d*)$/)?.[1];
    if (tag === "a" && target) result.target = target;
    if (tag === "a" && href?.startsWith("https://")) result.href = href;
    return result;
  }
  const textOf = (item) =>
    typeof item === "string"
      ? item
      : [item.label, item.tag === "diagram" ? item.alt : "", ...item.children.map(textOf)].filter(Boolean).join(" ");
  const units = [];
  for (const source of document.querySelectorAll(".edition-unit")) {
    const nodes = (await Promise.all([...source.childNodes].map(node))).filter((value) => value !== null);
    if (Number(source.dataset.sourcePage) === edition.presentation.coverSourcePage) {
      const about = await node(document.querySelector("#about-this-edition > div"));
      nodes.push({ tag: "h3", children: ["About this edition"] }, about);
    }
    units.push({
      id: source.id,
      sourcePage: Number(source.dataset.sourcePage),
      title: edition.pages.find((page) => page.sourcePage === Number(source.dataset.sourcePage)).title,
      nodes,
      text: clean(nodes.map(textOf).join(" ")),
    });
  }
  const contents = edition.pages.flatMap((page) =>
    page.blocks
      .filter((block) => block.type === "contents")
      .flatMap((block) => block.entries.map(([page, title]) => ({ title, unitId: `p-${page}` }))),
  );
  return { units, contents, images: [...images.values()] };
}

export async function packEnglishLearningBook(storeAsset) {
  await buildEnglishEditions();
  const edition = await resolveEnglishEdition("english-umrah.json");
  const { units, contents, images } = await extractEnglishLearningBook(edition, storeAsset);
  const pack = await storeAsset(
    gzipSync(JSON.stringify({ schema: 1, resourceId: edition.id, language: "en", units, contents }), { level: 9 }),
    "application/gzip",
    "bin",
  );
  const pdfs = {};
  for (const appearance of ["light", "dark", "navy"])
    pdfs[appearance] = await storeAsset(
      await fs.readFile(path.join(EDITION_OUTPUT, `${edition.id}-english-${appearance}.pdf`)),
      "application/pdf",
      "pdf",
    );
  const authoring = await fs.readFile(path.resolve("docs/learning/english-umrah.json"));
  await fs.writeFile(
    path.resolve("docs/learning/english-export-manifest.json"),
    JSON.stringify(
      {
        resourceId: edition.id,
        language: "en",
        status: "draft-for-review",
        authoringSha256: createHash("sha256").update(authoring).digest("hex"),
        sourceSha256: edition.sourceSha256,
        pdfs,
      },
      null,
      2,
    ) + "\n",
  );
  return {
    id: edition.id,
    kind: edition.kind,
    language: "en",
    status: "draft-for-review",
    title: edition.title,
    author: edition.author,
    pack,
    images,
    pdfs,
  };
}
