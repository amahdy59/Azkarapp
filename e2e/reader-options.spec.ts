import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`Reader options preserve compact settings and focus in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    const ar = language === "ar";
    for (const width of [320, 390, 599]) {
      await page.setViewportSize({ width, height: 740 });
      await page.goto("/#/azkar/morning/1");
      const trigger = page.getByRole("button", { name: ar ? "خيارات القارئ" : "Reader options", exact: true });
      await trigger.click();
      const sheet = page.getByTestId("reader-options-sheet");
      await expect(sheet).toBeVisible();
      await expect(sheet).toHaveAttribute("role", "dialog");
      const textSizes = sheet.getByRole("radiogroup", { name: ar ? "حجم النص" : "Text size" }).getByRole("radio");
      await expect(textSizes).toHaveCount(3);
      for (const radio of await textSizes.all()) {
        await expect
          .poll(async () => {
            const bounds = await radio.boundingBox();
            return Boolean(bounds && bounds.width >= 44 && bounds.height >= 44);
          })
          .toBe(true);
      }
      for (let tab = 0; tab < 6; tab += 1) {
        await page.keyboard.press("Tab");
        expect(await sheet.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      }
      await page.screenshot({
        path: `output/playwright/reader-options/${testInfo.project.name}-${language}-${width}-collapsed.png`,
      });
      await expect(sheet.getByRole("button", { name: ar ? "حفظ الذكر" : "Save zikr", exact: true })).toBeVisible();
      const mode = sheet.getByRole("radiogroup", { name: ar ? "قائمة الأذكار" : "Azkar list" });
      await expect(mode.getByRole("radio", { name: ar ? "كاملة" : "Complete", exact: true })).toBeChecked();
      await mode.getByRole("radio", { name: ar ? "مختصرة" : "Core", exact: true }).click();
      await expect(mode.getByRole("radio", { name: ar ? "مختصرة" : "Core", exact: true })).toBeChecked();
      await mode.getByRole("radio", { name: ar ? "كاملة" : "Complete", exact: true }).click();
      const counter = sheet
        .locator("details")
        .filter({ has: page.locator("summary", { hasText: ar ? "إعدادات العدّاد" : "Counter settings" }) });
      await expect(counter).not.toHaveAttribute("open");
      await counter.locator("summary").click();
      await expect(counter.getByTestId("reader-counter-sound-toggle-mobile")).toBeVisible();
      const more = sheet
        .locator("details")
        .filter({ has: page.locator("summary", { hasText: ar ? "إجراءات إضافية" : "More actions" }) });
      await more.locator("summary").click();
      await expect(sheet.getByTestId("reader-menu-share-collection")).toHaveAccessibleName(
        ar ? "مشاركة مجموعة الأذكار" : "Share this collection",
      );
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="reader-options-sheet"]').analyze()).violations,
      ).toEqual([]);
      const bounds = (await sheet.boundingBox())!;
      expect(bounds.width).toBeLessThanOrEqual(width);
      await page.screenshot({
        path: `output/playwright/reader-options/${testInfo.project.name}-${language}-${width}.png`,
      });
      await page.keyboard.press("Escape");
      await expect(sheet).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("button", { name: ar ? "خيارات القارئ" : "Reader options", exact: true }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByTestId("reader-options-sheet")).toHaveCount(0);
    await expect(page.getByRole("radiogroup", { name: ar ? "قائمة الأذكار" : "Azkar list" })).toBeVisible();
  });
}
