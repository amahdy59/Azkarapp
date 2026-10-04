import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

async function prepareAudio(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (!localStorage.getItem("azkarapp.state.v1"))
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
      );
    class ReviewAudio extends EventTarget {
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
        Object.assign(window, { __reviewAudio: this });
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
    Object.defineProperty(window, "Audio", { value: ReviewAudio });
  });
}

for (const id of ["m-hm-91", "m-hm-96"]) {
  test(`quarantined Arabic ${id} keeps counting and explicit English playback @cross-browser`, async ({ page }) => {
    await prepareAudio(page);
    const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === id);
    await page.goto(`/#/azkar/morning/${index + 1}`);
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", id);
    await expect(page.getByTestId("reader-audio-dock-button")).toBeDisabled();
    const counter = page.getByTestId("counter-surface");
    await counter.click();
    await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
    await page.reload();
    await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
    await page.getByRole("button", { name: "Reader options", exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "Repeat prescribed count", exact: true })).toHaveCount(0);
    await page.getByRole("menuitem", { name: "Play English translation", exact: true }).click();
    const player = page.getByRole("region", { name: "Audio player", exact: true });
    await expect(player).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
      .toContain("/english-george/");
    await player.getByRole("button", { name: "Expand player", exact: true }).click();
    await expect(player.getByTestId("audio-reciter-select")).toContainText("English Translation");
    await player.getByTestId("audio-reciter-select").click();
    await expect(page.getByRole("option", { name: "Abdullah Muhammad", exact: true })).toHaveAttribute("data-disabled");
    await page.keyboard.press("Escape");
    await player.getByRole("button", { name: "Stop audio and close player", exact: true }).click();
    await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
    await expect(page.getByTestId("reader-audio-dock-button")).toBeDisabled();
  });
}

test("Al-Kahf offers only its approved reciter and Escape preserves the expanded player @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  await page.goto("/#/azkar/friday-kahf/1");
  await page.getByRole("button", { name: "Listen to surah", exact: true }).click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await player.getByRole("button", { name: "Expand player", exact: true }).click();
  await expect(player.getByTestId("audio-reciter-select")).toContainText("Muhammad Shari");
  await player.getByTestId("audio-reciter-select").click();
  for (const name of ["English Translation", "Abdullah Muhammad", "Muhammad Moataz"]) {
    await expect(page.getByRole("option", { name, exact: true })).toHaveAttribute("data-disabled");
  }
  await expect(page.getByRole("option", { name: "Muhammad Shari", exact: true })).not.toHaveAttribute("data-disabled");
  await page.keyboard.press("Escape");
  await expect(player).toHaveAttribute("data-variant", "expanded");
  await expect(player.getByTestId("audio-reciter-select")).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
    .toContain("/muhammad-alshara/");
});
