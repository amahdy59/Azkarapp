import { fireEvent, render, screen } from "@testing-library/react";
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

  it("filters settings rows based on search query and allows clearing", () => {
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
      />,
    );

    const searchInput = screen.getByRole("searchbox");
    expect(searchInput).toBeInTheDocument();

    // Search for a specific setting
    fireEvent.change(searchInput, { target: { value: "الخط" } });
    expect(screen.getByText("القراءة والخطوط")).toBeInTheDocument();
    expect(screen.queryAllByText("إمكانية الوصول")).toHaveLength(0);

    // Clear search
    const clearBtn = screen.getByRole("button", { name: "مسح البحث" });
    fireEvent.click(clearBtn);
    expect(screen.getAllByText("إمكانية الوصول").length).toBeGreaterThan(0);
  });

  it("allows selecting regional Hijri date offset", () => {
    const onOffsetChange = vi.fn();
    render(
      <SettingsRootPanel
        onNav={vi.fn()}
        language="ar"
        direction="rtl"
        calendarType="hijri"
        onCalendarTypeChange={vi.fn()}
        themeMode="system"
        highContrast={false}
        onThemeModeChange={vi.fn()}
        onDisableHighContrast={vi.fn()}
        onLanguageChange={vi.fn()}
        isGuest={true}
        isSyncing={false}
        syncError=""
        hijriDateOffset={0}
        onHijriDateOffsetChange={onOffsetChange}
      />,
    );

    const plusOneBtn = screen.getByTestId("offset-plus-1");
    fireEvent.click(plusOneBtn);
    expect(onOffsetChange).toHaveBeenCalledWith(1);
  });
});
