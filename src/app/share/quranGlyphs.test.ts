import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ load: vi.fn(), font: vi.fn() }));
vi.mock("../content/qcfMushaf", () => ({
  loadMushafPage: mocks.load,
  loadQcfFont: mocks.font,
  getQcfFontFamily: (page: number) => `qcf-v2-page-${page}`,
}));
import { prepareQuranGlyphs } from "./quranGlyphs";
afterEach(() => vi.unstubAllGlobals());

it("draws verified glyphs while leaving its reviewed source string unchanged", async () => {
  vi.stubGlobal("FontFace", class {});
  mocks.load.mockResolvedValue([
    {
      k: "112:1",
      w: [
        [1, 1, 0, "قُلْ", "A"],
        [2, 1, 0, "هُوَ", "B"],
        [3, 1, 1, "١", "C"],
      ],
    },
  ]);
  mocks.font.mockResolvedValue(true);
  const text = "قُلْ هُوَ ﴿١﴾";
  expect(await prepareQuranGlyphs(text, "quran-112")).toEqual({
    text: "A B C",
    fontFamily: '"qcf-v2-page-604", "Amiri Quran", serif',
  });
  expect(text).toBe("قُلْ هُوَ ﴿١﴾");
  expect((await prepareQuranGlyphs("قُلْ ۚ هُوَ ﴿١﴾", "quran-112"))?.text).toBe("A  B C");
  expect(await prepareQuranGlyphs("قُلْ غير", "quran-112")).toBeUndefined();
  mocks.font.mockResolvedValue(false);
  expect(await prepareQuranGlyphs(text, "quran-112")).toBeUndefined();
});

it("keeps unreferenced passages on the bundled readable font without a request", async () => {
  mocks.load.mockClear();
  expect(await prepareQuranGlyphs("قُلْ هُوَ")).toBeUndefined();
  expect(mocks.load).not.toHaveBeenCalled();
});

it("never draws a multipage passage using one page's incompatible glyph font", async () => {
  vi.stubGlobal("FontFace", class {});
  mocks.load.mockClear();
  expect(await prepareQuranGlyphs("complete multipage source", "quran-003-190-200")).toBeUndefined();
  expect(mocks.load).not.toHaveBeenCalled();
});
