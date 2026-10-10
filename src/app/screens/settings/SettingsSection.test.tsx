import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsSection, SubHeader } from "./SettingsPrimitives";

describe("SubHeader focus", () => {
  it("focuses the newly mounted panel after an outgoing header is removed", async () => {
    const { rerender } = render(<SubHeader key="old" title="Previous panel" onBack={() => undefined} />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Previous panel" })).toHaveFocus());
    rerender(<div>Outgoing panel</div>);
    rerender(<SubHeader key="new" title="Reading & Typography" onBack={() => undefined} />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Reading & Typography" })).toHaveFocus());
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
