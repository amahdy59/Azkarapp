import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "../content/azkar";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import {
  getShareText,
  toShareItem,
  ShareFitError,
  getShareUrl,
  layoutSharePages,
  shareGeometry,
  wrapShareText,
  SHARE_DIMENSIONS,
  getShareSections,
  defaultShareAppearance,
  getShareRepetitionLabel,
  measureShareSection,
  SHARE_COMPACT,
  shareDisplayDigits,
  formatShareNumber,
  measureShareCitation,
  type ShareFormat,
} from "./shareLayout";

function context() {
  // A conservative font-dependent measure; browser tests verify actual glyph bounds.
  return {
    font: "",
    measureText(text: string) {
      const size = Number(this.font.match(/(\d+)px/u)?.[1] ?? 52);
      return { width: Array.from(text).length * size * 0.55 };
    },
  } as CanvasRenderingContext2D;
}
describe("complete share layouts", () => {
  it("uses Arabic-Indic display digits without changing reviewed lines or URLs", () => {
    expect(shareDisplayDigits("0123456789 · ۰۱۲۳۴۵۶۷۸۹ · ٠١٢٣٤٥٦٧٨٩")).toBe("٠١٢٣٤٥٦٧٨٩ · ٠١٢٣٤٥٦٧٨٩ · ٠١٢٣٤٥٦٧٨٩");
    expect(formatShareNumber(13)).toBe("١٣");
    expect(getShareRepetitionLabel(100, "en")).toContain("١٠٠");
    const item = {
      id: "digits",
      arabicText: "سبحان الله",
      sourceReference: "مسلم 2088/4؛ حصن المسلم 77",
      repetitionCount: 100,
    };
    const fragment = layoutSharePages(context(), [item], "story")[0]!.fragments[0]!;
    expect(fragment.citation!.lines.join("")).toBe("مسلم 2088/4");
    expect(fragment.citation!.text).toBe(item.sourceReference);
    expect(getShareText([item], "ar", {}, "ذكر", "https://example.com/1")).toContain("https://example.com/1");
  });
  it("summarizes the first source to at most two lines and makes attribution optional", () => {
    const sourceReference = "اسم مصدر طويل ".repeat(60) + " 2088؛ مرجع آخر 77";
    const ctx = context();
    const measured = measureShareCitation(ctx, { key: "source", text: sourceReference, direction: "rtl" }, false, 400);
    expect(measured.lines).toHaveLength(2);
    expect(measured.displayText).toContain("…");
    expect(measured.displayText).toContain("2088");
    expect(measured.text).toBe(sourceReference);
    for (const line of measured.lines)
      expect(ctx.measureText(shareDisplayDigits(line.trim())).width).toBeLessThanOrEqual(400);
    const item = { id: "source-choice", arabicText: "سبحان الله", sourceReference };
    for (const single of [false, true]) {
      const shown = layoutSharePages(context(), [item], "story", {}, single)[0]!.fragments[0]!;
      const hidden = layoutSharePages(context(), [item], "story", { source: false }, single)[0]!.fragments[0]!;
      expect(shown.citation!.lines.length).toBeLessThanOrEqual(2);
      expect(hidden.citation).toBeUndefined();
      expect(hidden.height).toBeLessThan(shown.height);
      expect(hidden.sections[0]!.text).toBe(item.arabicText);
    }
    expect(getShareText([item], "ar", {}, "ذكر")).toContain(sourceReference);
    expect(getShareText([item], "ar", { source: false }, "ذكر")).not.toContain(sourceReference);
  });
  it("packs four sourced short items at the original reading size with inline metadata", () => {
    const items = Array.from({ length: 8 }, (_, index) => ({
      id: String(index),
      arabicText: "سُبْحَانَ اللَّهِ",
      sourceReference: "مسلم ١",
      repetitionCount: 100,
    }));
    const pages = layoutSharePages(context(), items, "story");
    expect(pages.map((page) => page.fragments.length)).toEqual([4, 4]);
    for (const fragment of pages.flatMap((page) => page.fragments)) {
      expect(fragment.sections[0]!.fontSize).toBe(52);
      expect(fragment.metadataWidth).toBeGreaterThan(0);
      expect(fragment.metadataHeight).toBeGreaterThanOrEqual(fragment.citation!.height);
      expect(fragment.citation!.height).toBe(fragment.citation!.lines.length * fragment.citation!.lineHeight);
      expect(fragment.height).toBeLessThan(
        layoutSharePages(context(), [fragment.item], "story", {}, true)[0]!.fragments[0]!.height,
      );
    }
    expect(shareGeometry("story", false, false, true).top).toBeGreaterThan(shareGeometry("story").top);
  });
  it("uses the approved readable fallback only when needed, preserving every character", () => {
    const short = { id: "short", arabicText: "سبحان الله" };
    const dense = { id: "dense", arabicText: "سبحان الله ".repeat(18) };
    const shortSection = layoutSharePages(context(), [short], "square", {}, true)[0]!.fragments[0]!.sections[0]!;
    const denseSection = layoutSharePages(context(), [dense], "square", {}, true)[0]!.fragments[0]!.sections[0]!;
    expect(shortSection.fontSize).toBe(64);
    expect(denseSection.fontSize).toBe(52);
    expect(denseSection.lines.join("")).toBe(dense.arabicText);
  });
  it("keeps a trailing source number attached to its reference without changing the citation", () => {
    const citation = "أحمد ٤/٣٣٧؛ الترمذي ٥/٤٦٥؛ حصن المسلم ٨٧.";
    const ctx = {
      font: "",
      measureText: (text: string) => ({ width: Array.from(text).length * 10 }),
    } as CanvasRenderingContext2D;
    const section = measureShareSection(ctx, { key: "source", text: citation, direction: "rtl" }, true, 350);
    expect(section.lines.join("")).toBe(citation);
    expect(section.lines.at(-1)!.trim()).toBe("حصن المسلم ٨٧.");
  });
  it("distinguishes optional English translation from reviewed Arabic word meanings", () => {
    const zikr = ALL_AZKAR.find((item) => item.canonicalKey === "quran-112")!;
    expect(zikr).toBeDefined();
    const before = JSON.stringify(zikr);
    const arabic = toShareItem(zikr, "ar");
    expect(arabic.wordMeanings).toContain("الميسر في غريب القرآن");
    expect(getShareSections(arabic, {})).not.toContainEqual(expect.objectContaining({ key: "wordMeanings" }));
    const sections = getShareSections(arabic, { meaning: true, wordMeanings: true });
    expect(sections).toContainEqual({ key: "translation", direction: "ltr", text: zikr.translation });
    expect(sections).toContainEqual({ key: "wordMeanings", direction: "rtl", text: arabic.wordMeanings });
    const text = getShareText([arabic], "ar", { meaning: true, wordMeanings: true }, "ذكر");
    expect(text).toContain("الترجمة الإنجليزية");
    expect(text).toContain("معاني الكلمات");
    const english = toShareItem(zikr, "en");
    expect(english.wordMeanings).toBeUndefined();
    expect(
      getShareSections({ ...english, wordMeanings: arabic.wordMeanings }, { wordMeanings: true }).some(
        (section) => section.key === "wordMeanings",
      ),
    ).toBe(false);
    expect(JSON.stringify(zikr)).toBe(before);
    const layout = layoutSharePages(context(), [arabic], "tall", { wordMeanings: true }, true)[0]!;
    expect(layout.fragments[0]!.sections.find((section) => section.key === "wordMeanings")!.lines.join("")).toBe(
      arabic.wordMeanings,
    );
  });
  it("uses daylight for Morning and natural repetition labels", () => {
    expect(defaultShareAppearance("morning", "midnight")).toBe("olive");
    expect(defaultShareAppearance("evening")).toBe("gold");
    expect(defaultShareAppearance("before_sleep")).toBe("lavender");
    expect(getShareRepetitionLabel(1, "ar")).toBe("مرة واحدة");
    expect(getShareRepetitionLabel(2, "ar")).toBe("مرتان");
    expect(getShareRepetitionLabel(3, "ar")).toBe("٣ مرات");
    expect(getShareRepetitionLabel(100, "ar")).toBe("١٠٠ مرة");
  });
  it("measures the complete title inside its panel before the pill and body", () => {
    const title = "عنوان الذكر ".repeat(18);
    const item = { id: "titled", title, arabicText: "سبحان الله", sourceReference: "Reviewed source" };
    const titled = layoutSharePages(context(), [item], "tall", {}, true)[0]!.fragments[0]!;
    const untitled = layoutSharePages(context(), [{ ...item, title: undefined }], "tall", {}, true)[0]!.fragments[0]!;
    expect(titled.heading!.lines.length).toBeGreaterThan(1);
    expect(titled.heading!.lines.join("")).toBe(title);
    expect(titled.height - untitled.height).toBe(titled.heading!.height);
    expect(titled.heading!.fontSize).toBe(40);
  });
  it("preserves whitespace and Arabic combining marks byte-for-byte", () => {
    const text = "  اللَّهُمَّ  اغْفِرْ\nلَنَا\r\n" + "اللَّهُمَّ".repeat(12);
    const lines = wrapShareText(text, (value) => [...value].length * 15, 140);
    expect(lines.join("")).toBe(text);
    expect(lines.some((line) => /^\p{Mark}/u.test(line))).toBe(false);
  });
  for (const format of Object.keys(SHARE_DIMENSIONS) as ShareFormat[]) {
    it(`keeps each reviewed item complete or explicitly rejects ${format}`, () => {
      let fit = 0;
      for (const zikr of ALL_AZKAR.filter((item) => !item.isCollectionIntroduction)) {
        const item = toShareItem(zikr, "ar", "https://example.com/Azkarapp/");
        const original = JSON.stringify(zikr);
        const geometry = shareGeometry(format);
        try {
          const pages = layoutSharePages(context(), [item], format, { benefit: true });
          expect(pages).toHaveLength(1);
          const fragment = pages[0]!.fragments[0]!;
          expect(fragment.parts).toBe(1);
          expect(fragment.height).toBeLessThanOrEqual(geometry.bottom - geometry.top);
          expect(fragment.citation?.text).toBe(item.sourceReference);
          if (fragment.citation) expect(fragment.citation.lines.length).toBeLessThanOrEqual(2);
          if (!item.reminder) {
            const arabic = fragment.sections.find((section) => section.key === "arabic")!;
            expect(arabic.text).toBe(zikr.arabicText);
            expect(arabic.lines.join("")).toBe(zikr.arabicText);
            expect(arabic.direction).toBe("rtl");
            expect(arabic.fontSize).toBeGreaterThanOrEqual(52);
          } else {
            expect(fragment.sections.some((section) => section.key === "arabic")).toBe(false);
            expect(fragment.sections.find((section) => section.key === "benefit")?.text).toBe(
              getLocalizedZikrBenefit(zikr, "ar"),
            );
          }
          fit++;
        } catch (error) {
          expect(error).toBeInstanceOf(ShareFitError);
          expect((error as ShareFitError).itemId).toBe(zikr.id);
          expect((error as ShareFitError).format).toBe(format);
        }
        expect(JSON.stringify(zikr)).toBe(original);
      }
      expect(fit).toBeGreaterThan(0);
    });
    it(`rejects excessive selected content in ${format} without losing the text alternative`, () => {
      const item = {
        id: "long",
        arabicText: "اللَّهُمَّ اغفر لنا ".repeat(80),
        translation: "A reviewed English meaning. ".repeat(200),
        transliteration: "Allahumma ".repeat(100),
        benefit: "Reviewed benefit ".repeat(40),
        sourceReference: "Reviewed source ".repeat(15),
        repetitionCount: 3,
      };
      const options = { meaning: true, pronunciation: true, benefit: true };
      expect(() => layoutSharePages(context(), [item], format, options, true)).toThrow(ShareFitError);
      const text = getShareText([item], "en", options, "Zikr");
      for (const value of [item.arabicText, item.translation, item.transliteration, item.benefit, item.sourceReference])
        expect(text).toContain(value);
    });
  }
  it("moves whole blocks between cards while preserving order and count", () => {
    const items = Array.from({ length: 12 }, (_, index) => ({
      id: String(index),
      arabicText: "اللهم اغفر لنا ".repeat(8),
      repetitionCount: 3,
      sourceReference: "صحيح مسلم ١",
    }));
    const pages = layoutSharePages(context(), items, "story");
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.flatMap((page) => page.fragments.map((part) => part.item.id))).toEqual(items.map((item) => item.id));
    for (const page of pages) {
      expect(page.fragments.length).toBeLessThanOrEqual(4);
      expect(
        page.fragments.reduce((sum, part) => sum + part.height, 0) +
          (page.fragments.length - 1) * SHARE_COMPACT.panelGap,
      ).toBeLessThanOrEqual(shareGeometry("story").bottom - shareGeometry("story").top);
      for (const part of page.fragments) {
        expect(part.parts).toBe(1);
        expect(part.sections[0]!.text).toBe(part.item.arabicText);
        expect(part.item.repetitionCount).toBe(3);
      }
    }
  });
  it("keeps each long-surah reminder separate and reserves QR clearance", () => {
    const reminder = toShareItem(
      ALL_AZKAR.find((item) => item.id === "s-hm-110b")!,
      "en",
      "https://example.com/",
    );
    const ordinary = { id: "ordinary", arabicText: "سبحان الله" };
    const pages = layoutSharePages(context(), [ordinary, reminder, ordinary], "tall");
    expect(pages).toHaveLength(3);
    expect(pages[1]!.fragments[0]!.item.reminder).toBe(true);
    for (const format of Object.keys(SHARE_DIMENSIONS) as ShareFormat[]) {
      const geometry = shareGeometry(format, true);
      expect(geometry.bottom).toBeLessThan(shareGeometry(format).bottom);
      expect(geometry.bottom).toBeLessThan(geometry.footer - 100);
    }
  });
  it("shares reviewed multi-page surahs as sourced reminders in both languages", () => {
    const longSurahs = ALL_AZKAR.filter((zikr) => (zikr.mushafPages?.length ?? 0) > 1);
    expect(longSurahs.some((zikr) => zikr.id === "s-hm-110b")).toBe(true);
    expect(longSurahs.some((zikr) => zikr.id === "s-hm-110a")).toBe(true);
    for (const language of ["ar", "en"] as const)
      for (const zikr of longSurahs) {
        const item = toShareItem(zikr, language, "https://example.com/Azkarapp/");
        expect(item.arabicText).toBe("");
        expect(item.translation).toBeUndefined();
        expect(item.transliteration).toBeUndefined();
        expect(item.readingUrl).toBe(`https://example.com/Azkarapp/#/quran/${zikr.mushafPages![0]!.page}`);
        const text = getShareText([item], language, { meaning: true, pronunciation: true }, "Reminder");
        expect(text).toContain(item.title!);
        expect(text).toContain(getLocalizedZikrBenefit(zikr, language));
        expect(text).toContain(getLocalizedSourceReference(zikr, language));
        expect(text).toContain(item.readingUrl!);
        expect(text).not.toContain(zikr.arabicText.slice(0, 40));
      }
  });
  it("links to an exact one-based reader route under the Pages base", () => {
    expect(
      getShareUrl("after_prayer", 3, "https://example.com/Azkarapp/", { routineMode: "complete", prayer: "fajr" }),
    ).toBe("https://example.com/Azkarapp/#/azkar/after-prayer/4?mode=complete&prayer=fajr");
    expect(getShareUrl("morning", 3, "https://example.com/Azkarapp/")).toBe(
      "https://example.com/Azkarapp/#/azkar/morning/4",
    );
    expect(getShareUrl("before_sleep", undefined, "https://example.com/Azkarapp/")).toBe(
      "https://example.com/Azkarapp/#/azkar/before-sleep",
    );
  });
  it("includes exact sources and prescribed count in text sharing", () => {
    const text = getShareText(
      [{ id: "one", arabicText: "سُبْحَانَ اللَّهِ", sourceReference: "صحيح مسلم ١", repetitionCount: 100 }],
      "ar",
      {},
      "ذكر",
      "https://example.com/#/azkar/morning/1",
    );
    expect(text).toContain("١٠٠");
    expect(text).toContain("صحيح مسلم ١");
    expect(text).toContain("سُبْحَانَ اللَّهِ");
    expect(text).toContain("#/azkar/morning/1");
  });
});
