import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

test.use({ serviceWorkers: "block" });
for (const language of ["ar", "en"] as const)
  for (const scenario of [
    { width: 320, height: 900, scale: 2, material: "solid" },
    { width: 390, height: 844, scale: 1, material: "glass" },
    { width: 834, height: 1000, scale: 1, material: "solid" },
    { width: 1440, height: 1000, scale: 1, material: "glass" },
  ]) {
    test(`protected audio options hierarchy ${language}-${scenario.width} @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize(scenario);
      await page.addInitScript(
        ({ language, scenario }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                reduceMotion: true,
                appMaterial: scenario.material,
                themeMode: scenario.material === "glass" ? "midnight" : "light",
              },
              profile: { isGuest: true },
            }),
          );
          // Deterministic media for presentation/keyboard checks; exact source
          // decode and file integrity are verified independently by the media audit.
          HTMLMediaElement.prototype.play = function () {
            Object.defineProperty(this, "duration", { configurable: true, value: 700 });
            this.dispatchEvent(new Event("loadedmetadata"));
            this.dispatchEvent(new Event("playing"));
            return Promise.resolve();
          };
        },
        { language, scenario },
      );
      const index = getAzkarForMode("before_sleep", "complete").findIndex((item) => item.id === "s-hm-110b");
      await page.goto(`/#/azkar/before-sleep/${index + 1}?mode=complete`);
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, scenario.scale);
      await page.getByRole("button", { name: t(language, "reader.listenToSurah"), exact: true }).click();
      const player = page.getByRole("region", { name: t(language, "audioPlayer.region"), exact: true });
      await expect(player).toBeVisible();
      await page.getByTestId("audio-compact-title").click();
      const trigger = page.getByRole("button", { name: t(language, "audioPlayer.options"), exact: true });
      const docked = await player.getByTestId("audio-options-sidebar").isVisible();
      if (!docked) await trigger.click();
      const panel = page
        .getByRole("dialog", { name: t(language, "audioPlayer.options"), exact: true })
        .or(player.getByTestId("audio-options-sidebar"));
      const reading = panel.locator(".audio-reading-options");
      await expect(reading).not.toHaveAttribute("open");
      await expect(panel.locator(".audio-speed-select")).toContainText("×");
      const reciter = panel.getByTestId("audio-reciter-select");
      await reciter.click();
      const menu = page.getByRole("listbox");
      await expect(page.getByRole("option")).toHaveCount(4);
      await expect
        .poll(() =>
          menu.evaluate((element) => {
            const box = element.getBoundingClientRect(),
              css = getComputedStyle(element);
            return {
              opaque: /^(?:rgb|color)\([^/]+\)$/.test(css.backgroundColor) && Number(css.opacity) === 1,
              inside: box.left >= 0 && box.right <= innerWidth + 1 && box.top >= 0 && box.bottom <= innerHeight + 1,
              hit: element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)),
              overflow: element.scrollWidth - element.clientWidth <= 1,
            };
          }),
        )
        .toEqual({ opaque: true, inside: true, hit: true, overflow: true });
      await page.screenshot({ path: info.outputPath(`reciters-${language}-${scenario.width}.png`) });
      await page.keyboard.press("Escape");
      await expect(reciter).toBeFocused();
      await expect(panel).toBeVisible();
      await reading.locator("summary").click();
      await expect(reading).toHaveAttribute("open", "");
      await expect(
        reading.getByRole("slider", { name: t(language, "mushaf.magnification"), exact: true }),
      ).toBeVisible();
      await page.screenshot({ path: info.outputPath(`options-${language}-${scenario.width}.png`) });
      expect((await new AxeBuilder({ page }).include(".audio-options-menu").analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.keyboard.press("Escape");
      await expect(panel).toHaveCount(0);
      if (docked) await expect(player).toHaveAttribute("data-variant", "compact");
      else await expect(trigger).toBeFocused();
    });
  }
