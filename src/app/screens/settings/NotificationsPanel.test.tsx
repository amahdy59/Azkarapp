import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { NotificationsPanel } from "./NotificationsPanel";

describe("NotificationsPanel", () => {
  const originalNotification = window.Notification;
  const originalWorker = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    if (originalWorker) Object.defineProperty(navigator, "serviceWorker", originalWorker);
    else Reflect.deleteProperty(navigator, "serviceWorker");
    if (originalNotification) {
      Object.defineProperty(window, "Notification", { configurable: true, value: originalNotification });
    } else {
      Reflect.deleteProperty(window, "Notification");
    }
  });

  it("refreshes permission after returning from browser settings without changing saved choices", () => {
    const notification = { permission: "denied", requestPermission: vi.fn() };
    Object.defineProperty(window, "Notification", { configurable: true, value: notification });
    const onRemindersChange = vi.fn();
    render(
      <NotificationsPanel
        language="en"
        reminders={DEFAULT_APP_STATE.settings.reminders}
        onRemindersChange={onRemindersChange}
        onBack={vi.fn()}
      />,
    );
    notification.permission = "granted";
    fireEvent.focus(window);
    expect(screen.getByText("Browser permission is granted.")).toBeInTheDocument();
    notification.permission = "denied";
    fireEvent(document, new Event("visibilitychange"));
    expect(screen.queryByRole("button", { name: "Send a test notification" })).not.toBeInTheDocument();
    expect(onRemindersChange).not.toHaveBeenCalled();
  });

  it("prevents duplicate test sends and announces failure when worker delivery is unavailable", async () => {
    Object.defineProperty(window, "Notification", { configurable: true, value: { permission: "granted" } });
    let resolve!: (value: undefined) => void;
    const getRegistration = vi.fn(
      () =>
        new Promise<undefined>((done) => {
          resolve = done;
        }),
    );
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration, ready: new Promise(() => {}) },
    });
    render(
      <NotificationsPanel
        language="en"
        reminders={DEFAULT_APP_STATE.settings.reminders}
        onRemindersChange={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    const button = screen.getByRole("button", { name: "Send a test notification" });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(getRegistration).toHaveBeenCalledOnce();
    resolve(undefined);
    expect(await screen.findByText("The test notification could not be sent.")).toHaveAttribute("role", "status");
    expect(button).toBeEnabled();
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
