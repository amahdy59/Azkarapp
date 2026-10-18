import { fireEvent, render, screen } from "@testing-library/react";
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

  it("keeps the fixed gloss outside the reading canvas while preserving its page theme", () => {
    const canvas = document.createElement("div");
    canvas.className = "theme-light mushaf-page-canvas";
    const anchor = document.createElement("button");
    canvas.append(anchor);
    document.body.append(canvas);
    const { unmount } = render(
      <QuranWordPopover meanings={[sampleMeaning]} anchorEl={anchor} language="en" direction="ltr" onClose={vi.fn()} />,
    );
    try {
      const gloss = screen.getByRole("tooltip");
      expect(gloss.parentElement).toBe(document.body);
      expect(gloss).toHaveClass("theme-light");
      expect(canvas).not.toContainElement(gloss);
    } finally {
      unmount();
      canvas.remove();
    }
  });

  it("consumes Escape before it can leave the surrounding reader", () => {
    const anchorEl = document.createElement("button");
    document.body.appendChild(anchorEl);
    const onClose = vi.fn();
    const readerShortcut = vi.fn();
    window.addEventListener("keydown", readerShortcut);
    const { unmount } = render(
      <QuranWordPopover
        meanings={[sampleMeaning]}
        anchorEl={anchorEl}
        language="ar"
        direction="rtl"
        onClose={onClose}
      />,
    );
    try {
      fireEvent.keyDown(anchorEl, { key: "Escape" });
      expect(onClose).toHaveBeenCalledOnce();
      expect(readerShortcut).not.toHaveBeenCalled();
    } finally {
      unmount();
      window.removeEventListener("keydown", readerShortcut);
      anchorEl.remove();
    }
  });

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
