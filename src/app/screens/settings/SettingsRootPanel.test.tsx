import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsRootPanel } from "./SettingsRootPanel";

describe("SettingsRootPanel", () => {
  it("displays gardenActive when quietProgressEnabled is true", () => {
    render(
      <SettingsRootPanel
        onNav={vi.fn()}
        language="ar"
        direction="rtl"
        themeMode="system"
        highContrast={false}
        onThemeModeChange={vi.fn()}
        onDisableHighContrast={vi.fn()}
        onLanguageChange={vi.fn()}
        isGuest={true}
        isSyncing={false}
        syncError=""
        quietProgressEnabled={true}
      />,
    );

    expect(screen.getByText("الحديقة نشطة")).toBeInTheDocument();
    expect(screen.queryByText("الحديقة مخفية")).not.toBeInTheDocument();
  });

  it("displays gardenHidden when quietProgressEnabled is false", () => {
    render(
      <SettingsRootPanel
        onNav={vi.fn()}
        language="ar"
        direction="rtl"
        themeMode="system"
        highContrast={false}
        onThemeModeChange={vi.fn()}
        onDisableHighContrast={vi.fn()}
        onLanguageChange={vi.fn()}
        isGuest={true}
        isSyncing={false}
        syncError=""
        quietProgressEnabled={false}
      />,
    );

    expect(screen.getByText("الحديقة مخفية")).toBeInTheDocument();
    expect(screen.queryByText("الحديقة نشطة")).not.toBeInTheDocument();
  });

  it("displays English garden status accurately", () => {
    render(
      <SettingsRootPanel
        onNav={vi.fn()}
        language="en"
        direction="ltr"
        themeMode="system"
        highContrast={false}
        onThemeModeChange={vi.fn()}
        onDisableHighContrast={vi.fn()}
        onLanguageChange={vi.fn()}
        isGuest={true}
        isSyncing={false}
        syncError=""
        quietProgressEnabled={true}
      />,
    );

    expect(screen.getByText("Garden active")).toBeInTheDocument();
    expect(screen.queryByText("Garden hidden")).not.toBeInTheDocument();
  });
});
