import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { JSDOM } from "jsdom";
import { fileURLToPath } from "node:url";
import { Buffer } from "node:buffer";
import { packEnglishLearningBook } from "./pack-english-learning-book.mjs";

export const BOOK_SOURCES = [
  { id: "al-mukhtar", folder: "book1_al_mukhtar", file: "al_mukhtar", reviewOnly: true },
  { id: "dalil-al-mutamir", folder: "book2_dalil_al_mutamir", file: "dalil_al_mutamir" },
  { id: "al-wird-an-nabawi", folder: "book3_al_wird_an_nabawi", file: "al_wird_an_nabawi", reviewOnly: true },
];
const root = path.resolve(import.meta.dirname, "..");
const assetDirectory = path.join(root, "docs/learning/assets");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const clean = (text) => text.replace(/\s+/g, " ").trim();
const tags = new Set([
  "div",
  "p",
  "span",
  "bdi",
  "strong",
  "em",
  "b",
  "i",
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
]);
const skip =
  ".page-header,.page-footer,.page-frame-outer,.page-frame-inner,.book-icon,.chapter-badge,.intro-divider-fleuron,script,style";
const styles = [
  [/book-context-figure/, "visual"],
  [/photo-hero-box/, "photo"],
  [/book-cover/, "cover"],
  [/dua-card$|hadith-card|section-box|adab-card|advisory-card|conclusion-card|intro-card-luxury|catalog-box/, "panel"],
  [/quran-quote|quran-ayah/, "quote"],
  [/^source-note(?:\s|$)|vocab-panel/, "note"],
  [/takhrij|ayah-ref|narrator-line|signature-title|photo-hero-overlay/, "meta"],
  [/dua-text|dua-matn|hadith-text|body-text|intro-body-p|adab-text|step-text/, "text"],
  [/dua-card-header|dua-card-meta-right/, "metadata"],
  [/num-pill|step-num$|adab-num/, "number"],
  [/mistake-card/, "panel"],
  [/mistake-row/, "mistake"],
  [/correct-row/, "correct"],
  [/roadmap-grid/, "steps"],
  [/roadmap-card/, "panel"],
  [/title|intro-besmalah|signature-name/, "title"],
];

export async function extractBook(document, storeAsset) {
  const images = new Map();
  async function node(source) {
    if (source.nodeType === 3) return source.textContent.replace(/\s+/g, " ");
    if (source.nodeType !== 1 || source.matches(skip)) return null;
    if (source.matches(".teaching-diagram"))
      return {
        tag: "diagram",
        diagram: source.dataset.diagram,
        lang: source.lang === "ar" ? "ar" : "en",
        label: clean(source.querySelector("h4").textContent),
        alt: clean(source.querySelector("desc").textContent),
        children: (await Promise.all([...source.querySelector("figcaption").childNodes].map(node))).filter(Boolean),
      };
    if (source.matches("svg.step-art")) {
      const artwork = [...document.querySelectorAll(".roadmap-card")].indexOf(source.closest(".roadmap-card")) + 1;
      if (artwork < 1 || artwork > 6) throw new Error("Unknown Umrah stage illustration");
      return { tag: "illustration", artwork, children: [] };
    }
    if (source.getAttribute("aria-hidden") === "true" || source.tagName.toLowerCase() === "svg") return null;
    const originalTag = source.tagName.toLowerCase();
    const tag = source.classList.contains("photo-hero-box")
      ? "figure"
      : source.classList.contains("photo-hero-overlay")
        ? "figcaption"
        : originalTag === "h1"
          ? "h2"
          : tags.has(originalTag)
            ? originalTag
            : "div";
    if (tag === "img") {
      const match = source.getAttribute("src")?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s);
      if (!match) throw new Error("Book image must have a local embedded source");
      const bytes = Buffer.from(match[2], "base64");
      const asset = await storeAsset(bytes, match[1], match[1].split("/")[1]);
      images.set(asset.path, asset);
      return { tag, asset: asset.path, alt: source.getAttribute("alt") || "", children: [] };
    }
    const children = (await Promise.all([...source.childNodes].map(node))).filter((child) => child !== null);
    if (!children.length && tag !== "br") return null;
    const result = { tag, children };
    if (tag === "bdi" && source.getAttribute("dir") === "ltr") result.dir = "ltr";
    const className = styles.find(([pattern]) => pattern.test(source.getAttribute("class") || ""))?.[1];
    if (className) result.className = className;
    const target = source.getAttribute("href")?.match(/^#(p-\d+)(?:-part-\d+)?$/)?.[1];
    if (tag === "a" && target) result.target = target;
    return result;
  }
  const units = [];
  let title = document.querySelector(".cover-title,h1")?.textContent || document.title.split("—")[0];
  for (const page of document.querySelectorAll(".page")) {
    const sourcePage = Number(page.dataset.sourcePage);
    if (!Number.isInteger(sourcePage) || sourcePage < 1) throw new Error("Missing source page");
    const heading = page.querySelector(".chapter-title");
    if (heading) title = clean(heading.textContent);
    const nodes = (await Promise.all([...page.childNodes].map(node))).filter((child) => child !== null);
    const textOf = (item) =>
      typeof item === "string"
        ? item
        : [item.label, item.tag === "diagram" ? item.alt : "", ...item.children.map(textOf)].filter(Boolean).join(" ");
    const text = clean(nodes.map(textOf).join(" "));
    if (!text) throw new Error(`Empty book source page ${sourcePage}`);
    const previous = units.at(-1);
    if (previous?.sourcePage === sourcePage) {
      previous.nodes.push(...nodes);
      previous.text += ` ${text}`;
    } else units.push({ id: `p-${sourcePage}`, title: clean(title), sourcePage, nodes, text });
  }
  const contents = [...document.querySelectorAll(".contents-list a")].map((link) => ({
    title: clean(link.querySelector(".toc-item-title")?.textContent || link.textContent),
    unitId: link.getAttribute("href")?.slice(1),
  }));
  for (const item of contents)
    if (!units.some((unit) => unit.id === item.unitId)) throw new Error(`Broken contents ${item.unitId}`);
  return { units, contents, images: [...images.values()] };
}

export async function packLearningBooks({ preserveEnglish = false } = {}) {
  const previousCatalogue = JSON.parse(await fs.readFile(path.join(root, "src/app/learning/catalogue.json"), "utf8"));
  await fs.mkdir(assetDirectory, { recursive: true });
  const storeAsset = async (bytes, mime, extension) => {
    const digest = sha256(bytes);
    const filename = `${digest}.${extension}`;
    await fs.writeFile(path.join(assetDirectory, filename), bytes);
    return { path: filename, sha256: digest, bytes: bytes.length, mime };
  };
  const resources = [];
  for (const source of BOOK_SOURCES) {
    const directory = path.join(root, "docs/external-sources", source.folder);
    const document = new JSDOM(await fs.readFile(path.join(directory, `${source.file}_light.html`), "utf8")).window
      .document;
    const { units, contents, images } = await extractBook(document, storeAsset);
    const pack = { schema: 1, resourceId: source.id, language: "ar", units, contents };
    const asset = await storeAsset(gzipSync(JSON.stringify(pack), { level: 9 }), "application/gzip", "bin");
    const previous = previousCatalogue.find((item) => item.id === source.id && item.language === "ar");
    const history = [previous?.pack, ...(previous?.previousPacks ?? [])].filter(
      (item) => item && item.sha256 !== asset.sha256,
    );
    const previousPacks = [...new Map(history.map((item) => [item.sha256, item])).values()];
    const pdfs = {};
    for (const edition of ["light", "dark", "navy"]) {
      const bytes = await fs.readFile(path.join(directory, `${source.file}_${edition}.pdf`));
      pdfs[edition] = await storeAsset(bytes, "application/pdf", "pdf");
    }
    resources.push({
      id: source.id,
      kind: "book",
      language: "ar",
      ...(source.reviewOnly ? { status: "draft-for-review" } : {}),
      pack: asset,
      ...(previousPacks.length ? { previousPacks } : {}),
      images,
      pdfs,
    });
    console.log(
      `${source.id}: ${units.length} source pages, ${contents.length} contents entries, ${asset.bytes} text bytes, ${images.length} images`,
    );
  }
  if (preserveEnglish) {
    const previous = JSON.parse(await fs.readFile(path.join(root, "src/app/learning/catalogue.json"), "utf8"));
    const english = previous.filter((item) => item.language === "en");
    if (english.length !== 1) throw new Error("Expected the existing English edition");
    for (const asset of [english[0].pack, ...english[0].images, ...Object.values(english[0].pdfs)]) {
      const bytes = await fs.readFile(path.join(assetDirectory, asset.path));
      if (sha256(bytes) !== asset.sha256 || bytes.length !== asset.bytes)
        throw new Error("English asset identity changed");
    }
    resources.push(...english);
  } else resources.push(await packEnglishLearningBook(storeAsset));
  await fs.mkdir(path.join(root, "src/app/learning"), { recursive: true });
  await fs.writeFile(path.join(root, "src/app/learning/catalogue.json"), JSON.stringify(resources, null, 2) + "\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await packLearningBooks({ preserveEnglish: process.argv.includes("--preserve-english") });
