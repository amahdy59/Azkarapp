import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReaderOptionsAction, ReaderOptionsContext, ReaderOptionsSection } from "./ReaderOptions";

describe("Reader sheet actions", () => {
  it("closes before invoking a native action and preserves disabled actions", () => {
    const order: string[] = [];
    const disabled = vi.fn();
    render(
      <ReaderOptionsContext.Provider value={{ sheet: true, close: () => order.push("close") }}>
        <ReaderOptionsAction onClick={() => order.push("action")} data-testid="save">
          Save
        </ReaderOptionsAction>
        <ReaderOptionsAction disabled onClick={disabled}>
          Unavailable
        </ReaderOptionsAction>
        <ReaderOptionsAction keepOpen onClick={() => order.push("sound")}>
          Counter sound
        </ReaderOptionsAction>
      </ReaderOptionsContext.Provider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(order).toEqual(["close", "action"]);
    expect(screen.getByTestId("save")).toHaveAttribute("type", "button");
    fireEvent.click(screen.getByRole("button", { name: "Unavailable" }));
    expect(disabled).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Counter sound" }));
    expect(order).toEqual(["close", "action", "sound"]);
  });

  it("uses a native collapsed disclosure for secondary controls", () => {
    const { container } = render(
      <ReaderOptionsContext.Provider value={{ sheet: true, close: () => {} }}>
        <ReaderOptionsSection title="Counter settings">
          <ReaderOptionsAction>Reset counter</ReaderOptionsAction>
        </ReaderOptionsSection>
      </ReaderOptionsContext.Provider>,
    );
    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(container.querySelector("summary")).toHaveTextContent("Counter settings");
  });
});
