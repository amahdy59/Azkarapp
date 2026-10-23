import { expect, type Locator, type Page } from "@playwright/test";

export async function chooseProgressDetail(page: Page, topic: "prayers" | "routines" | "friday" | "reflection") {
  await chooseProgressOption(page.getByRole("combobox", { name: /Explore details|استكشاف التفاصيل/ }), topic);
}

export async function expectProgressFilterFocus(control: Locator) {
  const editor = control.page().getByTestId("progress-date-sheet");
  if (await editor.isVisible()) {
    await expect.poll(() => editor.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    return;
  }
  const disclosure = control.page().getByTestId("progress-range-disclosure");
  const inRange = await control.evaluate((node) => Boolean(node.closest('[data-testid="progress-range-disclosure"]')));
  if (inRange && !(await disclosure.evaluate((node) => (node as HTMLDetailsElement).open))) {
    if ((await control.getAttribute("data-progress-value")) === "custom")
      await expect(control.page().getByRole("button", { name: /Choose dates:|اختيار التواريخ:/ })).toBeFocused();
    else await expect(disclosure.locator("summary")).toBeFocused();
  } else await expect(control).toBeFocused();
}

export async function chooseProgressOption(control: Locator, value: string) {
  await control.waitFor({ state: "attached" });
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
