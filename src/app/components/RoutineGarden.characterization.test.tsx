/**
 * Characterization tests for RoutineGarden.
 *
 * This file is 781 lines at ~2.5% statement coverage and is scheduled to be
 * split. These tests describe what it does *today* — including quirks — so the
 * split can be verified as behaviour-preserving rather than hoped to be.
 *
 * They are intentionally about observable output, not implementation detail, so
 * they survive the refactor that follows.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  GoldenLeafMark,
  GreenLeafMark,
  PalmTreeMark,
  TodayRoutineGarden,
  GardenMilestones,
  GrowthEventStatus,
  SevenDayGarden,
  getGardenDateLabel,
} from "./RoutineGarden";
import type { GardenSummary, GrowthEvent } from "../progress";

const FIXED_DATE = new Date("2026-08-07T10:00:00Z");

function makeSummary(overrides: Partial<GardenSummary> = {}): GardenSummary {
  return {
    today: { goldenLeafCount: 2, completedCategories: ["morning", "evening"], extraLeafCount: 0 },
    days: [],
    milestones: [],
    lifetimePalms: 3,
    currentUsageStreak: 4,
    activeDaysLast7: 5,
    ...overrides,
  } as unknown as GardenSummary;
}

/** GrowthEvent requires day and leaf bookkeeping alongside the kind. */
function growthEvent(kind: "leaf" | "palm" | "extra_leaf" | "repeat") {
  return { kind, category: "morning", dayKey: "2026-08-07", leafCount: 2 } as GrowthEvent;
}

describe("getGardenDateLabel", () => {
  // The label drives the period navigator, so its shape per tab and language is
  // load-bearing for the whole Progress screen.
  it("labels today distinctly from other days", () => {
    const today = getGardenDateLabel(FIXED_DATE, "day", 0, "en");
    const past = getGardenDateLabel(FIXED_DATE, "day", -1, "en");
    expect(today).not.toBe(past);
    expect(today.toLowerCase()).toContain("today");
  });

  it("produces a different label per tab", () => {
    const labels = (["day", "week", "month", "year"] as const).map((tab) =>
      getGardenDateLabel(FIXED_DATE, tab, 0, "en"),
    );
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("carries an era suffix that follows the calendar type", () => {
    expect(getGardenDateLabel(FIXED_DATE, "day", 0, "en", "hijri")).toContain("AH");
    expect(getGardenDateLabel(FIXED_DATE, "day", 0, "en", "gregorian")).toContain("AD");
  });

  it("localizes the suffix into Arabic", () => {
    expect(getGardenDateLabel(FIXED_DATE, "day", 0, "ar", "hijri")).toContain("هـ");
    expect(getGardenDateLabel(FIXED_DATE, "day", 0, "ar", "gregorian")).toContain("م");
  });

  it("returns a non-empty label for every tab, language and calendar", () => {
    for (const tab of ["day", "week", "month", "year"] as const) {
      for (const language of ["en", "ar"] as const) {
        for (const calendar of ["hijri", "gregorian"] as const) {
          const label = getGardenDateLabel(FIXED_DATE, tab, 0, language, calendar);
          expect(label.trim(), `${tab}/${language}/${calendar}`).not.toBe("");
        }
      }
    }
  });
});

describe("leaf and palm marks", () => {
  // Filled vs unfilled is the core visual signal for progress, so it must stay
  // observable after the split.
  it("renders a distinguishable filled and unfilled palm", () => {
    const { container: filled } = render(<PalmTreeMark filled />);
    const { container: hollow } = render(<PalmTreeMark filled={false} />);
    expect(filled.innerHTML).not.toBe(hollow.innerHTML);
  });

  it("renders leaf marks at the requested size", () => {
    const { container } = render(<GoldenLeafMark size={40} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("40");
  });

  it("renders each mark variant without throwing", () => {
    expect(() => render(<GoldenLeafMark />)).not.toThrow();
    expect(() => render(<GreenLeafMark />)).not.toThrow();
    expect(() => render(<PalmTreeMark />)).not.toThrow();
  });
});

describe("Home wird card", () => {
  it("keeps Morning, Evening, and Sleep in one stable semantic order", () => {
    render(
      <TodayRoutineGarden
        summary={makeSummary()}
        language="en"
        hideTabs
        visibleCategoryIds={["morning", "evening", "before_sleep"]}
      />,
    );

    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual([
      "Morning Azkar - Completed",
      "Evening Azkar - Completed",
      "Sleep Azkar - Not completed",
    ]);
  });
});

describe("GrowthEventStatus", () => {
  // This is a live region: it announces growth as it happens.
  it("announces politely with a status role", () => {
    render(<GrowthEventStatus event={growthEvent("leaf")} language="en" />);
    const status = screen.getByTestId("garden-growth-event");
    expect(status).toHaveAttribute("role", "status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("renders a distinct message per event kind", () => {
    const kinds = ["leaf", "palm", "extra_leaf", "repeat"] as const;
    const texts = kinds.map((kind) => {
      const { container, unmount } = render(<GrowthEventStatus event={growthEvent(kind)} language="en" />);
      const text = container.textContent ?? "";
      unmount();
      return text;
    });
    expect(new Set(texts).size).toBe(kinds.length);
  });

  it("renders Arabic copy without falling back to English", () => {
    const { container } = render(<GrowthEventStatus event={growthEvent("palm")} language="ar" />);
    expect(container.textContent).toMatch(/[؀-ۿ]/);
  });
});

describe("SevenDayGarden and GardenMilestones", () => {
  it("render without throwing on an empty summary", () => {
    const empty = makeSummary({ days: [], milestones: [], lifetimePalms: 0 });
    expect(() => render(<SevenDayGarden summary={empty} language="en" />)).not.toThrow();
    expect(() => render(<GardenMilestones summary={empty} language="en" />)).not.toThrow();
  });

  it("render in both languages without throwing", () => {
    const summary = makeSummary();
    for (const language of ["en", "ar"] as const) {
      expect(() => render(<SevenDayGarden summary={summary} language={language} />)).not.toThrow();
      expect(() => render(<GardenMilestones summary={summary} language={language} />)).not.toThrow();
    }
  });
});
