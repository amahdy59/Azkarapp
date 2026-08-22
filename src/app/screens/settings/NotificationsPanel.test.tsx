import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { NotificationsPanel } from "./NotificationsPanel";

describe("NotificationsPanel", () => {
  const originalNotification = window.Notification;

  afterEach(() => {
    if (originalNotification) {
      Object.defineProperty(window, "Notification", { configurable: true, value: originalNotification });
    } else {
      Reflect.deleteProperty(window, "Notification");
    }
  });

  it("explains why a denied permission prevents enabling a reminder", () => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "denied", requestPermission: vi.fn() },
    });
    const onRemindersChange = vi.fn();
    render(
      <NotificationsPanel
        language="en"
        reminders={DEFAULT_APP_STATE.settings.reminders}
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onRemindersChange={onRemindersChange}
        onLocationChange={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText(/Open this site’s settings/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Morning reminder" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Notifications remain off");
    expect(onRemindersChange).not.toHaveBeenCalled();
  });

  it("selects and saves a built-in city without requesting GPS", () => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "default", requestPermission: vi.fn() },
    });
    const onLocationChange = vi.fn();
    render(
      <NotificationsPanel
        language="en"
        reminders={DEFAULT_APP_STATE.settings.reminders}
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onRemindersChange={vi.fn()}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search cities and countries" }), {
      target: { value: "London" },
    });
    fireEvent.click(screen.getByRole("button", { name: /London.*United Kingdom/i }));

    expect(onLocationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        cityName: "London",
        latitude: 51.5074,
        longitude: -0.1278,
        timeZone: "Europe/London",
        autoDetect: false,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("London selected and saved.");
    expect(screen.getByLabelText("IANA time zone")).toHaveValue("Europe/London");
  });

  it("keeps the persisted city label stable when selecting from Arabic UI", () => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "default", requestPermission: vi.fn() },
    });
    const onLocationChange = vi.fn();
    render(
      <NotificationsPanel
        language="ar"
        reminders={DEFAULT_APP_STATE.settings.reminders}
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onRemindersChange={vi.fn()}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "البحث في المدن والدول" }), {
      target: { value: "لندن" },
    });
    fireEvent.click(screen.getByRole("button", { name: /لندن.*المملكة المتحدة/ }));

    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ cityName: "London" }));
    expect(screen.getByRole("status")).toHaveTextContent("تم اختيار لندن وحفظها.");
  });
});
