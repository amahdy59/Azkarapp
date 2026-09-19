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

  it("renders an accessible close button and triggers onClose when clicked", () => {
    const handleClose = vi.fn();
    render(
      <Modal open onClose={handleClose} title="Ayah actions" direction="ltr">
        <p>Content</p>
      </Modal>,
    );

    const closeBtn = screen.getByTestId("modal-close-button");
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveAccessibleName("Close");
    closeBtn.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("can hide the close button when showCloseButton is false", () => {
    render(
      <Modal open onClose={vi.fn()} title="Ayah actions" direction="rtl" showCloseButton={false}>
        <p>Content</p>
      </Modal>,
    );

    expect(screen.queryByTestId("modal-close-button")).not.toBeInTheDocument();
  });

  it("applies frosted glass styling when onGlass is true", () => {
    render(
      <Modal open onClose={vi.fn()} title="Ayah actions" direction="rtl" onGlass testId="glass-modal">
        <p>Content</p>
      </Modal>,
    );

    const modal = screen.getByTestId("glass-modal");
    expect(modal).toHaveClass("hero-glass");
  });
});
