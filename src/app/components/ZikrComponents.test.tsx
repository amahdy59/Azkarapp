import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ZikrCounterSurface } from "./ZikrComponents";

describe("ZikrCounterSurface", () => {
  it.each(["ar", "en"] as const)("keeps the current-to-target tally in %s reading order", (language) => {
    const { container } = render(
      <ZikrCounterSurface count={12} total={100} onTap={() => undefined} language={language} />,
    );
    const tally = container.querySelector("p")!;
    expect(tally).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    const numbers = tally.querySelectorAll("bdi");
    expect(numbers[0]).toHaveTextContent(language === "ar" ? "١٢" : "12");
    expect(numbers[1]).toHaveTextContent(language === "ar" ? "١٠٠" : "100");
    for (const number of numbers) expect(number).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("button")).toHaveAccessibleName(language === "ar" ? /١٢ \/ ١٠٠$/ : /12 \/ 100$/);
  });

  it("uses a clipped internal fill that follows the counter progress", () => {
    const { container, rerender } = render(
      <ZikrCounterSurface count={0} total={20} onTap={() => undefined} language="en" />,
    );

    let fill = container.querySelector<HTMLElement>(".counter-progress-fill");
    expect(fill).toHaveStyle({ borderInlineEndWidth: "0" });
    expect(fill?.style.getPropertyValue("--progress-ratio")).toBe("0");
    expect(container.querySelector("svg")).toBeNull();

    rerender(<ZikrCounterSurface count={5} total={20} onTap={() => undefined} language="en" />);
    fill = container.querySelector<HTMLElement>(".counter-progress-fill");
    expect(fill).toHaveStyle({ borderInlineEndWidth: "2px" });
    expect(fill?.style.getPropertyValue("--progress-ratio")).toBe("0.25");

    rerender(<ZikrCounterSurface count={20} total={20} complete onTap={() => undefined} language="en" />);
    expect(
      container.querySelector<HTMLElement>(".counter-progress-fill")?.style.getPropertyValue("--progress-ratio"),
    ).toBe("1");
    expect(screen.getByRole("button")).toHaveClass("is-complete");

    rerender(<ZikrCounterSurface count={0} total={20} onTap={() => undefined} language="en" />);
    expect(
      container.querySelector<HTMLElement>(".counter-progress-fill")?.style.getPropertyValue("--progress-ratio"),
    ).toBe("0");
    expect(screen.getByRole("button")).not.toHaveClass("is-complete");
  });

  it("keeps a short action face and the full counting instruction as its accessible name", () => {
    render(
      <ZikrCounterSurface
        count={0}
        total={1}
        onTap={() => undefined}
        language="en"
        actionLabel="Finish"
        instructionText="Tap the dhikr or counter to count"
      />,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName("Tap the dhikr or counter to count 0 / 1");
    expect(screen.getByText("Finish")).toHaveClass("counter-action-label");
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
