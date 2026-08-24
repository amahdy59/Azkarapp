import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canonicalAyahText,
  getQcfFontFamily,
  getQcfFontUrl,
  getMushafPageUrl,
  loadMushafPage,
  loadQcfFont,
  pageHasQcfGlyphs,
  parseMushafPage,
} from "./qcfMushaf";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Mushaf page data", () => {
  it("reads pages from the shipped reference layout, not from a remote API", () => {
    expect(getMushafPageUrl(106)).toMatch(/data\/mushaf\/106\.json$/);
    expect(getQcfFontUrl(106)).toBe("https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p106.woff2");
    expect(getQcfFontFamily(106)).toBe("qcf-v2-page-106");
  });

  it("keeps the reviewed semantic text beside each QCF glyph code", () => {
    expect(
      parseMushafPage([
        {
          k: "5:1",
          w: [
            [1, 8, 0, "يَـٰٓأَيُّهَا", ""],
            [12, 10, 1, "١", "ﲓ"],
          ],
        },
      ]),
    ).toEqual([
      {
        k: "5:1",
        w: [
          [1, 8, 0, "يَـٰٓأَيُّهَا", ""],
          [12, 10, 1, "١", "ﲓ"],
        ],
      },
    ]);
  });

  it("reconstructs canonical text across page boundaries instead of copying QCF glyphs", () => {
    expect(
      canonicalAyahText(
        [
          [{ k: "2:282", w: [[1, 15, 0, "يَـٰٓأَيُّهَا", "private-one"]] }],
          [
            {
              k: "2:282",
              w: [
                [2, 1, 0, "ٱلَّذِينَ", "private-two"],
                [3, 1, 1, "٢٨٢", "private-marker"],
              ],
            },
          ],
        ],
        "2:282",
      ),
    ).toBe("يَـٰٓأَيُّهَا ٱلَّذِينَ");
  });

  it("rejects a page whose line numbers fall outside the 15-line reference grid", () => {
    expect(parseMushafPage([{ k: "5:1", w: [[1, 16, 0, "يَـٰٓأَيُّهَا"]] }])).toBeNull();
    expect(parseMushafPage([{ k: "5:1", w: [[1]] }])).toBeNull();
    expect(parseMushafPage([])).toBeNull();
  });

  it("only claims QCF rendering when every word on the page carries a glyph", () => {
    expect(
      pageHasQcfGlyphs([
        {
          k: "5:1",
          w: [
            [1, 8, 0, "a", "ﱁ"],
            [2, 8, 1, "١", "ﱂ"],
          ],
        },
      ]),
    ).toBe(true);
    expect(
      pageHasQcfGlyphs([
        {
          k: "5:1",
          w: [
            [1, 8, 0, "a", "ﱁ"],
            [2, 8, 1, "١"],
          ],
        },
      ]),
    ).toBe(false);
  });

  it("serves a second request for the same page from memory", async () => {
    const json = [{ k: "5:1", w: [[1, 8, 0, "يَـٰٓأَيُّهَا", "ﱁ"]] }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => json });
    vi.stubGlobal("fetch", fetchMock);

    const first = await loadMushafPage(511);
    const second = await loadMushafPage(511);

    expect(first).toBe(second);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares one in-flight request between the reader and the neighbour prefetch", async () => {
    const json = [{ k: "5:1", w: [[1, 8, 0, "يَـٰٓأَيُّهَا", "ﱁ"]] }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => json });
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([loadMushafPage(512), loadMushafPage(512)]);

    expect(a).toBe(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("QCF page fonts", () => {
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

    if (originalFonts) Object.defineProperty(document, "fonts", originalFonts);
    else Reflect.deleteProperty(document, "fonts");
  });

  it("reports the font unavailable instead of rejecting when the network fails", async () => {
    const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
    class TestFontFace {
      load = vi.fn().mockRejectedValue(new Error("offline"));
    }

    vi.stubGlobal("FontFace", TestFontFace);
    Object.defineProperty(document, "fonts", { configurable: true, value: { add: vi.fn() } });

    await expect(loadQcfFont(602)).resolves.toBe(false);

    if (originalFonts) Object.defineProperty(document, "fonts", originalFonts);
    else Reflect.deleteProperty(document, "fonts");
  });
});
