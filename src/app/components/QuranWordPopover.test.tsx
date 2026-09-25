import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuranWordPopover } from "./QuranWordPopover";
import { QuranWordMeaningSheet } from "./QuranWordMeaningSheet";

describe("QuranWordPopover and QuranWordMeaningSheet", () => {
  const sampleMeaning = {
    id: "114:4:1",
    surahNumber: 114,
    ayahNumber: 4,
    word: "الْوَسْوَاسِ",
    explanationArabic: "الذي يُلْقِي في النفس حديثًا خفيًا",
  };

  it("renders word meaning popover without repetitive source attribution", () => {
    const anchorEl = document.createElement("button");
    document.body.appendChild(anchorEl);

    render(
      <QuranWordPopover
        meanings={[sampleMeaning]}
        anchorEl={anchorEl}
        language="ar"
        direction="rtl"
        onShowAll={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const popover = screen.getByTestId("quran-word-popover");
    expect(popover).toHaveTextContent("الْوَسْوَاسِ");
    expect(popover).toHaveTextContent("الذي يُلْقِي في النفس حديثًا خفيًا");
    expect(popover).not.toHaveTextContent("الميسر في غريب القرآن");

    document.body.removeChild(anchorEl);
  });

  it("renders word meaning sheet with reviewed source attribution", () => {
    render(
      <QuranWordMeaningSheet
        selection={{
          groups: [[sampleMeaning]],
          index: 0,
        }}
        language="ar"
        direction="rtl"
        onClose={vi.fn()}
      />,
    );

    const sheet = screen.getByTestId("quran-word-meaning-sheet");
    expect(sheet).toHaveTextContent("الْوَسْوَاسِ");
    expect(sheet).toHaveTextContent("الذي يُلْقِي في النفس حديثًا خفيًا");
    expect(sheet).toHaveTextContent("الميسر في غريب القرآن");
  });
});
