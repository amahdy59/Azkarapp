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

  it("keeps the mobile utility header to two semantic rows and exposes saved and benefit actions", () => {
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
    expect(screen.getByTestId("home-hero").closest(".app-screen-surface")).toHaveStyle({ paddingTop: "0px" });
    expect(screen.getByTestId("home-header-stats")).toBeInTheDocument();
    expect(screen.getByTestId("header-streak").compareDocumentPosition(screen.getByTestId("header-palms"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    // The compact visual treatment is icon + number only; the parent keeps
    // the full accessible announcement for screen readers.
    expect(screen.getByTestId("header-streak")).not.toHaveTextContent(/days/i);
    expect(screen.getByTestId("header-palms")).not.toHaveTextContent(/palms/i);

    // "Total Azkar" counts recorded main-routine completions for all time. It
    // was `lifetimePalms * 3 + today's leaves`, which both used the pre-DEC-042
    // three-routine multiplier and showed zero to anyone who never completed a
    // full day. The fixture below has palms but no complete day.
    expect(screen.getByText("collections completed")).toBeInTheDocument();

    // The streak/palms cluster must be reachable by role. Before it carried
    // role="img" its aria-label sat on a roleless div, so assistive technology
    // announced the two chips as bare unlabelled numerals.
    expect(screen.getByRole("img", { name: /Daily streak/i })).toBeInTheDocument();

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
    expect(screen.getByTestId("next-prayer")).toHaveTextContent("Next prayer");
    expect(screen.getByTestId("next-prayer")).toHaveAttribute("data-prayer-state", "next");
    expect(screen.getByTestId("next-prayer-time")).toBeInTheDocument();
    expect(screen.getByTestId("after-prayer-trackers").querySelectorAll("button[data-prayer-state]")).toHaveLength(5);
    expect(screen.getByTestId("after-prayer-trackers").querySelectorAll("button[data-prayer-state] svg")).toHaveLength(
      7,
    );
    expect(screen.getByTestId("after-prayer-carousel")).toHaveClass("overflow-x-auto", "snap-mandatory", "sm:grid");
    expect(screen.getByTestId("after-prayer-carousel").querySelector("button[data-prayer-state]")).toHaveClass(
      "min-w-[84%]",
      "sm:min-w-0",
    );
    expect(
      screen.getByTestId("after-prayer-trackers").compareDocumentPosition(screen.getByTestId("home-masbaha-entry")),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText("After Prayer Azkar")).toBeInTheDocument();
    expect(screen.getByText("After Asr")).toBeInTheDocument();
    expect(screen.getByText("After Fajr")).toBeInTheDocument();
    expect(screen.getByText(/today'?s wird/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^After Fajr/ }));
    expect(onPrayerResume).toHaveBeenCalledWith("fajr");
    fireEvent.click(screen.getByRole("button", { name: "Tasbeeh Counter" }));
    expect(onOpenCustomCounter).toHaveBeenCalledOnce();
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
    expect(screen.getByTestId("next-prayer-time")).toBeInTheDocument();
    expect(screen.queryByTestId("home-primary-cta")).not.toBeInTheDocument();
  });
});
