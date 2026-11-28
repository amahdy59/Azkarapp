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
    expect(restored).toHaveLength(48);
    expect(restored.filter((r) => r.number >= 100 && r.number <= 121).map((r) => r.number)).toEqual([
      100, 101, 102, 103, 104, 105, 106, 107, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121,
    ]);
    for (const r of restored) {
      expect(records.find((p) => p.page === r.page).lines).toContain(r.line);
      expect(r.text).not.toMatch(/[\uE000-\uF8FF\uFFFD]/u);
    }
    const original = JSON.parse(fs.readFileSync(path.join(base, "book1_al_mukhtar_pages.json"), "utf8"));
    const extraction = JSON.parse(fs.readFileSync(path.join(base, "mukhtar-extraction-corrections.json"), "utf8"));
    const paragraphs = JSON.parse(fs.readFileSync(path.join(base, "book-source-corrections.json"), "utf8"));
    const prose = JSON.parse(fs.readFileSync(path.join(base, "book-prose-audit-corrections.json"), "utf8"));
    const correctedPages = new Set([
      ...extraction.pages.map((p) => p.page),
      ...MUKHTAR_RESTORATIONS.map((r) => r.page),
      ...paragraphs.changes.filter((p) => p.book === "al-mukhtar").map((p) => p.page),
      ...prose.changes.filter((p) => p.book === "al-mukhtar").map((p) => p.page),
    ]);
    for (const p of records.filter((p) => !correctedPages.has(p.page)))
      expect(p).toEqual(original.find((o) => o.page === p.page));
    const sourceLines = (page) =>
      extraction.pages.find((p) => p.page === page)?.lines ?? original.find((p) => p.page === page).lines;
    const unchanged33 = sourceLines(33).filter((l) => l.trim() !== "107");
    expect(records[32].lines.slice(1, 7)).toEqual(unchanged33.slice(0, 6));
    expect(records[32].lines[7]).toBe("عَنْ رَحْمَةِ مَنْ سِوَاكَ [الطبراني في «الصغير»، بإسناد جيد]");
    expect(records[32].lines.slice(8)).toEqual(unchanged33.slice(7));
    const continuation = sourceLines(35).slice(sourceLines(35).findIndex((l) => l.includes("122")));
    expect(records[34].lines.slice(4, 10)).toEqual(continuation.slice(0, 6));
    expect(records[34].lines[10]).toBe("وَاغْسِلْ حَوْبَتِي، وَأَجِبْ دَعْوَتِي، وَثَبِّتْ");
    expect(records[34].lines.slice(11)).toEqual(continuation.slice(7));
    expect(MUKHTAR_RESTORATIONS.find((r) => r.number === 102).ranges).toEqual([["46:15", 22, 45]]);
    expect(MUKHTAR_RESTORATIONS.find((r) => r.number === 112).ranges).toEqual([["3:53", 1, 9]]);
    // Independent printed-source identities: do not repeat the previous
    // semantically valid but source-mismatched 26:83 and 23:94 substitutions.
    expect(MUKHTAR_RESTORATIONS.find((r) => r.number === 106).ranges).toEqual([["37:100", 1, 5]]);
    expect(MUKHTAR_RESTORATIONS.find((r) => r.number === 116).ranges).toEqual([["29:30", 2, 6]]);
    expect(restored.find((r) => r.number === 106).text).toBe("رَبِّ هَبْ لِى مِنَ ٱلصَّـٰلِحِينَ");
    expect(restored.find((r) => r.number === 116).text).toBe("رَبِّ ٱنصُرْنِى عَلَى ٱلْقَوْمِ ٱلْمُفْسِدِينَ");
  });

  it("does not turn a tenfold reward into ten repetitions", () => {
    expect(exactNotes("مَنْ صَلَّى عَلَيَّ صَلَةً صَلَّى اللهُ عَلَيْهِ بِهَا عَشْرًا", 64)).toEqual([]);
  });

  it("can reconstruct the same source twice without mutating its correction evidence", () => {
    expect(loadRestoredMukhtar()).toEqual(loadRestoredMukhtar());
  });

  it("fails when an annotation would quote wording absent from its source", () => {
    expect(() => exactNotes("كَبَّرَ", 125)).toThrow("Source excerpt missing");
    expect(exactNotes("كَبَّرَ ثَلَاثًا", 125)).toEqual([{ kind: "repeat", quotes: ["كَبَّرَ ثَلَاثًا"] }]);
    // The printed p118 narration has no repetition count. The previous
    // substituted rain narration must not leave a count on the wind passage.
    expect(exactNotes("مَرَّتَيْنِ أَوْ ثَلَاثًا", 118)).toEqual([]);
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
      // Repeat/virtue callouts quote the adjacent narration. Original source
      // footnotes are separate source text, not repeated callout excerpts.
      for (const note of d.querySelectorAll(".source-note-repeat,.source-note-virtue")) {
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
      if (edition.startsWith("book1_"))
        expect([...d.querySelectorAll(".devotional-flow > aside.source-note")].map((note) => note.textContent)).toEqual(
          ["(١) وَيُسَمِّيهِ.", "(١) وَيُسَمِّي الدَّاعِي حَاجَتَهُ."],
        );
      for (const img of d.images) {
        expect(img.alt.trim()).not.toBe("");
        expect(img.width).toBeGreaterThan(0);
        expect(img.height).toBeGreaterThan(0);
      }
    });
  }
});
