import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MushafPageViewer, AyahMarker } from "./MushafPageViewer";

describe("AyahMarker", () => {
  it("renders the localized ayah numeral within the medallion badge", () => {
    render(<AyahMarker number="6" language="ar" />);
    expect(screen.getByRole("img", { name: "الآية ٦" })).toBeInTheDocument();
  });

  it("renders English numerals when language is English", () => {
    render(<AyahMarker number="6" language="en" />);
    expect(screen.getByRole("img", { name: "Ayah 6" })).toBeInTheDocument();
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
    expect(screen.getAllByRole("region", { name: "صفحة القرآن ٣" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "فتح إجراءات الآية ٦" })).toBeInTheDocument();
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
    expect(word).not.toHaveClass("px-0.5", "font-bold");
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

  it("always lays out the fifteen reference line slots, however few lines carry words", () => {
    const { container } = render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
      />,
    );

    expect(container.querySelectorAll("[data-mushaf-rendering] > div > div")).toHaveLength(15);
    // The printed Mushaf justifies each line to both margins.
    expect(container.querySelector("[data-mushaf-line-content]")).toHaveClass("justify-between");
  });

  it("keeps both the heading and the basmalah when a surah opens with one slot to spare", () => {
    // Nineteen pages look like this: line 1 free, the surah's first verse on
    // line 2. The heading used to be dropped on the floor.
    render(
      <MushafPageViewer
        lines={[
          [],
          [
            { verseKey: "4:1", position: 1, isEnd: 0, text: "يَـٰٓأَيُّهَا" },
            { verseKey: "4:1", position: 2, isEnd: 1, text: "١" },
          ],
        ]}
        language="ar"
        pageNumber={77}
        surahName="سورة النساء"
        juzNumber={4}
        direction="rtl"
      />,
    );

    expect(screen.getAllByText("سورة النساء").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ")).toBeInTheDocument();
  });

  it("omits the basmalah for At-Tawbah, which takes none, but still names the surah", () => {
    render(
      <MushafPageViewer
        lines={[
          [],
          [
            { verseKey: "9:1", position: 1, isEnd: 0, text: "بَرَآءَةٌۭ" },
            { verseKey: "9:1", position: 2, isEnd: 1, text: "١" },
          ],
        ]}
        language="ar"
        pageNumber={187}
        surahName="سورة التوبة"
        juzNumber={10}
        direction="rtl"
      />,
    );

    expect(screen.getAllByText("سورة التوبة").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ")).not.toBeInTheDocument();
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
    const bismillah = screen.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ");
    expect(bismillah).toHaveClass("text-[0.68em]");
    expect(bismillah).toHaveStyle({ fontFamily: "var(--font-mushaf)" });
    expect(screen.getAllByTestId("mushaf-surah-ornament")).toHaveLength(2);
    expect(screen.getByText("الٓمٓ")).toBeInTheDocument();
  });
});
