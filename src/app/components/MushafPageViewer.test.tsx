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

    expect(screen.getByRole("heading", { name: /سورة البقرة.*الجزء ١/ })).toBeInTheDocument();
    expect(screen.getByText("إِنَّ")).toBeInTheDocument();
    expect(screen.getByText("٦")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "صفحة ٣" })).toBeInTheDocument();
  });

  it("exposes reviewed difficult words only when the reader turns meanings on", () => {
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
        showWordMeanings
      />,
    );

    const word = screen.getByRole("button", { name: "Meaning of ٱلۡقَيُّومُ" });
    expect(word).toHaveClass("underline");
  });

  it("keeps difficult words visually clean when meanings are off", () => {
    render(
      <MushafPageViewer
        lines={[[{ verseKey: "2:255", position: 1, isEnd: 0, text: "ٱلۡقَيُّومُ" }]]}
        language="ar"
        pageNumber={42}
        surahName="سورة البقرة"
        juzNumber={3}
        direction="rtl"
      />,
    );
    expect(screen.queryByRole("button", { name: /معنى كلمة/ })).not.toBeInTheDocument();
    expect(screen.getByText("ٱلۡقَيُّومُ")).toBeInTheDocument();
  });

  it("renders official QCF glyphs with semantic text retained for assistive technology", () => {
    render(
      <MushafPageViewer
        lines={[[{ verseKey: "5:1", position: 1, isEnd: 0, text: "يَـٰٓأَيُّهَا", qcfCode: "" }]]}
        language="ar"
        pageNumber={106}
        surahName="سورة المائدة"
        juzNumber={6}
        direction="rtl"
        useQcfGlyphs
      />,
    );
    expect(screen.getByText("")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("يَـٰٓأَيُّهَا")).toHaveClass("sr-only");
    expect(screen.getByRole("article").querySelector('[data-mushaf-rendering="qcf-v2"]')).not.toBeNull();
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
