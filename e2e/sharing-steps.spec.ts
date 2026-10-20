import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { t } from "../src/app/i18n";
import { sharingStep } from "./helpers/sharing";

for (const language of ["ar", "en"] as const) {
  test(`sharing steps retain choices, clear dropdowns and a live preview in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
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
    await page.goto("/#/azkar/morning/8");
    const opener = page.getByTestId("reader-share-dock-button");
    await opener.click();
    const modal = page.getByTestId("collection-share-modal");
    const preview = modal.getByTestId("sharing-preview").getByRole("img");
    await expect(preview).toBeVisible();
    await expect(modal.getByRole("button", { name: t(language, "shareStudio.save"), exact: true })).toHaveCount(0);
    const preset = modal.getByRole("combobox", { name: t(language, "shareStudio.preset"), exact: true });
    const scroll = modal.getByTestId("sharing-scroll");
    expect(await scroll.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
    const initial = await preview.getAttribute("src");
    await preset.press("Enter");
    await page.getByRole("option", { name: t(language, "shareStudio.presettranslated"), exact: true }).click();
    await expect(preview).not.toHaveAttribute("src", initial!);
    await modal.getByRole("button", { name: t(language, "shareStudio.nextStep"), exact: true }).click();
    await expect(
      modal.getByRole("heading", { name: t(language, "shareStudio.stepdesign"), exact: true }),
    ).toBeFocused();
    expect(await scroll.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
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
        await page.screenshot({ path: testInfo.outputPath(`sharing-${language}-${viewport.width}-${step}.png`) });
        expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
        if (viewport.width === 390) {
          // The owner now prioritizes a larger preview and stable full-screen
          // chrome. Complete collection settings may scroll inside that frame.
          expect((await modal.boundingBox())!.height).toBeCloseTo(viewport.height, 1);
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
