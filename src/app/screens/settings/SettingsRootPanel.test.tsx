import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsRootPanel } from "./SettingsRootPanel";

describe("SettingsRootPanel", () => {
  it("shows seven primary destinations without inline controls and preserves search for downloads", () => {
    const onNav = vi.fn();
    render(
      <SettingsRootPanel
        language="en"
        direction="ltr"
        themeMode="midnight"
        highContrast={false}
        onThemeModeChange={vi.fn()}
        onDisableHighContrast={vi.fn()}
        onLanguageChange={vi.fn()}
        isGuest
        isSyncing={false}
        syncError=""
        quietProgressEnabled={false}
        onNav={onNav}
      />,
    );
    const ids = ["appearance", "reading", "prayer", "audio", "progress", "accessibility", "account-data"];
    for (const id of ids) expect(screen.getByTestId("settings-sub-" + id)).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByTestId("settings-sub-downloads")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "download" } });
    fireEvent.click(screen.getByTestId("settings-sub-downloads"));
    expect(onNav).toHaveBeenCalledWith("downloads");
  });
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

  it("exposes notifications settings row and matches notification search terms", () => {
    const onNav = vi.fn();
    render(
      <SettingsRootPanel
        onNav={onNav}
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

    const notificationsRow = screen.getByTestId("settings-sub-prayer");
    expect(notificationsRow).toBeInTheDocument();
    expect(screen.getByText("الصلاة والتذكيرات")).toBeInTheDocument();

    fireEvent.click(notificationsRow);
    expect(onNav).toHaveBeenCalledWith("prayer");

    // Search for notifications in Arabic
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "إشعارات" } });
    expect(screen.getByText("الإشعارات والتذكيرات")).toBeInTheDocument();
  });
});
