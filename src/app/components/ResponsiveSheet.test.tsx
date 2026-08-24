import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./ResponsiveSheet";

describe("Modal accessibility", () => {
  it("uses the title once without inventing a duplicate description", () => {
    render(
      <Modal open onClose={vi.fn()} title="Ayah actions" direction="ltr">
        <button type="button">Copy ayah</button>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Ayah actions" });
    expect(dialog).not.toHaveAccessibleDescription();
    expect(screen.getAllByText("Ayah actions")).toHaveLength(1);
  });

  it("uses a caller-supplied description without repeating the title", () => {
    render(
      <Modal open onClose={vi.fn()} title="Ayah actions" direction="ltr" describedById="ayah-actions-description">
        <p id="ayah-actions-description">Copy, bookmark, or share the canonical text.</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Ayah actions" });
    expect(dialog).toHaveAccessibleDescription("Copy, bookmark, or share the canonical text.");
    expect(screen.getAllByText("Ayah actions")).toHaveLength(1);
  });
});
