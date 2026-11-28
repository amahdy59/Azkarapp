import fs from "node:fs/promises";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
  resolveEnglishEdition,
  editionHtml,
  resolveWirdSourceOverrides,
  validatePublicationMetadata,
} from "./english-book-editions.mjs";
import {
  normalizePublicationPreferences,
  createPublicationPreferenceStore,
} from "../docs/learning/publication-preferences.mjs";

const edition = await resolveEnglishEdition("english-umrah.json");

describe("complete English editions", () => {
  it("covers every source page exactly once, including continuation sheets", () => {
    expect(edition.pages.map((page) => page.sourcePage)).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
    for (const page of edition.pages) {
      expect(page.sourceArabic.length).toBeGreaterThan(80);
      expect(page.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(page.blocks.length).toBeGreaterThan(0);
    }
    expect(edition.pages[5].sourceArabic).toContain("الاِشْتِرَاطُ");
    expect(edition.pages[11].sourceArabic).toContain("عُمَرُ");
    expect(edition.scope).toContain("16-source-page");
    expect(edition.scope).toContain("not a translation of all 138");
  });

  it("retains all nine paired Quran passages and the accepted sample wording", async () => {
    expect(Object.keys(edition.pairs)).toHaveLength(9);
    const document = new JSDOM(await editionHtml(edition)).window.document;
    const pairs = [...document.querySelectorAll(".quran-pair")];
    expect(pairs).toHaveLength(9);
    for (const pair of Object.values(edition.pairs)) {
      const node = document.querySelector(`[data-quran-ref="${pair.ref}"]`);
      expect(node.querySelector('[lang="ar"]').textContent).toBe(pair.arabic);
      expect(node.querySelector('[lang="ar"]').getAttribute("dir")).toBe("rtl");
      expect(node.querySelector('.meaning [lang="en"]').textContent).toBe(pair.english);
      expect(node.querySelector(".translator").textContent).toBe("Saheeh International");
      expect(edition.pages.some((page) => page.sourceArabic.includes(pair.arabic))).toBe(true);
    }
  });

  it("keeps every contents and stage link valid, with all original illustrations and photographs", async () => {
    const document = new JSDOM(await editionHtml(edition)).window.document;
    for (const link of document.querySelectorAll('a[href^="#"]'))
      expect(document.getElementById(link.getAttribute("href").slice(1))).not.toBeNull();
    expect(document.querySelectorAll(".edition-steps li")).toHaveLength(6);
    expect(document.querySelectorAll(".edition-steps svg")).toHaveLength(6);
    expect(document.querySelectorAll('.edition-steps svg[aria-hidden="true"]')).toHaveLength(6);
    expect(document.querySelectorAll(".publication-photo img")).toHaveLength(4);
    expect(document.querySelectorAll(".mistake-card")).toHaveLength(6);
    expect(document.querySelectorAll('.edition-unit[data-source-page="7"] ol li')).toHaveLength(9);
    expect(document.querySelectorAll('.edition-unit[data-source-page="15"] ol li')).toHaveLength(16);
  });

  it("keeps corpus values and exact corresponding excerpt boundaries traceable", async () => {
    for (const pair of Object.values(edition.pairs)) {
      const corpus = JSON.parse(await fs.readFile(pair.translationPath, "utf8"));
      const full = corpus[pair.ref.split(":")[1]];
      expect(full).toContain(pair.english);
      if (pair.mode === "full") expect(full).toBe(pair.english);
      else expect(full).not.toBe(pair.english);
    }
    const source = new JSDOM(await editionHtml(edition)).window.document;
    expect(source.documentElement.lang).toBe("en");
    expect(source.querySelector(".draft-notice").textContent).toContain("Independent review pending");
    expect(source.querySelector(".publication-about").textContent).toContain("review remain pending");
  });

  it("presents the cover once while retaining all source statements in accessible edition details", async () => {
    const document = new JSDOM(await editionHtml(edition)).window.document;
    expect([...document.querySelectorAll("h1,h2")].filter((node) => node.textContent === edition.title)).toHaveLength(
      1,
    );
    expect(document.querySelectorAll(".author")).toHaveLength(1);
    for (const block of edition.pages[0].blocks.filter((item) => item.text))
      expect(document.querySelector("main").textContent).toContain(block.text);
    expect(document.querySelector(".publication-about").tagName).toBe("DETAILS");
    expect(document.querySelector(".publication-about").textContent).toContain(edition.scope);
    expect(document.querySelectorAll("dialog[data-dropdown-surface]")).toHaveLength(2);
  });

  it("binds both functional route diagrams to the source and preserves seven alternating passages", async () => {
    const document = new JSDOM(await editionHtml(edition)).window.document;
    expect(document.querySelectorAll(".teaching-diagram")).toHaveLength(2);
    const tawaf = document.querySelector('[data-diagram="tawaf"]');
    expect(tawaf.dataset.diagramSource).toBe("8");
    expect(tawaf.querySelector("desc").textContent).toContain("anticlockwise");
    expect(tawaf.querySelector(".diagram-route").getAttribute("d")).toContain("A76 76 0 1 0");
    const sai = document.querySelector('[data-diagram="sai"]');
    expect(sai.dataset.diagramSource).toBe("9");
    expect(sai.querySelectorAll("[data-passage]")).toHaveLength(7);
    expect([...sai.querySelectorAll("[data-passage]")].map((line) => line.getAttribute("d").startsWith("M70"))).toEqual(
      [true, false, true, false, true, false, true],
    );
    for (const svg of document.querySelectorAll('.teaching-diagram svg[role="img"]')) {
      for (const id of svg.getAttribute("aria-labelledby").split(" "))
        expect(document.getElementById(id)?.textContent).toBeTruthy();
    }
  });

  it("validates metadata for all Learn kinds and rejects an incorrect contents target", () => {
    for (const kind of ["book", "guide", "hadith-collection"])
      expect(() => validatePublicationMetadata({ ...edition, kind })).not.toThrow();
    expect(() => validatePublicationMetadata({ ...edition, kind: "quiz" })).toThrow("resource kind");
    expect(() =>
      validatePublicationMetadata({ ...edition, presentation: { ...edition.presentation, contentsSourcePage: 6 } }),
    ).toThrow("contents source");
    expect(() =>
      validatePublicationMetadata({ ...edition, presentation: { ...edition.presentation, aboutCoverBlocks: [0] } }),
    ).toThrow("publication details");
  });
});

describe("standalone document preference boundary", () => {
  it("normalizes corrupt, unsupported and out-of-range input without reading app state", () => {
    expect(normalizePublicationPreferences(null)).toEqual({ schema: 1, appearance: "light", size: 1 });
    expect(normalizePublicationPreferences({ schema: 1, appearance: "navy", size: 1.75, other: 42 })).toEqual({
      schema: 1,
      appearance: "navy",
      size: 1.75,
    });
    expect(normalizePublicationPreferences({ schema: 1, appearance: "red", size: 5 })).toEqual({
      schema: 1,
      appearance: "light",
      size: 1,
    });
    expect(normalizePublicationPreferences({ schema: 20, appearance: "dark", size: 2 }).appearance).toBe("light");
  });

  it("round-trips only its own key and tolerates corrupt or denied storage", () => {
    const records = new Map([["azkar.app", "keep"]]);
    const store = createPublicationPreferenceStore({
      getItem: (key) => records.get(key),
      setItem: (key, value) => records.set(key, value),
    });
    expect(store.save({ schema: 1, appearance: "dark", size: 1.5 })).toBe(true);
    expect(store.load()).toEqual({ schema: 1, appearance: "dark", size: 1.5 });
    expect(records.get("azkar.app")).toBe("keep");
    records.set("azkar.document-reader.v1", "bad JSON");
    expect(store.load().size).toBe(1);
    const denied = createPublicationPreferenceStore({
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
    });
    expect(denied.load().appearance).toBe("light");
    expect(denied.save({ schema: 1, appearance: "dark", size: 2 })).toBe(false);
  });
});

describe("owner-approved original-source corrections", () => {
  it("keeps the complete travel supplication, chain, return wording, glossary and repetition distinct", async () => {
    const ledger = await resolveWirdSourceOverrides();
    const travel = ledger.changes.find((change) => change.id === "wird-125-126-complete-travel");
    expect(travel.originalPdfPages).toEqual([125, 126]);
    expect(travel.printedPages).toEqual([124, 125]);
    expect(travel.englishIntroduction).toContain("Ibn Jurayj");
    expect(travel.englishIntroduction).toContain("Ali al-Azdi");
    expect(travel.repetition.count).toBe(3);
    expect(travel.englishSupplication).not.toMatch(/\.\.\.|…/u);
    expect(travel.englishSupplication).toContain("property and family");
    expect(travel.englishReturnSupplication).toBe("We are returning, repenting, worshipping and praising our Lord.");
    expect(travel.glossary).toHaveLength(5);
    expect(travel.nextNarration).toContain("uphill");
    expect(travel.quran.map((pair) => pair.ref)).toEqual(["43:13", "43:14"]);
    for (const pair of travel.quran) {
      expect(travel.sourceArabic[0]).toContain(pair.arabic);
      expect(pair.translator).toBe("Saheeh International");
      expect(pair.english.length).toBeGreaterThan(30);
    }
    expect(travel.sourceArabic[0]).toContain("تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا");
    expect(travel.sourceArabic[0]).not.toContain("تَرْضَى...");
    expect(ledger.originalPdfSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("resolves the broken narrator name without claiming independent approval", async () => {
    const ledger = await resolveWirdSourceOverrides();
    const evening = ledger.changes.find((change) => change.id === "wird-18-narrator-order");
    expect(evening.englishIntroduction).toContain("Abd al-Rahman ibn Yazid narrated from Abdullah ibn Masud");
    expect(evening.englishSupplication).toContain("this night and the good after it");
    expect(evening.englishReviewStatus).toContain("independent language/source review pending");
    expect(evening.arabicReviewStatus).toContain("pending");
  });
});
