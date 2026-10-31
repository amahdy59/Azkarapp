import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { dismissTopOverlay } from "../hooks/useOverlayBack";
import { describe, expect, it, vi } from "vitest";
import { Modal, SheetHeader, SidePanel } from "./ResponsiveSheet";

describe("Modal accessibility", () => {
  it("native Back dismisses a nested modal before its parent and restores focus", async () => {
    function Nested() {
      const [parent, setParent] = useState(true),
        [child, setChild] = useState(false);
      return (
        <>
          <Modal open={parent} onClose={() => setParent(false)} title="Parent" direction="ltr">
            <button onClick={() => setChild(true)}>Open child</button>
          </Modal>
          <Modal open={child} onClose={() => setChild(false)} title="Child" direction="ltr">
            <button>Child action</button>
          </Modal>
        </>
      );
    }
    render(<Nested />);
    const opener = screen.getByRole("button", { name: "Open child" });
    opener.focus();
    act(() => opener.click());
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Child" })).toBeVisible());
    act(() => dismissTopOverlay());
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Child" })).not.toBeInTheDocument());
    expect(screen.getByRole("dialog", { name: "Parent" })).toBeVisible();
    await waitFor(() => expect(opener).toHaveFocus());
    act(() => dismissTopOverlay());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
  it("allows explicit recovery when a menu opener becomes hidden", async () => {
    const recovery = document.createElement("button");
    recovery.textContent = "Selected dates";
    document.body.append(recovery);
    const onCloseAutoFocus = vi.fn((event: Event) => {
      event.preventDefault();
      recovery.focus();
    });
    const view = render(
      <Modal open onClose={vi.fn()} onCloseAutoFocus={onCloseAutoFocus} title="Dates" direction="ltr">
        <button>Apply</button>
      </Modal>,
    );
    await waitFor(() => expect(screen.getByTestId("modal-close-button")).toHaveFocus());
    view.unmount();
    await waitFor(() => expect(recovery).toHaveFocus());
    expect(onCloseAutoFocus).toHaveBeenCalledOnce();
    recovery.remove();
  });
  it("restores focus to an opener inside another dialog", async () => {
    const outer = document.createElement("section");
    outer.setAttribute("role", "dialog");
    outer.setAttribute("data-return-focus-scope", "outer-dialog");
    const opener = document.createElement("button");
    opener.textContent = "Open nested sharing";
    outer.append(opener);
    document.body.append(outer);
    opener.focus();
    const view = render(
      <Modal open onClose={vi.fn()} title="Nested sharing" direction="ltr">
        <button type="button">Copy</button>
      </Modal>,
    );
    await waitFor(() => expect(screen.getByTestId("modal-close-button")).toHaveFocus());
    view.unmount();
    await waitFor(() => expect(opener).toHaveFocus());
    outer.remove();
  });

  it("captures the opener before autofocus and restores it after a conditional unmount", async () => {
    const opener = document.createElement("button");
    opener.textContent = "Open sharing";
    document.body.append(opener);
    opener.focus();
    const view = render(
      <Modal open onClose={vi.fn()} title="Sharing" direction="ltr">
        <button type="button">Copy</button>
      </Modal>,
    );
    await waitFor(() => expect(screen.getByTestId("modal-close-button")).toHaveFocus());
    view.unmount();
    await waitFor(() => expect(opener).toHaveFocus());
    opener.remove();
  });
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

describe("SheetHeader", () => {
  it("renders canonical header with title, close button and triggers onClose", () => {
    const handleClose = vi.fn();
    render(<SheetHeader title="الفائدة" onClose={handleClose} language="ar" direction="rtl" />);

    expect(screen.getByText("الفائدة")).toBeInTheDocument();
    const closeBtn = screen.getByTestId("modal-close-button");
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveAccessibleName("إغلاق");
    closeBtn.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders optional icon in a styled container", () => {
    render(
      <SheetHeader
        title="الفائدة"
        icon={<span data-testid="header-bulb-icon">💡</span>}
        onClose={vi.fn()}
        language="ar"
        direction="rtl"
      />,
    );

    expect(screen.getByTestId("header-bulb-icon")).toBeInTheDocument();
    expect(screen.getByTestId("header-bulb-icon").parentElement).toHaveClass("rounded-2xl", "bg-primary/10");
  });

  it("renders optional subtitle and custom close aria label", () => {
    render(
      <SheetHeader
        title="إعدادات القراءة"
        subtitle="سورة البقرة · صفحة ٢"
        closeAriaLabel="إغلاق الإعدادات"
        onClose={vi.fn()}
        language="ar"
        direction="rtl"
      />,
    );

    expect(screen.getByText("إعدادات القراءة")).toBeInTheDocument();
    expect(screen.getByText("سورة البقرة · صفحة ٢")).toBeInTheDocument();
    expect(screen.getByTestId("modal-close-button")).toHaveAccessibleName("إغلاق الإعدادات");
  });

  it("applies safe-area bounds to protect portalled side panel from system bars", () => {
    render(
      <SidePanel open onClose={vi.fn()} title="Drawer" direction="ltr" testId="test-side-panel">
        <div>Drawer content</div>
      </SidePanel>,
    );

    const panel = screen.getByTestId("test-side-panel");
    expect(panel).toHaveClass("pt-[env(safe-area-inset-top)]", "pb-[env(safe-area-inset-bottom)]");
  });
});
