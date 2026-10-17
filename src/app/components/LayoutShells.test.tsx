import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header, BottomNav, NavRail, NavSidebar } from "./LayoutShells";

describe("Header", () => {
  it("keeps artwork out of the compact title and action surface", () => {
    render(<Header title="Reader" decoration={<div data-testid="header-art">Scene</div>} />);
    expect(screen.queryByTestId("header-art")).not.toBeInTheDocument();
    expect(screen.getByTestId("shared-screen-header")).toHaveAttribute("data-header-contrast", "solid");
  });
  it("keeps a stable header surface without decorative dividers after nested content scrolls", () => {
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
    expect(header).toHaveClass("bg-background");
    expect(header).not.toHaveClass("border-b", "border-border", "shadow-sm");

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
    expect(header).not.toHaveClass("border-b", "shadow-sm");

    fireEvent.scroll(region, { target: { scrollTop: 20 } });
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).not.toHaveClass("border-b", "shadow-sm");
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
    expect(header).not.toHaveClass("border-b", "shadow-sm");

    fireEvent.scroll(readerRegion, { target: { scrollTop: 50 } });
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header).not.toHaveClass("border-b", "shadow-sm");
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

describe("Desktop Brand Navigation", () => {
  it("navigates to Home when clicking the rail brand mark", () => {
    const handleChange = vi.fn();
    render(<NavRail active="azkar" onChange={handleChange} isArabic={true} />);

    const brandLink = screen.getByTestId("desktop-rail-brand-home");
    expect(brandLink).toHaveAttribute("href", "#/home");
    expect(brandLink).toHaveAccessibleName("الرئيسية");

    fireEvent.click(brandLink);
    expect(handleChange).toHaveBeenCalledWith("home");
  });

  it("navigates to Home when clicking the sidebar brand mark", () => {
    const handleChange = vi.fn();
    render(<NavSidebar active="azkar" onChange={handleChange} isArabic={true} />);

    const brandLink = screen.getByTestId("desktop-brand-home");
    expect(brandLink).toHaveAttribute("href", "#/home");
    expect(brandLink).toHaveAccessibleName("الرئيسية");

    fireEvent.click(brandLink);
    expect(handleChange).toHaveBeenCalledWith("home");
  });
});
