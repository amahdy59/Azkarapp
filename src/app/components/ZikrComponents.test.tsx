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

  it("applies pressed feedback on pointer down without rendering tap ripples", () => {
    const onTap = vi.fn();
    const { container } = render(
      <ZikrCounterSurface count={0} total={33} onTap={onTap} language="en" testId="shared-counter" />,
    );
    const counter = screen.getByTestId("shared-counter");

    fireEvent.pointerDown(counter, { clientX: 40, clientY: 55 });
    expect(counter).toHaveClass("is-pressed");
    expect(container.querySelector(".tap-ripple")).toBeNull();

    fireEvent.pointerUp(counter);
    expect(counter).not.toHaveClass("is-pressed");

    fireEvent.click(counter);
    expect(onTap).toHaveBeenCalledOnce();
  });
});
