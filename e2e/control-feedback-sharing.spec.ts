import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";
import { sharingStep } from "./helpers/sharing";

for (const language of ["ar", "en"] as const) {
  test(`labelled footer and persistent icons-only choice in ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, routineModes: { morning: "complete" } },
            profile: { isGuest: true },
          }),
        );
    }, language);
    await page.goto("/#/azkar/morning/1");
    const row = page.locator(".reader-tools-row");
    const actions = row.locator("button[data-press-compact]");
    await expect(actions).toHaveCount(4);
    for (const button of await actions.all()) {
      const bounds = (await button.boundingBox())!;
      expect(bounds.width).toBeGreaterThanOrEqual(52);
      expect(bounds.height).toBeGreaterThanOrEqual(52);
      await expect(button.locator(".reader-tool-label")).toBeVisible();
    }
    expect(await page.locator(".app-shell").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`footer-${language}-labels.png`) });
    if (language === "en") {
      const counter = page.getByTestId("counter-surface");
      const count = await counter.getAttribute("aria-label");
      const toggle = page.getByTestId("reader-language-toggle");
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("reader-main-translation")).toBeVisible();
      await expect(toggle).toHaveAccessibleName(t(language, "reader.showArabic"));
      await expect(page.getByTestId("zikr-text")).toHaveCount(0);
      await expect(counter).toHaveAttribute("aria-label", count!);
      await page.screenshot({ path: testInfo.outputPath("reader-english-meaning.png") });
      await toggle.press("Space");
      await expect(page.getByTestId("reader-main-translation")).toHaveCount(0);
      await expect(counter).toHaveAttribute("aria-label", count!);
    } else await expect(page.getByTestId("reader-language-toggle")).toHaveCount(0);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(await page.locator(".app-shell").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    for (const button of await actions.all()) {
      expect(await button.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      await expect(button).toBeInViewport();
    }
    await page.screenshot({ path: testInfo.outputPath(`footer-${language}-200percent.png`) });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await page.goto("/#/settings/reading");
    await page.getByRole("radio", { name: t(language, "settings.iconsOnly"), exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-reader-tool-labels", "false");
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.readerToolLabels))
      .toBe(false);
    await page.reload();
    await expect(page.getByRole("radio", { name: t(language, "settings.iconsOnly"), exact: true })).toBeChecked();
    await page.goto("/#/azkar/morning/1");
    await expect(actions).toHaveCount(4);
    await expect(page.getByTestId("counter-surface")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const button of await actions.all()) {
      await expect(button.locator(".reader-tool-label")).toBeHidden();
      expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(52);
    }
    await page.screenshot({ path: testInfo.outputPath(`footer-${language}-icons.png`) });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual(
      [],
    );
  });

  test(`Home sharing has no redundant back and no phone preview overlap in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await fixtureReminderCatalogue(page);
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({ settings: { language, reduceMotion: false }, profile: { isGuest: true } }),
        );
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
      Object.defineProperty(navigator, "share", { configurable: true, value: async () => {} });
    }, language);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/#/home");
    const share = page.getByTestId("daily-evidence-share");
    await share.focus();
    await page.keyboard.down(" ");
    await expect(share).toHaveAttribute("data-key-pressed", "");
    await expect.poll(() => share.evaluate((node) => getComputedStyle(node).transform)).not.toBe("none");
    await page.keyboard.up(" ");
    const modal = page.getByTestId("collection-share-modal");
    await expect(modal.getByRole("img")).toBeVisible();
    await expect(modal.getByRole("button", { name: t(language, "shareStudio.previousStep"), exact: true })).toHaveCount(
      0,
    );
    const preview = modal.getByTestId("sharing-preview");
    await expect(preview).toHaveCSS("position", "static");
    const body = modal.getByTestId("sharing-scroll");
    for (const scroll of [120, 300, 80, 0]) {
      await body.evaluate((node, scroll) => {
        node.scrollTop = scroll;
      }, scroll);
      const p = (await preview.boundingBox())!;
      const fields = (await modal.getByTestId("sharing-settings").boundingBox())!;
      expect(fields.y).toBeGreaterThanOrEqual(p.y + p.height - 1);
    }
    await sharingStep(modal, "share");
    const exports = modal.getByTestId("sharing-export-actions");
    await expect(exports.getByRole("button")).toHaveCount(3);
    const bounds = await exports.getByRole("button").evaluateAll((buttons) =>
      buttons.map((button) => ({
        height: button.getBoundingClientRect().height,
        width: button.getBoundingClientRect().width,
      })),
    );
    expect(new Set(bounds.map((b) => b.height)).size).toBe(1);
    for (const b of bounds) expect(b.height).toBeGreaterThanOrEqual(48);
    await page.screenshot({ path: testInfo.outputPath(`sharing-${language}-consistent-actions.png`) });
    // In-app reduction must win with the OS preference explicitly disabled.
    await modal.getByTestId("modal-close-button").click();
    await page.evaluate(() => document.documentElement.classList.add("reduce-motion"));
    await share.focus();
    await page.keyboard.down(" ");
    await expect(share).toHaveAttribute("data-key-pressed", "");
    await expect(share).toHaveCSS("transform", "none");
    await page.keyboard.up(" ");
    await page.evaluate(() => document.documentElement.classList.remove("reduce-motion"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await modal.getByTestId("modal-close-button").click();
    await share.focus();
    await page.keyboard.down(" ");
    await expect(share).toHaveAttribute("data-key-pressed", "");
    await expect(share).toHaveCSS("transform", "none");
    await page.keyboard.up(" ");
  });
}
