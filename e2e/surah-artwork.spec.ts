import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FRIDAY_KAHF } from "../src/app/content/fridayKahf";
import { t } from "../src/app/i18n";

test.use({ serviceWorkers: "block" });

async function readyCover(page: Page) {
  const cover = page.getByTestId("surah-artwork-cover");
  await expect(cover).toBeVisible();
  await expect
    .poll(() => cover.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0))
    .toBe(true);
  return cover;
}

async function assertTarget(button: Locator) {
  const box = (await button.boundingBox())!;
  // Firefox can report an exact 44px CSS target as 43.999996px. Measure to
  // 1/1000 CSS px; the product requirement remains 44px in both dimensions.
  expect(Math.round(box.width * 1000)).toBeGreaterThanOrEqual(44000);
  expect(Math.round(box.height * 1000)).toBeGreaterThanOrEqual(44000);
}

test("long surah navigator mounts on opening and restores keyboard focus on close", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("azkarapp.onboarding-complete.v1", "true"));
  await page.goto("/#/azkar/friday-kahf/1");
  await readyCover(page);
  const panel = page.getByTestId("reader-collection-navigator");
  const toggle = page.getByTestId("reader-sidebar-toggle");
  await expect(panel).toHaveCount(0);
  await toggle.click();
  await expect(panel).toBeVisible();
  await expect(page.getByTestId("reader-sidebar-close")).toBeFocused();
  await page.getByTestId("reader-sidebar-close").click();
  await expect(panel).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("the local surah cover paints while optional desktop detail stalls or fails @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem("azkarapp.onboarding-complete.v1", "true"));
  let detailRequested = false;
  await page.route("**/visuals/surah/**", () => {
    detailRequested = true;
  });
  await page.goto("/#/azkar/friday-kahf/1", { waitUntil: "domcontentloaded" });
  const cover = await readyCover(page);
  await expect(cover).toHaveAttribute("src", /al-kahf-416\.webp$/);
  await expect(cover).not.toHaveAttribute("srcset");
  await expect.poll(() => detailRequested).toBe(true);
  const detail = page.getByTestId("surah-artwork-detail");
  await expect(detail).toHaveCSS("opacity", "0");
  await expect(page.getByTestId("reader-mushaf-button")).toBeEnabled();
  await page.unroute("**/visuals/surah/**");
  await page.route("**/visuals/surah/**", (route) => route.abort());
  await page.reload({ waitUntil: "domcontentloaded" });
  await readyCover(page);
  await expect(detail).toHaveCount(0);
  await expect(cover).toHaveAttribute("src", /al-kahf-416\.webp$/);
});

test("all three phone covers load locally and recover to generic offline artwork @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true, routineMode: "complete" } }),
    );
  });
  const hostedRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/visuals/surah/")) hostedRequests.push(request.url());
  });
  for (const [id, artwork] of [
    ["friday-kahf", "al-kahf"],
    ["s-hm-110a", "as-sajdah"],
    ["s-hm-110b", "al-mulk"],
  ]) {
    const position = getAzkarForMode("before_sleep", "complete").findIndex((zikr) => zikr.id === id) + 1;
    await page.goto(id === "friday-kahf" ? "/#/azkar/friday-kahf/1" : `/#/azkar/before-sleep/${position}`);
    const cover = await readyCover(page);
    const title = page.getByTestId("reader-zikr-title");
    await expect(title).toHaveCount(1);
    const titleBounds = (await title.boundingBox())!;
    const artworkBounds = (await cover.locator("..").boundingBox())!;
    expect(titleBounds.y + titleBounds.height).toBeLessThanOrEqual(artworkBounds.y);
    expect(artworkBounds.height).toBeGreaterThanOrEqual(180);
    expect(artworkBounds.height).toBeLessThanOrEqual(210);
    expect(artworkBounds.width / artworkBounds.height).toBeCloseTo(16 / 9, 1);
    expect(await cover.evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(
      new RegExp(`/${artwork}-416\\.webp$`),
    );
    await expect(cover).toHaveAttribute("fetchpriority", "high");
    await page.screenshot({ path: info.outputPath(`${artwork}.png`) });
  }
  expect(hostedRequests).toEqual([]);
  await page.route("**/assets/surah/v1/**", (route) => route.abort());
  await page.reload();
  const cover = await readyCover(page);
  await expect(cover).toHaveAttribute("src", /assets\/cards\/wird-quran-720.webp$/);
});

for (const layout of [
  { width: 320, height: 620, language: "en", enlarged: true },
  { width: 320, height: 620, language: "ar", enlarged: true },
  { width: 390, height: 844, language: "ar", enlarged: false },
  { width: 390, height: 844, language: "en", enlarged: false },
  { width: 820, height: 1024, language: "ar", enlarged: false },
  { width: 1440, height: 1000, language: "ar", enlarged: false },
  { width: 1440, height: 1000, language: "en", enlarged: false },
] as const) {
  test(`surah artwork and actions fit ${layout.width}px in ${layout.language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize(layout);
    await page.addInitScript(({ language }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true, themeMode: "midnight", appMaterial: "glass" } }),
      );
    }, layout);
    const position = getAzkarForMode("before_sleep", "complete").findIndex(({ id }) => id === "s-hm-110a") + 1;
    await page.goto(`/#/azkar/before-sleep/${position}?mode=complete`);
    if (layout.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    const hero = page.getByTestId("surah-reading-actions");
    const photo = await readyCover(page);
    const title = hero.getByTestId("reader-zikr-title");
    const share = page.getByTestId("reader-surah-share-button");
    const controls = hero.getByTestId("reader-surah-controls");
    await page.evaluate(() => document.fonts.ready);
    await expect(title).toHaveCSS("font-weight", "600");
    await expect(title).toHaveCSS("font-family", /Noto Sans Arabic/i);
    if (!layout.enlarged) await expect(title).toHaveCSS("font-size", layout.width === 1440 ? "36px" : "28px");
    const figure = photo.locator("..");
    const metadata = hero.locator(".reader-surah-meta");
    await expect(figure.getByRole("button")).toHaveCount(0);
    await assertTarget(share);
    for (const button of await controls.getByRole("button").all()) await assertTarget(button);
    await expect(controls.getByRole("button").first()).toHaveAccessibleName(
      t(layout.language, "reader.readFromMushaf"),
    );
    await expect(controls.getByRole("button").last()).toHaveAttribute("data-variant", "ghost");
    const [imageBox, titleBox, controlBox] = [
      (await figure.boundingBox())!,
      (await title.boundingBox())!,
      (await controls.boundingBox())!,
    ];
    expect((await metadata.boundingBox())!.y - (titleBox.y + titleBox.height)).toBeGreaterThanOrEqual(7.5);
    expect(Math.abs(titleBox.x + titleBox.width / 2 - controlBox.x - controlBox.width / 2)).toBeLessThanOrEqual(1);
    if (layout.width === 1440) {
      expect(imageBox.width).toBeGreaterThan(400);
      if (layout.language === "ar") expect(imageBox.x).toBeGreaterThan(titleBox.x + titleBox.width);
      else expect(imageBox.x + imageBox.width).toBeLessThan(titleBox.x);
    } else {
      const metaBox = (await metadata.boundingBox())!;
      expect(imageBox.y - metaBox.y - metaBox.height).toBeGreaterThanOrEqual(15.5);
      expect(imageBox.x).toBeGreaterThanOrEqual(16);
      expect(imageBox.width).toBeLessThanOrEqual(Math.min(512, layout.width - 32));
    }
    const nav = hero.getByTestId("reader-side-navigation");
    await expect(nav.getByRole("button")).toHaveCount(2);
    expect((await nav.boundingBox())!.y).toBeGreaterThanOrEqual(imageBox.y + imageBox.height);
    expect(await hero.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("progressbar", { name: t(layout.language, "reader.groupProgress") })).toBeVisible();
    await page.screenshot({ path: info.outputPath("surah-entry.png"), scale: "css" });
    const read = controls.getByRole("button").first();
    if (!layout.enlarged) await expect(read).toBeInViewport();
    await read.scrollIntoViewIfNeeded();
    await read.click();
    await expect(page.getByTestId("mushaf-immersive")).toBeVisible();
  });
}

for (const appearance of [
  { language: "ar", themeMode: "midnight", appMaterial: "glass", highContrast: false },
  { language: "ar", themeMode: "light", appMaterial: "solid", highContrast: false },
  { language: "en", themeMode: "midnight", appMaterial: "solid", highContrast: false },
  { language: "en", themeMode: "light", appMaterial: "glass", highContrast: false },
  { language: "ar", themeMode: "midnight", appMaterial: "glass", highContrast: true },
] as const) {
  test(`single surah entry is accessible in ${appearance.language} ${appearance.themeMode} ${appearance.appMaterial} contrast ${appearance.highContrast} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((settings) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem("azkarapp.state.v1", JSON.stringify({ settings: { ...settings, reduceMotion: true } }));
    }, appearance);
    await page.goto("/#/azkar/friday-kahf/1");
    await readyCover(page);
    await expect(page.getByRole("progressbar")).toHaveCount(0);
    await expect(page.getByTestId("reader-settings-button")).toHaveCount(0);
    const expectedTitle =
      appearance.language === "ar"
        ? `سورة ${FRIDAY_KAHF[0].surahNameArabic}`
        : `Surah ${FRIDAY_KAHF[0].surahNameEnglish}`;
    await expect(page.getByTestId("reader-zikr-title")).toHaveText(expectedTitle);
    const scan = await new AxeBuilder({ page }).include('[data-testid="reader-screen"]').analyze();
    expect(scan.violations).toEqual([]);
    const read = page.getByTestId("reader-mushaf-button");
    const listen = page.getByRole("button", { name: t(appearance.language, "reader.listenToSurah"), exact: true });
    await read.focus();
    await page.keyboard.press("Tab");
    await expect(
      (await listen.isEnabled())
        ? listen
        : page.getByRole("button", { name: t(appearance.language, "reader.readExternally"), exact: true }),
    ).toBeFocused();
    const share = page.getByTestId("reader-surah-share-button");
    await share.focus();
    await expect(share).toBeFocused();
    await page.screenshot({ path: info.outputPath("surah-entry-theme.png"), scale: "css" });
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(share).toBeFocused();
  });
}

for (const language of ["ar", "en"] as const) {
  test(`single surah menu reflows at 320px and 200% text with opaque and forced-color recovery in ${language}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 620 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "midnight", appMaterial: "glass", reduceTransparency: true },
        }),
      );
    }, language);
    await page.goto("/#/azkar/friday-kahf/1");
    await readyCover(page);
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    for (const forcedColors of ["none", "active"] as const) {
      await page.emulateMedia({ reducedMotion: "reduce", forcedColors });
      const trigger = page.getByRole("button", { name: t(language, "reader.menu"), exact: true });
      await trigger.click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      const bounds = (await menu.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(620);
      expect(await menu.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      const surface = page.locator('[data-dropdown-surface][role="menu"]');
      await expect(surface).toHaveCount(1);
      await expect(surface).toHaveCSS("background-color", /^rgb\(/);
      await page.screenshot({ path: info.outputPath(`surah-menu-${forcedColors}.png`), scale: "css" });
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    const read = page.getByTestId("reader-mushaf-button");
    await read.scrollIntoViewIfNeeded();
    await assertTarget(read);
    await read.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("mushaf-immersive")).toBeVisible();
  });
}
