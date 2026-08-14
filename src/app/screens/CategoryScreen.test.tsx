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
    await user.click(filter);
    await user.click(screen.getByRole("menuitemradio", { name: /Core ·/ }));
    expect(onRoutineModeChange).toHaveBeenCalledWith("core");
  });
});
