import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ load: vi.fn(), font: vi.fn() }));
vi.mock("../content/qcfMushaf", () => ({
  loadMushafPage: mocks.load,
  loadQcfFont: mocks.font,
  getQcfFontFamily: (page: number) => `qcf-v2-page-${page}`,
}));
import { matchAyahMushafWords, prepareAyahMushafRendering } from "./ayahMushafRendering";
const words = [
  { verseKey: "112:1", position: 1, isEnd: 0, text: "قُلْ", qcfCode: "A" },
  { verseKey: "112:1", position: 2, isEnd: 0, text: "هُوَ", qcfCode: "B" },
  { verseKey: "112:1", position: 3, isEnd: 1, text: "١", qcfCode: "C" },
];
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
it("requires the entire matching ayah with both boundaries and every glyph", () => {
  expect(matchAyahMushafWords("قُلْ هُوَ", "112:1", words)?.mapping).toHaveLength(2);
  expect(matchAyahMushafWords("قُلْ غير", "112:1", words)).toBeNull();
  expect(matchAyahMushafWords("هُوَ", "112:1", words.slice(1))).toBeNull();
  expect(matchAyahMushafWords("قُلْ هُوَ", "112:1", words.slice(0, 2))).toBeNull();
  expect(
    matchAyahMushafWords(
      "قُلْ هُوَ",
      "112:1",
      words.map((word) => ({ ...word, qcfCode: undefined })),
    ),
  ).toBeNull();
});
it("uses the exact Mushaf page font and leaves Unicode source intact", async () => {
  vi.stubGlobal("FontFace", class {});
  mocks.load.mockResolvedValue([
    { k: "112:1", w: words.map((word) => [word.position, 1, word.isEnd, word.text, word.qcfCode]) },
  ]);
  mocks.font.mockResolvedValue(true);
  const text = "قُلْ هُوَ";
  expect(await prepareAyahMushafRendering(text, "112:1", 604)).toEqual({
    text: "A B C",
    fontFamily: '"qcf-v2-page-604", "Amiri Quran", serif',
  });
  expect(text).toBe("قُلْ هُوَ");
  mocks.font.mockResolvedValue(false);
  expect(await prepareAyahMushafRendering(text, "112:1", 604)).toBeUndefined();
  mocks.load.mockRejectedValue(new Error("offline"));
  expect(await prepareAyahMushafRendering(text, "112:1", 604)).toBeUndefined();
});
it("does not request fonts or pages without an explicit page identity", async () => {
  expect(await prepareAyahMushafRendering("قُلْ هُوَ", "112:1")).toBeUndefined();
  expect(mocks.load).not.toHaveBeenCalled();
});
