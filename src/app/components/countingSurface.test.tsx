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
    // The depth comes from the token every other control presses to, with the
    // constant only as an SSR fallback — asserting the literal would let the
    // counter drift away from the app again the moment the token moved.
    expect(pressed.style.transform).toBe(`scale(var(--motion-scale-pressed, ${COUNTING_PRESS.scale}))`);
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

  it("presses the counter button to the same depth as every other control", () => {
    const css = readFileSync("src/app/components/ZikrComponents.css", "utf8");
    const press = css.match(/\.adaptive-counter-surface\.is-pressed,[^}]*transform: scale\(([^)]*\)?)\)/);
    expect(press).not.toBeNull();
    // Not a number of its own: the counter reads the same custom property the
    // global press rule uses, so it cannot press to a different depth.
    expect(press![1]).toBe("var(--motion-scale-pressed)");

    const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");
    const value = tokens.match(/--motion-scale-pressed:\s*([\d.]+)/);
    expect(Number(value![1])).toBe(COUNTING_PRESS.scale);

    // The button used to spring this property through framer-motion while the
    // rule above set it too. One property, one mechanism.
    expect(readFileSync("src/app/components/ZikrComponents.tsx", "utf8")).not.toMatch(/whileTap/);
  });

  it("comes back up more slowly than it goes down", () => {
    const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");
    const press = Number(tokens.match(/--motion-duration-press:\s*(\d+)ms/)![1]);
    const release = Number(tokens.match(/--motion-duration-release:\s*(\d+)ms/)![1]);
    // Equal halves are what made a press read as an image resizing. Down fast,
    // back slowly through a curve that overshoots 1 before settling.
    expect(release).toBeGreaterThan(press * 2);
    expect(tokens).toMatch(/--motion-ease-release:\s*cubic-bezier\(0\.34,\s*1\.56,/);
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

  it("presses a compact control deep enough to be seen at all", () => {
    const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");
    const base = Number(tokens.match(/--motion-scale-pressed:\s*([\d.]+)/)![1]);
    const compact = Number(tokens.match(/--motion-scale-pressed-compact:\s*([\d.]+)/)![1]);
    // 0.97 moves a 44px icon button 0.66px per edge — sub-pixel on a 1x
    // display, which is not a faint press but no press. A constant scale is not
    // a constant feel.
    expect(compact).toBeLessThan(base);
    expect((44 * (1 - compact)) / 2).toBeGreaterThan(1.5);

    const surfaces = readFileSync("src/styles/theme/surfaces.css", "utf8");
    // It has to out-specify the global press rule, which is !important. The
    // obvious home for it, `.ui-icon-button` in tailwind-bridge.css, sits inside
    // `@layer components`, where layered-vs-unlayered !important inverts the
    // usual order — so it lives here, beside the rule it refines.
    expect(surfaces).toContain("button.ui-icon-button:not(:disabled):not(.no-press):active");
    expect(surfaces).toContain("scale(var(--motion-scale-pressed-compact)) !important");
  });
});
