import { expect, test } from "@playwright/test";

for (const language of ["ar", "en"] as const) {
  test(`reading progress remains 8px across widths in ${language}`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/azkar/morning/1");
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const chrome = page.getByTestId(width < 768 ? "reader-session-chrome" : "reader-desktop-hero");
      const bar = chrome.getByRole("progressbar");
      await expect(bar).toBeVisible();
      await expect(bar).toHaveCSS("height", "8px");
      await expect(bar).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
      await expect(bar).toHaveAttribute("aria-valuenow", "0");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `output/playwright/reading-progress/reader-${language}-${width}.png` });
    }
  });
}
