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
        page.fragments.reduce((sum, part) => sum + part.height, 0) + (page.fragments.length - 1) * 28,
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
