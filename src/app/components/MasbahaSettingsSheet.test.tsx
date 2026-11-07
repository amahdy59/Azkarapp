import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MasbahaSettingsSheet } from "./MasbahaSettingsSheet";
import { AUTHENTIC_AZKAR_COLLECTION } from "../content/authenticAzkar";

it("stages target changes until Apply and rejects invalid custom goals", async () => {
  const apply = vi.fn(),
    close = vi.fn();
  render(
    <MasbahaSettingsSheet
      items={AUTHENTIC_AZKAR_COLLECTION}
      selected={AUTHENTIC_AZKAR_COLLECTION[0]!}
      target={100}
      savedItems={{}}
      language="en"
      direction="ltr"
      onApply={apply}
      onClose={close}
    />,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: "33", exact: true }));
  expect(apply).not.toHaveBeenCalled();
  await user.click(screen.getByRole("radio", { name: "Custom", exact: true }));
  const input = screen.getByRole("spinbutton");
  fireEvent.change(input, { target: { value: "100001" } });
  await user.click(screen.getByRole("button", { name: "Apply settings" }));
  expect(apply).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "55" } });
  await user.click(screen.getByRole("button", { name: "Apply settings" }));
  expect(apply).toHaveBeenCalledWith(AUTHENTIC_AZKAR_COLLECTION[0], 55);
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledOnce();
});
