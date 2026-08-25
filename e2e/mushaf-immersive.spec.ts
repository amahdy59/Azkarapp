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

test.describe("immersive mushaf mode", () => {
  test("shows one page per screen and pages forward in RTL", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await openImmersive(page);

    await expect(page.getByTestId("mushaf-immersive-previous")).toBeDisabled();

    await page.getByTestId("mushaf-immersive-next").click();
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("٢");
    await expect(page.getByTestId("mushaf-immersive-previous")).toBeEnabled();

    await page.getByTestId("mushaf-immersive-previous").click();
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("١");
    await expect(page.getByTestId("mushaf-immersive-previous")).toBeDisabled();
  });

  test("ArrowRight advances the page and ArrowLeft goes back, and Escape closes", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await openImmersive(page);

    // Physical direction stays consistent across both Mushaf readers.
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("٢");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("١");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("٢");

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
