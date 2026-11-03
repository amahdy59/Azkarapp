import { expect, type Locator, type Page } from "@playwright/test";
import { t } from "../../src/app/i18n";

export async function openProgressExport(page: Page, language: "ar" | "en") {
  await page.goto("/#/settings/account-data");
  await page.getByRole("button", { name: t(language, "accountData.exportAction"), exact: true }).click();
  const menu = page.getByTestId("settings-export-menu");
  await expect(menu).toBeVisible();
  return menu;
}

export async function chooseProgressDetail(page: Page, topic: "prayers" | "routines" | "friday" | "reflection") {
  await chooseProgressOption(page.getByRole("combobox", { name: /Explore details|استكشاف التفاصيل/ }), topic);
}

export async function expectProgressFilterFocus(control: Locator) {
  const editor = control.page().getByTestId("progress-date-sheet");
  if (await editor.isVisible()) {
    await expect.poll(() => editor.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    return;
  }
  const filters = control.page().getByTestId("progress-filters-toggle");
  if (!(await control.isVisible()) && (await filters.isVisible())) {
    await expect(filters).toBeFocused();
    return;
  }
  const disclosure = control.page().getByTestId("progress-range-disclosure");
  const inRange = await control.evaluate((node) => Boolean(node.closest('[data-testid="progress-range-disclosure"]')));
  if (inRange && !(await disclosure.evaluate((node) => (node as HTMLDetailsElement).open))) {
    if ((await disclosure.count()) && (await control.getAttribute("data-progress-value")) === "custom")
      await expect(control.page().getByRole("button", { name: /Choose dates:|اختيار التواريخ:/ })).toBeFocused();
    else await expect(disclosure.locator("summary")).toBeFocused();
  } else await expect(control).toBeFocused();
}

export async function chooseProgressOption(control: Locator, value: string) {
  const filters = control.page().getByTestId("progress-filters-toggle");
  if (!(await control.isVisible()) && (await filters.isVisible())) await filters.click();
  await control.waitFor({ state: "attached" });
  const disclosure = control.page().getByTestId("progress-range-disclosure");
  if (!(await control.isVisible()) && (await disclosure.count())) await disclosure.locator("summary").click();
  if (!(await control.isVisible()) && (await control.page().getByTestId("progress-filters-toggle").isVisible()))
    await control.page().getByTestId("progress-filters-toggle").click();
  const id = await control.getAttribute("id");
  const previousValue = await control.getAttribute("data-progress-value");
  await control.click();
  await control
    .page()
    .getByRole("option")
    .and(control.page().locator(`[data-progress-value="${value}"]`))
    .click();
  // Radix does not emit value-change for reselecting the applied preset.
  // Dismiss that unchanged editor through its real keyboard recovery path.
  if (
    previousValue === value &&
    value !== "custom" &&
    (await control.page().getByTestId("progress-filter-sheet").isVisible())
  )
    await control.page().keyboard.press("Escape");
  const applied = id ? control.page().locator(`[id="${id}"]`) : control;
  if (await applied.isVisible()) await expect(applied).toHaveAttribute("data-progress-value", value);
  else await expect(filters).toHaveAttribute("data-progress-value", value);
  await expectProgressFilterFocus(applied);
}
