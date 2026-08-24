import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TranquilityCompletionCard } from "./TranquilityCompletionCard";

describe("TranquilityCompletionCard", () => {
  it("renders a centered, button-free completion message", () => {
    render(<TranquilityCompletionCard categoryId="morning" language="ar" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("stages its exit and collapses its layout row", () => {
    const { rerender } = render(<TranquilityCompletionCard categoryId="morning" language="en" />);
    rerender(<TranquilityCompletionCard categoryId="morning" language="en" isExiting />);

    const card = screen.getByRole("status");
    expect(card).toHaveClass("tranquility-completion", "is-exiting");
    expect(card.querySelector(".tranquility-completion-icon")).toBeInTheDocument();
    expect(card.querySelector(".tranquility-completion-title")).toBeInTheDocument();
    expect(card.querySelector(".tranquility-completion-subtitle")).toBeInTheDocument();
  });
});
