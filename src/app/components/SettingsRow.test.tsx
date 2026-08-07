import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsRowItem, SettingsSelectRow, SettingsToggleRow } from "./SettingsRow";

describe("SettingsRowItem", () => {
  it("renders as a button and fires onPress", () => {
    const onPress = vi.fn();
    render(<SettingsRowItem icon={<span aria-hidden="true">*</span>} label="Notifications" onPress={onPress} />);

    const button = screen.getByRole("button", { name: "Notifications" });
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders as static content when no onPress is given", () => {
    render(<SettingsRowItem icon={<span aria-hidden="true">*</span>} label="Version 1.0" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Version 1.0")).toBeInTheDocument();
  });
});

describe("SettingsSelectRow", () => {
  it("labels the trigger with the row label and shows the current value", () => {
    render(
      <SettingsSelectRow
        icon={<span aria-hidden="true">*</span>}
        label="Language"
        selectedValue="en"
        value="English"
        options={[
          { value: "en", label: "English" },
          { value: "ar", label: "Arabic" },
        ]}
        onChange={vi.fn()}
        direction="ltr"
      />,
    );

    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getAllByText("English").length).toBeGreaterThan(0);
    expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();
  });
});

describe("SettingsToggleRow", () => {
  it("exposes switch semantics and toggles on click", () => {
    const onChange = vi.fn();
    render(
      <SettingsToggleRow
        icon={<span aria-hidden="true">*</span>}
        label="Reduce motion"
        checked={false}
        onChange={onChange}
      />,
    );

    const toggle = screen.getByRole("switch", { name: "Reduce motion" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("reflects the checked state and renders an optional description", () => {
    render(
      <SettingsToggleRow
        icon={<span aria-hidden="true">*</span>}
        label="High contrast"
        description="Increases text and border contrast"
        checked
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("switch", { name: /High contrast/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Increases text and border contrast")).toBeInTheDocument();
  });
});
