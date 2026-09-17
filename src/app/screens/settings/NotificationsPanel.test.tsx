import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { NotificationsPanel } from "./NotificationsPanel";

describe("NotificationsPanel", () => {
  const originalNotification = window.Notification;

  afterEach(() => {
    Object.defineProperty(window, "Notification", { configurable: true, value: originalNotification });
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
});
