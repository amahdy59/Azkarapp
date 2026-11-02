import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useReadingFocusIndicator } from "./useReadingFocusIndicator";

function ReadingRegion() {
  const ref = useReadingFocusIndicator();
  return (
    <>
      <button>Before</button>
      {/* Native scroll regions need keyboard entry, matching the production reading viewport. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div ref={ref} tabIndex={0} role="region" aria-label="Reading" />
      <button>After</button>
    </>
  );
}

describe("reading focus intent", () => {
  it("indicates forward/reverse Tab entry and clears on exit without blocking scrolling", async () => {
    const user = userEvent.setup();
    render(<ReadingRegion />);
    const region = screen.getByRole("region");
    await user.tab();
    await user.tab();
    expect(region).toHaveFocus();
    expect(region).toHaveAttribute("data-reading-keyboard-focus");
    expect(fireEvent.keyDown(region, { key: "PageDown" })).toBe(true);
    expect(region).toHaveAttribute("data-reading-keyboard-focus");
    await user.tab();
    expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
    await user.tab({ shift: true });
    expect(region).toHaveFocus();
    expect(region).toHaveAttribute("data-reading-keyboard-focus");
  });

  it.each([" ", "AudioVolumeUp", "AudioVolumeDown", "AudioVolumeMute", "VolumeUp"])(
    "does not leave a boundary for %s or consume the native/shortcut event",
    async (key) => {
      const user = userEvent.setup();
      render(<ReadingRegion />);
      const region = screen.getByRole("region");
      await user.tab();
      await user.tab();
      expect(fireEvent.keyDown(region, { key })).toBe(true);
      expect(region).toHaveFocus();
      expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
      region.blur();
      region.focus();
      expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
    },
  );

  it("does not inherit Tab intent from another control or a pointer interaction", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ReadingRegion />);
    const region = screen.getByRole("region");
    await user.tab();
    region.focus();
    expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
    await user.tab();
    await user.tab({ shift: true });
    fireEvent.pointerDown(region);
    expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
    await user.tab();
    await user.tab({ shift: true });
    fireEvent.blur(window);
    expect(region).not.toHaveAttribute("data-reading-keyboard-focus");
    unmount();
    expect(fireEvent.keyDown(document, { key: "Tab" })).toBe(true);
  });
});
