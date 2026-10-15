import { expect, test } from "@playwright/test";
import { listeningCases, openListeningPage } from "./helpers/quran-listening";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`Mushaf overlay hides without shrinking pages or interrupting playback ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    const player = await openListeningPage(page, listeningCases[0], language);
    await page.evaluate(() => {
      window.location.hash = "/quran/3";
    });
    await expect(player).toHaveAttribute("data-variant", "compact");
    const paper = page.locator(".mushaf-paper");
    await expect(paper.locator('[data-mushaf-page="3"]')).toBeVisible();
    const height = await paper.evaluate((node) => node.getBoundingClientRect().height);
    const before = await page.evaluate(() => {
      const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
      return { paused: audio.paused, time: audio.currentTime };
    });
    await page.screenshot({ path: testInfo.outputPath(`overlay-phone-${language}.png`) });
    await player.getByRole("button", { name: t(language, "audioPlayer.hidePlayer"), exact: true }).click();
    const show = player.getByRole("button", { name: t(language, "audioPlayer.showPlayer"), exact: true });
    await expect(show).toBeFocused();
    const bounds = (await show.boundingBox())!;
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    expect(await paper.evaluate((node) => node.getBoundingClientRect().height)).toBeCloseTo(height, 0);
    expect(
      await page.evaluate(() => {
        const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
        return { paused: audio.paused, time: audio.currentTime };
      }),
    ).toEqual(before);
    await page.screenshot({ path: testInfo.outputPath(`hidden-phone-${language}.png`) });
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    await expect(show).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await show.click();
    await expect(
      player.getByRole("button", { name: t(language, "audioPlayer.hidePlayer"), exact: true }),
    ).toBeFocused();
    await expect(player.getByRole("slider", { name: t(language, "audioPlayer.seek"), exact: true })).toBeVisible();
  });
}
