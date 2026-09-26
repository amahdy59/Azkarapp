import { expect, test } from "@playwright/test";

async function _enterEnglishGuestMode(page: import("@playwright/test").Page) {
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
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-morning").click();
  await page.getByRole("button", { name: "Start Session", exact: true }).click();
}

test("unreviewed audio is unavailable and never autoplays", async ({ page }) => {
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
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-comprehensive_duas").click();
  const playAll = page.getByRole("button", { name: "Play All Audio" });
  await expect(playAll).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __audioPlayCalls: number }).__audioPlayCalls)).toBe(0);
});

test("Core Reader keeps the same stable zikr identity as its filtered routine", async ({ page }) => {
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

  // Go to Library and click Morning Azkar to enter Category Screen.
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-morning").click();

  // Change the mode, then start session into ReaderScreen.
  await page.getByTestId("routine-mode-filter").click();
  await page.getByRole("menuitemradio", { name: /^Core/ }).click();
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
  await page.getByRole("menuitem", { name: "Play English translation", exact: true }).click();

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
  const compactMinimizeBox = await player.getByRole("button", { name: "توسيع المشغل" }).boundingBox();
  const compactCloseBox = await player.getByRole("button", { name: "إيقاف الصوت وإغلاق المشغل" }).boundingBox();
  const compactPlayBox = await player.getByRole("button", { name: /^(تشغيل الصوت|إيقاف الصوت مؤقتًا)$/ }).boundingBox();
  expect(compactPlayBox?.width).toBeGreaterThanOrEqual(44);
  expect(compactPlayBox?.width).toBeLessThanOrEqual(52);

  await expect(player.getByRole("progressbar", { name: "تقدم الاستماع" })).toBeVisible();
  await player.getByRole("button", { name: "توسيع المشغل" }).click();
  await expect(player).toHaveAttribute("data-variant", "expanded");
  await expect(player.getByRole("progressbar", { name: "تقدم الاستماع" })).toHaveCount(0);

  const expandedPlayBox = await player
    .getByRole("button", { name: /^(تشغيل الصوت|إيقاف الصوت مؤقتًا)$/ })
    .boundingBox();
  expect(expandedPlayBox?.width).toBeGreaterThanOrEqual(60);
  expect(expandedPlayBox?.width).toBeLessThanOrEqual(68);

  const expandedMinimizeBox = await player.getByRole("button", { name: "تصغير المشغل" }).boundingBox();
  const expandedCloseBox = await player.getByRole("button", { name: "إيقاف الصوت وإغلاق المشغل" }).boundingBox();
  expect(compactMinimizeBox && compactCloseBox && expandedMinimizeBox && expandedCloseBox).toBeTruthy();
  if (compactMinimizeBox && compactCloseBox && expandedMinimizeBox && expandedCloseBox) {
    expect(Math.sign(compactMinimizeBox.x - compactCloseBox.x)).toBe(
      Math.sign(expandedMinimizeBox.x - expandedCloseBox.x),
    );
  }
  await expect(player.getByRole("slider", { name: "تقديم أو تأخير الصوت" })).toHaveAttribute(
    "style",
    /linear-gradient\(to left/,
  );
  await player.getByRole("button", { name: /كتم الصوت/ }).click();
  await expect(player.getByRole("slider", { name: "مستوى الصوت" })).toBeVisible();
  await expect(player.getByRole("slider", { name: "مستوى الصوت" })).not.toHaveAttribute("aria-orientation", "vertical");
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
  const timeline = player.getByRole("slider", { name: "تقديم أو تأخير الصوت" });
  await expect(compactProgress).toBeHidden();
  await expect(timeline).toBeVisible();
  const volume = player.getByRole("button", { name: /كتم الصوت/ });
  await volume.hover();
  const volumeSlider = player.getByRole("slider", { name: "مستوى الصوت" });
  await expect(volumeSlider).toBeVisible();

  // The compact control opens inward as a shallow horizontal panel. It keeps
  // the slider near the speaker without covering a tall strip of reading text.
  const [volumeBox, sliderBox] = await Promise.all([volume.boundingBox(), volumeSlider.boundingBox()]);
  expect(volumeBox && sliderBox).toBeTruthy();
  if (volumeBox && sliderBox) {
    expect(Math.abs(volumeBox.y + volumeBox.height / 2 - (sliderBox.y + sliderBox.height / 2))).toBeLessThanOrEqual(64);
    await page.mouse.move(volumeBox.x + volumeBox.width / 2, volumeBox.y + volumeBox.height / 2);
    await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2, { steps: 12 });
  }
  await expect(volumeSlider).toBeVisible();
  await expect(volumeSlider).not.toHaveAttribute("aria-orientation", "vertical");
  await volumeSlider.fill("0.4");
  await expect(volumeSlider).toHaveValue("0.4");

  const [mainBox, playerBox] = await Promise.all([page.locator(".app-main").boundingBox(), player.boundingBox()]);
  expect(mainBox && playerBox).toBeTruthy();
  if (mainBox && playerBox) {
    expect(playerBox.x).toBeGreaterThanOrEqual(mainBox.x);
    expect(playerBox.x + playerBox.width).toBeLessThanOrEqual(mainBox.x + mainBox.width + 1);
  }

  const timelineBox = await timeline.boundingBox();
  expect(timelineBox && playerBox).toBeTruthy();
  if (timelineBox && playerBox) {
    expect(timelineBox.x).toBeGreaterThan(playerBox.x);
    expect(timelineBox.x + timelineBox.width).toBeLessThan(playerBox.x + playerBox.width);
  }
});

test("expanded queue controls stay inside a 320px phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
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
  await page.goto("/#/azkar/morning");
  await page.getByRole("button", { name: "Play All Audio" }).click();
  await page.getByRole("button", { name: "Play available" }).click();

  const player = page.getByRole("region", { name: "Audio player" });
  await player.getByRole("button", { name: "Expand player" }).click();
  await expect(player).toHaveAttribute("data-variant", "expanded");

  const geometry = await player.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const transportButtons = Array.from(element.querySelectorAll("button")).filter((button) =>
      ["Previous item", "Rewind 10 seconds", "Forward 10 seconds", "Next item"].includes(
        button.getAttribute("aria-label") ?? "",
      ),
    );
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      controlsInside: transportButtons.every((button) => {
        const control = button.getBoundingClientRect();
        return control.left >= bounds.left && control.right <= bounds.right;
      }),
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
  expect(geometry.controlsInside).toBe(true);
});

test("synchronizes Reader navigation with audio tracks, shows proper track titles, and advances Reader when a track ends", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "ar",
          themeMode: "midnight",
          reduceMotion: true,
          routineModes: {
            morning: "complete",
            evening: "complete",
            before_sleep: "complete",
            after_prayer: "complete",
          },
        },
        profile: { displayName: "Guest", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [], friday_kahf: [] },
        sessions: [],
      }),
    );
    Object.defineProperty(window, "__latestAudio", { value: null, writable: true });
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { __latestAudio: HTMLAudioElement }).__latestAudio = this as HTMLAudioElement;
      this.dispatchEvent(new Event("playing"));
      return Promise.resolve();
    };
  });

  await page.goto("/#/azkar/before-sleep");
  await page.getByRole("button", { name: "تشغيل الصوتي للكل" }).click();
  await page.getByRole("button", { name: "تشغيل المتاح" }).click();

  const reader = page.getByTestId("reader-screen");
  const player = page.getByRole("region", { name: "مشغل الصوت" });

  // 1. Starts on Ayat al-Kursi (s-hm-100) and displays proper surah/verse title (never generic fallback)
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-100");
  await expect(player).toContainText("سورة الْبَقَرَة (آيَةُ الْكُرْسِيِّ)");
  await expect(player).not.toContainText("أذكار مشتركة");
  await expect(player).toContainText("المقطع ١ / ١٧");

  // 2. Moving to another zikr in the Reader updates the active audio track
  // In desktop reader collection navigator, select Surah Al-Ikhlas (index 2 / s-hm-99-ikhlas)
  await page.locator("#zikr-card-2 button[data-zikr-select]").click();
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-99-ikhlas");
  await expect(player).toContainText("سورة الْإِخْلَاص");
  await expect(player).toContainText("المقطع ٢ / ١٧");

  // 3. When current audio track finishes ("ended"), Reader screen updates to the zikr currently being recited
  await page.evaluate(() => {
    const audio = (window as unknown as { __latestAudio: HTMLAudioElement | null }).__latestAudio;
    audio?.dispatchEvent(new Event("ended"));
  });
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-99-falaq");
  await expect(player).toContainText("سورة الْفَلَق");
  await expect(player).toContainText("المقطع ٣ / ١٧");
});
