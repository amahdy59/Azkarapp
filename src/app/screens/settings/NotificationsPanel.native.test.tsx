import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { t } from "../../i18n";
import { NotificationsPanel } from "./NotificationsPanel";

const native = vi.hoisted(() => ({
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  getPending: vi.fn(),
  checkExactNotificationSetting: vi.fn(),
  changeExactNotificationSetting: vi.fn(),
}));
vi.mock("../../native/platform", () => ({ isNativeAndroid: () => true }));
vi.mock("@capacitor/local-notifications", () => ({ LocalNotifications: native }));

beforeEach(() => {
  vi.clearAllMocks();
  native.checkPermissions.mockResolvedValue({ display: "prompt" });
  native.requestPermissions.mockResolvedValue({ display: "granted" });
  native.getPending.mockResolvedValue({ notifications: [] });
  native.checkExactNotificationSetting.mockResolvedValue({ exact_alarm: "granted" });
  native.changeExactNotificationSetting.mockResolvedValue({ exact_alarm: "granted" });
});

describe("Android notification settings", () => {
  it("reads the pending queue, flags exact alarm access and routes recovery through the owner", async () => {
    native.checkPermissions.mockResolvedValue({ display: "granted" });
    native.getPending.mockResolvedValue({ notifications: [{ id: 9999 }, { id: 10001 }, { id: 10002 }] });
    native.checkExactNotificationSetting.mockResolvedValue({ exact_alarm: "denied" });
    render(
      <NotificationsPanel
        language="en"
        reminders={DEFAULT_APP_STATE.settings.reminders}
        onRemindersChange={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    await screen.findByText(t("en", "notifications.androidNeedsReview"));
    const details = screen.getByTestId("notification-permission-details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    fireEvent.click(details.querySelector("summary")!);
    const readiness = within(screen.getByTestId("native-reminder-readiness"));
    expect(readiness.getByRole("status")).toHaveTextContent(t("en", "notifications.queueCount", { count: "2" }));
    expect(readiness.getByText(t("en", "notifications.exactNeeded"))).toBeVisible();
    expect(native.changeExactNotificationSetting).not.toHaveBeenCalled();
    fireEvent.click(readiness.getByRole("button", { name: t("en", "notifications.allowExact") }));
    expect(await readiness.findByText(t("en", "notifications.exactGranted"))).toBeVisible();
    expect(native.changeExactNotificationSetting).toHaveBeenCalledOnce();
    native.getPending.mockRejectedValue(new Error("Native queue unavailable"));
    fireEvent.focus(window);
    expect(await readiness.findByText(t("en", "notifications.queueError"))).toBeVisible();
    const rebuild = vi.fn();
    window.addEventListener("azkar-retry-native-reminders", rebuild, { once: true });
    fireEvent.click(readiness.getByRole("button", { name: t("en", "mushaf.retry") }));
    expect(rebuild).toHaveBeenCalledOnce();
  });

  for (const language of ["ar", "en"] as const) {
    it(`offers a generic enable action using native permission in ${language}`, async () => {
      render(
        <NotificationsPanel
          language={language}
          reminders={DEFAULT_APP_STATE.settings.reminders}
          onRemindersChange={vi.fn()}
          onBack={vi.fn()}
        />,
      );
      await vi.waitFor(() => expect(native.checkPermissions).toHaveBeenCalled());
      const enable = await screen.findByRole("button", { name: t(language, "notifications.requestPermission") });
      fireEvent.click(enable);
      expect(await screen.findByText(t(language, "notifications.permissionGranted"))).toBeVisible();
      expect(native.requestPermissions).toHaveBeenCalledOnce();
      expect(screen.queryByText(t(language, "readiness.browser"))).not.toBeInTheDocument();
    });

    it(`shows Android recovery and refreshes revoked permission in ${language}`, async () => {
      native.checkPermissions.mockResolvedValue({ display: "denied" });
      const onRemindersChange = vi.fn();
      render(
        <NotificationsPanel
          language={language}
          reminders={DEFAULT_APP_STATE.settings.reminders}
          onRemindersChange={onRemindersChange}
          onBack={vi.fn()}
        />,
      );
      expect(await screen.findByText(t(language, "notifications.nativePermissionBlockedAction"))).toBeVisible();
      fireEvent.click(screen.getByRole("switch", { name: t(language, "notifications.morning") }));
      expect(screen.getByRole("alert")).toHaveTextContent(t(language, "notifications.permissionRequired"));
      expect(onRemindersChange).not.toHaveBeenCalled();
      native.checkPermissions.mockResolvedValue({ display: "granted" });
      fireEvent.focus(window);
      await screen.findByText(t(language, "notifications.permissionGranted"));
      const details = screen.getByTestId("notification-permission-details") as HTMLDetailsElement;
      if (!details.open) fireEvent.click(details.querySelector("summary")!);
      expect(screen.getByRole("button", { name: t(language, "notifications.testNotification") })).toBeVisible();
      expect(screen.queryByText(t(language, "notifications.nativePermissionBlockedAction"))).not.toBeInTheDocument();
    });
  }
});
