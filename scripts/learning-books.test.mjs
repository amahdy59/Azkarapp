import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { BOOK_SOURCES } from "./pack-learning-books.mjs";
import { resolveEnglishEdition } from "./english-book-editions.mjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LearningDiagram } from "../src/app/components/LearningDiagram.tsx";
import { publicationDiagram } from "./publication-diagrams.mjs";

const root = path.resolve(import.meta.dirname, "..");
const catalogue = JSON.parse(await fs.readFile(path.join(root, "src/app/learning/catalogue.json"), "utf8"));
const compact = (text) => text.replace(/\s/g, "");

describe("published learning assets", () => {
  it("keeps native diagram paths and labels identical to the verified standalone source", async () => {
    const edition = await resolveEnglishEdition("english-umrah.json");
    for (const block of edition.pages.flatMap((page) => page.blocks.filter((block) => block.type === "diagram"))) {
      const standalone = new JSDOM(publicationDiagram(block)).window.document;
      const native = new JSDOM(
        renderToStaticMarkup(
          React.createElement(
            LearningDiagram,
            { kind: block.kind, title: block.title, description: block.description },
            block.caption,
          ),
        ),
      ).window.document;
      expect([...native.querySelectorAll(".learn-diagram-route")].map((node) => node.getAttribute("d"))).toEqual(
        [...standalone.querySelectorAll(".diagram-route")].map((node) => node.getAttribute("d")),
      );
      expect([...native.querySelectorAll("svg text")].map((node) => node.textContent)).toEqual(
        [...standalone.querySelectorAll("svg text")].map((node) => node.textContent),
      );
      expect(native.querySelector("svg desc").textContent).toBe(block.description);
    }
  });
  it("retains every source-page text, reference and continuation in the HTML reader", async () => {
    for (const source of BOOK_SOURCES) {
      const resource = catalogue.find((item) => item.id === source.id && item.language === "ar");
      expect(resource.status).toBe(source.reviewOnly ? "draft-for-review" : undefined);
      const bytes = await fs.readFile(path.join(root, "docs/learning/assets", resource.pack.path));
      const pack = JSON.parse(gunzipSync(bytes));
      const document = new JSDOM(
        await fs.readFile(path.join(root, "docs/external-sources", source.folder, `${source.file}_light.html`), "utf8"),
      ).window.document;
      const expected = new Map();
      for (const page of document.querySelectorAll(".page")) {
        const clone = page.cloneNode(true);
        clone
          .querySelectorAll(
            ".page-header,.page-footer,.page-frame-outer,.page-frame-inner,.intro-divider-fleuron,[aria-hidden='true'],svg,script,style",
          )
          .forEach((node) => node.remove());
        const number = Number(page.dataset.sourcePage);
        expected.set(number, (expected.get(number) || "") + compact(clone.textContent));
      }
      expect(pack.units.length).toBe(expected.size);
      for (const unit of pack.units)
        expect(compact(unit.text), `${source.id} page ${unit.sourcePage}`).toBe(expected.get(unit.sourcePage));
      expect(pack.language).toBe("ar");
      expect(pack.contents.length).toBe(document.querySelectorAll(".contents-list a").length);
      expect(new Set(pack.units.map((unit) => unit.id)).size).toBe(pack.units.length);
    }
  });

  it("has exact immutable bytes for all text, illustrations and twelve PDFs", async () => {
    expect(catalogue).toHaveLength(4);
    for (const resource of catalogue) {
      for (const asset of [resource.pack, ...resource.images, ...Object.values(resource.pdfs)]) {
        const bytes = await fs.readFile(path.join(root, "docs/learning/assets", asset.path));
        expect(bytes.length).toBe(asset.bytes);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
        expect(asset.path).toMatch(new RegExp(`^${asset.sha256}\\.`));
      }
      const source = BOOK_SOURCES.find((item) => item.id === resource.id);
      for (const [edition, asset] of Object.entries(resource.pdfs)) {
        if (resource.language === "en") {
          const exported = JSON.parse(
            await fs.readFile(path.join(root, "docs/learning/english-export-manifest.json"), "utf8"),
          );
          expect(asset).toEqual(exported.pdfs[edition]);
          const authoring = await fs.readFile(path.join(root, "docs/learning/english-umrah.json"));
          expect(exported.authoringSha256).toBe(createHash("sha256").update(authoring).digest("hex"));
          continue;
        }
        const original = await fs.readFile(
          path.join(root, "docs/external-sources", source.folder, `${source.file}_${edition}.pdf`),
        );
        expect(createHash("sha256").update(original).digest("hex")).toBe(asset.sha256);
      }
    }
  });
  it("retains all completed English units, bilingual Quran, source text and visual teaching content", async () => {
    const edition = await resolveEnglishEdition("english-umrah.json");
    const resource = catalogue.find((item) => item.id === edition.id && item.language === "en");
    const pack = JSON.parse(gunzipSync(await fs.readFile(path.join(root, "docs/learning/assets", resource.pack.path))));
    expect(pack.units).toHaveLength(16);
    const nodes = [];
    const visit = (node) => {
      if (typeof node !== "string") {
        nodes.push(node);
        node.children.forEach(visit);
      }
    };
    for (const page of edition.pages) {
      const unit = pack.units.find((unit) => unit.sourcePage === page.sourcePage);
      unit.nodes.forEach(visit);
      const strings = [];
      for (const block of page.blocks) {
        if (block.text) strings.push(block.text);
        if (block.reference) strings.push(block.reference);
        if (block.type === "quran")
          strings.push(
            edition.pairs[block.binding].arabic,
            edition.pairs[block.binding].english,
            edition.pairs[block.binding].translator,
          );
        if (block.type === "list") strings.push(...block.items);
        if (block.type === "mistake") strings.push(block.wrong, block.right);
        if (block.type === "diagram") strings.push(block.title, block.description, block.caption);
        if (block.type === "steps") for (const step of block.items) strings.push(step.title, step.text);
      }
      for (const text of strings)
        expect(compact(unit.text), `English source p${page.sourcePage}`).toContain(compact(text));
    }
    expect(nodes.filter((node) => node.className === "quran")).toHaveLength(9);
    expect(nodes.filter((node) => node.lang === "ar" && node.dir === "rtl")).toHaveLength(9);
    expect(nodes.filter((node) => node.tag === "illustration")).toHaveLength(6);
    expect(nodes.filter((node) => node.tag === "img")).toHaveLength(4);
    expect(nodes.filter((node) => node.tag === "diagram").map((node) => node.diagram)).toEqual(["tawaf", "sai"]);
    expect(resource.images).toHaveLength(3);
  });
});
