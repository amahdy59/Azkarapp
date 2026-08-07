import { expect, test } from "@playwright/test";

test("the app shell fills the viewport at every tier", async ({ page }) => {
  await page.goto("/");

  const shell = page.locator(".app-shell");
  await expect(shell).toBeVisible();

  const viewport = page.viewportSize();
  const box = await shell.boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();

  if (!viewport || !box) return;

  expect(box.width).toBeCloseTo(viewport.width, 0);
  expect(box.height).toBeCloseTo(viewport.height, 0);
  expect(box.x).toBeCloseTo(0, 0);
  expect(box.y).toBeCloseTo(0, 0);
  await expect(shell).toHaveCSS("border-radius", "0px");

  if (viewport.width <= 430) {
    const resizedHeight = Math.max(520, viewport.height - 120);
    await page.setViewportSize({ width: viewport.width, height: resizedHeight });
    await expect
      .poll(async () => {
        const resizedBox = await shell.boundingBox();
        return resizedBox ? { top: resizedBox.y, bottom: resizedBox.y + resizedBox.height } : null;
      })
      .toEqual({ top: 0, bottom: resizedHeight });
  }
});

test("the production shell does not render simulated device chrome", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
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
  await expect(navigation).toHaveCSS("height", "72px");

  const simulatedHomeIndicators = await navigation.locator("span").evaluateAll(
    (spans) =>
      spans.filter((span) => {
        const bounds = span.getBoundingClientRect();
        return bounds.width >= 120 && bounds.width <= 150 && bounds.height > 0 && bounds.height <= 6;
      }).length,
  );
  expect(simulatedHomeIndicators).toBe(0);
});

test("@cross-browser typography assigns UI and zikr text to their approved families", async ({ page }) => {
  await page.goto("/");

  const families = await page.evaluate(async () => {
    const [uiFaces, zikrFaces] = await Promise.all([
      document.fonts.load('400 16px "Noto Sans Arabic Variable"', "واجهة عربية"),
      document.fonts.load('400 16px "IBM Plex Sans Arabic"', "سُبْحَانَ اللَّهِ"),
    ]);
    const fixture = document.createElement("div");
    fixture.innerHTML = `
      <span data-font="english">English interface</span>
      <span data-font="arabic">واجهة عربية</span>
      <span data-font="mixed-english" class="latin-ui" lang="en" dir="ltr">English inside Arabic UI</span>
      <span data-font="zikr" class="zikr-text" lang="ar" dir="rtl">سُبْحَانَ اللَّهِ</span>
      <input data-font="input" aria-label="Font test" />
    `;
    document.body.append(fixture);

    document.documentElement.lang = "en";
    const english = getComputedStyle(fixture.querySelector('[data-font="english"]')!).fontFamily;

    document.documentElement.lang = "ar";
    const arabic = getComputedStyle(fixture.querySelector('[data-font="arabic"]')!).fontFamily;
    const mixedEnglish = getComputedStyle(fixture.querySelector('[data-font="mixed-english"]')!).fontFamily;
    const zikr = getComputedStyle(fixture.querySelector('[data-font="zikr"]')!).fontFamily;
    document.documentElement.style.setProperty("--font-size", "14px");
    const inputSize = getComputedStyle(fixture.querySelector('[data-font="input"]')!).fontSize;

    fixture.remove();
    return {
      english,
      arabic,
      mixedEnglish,
      zikr,
      inputSize,
      uiFaces: uiFaces.length,
      zikrFaces: zikrFaces.length,
    };
  });

  expect(families.english).toContain("Noto Sans Arabic Variable");
  expect(families.arabic).toContain("Noto Sans Arabic Variable");
  expect(families.mixedEnglish).toContain("Noto Sans Arabic Variable");
  expect(families.zikr).toContain("IBM Plex Sans Arabic");
  expect(families.uiFaces).toBeGreaterThan(0);
  expect(families.zikrFaces).toBeGreaterThan(0);
  expect(families.inputSize).toBe("16px");
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
        completed: {
          morning: ["m-hm-97", "m-hm-77m", "m-hm-78m", "m-hm-89m", "m-hm-75", "m-hm-76a", "m-hm-76b", "m-hm-76c"],
          evening: [],
          before_sleep: [],
        },
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
  for (const testId of ["hijri-date", "next-prayer"]) {
    const chip = page.getByTestId(testId);
    await expect(chip).toBeVisible();
    expect(await chip.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await page.getByTestId("nav-azkar").click();

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

async function enterEnglishGuestMode(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
}

test("exactly one navigation variant renders at each breakpoint tier", async ({ page }) => {
  await enterEnglishGuestMode(page);

  const tiers = [
    { width: 320, height: 700, expected: "Bottom Navigation" },
    { width: 599, height: 800, expected: "Bottom Navigation" },
    { width: 600, height: 800, expected: "Bottom Navigation" },
    { width: 899, height: 800, expected: "Bottom Navigation" },
    { width: 900, height: 800, expected: "Main Navigation" },
    { width: 1199, height: 800, expected: "Main Navigation" },
    { width: 1200, height: 800, expected: "Main Navigation" },
  ];

  for (const { width, height, expected } of tiers) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("navigation", { name: expected })).toBeVisible();
    await expect(page.getByRole("navigation")).toHaveCount(1);

    // No horizontal document overflow at any tier boundary.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test("navigation is still reachable on short landscape viewports", async ({ page }) => {
  await enterEnglishGuestMode(page);

  // 900px+ wide but under 500px tall previously fell into a dead zone: JS chose
  // the expanded tier and dropped the bottom nav, while the rail's CSS
  // min-height guard hid the rail. Result was no navigation at all.
  await page.setViewportSize({ width: 960, height: 420 });
  await expect(page.getByRole("navigation")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Main Navigation" })).toBeVisible();
});

test("the 431-599px band is full-bleed like the rest of the compact tier", async ({ page }) => {
  await enterEnglishGuestMode(page);

  for (const width of [431, 500, 599]) {
    await page.setViewportSize({ width, height: 800 });
    const shell = page.locator(".app-shell");
    const box = await shell.boundingBox();
    expect(box, `shell width at ${width}px`).not.toBeNull();
    if (!box) continue;
    expect(box.width, `shell width at ${width}px`).toBeCloseTo(width, 0);
    await expect(shell).toHaveCSS("border-radius", "0px");
  }
});

test("app navigation is hidden during onboarding at desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  // Language picker is pre-onboarding; no app navigation should exist yet.
  await expect(page.getByTestId("language-option-en")).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("the active nav item is marked with aria-current and a non-colour cue", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterEnglishGuestMode(page);

  const home = page.getByTestId("nav-home");
  const azkar = page.getByTestId("nav-azkar");

  await expect(home).toHaveAttribute("aria-current", "page");
  await expect(azkar).not.toHaveAttribute("aria-current", "page");

  // Active state must not be conveyed by colour alone.
  const weights = async () => ({
    home: await home
      .locator("span")
      .last()
      .evaluate((el) => getComputedStyle(el).fontWeight),
    azkar: await azkar
      .locator("span")
      .last()
      .evaluate((el) => getComputedStyle(el).fontWeight),
  });
  const before = await weights();
  expect(Number(before.home)).toBeGreaterThan(Number(before.azkar));

  await azkar.click();
  await expect(azkar).toHaveAttribute("aria-current", "page");
  await expect(home).not.toHaveAttribute("aria-current", "page");
  const after = await weights();
  expect(Number(after.azkar)).toBeGreaterThan(Number(after.home));
});

test("there is exactly one main landmark and focus moves to it on navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterEnglishGuestMode(page);

  await expect(page.locator("main")).toHaveCount(1);

  await page.getByTestId("nav-progress").click();
  await expect(page.getByRole("navigation", { name: "Bottom Navigation" })).toBeVisible();

  const focusedId = await page.evaluate(() => document.activeElement?.id ?? "");
  expect(focusedId).toBe("main-content");
});
