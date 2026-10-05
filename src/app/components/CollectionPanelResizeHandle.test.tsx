import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollectionPanelResizeHandle } from "./CollectionPanelResizeHandle";

describe("collection panel resizing", () => {
  it.each(["rtl", "ltr"] as const)("maps physical arrow movement to the panel edge in %s", (direction) => {
    const onResize = vi.fn();
    const onCollapse = vi.fn();
    const onReset = vi.fn();
    render(
      <CollectionPanelResizeHandle
        width={336}
        minimum={288}
        maximum={440}
        direction={direction}
        language="en"
        onResize={onResize}
        onCollapse={onCollapse}
        onReset={onReset}
      />,
    );
    const handle = screen.getByRole("separator", { name: "Resize zikr list" });
    expect(handle).toHaveAttribute("aria-valuenow", "336");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onResize).toHaveBeenLastCalledWith(direction === "rtl" ? 352 : 320);
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(onResize).toHaveBeenLastCalledWith(direction === "rtl" ? 304 : 368);
    fireEvent.keyDown(handle, { key: "Home" });
    expect(onResize).toHaveBeenLastCalledWith(288);
    fireEvent.keyDown(handle, { key: "End" });
    expect(onResize).toHaveBeenLastCalledWith(440);
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(onCollapse).toHaveBeenCalledOnce();
    fireEvent.doubleClick(handle);
    expect(onReset).toHaveBeenCalledOnce();
  });
});
