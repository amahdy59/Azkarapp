import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FridayHomeCard, PrayerRoutineCard, SavedZikrCard, type HomeSavedCardItem } from "./HomeCards";

const savedItem: HomeSavedCardItem = {
  id: "saved-1",
  categoryLabel: "Morning Azkar",
  displayText: "A saved remembrance",
  source: "main",
};

describe("HomeCards", () => {
  it("presents the scheduled prayer and mode explanation without a device clock", () => {
    render(
      <PrayerRoutineCard
        language="en"
        direction="ltr"
        nextPrayerName="Dhuhr"
        nextPrayerTime24="12:03"
        nextPrayerTimeLabel="12:03 PM"
        nextPrayerCountdown="01:10 left"
        categoryName="Morning Azkar"
        description="Read after Fajr."
        mode="core"
        onModeChange={() => undefined}
        completedCount={2}
        totalCount={5}
        estimatedMinutes={3}
        ctaLabel="Continue Morning Azkar · 3 remaining"
        onOpen={() => undefined}
      />,
    );

    expect(screen.getByTestId("next-prayer")).toHaveTextContent("Next prayer");
    expect(screen.getByTestId("next-prayer")).toHaveTextContent("Dhuhr");
    expect(screen.getByTestId("next-prayer")).toHaveTextContent("12:03 PM");
    expect(screen.getByTestId("next-prayer")).toHaveTextContent("01:10 left");
    expect(screen.getByTestId("next-prayer-time")).toHaveAttribute("datetime", "12:03");
    expect(screen.getByText("A shorter selection for limited time.")).toBeInTheDocument();
    expect(screen.queryByTestId("current-time")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3 remaining/i })).toHaveAttribute(
      "aria-describedby",
      "home-routine-progress",
    );
  });

  it("gives Saved items explicit source names and announces loading and errors", () => {
    const onOpenItem = vi.fn();
    const { rerender } = render(
      <SavedZikrCard
        language="en"
        direction="ltr"
        count={1}
        items={[savedItem]}
        loadingId="saved-1"
        errorId={null}
        onOpenItem={onOpenItem}
      />,
    );

    expect(screen.getByLabelText("1 saved zikr")).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: /Open Collection: Morning Azkar/i })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Opening saved zikr");

    rerender(
      <SavedZikrCard
        language="en"
        direction="ltr"
        count={1}
        items={[savedItem]}
        loadingId={null}
        errorId="saved-1"
        onOpenItem={onOpenItem}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("could not be opened");
    fireEvent.click(screen.getByRole("button", { name: /Open Collection: Morning Azkar/i }));
    expect(onOpenItem).toHaveBeenCalledWith("saved-1");
  });

  it("offers one useful route from the empty Saved state", () => {
    const onOpenLibrary = vi.fn();
    render(
      <SavedZikrCard
        language="en"
        direction="ltr"
        count={0}
        items={[]}
        loadingId={null}
        errorId={null}
        onOpenItem={() => undefined}
        onOpenLibrary={onOpenLibrary}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Browse azkar" }));
    expect(onOpenLibrary).toHaveBeenCalledOnce();
  });

  it("keeps Friday compact by default and exposes virtues only in the expanded variant", () => {
    const { rerender } = render(
      <FridayHomeCard
        language="en"
        direction="ltr"
        expanded={false}
        status="start"
        onOpen={() => undefined}
        canPreview={false}
        onTogglePreview={() => undefined}
      />,
    );

    expect(screen.getByText(/Thursday Maghrib until Friday Maghrib/i)).toBeInTheDocument();
    expect(screen.queryByText("More Friday virtues and reading source")).not.toBeInTheDocument();

    rerender(
      <FridayHomeCard
        language="en"
        direction="ltr"
        expanded
        status="continue"
        onOpen={() => undefined}
        canPreview={false}
        onTogglePreview={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "Continue Friday companion" })).toBeInTheDocument();
    expect(screen.getByText("More Friday virtues and reading source")).toBeInTheDocument();
  });
});
