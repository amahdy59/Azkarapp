import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { ReleaseNotes } from "../src/app/releaseNotes";
import { t } from "../src/app/i18n";
const history = JSON.parse(readFileSync("src/app/releaseHistory.data.json", "utf8")) as ReleaseNotes[];

for (const language of ["ar", "en"] as const) {
  test(`release history remains readable offline with keyboard disclosure ${language} @cross-browser`, async ({
    page,
    context,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 740 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.route("**/release-notes.json?**", (route) => route.abort());
    await page.goto("/#/settings");
    if (testInfo.project.name === "desktop-chromium") {
      await page.evaluate(async () => navigator.serviceWorker.ready);
      await page.reload();
      await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
      await context.setOffline(true);
      await page.reload();
    }
    await page.getByRole("button", { name: t(language, "settings.aboutHelp"), exact: true }).click();
    await page.getByRole("button", { name: t(language, "about.whatsNew"), exact: true }).click();
    await expect(page.getByText(t(language, "about.releaseNotesOffline"))).toBeVisible();
    const latest = page.getByRole("region", {
      name: t(language, "about.releaseVersion", { release: history[0]!.release }),
    });
    await expect(latest).toContainText(history[0]![language][0]!);
    const disclosure = page.locator("details").first();
    const summary = disclosure.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(disclosure.getByRole("list")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(disclosure).not.toHaveAttribute("open");
    await expect(summary).toBeFocused();
    expect(await page.locator("details").count()).toBe(19);
    await page.getByRole("button", { name: t(language, "about.moreReleases"), exact: true }).click();
    expect(await page.locator("details").count()).toBe(39);
    expect(await page.locator("main").evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await page.evaluate(() => (document.documentElement.style.fontSize = "32px"));
    await expect(latest).toBeVisible();
    await summary.scrollIntoViewIfNeeded();
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(disclosure.getByRole("list")).toBeVisible();
    const violations = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(violations.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`release-history-${language}.png`) });
  });
}
