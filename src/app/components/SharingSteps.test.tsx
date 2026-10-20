import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SharingStepNavigation } from "./SharingSteps";

it("omits unavailable Previous and retains named navigation on later steps", () => {
  const onChange = vi.fn();
  const props = {
    steps: ["content", "design", "share"] as const,
    language: "en" as const,
    onChange,
    onSkipDesign: vi.fn(),
  };
  const { rerender } = render(<SharingStepNavigation {...props} step="content" />);
  expect(screen.queryByRole("button", { name: "Previous step" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next step" }));
  expect(onChange).toHaveBeenCalledWith("design");
  rerender(<SharingStepNavigation {...props} step="design" />);
  fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
  expect(onChange).toHaveBeenLastCalledWith("content");
});
