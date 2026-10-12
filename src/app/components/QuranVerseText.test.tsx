import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
const { useListeningMushafPage } = vi.hoisted(() => ({ useListeningMushafPage: vi.fn() }));
vi.mock("../hooks/useListeningMushafPage", () => ({ useListeningMushafPage }));
import { QuranVerseText } from "./QuranVerseText";
import { QuranWordText } from "./QuranWordText";
beforeEach(() => useListeningMushafPage.mockReturnValue({ result: null }));

const lines = [
  [
    { verseKey: "112:1", position: 1, isEnd: 0, text: "قُلْ", qcfCode: "A" },
    { verseKey: "112:1", position: 2, isEnd: 0, text: "هُوَ", qcfCode: "B" },
    { verseKey: "112:1", position: 3, isEnd: 1, text: "١", qcfCode: "C" },
  ],
];

it("uses matching page glyphs and ornaments while retaining exact source words and markers", () => {
  useListeningMushafPage.mockReturnValue({ result: { qcf: true, lines } });
  const { container } = render(
    <QuranVerseText text="قُلْ هُوَ ﴿١﴾" language="ar" canonicalKey="quran-112" preserveLines />,
  );
  expect(useListeningMushafPage).toHaveBeenCalledWith(604, 0, true);
  expect(container.querySelector("[data-quran-glyph]")).toHaveStyle({ fontFamily: "qcf-v2-page-604" });
  expect([...container.querySelectorAll("[aria-hidden]")].map((el) => el.textContent).join("")).toBe("ABC");
  expect([...container.querySelectorAll(".sr-only")].map((el) => el.textContent)).toEqual(["قُلْ", "هُوَ", "﴿١﴾"]);
});

it("never guesses glyphs for a mismatched transcript or an unavailable font", () => {
  useListeningMushafPage.mockReturnValue({ result: { qcf: true, lines } });
  const view = render(<QuranVerseText text="قُلْ غير" language="ar" canonicalKey="quran-112" />);
  expect(view.container.querySelector("[data-quran-glyph]")).toBeNull();
  expect(view.container).toHaveTextContent("قُلْ غير");
  useListeningMushafPage.mockReturnValue({ result: { qcf: false, lines } });
  view.rerender(<QuranVerseText text="قُلْ هُوَ" language="ar" canonicalKey="quran-112" />);
  expect(view.container.querySelector("[data-quran-glyph]")).toBeNull();
});

it("paints canonical pause signs once and preserves the source sign semantically", () => {
  const withPause = [[{ ...lines[0]![0], text: "قُلْ ۚ", qcfCode: "AP" }, ...lines[0]!.slice(1)]];
  useListeningMushafPage.mockReturnValue({ result: { qcf: true, lines: withPause } });
  const { container } = render(<QuranVerseText text="قُلْ ۚ هُوَ" language="ar" canonicalKey="quran-112" />);
  expect(container.querySelectorAll(".sr-only")[1]).toHaveTextContent("ۚ");
  expect([...container.querySelectorAll("[aria-hidden]")].map((el) => el.textContent).join("")).toBe("APB");
});

it("preserves reviewed wording and original markers in accessible text", () => {
  const text = "قُلْ هُوَ ﴿١﴾ اللَّهُ ﴿٢﴾";
  const { container } = render(<QuranVerseText text={text} language="ar" />);
  expect(container.querySelectorAll("svg")).toHaveLength(2);
  expect(container.querySelectorAll(".sr-only")[0]).toHaveTextContent("﴿١﴾");
  expect(container).toHaveTextContent("قُلْ هُوَ");
  expect(container).toHaveTextContent("اللَّهُ");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
it("does not treat enclosing Quran quotation brackets as an ayah number", () => {
  const text = "﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾";
  const { container } = render(<QuranVerseText text={text} language="en" />);
  expect(container.textContent).toBe(text);
  expect(container.querySelector("svg")).toBeNull();
});

for (const qcf of [true, false]) {
  it(`keeps every word node and line break stable when meanings toggle (${qcf ? "QCF" : "Unicode"})`, () => {
    useListeningMushafPage.mockReturnValue({ result: { qcf, lines } });
    const select = vi.fn();
    const props = {
      text: "قُلْ هُوَ ﴿١﴾",
      language: "ar" as const,
      style: {},
      canonicalKey: "quran-112",
      meanings: [{ id: "meaning", surahNumber: 112, ayahNumber: 1, word: "قُلْ هُوَ", explanationArabic: "شرح" }],
      onSelectMeanings: select,
    };
    const view = render(<QuranWordText {...props} showMeanings={false} />);
    const nodes = [...view.container.querySelectorAll("[data-quran-word]")];
    const typography = () =>
      nodes.map((node) => {
        const style = (node as HTMLElement).style;
        return [
          style.fontFamily,
          style.fontSize,
          style.fontWeight,
          style.lineHeight,
          style.letterSpacing,
          style.display,
          style.whiteSpace,
        ];
      });
    const styles = typography();
    view.rerender(<QuranWordText {...props} showMeanings />);
    expect([...view.container.querySelectorAll("[data-quran-word]")]).toEqual(nodes);
    expect(typography()).toEqual(styles);
    expect(view.container.querySelector("br")).toBeNull();
    expect(screen.getAllByTestId("quran-word-help")).toHaveLength(2);
    fireEvent.keyDown(screen.getAllByTestId("quran-word-help")[1]!, { key: "Enter" });
    expect(select).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
    view.rerender(<QuranWordText {...props} showMeanings={false} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect([...view.container.querySelectorAll("[data-quran-word]")]).toEqual(nodes);
  });
}

it("uses each page's own font for words and ayah markers in a multipage excerpt", () => {
  const first = [{ ...lines[0]![0], verseKey: "3:190", text: "قُلْ", pageNumber: 75 }];
  const last = [
    { ...lines[0]![1], verseKey: "3:200", text: "هُوَ", pageNumber: 76 },
    { ...lines[0]![2], verseKey: "3:200", pageNumber: 76 },
  ];
  useListeningMushafPage.mockImplementation((page) => ({
    result: { qcf: true, lines: page === 75 ? [first] : [last] },
  }));
  const { container } = render(
    <QuranVerseText text="قُلْ هُوَ ﴿٢٠٠﴾" language="ar" canonicalKey="quran-003-190-200" />,
  );
  const glyphs = container.querySelectorAll("[data-quran-glyph]");
  expect(glyphs[0]).toHaveStyle({ fontFamily: "qcf-v2-page-75" });
  expect(glyphs[1]).toHaveStyle({ fontFamily: "qcf-v2-page-76" });
  expect(container.querySelector("span[aria-hidden] > span")).toHaveStyle({ fontFamily: "qcf-v2-page-76" });
});
