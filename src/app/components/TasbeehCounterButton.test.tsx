import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TasbeehCounterButton } from "./TasbeehCounterButton";

describe("TasbeehCounterButton", () => {
  it("renders correctly in English (LTR)", () => {
    const handleClick = vi.fn();
    render(<TasbeehCounterButton onClick={handleClick} language="en" direction="ltr" />);

    // EN label is now "Masbaha" (counter.tasbeehTitle)
    const button = screen.getByRole("button", { name: "Masbaha" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("w-full", "min-h-16", "sm:min-h-[4.5rem]", "max-w-[80rem]", "mx-auto");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders correctly in Arabic (RTL)", () => {
    const handleClick = vi.fn();
    render(<TasbeehCounterButton onClick={handleClick} language="ar" direction="rtl" />);

    // AR label is now "المسبحة" (counter.tasbeehTitle in ar.ts)
    const button = screen.getByRole("button", { name: "المسبحة" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("dir", "rtl");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
