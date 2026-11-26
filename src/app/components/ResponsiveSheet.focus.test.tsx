import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { ToolbarPanel } from "./ToolbarPanel";

const initialWidth = window.innerWidth;
afterEach(() => Object.defineProperty(window, "innerWidth", { configurable: true, value: initialWidth }));

describe("shared sheet initial focus", () => {
  it.each([390, 834])("honors task focus and restores its opener at %ipx", async (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    const focus = vi.fn();
    function Fixture() {
      const [open, setOpen] = useState(false);
      const close = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open dates</button>
          {open && (
            <ResponsiveSheet
              open={open}
              onClose={() => setOpen(false)}
              title="Dates"
              direction="ltr"
              onOpenAutoFocus={(event) => {
                focus();
                event.preventDefault();
                close.current?.focus();
              }}
            >
              <button ref={close} onClick={() => setOpen(false)}>
                Close dates
              </button>
              <input aria-label="Start date" />
            </ResponsiveSheet>
          )}
        </>
      );
    }
    render(<Fixture />);
    const opener = screen.getByRole("button", { name: "Open dates" });
    opener.focus();
    fireEvent.click(opener);
    const close = await screen.findByRole("button", { name: "Close dates" });
    await waitFor(() => expect(close).toHaveFocus());
    expect(focus).toHaveBeenCalledOnce();
    fireEvent.click(close);
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("keeps default compact focus on the named surface instead of its input", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    const focus = vi.fn();
    render(
      <ResponsiveSheet open onClose={vi.fn()} title="Search choices" direction="ltr" onOpenAutoFocus={focus}>
        <input aria-label="Search" />
      </ResponsiveSheet>,
    );
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Search choices" })).toHaveFocus());
    expect(focus).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox")).not.toHaveFocus();
  });

  it("forwards the same override to a non-modal reader panel", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    function Fixture() {
      const [open, setOpen] = useState(false);
      const input = useRef<HTMLInputElement>(null);
      return (
        <div data-toolbar-panel-frame="">
          <button data-overlay-edge="top" onClick={() => setOpen(true)}>
            Open tools
          </button>
          <div data-toolbar-panel-host="" />
          <ResponsiveSheet
            open={open}
            onClose={() => setOpen(false)}
            title="Tools"
            direction="ltr"
            readerPanel={ToolbarPanel}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              input.current?.focus();
            }}
          >
            <input ref={input} aria-label="Search tools" />
          </ResponsiveSheet>
        </div>
      );
    }
    render(<Fixture />);
    fireEvent.click(screen.getByRole("button", { name: "Open tools" }));
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Search tools" })).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
