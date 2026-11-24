import { expect, type Page } from "@playwright/test";

export async function openDownloadManagement(page: Page) {
  const management = page.getByTestId("download-management");
  if (!(await management.evaluate((node) => (node as HTMLDetailsElement).open)))
    await management.locator(":scope > summary").click();
  await expect(page.getByTestId("download-category-adhkar")).toBeVisible();
}

export async function openDownloadSelection(page: Page) {
  const selection = page.getByTestId("download-selection");
  await expect(page.getByTestId("download-overview-action")).toBeEnabled();
  if (!(await selection.evaluate((node) => (node as HTMLDetailsElement).open)))
    await selection.locator(":scope > summary").click();
}
