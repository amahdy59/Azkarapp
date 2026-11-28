import { expect, type Locator, type Page } from "@playwright/test";
import { t } from "../../src/app/i18n";
import { dashboardText } from "../../src/app/i18n/progressDashboard";

export async function openProgressExport(page: Page, language: "ar" | "en") {
  await page.goto("/#/settings/account-data");
  await page.getByRole("button", { name: t(language, "accountData.exportAction"), exact: true }).click();
  const menu = page.getByTestId("settings-export-menu");
  await expect(menu).toBeVisible();
  return menu;
}

export async function chooseProgressDetail(page: Page, topic: "prayers" | "routines" | "friday" | "zikr") {
  await page.getByTestId("progress-tab-trends").click();
  await chooseProgressOption(page.getByRole("combobox", { name: /Show trend for|عرض اتجاه/ }), topic);
}

export async function openPrayerBreakdown(page: Page, language: "ar" | "en") {
  const region = page.getByRole("region", {
    name: dashboardText(language, "perPrayer"),
    exact: true,
    includeHidden: true,
  });
  const disclosure = page.locator(".progress-screen details").filter({
    has: page.locator(":scope > summary").filter({ hasText: dashboardText(language, "perPrayer") }),
  });
  await expect(disclosure.locator(":scope > summary")).toBeVisible();
  if (!(await disclosure.evaluate((node) => (node as HTMLDetailsElement).open)))
    await disclosure.locator(":scope > summary").click();
  await expect(region).toBeVisible();
  return region;
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
  const opensDateEditor = value === "custom" || value === "editDates";
  const filters = control.page().getByTestId("progress-filters-toggle");
  if (!(await control.isVisible()) && (await filters.isVisible())) await filters.click();
  await control.waitFor({ state: "attached" });
  const disclosure = control.page().getByTestId("progress-range-disclosure");
  if (!(await control.isVisible()) && (await disclosure.count())) await disclosure.locator("summary").click();
  if (!(await control.isVisible()) && (await control.page().getByTestId("progress-filters-toggle").isVisible()))
    await control.page().getByTestId("progress-filters-toggle").click();
  const id = await control.getAttribute("id");
  const previousValue = await control.getAttribute("data-progress-value");
  const inFilterSheet = await control.evaluate((node) =>
    Boolean(node.closest('[data-testid="progress-filter-sheet"]')),
  );
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
    !opensDateEditor &&
    (await control.page().getByTestId("progress-filter-sheet").isVisible())
  )
    await control.page().keyboard.press("Escape");
  if (inFilterSheet && !opensDateEditor) {
    // Applying a preset closes this owner. Wait for its exit before querying
    // the now-unmounted combobox or starting another filter interaction.
    await expect(control.page().getByTestId("progress-filter-sheet")).toBeHidden();
    await expect(filters).toHaveAttribute("data-progress-value", value);
    await expect(filters).toBeFocused();
    return;
  }
  const applied = id ? control.page().locator(`[id="${id}"]`) : control;
  if (await applied.isVisible()) await expect(applied).toHaveAttribute("data-progress-value", value);
  else await expect(filters).toHaveAttribute("data-progress-value", value);
  await expectProgressFilterFocus(applied);
}
