import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { exactNotes, loadRestoredMukhtar, MUKHTAR_RESTORATIONS } from "../docs/external-sources/book-content.mjs";

const base = path.resolve(import.meta.dirname, "../docs/external-sources");
const editions = [
  "book1_al_mukhtar/al_mukhtar",
  "book2_dalil_al_mutamir/dalil_al_mutamir",
  "book3_al_wird_an_nabawi/al_wird_an_nabawi",
];

describe("devotional book content integrity", () => {
  it("pins composite-mark text mappings to the actual embedded fonts", () => {
    const map = JSON.parse(fs.readFileSync(path.join(base, "assets/font-unicode-map.json"), "utf8"));
    expect(map.sourceSha256).toBe(
      createHash("sha256")
        .update(fs.readFileSync(path.join(base, "fonts_base64.json")))
        .digest("hex"),
    );
    expect(map.fonts["IBMPlexSansArabic-Bold"]["1211"]).toBe("06500651");
    for (const font of Object.values(map.fonts)) expect(Object.values(font)).not.toContain("0000");
  });
  it("restores all 22 sequential source entries, 100 through 121, from exact reviewed Quran word ranges", () => {
    const { records, restored } = loadRestoredMukhtar();
    expect(restored).toHaveLength(19);
    expect(restored.map((r) => r.number)).toEqual([
      100, 101, 102, 103, 104, 105, 106, 107, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121,
    ]);
    for (const r of restored) {
      expect(records.find((p) => p.page === r.page).lines).toContain(r.line);
      expect(r.text).not.toMatch(/[\uE000-\uF8FF\uFFFD]/u);
    }
    const original = JSON.parse(fs.readFileSync(path.join(base, "book1_al_mukhtar_pages.json"), "utf8"));
    for (const p of records.filter((p) => ![32, 33, 34, 35].includes(p.page)))
      expect(p).toEqual(original.find((o) => o.page === p.page));
    expect(records[32].lines.slice(1)).toEqual(original[32].lines.filter((l) => l.trim() !== "107"));
    expect(records[34].lines.slice(4)).toEqual(
      original[34].lines.slice(original[34].lines.findIndex((l) => l.includes("122"))),
    );
    expect(MUKHTAR_RESTORATIONS.find((r) => r.number === 102).ranges).toEqual([["46:15", 22, 45]]);
    expect(MUKHTAR_RESTORATIONS.find((r) => r.number === 112).ranges).toEqual([["3:53", 1, 9]]);
  });

  it("does not turn a tenfold reward into ten repetitions", () => {
    expect(exactNotes("مَنْ صَلَّى عَلَيَّ صَلَةً صَلَّى اللهُ عَلَيْهِ بِهَا عَشْرًا", 64)).toEqual([]);
  });

  it("fails when an annotation would quote wording absent from its source", () => {
    expect(() => exactNotes("مَرَّتَيْنِ", 118)).toThrow("Source excerpt missing");
    expect(exactNotes("مَرَّتَيْنِ أَوْ ثَلَاثًا", 118)).toEqual([
      { kind: "repeat", quotes: ["مَرَّتَيْنِ أَوْ ثَلَاثًا"] },
    ]);
  });
});

describe.each(editions)("standalone edition %s", (edition) => {
  for (const theme of ["light", "dark", "navy"]) {
    it(`${theme}: every fragment resolves, notes quote the exact reading, and extracted number-only cards are absent`, () => {
      const d = new JSDOM(fs.readFileSync(path.join(base, `${edition}_${theme}.html`), "utf8")).window.document;
      const ids = [...d.querySelectorAll("[id]")].map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of d.querySelectorAll('a[href^="#"]'))
        expect(d.getElementById(a.hash.slice(1)), a.hash).not.toBeNull();
      expect(d.documentElement.lang).toBe("ar");
      expect(d.documentElement.dir).toBe("rtl");
      expect(d.querySelector("main")).not.toBeNull();
      expect(d.querySelector('meta[name="viewport"]')).not.toBeNull();
      expect(d.querySelector(".pdf-download").getAttribute("href")).toMatch(/\.pdf$/);
      expect(d.querySelectorAll(".contents-list").length).toBeGreaterThan(0);
      for (const text of d.querySelectorAll(".dua-text,.hadith-text"))
        expect(text.textContent.trim()).not.toMatch(/^\d+(?:\s+\d+)*$/);
      for (const note of d.querySelectorAll(".source-note")) {
        const p = note.closest(".page");
        const sameSource = [...d.querySelectorAll(`.page[data-source-page="${p.dataset.sourcePage}"]`)];
        const source = sameSource
          .map((e) => e.querySelector(".hadith-text")?.textContent ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        const quotes = [...note.childNodes]
          .filter((n) => n.nodeType === 3)
          .flatMap((n) => n.textContent.replace(/\s+/g, " ").trim().split(" […] "))
          .filter(Boolean);
        for (const quote of quotes) expect(source).toContain(quote);
      }
      for (const img of d.images) {
        expect(img.alt.trim()).not.toBe("");
        expect(img.width).toBeGreaterThan(0);
        expect(img.height).toBeGreaterThan(0);
      }
    });
  }
});
