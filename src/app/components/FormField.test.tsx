import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("names the control with a label the eye can also read", () => {
    render(<FormField label="Latitude" type="number" defaultValue="21.4" />);
    const input = screen.getByLabelText("Latitude");
    expect(input).toBeInTheDocument();
    // The name has to survive on screen once there is a value — the failure a
    // placeholder-as-label has, and the reason these fields moved here.
    expect(screen.getByText("Latitude").tagName).toBe("LABEL");
  });

  it("gives each field its own id so two of them do not collide", () => {
    render(
      <>
        <FormField label="Latitude" />
        <FormField label="Longitude" />
      </>,
    );
    const first = screen.getByLabelText("Latitude");
    const second = screen.getByLabelText("Longitude");
    expect(first.id).not.toBe(second.id);
  });

  it("announces a hint with the control rather than beside it", () => {
    render(<FormField label="Time zone" hint="Such as Africa/Cairo" />);
    const input = screen.getByLabelText("Time zone");
    const hint = screen.getByText("Such as Africa/Cairo");
    expect(input.getAttribute("aria-describedby")).toBe(hint.id);
  });

  it("leaves no manual-location field labelled only by its placeholder", () => {
    const panel = readFileSync("src/app/screens/settings/NotificationsPanel.tsx", "utf8");
    // A placeholder is a hint. Where one stood in for the label, an `aria-label`
    // was carrying the name invisibly; both patterns are gone from this block.
    expect(panel).not.toMatch(
      /aria-label=\{t\(language, "notifications\.(cityName|latitude|longitude|timeZoneLabel)"\)\}/,
    );
  });
});
