import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import * as Popover from "@radix-ui/react-popover";
import { AudioOptionsSurface, useAudioOptionsDock } from "./AudioOptionsSurface";

afterEach(() => vi.unstubAllGlobals());

it("renders ordinary docked options as a named landmark without popup focus or outside-dismiss behavior", () => {
  const panelRef = { current: null as HTMLElement | null };
  const autofocus = vi.fn();
  render(
    <Popover.Root>
      <AudioOptionsSurface
        docked
        id="audio-controls-panel"
        panelRef={panelRef}
        aria-label="Audio options"
        onOpenAutoFocus={autofocus}
      >
        <button type="button">Change reciter</button>
      </AudioOptionsSurface>
    </Popover.Root>,
  );
  expect(panelRef.current).toBe(screen.getByRole("complementary", { name: "Audio options" }));
  expect(panelRef.current).toHaveAttribute("id", "audio-controls-panel");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(autofocus).not.toHaveBeenCalled();
});

it("follows the actual CSS dock geometry and disconnects its observer", () => {
  let measure = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        measure = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  const host = document.createElement("div");
  let width = 0;
  vi.spyOn(host, "getBoundingClientRect").mockImplementation(() => ({ width }) as DOMRect);
  function Probe() {
    return <p>{useAudioOptionsDock(host) ? "docked" : "popup"}</p>;
  }
  const view = render(<Probe />);
  expect(screen.getByText("popup")).toBeInTheDocument();
  act(() => {
    width = 320;
    measure();
  });
  expect(screen.getByText("docked")).toBeInTheDocument();
  act(() => {
    width = 0;
    measure();
  });
  expect(screen.getByText("popup")).toBeInTheDocument();
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
