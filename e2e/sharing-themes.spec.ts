import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const themeMode of ["light", "midnight", "dark"] as const) {
  test(`sharing controls retain readable selection and contrast in ${themeMode}`, async ({ page }, testInfo) => {
    await page.addInitScript((themeMode) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: "ar", themeMode, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, themeMode);
    await page.goto("./#/azkar/morning");
    await page.getByTestId("share-collection-button").click();
    const modal = page.getByTestId("collection-share-modal");
    await expect(modal.getByRole("img").first()).toBeVisible();
    await expect(modal.getByText("جارٍ تجهيز بقية البطاقات…")).toHaveCount(0);
    const settings = modal.getByText("إعدادات الصورة", { exact: true }).locator("xpath=ancestor::details[1]");
    if (!(await settings.evaluate((element) => (element as HTMLDetailsElement).open)))
      await settings.locator("summary").click();
    const selected = modal.getByRole("button", { name: "زيتوني · نهاري", exact: true });
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(selected.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    await modal.getByRole("combobox", { name: "مقاس الصورة" }).click();
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`sharing-${themeMode}-menu.png`) });
    await page.keyboard.press("Escape");
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("combobox", { name: "مقاس الصورة" })).toBeFocused();
  });
}
