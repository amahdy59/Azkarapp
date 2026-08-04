import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomCounterScreen } from "./CustomCounterScreen";

describe("CustomCounterScreen Component", () => {
  it("renders correctly in Arabic with initial state", () => {
    const onBack = vi.fn();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={onBack} />);

    expect(screen.getByText("المسبحة الإلكترونية")).toBeInTheDocument();
    expect(screen.getByText("الذكر المأثور")).toBeInTheDocument();
    expect(screen.getByText("سُبْحَانَ اللَّهِ وَبِحَمْدِهِ")).toBeInTheDocument();
    expect(screen.getAllByText("اضغط للتسبيح")[0]).toBeInTheDocument();
  });

  it("increments counter on tap and supports undo/reset", () => {
    const onBack = vi.fn();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={onBack} />);

    const tapButtons = screen.getAllByRole("button", { name: "اضغط للتسبيح" });
    fireEvent.click(tapButtons[0]!);

    expect(screen.getByText("١")).toBeInTheDocument();
    const undoButton = screen.getAllByText("تراجع")[0]?.closest("button");
    expect(undoButton).not.toBeDisabled();

    fireEvent.click(undoButton!);
    expect(screen.getAllByText("٠")[0]).toBeInTheDocument();
  });
});
