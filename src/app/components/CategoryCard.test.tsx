import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryCard } from "./CategoryCard";

describe("CategoryCard", () => {
  it("renders not-started state without a progress bar", () => {
    const onClick = vi.fn();
    render(
      <CategoryCard
        id="morning"
        title="Morning Azkar"
        icon="sun"
        direction="ltr"
        totalCount={10}
        completedCount={0}
        progressText="0 of 10"
        ariaLabel="Morning Azkar, 0 of 10"
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: "Morning Azkar, 0 of 10" });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders in-progress state with a progress bar and numeric value", () => {
    render(
      <CategoryCard
        id="evening"
        title="Evening Azkar"
        icon="moon"
        direction="ltr"
        totalCount={10}
        completedCount={4}
        progressText="4 of 10"
        ariaLabel="Evening Azkar, 4 of 10"
        onClick={vi.fn()}
      />,
    );

    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuenow", "4");
    expect(progress).toHaveAttribute("aria-valuemax", "10");
    expect(screen.getByText("4 of 10")).toBeInTheDocument();
  });

  it("renders complete state without a progress bar", () => {
    render(
      <CategoryCard
        id="sleep"
        title="Before Sleep"
        icon="star"
        direction="ltr"
        totalCount={5}
        completedCount={5}
        progressText="5 of 5"
        ariaLabel="Before Sleep, complete"
        onClick={vi.fn()}
      />,
    );

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText("5 of 5")).toBeInTheDocument();
  });

  it("marks a complete collection with a shape, not colour alone", () => {
    function renderCard(completedCount: number) {
      const { container, unmount } = render(
        <CategoryCard
          id="sleep"
          title="Before Sleep"
          icon="star"
          direction="ltr"
          totalCount={5}
          completedCount={completedCount}
          progressText={`${completedCount} of 5`}
          ariaLabel="Before Sleep"
          onClick={vi.fn()}
        />,
      );
      const icons = container.querySelectorAll("[data-slot='category-copy'] svg").length;
      unmount();
      return icons;
    }

    // The completed card previously differed from an in-progress one only by
    // the chevron's hue, which fails "use of colour" on its own.
    expect(renderCard(5)).toBeGreaterThan(renderCard(2));
  });

  it("renders occasional collections with a subtitle instead of progress", () => {
    render(
      <CategoryCard
        id="friday"
        title="Friday"
        icon="star"
        direction="ltr"
        isOccasional
        totalCount={0}
        occasionalSubtitle="Weekly collection"
        ariaLabel="Friday, weekly collection"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText("Weekly collection")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("applies RTL direction to the button", () => {
    render(
      <CategoryCard
        id="morning"
        title="أذكار الصباح"
        icon="sun"
        direction="rtl"
        totalCount={10}
        completedCount={0}
        progressText="0 من 10"
        ariaLabel="أذكار الصباح"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("dir", "rtl");
  });
});
