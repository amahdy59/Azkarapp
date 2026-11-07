import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

test.use({ serviceWorkers: "block" });

test("a stalled large surah cover falls back to the matching offline cover", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1024 });
  await page.addInitScript(() => localStorage.setItem("azkarapp.onboarding-complete.v1", "true"));
  // Leave the hosted request pending. The local cover should paint while
  // the connection is still stalled.
  await page.route("**/visuals/surah/**", () => {});
  await page.goto("/#/azkar/friday-kahf/1", { waitUntil: "domcontentloaded" });
  const image = page.getByTestId("surah-reading-actions").locator("img");
  await expect(image).not.toHaveAttribute("srcset");
  await expect(image).toHaveAttribute("src", /al-kahf-416\.webp$/);
  await expect
    .poll(() =>
      image.evaluate(
        (node: HTMLImageElement) => node.complete && node.naturalWidth > 0 && node.currentSrc.endsWith("-416.webp"),
      ),
    )
    .toBe(true);
});

test("surah covers load their own artwork and recover from an unavailable image @cross-browser", async ({
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
  for (const [id, artwork] of [
    ["friday-kahf", "al-kahf"],
    ["s-hm-110a", "as-sajdah"],
    ["s-hm-110b", "al-mulk"],
  ]) {
    const position = getAzkarForMode("before_sleep", "complete").findIndex((zikr) => zikr.id === id) + 1;
    await page.goto(id === "friday-kahf" ? "/#/azkar/friday-kahf/1" : `/#/azkar/before-sleep/${position}`);
    const image = page.getByTestId("surah-reading-actions").locator("img");
    await expect(image).toBeVisible();
    const title = page.getByTestId("reader-zikr-title");
    await expect(title).toHaveCount(1);
    const titleBounds = (await title.boundingBox())!;
    const artworkBounds = (await image.boundingBox())!;
    expect(titleBounds.y + titleBounds.height).toBeLessThanOrEqual(artworkBounds.y);
    expect(artworkBounds.height).toBeGreaterThanOrEqual(200);
    expect(artworkBounds.width / artworkBounds.height).toBeCloseTo(5 / 4, 1);
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
    expect(await image.evaluate((node: HTMLImageElement) => node.currentSrc)).toMatch(
      new RegExp(`/${artwork}-(416|768)\\.webp$`),
    );
    await expect(image).toHaveAttribute("fetchpriority", "high");
    await page.screenshot({ path: info.outputPath(`${artwork}.png`) });
  }
  await page.route("**/assets/surah/v1/**", (route) => route.abort());
  await page.route("**/visuals/surah/**", (route) => route.abort());
  await page.reload();
  const image = page.getByTestId("surah-reading-actions").locator("img");
  await expect(image).toHaveAttribute("src", /assets\/cards\/wird-quran-720.webp$/);
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
});

for (const layout of [
  { width: 320, height: 620, language: "en", enlarged: true },
  { width: 390, height: 844, language: "ar", enlarged: false },
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
        JSON.stringify({
          settings: { language, reduceMotion: true, themeMode: "midnight", appMaterial: "glass" },
        }),
      );
    }, layout);
    const position = getAzkarForMode("before_sleep", "complete").findIndex(({ id }) => id === "s-hm-110a") + 1;
    await page.goto(`/#/azkar/before-sleep/${position}?mode=complete`);
    if (layout.enlarged)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    const hero = page.getByTestId("surah-reading-actions");
    const photo = hero.locator("img");
    const title = hero.getByTestId("reader-zikr-title");
    const share = hero.getByTestId("reader-surah-share-button");
    const controls = hero.getByTestId("reader-surah-controls");
    await expect(photo).toBeVisible();
    await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await page.evaluate(() => document.fonts.ready);
    if (layout.enlarged) {
      const titleLines = await title.evaluate(
        (node) => node.clientHeight / parseFloat(getComputedStyle(node).lineHeight),
      );
      expect(titleLines).toBeLessThanOrEqual(2.05);
    }
    if (layout.language === "ar") {
      await expect(title).toHaveCSS("font-weight", "400");
      await expect(title).toHaveCSS("font-family", /Amiri/i);
    }
    const figure = hero.locator("figure");
    const metadata = hero.locator(".reader-surah-meta");
    await expect(figure.getByRole("button")).toHaveCount(0);
    expect((await share.boundingBox())?.width).toBeGreaterThanOrEqual(44);
    await expect(controls.getByRole("button").first()).toHaveAccessibleName(
      t(layout.language, "reader.readFromMushaf"),
    );
    const [imageBox, titleBox] = [(await figure.boundingBox())!, (await title.boundingBox())!];
    expect((await metadata.boundingBox())!.y - (titleBox.y + titleBox.height)).toBeGreaterThanOrEqual(12);
    if (layout.width < 1440) {
      expect(
        imageBox.y - ((await metadata.boundingBox())!.y + (await metadata.boundingBox())!.height),
      ).toBeGreaterThanOrEqual(12);
    }
    expect(
      Math.abs(
        titleBox.x + titleBox.width / 2 - (await controls.boundingBox())!.x - (await controls.boundingBox())!.width / 2,
      ),
    ).toBeLessThanOrEqual(1);
    if (layout.width === 1440) {
      expect(imageBox.width).toBeGreaterThan(440);
      if (layout.language === "ar") expect(imageBox.x).toBeGreaterThan(titleBox.x + titleBox.width);
      else expect(imageBox.x + imageBox.width).toBeLessThan(titleBox.x);
    } else {
      expect(imageBox.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height);
      if (layout.width < 400) {
        expect(imageBox.x).toBeCloseTo(0, 0);
        expect(imageBox.width).toBeCloseTo(layout.width, 0);
      } else {
        expect(imageBox.width).toBeGreaterThanOrEqual(500);
      }
    }
    const nav = hero.getByTestId("reader-side-navigation");
    await expect(nav.getByRole("button")).toHaveCount(2);
    expect((await nav.boundingBox())!.y).toBeGreaterThanOrEqual(imageBox.y + imageBox.height);
    expect(await hero.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath("surah-entry.png"), scale: "css" });
    const read = controls.getByRole("button").first();
    if (!layout.enlarged) await expect(read).toBeInViewport();
    await read.scrollIntoViewIfNeeded();
    await read.click();
    await expect(page.getByTestId("mushaf-immersive")).toBeVisible();
  });
}
