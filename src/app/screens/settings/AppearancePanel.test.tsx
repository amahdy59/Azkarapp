import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppearancePanel } from "./AppearancePanel";

function renderPanel() {
  const props = {
    language: "ar" as const,
    direction: "rtl" as const,
    themeMode: "midnight" as const,
    highContrast: true,
    onThemeModeChange: vi.fn(),
    onDisableHighContrast: vi.fn(),
    onLanguageChange: vi.fn(),
    calendarType: "hijri" as const,
    onCalendarTypeChange: vi.fn(),
    hijriDateOffset: 0,
    onHijriDateOffsetChange: vi.fn(),
    onBack: vi.fn(),
  };
  render(<AppearancePanel {...props} />);
  return props;
}

describe("AppearancePanel", () => {
  it("keeps images and transparency as independent appearance choices", () => {
    const onImages = vi.fn();
    const onTransparency = vi.fn();
    render(
      <AppearancePanel
        language="en"
        direction="ltr"
        themeMode="midnight"
        highContrast={false}
        onThemeModeChange={vi.fn()}
        onDisableHighContrast={vi.fn()}
        onLanguageChange={vi.fn()}
        onBack={vi.fn()}
        homeWirdImages={false}
        onHomeWirdImagesChange={onImages}
        reduceTransparency={true}
        onReduceTransparencyChange={onTransparency}
      />,
    );
    fireEvent.click(screen.getByRole("switch", { name: /Daily-wird card images/ }));
    expect(onImages).toHaveBeenCalledWith(true);
    expect(onTransparency).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("switch", { name: /^Transparency/ }));
    expect(onTransparency).toHaveBeenCalledWith(false);
  });
  it("keeps theme, language, calendar and regional correction available in their own section", () => {
    const props = renderPanel();
    fireEvent.click(screen.getByTestId("theme-option-light"));
    fireEvent.click(screen.getByTestId("settings-language-en"));
    fireEvent.click(screen.getByTestId("calendar-gregorian"));
    fireEvent.click(screen.getByTestId("offset-plus-1"));
    expect(props.onThemeModeChange).toHaveBeenCalledWith("light");
    expect(props.onLanguageChange).toHaveBeenCalledWith("en");
    expect(props.onCalendarTypeChange).toHaveBeenCalledWith("gregorian");
    expect(props.onHijriDateOffsetChange).toHaveBeenCalledWith(1);
    expect(screen.getAllByRole("radiogroup").every((group) => group.getAttribute("dir") === "rtl")).toBe(true);
  });

  it("retains actionable high contrast feedback", () => {
    const props = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "إيقاف التباين العالي" }));
    expect(props.onDisableHighContrast).toHaveBeenCalledOnce();
  });
});
