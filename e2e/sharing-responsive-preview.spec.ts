import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 320, 834, 1280]) {
    test(`Home sharing preview has no letterbox and full-width phone fields in ${language} at ${width}px @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: width === 320 ? 700 : 900 });
      await fixtureReminderCatalogue(page);
      await page.clock.setFixedTime(new Date("2026-10-19T13:00:00+03:00"));
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      await page.getByTestId("daily-evidence-share").click();
      const modal = page.getByTestId("collection-share-modal");
      const image = modal.getByTestId("sharing-preview").getByRole("img");
      const frame = modal.locator(".sharing-preview-image");
      const toggle = modal.getByTestId("sharing-preview-toggle");
      await expect(image).toBeVisible();
      const steps = modal.getByRole("navigation", { name: t(language, "shareStudio.steps") });
      await expect(steps.locator('[aria-current="step"]')).toHaveCount(1);
      await expect(steps.getByRole("button")).toHaveCount(3);
      for (const [stateIndex, expanded] of [false, true, false].entries()) {
        if ((await toggle.getAttribute("aria-expanded")) !== String(expanded)) await toggle.click();
        await expect(toggle).toHaveAttribute("aria-expanded", String(expanded));
        await expect(toggle).toContainText(t(language, expanded ? "shareStudio.closeInspect" : "shareStudio.inspect"));
        await image.scrollIntoViewIfNeeded();
        const picture = (await image.boundingBox())!;
        const box = (await frame.boundingBox())!;
        expect(Math.abs(box.height - picture.height)).toBeLessThanOrEqual(2);
        expect(Math.abs(box.width - picture.width)).toBeLessThanOrEqual(2);
        expect(await modal.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
        if (width < 768) {
          const fields = modal.locator(".sharing-content-fields");
          const container = (await fields.boundingBox())!;
          const controls = fields.getByRole("combobox");
          await expect(controls).toHaveCount(2);
          for (const control of await controls.all()) {
            const bounds = (await control.boundingBox())!;
            expect(Math.abs(container.width - bounds.width)).toBeLessThanOrEqual(1);
            expect(bounds.height).toBeGreaterThanOrEqual(48);
          }
        }
        if (stateIndex < 2)
          await page.screenshot({ path: testInfo.outputPath(`home-preview-${language}-${width}-${expanded}.png`) });
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
      ).toEqual([]);
    });
  }
}
