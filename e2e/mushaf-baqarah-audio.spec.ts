import { expect, test } from "@playwright/test";

test("Baqarah's right toolbar starts, pauses and resumes the approved recitation @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", reduceMotion: true },
        profile: { isGuest: true },
        khatmahPage: 3,
        quranReadingPosition: { page: 3, surahNumber: 2, juzNumber: 1 },
      }),
    );
    class RecitationAudio extends EventTarget {
      src = "";
      currentTime = 0;
      duration = 120;
      volume = 1;
      muted = false;
      playbackRate = 1;
      paused = true;
      ended = false;
      constructor() {
        super();
        Object.assign(window, { __baqarahAudio: this });
      }
      load() {
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("canplay"));
      }
      play() {
        this.paused = false;
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      }
      pause() {
        this.paused = true;
        this.dispatchEvent(new Event("pause"));
      }
      removeAttribute() {
        this.src = "";
      }
    }
    Object.defineProperty(window, "Audio", { value: RecitationAudio });
  });
  await page.goto("/#/quran/3");
  const listen = page.getByTestId("mushaf-rail-listen");
  await expect(listen).toBeVisible();
  await expect(listen).toBeEnabled();
  await listen.click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __baqarahAudio?: { paused: boolean } }).__baqarahAudio?.paused),
    )
    .toBe(false);
  expect(
    await page.evaluate(() => (window as unknown as { __baqarahAudio: { src: string } }).__baqarahAudio.src),
  ).toContain("002-baqarah");
  await page.evaluate(() => {
    (window as unknown as { __baqarahAudio: { currentTime: number } }).__baqarahAudio.currentTime = 30;
  });
  await listen.click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __baqarahAudio: { paused: boolean } }).__baqarahAudio.paused),
    )
    .toBe(true);
  await listen.click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __baqarahAudio: { paused: boolean } }).__baqarahAudio.paused),
    )
    .toBe(false);
  expect(
    await page.evaluate(
      () => (window as unknown as { __baqarahAudio: { currentTime: number } }).__baqarahAudio.currentTime,
    ),
  ).toBe(30);
});
