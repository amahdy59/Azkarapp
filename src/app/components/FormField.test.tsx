import { fireEvent, render, screen } from "@testing-library/react";
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

  it("does not let a scroll change a number field's value", () => {
    render(<FormField label="Latitude" type="number" defaultValue="21.4" />);
    const input = screen.getByLabelText("Latitude") as HTMLInputElement;
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.wheel(input, { deltaY: -100 });
    // A wheel over a focused number input increments it. Scrolling a settings
    // page with the pointer over latitude would move the user's location with
    // nothing on screen saying so; dropping focus keeps the scroll harmless.
    expect(document.activeElement).not.toBe(input);
  });

  it("leaves the wheel alone on fields where it was never a hazard", () => {
    render(<FormField label="City" type="text" />);
    const input = screen.getByLabelText("City");
    input.focus();
    fireEvent.wheel(input, { deltaY: -100 });
    expect(document.activeElement).toBe(input);
  });

  it("keeps every raw number input in the app guarded, not just this one", () => {
    // FormField guards its own; this covers the inputs written by hand, which
    // is where the hazard actually lives.
    const files = [
      "src/app/components/CounterTargetPicker.tsx",
      "src/app/components/MushafNavigationModal.tsx",
      "src/app/screens/QuranWirdScreen.tsx",
      "src/app/screens/settings/NotificationsPanel.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const element of source.split("<input").slice(1)) {
        const tag = element.slice(0, element.indexOf("/>"));
        if (!tag.includes('type="number"')) continue;
        expect(tag, `an unguarded number input in ${file}`).toMatch(/onWheel=/);
      }
    }
  });

  it("marks the field itself invalid rather than only reporting it elsewhere", () => {
    render(<FormField label="Latitude" type="number" error="Enter a latitude between -90 and 90." />);
    const input = screen.getByLabelText("Latitude");
    const message = screen.getByText("Enter a latitude between -90 and 90.");

    expect(input).toHaveAttribute("aria-invalid", "true");
    // Tied to the control, so someone tabbing back hears which field is wrong
    // instead of a status line they have to go hunting for.
    expect(input.getAttribute("aria-describedby")).toBe(message.id);
  });

  it("shows the error instead of the hint when both are present", () => {
    render(<FormField label="Latitude" hint="Such as 21.42" error="Out of range" />);
    expect(screen.getByText("Out of range")).toBeInTheDocument();
    expect(screen.queryByText("Such as 21.42")).toBeNull();
  });

  it("gives every text-entry field in the app a title the eye can read", () => {
    // An accessible name is not the same test. These all had `aria-label` plus a
    // placeholder, which passes a screen-reader audit and still leaves the field
    // unnamed on screen — and unnamed entirely once there is a value to check.
    const files = [
      "src/app/screens/auth/RevampedAuthScreens.tsx",
      "src/app/components/MushafNavigationModal.tsx",
      "src/app/screens/settings/NotificationsPanel.tsx",
      "src/app/screens/SearchScreen.tsx",
      "src/app/screens/AzkarLibraryScreen.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      let cursor = 0;
      for (const chunk of source.split("<input").slice(1)) {
        const at = source.indexOf("<input", cursor);
        cursor = at + 1;
        const tag = chunk.slice(0, chunk.indexOf("/>"));
        if (/type="(hidden|checkbox|radio|range)"/.test(tag)) continue;
        const id = tag.match(/id=[{"]([^}"\s]+)/)?.[1];
        const before = source.slice(0, at);
        // A wrapping <label> names its control too, and the prayer-time
        // adjustments use one — visible text, no id needed.
        const wrapped = before.split("<label").length > before.split("</label").length;
        // The id may be a literal or a JSX expression; both bind a label.
        const byId =
          Boolean(id) &&
          (source.includes(`htmlFor="${id}"`) || source.includes(`htmlFor={${id}}`) || source.includes("htmlFor={`"));
        expect(byId || wrapped || /aria-labelledby/.test(tag), `unlabelled input in ${file}: ${tag.slice(0, 80)}`).toBe(
          true,
        );
      }
    }
  });

  it("uses one label style, not three", () => {
    for (const file of [
      "src/app/screens/SearchScreen.tsx",
      "src/app/screens/AzkarLibraryScreen.tsx",
      "src/app/components/MushafNavigationModal.tsx",
      "src/app/screens/auth/RevampedAuthScreens.tsx",
    ]) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} should take the shared label class`).toContain("FIELD_LABEL_CLASS");
    }
  });
});
