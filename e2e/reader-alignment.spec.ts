import { checkMasbahaSettings } from "./helpers/masbaha-settings";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const scenario of [
  { language: "ar", width: 1440, scale: 1, themeMode: "light", appMaterial: "solid", highContrast: false },
  { language: "en", width: 834, scale: 1, themeMode: "midnight", appMaterial: "glass", highContrast: false },
  { language: "ar", width: 320, scale: 2, themeMode: "light", appMaterial: "solid", highContrast: false },
  { language: "en", width: 390, scale: 2, themeMode: "dark", appMaterial: "solid", highContrast: true },
] as const) {
  test.describe(`${scenario.language}/${scenario.width}/${scenario.scale}`, () => {
    test.beforeEach(async ({ page }, info) => {
      await page.setViewportSize({ width: scenario.width, height: 1000 });
      const origin = new URL(String(info.project.use.baseURL)).origin;
      await page.route("**/*", (route) =>
        new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
      );
      await page.route("https://verses.quran.foundation/**", (route) => route.abort());
      await page.addInitScript((scenario) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { ...scenario, reduceMotion: true, hapticFeedback: false },
            profile: { isGuest: true },
          }),
        );
      }, scenario);
    });
    if (scenario.width <= 834)
      test("collection headers use one quiet surface @cross-browser", async ({ page }, info) => {
        // This contract belongs to the compact header, below the 768px hero.
        await page.setViewportSize({ width: Math.min(scenario.width, 600), height: 1000 });
        for (const collection of ["morning", "evening", "before-sleep"]) {
          await page.goto(`/#/azkar/${collection}/1`);
          const header = page.getByTestId("shared-screen-header");
          await expect(header).toBeVisible();
          await page.locator("html").evaluate((node, scale) => {
            node.style.fontSize = `${scale * 100}%`;
          }, scenario.scale);
          await page.mouse.move(0, 0);
          const geometry = await header.evaluate((node) => {
            const bounds = node.getBoundingClientRect();
            const buttons = [...node.querySelectorAll("button")];
            return {
              plain: [...node.children, ...buttons].every(
                (child) => getComputedStyle(child).backgroundColor === "rgba(0, 0, 0, 0)",
              ),
              targets: buttons.every((button) => {
                const box = button.getBoundingClientRect();
                return box.width >= 44 && box.height >= 44 && box.left >= bounds.left && box.right <= bounds.right + 1;
              }),
              overflow: node.scrollWidth - node.clientWidth,
            };
          });
          expect(geometry.plain).toBe(true);
          expect(geometry.targets).toBe(true);
          expect(geometry.overflow).toBeLessThanOrEqual(1);
          await page.screenshot({ path: info.outputPath(`${collection}-quiet-header.png`) });
        }
      });
    test("aligned Mushaf index @cross-browser", async ({ page }, info) => {
      await page.goto("/#/quran/3");
      await page.locator('[data-mushaf-page="3"]').waitFor();
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, scenario.scale);
      const indexOpener = page.getByTestId("mushaf-rail-index").or(page.getByTestId("mushaf-top-center-index"));
      await indexOpener.click();
      const modal = page.getByTestId("mushaf-index-modal");
      await expect(modal).toBeVisible();
      const search = modal.locator('input[type="search"]');
      await expect(search).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const alignment = () =>
        modal.evaluate((node) => {
          const rects = [
            node.querySelector('[role="tablist"]')!,
            node.querySelector('input[type="search"]')!,
            node.querySelector('[role="tabpanel"]')!.firstElementChild!,
          ].map((n) => n.getBoundingClientRect());
          return (
            Math.max(...rects.map((r) => r.left)) -
            Math.min(...rects.map((r) => r.left)) +
            Math.max(...rects.map((r) => r.right)) -
            Math.min(...rects.map((r) => r.right))
          );
        });
      await expect.poll(alignment).toBeLessThanOrEqual(1);
      await expect(modal.getByRole("tablist")).toHaveCSS("border-top-width", "1px");
      await expect(modal.getByRole("tablist")).toHaveCSS("border-radius", "999px");
      for (const card of (await modal.getByRole("tabpanel").locator(":scope > div > button").all()).slice(0, 4)) {
        await card.scrollIntoViewIfNeeded();
        expect(
          await card.evaluate((node) => {
            const label = node.querySelector(".arabic-ui")!;
            const range = document.createRange();
            range.selectNodeContents(label);
            const ink = range.getBoundingClientRect(),
              bounds = node.getBoundingClientRect();
            return (
              ink.left >= bounds.left &&
              ink.right <= bounds.right &&
              ink.top >= bounds.top &&
              ink.bottom <= bounds.bottom
            );
          }),
        ).toBe(true);
      }
      await modal.getByRole("tabpanel").evaluate((node) => {
        node.scrollTop = 0;
      });
      for (const tab of await modal.getByRole("tab").all()) {
        const bounds = await tab.boundingBox();
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        expect(
          await tab.evaluate((n) => n.scrollWidth <= n.clientWidth + 1 && n.scrollHeight <= n.clientHeight + 1),
        ).toBe(true);
      }
      await page.screenshot({ path: info.outputPath("aligned-index.png") });
      const surahs = modal.getByRole("tab", { name: t(scenario.language, "mushaf.tabSurahs"), exact: true });
      await surahs.focus();
      await page.keyboard.press(scenario.language === "ar" ? "ArrowLeft" : "ArrowRight");
      await expect(modal.getByRole("tab", { name: t(scenario.language, "mushaf.tabJuzs"), exact: true })).toBeFocused();
      await page.keyboard.press("Home");
      await expect(surahs).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(indexOpener).toBeFocused();
    });
    test("aligned bilingual reader @cross-browser", async ({ page }, info) => {
      await page.goto("/#/quran/3");
      await page.locator('[data-mushaf-page="3"]').waitFor();
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, scenario.scale);
      await page.getByTestId("mushaf-rail-more").or(page.getByTestId("mushaf-more-actions")).click();
      await page.getByTestId("quick-mode-bilingual").click();
      const view = page.getByTestId("bilingual-stream-view");
      await expect(view).toBeVisible();
      const article = view.locator("article").first();
      await expect(article).toBeVisible();
      await expect
        .poll(() =>
          view.evaluate((node) => {
            const article = node.querySelector("article")!.getBoundingClientRect();
            const headerChildren = [...node.querySelector("header")!.children].map((n) => n.getBoundingClientRect());
            const footerButtons = [...node.querySelector("footer")!.querySelectorAll("button")].map((n) =>
              n.getBoundingClientRect(),
            );
            return Math.max(
              Math.abs(Math.min(...headerChildren.map((r) => r.left)) - article.left),
              Math.abs(Math.max(...headerChildren.map((r) => r.right)) - article.right),
              Math.abs(Math.min(...footerButtons.map((r) => r.left)) - article.left),
              Math.abs(Math.max(...footerButtons.map((r) => r.right)) - article.right),
            );
          }),
        )
        .toBeLessThanOrEqual(1);
      const header = await view.locator("header").boundingBox(),
        footer = await view.locator("footer").boundingBox();
      await view.getByTestId("bilingual-scroll").evaluate((n) => {
        n.scrollTop = n.scrollHeight;
      });
      expect(await view.locator("header").boundingBox()).toEqual(header);
      expect(await view.locator("footer").boundingBox()).toEqual(footer);
      expect(await view.evaluate((n) => n.scrollWidth - n.clientWidth)).toBeLessThanOrEqual(1);
      await view.getByTestId("bilingual-scroll").evaluate((n) => {
        n.scrollTop = 0;
      });
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="bilingual-stream-view"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: info.outputPath("aligned-bilingual.png") });
    });
    test("counting settings and trigger-width menus @cross-browser", async ({ page }, info) => {
      await page.goto("/#/counter");
      const zikr = page.getByTestId("counter-zikr-filter");
      await expect(page.getByTestId("custom-counter-surface")).toBeVisible();
      // A new document may restore the root font; apply the same actual text scale.
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, scenario.scale);
      if (scenario.width < 600) {
        await checkMasbahaSettings(page, scenario.language);
        await page.screenshot({ path: info.outputPath("masbaha-sheet-recovery.png") });
        return;
      }
      await expect(zikr).toBeVisible();
      for (const trigger of [zikr, page.getByTestId("counter-target-filter")]) {
        await trigger.click();
        const menu = page.getByRole("menu");
        await expect(menu).toBeVisible();
        await expect
          .poll(async () => {
            const button = await trigger.boundingBox(),
              popup = await menu.boundingBox();
            return Math.abs(button!.width - popup!.width);
          })
          .toBeLessThanOrEqual(1);
        const rect = await menu.boundingBox();
        expect(rect!.x).toBeGreaterThanOrEqual(0);
        expect(rect!.x + rect!.width).toBeLessThanOrEqual(scenario.width);
        expect(await menu.evaluate((n) => n.scrollWidth - n.clientWidth)).toBeLessThanOrEqual(1);
        await expect(menu).toHaveAttribute("data-dropdown-surface", "");
        await page.screenshot({ path: info.outputPath(`${await trigger.getAttribute("data-testid")}-width.png`) });
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
      }
    });
  });
}
