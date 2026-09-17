import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatePanel } from "./StatePanel";

describe("StatePanel", () => {
  it("keeps static empty states out of live regions", () => {
    render(<StatePanel kind="empty-search" language="en" />);
    expect(screen.getByRole("heading", { name: "No azkar found" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces and focuses a recoverable route failure", () => {
    const retry = vi.fn();
    const leave = vi.fn();
    render(
      <StatePanel
        kind="route-error"
        language="en"
        focusOnMount
        actionLabel="Try again"
        onAction={retry}
        secondaryActionLabel="Go to Azkar"
        onSecondaryAction={leave}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "This section did not load" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    fireEvent.click(screen.getByRole("button", { name: "Go to Azkar" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(leave).toHaveBeenCalledOnce();
  });
});
