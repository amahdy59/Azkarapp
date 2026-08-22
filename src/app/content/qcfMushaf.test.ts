import { describe, expect, it, vi } from "vitest";
import { getQcfFontUrl, getQcfPageUrl, loadQcfFont, mergeQcfPage, parseQcfPageResponse } from "./qcfMushaf";

describe("QCF Mushaf enhancement", () => {
  it("uses the official page-specific data and font locations", () => {
    expect(getQcfPageUrl(106)).toContain("/verses/by_page/106");
    expect(getQcfFontUrl(106)).toBe("https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p106.woff2");
  });

  it("keeps semantic text beside each QCF glyph code", () => {
    expect(
      parseQcfPageResponse({
        verses: [
          {
            verse_key: "5:1",
            words: [
              {
                position: 1,
                line_number: 8,
                char_type_name: "word",
                text_qpc_hafs: "يَـٰٓأَيُّهَا",
                code_v2: "",
              },
              {
                position: 12,
                line_number: 10,
                char_type_name: "end",
                text_qpc_hafs: "١",
                code_v2: "ﲓ",
              },
            ],
          },
        ],
      }),
    ).toEqual([
      {
        k: "5:1",
        w: [
          [1, 8, 0, "يَـٰٓأَيُّهَا", ""],
          [12, 10, 1, "١", "ﲓ"],
        ],
      },
    ]);
  });

  it("rejects incomplete remote data so the local page remains authoritative fallback", () => {
    expect(parseQcfPageResponse({ verses: [{ verse_key: "5:1", words: [{ position: 1 }] }] })).toBeNull();
  });

  it("adds official glyph and line data without replacing reviewed local Quran text", () => {
    expect(
      mergeQcfPage([{ k: "5:1", w: [[1, 7, 0, "LOCAL"]] }], [{ k: "5:1", w: [[1, 8, 0, "REMOTE", ""]] }]),
    ).toEqual([{ k: "5:1", w: [[1, 8, 0, "LOCAL", ""]] }]);
  });

  it("does not report a QCF page font ready until the font has loaded", async () => {
    const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
    const add = vi.fn();
    const load = vi.fn().mockResolvedValue({ family: "qcf-v2-page-601" });
    class TestFontFace {
      load = load;
    }

    vi.stubGlobal("FontFace", TestFontFace);
    Object.defineProperty(document, "fonts", { configurable: true, value: { add } });

    await expect(loadQcfFont(601)).resolves.toBe(true);
    await expect(loadQcfFont(601)).resolves.toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
    if (originalFonts) Object.defineProperty(document, "fonts", originalFonts);
    else Reflect.deleteProperty(document, "fonts");
  });
});
