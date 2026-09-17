import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { registerLazyCollection } from "../content/azkar";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { CategoryScreen } from "./CategoryScreen";

describe("CategoryScreen comprehensive-dua session", () => {
  it("uses the standard collection progress and session controls", () => {
    const onZikr = vi.fn();
    registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);

    render(
      <CategoryScreen
        catId="comprehensive_duas"
        completed={new Set()}
        isArabic={false}
        direction="ltr"
        onZikr={onZikr}
        onReset={() => undefined}
        onRepeat={() => undefined}
        onBack={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: "Comprehensive Duas" })).toBeInTheDocument();
    expect(screen.getByText("0 of 47")).toBeInTheDocument();
    expect(screen.getByText("Collection introduction")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Start Session/ }));
    expect(onZikr).toHaveBeenCalledWith(0);
  });

  it("turns the sleep preparation checklist into visible, announced progress", () => {
    render(
      <CategoryScreen
        catId="before_sleep"
        completed={new Set()}
        isArabic={false}
        direction="ltr"
        onZikr={() => undefined}
        onReset={() => undefined}
        onRepeat={() => undefined}
        onBack={() => undefined}
      />,
    );

    expect(screen.getByTestId("sleep-preparation-count")).toHaveTextContent("0 / 3");
    const steps = ["Perform wudu", "Dust the bed", "Lie on the right side"];
    for (const step of steps) fireEvent.click(screen.getByRole("checkbox", { name: step }));

    expect(screen.getByTestId("sleep-preparation-count")).toHaveTextContent("3 / 3");
    expect(screen.getByRole("status")).toHaveTextContent("Preparation complete");

    fireEvent.click(screen.getByRole("checkbox", { name: steps[0] }));
    expect(screen.queryByTestId("sleep-preparation-complete")).not.toBeInTheDocument();
  });

  it("uses a compact routine-length menu beside the session actions", async () => {
    const onRoutineModeChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CategoryScreen
        catId="morning"
        completed={new Set()}
        isArabic={false}
        direction="ltr"
        onZikr={() => undefined}
        onReset={() => undefined}
        onRepeat={() => undefined}
        onBack={() => undefined}
        routineMode="complete"
        onRoutineModeChange={onRoutineModeChange}
      />,
    );

    const filter = screen.getByTestId("routine-mode-filter");
    expect(filter).toHaveAccessibleName("Routine length: Complete");
    expect(filter).toHaveClass("order-2");
    expect(screen.getByTestId("start-session-button")).toHaveClass("order-1");
    await user.click(filter);
    await user.click(screen.getByRole("menuitemradio", { name: /Core ·/ }));
    expect(onRoutineModeChange).toHaveBeenCalledWith("core");
  });

  it("expands the existing zikr text instead of mounting a second copy", async () => {
    const user = userEvent.setup();
    render(
      <CategoryScreen
        catId="morning"
        completed={new Set()}
        isArabic
        direction="rtl"
        onZikr={() => undefined}
        onReset={() => undefined}
        onRepeat={() => undefined}
        onBack={() => undefined}
      />,
    );

    const summary = screen.getByTestId("zikr-summary-0");
    const disclosure = summary.closest("button");
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(summary).toHaveClass("line-clamp-2");

    await user.click(disclosure!);

    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("zikr-summary-0")).toBe(summary);
    expect(summary).not.toHaveClass("line-clamp-2");

    // Collapses back via chevron toggle button
    const chevron = screen.getByRole("button", { name: "طي الذكر" });
    await user.click(chevron);
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(summary).toHaveClass("line-clamp-2");
  });

  it("toggles checkmark completion without triggering card expansion", async () => {
    const onToggleZikr = vi.fn();
    const user = userEvent.setup();
    render(
      <CategoryScreen
        catId="morning"
        completed={new Set()}
        isArabic
        direction="rtl"
        onZikr={() => undefined}
        onToggleZikr={onToggleZikr}
        onReset={() => undefined}
        onRepeat={() => undefined}
        onBack={() => undefined}
      />,
    );

    const summary = screen.getByTestId("zikr-summary-0");
    const disclosure = summary.closest("button");
    const checkmarkBtn = screen.getAllByRole("button", { name: /غير مكتمل/ })[0];

    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await user.click(checkmarkBtn!);

    expect(onToggleZikr).toHaveBeenCalledWith(0);
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
  });

  it("shows bounded preview with full Mushaf link when long surah is expanded", async () => {
    const user = userEvent.setup();
    render(
      <CategoryScreen
        catId="before_sleep"
        completed={new Set()}
        isArabic
        direction="rtl"
        onZikr={() => undefined}
        onReset={() => undefined}
        onRepeat={() => undefined}
        onBack={() => undefined}
      />,
    );

    // Find the long surah (As-Sajda is at index 6 in before_sleep)
    const surahSummary = screen.getByTestId("zikr-summary-6");
    const disclosure = surahSummary.closest("button");
    await user.click(disclosure!);

    expect(screen.getByText("اقرأ السورة كاملة في المصحف")).toBeInTheDocument();
  });
});
