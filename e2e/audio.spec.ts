import { expect, test } from "@playwright/test";

async function enterEnglishGuestMode(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__audioPlayCalls", { value: 0, writable: true });
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { __audioPlayCalls: number }).__audioPlayCalls += 1;
      return Promise.resolve();
    };
  });
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-morning").click();
}

test("unreviewed audio is unavailable and never autoplays", async ({ page }) => {
  await enterEnglishGuestMode(page);
  const playAll = page.getByRole("button", { name: "Play All Audio" });
  await expect(playAll).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __audioPlayCalls: number }).__audioPlayCalls)).toBe(0);
});

test("Core Reader keeps the same stable zikr identity as its filtered routine", async ({ page }) => {
  await enterEnglishGuestMode(page);
  await page.getByTestId("routine-mode-filter").click();
  await page.getByRole("menuitemradio", { name: /^Core ·/ }).click();
  await page.getByRole("button", { name: "Start Session", exact: true }).click();
  const reader = page.getByTestId("reader-screen");
  await expect(reader).toHaveAttribute("data-zikr-id", "m-hm-77m");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(reader).toHaveAttribute("data-zikr-id", "m-hm-75");
  expect(await page.evaluate(() => (window as unknown as { __audioPlayCalls: number }).__audioPlayCalls)).toBe(0);
});

test("the shared player replaces the current zikr counter while listening", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", reduceMotion: true },
        profile: { displayName: "Guest", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [], friday_kahf: [] },
        sessions: [],
      }),
    );
    HTMLMediaElement.prototype.play = () => Promise.resolve();
  });
  await page.goto("/#/azkar/evening/1");

  await expect(page.getByTestId("reader-counter-stack")).toBeVisible();
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Play audio once", exact: true }).click();

  await expect(page.getByRole("region", { name: "Audio player" })).toBeVisible();
  await expect(page.getByTestId("reader-counter-stack")).toHaveCount(0);
});

test("Al-Kahf queues an intentional listen press while the audio module loads", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [], friday_kahf: [] },
        sessions: [],
      }),
    );
    Object.defineProperty(window, "__audioPlayCalls", { value: 0, writable: true });
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { __audioPlayCalls: number }).__audioPlayCalls += 1;
      return Promise.resolve();
    };
  });

  await page.route("**/assets/audio-*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    await route.continue();
  });
  await page.goto("/#/azkar/friday-kahf/1");
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  const listen = page.getByRole("button", { name: "الاستماع للسورة", exact: true });
  await expect(listen).toBeEnabled();
  await listen.click();
  await expect(listen).toHaveAttribute("aria-busy", "true");
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __audioPlayCalls: number }).__audioPlayCalls))
    .toBeGreaterThan(0);

  const player = page.getByRole("region", { name: "مشغل الصوت" });
  await expect(player).toHaveAttribute("data-variant", "compact");
  await player.getByRole("button", { name: "توسيع المشغل" }).click();
  await expect(player).toHaveAttribute("data-variant", "expanded");
  await expect(player.getByRole("slider", { name: "تقديم أو تأخير الصوت" })).toHaveAttribute(
    "style",
    /linear-gradient\(to left/,
  );
  await player.getByRole("button", { name: /كتم الصوت/ }).click();
  await expect(player.getByRole("slider", { name: "مستوى الصوت" })).toHaveAttribute("aria-orientation", "vertical");
});

test("desktop audio dock stays inside the main canvas and reveals volume on hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", reduceMotion: true },
        profile: { displayName: "Guest", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [], friday_kahf: [] },
        sessions: [],
      }),
    );
    HTMLMediaElement.prototype.play = () => Promise.resolve();
  });
  await page.goto("/#/azkar/friday-kahf/1");
  await page.getByRole("button", { name: "الاستماع للسورة", exact: true }).click();

  const player = page.getByRole("region", { name: "مشغل الصوت" });
  const compactProgress = player.getByTestId("audio-compact-progress");
  const volume = player.getByRole("button", { name: /كتم الصوت/ });
  await volume.hover();
  const volumeSlider = player.getByRole("slider", { name: "مستوى الصوت" });
  await expect(volumeSlider).toBeVisible();

  // The invisible bridge belongs to the popover's hit area, so travelling
  // from the speaker to the slider cannot dismiss it before it is usable.
  const [volumeBox, sliderBox] = await Promise.all([volume.boundingBox(), volumeSlider.boundingBox()]);
  expect(volumeBox && sliderBox).toBeTruthy();
  if (volumeBox && sliderBox) {
    expect(Math.abs(volumeBox.x + volumeBox.width / 2 - (sliderBox.x + sliderBox.width / 2))).toBeLessThanOrEqual(2);
    await page.mouse.move(volumeBox.x + volumeBox.width / 2, volumeBox.y + volumeBox.height / 2);
    await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2, { steps: 12 });
  }
  await expect(volumeSlider).toBeVisible();
  await volumeSlider.click({ position: { x: 4, y: 88 } });
  await expect.poll(() => volumeSlider.inputValue()).not.toBe("1");

  const [mainBox, playerBox] = await Promise.all([page.locator(".app-main").boundingBox(), player.boundingBox()]);
  expect(mainBox && playerBox).toBeTruthy();
  if (mainBox && playerBox) {
    expect(playerBox.x).toBeGreaterThanOrEqual(mainBox.x);
    expect(playerBox.x + playerBox.width).toBeLessThanOrEqual(mainBox.x + mainBox.width + 1);
  }

  const progressBox = await compactProgress.boundingBox();
  expect(progressBox && playerBox).toBeTruthy();
  if (progressBox && playerBox) {
    expect(progressBox.x).toBeGreaterThan(playerBox.x);
    expect(progressBox.x + progressBox.width).toBeLessThan(playerBox.x + playerBox.width);
  }
});
