import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { t } from "../src/app/i18n";
import { sharingSingleContent, sharingStep } from "./helpers/sharing";

async function expectSettingsReachable(modal: Locator) {
  const body = modal.getByTestId("sharing-scroll");
  const footer = modal.getByTestId("sharing-actions");
  expect(await body.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  for (const field of await modal.getByTestId("sharing-settings").getByRole("combobox").all()) {
    await field.focus();
    await expect(field).toBeInViewport({ ratio: 1 });
    const bounds = (await field.boundingBox())!;
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.y).toBeGreaterThanOrEqual((await body.boundingBox())!.y - 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual((await footer.boundingBox())!.y + 1);
  }
}

async function seedSharing(page: Page, language: "ar" | "en") {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, reduceMotion: true, themeMode: "midnight" },
        profile: { isGuest: true },
      }),
    );
  }, language);
}

for (const language of ["ar", "en"] as const) {
  test(`sharing steps retain choices, clear dropdowns and a live preview in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await seedSharing(page, language);
    await page.goto("/#/azkar/morning/8");
    const opener = page.getByTestId("reader-share-dock-button");
    await opener.click();
    const modal = page.getByTestId("collection-share-modal");
    const preview = modal.getByTestId("sharing-preview").getByRole("img");
    await expect(preview).toBeVisible();
    await sharingSingleContent(modal);
    await expect(modal.getByRole("button", { name: t(language, "shareStudio.save"), exact: true })).toHaveCount(0);
    const preset = modal.getByRole("combobox", { name: t(language, "shareStudio.preset"), exact: true });
    // Explicit custom content uses the approved bounded scrolling frame.
    // Every field must be reachable above its fixed actions, including keyboard entry.
    await expectSettingsReachable(modal);
    const initial = await preview.getAttribute("src");
    await preset.press("Enter");
    await page.getByRole("option", { name: t(language, "shareStudio.presettranslated"), exact: true }).click();
    await expect(preview).not.toHaveAttribute("src", initial!);
    await modal.getByRole("button", { name: t(language, "shareStudio.nextStep"), exact: true }).click();
    await expect(
      modal.getByRole("heading", { name: t(language, "shareStudio.stepdesign"), exact: true }),
    ).toBeFocused();
    await expectSettingsReachable(modal);
    const format = modal.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true });
    await expect(format).toHaveAttribute("aria-haspopup", "listbox");
    const affordance = await format.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const arrow = element.querySelector("svg:last-child")!.getBoundingClientRect();
      return {
        width: box.width,
        height: box.height,
        radius: parseFloat(getComputedStyle(element).borderRadius),
        arrow: arrow.width,
      };
    });
    expect(affordance.width).toBeGreaterThan(affordance.height * 2);
    expect(affordance.radius).toBeLessThan(affordance.height / 2);
    expect(affordance.arrow).toBeGreaterThanOrEqual(20);
    await format.press("Enter");
    await expect(modal.getByTestId("share-format-select").locator('[role="combobox"]')).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await page.getByRole("option", { name: t(language, "shareStudio.square"), exact: true }).click();
    await expect(format).toBeFocused();
    await expect(preview).toHaveAttribute("height", "1080");
    await page.screenshot({ path: testInfo.outputPath(`sharing-design-${language}.png`) });
    await modal.getByRole("button", { name: t(language, "shareStudio.previousStep"), exact: true }).click();
    await expect(preset).toContainText(t(language, "shareStudio.presettranslated"));
    await sharingStep(modal, "share");
    const save = modal.getByRole("button", { name: t(language, "shareStudio.save"), exact: true });
    await expect(save).toBeEnabled();
    await modal.getByText(t(language, "shareStudio.readCard"), { exact: true }).click();
    await expect(modal.getByText(t(language, "shareStudio.translation"), { exact: true }).first()).toBeVisible();
    const download = page.waitForEvent("download");
    await save.click();
    const saved = await download;
    expect(saved.suggestedFilename()).toMatch(/square.*\.png$/u);
    expect([...(await readFile((await saved.path())!)).subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    for (const step of ["content", "design", "share"] as const) {
      await sharingStep(modal, step);
      expect(await modal.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-testid="collection-share-modal"]')
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });

  test(`sharing steps keep collection settings reachable in ${language} @cross-browser`, async ({ page }, testInfo) => {
    await seedSharing(page, language);
    const modal = page.getByTestId("collection-share-modal");
    const preview = modal.getByTestId("sharing-preview").getByRole("img");
    const scroll = modal.getByTestId("sharing-scroll");
    await page.goto("/#/azkar/morning");
    await page.getByTestId("share-collection-button").click();
    await expect(preview.first()).toBeVisible();
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 320, height: 700 },
    ]) {
      await page.setViewportSize(viewport);
      for (const step of ["content", "design", "share"] as const) {
        await sharingStep(modal, step);
        const bounds = await scroll.evaluate((node) => ({
          scroll: node.scrollHeight,
          height: node.clientHeight,
          width: node.clientWidth,
          scrollWidth: node.scrollWidth,
        }));
        await testInfo.attach(`scroll-${language}-${viewport.width}-${step}.json`, {
          body: JSON.stringify(bounds),
          contentType: "application/json",
        });
        expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
        if (viewport.width === 390) {
          // The later bounded-modal approval reserves physical edge gutters.
          // Keep an exact height check plus both visible recovery margins.
          const box = (await modal.boundingBox())!;
          expect(box.height).toBeCloseTo(Math.min(768, viewport.height - 32), 1);
          expect(box.y).toBeGreaterThanOrEqual(16);
          expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 16);
          const fields = modal.getByTestId("sharing-settings").getByRole("combobox");
          for (const field of await fields.all()) {
            await field.focus();
            await expect(field).toBeInViewport();
            const fieldBounds = (await field.boundingBox())!;
            const footer = (await modal.getByTestId("sharing-actions").boundingBox())!;
            expect(fieldBounds.y + fieldBounds.height).toBeLessThanOrEqual(footer.y + 1);
          }
        }
        await page.screenshot({ path: testInfo.outputPath(`sharing-${language}-${viewport.width}-${step}.png`) });
      }
    }
  });
}
