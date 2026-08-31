import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MushafSettingsSheet } from "./MushafSettingsSheet";

describe("MushafSettingsSheet", () => {
  it("renders theme options, layout options and bookmark toggle", () => {
    const onSelectTheme = vi.fn();
    const onSelectLayout = vi.fn();
    const onToggleBookmark = vi.fn();
    const onClose = vi.fn();

    render(
      <MushafSettingsSheet
        open={true}
        onClose={onClose}
        language="ar"
        direction="rtl"
        theme="midnight"
        onSelectTheme={onSelectTheme}
        textScale="medium"
        toolbarSide="right"
        mushafLayout="auto"
        onSelectLayout={onSelectLayout}
        autoSpreadRoom={true}
        isBookmarked={false}
        onToggleBookmark={onToggleBookmark}
        pageNumber={42}
        surahName="سورة البقرة"
      />,
    );

    // Sheet title and page label
    expect(screen.getByRole("heading", { name: "إعدادات القراءة" })).toBeInTheDocument();
    expect(screen.getByText(/سورة البقرة/)).toBeInTheDocument();

    // Theme options
    expect(screen.getByTestId("mushaf-theme-option-midnight")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("mushaf-theme-option-dark")).toHaveAttribute("aria-checked", "false");

    // Click theme option
    fireEvent.click(screen.getByTestId("mushaf-theme-option-light"));
    expect(onSelectTheme).toHaveBeenCalledWith("light");

    // Layout options (visible when autoSpreadRoom is true)
    expect(screen.getByTestId("mushaf-layout-option-auto")).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByTestId("mushaf-layout-option-spread"));
    expect(onSelectLayout).toHaveBeenCalledWith("spread");

    // Bookmark toggle
    const bookmarkSwitch = screen.getByTestId("mushaf-bookmark-toggle");
    expect(bookmarkSwitch).toHaveAttribute("aria-checked", "false");
    fireEvent.click(bookmarkSwitch);
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);

    // Close button
    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders in English with LTR direction", () => {
    const onSelectTheme = vi.fn();
    const onClose = vi.fn();

    render(
      <MushafSettingsSheet
        open={true}
        onClose={onClose}
        language="en"
        direction="ltr"
        theme="oled"
        onSelectTheme={onSelectTheme}
        textScale="medium"
        toolbarSide="right"
        mushafLayout="single"
        autoSpreadRoom={false}
        isBookmarked={true}
        onToggleBookmark={vi.fn()}
        pageNumber={1}
        surahName="Al-Fatihah"
      />,
    );

    expect(screen.getByRole("heading", { name: "Reading Settings" })).toBeInTheDocument();
    expect(screen.getByTestId("mushaf-theme-option-oled")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("mushaf-bookmark-toggle")).toHaveAttribute("aria-checked", "true");
  });
});

describe("MushafSettingsSheet reading choices", () => {
  function renderSheet(overrides: Partial<Parameters<typeof MushafSettingsSheet>[0]> = {}) {
    const props = {
      open: true,
      onClose: vi.fn(),
      language: "ar" as const,
      direction: "rtl" as const,
      theme: "midnight" as const,
      onSelectTheme: vi.fn(),
      mushafLayout: "auto" as const,
      textScale: "medium" as const,
      toolbarSide: "right" as const,
      isBookmarked: false,
      onToggleBookmark: vi.fn(),
      pageNumber: 42,
      surahName: "سورة البقرة",
      ...overrides,
    };
    render(<MushafSettingsSheet {...props} />);
    return props;
  }

  it("offers a reading type size and says what it does not change", () => {
    const onSelectTextScale = vi.fn();
    renderSheet({ onSelectTextScale });

    expect(screen.getByTestId("mushaf-text-size-option-medium")).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByTestId("mushaf-text-size-option-large"));
    expect(onSelectTextScale).toHaveBeenCalledWith("large");
    expect(screen.getByText(/الخمسة عشر/)).toBeInTheDocument();
  });

  it("offers the toolbar edge only where a rail is actually shown", () => {
    renderSheet({ onSelectToolbarSide: vi.fn(), showToolbarSide: false });
    expect(screen.queryByTestId("mushaf-toolbar-side-option-left")).not.toBeInTheDocument();
  });

  it("stores the chosen toolbar edge", () => {
    const onSelectToolbarSide = vi.fn();
    renderSheet({ onSelectToolbarSide, showToolbarSide: true });

    expect(screen.getByTestId("mushaf-toolbar-side-option-right")).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByTestId("mushaf-toolbar-side-option-left"));
    expect(onSelectToolbarSide).toHaveBeenCalledWith("left");
  });

  it("offers focus mode as an action, not a stored preference", () => {
    const onEnterFocusMode = vi.fn();
    renderSheet({ onEnterFocusMode });
    fireEvent.click(screen.getByTestId("mushaf-focus-mode-action"));
    expect(onEnterFocusMode).toHaveBeenCalledTimes(1);
  });
});
