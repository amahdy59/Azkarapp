import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders as a div by default with raised elevation", () => {
    render(<Card>Content</Card>);
    const el = screen.getByText("Content");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("shadow-raised");
    expect(el).toHaveClass("bg-card");
  });

  it("renders overlay elevation", () => {
    render(<Card elevation="overlay">Sheet</Card>);
    expect(screen.getByText("Sheet")).toHaveClass("shadow-overlay");
  });

  it("renders flat elevation with no shadow class", () => {
    render(<Card elevation="flat">Flat</Card>);
    const el = screen.getByText("Flat");
    expect(el).not.toHaveClass("shadow-raised");
    expect(el).not.toHaveClass("shadow-overlay");
  });

  it("renders as a different element via the as prop", () => {
    render(<Card as="section">Section content</Card>);
    expect(screen.getByText("Section content").tagName).toBe("SECTION");
  });

  it("merges caller-provided className", () => {
    render(<Card className="mt-4">Merged</Card>);
    expect(screen.getByText("Merged")).toHaveClass("mt-4", "rounded-3xl");
  });

  it("applies no padding class when padding is none", () => {
    render(<Card padding="none">No padding</Card>);
    const el = screen.getByText("No padding");
    expect(el).not.toHaveClass("p-3", "p-4.5", "p-6");
  });
});
