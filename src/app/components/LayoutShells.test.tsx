import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "./LayoutShells";

describe("Header", () => {
  it("adds the glass surface only after its screen content scrolls", () => {
    render(
      <div className="app-screen-surface">
        <Header title="Progress" />
        <div data-testid="scroll-region">
          <div>Content</div>
        </div>
      </div>,
    );

    const header = screen.getByTestId("shared-screen-header");
    const region = screen.getByTestId("scroll-region");
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).toHaveClass("bg-transparent");

    fireEvent.scroll(region, { target: { scrollTop: 12 } });
    expect(header).toHaveAttribute("data-scrolled", "true");
    expect(header).toHaveClass("scroll-glass-header", "backdrop-blur-md");

    fireEvent.scroll(region, { target: { scrollTop: 0 } });
    expect(header).not.toHaveAttribute("data-scrolled");
  });
});
