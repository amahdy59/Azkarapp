import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_AZKAR } from "../content/azkar";
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
        onRepeat={() => undefined}
        routineModes={routineModes}
        savedZikrIds={new Set([saved.id])}
        onOpenSavedZikr={onOpenSavedZikr}
        onOpenSavedLibrary={() => undefined}
        onOpenBenefits={onOpenBenefits}
      />,
    );

    expect(screen.getByTestId("home-utility-header")).toHaveClass("grid-rows-2");
    expect(screen.getByTestId("current-time")).toHaveTextContent(/9:05/);
    expect(screen.getByTestId("header-streak").compareDocumentPosition(screen.getByTestId("header-palms"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    fireEvent.click(screen.getByTestId("home-saved-section").getElementsByTagName("button")[0]!);
    expect(onOpenSavedZikr).toHaveBeenCalledWith(saved.category, expect.any(Number));

    fireEvent.click(screen.getByTestId("home-benefits-card"));
    expect(onOpenBenefits).toHaveBeenCalledOnce();
  });
});
