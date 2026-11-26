import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FirstUseSetup } from "./FirstUseSetup";
import { DEFAULT_APP_STATE } from "../../state";
import { recommendedReminders } from "../../contextReminders";
import * as notifications from "../../notifications";
import * as calculation from "../../content/prayerCalculation";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setup(permission: NotificationPermission = "default", props = {}) {
  const requestPermission = vi.fn().mockResolvedValue("denied");
  vi.stubGlobal("Notification", { permission, requestPermission });
  const onClose = vi.fn();
  const onLocationChange = vi.fn();
  const view = render(
    <FirstUseSetup
      language="en"
      reminders={recommendedReminders(DEFAULT_APP_STATE.settings.reminders)}
      location={DEFAULT_APP_STATE.settings.location}
      onClose={onClose}
      onLocationChange={onLocationChange}
      {...props}
    />,
  );
  return { ...view, requestPermission, onClose, onLocationChange };
}

describe("notification-first optional setup", () => {
  it("requests only after a gesture, keeps details collapsed and permits reading after refusal", async () => {
    const { requestPermission, onClose } = setup();
    expect(requestPermission).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Request storage protection" })).not.toBeInTheDocument();
    expect(screen.getByTestId("first-use-reminders")).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("View selected reminders"));
    expect(screen.getByText("Morning adhkar", { exact: false })).toBeVisible();
    expect(screen.queryByText("Dua before Fajr")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Change reminder choices" })).toHaveAttribute(
      "href",
      "#/settings/notifications",
    );
    fireEvent.click(screen.getByRole("button", { name: "Enable notifications" }));
    expect(await screen.findByRole("heading", { name: "Notifications are blocked" })).toBeInTheDocument();
    expect(requestPermission).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Enable notifications" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("How do I allow notifications?"));
    expect(screen.getByText(/Open this site’s settings/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Continue reading" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("offers Later without requesting notification or location permission", () => {
    const detect = vi.spyOn(calculation, "detectUserCoordinates");
    const { requestPermission, onClose } = setup("default", { needsLocation: true });
    fireEvent.click(screen.getByRole("button", { name: "Later" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(requestPermission).not.toHaveBeenCalled();
    expect(detect).not.toHaveBeenCalled();
  });

  it("continues automatically after a grant when location is already known", async () => {
    const { requestPermission, onClose } = setup();
    requestPermission.mockResolvedValue("granted");
    fireEvent.click(screen.getByRole("button", { name: "Enable notifications" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("skips the permission decision if it was already allowed", () => {
    const { requestPermission, onClose } = setup("granted");
    expect(onClose).toHaveBeenCalledOnce();
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("offers an optional city step after permission, keeps focus and saves through the location owner", async () => {
    const location = { ...calculation.DEFAULT_LOCATION, calculationMethod: 4, adjustments: { fajr: 3 } };
    const { requestPermission, onClose, onLocationChange } = setup("default", { needsLocation: true, location });
    requestPermission.mockResolvedValue("granted");
    const detect = vi.spyOn(calculation, "detectUserCoordinates");
    fireEvent.click(screen.getByRole("button", { name: "Enable notifications" }));
    const heading = await screen.findByRole("heading", { name: "Set your prayer times" });
    expect(heading).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
    expect(detect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Choose a city" }));
    expect(screen.getByRole("searchbox")).toHaveFocus();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "No such city zzz" } });
    expect(screen.getByRole("status")).toHaveTextContent(/No matching cities/);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "Set your prayer times" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Choose a city" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "London" } });
    fireEvent.click(screen.getByRole("button", { name: /London.*United Kingdom/ }));
    expect(onLocationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        cityName: "London",
        timeZone: "Europe/London",
        calculationMethod: 4,
        adjustments: { fajr: 3 },
        autoDetect: false,
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("can skip city setup after permission without changing the stored location", () => {
    const { onClose, onLocationChange } = setup("granted", { needsLocation: true });
    fireEvent.click(screen.getByRole("button", { name: "Later" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onLocationChange).not.toHaveBeenCalled();
  });

  it("requests GPS only explicitly and retains city search after location denial", async () => {
    const detect = vi.spyOn(calculation, "detectUserCoordinates").mockResolvedValue({ ok: false, reason: "denied" });
    const { onLocationChange } = setup("granted", { needsLocation: true });
    expect(detect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    expect(await screen.findByText(/Location access is blocked/)).toBeInTheDocument();
    expect(onLocationChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Choose a city" })).toBeEnabled();
  });

  it("saves an explicit GPS result through the existing location boundary", async () => {
    vi.spyOn(calculation, "detectUserCoordinates").mockResolvedValue({
      ok: true,
      latitude: 51.5,
      longitude: -0.12,
      timeZone: "Europe/London",
    });
    const { onClose, onLocationChange } = setup("granted", { needsLocation: true });
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    await waitFor(() =>
      expect(onLocationChange).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: 51.5, longitude: -0.12, autoDetect: true, timeZone: "Europe/London" }),
      ),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not request location for device-clock routines alone", () => {
    const reminders = { ...DEFAULT_APP_STATE.settings.reminders, morning: { enabled: true, time: "08:00" } };
    const { onClose } = setup("granted", { needsLocation: true, reminders });
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Use my location" })).not.toBeInTheDocument();
  });

  it("does not ask for notifications with no selected reminders", () => {
    const { requestPermission } = setup("default", { reminders: DEFAULT_APP_STATE.settings.reminders });
    expect(screen.queryByRole("button", { name: "Enable notifications" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("View selected reminders"));
    expect(screen.getByText(/No reminders are selected/)).toBeVisible();
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("contains permission errors and allows a dismissed request to be retried", async () => {
    const { requestPermission } = setup();
    requestPermission.mockRejectedValueOnce(new Error("unavailable")).mockResolvedValueOnce("default");
    fireEvent.click(screen.getByRole("button", { name: "Enable notifications" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not finish/);
    fireEvent.click(screen.getByRole("button", { name: "Enable notifications" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/Permission wasn’t allowed yet/);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Later" })).toBeEnabled();
  });

  it("prevents duplicate requests and ignores a permission result after dismissal", async () => {
    const { requestPermission, unmount, onClose } = setup();
    let resolve!: (value: string) => void;
    requestPermission.mockImplementation(
      () =>
        new Promise<string>((done) => {
          resolve = done;
        }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Enable notifications" }));
    expect(screen.getByRole("button", { name: "Requesting permission…" })).toBeDisabled();
    expect(requestPermission).toHaveBeenCalledOnce();
    unmount();
    await act(async () => resolve("granted"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("refreshes a blocked permission when the reader returns from settings", async () => {
    const { onClose } = setup("denied");
    Object.assign(Notification, { permission: "granted" });
    fireEvent.focus(window);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it.each(["browser", "ios-browser", "android"] as const)(
    "provides %s recovery without a dead button",
    (environment) => {
      vi.spyOn(notifications, "notificationSetupEnvironment").mockReturnValue(environment);
      const { requestPermission } = setup(environment === "ios-browser" ? "default" : "denied");
      fireEvent.click(screen.getByText("How do I allow notifications?"));
      expect(
        screen.getByText(
          environment === "ios-browser"
            ? /Share → Add to Home Screen/
            : environment === "android"
              ? /Open Android Settings/
              : /Open this site’s settings/,
        ),
      ).toBeVisible();
      expect(screen.queryByRole("button", { name: "Enable notifications" })).not.toBeInTheDocument();
      expect(requestPermission).not.toHaveBeenCalled();
      if (environment === "android") expect(screen.queryByText(/Keep this web app open/)).not.toBeInTheDocument();
    },
  );

  it("contains unsupported notification capability and preserves reading", () => {
    setup();
    Reflect.deleteProperty(window, "Notification");
    fireEvent.focus(window);
    expect(screen.getByRole("heading", { name: "Notifications aren’t available here" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("How do I allow notifications?"));
    expect(screen.getByText(/Try a browser with notification support/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue reading" })).toBeEnabled();
  });
});
