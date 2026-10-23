import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReadingPanel } from "./ReadingPanel";

describe("ReadingPanel preview", () => {
  it("uses one live sample reflecting both selected font and size", () => {
    const props = {
      language: "en" as const,
      direction: "ltr" as const,
      textSize: "medium" as const,
      zikrFont: "humanist" as const,
      showTranslation: true,
      showTransliteration: false,
      onTextSizeChange: vi.fn(),
      onZikrFontChange: vi.fn(),
      onShowTranslationChange: vi.fn(),
      onShowTransliterationChange: vi.fn(),
      onBack: vi.fn(),
      onReaderToolLabelsChange: vi.fn(),
    };
    const { rerender } = render(<ReadingPanel {...props} />);
    const sample = screen.getByTestId("reader-footer-preview");
    expect(sample).toHaveAttribute("aria-hidden", "true");
    expect(sample.querySelectorAll("button")).toHaveLength(4);
    for (const button of sample.querySelectorAll("button")) expect(button).toBeDisabled();
    expect(sample).toHaveTextContent("Benefit");
    expect(sample).toHaveTextContent("Listen");
    expect(sample).toHaveTextContent("Share");
    expect(sample).toHaveTextContent("Focus");
    fireEvent.click(screen.getByRole("radio", { name: "Icons only" }));
    expect(props.onReaderToolLabelsChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("radio", { name: "Icons with labels" })).toBeChecked();
    expect(screen.getAllByText("الحمد لله")).toHaveLength(1);
    expect(screen.getByTestId("reading-preview")).toHaveStyle({ fontSize: "1.5rem" });
    fireEvent.click(screen.getByTestId("reading-text-size-large"));
    fireEvent.click(screen.getByTestId("reading-zikr-font-clear"));
    expect(props.onTextSizeChange).toHaveBeenCalledWith("large");
    expect(props.onZikrFontChange).toHaveBeenCalledWith("clear");
    rerender(<ReadingPanel {...props} textSize="large" zikrFont="clear" />);
    expect(screen.getByTestId("reading-preview")).toHaveStyle({ fontSize: "1.75rem" });
    expect(screen.getByTestId("reading-preview").style.fontFamily).toContain("Noto Sans Arabic");
    expect(screen.getByTestId("reading-preview")).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("reading-preview")).toHaveAttribute("lang", "ar");
  });
});
