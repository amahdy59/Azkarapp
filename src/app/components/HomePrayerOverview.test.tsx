import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildPrayerCardModels } from "../prayerCardModels";
import { DEFAULT_LOCATION } from "../content/prayerCalculation";
import { HomePrayerOverview } from "./HomePrayerOverview";

describe("Home prayer overview", () => {
  const models = buildPrayerCardModels(new Date("2026-11-24T12:30:00+02:00"), "en", DEFAULT_LOCATION);
  it("keeps all five icons and disclosure slots without changing availability or recording", () => {
    const onOpen = vi.fn();
    const { container } = render(
      <HomePrayerOverview
        models={models}
        language="en"
        dayKey="2026-11-24"
        selectedPrayer={null}
        elapsedPercent={60}
        onOpen={onOpen}
      />,
    );
    expect(container.querySelectorAll("[data-prayer-icon]")).toHaveLength(5);
    expect(container.querySelectorAll("[data-prayer-chevron]")).toHaveLength(5);
    const future = screen.getByRole("button", { name: "Open Isha" });
    expect(future).toBeDisabled();
    expect(document.getElementById(future.getAttribute("aria-describedby")!)).toHaveTextContent(/30 minutes/);
    fireEvent.click(future);
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Open Dhuhr" }));
    expect(onOpen).toHaveBeenCalledWith("dhuhr");
    expect(container.querySelector("input")).toBeNull();
    expect(container.querySelector("[style]")).toHaveStyle({ "--interval-elapsed": "60%" });
  });
  it("distinguishes opened details from next prayer and toggles the same selection closed", () => {
    const onOpen = vi.fn();
    render(
      <HomePrayerOverview
        models={models}
        language="en"
        dayKey="2026-11-24"
        selectedPrayer="dhuhr"
        elapsedPercent={60}
        onOpen={onOpen}
      />,
    );
    const selected = screen.getByRole("button", { name: "Close Dhuhr details" });
    expect(selected).toHaveAttribute("aria-expanded", "true");
    expect(selected).toHaveAttribute("aria-controls", "home-expanded-prayer");
    expect(screen.getByTestId("prayer-card-asr")).toHaveAttribute("data-prayer-state", "next");
    expect(screen.getByTestId("prayer-card-asr")).not.toHaveAttribute("data-selected");
    fireEvent.click(selected);
    expect(onOpen).toHaveBeenCalledWith(null);
  });
  it("keeps the next countdown with its prayer and location settings below the timings without a live timer", () => {
    render(
      <HomePrayerOverview
        models={models}
        language="en"
        dayKey="2026-11-24"
        selectedPrayer={null}
        elapsedPercent={60}
        onOpen={vi.fn()}
        location={<button type="button">Change prayer location</button>}
      />,
    );
    const summary = screen.getByTestId("home-prayer-interval");
    const current = summary.querySelector('[data-prayer-summary-state="current"]')!;
    const next = summary.querySelector('[data-prayer-summary-state="next"]')!;
    expect(within(current as HTMLElement).getByText("Now")).toBeVisible();
    expect(within(current as HTMLElement).getByText("Dhuhr")).toBeVisible();
    expect(within(next as HTMLElement).getByText("Next")).toBeVisible();
    expect(next).toHaveTextContent(models.find((model) => model.state === "next")!.countdown!);
    expect(summary.closest("[aria-live]")).toBeNull();
    const location = screen.getByRole("button", { name: "Change prayer location" });
    expect(
      screen.getByTestId("home-all-prayers-row").compareDocumentPosition(location) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
