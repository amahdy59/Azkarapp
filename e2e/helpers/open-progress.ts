import { expect, type Page } from "@playwright/test";

/** Follow the available navigation tier without bypassing compact discovery. */
export async function openProgress(page: Page) {
  const direct = page.getByTestId("nav-progress");
  if (await direct.isVisible()) {
    await direct.click();
  } else {
    await page.getByTestId("nav-home").click();
    const path = page
      .getByTestId("home-header-routine-summary-mobile")
      .or(page.getByTestId("home-header-routine-summary"));
    await path.filter({ visible: true }).click();
    await page.getByTestId("todays-path-sheet").getByTestId("path-view-progress").click();
  }
  await expect(page.getByTestId("progress-filters-toggle")).toBeVisible();
}
