import { expect, test } from "@playwright/test";

test("individual listening keeps manual navigation and waveform seeking independent of automatic continuation @cross-browser", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
    class SeekAudio extends EventTarget {
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
        Object.assign(window, { __seekAudio: this });
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
    Object.defineProperty(window, "Audio", { value: SeekAudio });
  });
  await page.goto("/#/azkar/evening/1");
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Play English translation", exact: true }).click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await expect(player.getByRole("button")).toHaveCount(3); // Close, Play and Expand; context is not a duplicate button.
  await expect(player.getByRole("slider")).toHaveCount(0);
  await player.getByTestId("audio-compact-title").click();
  const continuation = player.getByRole("switch", { name: "Play next zikr automatically" });
  await expect(continuation).toHaveAttribute("aria-checked", "false");
  const reader = page.getByTestId("reader-screen");
  const firstId = await reader.getAttribute("data-zikr-id");
  await player.getByRole("button", { name: "Next item", exact: true }).click();
  await expect(reader).not.toHaveAttribute("data-zikr-id", firstId!);
  await expect(continuation).toHaveAttribute("aria-checked", "false");
  await player.getByRole("button", { name: "Previous item", exact: true }).click();
  await expect(reader).toHaveAttribute("data-zikr-id", firstId!);
  await expect(player.getByTestId("audio-seek-waveform")).toBeVisible();
  const seek = player.getByRole("slider", { name: "Seek audio" });
  const bounds = (await seek.boundingBox())!;
  await seek.click({ position: { x: bounds.width * 0.75, y: bounds.height / 2 } });
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __seekAudio: HTMLMediaElement }).__seekAudio.currentTime))
    .toBeGreaterThan(80);
  await page.mouse.move(bounds.x + bounds.width * 0.2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.6, bounds.y + bounds.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __seekAudio: HTMLMediaElement }).__seekAudio.currentTime))
    .toBeGreaterThan(65);
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __seekAudio: HTMLMediaElement }).__seekAudio.currentTime))
    .toBeLessThan(80);
  await expect(continuation).toHaveAttribute("aria-checked", "false");
});

test("100-count istighfar offers prescribed repeat and shows each repetition", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", reduceMotion: true, routineModes: { morning: "complete" } },
        profile: { displayName: "Guest", isGuest: true },
      }),
    );
    // Deterministic media events exercise controller repetition without CDN timing.
    class TestAudio extends EventTarget {
      src = "";
      currentTime = 0;
      duration = 10;
      volume = 1;
      muted = false;
      playbackRate = 1;
      paused = true;
      ended = false;
      constructor() {
        super();
        Object.assign(window, { repetitionAudio: this });
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
    Object.defineProperty(window, "Audio", { value: TestAudio });
  });
  await page.goto("/#/azkar/morning/24");
  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", "m-hm-96");
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Repeat prescribed count", exact: true }).click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await player.getByRole("button", { name: "Expand player" }).click();
  await expect(player.getByRole("button", { name: "Repeat 100 times", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(player).toContainText("1 / 100");
  await page.evaluate(() =>
    (window as unknown as { repetitionAudio: EventTarget }).repetitionAudio.dispatchEvent(new Event("ended")),
  );
  await expect(player).toContainText("2 / 100");
  await player.getByRole("button", { name: "Repeat 100 times", exact: true }).click();
  await expect(player.getByRole("button", { name: "Repeat 100 times", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await player.getByRole("button", { name: "Stop audio and close player" }).click();
  await expect(page.getByTestId("counter-surface")).toBeFocused();
});

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
    /linear-gradient\(to right/,
  );
  await player.getByRole("button", { name: "مستوى الصوت", exact: true }).click();
  const volume = page.getByTestId("audio-volume-popover").getByRole("slider", { name: "مستوى الصوت" });
  await expect(volume).toBeVisible();
  await expect(volume).toHaveAttribute("aria-orientation", "vertical");
});

test("desktop player stays inside the main canvas and reveals vertical volume on click", async ({ page }, testInfo) => {
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
  await expect(player.getByTestId("audio-compact-progress")).toBeVisible();
  await expect(player.getByRole("slider")).toHaveCount(0);
  await player.getByRole("button", { name: "توسيع المشغل", exact: true }).click();
  const timeline = player.getByRole("slider", { name: "تقديم أو تأخير الصوت" });
  await expect(timeline).toBeVisible();
  const volume = player.getByRole("button", { name: "مستوى الصوت", exact: true });
  await volume.hover();
  await expect(page.getByTestId("audio-volume-popover")).toHaveCount(0);
  await volume.click();
  const popover = page.getByTestId("audio-volume-popover");
  const volumeSlider = popover.getByRole("slider", { name: "مستوى الصوت" });
  await expect(volumeSlider).toBeVisible();
  await expect(volumeSlider).toHaveAttribute("aria-orientation", "vertical");
  const bounds = (await volumeSlider.boundingBox())!;
  expect(bounds.height).toBeGreaterThan(bounds.width);
  const volumeBounds = (await volume.boundingBox())!;
  const panelBounds = (await popover.boundingBox())!;
  expect(
    Math.abs(panelBounds.x + panelBounds.width / 2 - (volumeBounds.x + volumeBounds.width / 2)),
  ).toBeLessThanOrEqual(1);
  await volumeSlider.fill("0.4");
  await expect(volumeSlider).toHaveValue("0.4");
  await page.screenshot({ path: testInfo.outputPath("volume-vertical.png") });
  await page.keyboard.press("Escape");
  await expect(popover).toHaveCount(0);
  await expect(volume).toBeFocused();
  await expect(player).toHaveAttribute("data-variant", "expanded");

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

test("expanded queue controls stay inside a 320px phone viewport", async ({ page }, testInfo) => {
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
  const playAvailable = page.getByRole("button", { name: "Play available" });
  if (await playAvailable.isVisible({ timeout: 1000 }).catch(() => false)) {
    await playAvailable.click();
  }

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
  await expect(page.getByRole("dialog", { name: "Audio player" })).toHaveCount(0);
  const textViewport = player.getByRole("region", { name: "Now playing" });
  expect((await textViewport.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  const voice = player.getByTestId("audio-reciter-select");
  await voice.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(player).toHaveAttribute("data-variant", "expanded");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  for (const button of await player.getByRole("button").all()) {
    const bounds = await button.boundingBox();
    expect(bounds?.width, await button.getAttribute("aria-label")).toBeGreaterThanOrEqual(44);
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
  }
  await player.screenshot({ path: testInfo.outputPath("audio-expanded-320-en.png") });
  await page.keyboard.press("Escape");
  await expect(player).toHaveAttribute("data-variant", "compact");
  await expect(player.getByRole("button", { name: "Expand player" })).toBeFocused();
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
  const playAvailable = page.getByRole("button", { name: "تشغيل المتاح" });
  if (await playAvailable.isVisible().catch(() => false)) {
    await playAvailable.click();
  }

  const reader = page.getByTestId("reader-screen");
  const player = page.getByRole("region", { name: "مشغل الصوت" });

  // 1. Starts on Ayat al-Kursi (s-hm-100) and displays proper surah/verse title (never generic fallback)
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-100");
  await expect(player).toContainText("سورة الْبَقَرَة (آيَةُ الْكُرْسِيِّ)");
  await expect(player).not.toContainText("أذكار مشتركة");
  await expect(player).toContainText("المقطع ١ / ١٨");

  // 2. Moving to another zikr in the Reader updates the active audio track
  // In desktop reader collection navigator, select Surah Al-Ikhlas (index 2 / s-hm-99-ikhlas)
  await page.locator("#zikr-card-2 button[data-zikr-select]").click();
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-99-ikhlas");
  await expect(player).toContainText("سورة الْإِخْلَاص");
  await expect(player).toContainText("المقطع ٣ / ١٨");

  // 3. When current audio track finishes ("ended"), Reader screen updates to the zikr currently being recited
  await page.evaluate(() => {
    const audio = (window as unknown as { __latestAudio: HTMLAudioElement | null }).__latestAudio;
    audio?.dispatchEvent(new Event("ended"));
  });
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-99-falaq");
  await expect(player).toContainText("سورة الْفَلَق");
  await expect(player).toContainText("المقطع ٤ / ١٨");
});

test("expanded audio player on home screen stays within the desktop canvas and page bounds", async ({ page }) => {
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

  // Start audio from an azkar screen
  await page.goto("/#/azkar/friday-kahf/1");
  await page.getByRole("button", { name: "الاستماع للسورة", exact: true }).click();

  const player = page.getByRole("region", { name: "مشغل الصوت" });
  await expect(player).toBeVisible();

  // Navigate back to the Home screen
  await page.getByTestId("nav-home").click();
  await expect(player).toBeVisible();
  await expect(player).toHaveAttribute("data-variant", "compact");

  // Expand the audio player while on the Home screen
  await player.getByRole("button", { name: "توسيع المشغل" }).click();
  await expect(player).toHaveAttribute("data-variant", "expanded");

  // Verify bounding boxes: must stay within the main canvas and not overflow left or right
  const [mainBox, playerBox] = await Promise.all([page.locator(".app-main").boundingBox(), player.boundingBox()]);
  expect(mainBox && playerBox).toBeTruthy();
  if (mainBox && playerBox) {
    expect(playerBox.x).toBeGreaterThanOrEqual(mainBox.x);
    expect(playerBox.x + playerBox.width).toBeLessThanOrEqual(mainBox.x + mainBox.width + 1);
  }

  // The stop/close button on the logical end (left in RTL) must be fully visible and inside the viewport
  const closeButton = player.getByRole("button", { name: "إيقاف الصوت وإغلاق المشغل" });
  await expect(closeButton).toBeVisible();
  const closeBox = await closeButton.boundingBox();
  expect(closeBox).toBeTruthy();
  if (closeBox) {
    expect(closeBox.x).toBeGreaterThanOrEqual(0);
    if (playerBox) {
      expect(closeBox.x).toBeGreaterThanOrEqual(playerBox.x);
      expect(closeBox.x + closeBox.width).toBeLessThanOrEqual(playerBox.x + playerBox.width);
    }
  }
});
