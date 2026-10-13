import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`reminder permission recovery and quiet switch motion ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((lang) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: lang, reduceMotion: false }, profile: { isGuest: true } }),
      );
      Object.defineProperty(window, "Notification", { configurable: true, value: { permission: "denied" } });
    }, language);
    await page.goto("/#/settings/notifications");
    await expect(page.getByText(t(language, "notifications.permissionDenied"))).toBeVisible();
    await expect(page.getByText(t(language, "notifications.availabilityShort"))).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(Notification, "permission", { configurable: true, value: "granted" });
      window.dispatchEvent(new Event("focus"));
    });
    await expect(page.getByText(t(language, "notifications.permissionGranted"))).toBeVisible();
    const toggle = page.getByRole("switch", { name: t(language, "notifications.morning"), exact: true });
    await toggle.scrollIntoViewIfNeeded();
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    const thumb = toggle.locator(".settings-toggle-thumb");
    await expect
      .poll(() => thumb.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41))
      .toBe(language === "ar" ? -18 : 18);
    expect(await thumb.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("transform, background-color");
    expect(await thumb.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(
      0.001,
    );
    const box = await toggle.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect
      .poll(() => thumb.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration)))
      .toBeGreaterThan(0.01);
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect.poll(() => thumb.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)).toBe(0);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(toggle).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await page.getByText(t(language, "notifications.availabilityShort")).scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`reminders-${language}.png`) });
    await page.evaluate(() => {
      Object.defineProperty(Notification, "permission", { configurable: true, value: "denied" });
      window.dispatchEvent(new Event("focus"));
    });
    await expect(page.getByRole("button", { name: t(language, "notifications.testNotification") })).toHaveCount(0);
  });
}
