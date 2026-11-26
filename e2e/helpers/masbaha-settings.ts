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
  const presets = sheet.getByRole("radiogroup", { name: t(language, "counter.targetPresets"), exact: true });
  await expect(presets.getByRole("radio")).toHaveCount(4);
  for (const choice of await presets.getByRole("radio").all()) {
    expect(await choice.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    expect((await choice.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(sheet.getByRole("switch")).toHaveCount(2);
  await expect(sheet.getByRole("checkbox")).toHaveCount(0);
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

export async function checkMasbahaDhikr(page: Page, language: "ar" | "en") {
  const trigger = page.getByTestId("counter-zikr-filter");
  const before = await page.getByTestId("custom-counter-surface").getAttribute("aria-label");
  await trigger.click();
  const sheet = page.getByTestId("masbaha-dhikr-sheet");
  await expect(sheet).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  const bounds = (await sheet.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  expect(await sheet.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  expect(
    await sheet.evaluate((node) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = getComputedStyle(node).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      const r = node.getBoundingClientRect();
      return (
        ctx.getImageData(0, 0, 1, 1).data[3] === 255 &&
        node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
      );
    }),
  ).toBe(true);
  const choices = sheet.getByRole("radio");
  for (const choice of await choices.all()) {
    expect((await choice.boundingBox())!.height).toBeGreaterThanOrEqual(64);
    expect(await choice.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  }
  await choices.first().focus();
  await page.keyboard.press("End");
  await expect(choices.last()).toBeFocused();
  await expect(choices.last()).toBeInViewport();
  // Search and confirmation stay separate from the scrolling options.
  await expect(sheet.getByRole("searchbox", { name: t(language, "counter.searchLabel"), exact: true })).toBeInViewport({
    ratio: 1,
  });
  await expect(sheet.getByRole("button", { name: t(language, "common.continue"), exact: true })).toBeInViewport({
    ratio: 1,
  });
  expect((await new AxeBuilder({ page }).include('[data-testid="masbaha-dhikr-sheet"]').analyze()).violations).toEqual(
    [],
  );
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("custom-counter-surface")).toHaveAttribute("aria-label", before!);
}
