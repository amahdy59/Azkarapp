import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 1440]) {
    for (const flow of ["screens", "utilities", "reading"] as const) {
      test(`Home glass material ${flow} ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.clock.setFixedTime(new Date("2026-10-17T08:00:00+03:00"));
        await page.addInitScript((language) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                themeMode: "midnight",
                appMaterial: "glass",
                homeMaterial: "glass",
                reduceMotion: true,
              },
              profile: { isGuest: true },
            }),
          );
        }, language);
        await page.goto("/#/home");
        const home = page.getByTestId("prayer-card-asr");
        const filter = await home.evaluate((n) => getComputedStyle(n).backdropFilter);
        const tint = await home.evaluate((n) => getComputedStyle(n).backgroundColor);
        const scene = await page.getByTestId("time-of-day-scene-window").last().locator("img").getAttribute("src");
        await expect
          .poll(() =>
            page
              .getByTestId("time-of-day-scene-window")
              .last()
              .locator("img")
              .evaluate((n) => n.complete && n.naturalWidth > 0),
          )
          .toBe(true);
        await page.screenshot({ path: testInfo.outputPath("home-reference.png"), scale: "css" });
        await page.goto("/#/azkar");
        const card = page.getByTestId("category-card-morning");
        await expect(card).toHaveCSS("background-color", tint);
        await expect(card).toHaveCSS("backdrop-filter", filter);
        await expect(card).toHaveCSS("background-image", /linear-gradient/);
        await expect(page.getByTestId("app-scene").locator("img")).toHaveAttribute("src", scene!);
        if (width === 1440)
          await expect(page.locator(".app-sidebar")).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
        if (flow === "utilities") {
          await page.getByRole("textbox").fill(language === "ar" ? "اغفر" : "forgive");
          const result = page.getByTestId("matching-zikr-card").first();
          await expect(result).toHaveCSS("backdrop-filter", filter);
          await expect(result).toHaveCSS("background-color", tint);
          await page.screenshot({ path: testInfo.outputPath("search-card.png"), scale: "css" });
        }
        if (flow !== "reading") {
          const routes =
            flow === "screens"
              ? ["azkar", "progress", "settings/appearance", "quran-wird"]
              : ["qibla", "counter", "more", "benefits"];
          for (const route of routes) {
            await page.goto("/#/" + route);
            await expect(page.getByTestId("app-scene").locator("img")).toHaveAttribute("src", scene!);
            await expect
              .poll(() =>
                page
                  .getByTestId("app-scene")
                  .locator("img")
                  .evaluate((n) => n.complete && n.naturalWidth > 0),
              )
              .toBe(true);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
            await page.screenshot({ path: testInfo.outputPath(route.replaceAll("/", "-") + ".png"), scale: "css" });
          }
        } else {
          await page.goto("/#/azkar");
          await card.click();
          await expect(page.getByTestId("app-scene").locator("img")).toHaveCount(1);
          await expect(page.locator("[data-material-ui]")).toBeVisible();
          await expect(page.getByTestId("reader-card").first()).toHaveCSS("background-color", "rgba(15, 23, 42, 0.36)");
          await expect(page.getByTestId("reader-card").first()).toHaveCSS("backdrop-filter", filter);
          await page.screenshot({ path: testInfo.outputPath("reader.png"), scale: "css" });
          await page.getByRole("button", { name: language === "ar" ? "الفائدة" : "Benefit", exact: true }).click();
          await expect(page.getByRole("dialog")).toHaveCSS("background-color", "rgba(15, 23, 42, 0.8)");
          await expect(page.getByRole("dialog")).toHaveCSS("backdrop-filter", "blur(28px) saturate(1.35)");
          expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual([]);
          await page.screenshot({ path: testInfo.outputPath("benefit-dialog.png"), scale: "css" });
          await page.keyboard.press("Escape");
          await page.goto("/#/quran-wird");
          await page
            .getByRole("button", { name: language === "ar" ? "متابعة القراءة" : "Continue reading", exact: true })
            .click();
          const mushaf = page.locator("[data-mushaf-chrome-mode]");
          await expect(mushaf).toBeVisible();
          await expect(mushaf).toHaveCSS("background-color", "rgba(15, 23, 42, 0.36)");
          await expect(mushaf).toHaveCSS("backdrop-filter", filter);
          expect((await new AxeBuilder({ page }).include(".app-main").analyze()).violations).toEqual([]);
          await page.screenshot({ path: testInfo.outputPath("mushaf.png"), scale: "css" });
        }
      });
    }
  }
}
