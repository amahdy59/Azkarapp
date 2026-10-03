import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header, BottomNav } from "./LayoutShells";

describe("Header", () => {
  it("keeps an opaque surface and adds a divider after nested content scrolls", () => {
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
    expect(header).toHaveClass("bg-background");

    fireEvent.scroll(region, { target: { scrollTop: 12 } });
    expect(header).toHaveAttribute("data-scrolled", "true");
    expect(header).toHaveClass("bg-background", "border-border", "shadow-sm");

    fireEvent.scroll(region, { target: { scrollTop: 0 } });
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).toHaveClass("bg-background");
  });

  it("does not elevate or add a divider on scroll when elevateOnScroll is false", () => {
    render(
      <div className="app-screen-surface">
        <Header title="Reader" elevateOnScroll={false} />
        <div data-testid="scroll-region">
          <div>Content</div>
        </div>
      </div>,
    );

    const header = screen.getByTestId("shared-screen-header");
    const region = screen.getByTestId("scroll-region");
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).toHaveClass("border-transparent");

    fireEvent.scroll(region, { target: { scrollTop: 20 } });
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).toHaveClass("border-transparent");
    expect(header).not.toHaveClass("border-border");
  });

  it("ignores scroll events from reader-text-scroll elements", () => {
    render(
      <div className="app-screen-surface">
        <Header title="Reader" />
        <div className="reader-text-scroll" data-testid="reader-scroll-region">
          <div>Devotional reading text</div>
        </div>
      </div>,
    );

    const header = screen.getByTestId("shared-screen-header");
    const readerRegion = screen.getByTestId("reader-scroll-region");
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).toHaveClass("border-transparent");

    fireEvent.scroll(readerRegion, { target: { scrollTop: 50 } });
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).toHaveClass("border-transparent");
    expect(header).not.toHaveClass("border-border");
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
