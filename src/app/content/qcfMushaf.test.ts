import { describe, expect, it } from "vitest";
import { getQcfFontUrl, getQcfPageUrl, mergeQcfPage, parseQcfPageResponse } from "./qcfMushaf";

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
});
