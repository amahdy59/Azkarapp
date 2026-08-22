import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getProgressDayKey } from "../progress";
import { QuranWirdScreen } from "./QuranWirdScreen";

function renderScreen() {
  const today = getProgressDayKey();
  const props = {
    language: "en" as const,
    direction: "ltr" as const,
    position: { page: 22, surahNumber: 2, ayahNumber: 142, juzNumber: 2 },
    plan: { kind: "daily" as const, dailyPages: 4 },
    wirdHistory: { [today]: [20, 21] },
    onBack: vi.fn(),
    onContinue: vi.fn(),
    onPlanChange: vi.fn(),
    onRecordPage: vi.fn(),
    onUndoPage: vi.fn(),
  };
  render(<QuranWirdScreen {...props} />);
  return props;
}

describe("QuranWirdScreen", () => {
  it("makes continuation primary and exposes a text equivalent for the progress ring", () => {
    const props = renderScreen();

    expect(screen.getByRole("button", { name: /continue reading/i })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "2 of 4 pages completed today" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
    expect(screen.getByText("Surah Al-Baqarah")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /record a page/i }));
    expect(props.onRecordPage).toHaveBeenCalledOnce();
  });

  it("offers the three focused plan choices", () => {
    const props = renderScreen();
    fireEvent.change(screen.getByLabelText("Choose a plan"), { target: { value: "khatmah30" } });

    expect(props.onPlanChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "khatmah30", dailyPages: 21, durationDays: 30 }),
    );
  });
});
