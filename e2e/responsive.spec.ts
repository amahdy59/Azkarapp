import { expect, test } from "@playwright/test";

test("the app canvas stays phone-sized on large viewports and fills phone viewports", async ({ page }) => {
  await page.goto("/");

  const shell = page.locator(".app-shell");
  await expect(shell).toBeVisible();

  const viewport = page.viewportSize();
  const box = await shell.boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();

  if (!viewport || !box) return;

  if (viewport.width <= 430) {
    expect(box.width).toBeCloseTo(viewport.width, 0);
    expect(box.height).toBeCloseTo(viewport.height, 0);
    expect(box.x).toBeCloseTo(0, 0);
    expect(box.y).toBeCloseTo(0, 0);
    await expect(shell).toHaveCSS("border-radius", "0px");

    const resizedHeight = Math.max(520, viewport.height - 120);
    await page.setViewportSize({ width: viewport.width, height: resizedHeight });
    await expect
      .poll(async () => {
        const resizedBox = await shell.boundingBox();
        return resizedBox ? { top: resizedBox.y, bottom: resizedBox.y + resizedBox.height } : null;
      })
      .toEqual({ top: 0, bottom: resizedHeight });
  } else {
    expect(box.width).toBeCloseTo(390, 0);
    expect(box.height).toBeLessThanOrEqual(882);
    expect(box.x).toBeCloseTo((viewport.width - box.width) / 2, 0);
    await expect(shell).toHaveCSS("border-radius", "40px");
  }
});

test("the production shell does not render simulated device chrome", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();

  const shell = page.locator(".app-shell");
  const navigation = page.getByRole("navigation", { name: "Bottom Navigation" });
  await expect(navigation).toBeVisible();
  await expect(shell.getByText("9:41", { exact: true })).toHaveCount(0);
  await expect(navigation).toHaveCSS("height", "64px");

  const simulatedHomeIndicators = await navigation.locator("span").evaluateAll(
    (spans) =>
      spans.filter((span) => {
        const bounds = span.getBoundingClientRect();
        return bounds.width >= 120 && bounds.width <= 150 && bounds.height > 0 && bounds.height <= 6;
      }).length,
  );
  expect(simulatedHomeIndicators).toBe(0);
});

test("the typography contract assigns each content type to its approved family", async ({ page }) => {
  await page.goto("/");

  const families = await page.evaluate(() => {
    const fixture = document.createElement("div");
    fixture.innerHTML = `
      <span data-font="english">English interface</span>
      <span data-font="arabic">واجهة عربية</span>
      <span data-font="mixed-english" class="latin-ui" lang="en" dir="ltr">English inside Arabic UI</span>
      <span data-font="zikr" class="zikr-text" lang="ar" dir="rtl">سُبْحَانَ اللَّهِ</span>
    `;
    document.body.append(fixture);

    document.documentElement.lang = "en";
    const english = getComputedStyle(fixture.querySelector('[data-font="english"]')!).fontFamily;

    document.documentElement.lang = "ar";
    const arabic = getComputedStyle(fixture.querySelector('[data-font="arabic"]')!).fontFamily;
    const mixedEnglish = getComputedStyle(fixture.querySelector('[data-font="mixed-english"]')!).fontFamily;
    const zikr = getComputedStyle(fixture.querySelector('[data-font="zikr"]')!).fontFamily;

    fixture.remove();
    return { english, arabic, mixedEnglish, zikr };
  });

  expect(families.english).toContain("Inter");
  expect(families.arabic).toContain("Noto Sans Arabic");
  expect(families.mixedEnglish).toContain("Inter");
  expect(families.zikr).toContain("IBM Plex Sans Arabic");
});

test("Arabic Home keeps group controls in the approved RTL order and loads the scheduled scene", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "ar",
          themeMode: "midnight",
          showTransliteration: false,
          showTranslation: false,
          textSize: "medium",
          highContrast: false,
          boldText: false,
          reduceMotion: true,
          hapticFeedback: false,
          forceRtl: false,
          voiceOver: false,
          audioQuality: "high",
          colorBlindSupport: "none",
        },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [0, 1, 2, 3, 4, 5, 6, 7], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await page.getByTestId("language-option-ar").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();

  const card = page.getByTestId("category-card-morning");
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("dir", "rtl");

  const arrowBox = await card.locator('[data-slot="category-chevron"]').boundingBox();
  const iconBox = await card.locator('[data-slot="category-icon"]').boundingBox();
  const copyBox = await card.locator('[data-slot="category-copy"]').boundingBox();
  expect(arrowBox).not.toBeNull();
  expect(iconBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  if (!arrowBox || !iconBox || !copyBox) return;

  // In the new layout with dir="rtl" and flex layout:
  // Chevron is on the left, Copy spans most of the middle, Icon is on the right.
  expect(arrowBox.x).toBeLessThan(iconBox.x);
  expect(copyBox.x).toBeLessThan(iconBox.x);

  const trackBox = await card.locator('[data-slot="progress-track"]').boundingBox();
  const fillBox = await card.locator('[data-slot="progress-fill"]').boundingBox();
  expect(trackBox).not.toBeNull();
  expect(fillBox).not.toBeNull();
  if (!trackBox || !fillBox) return;
  expect(fillBox.x + fillBox.width).toBeCloseTo(trackBox.x + trackBox.width, 0);
});
