import fs from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { wirdContents, wirdSourceChapter } from "../docs/external-sources/wird-source-navigation.mjs";

const original = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
const documentFor = (theme) =>
  new JSDOM(fs.readFileSync(`docs/external-sources/book3_al_wird_an_nabawi/al_wird_an_nabawi_${theme}.html`, "utf8"))
    .window.document;

describe("Wird source-page navigation and original plates", () => {
  it("links all 45 original contents entries to actual PDF pages and records the original ruku discrepancy", () => {
    expect(wirdContents).toHaveLength(45);
    for (const entry of wirdContents) {
      expect(entry.pdfPage).toBe(entry.printedPage + (entry.title === "دعاء الركوع" ? 0 : 1));
      if (entry.title === "دعاء الركوع") expect(entry.sourceDiscrepancy).toContain("printed p74");
    }
    for (const theme of ["light", "dark", "navy"]) {
      const doc = documentFor(theme);
      expect([...doc.querySelectorAll(".contents-list a")].map((link) => link.getAttribute("href"))).toEqual(
        wirdContents.map((entry) => `#p-${entry.pdfPage}`),
      );
      expect(doc.querySelector("#p-75 .chapter-title").textContent).toBe("دعاء الركوع");
      expect(doc.querySelector("#p-76 .chapter-banner")).toBeNull();
      for (const page of [77, 80, 82, 88, 95, 98]) {
        const unit = doc.querySelector(`#p-${page}`);
        expect(unit.querySelector(".chapter-banner")).toBeNull();
        const heading = unit.querySelector("h3.section-title");
        expect(heading).not.toBeNull();
        expect(heading.previousElementSibling.matches("p")).toBe(true);
        expect(heading.previousElementSibling.textContent.trim()).not.toBe("");
      }
    }
    expect(wirdSourceChapter(original[124])).toBe("دعاء السفر");
    expect(wirdSourceChapter(original[125])).toBe("دعاء السفر");
    expect(wirdSourceChapter(original[126])).toBe("ما يقول المسافر وقت السحر");
    expect(() => wirdSourceChapter({ ...original[50], lines: [] })).toThrow(/Changed Wird navigation/);
  });
  it("restores the author's publication rights and back cover and puts the bedtime image before its report", () => {
    const doc = documentFor("light");
    const all = doc.body.textContent;
    expect(all).not.toContain("وَقْفٌ للهِ تَعَالَى");
    expect(all).not.toContain("يُسْمَحُ بِطِبَاعَتِهِ");
    expect(doc.querySelector("#p-2").textContent).toContain("علي بن عبد الرحمن العويشز");
    expect([...doc.querySelectorAll('[data-source-page="3"]')].map((page) => page.textContent).join(" ")).toContain(
      "حقوق الطبع محفوظة",
    );
    expect(doc.querySelector("#p-17").textContent).toContain("فاصلة بيضاء في الأصل");
    expect(doc.querySelector("#p-137").textContent).toContain("اذكر خالقك لعلك تسعد وتنعم وتهنأ في الدنيا والأخرى");
    const opening = doc.querySelector("#p-34");
    expect(opening.querySelector(".chapter-banner").nextElementSibling.matches(".book-context-figure")).toBe(true);
    expect(doc.querySelector("#p-33 .book-context-figure")).toBeNull();
  });
});
