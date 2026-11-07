import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

test.beforeEach(async ({ page, browserName }) => {
  if (browserName !== "chromium") return;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
});

for (const language of ["ar", "en"] as const) {
  test(`Quran Wird title stays above the scrolling mobile content in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem("azkarapp.state.v1", JSON.stringify({ settings: { language, appMaterial: "glass" } }));
    }, language);
    await page.goto("/#/quran-wird");
    const title = page.getByRole("heading", { name: language === "ar" ? "ورد القرآن" : "Quran Wird", exact: true });
    await expect(title).toBeVisible();
    const before = (await title.boundingBox())!;
    const content = page.getByTestId("quran-wird-content");
    await content.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await expect.poll(() => content.evaluate((node) => node.scrollTop)).toBeGreaterThan(100);
    expect(Math.abs((await title.boundingBox())!.y - before.y)).toBeLessThanOrEqual(1);
    const header = page.getByTestId("shared-screen-header");
    await expect(header).toHaveAttribute("data-scrolled", "true");
    const edge = await header.evaluate((node) => {
      const s = getComputedStyle(node, "::after");
      return { height: s.height, pointer: s.pointerEvents, mask: s.maskImage };
    });
    expect(edge.height).toBe("12px");
    expect(edge.pointer).toBe("none");
    expect(edge.mask).toContain("linear-gradient");
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    await content.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await expect(title).toBeVisible();
    expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual(0);
    await page.screenshot({ path: info.outputPath(`quran-wird-${language}.png`) });
    await page.locator("html").evaluate((node) => node.classList.add("high-contrast"));
    expect(await header.evaluate((node) => getComputedStyle(node, "::after").display)).toBe("none");
  });

  test(`surah title and reading choices remain reachable at enlarged text in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, appMaterial: "solid", themeMode: "light" } }),
      );
    }, language);
    await page.goto("/#/azkar/friday-kahf/1");
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    const title = page.getByTestId("reader-zikr-title");
    await expect(title).toHaveCount(1);
    await title.scrollIntoViewIfNeeded();
    await expect(title).toBeInViewport();
    await expect(title).toHaveCSS("color", "rgb(131, 88, 6)");
    const actions = page.getByTestId("surah-reading-actions");
    for (const key of ["reader.listenToSurah", "reader.readFromMushaf", "reader.readExternally"] as const) {
      const button = actions.getByRole("button", { name: t(language, key), exact: true });
      await button.scrollIntoViewIfNeeded();
      await expect(button).toBeInViewport();
    }
    expect(await title.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath(`surah-large-${language}.png`) });
  });
}

test("counter vibration changes the saved preference from reader options @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (!localStorage.getItem("azkarapp.state.v1"))
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: "en", hapticFeedback: false } }),
      );
  });
  await page.goto("/#/azkar/morning/1");
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  const vibration = page.locator('[data-testid^="reader-counter-vibration-toggle-"]');
  await expect(vibration).toHaveAccessibleName("Enable counter vibration");
  await vibration.click();
  await expect(vibration).toHaveAccessibleName("Disable counter vibration");
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.hapticFeedback))
    .toBe(true);
  await page.reload();
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await expect(vibration).toHaveAccessibleName("Disable counter vibration");
  await vibration.click();
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.hapticFeedback))
    .toBe(false);
});

test("Glass cards reveal scenery and keep their ink stable during pointer hover @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", appMaterial: "glass", homeMaterial: "glass", themeMode: "midnight" },
      }),
    );
  });
  await page.goto("/#/home");
  const scene = page.getByTestId("time-of-day-scene-window").last();
  await expect(scene.locator("img")).toHaveCSS("opacity", "1");
  await page.addStyleTag({
    content: '[data-testid="time-of-day-scene-window"] > * { visibility: hidden !important; }',
  });
  const cards = [
    page.locator(".home-prayer-summary-card").first(),
    page.getByTestId("home-routine-card").locator(".hero-glass"),
    page.getByTestId("home-daily-evidence"),
  ];
  for (const card of cards) {
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("opacity", "1");
    const r = (await card.boundingBox())!;
    const clip = { x: r.x + r.width / 2, y: r.y + 8, width: 4, height: 4 };
    await scene.evaluate((node) => {
      node.style.backgroundColor = "#587d91";
    });
    const blue = await page.screenshot({ clip });
    await scene.evaluate((node) => {
      node.style.backgroundColor = "#a38750";
    });
    const gold = await page.screenshot({ clip });
    expect(blue.equals(gold)).toBe(false);
    await card.hover();
    await expect(card).toHaveCSS("filter", "none");
    await expect(card).toHaveCSS("opacity", "1");
  }
  await page.goto("/#/settings");
  const row = page.getByRole("button", { name: /Audio & downloads/ });
  await expect(row).toBeVisible();
  const original = await row.evaluate((node) => ({
    color: getComputedStyle(node).color,
    opacity: getComputedStyle(node).opacity,
  }));
  await row.hover();
  await expect(row).toHaveCSS("filter", "none");
  expect(
    await row.evaluate((node) => ({ color: getComputedStyle(node).color, opacity: getComputedStyle(node).opacity })),
  ).toEqual(original);
  await page.screenshot({ path: info.outputPath("settings-stable-hover.png") });
});
