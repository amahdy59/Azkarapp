import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";
import { sharingStep } from "./helpers/sharing";
import { chooseProgressOption, expectProgressFilterFocus } from "./helpers/progress";

for (const language of ["ar", "en"] as const) {
  test.describe(`mobile refinement ${language}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, appMaterial: "glass", themeMode: "midnight" },
            profile: { isGuest: true },
          }),
        );
      }, language);
    });

    test(`compact mobile filters retain context, drafts and focus in ${language} @cross-browser`, async ({
      page,
    }, testInfo) => {
      const ar = language === "ar";
      await page.goto("/#/azkar");
      const library = page.getByTestId("library-filter-disclosure");
      const summary = library.locator("summary");
      await expect(library).not.toHaveAttribute("open");
      const header = page.locator(".library-stationary-header");
      expect((await header.boundingBox())!.height).toBeLessThan(190);
      await summary.click();
      await library.getByRole("button", { name: ar ? "أذكار اليوم" : "Daily Azkar", exact: true }).click();
      await expect(library).not.toHaveAttribute("open");
      await expect(summary).toContainText(ar ? "أذكار اليوم" : "Daily Azkar");
      await expect(summary).toBeFocused();
      await summary.click();
      const search = library.getByRole("textbox");
      await search.fill(ar ? "النوم" : "sleep");
      await expect(library).toHaveAttribute("open");
      await library.getByRole("button", { name: t(language, "library.showResults"), exact: true }).click();
      await expect(summary).toContainText(ar ? "النوم" : "sleep");
      await summary.click();
      await expect(search).toHaveValue(ar ? "النوم" : "sleep");
      await library.getByRole("button", { name: t(language, "library.clearFilters"), exact: true }).click();
      await expect(search).toHaveValue("");
      await expect(page.getByRole("link", { name: ar ? /^أذكار الصباح/ : /^Morning Azkar/ }).first()).toBeVisible();
      await library.getByRole("button", { name: t(language, "library.showResults"), exact: true }).click();
      await page.screenshot({ path: testInfo.outputPath(`library-compact-${language}.png`) });
      await page.goto("/#/progress");
      const filters = page.getByTestId("progress-range-disclosure");
      await expect(filters).not.toHaveAttribute("open");
      const period = filters.getByRole("combobox", {
        name: ar ? "الفترة" : "Period",
        exact: true,
        includeHidden: true,
      });
      await chooseProgressOption(period, "week");
      await expect(filters).not.toHaveAttribute("open");
      await expect(filters.locator("summary")).toContainText(ar ? "أسبوع" : "Week");
      await chooseProgressOption(period, "custom");
      const editor = page.getByTestId("progress-date-sheet");
      await expect(editor).toBeVisible();
      const start = editor.getByLabel(ar ? "تاريخ البداية" : "Start date", { exact: true });
      const end = editor.getByLabel(ar ? "تاريخ النهاية" : "End date", { exact: true });
      await start.fill("2026-10-01");
      await end.fill("2026-10-02");
      await expect(filters).toHaveAttribute("open");
      await editor.getByRole("button", { name: ar ? "تطبيق" : "Apply", exact: true }).click();
      await expect(editor).toBeHidden();
      await expect(filters).not.toHaveAttribute("open");
      await expectProgressFilterFocus(period);
      await expect(page.getByTestId("garden-view-date")).toContainText(ar ? "١" : "1");
      for (const width of [320, 834, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.locator("html").evaluate((root, enlarged) => {
          root.style.fontSize = enlarged ? "200%" : "100%";
        }, width === 320);
        if (width === 320) await expect(filters).not.toHaveAttribute("open");
        else await expect(period).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
        await page.screenshot({ path: testInfo.outputPath(`progress-filters-${language}-${width}.png`) });
      }
      expect((await new AxeBuilder({ page }).include(".progress-screen").analyze()).violations).toEqual([]);
    });

    test(`mobile sharing fills every step and switches zikr/collection without losing design in ${language} @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.goto("/#/azkar/waking-up/1");
      await page.getByTestId("reader-share-dock-button").click();
      const studio = page.getByTestId("collection-share-modal");
      const image = studio.getByTestId("sharing-preview").getByRole("img");
      await expect(image).toBeVisible();
      expect((await image.boundingBox())!.height).toBeGreaterThanOrEqual(160);
      const geometry = await studio.boundingBox();
      expect(geometry!.x).toBe(0);
      expect(geometry!.y).toBe(0);
      expect(geometry!.width).toBe(390);
      expect(geometry!.height).toBeCloseTo(844, 1); // WebKit quantizes dvh to 1/64 CSS px.
      await sharingStep(studio, "design");
      await studio.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true }).click();
      await page.getByRole("option", { name: t(language, "shareStudio.square"), exact: true }).click();
      await expect(image).toHaveAttribute("height", "1080");
      await sharingStep(studio, "content");
      await studio.getByRole("radio", { name: t(language, "shareStudio.entireCollection"), exact: true }).check();
      await sharingStep(studio, "design");
      await expect(
        studio.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true }),
      ).toContainText(t(language, "shareStudio.square"));
      for (const step of ["content", "design", "share"] as const) {
        await sharingStep(studio, step);
        expect(await studio.boundingBox()).toEqual(geometry);
      }
      await expect(studio.getByRole("combobox", { name: t(language, "shareStudio.scope"), exact: true })).toContainText(
        t(language, "shareStudio.scopeall"),
      );
      await sharingStep(studio, "content");
      await studio.getByRole("radio", { name: t(language, "shareStudio.thisZikr"), exact: true }).check();
      await expect(image).toHaveAttribute("height", "1080");
      await expect(studio.getByTestId("sharing-preview").getByRole("group").first()).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await page.screenshot({ path: testInfo.outputPath(`sharing-fullscreen-${language}.png`) });
      await sharingStep(studio, "share");
      const download = page.waitForEvent("download");
      await studio.getByRole("button", { name: t(language, "shareStudio.save"), exact: true }).click();
      await (await download).saveAs(testInfo.outputPath(`balanced-single-${language}.png`));
      await page.setViewportSize({ width: 320, height: 600 });
      await page.locator("html").evaluate((root) => {
        root.style.fontSize = "200%";
      });
      for (const step of ["content", "design", "share"] as const) {
        await sharingStep(studio, step);
        expect(await studio.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
        const close = studio.getByTestId("modal-close-button");
        await close.focus();
        await expect(close).toBeInViewport();
      }
      await page.screenshot({ path: testInfo.outputPath(`sharing-enlarged-${language}.png`) });
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
      ).toEqual([]);
    });
  });
}
