import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_AZKAR, getAzkarForMode } from "../content/azkar";
import { CATEGORY_IDS, type CategoryId } from "../types";
import { HomeScreen } from "./HomeScreen";

function emptyProgress() {
  return Object.fromEntries(CATEGORY_IDS.map((id) => [id, new Set<string>()])) as Record<CategoryId, Set<string>>;
}

const routineModes = {
  morning: "complete",
  evening: "complete",
  before_sleep: "complete",
  after_prayer: "complete",
} as const;

describe("HomeScreen quick access", () => {
  afterEach(() => vi.useRealTimers());

  it("overlays the transparent utility header on the hero and exposes saved and benefit actions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    const saved = ALL_AZKAR.find((zikr) => !zikr.isCollectionIntroduction)!;
    const onOpenSavedZikr = vi.fn();
    const onOpenBenefits = vi.fn();

    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={false}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        routineModes={routineModes}
        savedZikrIds={new Set([saved.id])}
        onOpenSavedZikr={onOpenSavedZikr}
        onOpenSavedLibrary={() => undefined}
        onOpenBenefits={onOpenBenefits}
      />,
    );

    expect(screen.getByTestId("hijri-date")).toBeInTheDocument();
    expect(screen.getByTestId("home-hero")).not.toHaveClass("sm:mt-4");
    expect(screen.getByTestId("home-hero")).toHaveClass("rounded-b-3xl");
    expect(screen.getByTestId("home-hero").closest(".app-screen-surface")).toHaveStyle({ paddingTop: "0px" });
    expect(screen.queryByTestId("home-header-stats")).not.toBeInTheDocument();
    expect(screen.queryByText("The full reviewed collection.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("home-saved-section").getElementsByTagName("button")[0]!);
    expect(onOpenSavedZikr).toHaveBeenCalledWith(saved.category, expect.any(Number));

    fireEvent.click(screen.getByTestId("home-benefits-card"));
    expect(onOpenBenefits).toHaveBeenCalledOnce();
  });

  it("renders the theme-aware after-prayer tracker rail with the next prayer while keeping the compact wird card", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 15, 45));
    const onPrayerResume = vi.fn();
    const onOpenCustomCounter = vi.fn();

    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={true}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        onPrayerResume={onPrayerResume}
        routineModes={routineModes}
        savedZikrIds={new Set()}
        onOpenSavedZikr={() => undefined}
        onOpenSavedLibrary={() => undefined}
        onOpenBenefits={() => undefined}
        onOpenCustomCounter={onOpenCustomCounter}
      />,
    );

    expect(screen.getByTestId("after-prayer-trackers")).toBeInTheDocument();

    const grid = screen.getByTestId("prayer-tracker-cards");
    const shownStates = [...grid.querySelectorAll("article[data-prayer-state]")].map(
      (card) => (card as HTMLElement).dataset.prayerState,
    );
    expect(shownStates).toContain("upcoming");
    expect(shownStates).toContain("next");
    expect(shownStates.filter((state) => state === "current")).toHaveLength(1);
    expect(grid.querySelectorAll("article[data-prayer-state]")).toHaveLength(5);

    // Which prayer is next depends on the mocked clock, so find it.
    const nextCard = grid.querySelector('article[data-prayer-state="next"]')!;
    expect(nextCard.querySelector('[data-testid^="prayer-status-"]')).toHaveTextContent("Next prayer");

    // Tracking is two independent native checkboxes per card, inside a
    // fieldset that names the prayer.
    for (const card of grid.querySelectorAll("article[data-prayer-state]")) {
      expect(card.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
      expect(card.querySelector("fieldset legend")).toHaveTextContent(/prayer tracking/i);
    }
    // A prayer that has not arrived keeps its controls visible but inert.
    const nextBoxes = nextCard.querySelectorAll('input[type="checkbox"]');
    expect([...nextBoxes].every((box) => (box as HTMLInputElement).disabled)).toBe(true);
    const currentCard = grid.querySelector('article[data-prayer-state="current"]')!;
    const currentBoxes = currentCard.querySelectorAll('input[type="checkbox"]');
    expect([...currentBoxes].some((box) => (box as HTMLInputElement).disabled)).toBe(false);

    expect(
      screen.getByTestId("after-prayer-trackers").compareDocumentPosition(screen.getByTestId("home-masbaha-entry")),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText("After Prayer Azkar")).toBeInTheDocument();
    expect(screen.getByText(/today'?s wird/i)).toBeInTheDocument();

    // The identity block keeps the route into that prayer's adhkar.
    fireEvent.click(screen.getByRole("button", { name: /Fajr prayer adhkar/i }));
    expect(onPrayerResume).toHaveBeenCalledWith("fajr");
    fireEvent.click(screen.getByRole("button", { name: "Masbaha" }));
    expect(onOpenCustomCounter).toHaveBeenCalledOnce();
  });

  it("keeps the utility header readable over the image while Home content scrolls", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 15, 45));

    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={true}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        routineModes={routineModes}
        savedZikrIds={new Set()}
      />,
    );

    fireEvent.scroll(screen.getByRole("region", { name: "Azkar" }), { target: { scrollTop: 12 } });
    expect(screen.getByTestId("home-utility-header")).toHaveAttribute("data-scrolled", "true");
    expect(screen.getByTestId("home-utility-header")).toHaveClass("bg-on-media-surface/95");
  });

  it("shows the completion card briefly, without actions, then returns to the normal hero", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    const completed = emptyProgress();
    completed.morning = new Set(getAzkarForMode("morning", "complete").map((zikr) => zikr.id));

    render(
      <HomeScreen
        completed={completed}
        dailyCompletions={[]}
        quietProgressEnabled={false}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        routineModes={routineModes}
        savedZikrIds={new Set()}
      />,
    );

    const completion = screen.getByRole("status", { name: /completed/i });
    expect(completion).toBeInTheDocument();
    expect(completion).not.toHaveTextContent(/continue|read again/i);
    expect(completion.querySelector("button")).toBeNull();

    act(() => vi.advanceTimersByTime(4_200));
    expect(screen.queryByRole("status", { name: /completed/i })).not.toBeInTheDocument();
    expect(screen.getByTestId("prayer-tracker-cards")).toBeInTheDocument();
    expect(screen.queryByTestId("home-primary-cta")).not.toBeInTheDocument();
  });
});
