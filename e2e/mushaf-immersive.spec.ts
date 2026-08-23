import { expect, test, type Page } from "@playwright/test";

/**
 * Immersive mushaf mode: one page per screen, flipped sideways.
 *
 * These assertions need a real compositing browser. The paging is a scroll
 * snap track, so both the movement and the page indicator ride on scroll
 * events, and those only fire on an animation frame.
 */

/** Reduce motion is on so pages jump rather than glide — the landing position
 *  is identical either way, and CI does not have to wait out an animation. */
async function openReaderAt(page: Page, route: string) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto(route);
}

async function openImmersive(page: Page) {
  await page.getByRole("button", { name: "خيارات القارئ" }).click();
  await page.getByRole("menuitem", { name: "وضع المصحف" }).click();
  await expect(page.getByTestId("mushaf-immersive")).toBeVisible();
}

/** Absolute value because an RTL track scrolls into negative scrollLeft. */
async function scrolled(page: Page): Promise<number> {
  return Math.round(
    Math.abs(await page.getByTestId("mushaf-immersive-track").evaluate((el) => (el as HTMLElement).scrollLeft)),
  );
}

test.describe("immersive mushaf mode", () => {
  test("shows one page per screen and pages forward in RTL", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expect(page.getByTestId("mushaf-pages")).toBeVisible();
    await openImmersive(page);

    const trackWidth = await page
      .getByTestId("mushaf-immersive-track")
      .evaluate((el) => (el as HTMLElement).clientWidth);
    const pageWidth = await page
      .getByTestId("mushaf-immersive-page")
      .first()
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.abs(pageWidth - trackWidth)).toBeLessThanOrEqual(1);

    await expect(page.getByTestId("mushaf-immersive-previous")).toBeDisabled();

    await page.getByTestId("mushaf-immersive-next").click();
    await expect.poll(() => scrolled(page)).toBe(trackWidth);
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("٢");
    await expect(page.getByTestId("mushaf-immersive-previous")).toBeEnabled();

    await page.getByTestId("mushaf-immersive-previous").click();
    await expect.poll(() => scrolled(page)).toBe(0);
    await expect(page.getByTestId("mushaf-immersive-previous")).toBeDisabled();
  });

  test("ArrowLeft advances the page and ArrowRight goes back, and Escape closes", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expect(page.getByTestId("mushaf-pages")).toBeVisible();
    await openImmersive(page);

    const trackWidth = await page
      .getByTestId("mushaf-immersive-track")
      .evaluate((el) => (el as HTMLElement).clientWidth);

    // The pages are bound right-to-left, so left goes forward and right goes
    // back — the same rule the Mushaf reader follows (DEC-094).
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => scrolled(page)).toBe(trackWidth);
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => scrolled(page)).toBe(0);
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => scrolled(page)).toBe(trackWidth);

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mushaf-immersive")).toBeHidden();
  });

  test("is offered only for surahs that span multiple mushaf pages", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/morning/1");
    await page.getByRole("button", { name: "خيارات القارئ" }).click();
    await expect(page.getByRole("menuitem").first()).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "وضع المصحف" })).toHaveCount(0);
  });
});
