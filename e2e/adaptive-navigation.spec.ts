import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { openProgress } from "./helpers/open-progress";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test.describe(language, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "light", appMaterial: "solid", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.goto("/#/home");
    });
    for (const [width, scale] of [
      [320, 1],
      [575, 1],
      [576, 1],
      [834, 1],
      [834, 2],
      [320, 2],
    ] as const) {
      test(`navigation fits ${width}/${scale} @cross-browser`, async ({ page }, info) => {
        const settings = page.getByTestId("nav-settings"),
          qibla = page.getByTestId("nav-qibla"),
          masbaha = page.getByTestId("nav-masbaha");
        await page.setViewportSize({ width, height: 1000 });
        await page.locator("html").evaluate((node, scale) => {
          node.style.fontSize = `${scale * 100}%`;
        }, scale);
        await page.evaluate(() => document.fonts.ready);
        await expect(settings).toBeVisible();
        await expect(qibla).toBeVisible();
        await expect(page.getByTestId("nav-progress")).toHaveCount(0);
        const optional = width >= 576 * scale;
        if (optional) await expect(masbaha).toBeVisible();
        else await expect(masbaha).toBeHidden();
        const links = page.locator(".bottom-nav a:visible");
        await expect(links).toHaveCount(optional ? 6 : 5);
        for (const link of await links.all()) {
          const box = (await link.boundingBox())!;
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(await link.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
          expect(
            await link.locator(".bottom-nav-label").evaluate((node) => {
              const range = document.createRange();
              range.selectNodeContents(node);
              const ink = range.getBoundingClientRect(),
                box = node.parentElement!.getBoundingClientRect();
              return (
                ink.left >= box.left - 1 &&
                ink.right <= box.right + 1 &&
                ink.top >= box.top - 1 &&
                ink.bottom <= box.bottom + 1
              );
            }),
            `${language}/${width}/${scale}/${await link.getAttribute("data-testid")}`,
          ).toBe(true);
        }
        await qibla.click();
        await expect(qibla).toHaveAttribute("aria-current", "page");
        await expect(page.locator('nav [aria-current="page"]')).toHaveCount(1);
        await settings.focus();
        await page.keyboard.press("Enter");
        await expect(settings).toHaveAttribute("aria-current", "page");
        await page.getByTestId("nav-home").click();
        await page.screenshot({ path: info.outputPath(`home-${width}-${scale}.png`) });
      });
    }
    test("fallback routes, utility selection and wide navigation @cross-browser", async ({ page }) => {
      await openProgress(page);
      await expect(page.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "month");
      await page.getByTestId("nav-home").click();
      const card = page.getByTestId("home-tool-masbaha");
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await expect(page).toHaveURL(/#\/counter$/);
      await page.goto("/#/home");
      const more = page.getByTestId("home-more");
      await more.scrollIntoViewIfNeeded();
      await more.click();
      await expect(page).toHaveURL(/#\/more$/);
      await expect(page.locator('nav [aria-current="page"]')).toHaveCount(0);
      const progress = page.getByRole("button", { name: new RegExp(`^${t(language, "common.progress")}`) });
      await progress.click();
      await expect(page).toHaveURL(/#\/progress\/month$/);
      await page.goto("/#/more");
      await page.getByRole("button", { name: new RegExp(`^${t(language, "counter.tasbeehTitle")}`) }).click();
      await expect(page).toHaveURL(/#\/counter$/);
    });
    for (const width of [834, 1024, 1440]) {
      test(`utility selection at ${width} @cross-browser`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.getByTestId("nav-masbaha").click();
        await expect(page.getByTestId("nav-masbaha")).toHaveAttribute("aria-current", "page");
        await expect(page.locator('nav [aria-current="page"]')).toHaveCount(1);
        await page.getByTestId("nav-qibla").click();
        await expect(page.getByTestId("nav-qibla")).toHaveAttribute("aria-current", "page");
        await expect(page.locator('nav [aria-current="page"]')).toHaveCount(1);
        await expect(page.getByTestId("nav-settings")).toBeVisible();
        if (width >= 900) await expect(page.getByTestId("nav-progress")).toBeVisible();
        expect((await new AxeBuilder({ page }).include("nav").analyze()).violations).toEqual([]);
      });
    }
  });
}
