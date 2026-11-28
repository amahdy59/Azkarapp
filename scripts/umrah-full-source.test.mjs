import fs from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { sourceReviewHtml } from "./render-umrah-source-review.mjs";

describe("full Umrah source restoration boundary", () => {
  const manifest = JSON.parse(fs.readFileSync("docs/learning/source-editions/umrah-original-manifest.json", "utf8"));
  const source = JSON.parse(fs.readFileSync("docs/learning/source-editions/umrah-full-source.ar.json", "utf8"));
  it("preserves the exact complete original and all source-page identities", () => {
    const bytes = fs.readFileSync(manifest.original.path);
    expect(bytes.length).toBe(manifest.original.bytes);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(source.originalPdfSha256);
    expect(source.pages.map((page) => page.page)).toEqual(Array.from({ length: 138 }, (_, index) => index + 1));
    expect(new Set(source.pages.map((page) => page.unitId)).size).toBe(138);
    expect(source.readingFormat).toBe("reflowable-semantic-text");
  });
  it("preserves all three exact originals and inventories every original page", () => {
    const originals = JSON.parse(fs.readFileSync("docs/learning/source-editions/originals.json", "utf8"));
    const candidates = JSON.parse(fs.readFileSync("docs/learning/audit/source-candidates-2026-11-27.json", "utf8"));
    expect(originals.books.map((book) => book.pages)).toEqual([64, 137, 138]);
    for (const book of originals.books) {
      const bytes = fs.readFileSync(book.path);
      expect(bytes.length).toBe(book.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(book.sha256);
      const candidate = candidates.sources.find((item) => item.originalPdfSha256 === book.sha256);
      expect(candidate.pages.map((page) => page.page)).toEqual(
        Array.from({ length: book.pages }, (_, index) => index + 1),
      );
    }
  });
  it("keeps pending OCR out of approved text and records original attribution rather than the adaptation foreword", () => {
    expect(source.status).toBe("in-progress-not-activated");
    for (const page of source.pages) {
      expect(page.sourceImageSha256).toMatch(/^[a-f0-9]{64}$/);
      if (page.status === "pending-transcription") expect(page.blocks).toEqual([]);
      else expect(page.blocks.length).toBeGreaterThan(0);
    }
    const introduction = source.pages.find((page) => page.page === 9);
    expect(introduction.blocks.some((block) => block.text?.includes("وقد ساعدني في جمعه بعض طلبة العلم المحبين"))).toBe(
      true,
    );
    expect(introduction.blocks.some((block) => block.text?.includes("بمراجعة ونشر"))).toBe(false);
    expect(source.pages[2].blocks.find((block) => block.type === "list").items).toHaveLength(16);
    expect(manifest.legacyIdentity).toBe("dalil-al-mutamir");
    expect(manifest.legacyEnglishIdentity).toBe("dalil-al-mutamir:en");
  });
  it("renders every compared page with complete Quran ranges, semantic footnotes and an honest progress notice", () => {
    const doc = new JSDOM(sourceReviewHtml()).window.document;
    const compared = source.pages.filter((page) => page.status === "source-image-compared");
    expect([...doc.querySelectorAll(".source-unit")].map((page) => page.id)).toEqual(
      compared.map((page) => page.unitId),
    );
    expect(doc.querySelector(".review-state").textContent).toContain(`${compared.length}`);
    expect(doc.querySelector(".review-state").textContent).toContain("١٣٨");
    expect(doc.querySelectorAll("aside.source-footnote").length).toBe(
      compared.flatMap((page) => page.blocks).filter((block) => block.type === "footnote").length,
    );
    expect(doc.querySelector("#p-35").textContent.trim()).toMatch(/رواه$/);
    expect(doc.querySelector("#p-36 p").textContent).toBe("البخاري ومسلم.");
    expect(doc.querySelector("#p-37 p").textContent).toContain("انتقضت الطهارة");
    expect(doc.querySelector("#p-42 .quran").textContent).not.toContain("وَإِذْ");
    for (const pending of source.pages.filter((page) => page.status === "pending-transcription"))
      expect(doc.getElementById(pending.unitId)).toBeNull();
  });
});
