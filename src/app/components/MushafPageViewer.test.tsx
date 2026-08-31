import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MushafPageViewer, AyahMarker, resolveInkAllowance } from "./MushafPageViewer";

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

  it("uses a compositor-only directional entrance for a settled page turn", () => {
    const { container, rerender } = render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
      />,
    );
    expect(container.querySelector("[data-page-transition]")).toBeNull();

    rerender(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={4}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
        pageTransitionDirection="forward"
      />,
    );

    expect(container.querySelector('[data-page-transition="forward"]')).toBeInTheDocument();
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

    expect(container.querySelectorAll("[data-mushaf-column] > div")).toHaveLength(15);
    // The printed Mushaf justifies each line to both margins.
    expect(container.querySelector("[data-mushaf-line-content]")).toHaveClass("justify-between");
  });

  it("places Surah header at the end of the previous page when canonical (e.g. Surah An-Nisaa on page 76)", () => {
    // In the 15-line Madani Mushaf, Surah 4 (An-Nisaa) header appears at line 15
    // of page 76, immediately after Ali 'Imran concludes. Page 77 starts with Bismillah.
    render(
      <MushafPageViewer
        lines={Array.from({ length: 14 }, () => [{ verseKey: "3:200", position: 1, isEnd: 0, text: "تُفْلِحُونَ" }])}
        language="ar"
        pageNumber={76}
        surahName="سورة النساء"
        juzNumber={4}
        direction="rtl"
      />,
    );

    expect(screen.getAllByText("سورة النساء").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { level: 2, name: "سورة النساء" })).toBeInTheDocument();
    expect(screen.getByTestId("mushaf-surah-heading")).toHaveAttribute("data-variant", "pill");
    expect(screen.getAllByTestId("mushaf-surah-ornament")).toHaveLength(1);
    expect(screen.getByTestId("mushaf-surah-ornament")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("mushaf-surah-ornament")).toHaveAttribute("focusable", "false");
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
        { verseKey: "3:1", position: 1, isEnd: 0, text: "الٓمٓ" },
        { verseKey: "3:1", position: 2, isEnd: 1, text: "١" },
      ],
    ];

    render(
      <MushafPageViewer
        lines={surahStartLines}
        language="ar"
        pageNumber={50}
        surahName="سورة آل عمران"
        juzNumber={3}
        direction="rtl"
      />,
    );

    expect(screen.getAllByText("سورة آل عمران").length).toBeGreaterThanOrEqual(1);
    const bismillah = screen.getByLabelText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ");
    expect(bismillah).toBeInTheDocument();
    expect(bismillah).toHaveAttribute("role", "img");
    expect(screen.getAllByTestId("mushaf-surah-ornament")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "سورة آل عمران" })).toBeInTheDocument();
    expect(screen.getByText("الٓمٓ")).toBeInTheDocument();
  });
});

describe("MushafPageViewer reading type size", () => {
  it("scales the ink inside the slots and never past the point where lines collide", () => {
    expect(resolveInkAllowance(true, "small")).toBeLessThan(resolveInkAllowance(true, "medium"));
    expect(resolveInkAllowance(true, "large")).toBeGreaterThan(resolveInkAllowance(true, "medium"));
    // Large text is still text on a fifteen-line page: past this allowance one
    // line's descenders reach the next line's marks.
    expect(resolveInkAllowance(true, "large")).toBeLessThanOrEqual(0.94);
    expect(resolveInkAllowance(false, "large")).toBeLessThanOrEqual(0.94);
  });

  it("keeps the fifteen slots whatever the type size", () => {
    const { container } = render(
      <MushafPageViewer
        lines={[
          [
            { verseKey: "2:6", position: 1, isEnd: 0, text: "إِنَّ" },
            { verseKey: "2:6", position: 2, isEnd: 1, text: "٦" },
          ],
        ]}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
        textScale="large"
      />,
    );
    expect(container.querySelectorAll("[data-mushaf-column] > div")).toHaveLength(15);
  });
});

describe("MushafPageViewer spread measure", () => {
  /**
   * jsdom reports every box as zero, and the fitter bails on a zero measure.
   * Giving it a plausible page geometry is what lets the write-target — the
   * thing this test is about — actually be exercised.
   */
  function withLayout<T>(run: () => T): T {
    const sized = ["clientWidth", "clientHeight", "offsetWidth", "offsetHeight", "scrollWidth"] as const;
    const saved = sized.map((name) => [name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)] as const);
    for (const name of sized) {
      Object.defineProperty(HTMLElement.prototype, name, { configurable: true, value: 400 });
    }
    try {
      return run();
    } finally {
      for (const [name, descriptor] of saved) {
        if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
        else Reflect.deleteProperty(HTMLElement.prototype, name);
      }
    }
  }

  it("gives each half of a spread its own measure rather than one shared with its neighbour", () => {
    const { container } = withLayout(() =>
      render(
        <MushafPageViewer
          lines={[[{ verseKey: "2:6", position: 1, isEnd: 1, text: "٦" }]]}
          language="ar"
          pageNumber={3}
          surahName="سورة البقرة"
          juzNumber={1}
          direction="rtl"
          facingPage={{
            pageNumber: 4,
            lines: [[{ verseKey: "2:16", position: 1, isEnd: 1, text: "١٦" }]],
            useQcfGlyphs: false,
          }}
        />,
      ),
    );

    const canvases = [...container.querySelectorAll<HTMLElement>("[data-mushaf-page]")];
    expect(canvases).toHaveLength(2);
    // Both halves live under one parent. The fitter used to write the measure
    // there, so whichever page settled last sized both of them.
    expect(canvases[0]!.parentElement).toBe(canvases[1]!.parentElement);
    expect(canvases[0]!.parentElement!.style.getPropertyValue("--mushaf-measure")).toBe("");
    for (const canvas of canvases) {
      expect(canvas.style.getPropertyValue("--mushaf-measure")).not.toBe("");
      expect(canvas.querySelector("[data-mushaf-column]")).not.toBeNull();
    }
  });
});
