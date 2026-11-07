import { AUTHENTIC_AZKAR_COLLECTION } from "../../src/app/content/authenticAzkar";
import { formatNumerals } from "../../src/app/formatting";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { t } from "../../src/app/i18n";

export async function openMasbahaSettings(page: Page) {
  const trigger = page.getByTestId("masbaha-settings-trigger");
  await trigger.click();
  const sheet = page.getByTestId("masbaha-settings-sheet");
  await expect(sheet).toBeVisible();
  return sheet;
}

export async function checkMasbahaSettings(page: Page, language: "ar" | "en") {
  const trigger = page.getByTestId("masbaha-settings-trigger");
  const before = await page.getByTestId("custom-counter-surface").getAttribute("aria-label");
  const sheet = await openMasbahaSettings(page);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(sheet.getByRole("radio", { name: formatNumerals(33, language), exact: true })).toBeVisible();
  await sheet.locator("summary").click();
  const dhikr = sheet.getByRole("group", { name: t(language, "counter.chooseDhikr"), exact: true });
  const radios = dhikr.getByRole("radio");
  await expect(radios).toHaveCount(AUTHENTIC_AZKAR_COLLECTION.length);
  const longChoice = AUTHENTIC_AZKAR_COLLECTION[2]!;
  await expect(radios.nth(2).locator("..")).toContainText(language === "ar" ? longChoice.textAr : longChoice.textEn);
  for (const radio of await radios.all()) {
    const label = radio.locator("..");
    expect(await label.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    expect((await label.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await sheet.locator("summary").click();
  const bounds = (await sheet.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  expect(await sheet.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  expect(
    await sheet.evaluate((node) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = getComputedStyle(node).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      const rect = node.getBoundingClientRect();
      return {
        alpha: context.getImageData(0, 0, 1, 1).data[3],
        ownsCenter: node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)),
      };
    }),
  ).toEqual({ alpha: 255, ownsCenter: true });
  expect(
    (await new AxeBuilder({ page }).include('[data-testid="masbaha-settings-sheet"]').analyze()).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("custom-counter-surface")).toHaveAttribute("aria-label", before!);
}
