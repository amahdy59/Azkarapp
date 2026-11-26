import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildPrayerCardModels } from "../prayerCardModels";
import { DEFAULT_LOCATION } from "../content/prayerCalculation";
import { HomePrayerOverview, HomePrayerSummary } from "./HomePrayerOverview";
import type { PrayerTrackingRecord } from "../types";

const models = buildPrayerCardModels(new Date("2026-11-24T12:30:00+02:00"), "en", DEFAULT_LOCATION);
const props = { models, language: "en" as const, dayKey: "2026-11-24", selectedPrayer: null };

describe("Home prayer overview", () => {
  it("opens a dialog without changing availability or recording", () => {
    const onOpen = vi.fn();
    const { container } = render(<HomePrayerOverview {...props} onOpen={onOpen} />);
    expect(container.querySelectorAll("[data-prayer-icon]")).toHaveLength(5);
    expect(container.querySelector("[data-prayer-chevron]")).toBeNull();
    const future = screen.getByRole("button", { name: "Open Isha" });
    expect(future).toBeDisabled();
    expect(future).toHaveAccessibleDescription(/30 minutes/);
    fireEvent.click(future);
    expect(onOpen).not.toHaveBeenCalled();
    const current = screen.getByRole("button", { name: "Open Dhuhr" });
    expect(current).toHaveAttribute("aria-haspopup", "dialog");
    expect(current).not.toHaveAttribute("aria-expanded");
    fireEvent.click(current);
    expect(onOpen).toHaveBeenCalledWith("dhuhr");
    expect(current).toHaveFocus();
    expect(container.querySelector("input")).toBeNull();
  });

  it("keeps selection and temporal state independent", () => {
    render(<HomePrayerOverview {...props} selectedPrayer="dhuhr" onOpen={vi.fn()} />);
    expect(screen.getByTestId("prayer-card-dhuhr")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("prayer-card-asr")).toHaveAttribute("data-prayer-state", "next");
    expect(screen.getByTestId("prayer-card-asr")).not.toHaveAttribute("data-selected");
  });

  it.each([
    [{ mosque: true }, true],
    [{ mosque: false, location: "home" }, true],
    [{ mosque: false, adhkar: true, sunnah: true }, false],
    [{ mosque: false, location: "mosque" }, true],
  ] as const)("derives recorded state from the prayer itself: %j", (record, expected) => {
    const records: PrayerTrackingRecord[] = [{ dayKey: props.dayKey, prayer: "dhuhr", adhkar: false, ...record }];
    render(<HomePrayerOverview {...props} records={records} onOpen={vi.fn()} />);
    const badge = screen.queryByTestId("prayer-recorded-dhuhr");
    if (expected) {
      expect(badge!.querySelector("svg")).not.toBeNull();
      expect(badge).toHaveTextContent("");
      expect(screen.getByRole("button", { name: "Open Dhuhr" })).toHaveAccessibleDescription(/Now.*Recorded/);
    } else expect(badge).toBeNull();
  });

  it("does not borrow another date's recorded check", () => {
    render(
      <HomePrayerOverview
        {...props}
        records={[{ dayKey: "2026-11-23", prayer: "dhuhr", mosque: true, adhkar: true }]}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("prayer-recorded-dhuhr")).toBeNull();
    expect(screen.getByRole("button", { name: "Open Dhuhr" })).toHaveAccessibleDescription(/Not recorded/);
  });

  it("keeps location after all five timings", () => {
    render(<HomePrayerOverview {...props} onOpen={vi.fn()} location={<button>Change prayer location</button>} />);
    const location = screen.getByRole("button", { name: "Change prayer location" });
    expect(
      screen.getByTestId("home-all-prayers-row").compareDocumentPosition(location) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("uses blank future status slots without losing their accessible explanation", () => {
    const { container } = render(<HomePrayerOverview {...props} onOpen={vi.fn()} />);
    for (const prayer of ["maghrib", "isha"]) {
      const card = screen.getByTestId(`prayer-card-${prayer}`);
      expect(card.querySelector(".home-prayer-status-badge")).toBeNull();
      expect(within(card).getByRole("button")).toHaveAccessibleDescription(/Not yet due/);
    }
    expect(screen.getByRole("button", { name: "Open Dhuhr" })).toHaveAccessibleDescription(/Now.*Not recorded/);
    expect(screen.getByRole("button", { name: "Open Asr" })).toHaveAccessibleDescription(/Next/);
    expect(container.querySelector(".home-prayer-desktop-status")).toBeNull();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });
});

describe("Persistent prayer summary", () => {
  it("keeps Now/Next and countdown with one labelled disclosure and no live timer", () => {
    const toggle = vi.fn();
    render(<HomePrayerSummary {...props} elapsedPercent={60} expanded={false} onToggleExpanded={toggle} />);
    const summary = screen.getByTestId("home-prayer-interval");
    const next = summary.querySelector('[data-prayer-summary-state="next"]') as HTMLElement;
    expect(within(next).getByText("Next")).toBeVisible();
    expect(next).toHaveTextContent(models.find((model) => model.state === "next")!.countdown!);
    expect(summary.closest("[aria-live]")).toBeNull();
    expect(summary.querySelector("[style]")).toHaveStyle({ "--interval-elapsed": "60%" });
    const button = screen.getByRole("button", { name: "Show timings" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "home-prayer-timings");
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledOnce();
  });
  it("holds the disclosure while location recovery needs its opener", () => {
    const toggle = vi.fn();
    render(<HomePrayerSummary {...props} elapsedPercent={60} expanded disclosureDisabled onToggleExpanded={toggle} />);
    const button = screen.getByRole("button", { name: "Hide timings" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(toggle).not.toHaveBeenCalled();
  });
});
