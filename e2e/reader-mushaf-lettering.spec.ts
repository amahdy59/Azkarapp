import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

const passages = [
  { category: "morning", route: "morning", id: "m-hm-75", page: 42 },
  { category: "morning", route: "morning", id: "m-hm-76a", page: 604 },
  { category: "morning", route: "morning", id: "m-hm-76b", page: 604 },
  { category: "morning", route: "morning", id: "m-hm-76c", page: 604 },
  { category: "before_sleep", route: "before-sleep", id: "s-hm-101", page: 49 },
  { category: "before_sleep", route: "before-sleep", id: "s-hm-109a", page: 603 },
] as const;

for (const language of ["ar", "en"] as const) {
  for (const passage of passages) {
    test(`Reader and listening use actual Mushaf lettering in ${language}/${passage.id} @cross-browser`, async ({
      page,
    }, info) => {
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem("azkarapp.counter-guidance.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, routineModes: { morning: "complete", before_sleep: "complete" }, reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
        HTMLMediaElement.prototype.play = function () {
          this.dispatchEvent(new Event("playing"));
          return Promise.resolve();
        };
      }, language);
      await page.route("https://verses.quran.foundation/fonts/**", (route) => route.abort());
      const position = getAzkarForMode(passage.category, "complete").findIndex((zikr) => zikr.id === passage.id) + 1;
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.goto(`/#/azkar/${passage.route}/${position}`);
      const text = page.getByTestId("zikr-text");
      const glyphs = text.locator("[data-quran-glyph]");
      await expect(glyphs.first()).toBeVisible();
      await expect
        .poll(() => glyphs.first().evaluate((el) => getComputedStyle(el).fontFamily))
        .toContain(`qcf-v2-page-${passage.page}`);
      await expect(page.getByTestId("counter-tap-hint")).toHaveCount(0);
      await expect(page.getByTestId("counter-guidance-reopen")).toHaveCount(0);
      for (const width of [320, 390, 820, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(glyphs.first()).toBeVisible();
        await expect.poll(() => text.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
          .toBeLessThanOrEqual(1);
      }
      if (passage.id === "m-hm-76a") {
        await page.screenshot({ path: info.outputPath(`reader-mushaf-${language}.png`) });
        await page.getByRole("switch", { name: t(language, "settings.showDifficultWords") }).click();
        const word = page.getByTestId("quran-word-help").first();
        await expect(word).toHaveAttribute("data-quran-glyph", "");
        await expect(word).toBeVisible();
        await expect(word).toHaveCSS("font-family", `qcf-v2-page-${passage.page}`);
        await word.click();
        await expect(page.getByTestId("quran-word-popover").or(page.getByRole("dialog"))).toBeVisible();
        await page.keyboard.press("Escape");
        const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
        expect(scan.violations).toEqual([]);
      }
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "32px";
      });
      await expect.poll(() => text.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "";
      });
      await page.getByTestId("reader-audio-dock-button").click();
      await page.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      const excerpt = page.getByTestId("mushaf-excerpt");
      await expect(excerpt).toHaveAttribute("data-mushaf-rendering", "qcf-v2");
      expect(await excerpt.evaluate((el) => getComputedStyle(el).fontFamily)).toContain(`qcf-v2-page-${passage.page}`);
      await page.getByRole("button", { name: t(language, "audioPlayer.stop"), exact: true }).click();
      await expect(excerpt).toHaveCount(0);
    });
  }
}
