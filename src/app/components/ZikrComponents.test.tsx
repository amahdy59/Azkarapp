import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ZikrCounterSurface } from "./ZikrComponents";

describe("ZikrCounterSurface", () => {
  it("uses a clipped internal fill that follows the counter progress", () => {
    const { container, rerender } = render(
      <ZikrCounterSurface count={0} total={20} onTap={() => undefined} language="en" />,
    );

    let fill = container.querySelector<HTMLElement>(".counter-progress-fill");
    expect(fill).toHaveStyle({ inlineSize: "0%", borderInlineEndWidth: "0" });
    expect(container.querySelector("svg")).toBeNull();

    rerender(<ZikrCounterSurface count={5} total={20} onTap={() => undefined} language="en" />);
    fill = container.querySelector<HTMLElement>(".counter-progress-fill");
    expect(fill).toHaveStyle({ inlineSize: "25%", borderInlineEndWidth: "2px" });
  });

  it("renders a one-shot decorative ripple from the pointer position", () => {
    const onTap = vi.fn();
    const { container } = render(
      <ZikrCounterSurface count={0} total={33} onTap={onTap} language="en" testId="shared-counter" />,
    );
    const counter = screen.getByTestId("shared-counter");
    vi.spyOn(counter, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      right: 230,
      bottom: 96,
      width: 220,
      height: 76,
      x: 10,
      y: 20,
      toJSON: () => undefined,
    });

    fireEvent.pointerDown(counter, { clientX: 40, clientY: 55 });
    const ripple = container.querySelector(".tap-ripple");
    expect(ripple).toHaveStyle({ left: "30px", top: "35px" });

    fireEvent.click(counter);
    expect(onTap).toHaveBeenCalledOnce();
    expect(ripple).toHaveClass("tap-ripple");
  });
});
