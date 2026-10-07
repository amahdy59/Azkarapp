import { expect, type Locator, type Page } from "@playwright/test";

export function readerOption(page: Page, name: string | RegExp) {
  return page
    .getByRole("menuitem", { name, exact: true })
    .or(page.getByTestId("reader-options-sheet").getByRole("button", { name, exact: true, includeHidden: true }));
}

export async function revealReaderOption(option: Locator) {
  if (!(await option.isVisible())) {
    const section = option.locator("xpath=ancestor::details");
    await section.locator("summary").click();
  }
  await expect(option).toBeVisible();
}

export async function clickReaderOption(page: Page, name: string | RegExp) {
  const option = readerOption(page, name);
  await revealReaderOption(option);
  await option.click();
}
