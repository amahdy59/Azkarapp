import { afterEach, describe, expect, it, vi } from "vitest";
import { AYAH_MUSHAF_FONT, generateAyahCards, layoutAyahCards, type AyahCardInput } from "./ayahShareCard";

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
  afterEach(() => vi.restoreAllMocks());
  it.each(["portrait", "square"] as const)("keeps a fitting %s ayah together within readable size limits", (format) => {
    const input: AyahCardInput = {
      text: "رَبِّ العالمين ".repeat(17),
      verseKey: "2:255",
      title: "Ayah",
      format,
      continuation: "Part",
      translation: { text: "Complete English wording. ".repeat(35), label: "English" },
    };
    const pages = layoutAyahCards(context(), input);
    const arabicPages = pages.filter((page) => page.rows.some((row) => row.font.includes(AYAH_MUSHAF_FONT)));
    expect(arabicPages).toHaveLength(1);
    const rows = arabicPages[0]!.rows.filter((row) => row.font.includes(AYAH_MUSHAF_FONT));
    expect(rows.map((row) => row.text).join("")).toBe(input.text);
    rows.forEach((row) => {
      const size = Number(row.font.match(/(\d+)px/u)![1]);
      expect(size).toBeGreaterThanOrEqual(48);
      expect(size).toBeLessThanOrEqual(64);
    });
    for (const page of pages)
      expect(page.rows.reduce((sum, row) => sum + row.height, 0)).toBeLessThanOrEqual(page.height - 360);
    const manual = layoutAyahCards(context(), { ...input, fitAyah: false, textScale: 10 });
    expect(manual[0]!.rows[0]!.font).toContain("72px");
    const small = layoutAyahCards(context(), { ...input, textScale: 0.01 });
    expect(small[0]!.rows[0]!.font).toContain("48px");
    expect(small.flatMap((page) => page.rows).find((row) => row.direction === "ltr" && !row.label)!.font).toContain(
      "36px",
    );
  });
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
      expect(page.rows.reduce((sum, row) => sum + row.height, 0)).toBeLessThanOrEqual(page.height - 360);
      expect(page.rows.at(-1)?.label).not.toBe(true);
      for (const row of page.rows) {
        ctx.font = row.font;
        expect(ctx.measureText(row.text.trim()).width).toBeLessThanOrEqual(848);
        if (row.font.includes(AYAH_MUSHAF_FONT)) expect(row.font).toContain("64px");
        if (row.direction === "ltr" && !row.label) expect(row.font).toContain("46px");
      }
    }
  });
  it("uses asynchronous PNG encoding and stops obsolete work without leaking URLs", async () => {
    const input: AyahCardInput = {
      text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ".repeat(50),
      verseKey: "112:1",
      title: "Al-Ikhlas",
      format: "square",
      continuation: "Part",
    };
    const controller = new AbortController();
    const ctx = new Proxy(context(), {
      get(target, key) {
        return key in target ? target[key as keyof CanvasRenderingContext2D] : vi.fn();
      },
    });
    const encode = vi.fn((callback: BlobCallback) => callback(new Blob(["png"], { type: "image/png" })));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(encode);
    const dataUrl = vi.spyOn(HTMLCanvasElement.prototype, "toDataURL");
    const createUrl = vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      controller.abort();
      return "blob:obsolete";
    });
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    await expect(generateAyahCards(input, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(encode).toHaveBeenCalledOnce();
    expect(createUrl).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith("blob:obsolete");
    expect(dataUrl).not.toHaveBeenCalled();
  });
  it("rejects failed PNG encoding instead of returning an incomplete set", async () => {
    const ctx = new Proxy(context(), {
      get(target, key) {
        return key in target ? target[key as keyof CanvasRenderingContext2D] : vi.fn();
      },
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(null));
    await expect(
      generateAyahCards({
        text: "قُلْ",
        verseKey: "112:1",
        title: "Al-Ikhlas",
        format: "square",
        continuation: "Part",
      }),
    ).rejects.toThrow("PNG encoding failed");
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
    expect(pages[0]!.rows[0]!.height).toBeGreaterThanOrEqual(147);
    expect(pages[0]!.rows[0]!.direction).toBe("rtl");
  });
});
