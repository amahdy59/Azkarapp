import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompactActionCard, StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders title, value and subtitle", () => {
    render(<StatCard title="Streak" icon={<span aria-hidden="true">*</span>} value="7" subtitle="days in a row" />);

    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("days in a row")).toBeInTheDocument();
  });
});

describe("CompactActionCard", () => {
  it("renders content and fires the action on click", () => {
    const onAction = vi.fn();
    render(
      <CompactActionCard
        title="Reminder"
        icon={<span aria-hidden="true">*</span>}
        contentTitle="Morning Azkar"
        contentSubtitle="3 of 10 done"
        actionLabel="Resume"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Morning Azkar")).toBeInTheDocument();
    expect(screen.getByText("3 of 10 done")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Resume" });
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
