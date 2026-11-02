import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FirstUseSetup } from "./FirstUseSetup";

const originalStorage = Object.getOwnPropertyDescriptor(navigator, "storage");
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalStorage) Object.defineProperty(navigator, "storage", originalStorage);
  else Reflect.deleteProperty(navigator, "storage");
});

describe("optional first-use setup", () => {
  it("requests only from separate explicit actions and keeps reading available after refusal", async () => {
    const requestPermission = vi.fn(async () => "denied");
    vi.stubGlobal("Notification", { permission: "default", requestPermission });
    const persist = vi.fn(async () => false);
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { persisted: async () => false, persist },
    });
    const close = vi.fn();
    render(<FirstUseSetup language="en" onClose={close} />);
    expect(requestPermission).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Enable notifications" }));
    await waitFor(() => expect(requestPermission).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.queryByRole("button", { name: "Enable notifications" })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Request storage protection" }));
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Continue to Home" }));
    expect(close).toHaveBeenCalledOnce();
  });
  it("shows unsupported recovery and links instead of dead permission buttons", async () => {
    vi.stubGlobal("Notification", undefined);
    Reflect.deleteProperty(window, "Notification");
    Object.defineProperty(navigator, "storage", { configurable: true, value: {} });
    render(<FirstUseSetup language="en" onClose={vi.fn()} />);
    await screen.findByText(/Extra storage protection is unavailable here/);
    expect(screen.queryByRole("button", { name: "Request storage protection" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review reminder choices" })).toHaveAttribute(
      "href",
      "#/settings/notifications",
    );
  });
});
