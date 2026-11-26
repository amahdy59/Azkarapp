import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { useToolbarPanel } from "../hooks/useToolbarPanel";
import { dismissTopOverlay } from "../hooks/useOverlayBack";
import { ToolbarPanel } from "./ToolbarPanel";

const width = window.innerWidth;
afterEach(() => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
});

function Fixture() {
  const [tools, setTools] = useState(false),
    [index, setIndex] = useState(false),
    [settings, setSettings] = useState(false);
  const indexRef = useRef<HTMLElement>(null);
  useToolbarPanel(index, indexRef, () => setIndex(false));
  return (
    <div data-toolbar-panel-frame="">
      <button data-overlay-edge="top" onClick={() => setTools((value) => !value)}>
        Tools
      </button>
      <button data-overlay-edge="bottom" onClick={() => setIndex(true)}>
        Index
      </button>
      <div data-toolbar-panel-host="" />
      {index && (
        <section ref={indexRef} data-mushaf-inline-index="">
          Index content
        </section>
      )}
      <ResponsiveSheet
        open={tools}
        onClose={() => setTools(false)}
        title="Tools panel"
        direction="ltr"
        readerPanel={ToolbarPanel}
      >
        <SheetHeader title="Tools panel" onClose={() => setTools(false)} />
        <button
          onClick={() => {
            setTools(false);
            setSettings(true);
          }}
        >
          Settings
        </button>
      </ResponsiveSheet>
      <ResponsiveSheet
        open={settings}
        onClose={() => setSettings(false)}
        title="Settings panel"
        direction="ltr"
        readerPanel={ToolbarPanel}
      >
        <SheetHeader title="Settings panel" onClose={() => setSettings(false)} />
      </ResponsiveSheet>
    </div>
  );
}

describe("toolbar content panels", () => {
  it("keeps bars usable, replaces the previous panel and restores the original trigger", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    render(<Fixture />);
    const tools = screen.getByRole("button", { name: "Tools", exact: true });
    fireEvent.click(tools);
    const panel = screen.getByRole("region", { name: "Tools panel" });
    expect(panel).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(tools.closest("[inert]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Settings", exact: true }));
    expect(screen.queryByRole("region", { name: "Tools panel" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Settings panel" })).toHaveFocus();
    act(() => dismissTopOverlay());
    await waitFor(() => expect(tools).toHaveFocus());
    fireEvent.click(tools);
    fireEvent.click(screen.getByRole("button", { name: "Index", exact: true }));
    expect(screen.queryByRole("region", { name: "Tools panel" })).not.toBeInTheDocument();
    expect(screen.getByText("Index content")).toBeVisible();
  });

  it("Escape closes the panel without reaching the reader underneath", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    render(<Fixture />);
    const tools = screen.getByRole("button", { name: "Tools", exact: true });
    fireEvent.click(tools);
    fireEvent.keyDown(screen.getByRole("region", { name: "Tools panel" }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("region", { name: "Tools panel" })).not.toBeInTheDocument());
    expect(tools).toHaveFocus();
  });
});
