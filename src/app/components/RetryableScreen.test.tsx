import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { retryableScreen } from "./RetryableScreen";

describe("retryableScreen", () => {
  it("retries a rejected chunk without reloading the app", async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("chunk unavailable"))
      .mockResolvedValueOnce({ default: ({ language }: { language: "en" }) => <h1>{language} loaded</h1> });
    const TestScreen = retryableScreen(loader);

    render(<TestScreen language="en" />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { name: "en loaded" })).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("offers refresh only after an explicit retry also fails", async () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const loader = vi.fn().mockRejectedValue(new Error("chunk unavailable"));
    const TestScreen = retryableScreen(loader);
    render(<TestScreen language="en" />);

    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
    const refreshButton = await screen.findByRole("button", { name: "Refresh app" });
    expect(screen.getByRole("button", { name: "Go to Azkar" })).toBeInTheDocument();

    fireEvent.click(refreshButton);
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "azkar-apply-update" }));
    expect(screen.getByRole("button", { name: "Applying the update…" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveAttribute("aria-busy", "true");

    dispatchEvent.mockRestore();
  });
});
