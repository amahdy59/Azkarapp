import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "../content/azkar";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import {
  getShareText,
  getShareUrl,
  layoutSharePages,
  shareGeometry,
  wrapShareText,
  SHARE_DIMENSIONS,
  type ShareFormat,
  type ShareItem,
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
  it("preserves whitespace and Arabic combining marks byte-for-byte", () => {
    const text = "  اللَّهُمَّ  اغْفِرْ\nلَنَا\r\n" + "اللَّهُمَّ".repeat(12);
    const lines = wrapShareText(text, (value) => [...value].length * 15, 140);
    expect(lines.join("")).toBe(text);
    expect(lines.some((line) => /^\p{Mark}/u.test(line))).toBe(false);
  });
  for (const format of Object.keys(SHARE_DIMENSIONS) as ShareFormat[]) {
    it(`preserves every released Arabic item at readable sizes in ${format}`, () => {
      const items: ShareItem[] = ALL_AZKAR.filter((item) => !item.isCollectionIntroduction).map((item) => ({
        ...item,
        benefit: getLocalizedZikrBenefit(item, "ar"),
        sourceReference: getLocalizedSourceReference(item, "ar"),
      }));
      const pages = layoutSharePages(context(), items, format, { benefit: true });
      const fragments = pages.flatMap((page) => page.fragments);
      for (const item of items) {
        const itemFragments = fragments.filter((fragment) => fragment.item === item);
        expect(
          itemFragments
            .flatMap((fragment) =>
              fragment.sections.filter((section) => section.key === "arabic").map((section) => section.text),
            )
            .join(""),
        ).toBe(item.arabicText);
        if (item.sourceReference && itemFragments[0]?.citation) {
          itemFragments.forEach((fragment) => expect(fragment.citation?.text).toBe(item.sourceReference));
        } else if (item.sourceReference)
          expect(
            itemFragments
              .flatMap((fragment) =>
                fragment.sections.filter((section) => section.key === "source").map((section) => section.text),
              )
              .join(""),
          ).toBe(item.sourceReference);
      }
      const geometry = shareGeometry(format);
      pages.forEach((page) => {
        expect(
          page.fragments.reduce((height, fragment) => height + fragment.height, 0) + (page.fragments.length - 1) * 28,
        ).toBeLessThanOrEqual(geometry.bottom - geometry.top);
        expect(page.fragments.length).toBeLessThanOrEqual(4);
        page.fragments
          .flatMap((fragment) => fragment.sections)
          .filter((section) => section.key === "arabic")
          .forEach((section) => {
            expect(section.direction).toBe("rtl");
            expect(section.fontSize).toBeGreaterThanOrEqual(52);
          });
      });
      expect(
        fragments.map((fragment) => fragment.item.id).filter((id, index, ids) => index === 0 || ids[index - 1] !== id),
      ).toEqual(items.map((item) => item.id));
    });
    it(`preserves long English meanings, benefits and citations in ${format}`, () => {
      const item = {
        id: "long",
        arabicText: "اللَّهُمَّ اغفر لنا ".repeat(80),
        translation: "A reviewed English meaning. ".repeat(200),
        transliteration: "Allahumma ".repeat(100),
        benefit: "Reviewed benefit ".repeat(40),
        sourceReference: "Reviewed source ".repeat(15),
        repetitionCount: 3,
      };
      const pages = layoutSharePages(
        context(),
        [item],
        format,
        { meaning: true, pronunciation: true, benefit: true },
        true,
      );
      for (const [key, expected] of Object.entries({
        arabic: item.arabicText,
        translation: item.translation,
        transliteration: item.transliteration,
        benefit: item.benefit,
        source: item.sourceReference,
      })) {
        if (key === "source" && pages[0]?.fragments[0]?.citation) {
          pages.flatMap((page) => page.fragments).forEach((fragment) => expect(fragment.citation?.text).toBe(expected));
          continue;
        }
        expect(
          pages
            .flatMap((page) =>
              page.fragments.flatMap((fragment) =>
                fragment.sections.filter((section) => section.key === key).map((section) => section.text),
              ),
            )
            .join(""),
        ).toBe(expected);
      }
      expect(pages.length).toBeGreaterThan(1);
      expect(pages[0]?.fragments[0]?.parts).toBe(pages.length);
    });
  }
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
