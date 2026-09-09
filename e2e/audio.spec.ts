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

test("Al-Kahf queues an intentional listen press while the audio module loads", async ({ page }) => {
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
  await expect(page.getByTestId("mushaf-immersive")).toBeVisible();

  const listen = page.getByTestId("mushaf-rail-listen");
  await expect(listen).toBeEnabled();
  await listen.click();
  await expect(listen).toHaveAttribute("aria-busy", "true");
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __audioPlayCalls: number }).__audioPlayCalls))
    .toBeGreaterThan(0);
});
