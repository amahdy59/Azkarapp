import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test.describe(`English page (${language})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.route("https://verses.quran.foundation/**", (route) => route.abort());
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: true, mushafLayout: "single" },
            khatmahPage: 3,
          }),
        );
      }, language);
      await page.goto("/#/quran/3");
      await expect(page.locator('[data-mushaf-page="3"]')).toBeVisible();
      await page.getByTestId("mushaf-rail-more").click();
      await page.getByTestId("quick-page-translation-switch").click();
      await page.keyboard.press("Escape");
      const english = page.locator(".quran-meaning-text");
      await expect(english.locator("p")).toHaveCount(11);
    });

    test("Independent geometry and keyboard reading @cross-browser", async ({ page }, testInfo) => {
      const english = page.locator(".quran-meaning-text");
      const geometry = await english.evaluate((region) => {
        const paper = region.closest(".mushaf-paper")!;
        const arabic = paper.querySelector("[data-mushaf-column]")!;
        const englishFrame = region.closest(".mushaf-page-frame")!.getBoundingClientRect();
        const arabicFrame = arabic.closest(".mushaf-page-frame")!.getBoundingClientRect();
        const view = region.getBoundingClientRect();
        const body = arabic.getBoundingClientRect();
        const textStarts = [...region.querySelectorAll(".quran-meaning-verse-text")].map(
          (node) => node.getBoundingClientRect().left,
        );
        return {
          frameWidthGap: Math.abs(englishFrame.width - arabicFrame.width),
          frameTopGap: Math.abs(englishFrame.top - arabicFrame.top),
          bodyTopGap: Math.abs(view.top - body.top),
          beside: englishFrame.right < arabicFrame.left,
          overflowing: region.scrollHeight > region.clientHeight,
          parentOverflow: paper.scrollHeight - paper.clientHeight,
          numberAlignmentGap: Math.max(...textStarts) - Math.min(...textStarts),
          fontSize: parseFloat(getComputedStyle(region).fontSize),
        };
      });
      expect(geometry.frameWidthGap).toBeLessThanOrEqual(1);
      expect(geometry.frameTopGap).toBeLessThanOrEqual(1);
      expect(geometry.bodyTopGap).toBeLessThanOrEqual(1);
      expect(geometry.beside).toBe(true);
      expect(geometry.overflowing).toBe(true);
      expect(geometry.parentOverflow).toBeLessThanOrEqual(1);
      expect(geometry.numberAlignmentGap).toBeLessThanOrEqual(1);
      expect(geometry.fontSize).toBeGreaterThanOrEqual(20);
      const arabic = page.locator('[data-mushaf-page="3"]');
      const before = await arabic.boundingBox();
      await page.screenshot({ path: testInfo.outputPath(`translation-${language}-desktop.png`), scale: "css" });
      await english.focus();
      await page.keyboard.press("PageDown");
      await expect.poll(() => english.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      await expect(english).toBeFocused();
      expect(await arabic.boundingBox()).toEqual(before);
      expect(await page.locator(".mushaf-paper").evaluate((node) => node.scrollTop)).toBe(0);
      await page.keyboard.press("End");
      await expect
        .poll(() => english.evaluate((node) => Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop)))
        .toBeLessThanOrEqual(1);
      await expect(page).toHaveURL(/quran\/3$/);
      expect((await new AxeBuilder({ page }).include(".mushaf-paper").analyze()).violations).toEqual([]);
    });

    test("Compact enlarged text and short windows @cross-browser", async ({ page }, testInfo) => {
      const english = page.locator(".quran-meaning-text");
      const arabic = page.locator('[data-mushaf-page="3"]');
      await page.setViewportSize({ width: 390, height: 844 });
      const englishChoice = page.getByRole("radio", { name: t(language, "quranListening.englishPage"), exact: true });
      await expect(englishChoice).toBeVisible();
      await englishChoice.check();
      await expect(english).toBeVisible();
      await expect(page.locator(".quran-meaning-footer")).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath(`translation-${language}-390.png`), scale: "css" });
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
        expect(await english.evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
        expect(await english.evaluate((node) => node.clientHeight)).toBeGreaterThan(120);
        const choiceBox = await englishChoice.boundingBox();
        expect(choiceBox!.width).toBeGreaterThan(100);
        expect(choiceBox!.height).toBeLessThan(150);
        const footer = await page.locator(".quran-meaning-footer").boundingBox();
        const navigation = await page
          .getByRole("navigation", { name: t(language, "mushaf.pageNavigation") })
          .boundingBox();
        expect(footer!.y + footer!.height).toBeLessThanOrEqual(navigation!.y + 1);
        for (const button of await page
          .getByRole("navigation", { name: t(language, "mushaf.pageNavigation") })
          .getByRole("button")
          .all()) {
          const box = await button.boundingBox();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
          expect(box!.width).toBeGreaterThanOrEqual(44);
        }
        await page.screenshot({ path: testInfo.outputPath(`translation-${language}-${width}-200.png`), scale: "css" });
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
      await page.getByRole("radio", { name: t(language, "quranListening.arabicPage"), exact: true }).check();
      await expect(arabic).toBeVisible();
      await expect(arabic.locator("[data-mushaf-column] > div")).toHaveCount(15);
      await page.setViewportSize({ width: 1440, height: 600 });
      await expect(english).toBeVisible();
      await expect(page.locator(".quran-meaning-footer")).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath(`translation-${language}-short.png`), scale: "css" });
    });
  });
}
