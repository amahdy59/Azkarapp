import { describe, expect, it } from "vitest";
import { AYAH_MUSHAF_FONT, layoutAyahCards, type AyahCardInput } from "./ayahShareCard";

function context() {
  return {
    font: "",
    measureText(text: string) {
      const size = Number(this.font.match(/(\d+)px/u)?.[1] ?? 64);
      return {
        width: Array.from(text).length * size * 0.55,
        actualBoundingBoxAscent: size,
        actualBoundingBoxDescent: 18,
      };
    },
  } as CanvasRenderingContext2D;
}
describe("complete ayah image cards", () => {
  it.each(["portrait", "square"] as const)("continues long %s content without truncating or shrinking it", (format) => {
    const input: AyahCardInput = {
      verseKey: "2:282",
      title: "Al-Baqarah · Ayah 282",
      format,
      continuation: "Part",
      text: "رَبِّ ٱلْعَٰلَمِينَ ۚ ".repeat(70),
      translation: { text: "Complete English wording. ".repeat(60), label: "English · Pickthall" },
      meanings: { text: "كلمة: شرح المعنى\n".repeat(40), label: "معاني الكلمات · مصدر عربي طويل ".repeat(4) },
    };
    const ctx = context();
    const pages = layoutAyahCards(ctx, input);
    expect(pages.length).toBeGreaterThan(1);
    const rows = pages.flatMap((page) => page.rows);
    expect(
      rows
        .filter((row) => !row.label && row.font.includes(AYAH_MUSHAF_FONT))
        .map((row) => row.text)
        .join(""),
    ).toBe(input.text);
    expect(
      rows
        .filter((row) => !row.label && row.direction === "ltr")
        .map((row) => row.text)
        .join(""),
    ).toBe(input.translation!.text);
    expect(
      rows
        .filter((row) => !row.label && row.font.includes("34px"))
        .map((row) => row.text)
        .join(""),
    ).toBe(input.meanings!.text);
    for (const page of pages) {
      expect(page.width).toBe(1080);
      expect(page.height).toBe(format === "portrait" ? 1350 : 1080);
      expect(page.rows.reduce((sum, row) => sum + row.height, 0)).toBeLessThanOrEqual(page.height - 420);
      expect(page.rows.at(-1)?.label).not.toBe(true);
      for (const row of page.rows) {
        ctx.font = row.font;
        expect(ctx.measureText(row.text.trim()).width).toBeLessThanOrEqual(848);
        if (row.font.includes(AYAH_MUSHAF_FONT)) expect(row.font).toContain("64px");
      }
    }
  });
  it("omits optional sections by default and reserves measured diacritics", () => {
    const ctx = context();
    ctx.measureText = () => ({ width: 180, actualBoundingBoxAscent: 100, actualBoundingBoxDescent: 35 }) as TextMetrics;
    const pages = layoutAyahCards(ctx, {
      text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
      verseKey: "112:1",
      title: "Al-Ikhlas",
      format: "square",
      continuation: "Part",
    });
    expect(pages).toHaveLength(1);
    expect(pages[0]!.rows).toHaveLength(1);
    expect(pages[0]!.rows[0]!.height).toBeGreaterThanOrEqual(155);
    expect(pages[0]!.rows[0]!.direction).toBe("rtl");
  });
});
