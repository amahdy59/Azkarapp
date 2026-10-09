import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`surah playback keeps controls reachable and Benefit in reading ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
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
        Object.defineProperty(this, "duration", { configurable: true, value: 120 });
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      };
    }, language);
    await page.route("https://verses.quran.foundation/fonts/**", (route) => route.abort());
    for (const id of ["friday-kahf", "s-hm-110a", "s-hm-110b"]) {
      const route =
        id === "friday-kahf"
          ? "friday-kahf/1"
          : `before-sleep/${getAzkarForMode("before_sleep", "complete").findIndex((z) => z.id === id) + 1}`;
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(`/#/azkar/${route}`);
      await page.getByRole("button", { name: t(language, "reader.listenToSurah"), exact: true }).click();
      const player = page.getByRole("region", { name: t(language, "audioPlayer.region"), exact: true });
      const benefit = page.getByTestId("surah-reading-actions").getByTestId("reader-benefit-dock-button");
      await expect(player.getByTestId("reader-benefit-dock-button")).toHaveCount(0);
      await expect(benefit).toBeVisible();
      await benefit.click();
      await expect(page.getByTestId("reference-sheet")).toBeVisible();
      await page.keyboard.press("Escape");
      await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      await expect(player.getByTestId("reader-benefit-dock-button")).toHaveCount(0);
      for (const size of [
        { width: 360, height: 740 },
        { width: 320, height: 568 },
      ]) {
        await page.setViewportSize(size);
        const layout = player.locator(".audio-expanded-layout");
        await layout.evaluate((el) => (el.scrollTop = el.scrollHeight));
        const bounds = (await player.boundingBox())!;
        const buttons = await player.locator(".audio-expanded-controls").getByRole("button").all();
        for (const button of buttons) {
          await button.scrollIntoViewIfNeeded();
          const box = (await button.boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(bounds.x - 1);
          expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
          expect(box.y).toBeGreaterThanOrEqual(bounds.y - 1);
          expect(box.y + box.height).toBeLessThanOrEqual(Math.min(bounds.y + bounds.height, size.height) + 1);
          await expect(button).toBeInViewport({ ratio: 1 });
        }
      }
      await player.screenshot({ path: testInfo.outputPath(`${id}-${language}-controls.png`) });
      await player.getByRole("button", { name: t(language, "audioPlayer.stop"), exact: true }).click();
      await expect(page.getByTestId("reader-mushaf-button")).toBeFocused();
    }
  });
}

test("short Quran recordings show complete canonical Mushaf excerpts offline from page fonts", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", routineMode: "complete", reduceMotion: true },
        routineMode: "complete",
        profile: { isGuest: true },
      }),
    );
    HTMLMediaElement.prototype.play = function () {
      this.dispatchEvent(new Event("playing"));
      return Promise.resolve();
    };
  });
  await page.route("https://verses.quran.foundation/fonts/**", (route) => route.abort());
  const items = getAzkarForMode("morning", "complete");
  for (const id of ["m-hm-75", "m-hm-76a", "m-hm-76b", "m-hm-76c"]) {
    await page.goto(`/#/azkar/morning/${items.findIndex((z) => z.id === id) + 1}`);
    await page.getByTestId("reader-audio-dock-button").click();
    await page.getByRole("button", { name: t("ar", "audioPlayer.expand"), exact: true }).click();
    await expect(page.getByTestId("mushaf-excerpt")).toBeVisible();
    expect(
      await page.getByTestId("mushaf-excerpt").evaluate((el) => el.scrollWidth - el.clientWidth),
    ).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: t("ar", "audioPlayer.stop"), exact: true }).click();
  }
});
