import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SyncStatus } from "./SyncStatus";

describe("SyncStatus", () => {
  it("offers retry and dismissal without exposing backend details", () => {
    const retry = vi.fn();
    render(<SyncStatus isSyncing={false} errorMessage="private backend detail" onRetry={retry} language="en" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Account sync is paused");
    expect(screen.queryByText("private backend detail")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
