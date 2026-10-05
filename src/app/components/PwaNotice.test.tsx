import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { PwaNotice } from "./PwaNotice";

describe("PwaNotice", () => {
  it("lets manual update review focus its native action", () => {
    const actionRef = createRef<HTMLButtonElement>();
    render(
      <PwaNotice
        title="An update is ready"
        actionLabel="Refresh"
        dismissLabel="Later"
        actionRef={actionRef}
        onAction={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(actionRef.current).toBe(screen.getByRole("button", { name: "Refresh" }));
    actionRef.current?.focus();
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveFocus();
  });
  it("limits announcements to the changing status and exposes busy state", () => {
    render(
      <PwaNotice
        title="An update is ready"
        body="Refresh when convenient."
        actionLabel="Refresh"
        dismissLabel="Later"
        onAction={vi.fn()}
        onDismiss={vi.fn()}
        isActionLoading
        statusMessage="Applying the update…"
      />,
    );

    expect(screen.getByText("An update is ready").closest("aside")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Applying the update");
    expect(screen.getAllByRole("button").every((button) => button.hasAttribute("disabled"))).toBe(true);
  });

  it("announces update failures assertively", () => {
    render(
      <PwaNotice
        title="An update is ready"
        actionLabel="Refresh"
        dismissLabel="Later"
        onAction={vi.fn()}
        onDismiss={vi.fn()}
        errorMessage="The update could not be applied."
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("could not be applied");
  });
});
