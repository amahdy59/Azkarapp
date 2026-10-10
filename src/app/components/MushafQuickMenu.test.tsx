import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MushafQuickMenu } from "./MushafQuickMenu";

describe("MushafQuickMenu", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    language: "en" as const,
    direction: "ltr" as const,
    surahName: "Al-Baqarah",
    juzNumber: 1,
    pageNumber: 2,
    showWordMeanings: false,
    isLoadingWordMeanings: false,
    isPageBookmarked: false,
    onOpenIndex: vi.fn(),
    onOpenBookmarks: vi.fn(),
    onToggleWordMeanings: vi.fn(),
    onTogglePageBookmark: vi.fn(),
    onOpenSettings: vi.fn(),
  };

  it("renders with the updated title 'Reading View & Options'", () => {
    render(<MushafQuickMenu {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "Reading View & Options" })).toBeInTheDocument();
  });

  it("allows switching between Mushaf Page mode and Verse by Verse mode", async () => {
    const user = userEvent.setup();
    const onSelectReadingMode = vi.fn();

    render(<MushafQuickMenu {...defaultProps} readingMode="mushaf" onSelectReadingMode={onSelectReadingMode} />);

    const bilingualBtn = screen.getByTestId("quick-mode-bilingual");
    await user.click(bilingualBtn);
    expect(onSelectReadingMode).toHaveBeenCalledWith("bilingual");
  });

  it("allows switching between 1 Page and 2 Pages layout on desktop", async () => {
    const user = userEvent.setup();
    const onSelectLayout = vi.fn();

    render(
      <MushafQuickMenu {...defaultProps} showLayoutOptions mushafLayout="single" onSelectLayout={onSelectLayout} />,
    );

    const spreadBtn = screen.getByTestId("quick-layout-spread");
    await user.click(spreadBtn);
    expect(onSelectLayout).toHaveBeenCalledWith("spread");
  });

  it("allows toggling page translation on desktop", async () => {
    const user = userEvent.setup();
    const onTogglePageTranslation = vi.fn();

    render(
      <MushafQuickMenu
        {...defaultProps}
        showPageTranslation={false}
        onTogglePageTranslation={onTogglePageTranslation}
      />,
    );

    const switchBtn = screen.getByTestId("quick-page-translation-switch");
    await user.click(switchBtn);
    expect(onTogglePageTranslation).toHaveBeenCalledOnce();
  });

  it("allows selecting quick themes", async () => {
    const user = userEvent.setup();
    const onSelectTheme = vi.fn();

    render(<MushafQuickMenu {...defaultProps} theme="midnight" onSelectTheme={onSelectTheme} />);

    const lightThemeBtn = screen.getByTestId("quick-theme-light");
    await user.click(lightThemeBtn);
    expect(onSelectTheme).toHaveBeenCalledWith("light");
  });
});
