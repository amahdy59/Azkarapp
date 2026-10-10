import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

const passages = [
  { category: "morning", route: "morning", id: "m-hm-75" },
  { category: "morning", route: "morning", id: "m-hm-76a" },
  { category: "morning", route: "morning", id: "m-hm-76b" },
  { category: "morning", route: "morning", id: "m-hm-76c" },
  { category: "before_sleep", route: "before-sleep", id: "s-hm-101" },
  { category: "before_sleep", route: "before-sleep", id: "s-hm-109a" },
] as const;
for (const language of ["ar", "en"] as const) {
  for (const passage of passages) {
    test(`Quran typography matches reader and playback ${language}/${passage.id} @cross-browser`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, routineMode: "complete", reduceMotion: true },
            routineMode: "complete",
            profile: { isGuest: true },
          }),
        );
        HTMLMediaElement.prototype.play = function () {
          this.dispatchEvent(new Event("playing"));
          return Promise.resolve();
        };
      }, language);
      const position = getAzkarForMode(passage.category, "complete").findIndex((z) => z.id === passage.id) + 1;
      expect(position).toBeGreaterThan(0);
      await page.route("https://verses.quran.foundation/fonts/**", (route) => route.abort());
      await page.goto(`/#/azkar/${passage.route}/${position}`);
      const reader = page.getByTestId("zikr-text");
      await expect(reader).toBeVisible();
      await page.evaluate(async () => {
        await document.fonts.load('24px "Amiri Quran"');
      });
      const metrics = (el: HTMLElement) => {
        const css = getComputedStyle(el);
        return {
          family: css.fontFamily,
          size: css.fontSize,
          weight: css.fontWeight,
          leading: css.lineHeight,
          synthesis: css.fontSynthesis,
        };
      };
      const reading = await reader.evaluate(metrics);
      expect(reading.family).toContain("Amiri Quran");
      expect(reading.weight).toBe("400");
      await page.getByTestId("reader-audio-dock-button").click();
      await page.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      const excerpt = page.getByTestId("mushaf-excerpt");
      await expect(excerpt).toBeVisible();
      expect(await excerpt.evaluate(metrics)).toEqual(reading);
      for (const width of [320, 390, 820, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        await expect(page.getByTestId("reader-screen")).toHaveAttribute(
          "data-reader-layout",
          width >= 768 ? "desktop" : "mobile",
        );
        const expand = page.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true });
        await expect
          .poll(async () => {
            if (await expand.isVisible()) await expand.click();
            return excerpt.isVisible();
          })
          .toBe(true);
        await expect(excerpt).toBeVisible();
        expect(await excerpt.evaluate(metrics)).toEqual(reading);
        expect(await excerpt.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
        expect(
          await excerpt
            .locator("span")
            .evaluateAll((els) => els.every((el) => getComputedStyle(el).transform === "none")),
        ).toBe(true);
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reader-layout", "mobile");
      const expand = page.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true });
      await expect
        .poll(async () => {
          if (await expand.isVisible()) await expand.click();
          return excerpt.isVisible();
        })
        .toBe(true);
      await expect(excerpt).toBeVisible();
      await page.locator("html").evaluate((el) => {
        el.style.fontSize = "32px";
      });
      await expect
        .poll(async () => parseFloat((await excerpt.evaluate(metrics)).size))
        .toBeCloseTo(parseFloat(reading.size) * 2);
      expect(await excerpt.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({ path: info.outputPath("uniform-quran-snippet.png") });
    });
  }
}
