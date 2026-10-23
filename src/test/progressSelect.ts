import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function chooseProgressOption(control: HTMLElement, value: string) {
  const user = userEvent.setup();
  await user.click(control);
  const option = screen.getAllByRole("option").find((node) => node.dataset.progressValue === value);
  if (!option) throw new Error(`Missing Progress option: ${value}`);
  await user.click(option);
}
