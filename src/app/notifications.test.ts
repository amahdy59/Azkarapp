import { afterEach, describe, expect, it, vi } from "vitest";
import { readNotificationPermission, showBrowserNotification } from "./notifications";

const originalWorker = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalWorker) Object.defineProperty(navigator, "serviceWorker", originalWorker);
  else Reflect.deleteProperty(navigator, "serviceWorker");
});

function setup(permission: NotificationPermission = "granted", registration?: object) {
  const construct = vi.fn(function () {});
  Object.assign(construct, { permission });
  vi.stubGlobal("Notification", construct);
  const getRegistration = vi.fn().mockResolvedValue(registration);
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { getRegistration, ready: new Promise(() => {}) },
  });
  return { construct, getRegistration };
}

describe("browser notification delivery", () => {
  it("uses the active worker without waiting for its ready promise", async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    const { construct } = setup("granted", { active: {}, showNotification });
    expect(await showBrowserNotification("Reminder", { tag: "one" })).toBe(true);
    expect(showNotification).toHaveBeenCalledWith("Reminder", { tag: "one" });
    expect(construct).not.toHaveBeenCalled();
  });
  it("falls back on desktop when no worker is registered", async () => {
    const { construct } = setup();
    expect(await showBrowserNotification("Reminder", {})).toBe(true);
    expect(construct).toHaveBeenCalledOnce();
  });
  it("reports unavailable mobile delivery instead of hanging", async () => {
    const { construct } = setup();
    construct.mockImplementation(() => {
      throw new TypeError("Requires worker");
    });
    expect(await showBrowserNotification("Reminder", {})).toBe(false);
  });
  it("does not query or notify without permission", async () => {
    const { construct, getRegistration } = setup("denied");
    expect(await showBrowserNotification("Reminder", {})).toBe(false);
    expect(getRegistration).not.toHaveBeenCalled();
    expect(construct).not.toHaveBeenCalled();
  });
  it.each(["cancelled", "revoked"])("suppresses %s delivery after the asynchronous worker lookup", async (reason) => {
    let current = true;
    const showNotification = vi.fn();
    const { construct, getRegistration } = setup();
    getRegistration.mockImplementation(async () => {
      if (reason === "cancelled") current = false;
      else Object.assign(construct, { permission: "denied" });
      return { active: {}, showNotification };
    });
    expect(await showBrowserNotification("Reminder", {}, () => current)).toBe(false);
    expect(showNotification).not.toHaveBeenCalled();
    expect(construct).not.toHaveBeenCalled();
  });
  it("contains worker lookup errors", async () => {
    const { getRegistration } = setup();
    getRegistration.mockRejectedValue(new Error("Unavailable"));
    expect(await showBrowserNotification("Reminder", {})).toBe(false);
  });
  it("identifies browsers without notifications", () => {
    setup();
    Reflect.deleteProperty(window, "Notification");
    expect(readNotificationPermission()).toBe("unsupported");
  });
});
