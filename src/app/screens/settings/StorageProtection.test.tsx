import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StorageProtection } from "./StorageProtection";
import * as platform from "../../native/platform";

const original = Object.getOwnPropertyDescriptor(navigator, "storage");
afterEach(() => {
  vi.restoreAllMocks();
  if (original) Object.defineProperty(navigator, "storage", original);
  else Reflect.deleteProperty(navigator, "storage");
});

it.each([true, false])(
  "requests protection only after an explicit gesture; result %s does not affect ordinary saving",
  async (granted) => {
    const persist = vi.fn(async () => granted);
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { persisted: async () => false, persist },
    });
    render(<StorageProtection language="en" />);
    expect(screen.getByTestId("storage-protection")).not.toHaveAttribute("open");
    expect(persist).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Keep data on this device"));
    const button = screen.getByRole("button", { name: "Request storage protection" });
    await waitFor(() => expect(button).toBeEnabled());
    await act(async () => fireEvent.click(button));
    expect(persist).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent(
      granted ? "Storage protection is active." : "Your data still saves",
    );
  },
);

it("shows unsupported recovery and a backup explanation without a dead action", async () => {
  Object.defineProperty(navigator, "storage", { configurable: true, value: {} });
  render(<StorageProtection language="en" />);
  fireEvent.click(screen.getByText("Keep data on this device"));
  expect(await screen.findByText(/Extra storage protection is unavailable here/)).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("keeps already granted protection passive", async () => {
  const persist = vi.fn();
  Object.defineProperty(navigator, "storage", { configurable: true, value: { persisted: async () => true, persist } });
  render(<StorageProtection language="en" />);
  fireEvent.click(screen.getByText("Keep data on this device"));
  expect(await screen.findByText("Storage protection is active.")).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(persist).not.toHaveBeenCalled();
});

it("omits browser storage permission in the native Android host", () => {
  vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
  const { container } = render(<StorageProtection language="en" />);
  expect(container).toBeEmptyDOMElement();
});
