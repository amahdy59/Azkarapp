import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const scenario of [
  { width: 390, height: 844, language: "ar", themeMode: "dark" },
  { width: 1440, height: 900, language: "en", themeMode: "light" },
  { width: 320, height: 800, language: "en", themeMode: "light", enlarged: true },
] as const) {
  test(`programmer contacts are readable and actionable ${scenario.width}-${scenario.language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize(scenario);
    await page.addInitScript((settings) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { ...settings, reduceMotion: true, appMaterial: "solid" },
          profile: { isGuest: true },
        }),
      );
    }, scenario);
    await page.goto("/#/settings/about");
    const credits = page.getByTestId("about-programmers");
    await expect(credits).toBeVisible();
    if ("enlarged" in scenario) await page.locator("html").evaluate((node) => (node.style.fontSize = "200%"));
    await page.evaluate(() => document.fonts.ready);
    const brand = page.locator('img[src$="/azkar-icon.svg"]');
    await expect
      .poll(() => brand.first().evaluate((node) => (node as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    const manifestUrl = await page.locator('link[rel="manifest"]').evaluate((link) => (link as HTMLLinkElement).href);
    const manifest = await (await page.request.get(manifestUrl)).json();
    expect(manifest.short_name).toBe("wa-zaker");
    for (const icon of manifest.icons) {
      const response = await page.request.get(new URL(icon.src, manifestUrl).href);
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain("image/png");
    }
    await page.screenshot({ path: info.outputPath("app-brand.png") });

    await expect(credits.getByRole("heading", { name: t(scenario.language, "about.ahmedMahdy") })).toBeVisible();
    await expect(credits.getByRole("heading", { name: t(scenario.language, "about.mohamedHussien") })).toBeVisible();
    const links = credits.getByRole("link");
    await expect(links).toHaveCount(4);
    for (const portrait of await credits.locator("img").all()) {
      await portrait.scrollIntoViewIfNeeded();
      await expect
        .poll(() => portrait.evaluate((img) => img instanceof HTMLImageElement && img.naturalWidth > 0))
        .toBe(true);
    }
    for (const link of await links.all()) {
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      await link.focus();
      await expect(link).toBeFocused();
    }
    expect(await credits.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(1);
    const report = page.getByRole("link", { name: t(scenario.language, "about.reportBug"), exact: true });
    await expect(report).toHaveAttribute("href", /^mailto:amahdy59@yahoo\.com,m\.hussien\.m44@gmail\.com\?subject=/);
    await credits.screenshot({ path: info.outputPath("programmers.png") });
    await report.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("contact-actions.png") });
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-testid="about-programmers"]')
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);

    await page.getByRole("button", { name: t(scenario.language, "about.faq"), exact: true }).click();
    await expect(page).toHaveURL(/settings\/help$/);
    await expect(page.getByRole("heading", { name: t(scenario.language, "help.title"), exact: true })).toBeFocused();
    const reminderQuestion = page.locator("summary").filter({ hasText: t(scenario.language, "help.remindersQ") });
    await reminderQuestion.press("Enter");
    await expect(page.getByText(t(scenario.language, "help.remindersA"))).toBeVisible();
    await page.screenshot({ path: info.outputPath("faq.png") });
    await page.getByRole("link", { name: t(scenario.language, "notifications.title"), exact: true }).click();
    await expect(page).toHaveURL(/settings\/notifications$/);
    await expect(page.getByTestId("reminder-readiness")).toBeVisible();
  });
}
