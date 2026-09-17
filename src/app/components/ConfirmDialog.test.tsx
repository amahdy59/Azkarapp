import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("keeps an asynchronous failure visible and allows retry", async () => {
    const confirm = vi
      .fn()
      .mockRejectedValueOnce(new Error("Could not delete the account."))
      .mockResolvedValueOnce(undefined);
    render(
      <ConfirmDialog
        open
        title="Delete account"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirm}
        onCancel={vi.fn()}
        destructive
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not delete the account");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(2));
  });
});
