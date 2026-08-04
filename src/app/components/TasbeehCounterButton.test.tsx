import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TasbeehCounterButton } from "./TasbeehCounterButton";

describe("TasbeehCounterButton", () => {
  it("renders correctly in English (LTR)", () => {
    const handleClick = vi.fn();
    render(<TasbeehCounterButton onClick={handleClick} language="en" direction="ltr" />);

    const button = screen.getByRole("button", { name: "Tasbeeh Counter" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders correctly in Arabic (RTL)", () => {
    const handleClick = vi.fn();
    render(<TasbeehCounterButton onClick={handleClick} language="ar" direction="rtl" />);

    const button = screen.getByRole("button", { name: "المسبحة الإلكترونية" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("dir", "rtl");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
