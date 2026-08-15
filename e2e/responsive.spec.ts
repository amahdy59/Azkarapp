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

  const iconBox = await card.locator('[data-slot="category-icon"]').boundingBox();
  const copyBox = await card.locator('[data-slot="category-copy"]').boundingBox();
  expect(iconBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  if (!iconBox || !copyBox) return;

  // In the new layout with dir="rtl" and flex layout:
  // Copy spans most of the middle, Icon is on the right.
  expect(iconBox.x).toBeGreaterThan(copyBox.x);

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

test("desktop onboarding keeps related controls within the form measure and close together", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("language-option-en")).toBeVisible({ timeout: 5000 });

  const expectFormMeasure = async () => {
    const content = page.getByTestId("pre-app-content");
    const bounds = await content.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;
    expect(bounds.width).toBeLessThanOrEqual(640);
    expect(Math.abs(bounds.x + bounds.width / 2 - 720)).toBeLessThanOrEqual(1);
  };

  await expectFormMeasure();
  const lastLanguage = page.getByTestId("language-option-ar");
  const continueButton = page.getByTestId("confirm-language");
  const [languageBounds, continueBounds] = await Promise.all([
    lastLanguage.boundingBox(),
    continueButton.boundingBox(),
  ]);
  expect(languageBounds).not.toBeNull();
  expect(continueBounds).not.toBeNull();
  if (languageBounds && continueBounds) {
    const gap = continueBounds.y - (languageBounds.y + languageBounds.height);
    expect(gap).toBeGreaterThanOrEqual(12);
    expect(gap).toBeLessThanOrEqual(48);
  }

  await page.getByTestId("language-option-en").click();
  await continueButton.click();
  await expect(page.getByTestId("onboarding-get-started")).toBeVisible();
  await expectFormMeasure();

  const [featuresBounds, startBounds] = await Promise.all([
    page.getByTestId("onboarding-feature-list").boundingBox(),
    page.getByTestId("onboarding-get-started").boundingBox(),
  ]);
  expect(featuresBounds).not.toBeNull();
  expect(startBounds).not.toBeNull();
  if (featuresBounds && startBounds) {
    const gap = startBounds.y - (featuresBounds.y + featuresBounds.height);
    expect(gap).toBeGreaterThanOrEqual(16);
    expect(gap).toBeLessThanOrEqual(32);
  }

  await page.getByTestId("onboarding-get-started").click();
  await expect(page.getByTestId("continue-as-guest")).toBeVisible();
  await expectFormMeasure();

  const [introBounds, actionBounds] = await Promise.all([
    page.getByTestId("auth-intro").boundingBox(),
    page.getByTestId("auth-actions").boundingBox(),
  ]);
  expect(introBounds).not.toBeNull();
  expect(actionBounds).not.toBeNull();
  if (introBounds && actionBounds) {
    const gap = actionBounds.y - (introBounds.y + introBounds.height);
    expect(gap).toBeGreaterThanOrEqual(24);
    expect(gap).toBeLessThanOrEqual(48);
  }
});

test("short desktop onboarding keeps Continue visible without a flexible-space gap", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 451 });
  await page.goto("/");
  await expect(page.getByTestId("language-option-en")).toBeVisible({ timeout: 5000 });

  const lastLanguage = page.getByTestId("language-option-ar");
  const continueButton = page.getByTestId("confirm-language");
  await expect(continueButton).toBeInViewport();
  const [languageBounds, continueBounds] = await Promise.all([
    lastLanguage.boundingBox(),
    continueButton.boundingBox(),
  ]);
  expect(languageBounds).not.toBeNull();
  expect(continueBounds).not.toBeNull();
  if (languageBounds && continueBounds) {
    expect(continueBounds.y - (languageBounds.y + languageBounds.height)).toBeLessThanOrEqual(48);
  }
});

test("zikr overview uses the form measure on desktop and remains fluid on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterEnglishGuestMode(page);
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-morning").click();

  const overview = page.getByTestId("category-overview");
  await expect(overview).toBeVisible();
  const [desktopBounds, mainBounds] = await Promise.all([
    overview.boundingBox(),
    page.locator("#main-content").boundingBox(),
  ]);
  expect(desktopBounds).not.toBeNull();
  expect(mainBounds).not.toBeNull();
  if (desktopBounds && mainBounds) {
    expect(desktopBounds.width).toBeLessThanOrEqual(640);
    expect(
      Math.abs(desktopBounds.x + desktopBounds.width / 2 - (mainBounds.x + mainBounds.width / 2)),
    ).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileBounds = await overview.boundingBox();
  expect(mobileBounds).not.toBeNull();
  if (mobileBounds) expect(mobileBounds.width).toBeCloseTo(390, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(
    0,
  );
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

  const activeCueBox = await home.locator("span").first().boundingBox();
  const activeIconBox = await home.locator("svg").boundingBox();
  expect(activeCueBox).not.toBeNull();
  expect(activeIconBox).not.toBeNull();
  if (activeCueBox && activeIconBox) {
    expect(activeCueBox.y + activeCueBox.height).toBeLessThanOrEqual(activeIconBox.y);
  }

  await azkar.click();
  await expect(azkar).toHaveAttribute("aria-current", "page");
  await expect(home).not.toHaveAttribute("aria-current", "page");
  const after = await weights();
  expect(Number(after.azkar)).toBeGreaterThan(Number(after.home));
});

test("there is exactly one main landmark and focus moves to it on navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterEnglishGuestMode(page);

  // Wait for the lazy screen to actually mount first. Asserting straight after
  // guest mode passes vacuously: toHaveCount matches the shell's lone landmark
  // before the screen renders, so a screen-level <main> would slip through.
  await expect(page.getByTestId("home-primary-cta")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("main")).toHaveCount(1);

  await page.getByTestId("nav-azkar").click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);

  await page.getByTestId("nav-progress").click();
  await expect(page.getByRole("navigation", { name: "Bottom Navigation" })).toBeVisible();

  await expect(page.locator("#main-content")).toBeFocused();
});

test("status banners get a full-width area above the nav, not an implicit row", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await enterEnglishGuestMode(page);

  // The wrapper always renders, so its geometry can be checked without going
  // offline — which would trip lazyWithRetry's chunk-failure reload.
  const status = page.locator(".app-status");
  await expect(status).toHaveCount(1);

  const { area, rect, railRect } = await page.evaluate(() => {
    const el = document.querySelector(".app-status")!;
    const rail = document.querySelector("nav")!;
    return {
      area: getComputedStyle(el).gridArea,
      rect: el.getBoundingClientRect().toJSON(),
      railRect: rail.getBoundingClientRect().toJSON(),
    };
  });

  // As an unplaced grid child this landed in an implicit row inside the rail
  // column. It must occupy the named status area, spanning the shell's width
  // above the navigation.
  expect(area).toContain("status");
  expect(rect.width).toBeGreaterThan(900);
  expect(rect.top).toBeLessThanOrEqual(railRect.top);
});
