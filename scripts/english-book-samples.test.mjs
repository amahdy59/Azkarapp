import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { exactExcerpt, resolveEnglishSamples, sampleHtml } from "./english-book-samples.mjs";

const root = path.resolve(import.meta.dirname, "..");
const samples = await resolveEnglishSamples();
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

describe("English book review samples", () => {
  it("retains every selected Arabic Qur'an passage beside an attributed English meaning", async () => {
    expect(samples).toHaveLength(3);
    let pairs = 0;
    for (const sample of samples) {
      const document = new JSDOM(await sampleHtml(sample)).window.document;
      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
      expect(document.querySelector(".draft-notice").textContent).toContain("not a complete English edition");
      const shown = [...document.querySelectorAll(".quran-pair")];
      const expected = sample.sections.flatMap((section) => section.pairs);
      expect(shown).toHaveLength(expected.length);
      for (const [index, pair] of expected.entries()) {
        pairs++;
        const arabic = shown[index].querySelector(".quran-arabic");
        const english = shown[index].querySelector('.meaning [lang="en"]');
        expect(arabic.lang).toBe("ar");
        expect(arabic.dir).toBe("rtl");
        expect(arabic.textContent).toBe(pair.arabic);
        expect(english.dir).toBe("ltr");
        expect(english.textContent).toBe(pair.english);
        expect(shown[index].querySelector(".label").textContent).toContain("translation of meaning");
        expect(shown[index].querySelector(".translator").textContent).toBe("Saheeh International");
      }
    }
    expect(pairs).toBe(9);
  });

  it("copies English from the existing corpus and keeps precise excerpt boundaries", async () => {
    for (const sample of samples)
      for (const section of sample.sections)
        for (const pair of section.pairs) {
          const bytes = await fs.readFile(path.join(root, pair.translationPath));
          expect(hash(bytes)).toBe(pair.translationSha256);
          const verse = JSON.parse(bytes)[pair.ref.split(":")[1]];
          expect(pair.fullEnglish).toBe(verse);
          expect(verse).toContain(pair.english);
          if (pair.mode === "full") expect(pair.english).toBe(verse);
          else expect(pair.english).not.toBe(verse);
          expect(section.sourceArabic).toContain(pair.arabic);
        }
    expect(() => exactExcerpt("missing", "start", "end")).toThrow();
    expect(() => exactExcerpt("same same end", "same", "end")).toThrow();
  });

  it("retains references, repetition and surah-opening scope without inventing completion", () => {
    const bedtime = samples.find((sample) => sample.id === "al-wird-an-nabawi");
    expect(bedtime.referenceUrl).toBe("https://sunnah.com/bukhari:5017");
    expect(bedtime.sections[0].sourceArabic).toContain("ثَلَاثَ مَرَّاتٍ");
    expect(bedtime.sections[0].repetition).toMatch(/^Three times/);
    expect(bedtime.sections[0].pairs.every((pair) => pair.opening)).toBe(true);
    expect(bedtime.sections[0].note).toContain("complete surahs");
    expect(bedtime.scope).toContain("glossary");
    expect(samples.find((sample) => sample.id === "dalil-al-mutamir").sections).toHaveLength(5);
  });

  it("keeps source records traceable and all internal HTML links resolvable", async () => {
    for (const sample of samples) {
      expect(hash(await fs.readFile(path.join(root, sample.sourcePath)))).toBe(sample.sourceSha256);
      for (const section of sample.sections) expect(hash(section.sourceArabic)).toBe(section.sourceTextSha256);
      const document = new JSDOM(await sampleHtml(sample)).window.document;
      for (const link of document.querySelectorAll('a[href^="#"]'))
        expect(document.getElementById(link.getAttribute("href").slice(1))).not.toBeNull();
      expect(document.querySelector(".download").getAttribute("href")).toBe(`${sample.id}-english-sample.pdf`);
    }
  });
});
