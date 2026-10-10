import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MushafWordToken } from "./MushafPageViewer";

const { useListeningMushafPage } = vi.hoisted(() => ({ useListeningMushafPage: vi.fn() }));
vi.mock("../hooks/useListeningMushafPage", () => ({ useListeningMushafPage }));
import MushafExcerpt from "./MushafExcerpt";

const words: MushafWordToken[] = [
  { verseKey: "112:1", position: 1, isEnd: 0, text: "قُلْ", qcfCode: "A" },
  { verseKey: "112:1", position: 2, isEnd: 0, text: "هُوَ", qcfCode: "B" },
  { verseKey: "112:1", position: 3, isEnd: 1, text: "١", qcfCode: "C" },
];
describe("MushafExcerpt", () => {
  it("retains readable text while loading or when the ordered transcript differs", () => {
    useListeningMushafPage.mockReturnValue({ result: null });
    const { rerender } = render(
      <MushafExcerpt
        canonicalKey="quran-112"
        transcript="قل هو"
        language="ar"
        cue={null}
        fallback={<p>Fallback text</p>}
      />,
    );
    expect(useListeningMushafPage).toHaveBeenLastCalledWith(604, 0, false);
    expect(screen.getByText("Fallback text")).toBeInTheDocument();
    useListeningMushafPage.mockReturnValue({ result: { page: 604, lines: [words], qcf: false } });
    rerender(
      <MushafExcerpt
        canonicalKey="quran-112"
        transcript="different text"
        language="ar"
        cue={null}
        fallback={<p>Fallback text</p>}
      />,
    );
    expect(screen.queryByTestId("mushaf-excerpt")).not.toBeInTheDocument();
    expect(screen.getByText("Fallback text")).toBeInTheDocument();
  });
  it("retains semantic text with Mushaf font and maps only the current cue without changing type size", () => {
    useListeningMushafPage.mockReturnValue({ result: { page: 604, lines: [words], qcf: true } });
    const { container, rerender } = render(
      <MushafExcerpt
        canonicalKey="quran-112"
        transcript="قل هو"
        language="en"
        cue={{ startOffset: 0, endOffset: 2, startMs: 0, endMs: 1000, occurrence: 1 }}
        fallback="Fallback"
      />,
    );
    expect(screen.getByTestId("mushaf-excerpt")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("mushaf-excerpt").nextElementSibling).toHaveTextContent("قُلْ هُوَ");
    expect(container.querySelector("[data-listening-word]")).toHaveTextContent("قُلْ");
    expect(container.querySelector("[data-mushaf-line]")).toBeNull();
    expect(screen.getByTestId("mushaf-excerpt")).toHaveStyle({ fontWeight: "400", lineHeight: "1.85" });
    const style = screen.getByTestId("mushaf-excerpt").getAttribute("style");
    rerender(
      <MushafExcerpt
        canonicalKey="quran-112"
        transcript="قل هو"
        language="en"
        cue={{ startOffset: 3, endOffset: 5, startMs: 1000, endMs: 2000, occurrence: 1 }}
        fallback="Fallback"
      />,
    );
    expect(container.querySelector("[data-listening-word]")).toHaveTextContent("هُوَ");
    expect(screen.getByTestId("mushaf-excerpt").getAttribute("style")).toBe(style);
  });
});
