import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { COUNTING_PRESS, CountingRipples, useCountingSurface } from "./countingSurface";

function Surface({ onCount, reduceMotion }: { onCount: () => void; reduceMotion?: boolean }) {
  const { surfaceProps, pressStyle, ripples, dismissRipple } = useCountingSurface({ onCount, reduceMotion });
  return (
    <div data-testid="surface" {...surfaceProps}>
      <div data-testid="pressed" style={pressStyle}>
        <button type="button" onClick={() => undefined}>
          own control
        </button>
        <span data-testid="page">page</span>
      </div>
      <CountingRipples ripples={ripples} onDismiss={dismissRipple} />
    </div>
  );
}

describe("counting surface", () => {
  it("presses deep enough and quickly enough to feel like a press", () => {
    const onCount = vi.fn();
    render(<Surface onCount={onCount} />);
    const pressed = screen.getByTestId("pressed");

    expect(pressed).toHaveStyle({ transform: "scale(1)" });
    fireEvent.pointerDown(screen.getByTestId("page"), { clientX: 10, clientY: 10 });
    expect(pressed).toHaveStyle({ transform: `scale(${COUNTING_PRESS.scale})` });
    fireEvent.pointerUp(screen.getByTestId("surface"));
    expect(pressed).toHaveStyle({ transform: "scale(1)" });
  });

  it("releases the press when the pointer leaves or is cancelled", () => {
    render(<Surface onCount={vi.fn()} />);
    const pressed = screen.getByTestId("pressed");

    fireEvent.pointerDown(screen.getByTestId("page"), { clientX: 5, clientY: 5 });
    fireEvent.pointerCancel(screen.getByTestId("surface"));
    expect(pressed).toHaveStyle({ transform: "scale(1)" });

    fireEvent.pointerDown(screen.getByTestId("page"), { clientX: 5, clientY: 5 });
    fireEvent.pointerLeave(screen.getByTestId("surface"));
    expect(pressed).toHaveStyle({ transform: "scale(1)" });
  });

  it("counts a tap on the page but never one meant for a control", () => {
    const onCount = vi.fn();
    render(<Surface onCount={onCount} />);

    fireEvent.click(screen.getByTestId("page"));
    expect(onCount).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "own control" }));
    expect(onCount).toHaveBeenCalledTimes(1);
  });

  it("still counts with reduced motion, but does not press or ripple", () => {
    const onCount = vi.fn();
    const { container } = render(<Surface onCount={onCount} reduceMotion />);

    fireEvent.pointerDown(screen.getByTestId("page"), { clientX: 5, clientY: 5 });
    expect(screen.getByTestId("pressed")).toHaveStyle({ transform: "scale(1)" });
    expect(container.querySelectorAll(".tap-ripple")).toHaveLength(0);

    fireEvent.click(screen.getByTestId("page"));
    expect(onCount).toHaveBeenCalledTimes(1);
  });

  it("is the only definition of the press: no screen re-declares its own", () => {
    // The three counting screens had each grown a copy, and they drifted — the
    // reader pressed half as far over twice as long as the other two.
    for (const screenFile of ["ReaderScreen", "CustomCounterScreen", "FridaySalawatScreen"]) {
      const source = readFileSync(join(process.cwd(), "src", "app", "screens", `${screenFile}.tsx`), "utf8");
      expect(source).toContain("useCountingSurface");
      expect(source).not.toMatch(/scale\(0\.9\d+\)/);
      expect(source).not.toMatch(/transform 150ms/);
    }
  });

  it("presses the counter button to the same depth as the page around it", () => {
    const css = readFileSync("src/app/components/ZikrComponents.css", "utf8");
    const press = css.match(/\.adaptive-counter-surface\.is-pressed,[^}]*transform: scale\(([\d.]+)\)/);
    expect(press).not.toBeNull();
    expect(Number(press![1])).toBe(COUNTING_PRESS.scale);
    // The button used to spring this property through framer-motion while the
    // rule above set it too. One property, one mechanism.
    const widget = readFileSync("src/app/components/ZikrComponents.tsx", "utf8");
    expect(widget).not.toMatch(/whileTap/);
  });

  it("leaves the ripple animation to the stylesheet that defines it", () => {
    const { container } = render(<CountingRipples ripples={[{ id: 1, x: 10, y: 20 }]} onDismiss={() => {}} />);
    const ripple = container.querySelector(".tap-ripple") as HTMLElement;
    expect(ripple).not.toBeNull();
    // An inline `animation` here used to name keyframes that exist nowhere, which
    // overrode the real rule on `.tap-ripple`: the ripple never drew, and because
    // `animationend` never fired its nodes were never released.
    expect(ripple.style.animation).toBe("");
  });
});
