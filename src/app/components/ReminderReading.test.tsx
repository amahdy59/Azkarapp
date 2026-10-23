import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReminderReading } from "./ReminderReading";
import { DailyEvidenceCard } from "./HomeCards";
import type { DailyEvidence } from "../dailyEvidence";

const evidence: DailyEvidence = {
  evidenceId: "first",
  hadith: "Complete narration retained in the DOM.",
  hadithInArabic: false,
  authenticity: "Sahih Muslim",
  benefit: "Meaning.",
  meaning: "A brief sourced meaning.",
  meaningSourceUrl: "https://sunnah.com/muslim:55a",
  sourceUrl: "https://sunnah.com/muslim:55a",
};

describe("reminder progressive disclosure", () => {
  let height: number;
  let measure: ResizeObserverCallback;
  beforeEach(() => {
    height = 210;
    const originalStyle = window.getComputedStyle;
    vi.spyOn(window, "getComputedStyle").mockImplementation((node) => {
      const style = originalStyle(node);
      style.lineHeight = "40px";
      return style;
    });
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => height);
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          measure = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows expansion only beyond four measured lines, including after reflow", () => {
    height = 160;
    render(<ReminderReading evidence={evidence} language="en" onGlass={false} />);
    expect(screen.queryByTestId("daily-evidence-expand")).not.toBeInTheDocument();
    height = 210;
    act(() => measure([], {} as ResizeObserver));
    const expand = screen.getByTestId("daily-evidence-expand");
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("daily-evidence-hadith")).toHaveTextContent(evidence.hadith);
    fireEvent.click(expand);
    expect(expand).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("daily-evidence-hadith")).not.toHaveClass("line-clamp-4");
    fireEvent.click(expand);
    height = 160;
    act(() => measure([], {} as ResizeObserver));
    expect(screen.queryByTestId("daily-evidence-expand")).not.toBeInTheDocument();
  });

  it("keeps meaning and narration independently expandable", () => {
    const onReadingChange = vi.fn();
    render(<ReminderReading evidence={evidence} language="en" onGlass={false} onReadingChange={onReadingChange} />);
    const meaning = screen.getByTestId("daily-evidence-meaning");
    expect(meaning).not.toHaveAttribute("open");
    fireEvent.click(screen.getByTestId("daily-evidence-expand"));
    expect(meaning).not.toHaveAttribute("open");
    (meaning as HTMLDetailsElement).open = true;
    fireEvent(meaning, new Event("toggle"));
    fireEvent.click(screen.getByTestId("daily-evidence-expand"));
    expect(meaning).toHaveAttribute("open");
    expect(onReadingChange).toHaveBeenLastCalledWith(true);
  });

  it("leaves Quran quotations unclamped", () => {
    render(<ReminderReading evidence={{ ...evidence, isQuran: true }} language="en" onGlass={false} />);
    expect(screen.queryByTestId("daily-evidence-expand")).not.toBeInTheDocument();
    expect(screen.getByTestId("daily-evidence-hadith")).not.toHaveClass("line-clamp-4");
  });

  it("holds the displayed narration while reading or focused, and allows explicit next", () => {
    const refresh = vi.fn();
    const props = { language: "en" as const, direction: "ltr" as const, onRefresh: refresh };
    const view = render(<DailyEvidenceCard {...props} evidence={evidence} />);
    fireEvent.click(screen.getByTestId("daily-evidence-expand"));
    view.rerender(
      <DailyEvidenceCard {...props} evidence={{ ...evidence, evidenceId: "second", hadith: "Next narration" }} />,
    );
    expect(screen.getByTestId("daily-evidence-hadith")).toHaveTextContent(evidence.hadith);
    fireEvent.click(screen.getByTestId("daily-evidence-refresh"));
    expect(refresh).toHaveBeenCalledOnce();
    expect(screen.getByTestId("daily-evidence-hadith")).toHaveTextContent("Next narration");
    expect(screen.getByTestId("daily-evidence-expand")).toHaveAttribute("aria-expanded", "false");
  });
});
