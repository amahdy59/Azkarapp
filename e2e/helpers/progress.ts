import { expect, type Locator } from "@playwright/test";

export async function chooseProgressOption(control: Locator, value: string) {
  await control.click();
  await control
    .page()
    .getByRole("option")
    .and(control.page().locator(`[data-progress-value="${value}"]`))
    .click();
  await expect(control).toHaveAttribute("data-progress-value", value);
  await expect(control).toBeFocused();
}
