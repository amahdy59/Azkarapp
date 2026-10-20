import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ReaderScreen } from "./ReaderScreen";
import { getAzkarForMode } from "../content/azkar";

const props = {
  catId: "morning" as const,
  idx: 0,
  routineMode: "complete" as const,
  isArabic: false,
  direction: "ltr" as const,
  themeMode: "midnight" as const,
  isDone: false,
  collectionCompletedCount: 0,
  hapticFeedback: false,
  reduceMotion: true,
  showTranslation: false,
  showTransliteration: false,
  textSize: "medium" as const,
  onTextSizeChange: vi.fn(),
  savedZikrIds: new Set<string>(),
  onBack: vi.fn(),
  onComplete: vi.fn(),
  onAdvance: vi.fn(),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  onToggleSaved: vi.fn(),
  audioAvailable: false,
};

it("renders the remembered meaning outside the text viewport and switches without counting", () => {
  const onChange = vi.fn();
  const { rerender } = render(<ReaderScreen {...props} readerMeaningOnly onReaderMeaningOnlyChange={onChange} />);
  expect(screen.getByTestId("reader-main-translation")).toHaveTextContent(
    getAzkarForMode("morning", "complete")[0].translation,
  );
  const button = screen.getByRole("button", { name: "Show Arabic" });
  const region = screen.getByRole("region", { name: "Zikr reading text" });
  expect(region).not.toContainElement(button);
  expect(button).toHaveAttribute("aria-controls", region.id);
  const count = screen.getByTestId("counter-surface").getAttribute("aria-label");
  region.scrollTop = 100;
  fireEvent.click(button);
  expect(onChange).toHaveBeenCalledWith(false);
  expect(region.scrollTop).toBe(0);
  expect(props.onComplete).not.toHaveBeenCalled();
  expect(screen.getByTestId("counter-surface")).toHaveAttribute("aria-label", count);
  rerender(<ReaderScreen {...props} readerMeaningOnly={false} onReaderMeaningOnlyChange={onChange} />);
  expect(screen.queryByTestId("reader-main-translation")).not.toBeInTheDocument();
  expect(screen.getByTestId("zikr-text")).toBeVisible();
});

it("falls back to original text without erasing the preference when a translation is unavailable", () => {
  const item = { ...getAzkarForMode("morning", "complete")[0], translation: "" };
  const onChange = vi.fn();
  render(<ReaderScreen {...props} azkarList={[item]} readerMeaningOnly onReaderMeaningOnlyChange={onChange} />);
  expect(screen.queryByTestId("reader-language-toggle")).not.toBeInTheDocument();
  expect(screen.queryByTestId("reader-main-translation")).not.toBeInTheDocument();
  expect(screen.getByTestId("zikr-text")).toHaveTextContent(item.arabicText);
  expect(onChange).not.toHaveBeenCalled();
});
