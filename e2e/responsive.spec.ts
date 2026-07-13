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
    await expect(shell).toHaveCSS("border-radius", "0px");
  } else {
    expect(box.width).toBeCloseTo(390, 0);
    expect(box.height).toBeLessThanOrEqual(882);
    expect(box.x).toBeCloseTo((viewport.width - box.width) / 2, 0);
    await expect(shell).toHaveCSS("border-radius", "40px");
  }
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
  await page.getByRole("button", { name: "🇸🇦 العربية ar", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "المتابعة كزائر ⚠ لن تتم مزامنة تقدمك بين الأجهزة", exact: true }).click();
  await page.getByRole("button", { name: "تخطي", exact: true }).click();

  const card = page.getByTestId("category-card-morning");
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("dir", "ltr");

  const arrowBox = await card.locator('[data-slot="category-chevron"]').boundingBox();
  const iconBox = await card.locator('[data-slot="category-icon"]').boundingBox();
  const copyBox = await card.locator('[data-slot="category-copy"]').boundingBox();
  expect(arrowBox).not.toBeNull();
  expect(iconBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  if (!arrowBox || !iconBox || !copyBox) return;

  expect(arrowBox.x).toBeLessThan(iconBox.x);
  expect(iconBox.x).toBeLessThan(copyBox.x);

  const trackBox = await card.locator('[data-slot="progress-track"]').boundingBox();
  const fillBox = await card.locator('[data-slot="progress-fill"]').boundingBox();
  expect(trackBox).not.toBeNull();
  expect(fillBox).not.toBeNull();
  if (!trackBox || !fillBox) return;
  expect(fillBox.x + fillBox.width).toBeCloseTo(trackBox.x + trackBox.width, 0);

  const scene = page.locator(".featured-scene");
  await expect(scene).toBeVisible();
  const sceneState = await scene.evaluate((element) => {
    const image = element as HTMLImageElement;
    return {
      naturalWidth: image.naturalWidth,
      opacity: Number.parseFloat(getComputedStyle(image).opacity),
    };
  });
  expect(sceneState.naturalWidth).toBeGreaterThan(0);
  expect(sceneState.opacity).toBeGreaterThanOrEqual(0.3);
  expect(sceneState.opacity).toBeLessThan(0.6);
});
