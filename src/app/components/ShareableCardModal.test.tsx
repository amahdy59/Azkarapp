import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShareableCardModal } from "./ShareableCardModal";

describe("ShareableCardModal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports a cancelled native share without presenting it as an error", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError")),
    });
    render(<ShareableCardModal palms={1} golden={2} green={3} dateStr="12 August" language="en" onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Share Milestone" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Sharing cancelled");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces clipboard failure and restores the action", async () => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("clipboard denied")) },
    });
    render(<ShareableCardModal palms={1} golden={2} green={3} dateStr="12 August" language="en" onClose={vi.fn()} />);

    const action = screen.getByRole("button", { name: "Share Milestone" });
    fireEvent.click(action);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not share this achievement");
    expect(action).not.toBeDisabled();
  });
});
