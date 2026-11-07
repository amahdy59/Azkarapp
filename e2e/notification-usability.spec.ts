import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { DEFAULT_APP_STATE } from "../src/app/state";
import { t } from "../src/app/i18n";

const profiles = [
  { width: 390, height: 844, language: "ar", themeMode: "midnight", appMaterial: "solid", large: false },
  { width: 320, height: 760, language: "en", themeMode: "midnight", appMaterial: "glass", large: true },
  { width: 820, height: 1024, language: "ar", themeMode: "midnight", appMaterial: "glass", large: false },
  { width: 1440, height: 1000, language: "en", themeMode: "light", appMaterial: "glass", large: false },
] as const;

for (const profile of profiles) {
  const { language, width, height, large, themeMode, appMaterial } = profile;
  test(`notification preview and permission disclosure at ${width}px in ${language}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.clock.setFixedTime(new Date("2026-11-05T02:00:00Z"));
    const state = structuredClone(DEFAULT_APP_STATE);
    Object.assign(state.settings, {
      language,
      themeMode,
      appMaterial,
      reduceMotion: true,
      reduceTransparency: width === 1440,
    });
    state.settings.reminders.prayer = { enabled: true, leadMinutes: 15, prayers: ["asr"] };
    await page.addInitScript((snapshot) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem("azkarapp.state.v1", JSON.stringify(snapshot));
      Object.defineProperty(window, "Notification", { configurable: true, value: { permission: "granted" } });
    }, state);
    await page.goto("/#/settings/notifications");
    const disclosure = page.getByTestId("notification-permission-details");
    const upcoming = page.getByTestId("notification-upcoming");
    await expect(disclosure).toBeVisible();
    if (large)
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
    await expect(disclosure).not.toHaveAttribute("open");
    await expect(upcoming).toContainText(language === "ar" ? "العصر" : "Asr");
    await expect(upcoming).toContainText("Africa/Cairo");
    await expect(upcoming.locator("time").first()).toHaveAttribute("datetime", /^2026-11-05T/);
    expect(
      await disclosure.evaluate((node) =>
        Boolean(
          node.compareDocumentPosition(document.querySelector('[data-testid="reminder-readiness"]')!) &
          Node.DOCUMENT_POSITION_PRECEDING,
        ),
      ),
    ).toBe(true);
    const preview = upcoming.getByRole("link", { name: t(language, "notifications.preview") }).first();
    await expect(preview).toBeVisible();
    await page.screenshot({ path: info.outputPath("notification-settings.png") });

    await preview.focus();
    await page.keyboard.press("Enter");
    const sheet = page.getByRole("dialog").filter({ has: page.locator("blockquote") });
    await expect(sheet).toBeVisible();
    await expect(sheet.locator("blockquote")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    await expect(sheet.getByRole("link", { name: t(language, "notifications.fullSource") })).toHaveAttribute(
      "href",
      /^https:\/\/sunnah\.com\/bukhari:(555|574)$/,
    );
    const bounds = (await sheet.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const background = await sheet.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).not.toMatch(/transparent|rgba\(|\/\s*(?:0?\.\d+|0)\s*\)/);
    const close = sheet.getByRole("button", { name: t(language, "common.close") });
    expect(
      await close.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return element.contains(hit);
      }),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="evidence-source-sheet"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath("notification-source.png") });
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(preview).toBeFocused();

    await upcoming.getByText(t(language, "notifications.upcoming"), { exact: true }).click();
    await expect(upcoming.getByRole("link", { name: t(language, "notifications.preview") })).toHaveCount(4);
    await disclosure.locator("summary").click();
    await expect(page.getByRole("button", { name: t(language, "notifications.testNotification") })).toBeVisible();
    if (width === 390) {
      const salawat = page.getByRole("switch", { name: t(language, "notifications.fridaySalawat"), exact: true });
      const fasting = page.getByRole("switch", { name: t(language, "notifications.fastingPreparation"), exact: true });
      const overnight = page.getByRole("switch", { name: t(language, "notifications.beforeFajrDua"), exact: true });
      for (const choice of [salawat, fasting, overnight]) await expect(choice).toHaveAttribute("aria-checked", "false");
      await salawat.click();
      await expect(salawat).toHaveAttribute("aria-checked", "true");
      await expect(page.getByText(t(language, "notifications.saved"))).toBeVisible();
      await expect
        .poll(async () =>
          page.evaluate(
            () =>
              JSON.parse(localStorage.getItem("azkarapp.state.v1") ?? "{}").settings?.reminders?.fridaySalawat?.enabled,
          ),
        )
        .toBe(true);
      await page.screenshot({ path: info.outputPath("notification-context-choices.png") });
      await page.getByRole("checkbox", { name: t(language, "notifications.asr"), exact: true }).uncheck();
      await expect(page.getByText(t(language, "notifications.choosePrayer"))).toBeVisible();
    }
  });
}
