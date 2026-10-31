import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { dismissTopOverlay, useOverlayBack } from "./useOverlayBack";

function Layer({ close, hidden = false }: { close: () => void; hidden?: boolean }) {
  const id = useOverlayBack(true, close);
  return (
    <section role="dialog" data-back-dismiss={id} aria-hidden={hidden || undefined}>
      Layer
    </section>
  );
}

describe("Android overlay Back", () => {
  it("dismisses only the foremost visible layer and cleans up on unmount", () => {
    const parent = vi.fn(),
      child = vi.fn();
    const view = render(
      <>
        <Layer close={parent} />
        <Layer close={child} />
      </>,
    );
    act(() => {
      expect(dismissTopOverlay()).toBe(true);
    });
    expect(child).toHaveBeenCalledOnce();
    expect(parent).not.toHaveBeenCalled();
    view.rerender(
      <>
        <Layer close={parent} />
        <Layer close={child} hidden />
      </>,
    );
    act(() => dismissTopOverlay());
    expect(parent).toHaveBeenCalledOnce();
    view.unmount();
    expect(dismissTopOverlay()).toBe(false);
  });
  it("lets a nested menu consume Escape before its enclosing modal", () => {
    const close = vi.fn(),
      escape = vi.fn();
    render(
      <>
        <Layer close={close} />
        <div
          role="menu"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") escape();
          }}
        >
          Menu
        </div>
      </>,
    );
    act(() => dismissTopOverlay());
    expect(escape).toHaveBeenCalledOnce();
    expect(close).not.toHaveBeenCalled();
  });
});
