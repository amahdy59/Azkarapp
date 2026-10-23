import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsSection, SubHeader } from "./SettingsPrimitives";

describe("SubHeader focus", () => {
  afterEach(() => vi.restoreAllMocks());
  it("focuses the newly mounted panel after an outgoing header is removed", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      frames.delete(id);
    });
    const flushFrame = () =>
      act(() => {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((callback) => callback(0));
      });
    const { rerender } = render(<SubHeader key="old" title="Previous panel" onBack={() => undefined} />);
    flushFrame();
    expect(screen.getByRole("heading", { name: "Previous panel" })).toHaveFocus();
    rerender(<div>Outgoing panel</div>);
    rerender(<SubHeader key="new" title="Reading & Typography" onBack={() => undefined} />);
    flushFrame();
    expect(screen.getByRole("heading", { name: "Reading & Typography" })).toHaveFocus();
  });
});

describe("SettingsSection", () => {
  it("renders a label heading when provided", () => {
    render(
      <SettingsSection label="Preferences">
        <p>Row content</p>
      </SettingsSection>,
    );

    expect(screen.getByRole("heading", { name: "Preferences" })).toBeInTheDocument();
    expect(screen.getByText("Row content")).toBeInTheDocument();
  });

  it("renders without a label when omitted", () => {
    render(
      <SettingsSection>
        <p>Row content</p>
      </SettingsSection>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("clips children with overflow-hidden in the default rows variant", () => {
    render(
      <SettingsSection>
        <p>Row content</p>
      </SettingsSection>,
    );

    expect(screen.getByText("Row content").parentElement).toHaveClass("overflow-hidden");
  });

  it("pads the card and does not clip in the content variant", () => {
    render(
      <SettingsSection variant="content">
        <p>Custom content</p>
      </SettingsSection>,
    );

    const card = screen.getByText("Custom content").parentElement;
    expect(card).toHaveClass("p-4.5");
    expect(card).not.toHaveClass("overflow-hidden");
  });
});
