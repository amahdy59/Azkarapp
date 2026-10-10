import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`ayah image preview exports complete portrait and square cards in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.route("https://verses.quran.foundation/**", (route) => route.abort());
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/quran/42");
    const trigger = page.getByRole("button", {
      name: language === "ar" ? "فتح إجراءات الآية ٢٥٥" : "Open actions for ayah 255",
    });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const imageAction = page.getByRole("button", { name: t(language, "reader.shareAyahImage"), exact: true });
    await imageAction.click();
    const studio = page.getByTestId("ayah-share-studio");
    await expect(studio.getByRole("heading")).toBeFocused();
    const preview = studio.getByRole("img");
    await expect(preview).toBeVisible();
    await expect(
      studio.getByRole("checkbox", { name: t(language, "reader.ayahCardTranslation"), exact: true }),
    ).toBeEnabled();
    await studio.getByRole("checkbox", { name: t(language, "reader.ayahCardTranslation"), exact: true }).check();
    await studio.getByRole("checkbox", { name: t(language, "reader.ayahCardMeanings"), exact: true }).check();
    await studio.locator("summary").click();
    await expect(studio.locator('p[lang="en"]')).toContainText("Allah! There is no deity save Him");
    await expect(studio.locator('p[lang="ar"]').first()).toContainText("ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ");
    for (const format of ["portrait", "square"] as const) {
      await studio
        .getByRole("radio", {
          name: t(language, format === "portrait" ? "reader.ayahCardPortrait" : "reader.ayahCardSquare"),
          exact: true,
        })
        .check();
      const save = studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true });
      await expect(save).toBeEnabled();
      await expect(preview).toHaveAttribute("height", format === "portrait" ? "1350" : "1080");
      const downloadPromise = page.waitForEvent("download");
      await save.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(`ayah-2-255-${format}-1.png`);
      await download.saveAs(testInfo.outputPath(`ayah-card-${language}-${format}-${testInfo.project.name}.png`));
      await preview.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath(`ayah-studio-${language}-${format}-${testInfo.project.name}.png`),
      });
      expect(await studio.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    }
    const results = await new AxeBuilder({ page })
      .include('[data-testid="ayah-interaction-sheet"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await studio.getByRole("button", { name: t(language, "common.back"), exact: true }).click();
    await expect(imageAction).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}
