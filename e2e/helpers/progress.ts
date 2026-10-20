import { expect, type Locator } from "@playwright/test";

export async function expectProgressFilterFocus(control: Locator) {
  const disclosure = control.page().getByTestId("progress-range-disclosure");
  const inRange = await control.evaluate((node) => Boolean(node.closest('[data-testid="progress-range-disclosure"]')));
  if (inRange && !(await disclosure.evaluate((node) => (node as HTMLDetailsElement).open))) {
    await expect(disclosure.locator("summary")).toBeFocused();
  } else await expect(control).toBeFocused();
}

export async function chooseProgressOption(control: Locator, value: string) {
  const disclosure = control.page().getByTestId("progress-range-disclosure");
  if (!(await control.isVisible()) && (await disclosure.count())) await disclosure.locator("summary").click();
  const id = await control.getAttribute("id");
  await control.click();
  await control
    .page()
    .getByRole("option")
    .and(control.page().locator(`[data-progress-value="${value}"]`))
    .click();
  const applied = id ? control.page().locator(`[id="${id}"]`) : control;
  await expect(applied).toHaveAttribute("data-progress-value", value);
  await expectProgressFilterFocus(applied);
}
