import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const scenario of [
  { language: "ar", width: 390, height: 844, scale: 1, theme: "dark", material: "solid", owner: "quran" },
  { language: "en", width: 320, height: 844, scale: 2, theme: "midnight", material: "glass", owner: "quran" },
  { language: "ar", width: 834, height: 1112, scale: 1, theme: "light", material: "glass", owner: "surah" },
  { language: "en", width: 1440, height: 900, scale: 1, theme: "dark", material: "solid", owner: "surah" },
] as const) {
  async function openReader(page: import("@playwright/test").Page) {
    await page.setViewportSize(scenario);
    await page.addInitScript((scenario) => {
      if (localStorage.getItem("azkarapp.state.v1")) return;
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: scenario.language,
            themeMode: scenario.theme,
            mushafTheme: scenario.theme,
            appMaterial: scenario.material,
            reduceMotion: true,
            mushafLayout: "single",
          },
          profile: { isGuest: true },
          mushafTheme: scenario.theme,
          mushafLayout: "single",
        }),
      );
    }, scenario);
    await page.goto(scenario.owner === "quran" ? "/#/quran/42" : "/#/azkar/friday-kahf/1");
    if (scenario.owner === "surah") await page.getByTestId("reader-mushaf-button").click();
    const paper = page.locator(".mushaf-paper");
    await expect(paper.locator("[data-mushaf-line-content]").first()).toBeVisible();
    await page.evaluate((scale) => {
      document.documentElement.style.fontSize = `${100 * scale}%`;
    }, scenario.scale);
    const openSettings = async () => {
      const direct = page.getByTestId("mushaf-settings-trigger");
      if (await direct.isVisible()) await direct.click();
      else {
        await page
          .locator(
            '[data-testid="mushaf-more-actions"], [data-testid="mushaf-rail-more"], [data-testid="mushaf-immersive-more"]',
          )
          .click();
        await page.getByTestId("mushaf-quick-settings").click();
      }
    };
    await openSettings();
    const sheet = page.getByTestId("mushaf-settings-sheet");
    return { paper, sheet, openSettings };
  }
  test(`reading colours persist ${scenario.owner}/${scenario.width} @cross-browser`, async ({ page }, info) => {
    const { paper, sheet, openSettings } = await openReader(page);
    const advanced = sheet.locator(".mushaf-advanced-display");
    await expect(advanced).not.toHaveAttribute("open");
    await expect(sheet.getByRole("slider")).toBeHidden();
    const follow = sheet.getByRole("switch", { name: t(scenario.language, "mushaf.themeFollowApp"), exact: true });
    await follow.click();
    await expect(follow).toHaveAttribute("aria-checked", "true");
    const manual = sheet.getByTestId("mushaf-theme-option-light");
    await manual.click();
    await expect(follow).toHaveAttribute("aria-checked", "false");
    await expect(manual).toHaveAttribute("aria-checked", "true");
    await manual.press(scenario.language === "ar" ? "ArrowLeft" : "ArrowRight");
    await expect(sheet.getByTestId("mushaf-theme-option-dark")).toHaveAttribute("aria-checked", "true");
    const geometry = await sheet.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const css = getComputedStyle(node);
      const options = [...node.querySelectorAll<HTMLElement>('[role="radio"]')];
      return {
        inside: box.left >= 0 && box.right <= innerWidth + 1 && box.top >= 0 && box.bottom <= innerHeight + 1,
        opaque: /^(?:rgb|color)\([^/]+\)$/.test(css.backgroundColor) && Number(css.opacity) === 1,
        overflow: node.scrollWidth - node.clientWidth,
        targets: options.every((option) => {
          const r = option.getBoundingClientRect();
          return r.width >= 44 && r.height >= 44;
        }),
        labels: options.every((option) => {
          const r = option.getBoundingClientRect();
          const label = option.lastElementChild!.getBoundingClientRect();
          return label.left >= r.left - 1 && label.right <= r.right + 1;
        }),
      };
    });
    expect(geometry).toEqual({ inside: true, opaque: true, overflow: 0, targets: true, labels: true });
    await page.screenshot({ path: info.outputPath(`settings-${scenario.owner}-${scenario.width}.png`) });
    await page.reload();
    if (scenario.owner === "surah") await page.getByTestId("reader-mushaf-button").click();
    await expect(paper.locator("[data-mushaf-line-content]").first()).toBeVisible();
    await openSettings();
    await expect(page.getByTestId("mushaf-theme-option-dark")).toHaveAttribute("aria-checked", "true");
  });
  test(`Advanced magnification stays separate ${scenario.owner}/${scenario.width} @cross-browser`, async ({
    page,
  }, info) => {
    const { paper, sheet } = await openReader(page);
    const advanced = sheet.locator(".mushaf-advanced-display");
    await advanced.locator("summary").click();
    const slider = sheet.getByRole("slider", { name: t(scenario.language, "mushaf.magnification"), exact: true });
    await page.screenshot({ path: info.outputPath(`advanced-${scenario.owner}-${scenario.width}.png`) });
    await slider.focus();
    await slider.press("End");
    await expect(slider).toHaveValue("200");
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(paper).toHaveAttribute("data-magnified", "true");
    await page.getByRole("button", { name: t(scenario.language, "quranZoom.open"), exact: true }).click();
    await expect(paper).toHaveAttribute("data-magnified", "false");
    const header = page.getByTestId("quran-zoom-header");
    await expect(header).toHaveCount(1);
    await page.screenshot({ path: info.outputPath(`zoom-${scenario.owner}-${scenario.width}.png`) });
    await header.getByRole("button", { name: t(scenario.language, "quranZoom.pageView"), exact: true }).click();
  });
  test(`reading settings accessibility ${scenario.owner}/${scenario.width} @cross-browser`, async ({ page }) => {
    await openReader(page);
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="mushaf-settings-sheet"]').analyze()).violations,
    ).toEqual([]);
  });
}
