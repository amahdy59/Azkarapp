import { expect, test, type Page } from "@playwright/test";

async function openReturningGuest(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", reduceMotion: true, hapticFeedback: false },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto("/");
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Tasbeeh Counter" }).first()).toBeAttached();
}

test("the Home masbaha entry fills compact/tablet layouts and is bounded on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openReturningGuest(page);
  const entry = page.getByRole("button", { name: "Tasbeeh Counter" }).first();

  for (const viewport of [
    { width: 320, height: 568, minimumWidth: 260, maximumWidth: 320 },
    { width: 834, height: 900, minimumWidth: 700, maximumWidth: 834 },
    { width: 1440, height: 900, minimumWidth: 500, maximumWidth: 673 },
  ]) {
    await page.setViewportSize(viewport);
    const box = await entry.boundingBox();
    expect(box).not.toBeNull();
    if (!box) continue;
    expect(box.width).toBeGreaterThanOrEqual(viewport.minimumWidth);
    expect(box.width).toBeLessThanOrEqual(viewport.maximumWidth);
    expect(box.height).toBeGreaterThanOrEqual(64);
  }
});

test("the custom counter stays bounded on a short phone and isolates focused-control shortcuts", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openReturningGuest(page);
  await page.getByRole("button", { name: "Tasbeeh Counter" }).first().click();

  const screen = page.locator(".app-screen-surface");
  const content = page.getByTestId("custom-counter-content");
  const counter = page.getByTestId("custom-counter-surface");
  const counterNumber = counter.locator(".counter-number");
  const sound = page.getByTestId("counter-sound-toggle");

  await expect(counter).toBeVisible();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect(counterNumber).toHaveText("0");

  const soundBox = await sound.boundingBox();
  expect(soundBox).not.toBeNull();
  if (soundBox) {
    expect(soundBox.width).toBeGreaterThanOrEqual(44);
    expect(soundBox.height).toBeGreaterThanOrEqual(44);
  }

  await sound.focus();
  await page.keyboard.press("Space");
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect(counterNumber).toHaveText("0");
  expect(await page.evaluate(() => localStorage.getItem("azkarapp.counter-sound.v1"))).toBe("false");

  await counter.focus();
  await page.keyboard.press("Space");
  await expect(counterNumber).toHaveText("1");

  await counter.scrollIntoViewIfNeeded();
  const counterBox = await counter.boundingBox();
  expect(counterBox).not.toBeNull();
  if (counterBox) {
    expect(Math.round(counterBox.width)).toBe(184);
    expect(Math.round(counterBox.height)).toBe(184);
    expect(counterBox.x).toBeGreaterThanOrEqual(0);
    expect(counterBox.x + counterBox.width).toBeLessThanOrEqual(320);
  }

  const geometry = await screen.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
  expect(geometry.overflowY).toBe("auto");

  const contentBox = await content.boundingBox();
  expect(contentBox).not.toBeNull();
  if (contentBox) expect(contentBox.width).toBeLessThanOrEqual(320);
});

test("custom counter content keeps its reading-width bound on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openReturningGuest(page);
  await page.getByRole("button", { name: "Tasbeeh Counter" }).first().click();

  const contentBox = await page.getByTestId("custom-counter-content").boundingBox();
  expect(contentBox).not.toBeNull();
  if (contentBox) expect(contentBox.width).toBeLessThanOrEqual(640);
});

test("the tonal texture is non-Home only and yields to reduced transparency", async ({ page }) => {
  await openReturningGuest(page);
  const main = page.locator("#main-content");
  const homeSurface = page.locator(".app-screen-surface");

  await expect(main).toHaveAttribute("data-view", "home");
  expect(await homeSurface.evaluate((element) => getComputedStyle(element).backgroundImage)).toBe("none");

  await page.getByTestId("nav-azkar").click();
  const librarySurface = page.locator(".app-screen-surface");
  await expect(main).not.toHaveAttribute("data-view", "home");
  await expect(page.getByRole("heading", { name: "Azkar Library" })).toBeVisible();
  await expect(librarySurface).toHaveCSS("background-image", /url\(/);

  await page.evaluate(() => document.body.classList.add("reduce-transparency"));
  await expect(librarySurface).toHaveCSS("background-image", "none");
});
