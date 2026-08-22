import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MushafPageViewer, AyahMarker } from "./MushafPageViewer";

describe("AyahMarker", () => {
  it("renders the localized ayah numeral within the medallion badge", () => {
    render(<AyahMarker number="6" language="ar" />);
    expect(screen.getByRole("img", { name: "آية ٦" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "آية ٦" })).toBeInTheDocument();
  });

  it("renders English numerals when language is English", () => {
    render(<AyahMarker number="6" language="en" />);
    expect(screen.getByRole("img", { name: "آية 6" })).toBeInTheDocument();
  });
});

describe("MushafPageViewer", () => {
  const sampleLines = [
    [
      { verseKey: "2:6", position: 1, isEnd: 0, text: "إِنَّ" },
      { verseKey: "2:6", position: 2, isEnd: 0, text: "ٱلَّذِينَ" },
      { verseKey: "2:6", position: 3, isEnd: 0, text: "كَفَرُوا۟" },
      { verseKey: "2:6", position: 4, isEnd: 1, text: "٦" },
    ],
  ];

  it("renders one semantic page with surah and juz context", () => {
    render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
      />,
    );

    expect(screen.getByText("سورة البقرة")).toBeInTheDocument();
    expect(screen.getByText("الجزء ١")).toBeInTheDocument();
    expect(screen.getByText("إِنَّ")).toBeInTheDocument();
    expect(screen.getByText("٦")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "صفحة ٣" })).toBeInTheDocument();
  });

  it("always exposes reviewed difficult words as accessible buttons", () => {
    render(
      <MushafPageViewer
        lines={[
          [
            { verseKey: "2:255", position: 1, isEnd: 0, text: "ٱلۡقَيُّومُ" },
            { verseKey: "2:255", position: 2, isEnd: 1, text: "٢٥٥" },
          ],
        ]}
        language="en"
        pageNumber={42}
        surahName="Surah Al-Baqarah"
        juzNumber={3}
        direction="ltr"
      />,
    );

    const word = screen.getByRole("button", { name: "Meaning of ٱلۡقَيُّومُ" });
    expect(word).toHaveClass("underline");
  });

  it("renders surah header banner when an empty line precedes a new surah start", () => {
    const surahStartLines = [
      [], // Line 1: empty -> should be Surah Header
      [], // Line 2: empty -> should be Bismillah
      [
        { verseKey: "2:1", position: 1, isEnd: 0, text: "الٓمٓ" },
        { verseKey: "2:1", position: 2, isEnd: 1, text: "١" },
      ],
    ];

    render(
      <MushafPageViewer
        lines={surahStartLines}
        language="ar"
        pageNumber={2}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
      />,
    );

    expect(screen.getAllByText("سورة البقرة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ")).toBeInTheDocument();
    expect(screen.getByText("الٓمٓ")).toBeInTheDocument();
  });
});
