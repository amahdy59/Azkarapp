import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
const { useListeningMushafPage } = vi.hoisted(() => ({ useListeningMushafPage: vi.fn() }));
vi.mock("../hooks/useListeningMushafPage", () => ({ useListeningMushafPage }));
import { QuranVerseText } from "./QuranVerseText";
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
