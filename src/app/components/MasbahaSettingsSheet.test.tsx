import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MasbahaSettingsSheet } from "./MasbahaSettingsSheet";

const feedback = { sound: true, haptics: true, vibrationAvailable: true };
it("stages direct presets and custom digits until Save, with an inline invalid-target explanation", async () => {
  const apply = vi.fn(),
    close = vi.fn();
  render(
    <MasbahaSettingsSheet
      target={100}
      language="en"
      direction="ltr"
      textSize="medium"
      feedback={feedback}
      onApply={apply}
      onClose={close}
    />,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: "33", exact: true }));
  const input = screen.getByRole("textbox", { name: "Target:" });
  expect(input).toHaveValue("33");
  expect(apply).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "100001" } });
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("Enter a whole number from 1 to 100,000.");
  expect(screen.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  fireEvent.submit(input.closest("form")!);
  expect(apply).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "٥٥" } });
  await user.click(screen.getByRole("button", { name: "Save", exact: true }));
  expect(apply).toHaveBeenCalledWith(55, expect.objectContaining({ sound: true, haptics: true }), "medium");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledOnce();
});

it("stages sound, vibration and typography together and uses real switch semantics", async () => {
  const apply = vi.fn();
  render(
    <MasbahaSettingsSheet
      target={100}
      language="en"
      direction="ltr"
      textSize="medium"
      feedback={feedback}
      onClose={vi.fn()}
      onApply={apply}
    />,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("switch", { name: "Counter sound" }));
  await user.click(screen.getByRole("switch", { name: "Vibrate when counting" }));
  expect(apply).not.toHaveBeenCalled();
  await user.click(screen.getByText("More options", { selector: "summary" }));
  await user.click(screen.getByRole("radio", { name: "Large" }));
  await user.click(screen.getByRole("button", { name: "Save", exact: true }));
  expect(apply).toHaveBeenCalledWith(100, expect.objectContaining({ sound: false, haptics: false }), "large");
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});

it("explains unavailable vibration without allowing a misleading change", () => {
  render(
    <MasbahaSettingsSheet
      target={100}
      language="en"
      direction="ltr"
      textSize="medium"
      feedback={{ ...feedback, vibrationAvailable: false }}
      onClose={vi.fn()}
      onApply={vi.fn()}
    />,
  );
  expect(screen.getByRole("switch", { name: "Vibrate when counting" })).toBeDisabled();
  expect(screen.getByText("Vibration is unavailable on this device or browser.")).toBeVisible();
});
