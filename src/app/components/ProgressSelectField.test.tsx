import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./icons";
import { ProgressSelectField } from "./ProgressSelectField";

function pointer(target: EventTarget, type: string, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  fireEvent(target, event);
}

describe("ProgressSelectField input ownership", () => {
  it("keeps the keyboard option through stationary hover, then accepts an intentional pointer handoff", async () => {
    const onChange = vi.fn();
    render(
      <ProgressSelectField
        label="Period"
        value="month"
        options={[
          { value: "day", label: "Day" },
          { value: "month", label: "Month" },
        ]}
        onChange={onChange}
        language="en"
        icon={Calendar}
      />,
    );
    pointer(document, "pointermove", 160, 243);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });
    const month = await screen.findByRole("option", { name: "Month" });
    const day = screen.getByRole("option", { name: "Day" });
    await waitFor(() => expect(month).toHaveFocus());
    pointer(day, "pointermove", 160, 243);
    expect(month).toHaveFocus();
    pointer(month, "pointerout", 160, 243);
    expect(month).toHaveFocus();
    pointer(day, "pointermove", 161, 243);
    expect(day).toHaveFocus();
    fireEvent.keyDown(day, { key: "Enter" });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("day");
  });
});
