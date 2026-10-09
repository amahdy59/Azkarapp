import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`Reader contextual menus preserve settings, geometry and focus in ${language} @cross-browser`, async ({
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
    for (const width of [320, 390, 599, 1440]) {
      await page.setViewportSize({ width, height: 740 });
      await page.goto("/#/azkar/morning/1");
      const aa = page.getByTestId("reader-settings-button");
      await aa.focus();
      await page.keyboard.press("Enter");
      const appearance = page.getByTestId("reader-appearance-menu");
      await expect(appearance).toHaveAttribute("role", "menu");
      await expect(page.getByTestId("reader-display-settings-sheet")).toHaveCount(0);
      const sizes = appearance.locator('[data-testid^="reader-display-text-size-"]');
      await expect(sizes).toHaveCount(3);
      for (const choice of await sizes.all()) {
        await expect
          .poll(async () => {
            const bounds = await choice.boundingBox();
            return Boolean(bounds && bounds.width >= 44 && bounds.height >= 44);
          })
          .toBe(true);
      }
      await page.getByTestId("reader-display-text-size-large").focus();
      await page.keyboard.press("ArrowUp");
      await expect(page.getByTestId("reader-display-text-size-medium")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("reader-display-text-size-medium")).toHaveAttribute("aria-checked", "true");
      const core = appearance.getByRole("menuitemradio", { name: ar ? "مختصرة" : "Core", exact: true });
      await core.click();
      await expect(core).toHaveAttribute("aria-checked", "true");
      await appearance.getByRole("menuitemradio", { name: ar ? "كاملة" : "Complete", exact: true }).click();
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="reader-appearance-menu"]').analyze()).violations,
      ).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(aa).toBeFocused();
      const trigger = page.getByRole("button", { name: ar ? "خيارات القارئ" : "Reader options", exact: true });
      await trigger.click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(page.getByTestId("reader-options-sheet")).toHaveCount(0);
      await expect(menu.locator('[data-testid^="reader-display-text-size-"]')).toHaveCount(0);
      await expect(menu.getByRole("menuitem", { name: ar ? "حفظ الذكر" : "Save zikr", exact: true })).toBeVisible();
      await expect(
        menu
          .getByTestId("reader-counter-sound-toggle-mobile")
          .or(menu.getByTestId("reader-counter-sound-toggle-desktop")),
      ).toBeVisible();
      await expect(menu.getByTestId("reader-menu-share-collection")).toHaveCount(0);
      await expect(
        menu.getByRole("menuitem", {
          name: ar ? /الاستماع|الترجمة الإنجليزية|العدد المحدد/ : /Listen|English translation|prescribed/,
        }),
      ).toHaveCount(0);
      await expect(page.getByTestId("reader-share-dock-button")).toBeVisible();
      await page.keyboard.press("ArrowDown");
      expect(await menu.evaluate((el) => el.contains(document.activeElement))).toBe(true);
      const bounds = (await menu.boundingBox())!,
        anchor = (await trigger.boundingBox())!;
      expect(bounds.width).toBeLessThanOrEqual(width - 16);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      expect(Math.abs(bounds.y - (anchor.y + anchor.height))).toBeLessThanOrEqual(16);
      expect((await new AxeBuilder({ page }).include('[role="menu"]').analyze()).violations).toEqual([]);
      await page.screenshot({
        path: `output/playwright/reader-options/${testInfo.project.name}-${language}-${width}.png`,
      });
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
  });
}
