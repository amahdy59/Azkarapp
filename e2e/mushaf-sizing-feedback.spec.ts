import { expect, test, type Page } from "@playwright/test";

async function seed(page: Page, appStill = false) {
  await page.addInitScript((reduceMotion) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "en",
          themeMode: "light",
          mushafTheme: "light",
          reduceMotion,
          hapticFeedback: false,
          appMaterial: "solid",
        },
        profile: { isGuest: true },
        khatmahPage: 42,
      }),
    );
  }, appStill);
  await page.route("**/fonts/qcf-v2/**", (route) => route.abort());
}

for (const mode of ["normal", "app-still", "system-still"] as const) {
  test(`Mushaf recovers its full measure after repeated resizing in ${mode} @cross-browser`, async ({ page }) => {
    await seed(page, mode === "app-still");
    await page.emulateMedia({ reducedMotion: mode === "system-still" ? "reduce" : "no-preference" });
    await page.route("**/amiri-quran-*.woff2", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.continue();
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/#/quran/42");
    const canvas = page.locator('[data-mushaf-page="42"]');
    await expect(canvas.locator("[data-mushaf-column] > div")).toHaveCount(15);
    await page.evaluate(() => document.fonts.ready);
    const measure = () => canvas.evaluate((node) => parseFloat(node.style.getPropertyValue("--mushaf-measure")));
    await expect.poll(measure).toBeGreaterThan(450);
    const initial = await measure();
    for (const size of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
      { width: 834, height: 1112 },
      { width: 1440, height: 1000 },
    ]) {
      await page.setViewportSize(size);
      await expect
        .poll(() =>
          canvas
            .locator("[data-mushaf-line-content]")
            .first()
            .evaluate((node) => parseFloat(getComputedStyle(node).fontSize)),
        )
        .toBeGreaterThan(12);
      await expect(canvas.locator("[data-mushaf-column] > div")).toHaveCount(15);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    }
    await expect.poll(async () => Math.abs((await measure()) - initial)).toBeLessThanOrEqual(2);
    expect(
      await canvas.evaluate(
        (node) =>
          node.getAnimations({ subtree: true }).filter((animation) => {
            const target = (animation.effect as KeyframeEffect | null)?.target;
            return (
              animation instanceof CSSTransition &&
              target instanceof Element &&
              target.matches(".mushaf-page-frame, [data-mushaf-column], [data-mushaf-line-content]")
            );
          }).length,
      ),
    ).toBe(0);
  });
}

for (const owner of ["wird", "surah"] as const) {
  test(`focus mode expands reading room with a reachable exit in the ${owner} reader @cross-browser`, async ({
    page,
  }, info) => {
    await seed(page, true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(owner === "wird" ? "/#/quran/42" : "/#/azkar/friday-kahf/1");
    if (owner === "surah") await page.getByTestId("reader-mushaf-button").click();
    const canvas = page.locator("[data-mushaf-page]").first();
    await expect(canvas).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const position = await canvas.getAttribute("data-mushaf-page");
    const before = await canvas.locator("[data-mushaf-column]").boundingBox();
    const more = page.getByTestId(owner === "wird" ? "mushaf-more-actions" : "mushaf-immersive-more");
    await more.click();
    await page.getByTestId("mushaf-focus-enter").click();
    const exit = page.getByTestId("mushaf-focus-exit");
    await expect(exit).toBeVisible();
    await expect(exit).toBeFocused();
    await expect(page.locator(".mushaf-page-furniture")).toHaveCount(0);
    await expect
      .poll(async () => (await canvas.locator("[data-mushaf-column]").boundingBox())!.height)
      .toBeGreaterThan(before!.height);
    expect((await exit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await canvas.getAttribute("data-mushaf-page")).toBe(position);
    await page.screenshot({ path: info.outputPath(`${owner}-focus.png`) });
    await exit.click();
    await expect(more).toBeVisible();
    await expect(page.getByTestId("mushaf-focus-toggle")).toBeFocused();
    expect(await canvas.getAttribute("data-mushaf-page")).toBe(position);
  });
}

test("Desktop location and page range capsules share the Mushaf shape @cross-browser", async ({ page }, info) => {
  await seed(page, true);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/#/quran/42");
  await expect(page.locator("[data-mushaf-page]")).toHaveCount(2);
  const styles = [];
  for (const id of ["mushaf-desktop-juz", "mushaf-rail-index", "mushaf-desktop-page-range"]) {
    const button = page.getByTestId(id);
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    styles.push(
      await button
        .locator("span")
        .first()
        .evaluate((node) => {
          const s = getComputedStyle(node);
          return [s.height, s.fontSize, s.fontWeight, s.borderRadius, s.backgroundColor, s.borderColor];
        }),
    );
  }
  expect(styles[0]).toEqual(styles[1]);
  expect(styles[1]).toEqual(styles[2]);
  await page.screenshot({ path: info.outputPath("matching-spread-capsules.png") });
});
