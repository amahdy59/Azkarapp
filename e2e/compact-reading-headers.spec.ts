import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const [route, prefix] of [
    ["azkar/morning/1", "reader"],
    ["azkar/in-prayer/1", "reader"],
    ["counter", "custom-counter"],
    ["friday/salawat", "salawat"],
  ]) {
    test(`compact aligned ${route} header in ${language} @cross-browser`, async ({ page }, testInfo) => {
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
        );
      }, language);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/#/${route}`);
      const hero = page.getByTestId(`${prefix}-desktop-hero`);
      const toolbar = page.getByTestId(`${prefix}-header-toolbar`);
      for (const width of [1440, 820, 768]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(hero).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const title = await toolbar.getByRole("heading", { level: 1 }).boundingBox();
        const box = (await toolbar.boundingBox())!;
        expect(Math.abs(title!.y + title!.height / 2 - box.y - box.height / 2)).toBeLessThanOrEqual(1);
        expect(Math.abs(title!.x + title!.width / 2 - box.x - box.width / 2)).toBeLessThanOrEqual(1);
        const buttons = await toolbar.getByRole("button").evaluateAll((elements) =>
          elements
            .filter((element) => element.getClientRects().length)
            .map((element) => {
              const b = element.getBoundingClientRect();
              return { x: b.x, y: b.y, width: b.width, height: b.height };
            }),
        );
        for (const button of buttons) {
          expect(button.width).toBeGreaterThanOrEqual(44);
          expect(button.height).toBeGreaterThanOrEqual(44);
          expect(button.x + button.width <= title!.x || title!.x + title!.width <= button.x).toBe(true);
          if (width === 1440) {
            expect(Math.abs(button.y + button.height / 2 - title!.y - title!.height / 2)).toBeLessThanOrEqual(1);
          }
        }
        const bar = hero.getByRole("progressbar");
        if (await bar.count()) {
          const progress = (await bar.boundingBox())!;
          expect(progress.y).toBeGreaterThanOrEqual(box.y + box.height);
          expect(progress.y - box.y - box.height).toBeLessThanOrEqual(40);
        }
        if (width === 1440)
          expect((await hero.boundingBox())!.height).toBeLessThanOrEqual(prefix === "reader" ? 100 : 160);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({
          path: `output/playwright/compact-reading-headers/${testInfo.project.name}/${language}-${prefix}-${route.split("/")[1] ?? "counter"}-${width}.png`,
        });
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expect(toolbar.getByRole("heading")).toBeVisible();
      expect(await toolbar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include(`[data-testid="${prefix}-desktop-hero"]`).analyze()).violations,
      ).toEqual([]);
    });
  }
}
