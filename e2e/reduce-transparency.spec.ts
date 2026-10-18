import { expect, test } from "@playwright/test";

/**
 * Reduced transparency: blurred materials go solid and the decorative grain
 * over them goes.
 *
 * Headless Chromium reports `prefers-reduced-transparency: reduce` by default,
 * so the media query is already satisfied in every run and a naive test would
 * pass without the class doing anything at all. CDP forces the preference back
 * to no-preference, which is what a real browser reports, so what is measured
 * here is the in-app setting on its own.
 */
test("the setting makes blurred materials solid", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Emulation.setEmulatedMedia is Chromium-only");

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });

  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByRole("navigation").first().waitFor();
  if (await page.getByTestId("nav-more").isVisible()) {
    await page.getByTestId("nav-more").click();
    await page.getByRole("button", { name: /^Settings/ }).click();
  } else {
    await page.getByTestId("nav-settings").click();
  }
  await page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
  await page.getByRole("button", { name: /Help & FAQ/ }).click();
  await page.getByRole("heading", { name: "Help & FAQ", exact: true }).waitFor();

  const measure = () =>
    page.evaluate(() => {
      const shell = document.querySelector(".app-shell");
      return {
        blurred: [...document.querySelectorAll("*")].filter(
          (element) => (getComputedStyle(element).backdropFilter || "none") !== "none",
        ).length,
        texture: shell ? getComputedStyle(shell, "::after").display : "no shell",
        preferenceReported: matchMedia("(prefers-reduced-transparency: reduce)").matches,
      };
    });

  const before = await measure();
  expect(before.preferenceReported).toBe(false);
  // Something on this screen is actually blurred, or the test proves nothing.
  expect(before.blurred).toBeGreaterThan(0);
  expect(before.texture).not.toBe("none");

  await page.evaluate(() => document.documentElement.classList.add("reduce-transparency"));

  const after = await measure();
  // The -webkit- alias written beside the standard property let the minifier
  // collapse the pair to the alias alone, which left Tailwind's own
  // backdrop-filter unopposed. The rule read correctly and did nothing.
  expect(after.blurred).toBe(0);
  expect(after.texture).toBe("none");
});

test("a card over the hero photograph goes opaque, not merely unblurred", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Emulation.setEmulatedMedia is Chromium-only");
  // Fajr is active: the first card uses its brightest reflection. A daytime
  // inactive card has a quieter sheen and used to hide the contrast defect.
  await page.clock.setFixedTime(new Date("2026-10-17T06:00:00+03:00"));

  /* Removing the blur is only half of it. `.hero-glass` declares its
     translucent wash in a different file at the same specificity, and later in
     the built stylesheet, so the reduced-transparency override lost the cascade:
     the blur went and the surface stayed see-through. That is worse than either
     end — text over a photograph with nothing between them. */
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });

  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight" },
        profile: { displayName: "Guest", isGuest: true },
      }),
    );
  });
  await page.goto("/");
  await page.getByRole("navigation").first().waitFor();

  const glass = page.locator(".hero-glass").first();
  await glass.waitFor();

  const material = await glass.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      backdropFilter: style.backdropFilter,
    };
  });
  expect(material.backgroundColor, "the hero card should visibly reveal the photograph by default").toBe(
    "rgba(15, 23, 42, 0.36)",
  );
  expect(material.backgroundImage).toContain("linear-gradient");
  expect(material.backdropFilter).toContain("blur(22px)");
  expect(material.backdropFilter).toContain("saturate(1.35)");

  const standard = page.getByTestId("prayer-tracker-cards").locator("article").first();
  const reading = page.getByTestId("home-daily-evidence");
  await expect(standard).toHaveCSS("background-color", "rgba(15, 23, 42, 0.24)");
  await expect(reading).toHaveCSS("background-color", "rgba(15, 23, 42, 0.36)");
  const innerAction = standard.locator("button").first();
  await expect(standard).toHaveCSS("--prayer-focus", "1");
  await expect(innerAction).toHaveCSS("backdrop-filter", "none");
  // Bound contrast even if the brightest source photograph pixel is white.
  // Read actual compositing colors rather than treating blur as a guarantee.
  const contrast = await standard.evaluate((element) => {
    const parse = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const blend = (front: number[], back: number[]) =>
      front.slice(0, 3).map((value, index) => value * (front[3] ?? 1) + back[index]! * (1 - (front[3] ?? 1)));
    const luminance = (color: number[]) =>
      color.slice(0, 3).reduce((sum, value, index) => {
        const srgb = value / 255;
        return (
          sum + (srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][index]!
        );
      }, 0);
    const style = getComputedStyle(element);
    const scrim = getComputedStyle(document.querySelector(".home-photo-scrim")!);
    const scrimColors = scrim.backgroundImage.match(/rgba?\([^)]*\)/g)!.map(parse);
    const lightestScrim = scrimColors.reduce((best, color) => (color[3]! < best[3]! ? color : best));
    const highlight = parse(style.backgroundImage.match(/rgba?\([^)]*\)/)![0]);
    const background = blend(highlight, blend(parse(style.backgroundColor), blend(lightestScrim, [255, 255, 255])));
    const probe = document.createElement("span");
    element.append(probe);
    const result = ["text-on-media", "text-on-media-muted", "text-on-media-accent"].map((className) => {
      probe.className = className;
      const foreground = blend(parse(getComputedStyle(probe).color), background);
      return (luminance(foreground) + 0.05) / (luminance(background) + 0.05);
    });
    probe.remove();
    return result;
  });
  for (const ratio of contrast) expect(ratio).toBeGreaterThanOrEqual(4.5);

  await page.evaluate(() => document.documentElement.classList.add("reduce-transparency"));

  const solid = await glass.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(solid, "reduced transparency must leave no alpha behind").not.toMatch(/rgba\(.*0?\.\d+\)/);
});

test("the saved setting removes Home photography and uses theme cards", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", reduceTransparency: true },
        profile: { displayName: "Guest", isGuest: true },
      }),
    );
  });
  await page.goto("/");
  await page.getByRole("navigation").first().waitFor();

  await expect(page.getByTestId("time-of-day-scene-window")).toHaveCount(0);
  const prayerStrip = page.getByTestId("prayer-tracker-cards");
  await expect(prayerStrip).not.toHaveClass(/hero-glass/);
  await expect(page.getByTestId("home-saved-section")).toHaveCount(0);
  await expect(page.getByTestId("home-benefits-card")).toHaveCount(0);
  const surface = await prayerStrip
    .locator("article")
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(surface).not.toMatch(/rgba\(.*0?\.\d+\)/);
});
