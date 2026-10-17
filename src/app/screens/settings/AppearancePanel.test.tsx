import { fireEvent, render, screen, within } from "@testing-library/react";
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
  it("exposes independent app and Home choices without resetting Home on app selection", () => {
    const app = vi.fn();
    const home = vi.fn();
    const props = {
      language: "en" as const,
      direction: "ltr" as const,
      themeMode: "midnight" as const,
      highContrast: false,
      onThemeModeChange: vi.fn(),
      onDisableHighContrast: vi.fn(),
      onLanguageChange: vi.fn(),
      onBack: vi.fn(),
      onAppMaterialChange: app,
      onHomeMaterialChange: home,
    };
    const { rerender } = render(<AppearancePanel {...props} appMaterial="solid" homeMaterial="inherit" />);
    const global = within(screen.getByRole("radiogroup", { name: "App appearance" }));
    expect(global.getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(global.getByRole("radio", { name: "Glass" }));
    expect(app).toHaveBeenCalledWith("glass");
    expect(home).not.toHaveBeenCalled();
    expect(screen.getByRole("radiogroup", { name: "Home appearance" })).toBeVisible();
    fireEvent.click(screen.getByRole("switch", { name: "Same as app" }));
    expect(home).toHaveBeenLastCalledWith("solid");
    rerender(<AppearancePanel {...props} appMaterial="solid" homeMaterial="glass" />);
    expect(within(screen.getByRole("radiogroup", { name: "Home appearance" })).getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(screen.getByRole("switch", { name: "Same as app" }));
    expect(home).toHaveBeenLastCalledWith("inherit");
  });
  it.each(["solid", "glass"] as const)(
    "preserves a %s Home override when changing or reselecting the app",
    (homeMaterial) => {
      const app = vi.fn();
      const home = vi.fn();
      const props = {
        language: "en" as const,
        direction: "ltr" as const,
        themeMode: "midnight" as const,
        highContrast: false,
        onThemeModeChange: vi.fn(),
        onDisableHighContrast: vi.fn(),
        onLanguageChange: vi.fn(),
        onBack: vi.fn(),
        onAppMaterialChange: app,
        onHomeMaterialChange: home,
        homeMaterial,
      };
      const view = render(<AppearancePanel {...props} appMaterial="solid" />);
      fireEvent.click(
        within(screen.getByRole("radiogroup", { name: "App appearance" })).getByRole("radio", { name: "Glass" }),
      );
      expect(app).toHaveBeenLastCalledWith("glass");
      expect(home).not.toHaveBeenCalled();
      view.rerender(<AppearancePanel {...props} appMaterial="glass" />);
      fireEvent.click(
        within(screen.getByRole("radiogroup", { name: "App appearance" })).getByRole("radio", { name: "Glass" }),
      );
      expect(app).toHaveBeenCalledTimes(2);
      expect(home).not.toHaveBeenCalled();
      fireEvent.click(
        within(screen.getByRole("radiogroup", { name: "Home appearance" })).getByRole("radio", { name: "Opaque" }),
      );
      expect(home).toHaveBeenLastCalledWith("solid");
      expect(app).toHaveBeenCalledTimes(2);
    },
  );
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
