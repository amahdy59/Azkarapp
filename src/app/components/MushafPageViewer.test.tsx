import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("keeps reduced-motion page changes at full opacity", () => {
    const animate = vi.fn();
    const paperRef = { current: null as HTMLDivElement | null };
    const props = {
      lines: sampleLines,
      language: "ar" as const,
      pageNumber: 3,
      surahName: "سورة البقرة",
      juzNumber: 1,
      direction: "rtl" as const,
      paperRef,
      reduceMotion: true,
    };
    const { rerender } = render(<MushafPageViewer {...props} />);
    paperRef.current!.animate = animate;
    rerender(<MushafPageViewer {...props} pageNumber={4} pageTransitionDirection="forward" />);
    expect(animate).not.toHaveBeenCalled();
    expect(screen.getByRole("article", { name: "صفحة ٤" })).toBeInTheDocument();
  });

  it("vibrates on a settled page turn only when haptics are enabled", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: vibrate });
    const { rerender } = render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
      />,
    );

    rerender(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={4}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
        pageTransitionDirection="forward"
        hapticFeedback={false}
      />,
    );
    expect(vibrate).not.toHaveBeenCalled();

    rerender(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={5}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
        pageTransitionDirection="forward"
        hapticFeedback
      />,
    );
    expect(vibrate).toHaveBeenCalledWith(10);
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

describe("MushafPageViewer opening pages consistency (pages 1 & 2)", () => {
  const fatihahLines = [
    [], // Line 1: Surah header
    [
      { verseKey: "1:1", position: 1, isEnd: 0, text: "بِسْمِ" },
      { verseKey: "1:1", position: 2, isEnd: 0, text: "ٱللَّهِ" },
      { verseKey: "1:1", position: 3, isEnd: 0, text: "ٱلرَّحْمَـٰنِ" },
      { verseKey: "1:1", position: 4, isEnd: 0, text: "ٱلرَّحِيمِ" },
      { verseKey: "1:1", position: 5, isEnd: 1, text: "١" },
    ],
    [
      { verseKey: "1:2", position: 1, isEnd: 0, text: "ٱلْحَمْدُ" },
      { verseKey: "1:2", position: 2, isEnd: 0, text: "لِلَّهِ" },
      { verseKey: "1:2", position: 3, isEnd: 0, text: "رَبِّ" },
      { verseKey: "1:2", position: 4, isEnd: 0, text: "ٱلْعَـٰلَمِينَ" },
      { verseKey: "1:2", position: 5, isEnd: 1, text: "٢" },
    ],
  ];

  const baqarahOpeningLines = [
    [], // Line 1: Surah header
    [], // Line 2: Basmalah
    [
      { verseKey: "2:1", position: 1, isEnd: 0, text: "الٓمٓ" },
      { verseKey: "2:1", position: 2, isEnd: 1, text: "١" },
      { verseKey: "2:2", position: 1, isEnd: 0, text: "ذَٰلِكَ" },
    ],
  ];

  it("renders Page 1 (Al-Fatihah) with 15 line slots, Surah header on line 1, and Basmalah as Ayah 1 on line 2", () => {
    const { container } = render(
      <MushafPageViewer
        lines={fatihahLines}
        language="ar"
        pageNumber={1}
        surahName="سورة الفاتحة"
        juzNumber={1}
        direction="rtl"
      />,
    );

    const slots = container.querySelectorAll("[data-mushaf-column] > div");
    expect(slots).toHaveLength(8);
    expect(screen.getByRole("heading", { level: 2, name: "سورة الفاتحة" })).toBeInTheDocument();
    expect(screen.getByText("بِسْمِ")).toBeInTheDocument();
    expect(screen.getByText("ٱلْحَمْدُ")).toBeInTheDocument();
  });

  it("renders Page 2 (Al-Baqarah) with 15 line slots, Surah header on line 1, and standard Basmalah on line 2", () => {
    const { container } = render(
      <MushafPageViewer
        lines={baqarahOpeningLines}
        language="ar"
        pageNumber={2}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
      />,
    );

    const slots = container.querySelectorAll("[data-mushaf-column] > div");
    expect(slots).toHaveLength(8);
    expect(screen.getByRole("heading", { level: 2, name: "سورة البقرة" })).toBeInTheDocument();
    const bismillah = screen.getByLabelText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ");
    expect(bismillah).toBeInTheDocument();
    expect(bismillah).toHaveAttribute("role", "img");
    expect(screen.getByText("الٓمٓ")).toBeInTheDocument();
  });
});

describe("MushafPageViewer invariant layout and center tap", () => {
  const sampleLines = [
    [
      { verseKey: "2:6", position: 1, isEnd: 0, text: "إِنَّ" },
      { verseKey: "2:6", position: 2, isEnd: 0, text: "ٱلَّذِينَ" },
      { verseKey: "2:6", position: 3, isEnd: 0, text: "كَفَرُوا۟" },
      { verseKey: "2:6", position: 4, isEnd: 1, text: "٦" },
    ],
  ];

  it("preserves identical canvas padding and structure whether floating controls are mounted or hidden", () => {
    const { container: withControls } = render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
        topLeftControl={<button type="button">Back</button>}
        topRightControl={<button type="button">More</button>}
        topCenterControl={<button type="button">Index</button>}
        bottomLeftControl={<button type="button">Bookmark</button>}
        bottomRightControl={<button type="button">Meanings</button>}
      />,
    );

    const canvasWithControls = withControls.querySelector(".mushaf-page-canvas") as HTMLElement;
    expect(canvasWithControls).toBeInTheDocument();
    expect(canvasWithControls.style.paddingTop).toBe("calc(3.25rem + env(safe-area-inset-top))");
    expect(canvasWithControls.style.paddingBottom).toMatch(/^calc\(3\.25rem\s*\+\s*env\(safe-area-inset-bottom\)\)$/);
    expect(canvasWithControls.querySelector("[data-testid='mushaf-furniture-surah']")).toBeNull();

    const { container: withoutControls } = render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
      />,
    );

    const canvasWithoutControls = withoutControls.querySelector(".mushaf-page-canvas") as HTMLElement;
    expect(canvasWithoutControls).toBeInTheDocument();
    // Layout and line geometry remain 100% constant in focus mode / hidden controls mode
    expect(canvasWithoutControls.style.paddingTop).toBe(canvasWithControls.style.paddingTop);
    expect(canvasWithoutControls.style.paddingBottom).toBe(canvasWithControls.style.paddingBottom);
    expect(canvasWithoutControls.querySelector("[data-testid='mushaf-furniture-surah']")).toBeNull();
  });

  it("fires onCenterTap on middle click, and onEdgeTap on edge clicks", () => {
    const onCenterTap = vi.fn();
    const onEdgeTap = vi.fn();

    const { container } = render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={3}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
        onCenterTap={onCenterTap}
        onEdgeTap={onEdgeTap}
      />,
    );

    const paper = container.querySelector(".mushaf-paper") as HTMLElement;
    expect(paper).toBeInTheDocument();

    // Mock bounding rect: width = 1000, left = 0
    vi.spyOn(paper, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 1000,
      right: 1000,
      bottom: 1000,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Tap in center (x = 500, ratio = 0.5)
    fireEvent.pointerDown(paper, { clientX: 500, pointerType: "touch", button: 0 });
    fireEvent.pointerUp(paper, { clientX: 500, pointerType: "touch", button: 0 });
    expect(onCenterTap).toHaveBeenCalledTimes(1);
    expect(onEdgeTap).not.toHaveBeenCalled();

    // Tap on left edge (x = 100, ratio = 0.1 < 0.22)
    fireEvent.pointerDown(paper, { clientX: 100, pointerType: "touch", button: 0 });
    fireEvent.pointerUp(paper, { clientX: 100, pointerType: "touch", button: 0 });
    expect(onEdgeTap).toHaveBeenCalledWith("left");
    expect(onCenterTap).toHaveBeenCalledTimes(1);

    // Tap on right edge (x = 900, ratio = 0.9 > 0.78)
    fireEvent.pointerDown(paper, { clientX: 900, pointerType: "touch", button: 0 });
    fireEvent.pointerUp(paper, { clientX: 900, pointerType: "touch", button: 0 });
    expect(onEdgeTap).toHaveBeenCalledWith("right");
    expect(onCenterTap).toHaveBeenCalledTimes(1);
  });

  it("aligns bottom controls (start, center folio, end) with identical bottom coordinate and touch targets", () => {
    const onPageClick = vi.fn();
    const { container } = render(
      <MushafPageViewer
        lines={sampleLines}
        language="ar"
        pageNumber={6}
        surahName="سورة البقرة"
        juzNumber={1}
        direction="rtl"
        onPageClick={onPageClick}
        bottomLeftControl={
          <button type="button" className="h-11">
            <span className="h-8">Bookmark</span>
          </button>
        }
        bottomRightControl={
          <button type="button" className="h-11">
            <span className="h-8">Meanings</span>
          </button>
        }
      />,
    );

    const left = container.querySelector("[data-testid='mushaf-corner-bottom-left']") as HTMLElement;
    const center = container.querySelector("[data-testid='mushaf-control-bottom-center']") as HTMLElement;
    const right = container.querySelector("[data-testid='mushaf-corner-bottom-right']") as HTMLElement;

    expect(left).toBeInTheDocument();
    expect(center).toBeInTheDocument();
    expect(right).toBeInTheDocument();

    // Center folio button meets 44px (h-11) target with inner 32px (h-8) pill
    const centerBtn = center.querySelector("[data-testid='mushaf-furniture-page-btn']") as HTMLElement;
    expect(centerBtn).toBeInTheDocument();
    expect(centerBtn.className).toContain("h-11");
    expect(centerBtn.querySelector("span")?.className).toContain("h-8");
  });
});
