import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsRootPanel } from "./SettingsRootPanel";

describe("SettingsRootPanel", () => {
  it("separates audio and downloads as primary destinations and preserves download search", () => {
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
        locationSettings={{
          latitude: 30.55,
          longitude: 31.06,
          cityName: "30.55°, 31.06°",
          autoDetect: true,
          calculationMethod: 5,
          timeZone: "Africa/Cairo",
        }}
        onNav={onNav}
      />,
    );
    const ids = ["appearance", "reading", "prayer", "audio", "downloads", "progress", "accessibility", "account-data"];
    for (const id of ids) expect(screen.getByTestId("settings-sub-" + id)).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByTestId("settings-sub-prayer")).toHaveTextContent("Near Cairo, Egypt");
    expect(screen.getByTestId("settings-sub-audio")).toHaveTextContent("Audio & recitations");
    fireEvent.click(screen.getByTestId("settings-sub-downloads"));
    expect(onNav).toHaveBeenCalledWith("downloads");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "download" } });
    fireEvent.click(screen.getByTestId("settings-sub-downloads"));
    expect(onNav).toHaveBeenCalledWith("downloads");
    expect(screen.queryByTestId("settings-sub-audio")).not.toBeInTheDocument();
  });
  it("shows the weekly goal instead of a Garden-only status", () => {
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
        summaries={{
          audio: "عبد الله محمد · ١×",
          downloads: "افتح للتحقق من التنزيلات",
          reminders: "التذكيرات متوقفة",
          progress: "الهدف الأسبوعي: ٤ أيام",
        }}
      />,
    );

    expect(screen.getByTestId("settings-sub-progress")).toHaveTextContent("الهدف الأسبوعي: ٤ أيام");
    expect(screen.queryByText("الحديقة مخفية")).not.toBeInTheDocument();
  });

  it("keeps local progress visible when Garden is hidden", () => {
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

    expect(screen.getByText("التقدم محفوظ على هذا الجهاز")).toBeInTheDocument();
    expect(screen.queryByText("الحديقة نشطة")).not.toBeInTheDocument();
  });

  it("renders all four summaries as passive row descriptions", () => {
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
        summaries={{
          audio: "Abdullah Muhammad · 1.25×",
          downloads: "Last check: 2/3 groups ready",
          reminders: "Reminders selected",
          progress: "Weekly goal: 7 days",
        }}
      />,
    );

    expect(screen.getByTestId("settings-sub-audio")).toHaveTextContent("Abdullah Muhammad · 1.25×");
    expect(screen.getByTestId("settings-sub-downloads")).toHaveTextContent("Last check: 2/3 groups ready");
    expect(screen.getByTestId("settings-sub-prayer")).toHaveTextContent("Reminders selected");
    expect(screen.getByTestId("settings-sub-progress")).toHaveTextContent("Weekly goal: 7 days");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
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
