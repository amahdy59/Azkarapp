import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test.describe(language, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 900 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({ settings: { language, reduceMotion: false }, profile: { isGuest: true } }),
        );
      }, language);
    });

    test(`Home cues share keyboard feedback and both still alternatives in ${language} @cross-browser`, async ({
      page,
    }, info) => {
      await page.goto("/#/home");
      const action = page.getByTestId("home-tool-masbaha");
      const cue = action.locator(".control-cue").first();
      await expect(action).toBeVisible();
      await action.scrollIntoViewIfNeeded();
      await page.keyboard.press("Tab");
      await action.focus();
      await expect(cue).toHaveCSS("scale", "1.08");
      await expect(cue).toHaveCSS("transition-property", "scale");
      const arrow = action.locator("[data-rtl-flip]");
      const rotation = await arrow.evaluate((node) => getComputedStyle(node).transform);
      await page.screenshot({ path: info.outputPath(`keyboard-cue-${language}.png`) });
      await page.keyboard.down(" ");
      await expect(action).toHaveAttribute("data-key-pressed", "");
      await page.keyboard.press("Escape");
      await expect(action).not.toHaveAttribute("data-key-pressed");
      // Cancel through real focus loss; optional neighboring actions vary by
      // settings, and Tab from the last button may enter browser chrome.
      await action.evaluate((node) => (node as HTMLElement).blur());
      await expect(action).not.toBeFocused();
      await page.keyboard.up(" ");
      await expect(page).toHaveURL(/#\/home$/);
      if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
        await action.evaluate((node) => (node as HTMLElement).blur());
        await action.hover();
        await expect(cue).toHaveCSS("scale", "1.08");
        await page.mouse.move(0, 0);
      }
      await action.focus();
      await page.evaluate(() => document.documentElement.classList.add("reduce-motion"));
      await expect(cue).toHaveCSS("scale", "1");
      await page.keyboard.down(" ");
      await expect(action).toHaveCSS("transform", "none");
      await expect(action).toHaveCSS("opacity", "0.88");
      await action.evaluate((node) => (node as HTMLElement).blur());
      await expect(action).not.toBeFocused();
      await page.keyboard.up(" ");
      await page.evaluate(() => document.documentElement.classList.remove("reduce-motion"));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await action.focus();
      await expect(cue).toHaveCSS("scale", "1");
      await expect(arrow).toHaveCSS("transform", rotation);
      await page.screenshot({ path: info.outputPath(`still-cue-${language}.png`) });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await action.evaluate((node) => node.setAttribute("aria-disabled", "true"));
      await expect(cue).toHaveCSS("scale", "1");
      await action.evaluate((node) => node.removeAttribute("aria-disabled"));
      await expect(cue).toHaveCSS("scale", "1.08");
      // A pointer begins a new interaction; it cannot leave an old key press latched.
      await page.keyboard.down(" ");
      await page.mouse.move(0, 0);
      await page.mouse.down();
      await expect(action).not.toHaveAttribute("data-key-pressed");
      await page.mouse.up();
      await action.evaluate((node) => (node as HTMLElement).blur());
      await page.keyboard.up(" ");
    });

    test(`native slider engagement retains immediate values in ${language} @cross-browser`, async ({ page }, info) => {
      await page.route("https://verses.quran.foundation/**", (route) => route.abort());
      await page.goto("/#/quran/42");
      await expect(page.locator(".mushaf-paper")).toBeVisible();
      const direct = page.getByTestId("mushaf-settings-trigger");
      if (await direct.isVisible()) await direct.click();
      else {
        await page.locator('[data-testid="mushaf-more-actions"], [data-testid="mushaf-rail-more"]').click();
        await page.getByTestId("mushaf-quick-settings").click();
      }
      const slider = page.getByRole("slider", { name: t(language, "mushaf.magnification"), exact: true });
      await page.keyboard.press("Tab");
      await slider.focus();
      await slider.press("Home");
      await expect(slider).toHaveCSS("outline-style", "solid");
      await expect(slider).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      expect(await slider.evaluate((node) => getComputedStyle(node).transitionProperty)).toContain("background-color");
      await slider.press("ArrowUp");
      await expect(slider).toHaveValue("125");
      await expect(slider).toHaveAttribute("aria-valuetext", language === "ar" ? "١٢٥%" : "125%");
      await expect(slider).not.toHaveAttribute("data-key-pressed");
      await page.screenshot({ path: info.outputPath(`slider-engaged-${language}.png`) });
      for (const preference of ["app", "os"] as const) {
        if (preference === "app") await page.evaluate(() => document.documentElement.classList.add("reduce-motion"));
        else {
          await page.evaluate(() => document.documentElement.classList.remove("reduce-motion"));
          await page.emulateMedia({ reducedMotion: "reduce" });
        }
        await slider.press("End");
        await expect(slider).toHaveValue("200");
        await expect(slider).toHaveCSS("outline-style", "solid");
        const duration = await slider.evaluate((node) => parseFloat(getComputedStyle(node).transitionDuration));
        expect(duration).toBeLessThanOrEqual(0.1);
        await slider.press("Home");
        await expect(slider).toHaveValue("100");
      }
      await slider.evaluate((node) => ((node as HTMLInputElement).disabled = true));
      await page.getByRole("button", { name: t(language, "mushaf.magnificationReset"), exact: true }).focus();
      await expect(slider).toHaveCSS("box-shadow", "none");
      await expect(slider).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    });
  });
}
