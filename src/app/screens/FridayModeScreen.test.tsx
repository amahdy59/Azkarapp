import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FridayModeScreen } from "./FridayModeScreen";

describe("FridayModeScreen", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("launches Al-Kahf at the displayed verse progress", () => {
    const onStartKahf = vi.fn();
    render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={35}
        onBack={() => undefined}
        onStartKahf={onStartKahf}
        onStartDuasSession={() => undefined}
      />,
    );

    expect(screen.getByText("Ayah 35 of 110")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue reading" }));
    expect(onStartKahf).toHaveBeenCalledOnce();
  });

  it("keeps the Sunnahs as a weekly checklist and the duas behind one action", () => {
    const onStartDuasSession = vi.fn();
    render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={0}
        onBack={() => undefined}
        onStartKahf={() => undefined}
        onStartDuasSession={onStartDuasSession}
      />,
    );

    const ghusl = screen.getByRole("checkbox", { name: "Perform ghusl" });
    expect(ghusl).toHaveAttribute("aria-checked", "false");
    fireEvent.click(ghusl);
    expect(ghusl).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("button", { name: "Comprehensive Duas" }));
    expect(onStartDuasSession).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Show benefit and source" })).not.toBeInTheDocument();
  });
});
