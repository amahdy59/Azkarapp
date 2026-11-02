import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { t } from "../../i18n";
import { NotificationsPanel } from "./NotificationsPanel";

const native = vi.hoisted(() => ({ checkPermissions: vi.fn(), requestPermissions: vi.fn() }));
vi.mock("../../native/platform", () => ({ isNativeAndroid: () => true }));
vi.mock("@capacitor/local-notifications", () => ({ LocalNotifications: native }));

beforeEach(() => {
  vi.clearAllMocks();
  native.checkPermissions.mockResolvedValue({ display: "prompt" });
  native.requestPermissions.mockResolvedValue({ display: "granted" });
});

describe("Android notification settings", () => {
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
      expect(await screen.findByRole("button", { name: t(language, "notifications.testNotification") })).toBeVisible();
      expect(screen.queryByText(t(language, "notifications.nativePermissionBlockedAction"))).not.toBeInTheDocument();
    });
  }
});
