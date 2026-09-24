import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header, BottomNav } from "./LayoutShells";

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

describe("BottomNav", () => {
  it("renders all 5 primary devotional tabs", () => {
    const handleChange = vi.fn();
    render(<BottomNav active="home" onChange={handleChange} isArabic={true} />);

    expect(screen.getByTestId("nav-home")).toBeInTheDocument();
    expect(screen.getByTestId("nav-quran")).toBeInTheDocument();
    expect(screen.getByTestId("nav-azkar")).toBeInTheDocument();
    expect(screen.getByTestId("nav-progress")).toBeInTheDocument();
    expect(screen.getByTestId("nav-settings")).toBeInTheDocument();

    expect(screen.getByTestId("nav-home")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("nav-settings")).toHaveAttribute("href", "#/settings");
    expect(screen.getByTestId("nav-quran")).not.toHaveAttribute("aria-current");

    fireEvent.click(screen.getByTestId("nav-settings"));
    expect(handleChange).toHaveBeenCalledWith("settings");

    fireEvent.click(screen.getByTestId("nav-progress"), { ctrlKey: true });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
