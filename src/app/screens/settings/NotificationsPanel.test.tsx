import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { NotificationsPanel } from "./NotificationsPanel";

describe("NotificationsPanel", () => {
  const originalNotification = window.Notification;

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

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
        onRemindersChange={onRemindersChange}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText(/Open this site’s settings/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Morning reminder" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Notifications remain off");
    expect(onRemindersChange).not.toHaveBeenCalled();
  });

  for (const name of ["Morning reminder", "Prayer-time reminders"]) {
    it(`enables ${name} immediately after a newly granted permission`, async () => {
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: { permission: "default", requestPermission: vi.fn().mockResolvedValue("granted") },
      });
      const onRemindersChange = vi.fn();
      render(
        <NotificationsPanel
          language="en"
          reminders={DEFAULT_APP_STATE.settings.reminders}
          onRemindersChange={onRemindersChange}
          onBack={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("switch", { name }));
      await vi.waitFor(() => expect(onRemindersChange).toHaveBeenCalledOnce());
      expect(onRemindersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          [name === "Morning reminder" ? "morning" : "prayer"]: expect.objectContaining({ enabled: true }),
        }),
      );
    });
  }

  it("enables prayer reminders only with permission and saves the selected lead time", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "granted", requestPermission: vi.fn() },
    });
    const onRemindersChange = vi.fn();
    const { rerender } = render(
      <NotificationsPanel
        language="en"
        reminders={DEFAULT_APP_STATE.settings.reminders}
        onRemindersChange={onRemindersChange}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Reminder time" })).toBeDisabled();
    fireEvent.click(screen.getByRole("switch", { name: "Prayer-time reminders" }));
    expect(onRemindersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ prayer: expect.objectContaining({ enabled: true, leadMinutes: 15 }) }),
    );

    const enabled = {
      ...DEFAULT_APP_STATE.settings.reminders,
      prayer: { enabled: true, leadMinutes: 15 as const, prayers: ["fajr", "dhuhr", "asr", "maghrib", "isha"] },
    };
    rerender(
      <NotificationsPanel language="en" reminders={enabled} onRemindersChange={onRemindersChange} onBack={vi.fn()} />,
    );
    await user.click(screen.getByRole("combobox", { name: "Reminder time" }));
    await user.click(screen.getByRole("option", { name: "10 minutes before prayer" }));
    expect(onRemindersChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ prayer: expect.objectContaining({ enabled: true, leadMinutes: 10 }) }),
    );
  });
});
