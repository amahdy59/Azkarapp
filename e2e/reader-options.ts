import { expect, type Locator, type Page } from "@playwright/test";
import { t } from "../src/app/i18n";

/** Narration choices belong to the player, rather than Reader overflow. */
export async function playEnglishTranslation(page: Page) {
  await expect(page.getByRole("menuitem", { name: "Play English translation", exact: true })).toHaveCount(0);
  if (await page.getByRole("menu").count()) await page.keyboard.press("Escape");
  await page.getByTestId("reader-audio-dock-button").click();
  const player = page.getByRole("region", { name: t("en", "audioPlayer.region"), exact: true });
  await player.getByRole("button", { name: t("en", "audioPlayer.expand"), exact: true }).click();
  await player.getByRole("button", { name: "Audio options", exact: true }).click();
  const options = page.getByRole("dialog", { name: "Audio options", exact: true });
  await options.getByTestId("audio-reciter-select").click();
  await page.getByRole("option", { name: "English Translation", exact: true }).click();
  await expect(options.getByTestId("audio-reciter-select")).toContainText("English Translation");
  await page.keyboard.press("Escape");
  await player.getByRole("button", { name: t("en", "audioPlayer.collapse"), exact: true }).click();
}

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
