import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`Mushaf glass protects word meanings and explains page colors ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, appMaterial: "glass", themeMode: "midnight", reduceMotion: true },
          profile: { isGuest: true },
          khatmahPage: 4,
          quranReadingPosition: { page: 4, surahNumber: 2, ayahNumber: 17, juzNumber: 1 },
        }),
      );
    }, language);
    await page.goto("/#/quran-wird");
    await page.getByRole("button", { name: t(language, "mushaf.continueReading") }).click();
    await page.getByTestId("mushaf-difficult-words-switch").click();
    const word = page.getByRole("button", {
      name: t(language, "mushaf.wordMeaning", { word: "كَصَيِّبٍۢ" }),
      exact: true,
    });
    await expect(word).toBeVisible();
    await word.click();
    const gloss = page.getByTestId("quran-word-popover");
    await expect(gloss).toBeVisible();
    // The tooltip path must receive the same protected material as dialogs.
    await expect(gloss).toHaveAttribute("role", "tooltip");
    await expect(gloss).toHaveCSS("background-color", "rgb(15, 23, 42)");
    await expect(gloss).toHaveCSS("backdrop-filter", "blur(28px) saturate(1.35)");
    await expect(gloss).toHaveCSS("opacity", "1");
    const bounds = (await gloss.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(391);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(845);
    await page.screenshot({ path: info.outputPath(`mushaf-glass-gloss-${language}.png`) });
    await page.keyboard.press("Escape");
    await expect(gloss).toBeHidden();
    await page.getByTestId("mushaf-more-actions").click();
    await expect(page.getByTestId("mushaf-quick-menu")).toHaveCSS("background-color", "rgb(15, 23, 42)");
    const hint = page.getByTestId("mushaf-material-hint");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText(t(language, "mushaf.glassActive"));
    await page.getByTestId("quick-theme-light").click();
    await expect(hint).toBeVisible();
    await expect(page.getByTestId("quick-theme-light")).toHaveAttribute("aria-checked", "true");
    await page.getByTestId("mushaf-quick-settings").click();
    await expect(page.getByTestId("mushaf-settings-sheet")).toHaveCSS("background-color", "rgb(15, 23, 42)");
    await expect(page.getByTestId("mushaf-settings-sheet").getByTestId("mushaf-material-hint")).toBeVisible();
    await page.screenshot({ path: info.outputPath(`mushaf-glass-colors-${language}.png`) });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze()).violations).toEqual(
      [],
    );
    await page.keyboard.press("Escape");
    const paper = page.locator(".mushaf-paper");
    const gesture = { pointerId: 1, pointerType: "touch", isPrimary: true, button: 0, clientX: 195, clientY: 440 };
    await paper.dispatchEvent("pointerdown", gesture);
    await paper.dispatchEvent("pointermove", { ...gesture, clientY: 300 });
    await paper.dispatchEvent("pointerup", { ...gesture, clientY: 300 });
    const hud = page.getByTestId("mushaf-theme-hud");
    await expect(hud.getByText(t(language, "mushaf.glassActive"))).toBeVisible();
    await expect(hud.locator(".mushaf-theme-hud-surface")).toHaveCSS("backdrop-filter", "blur(28px) saturate(1.35)");
    await page.getByTestId("mushaf-more-actions").click();
    // The status disappears when the effective surface is solid or high contrast.
    await page.locator("html").evaluate((root) => {
      root.dataset.appMaterialResolved = "solid";
    });
    await expect(hint).toBeHidden();
    await page.locator("html").evaluate((root) => {
      root.dataset.appMaterialResolved = "glass";
      root.classList.add("high-contrast");
    });
    await expect(hint).toBeHidden();
  });
}
