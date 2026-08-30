import { expect, test, type Page } from "@playwright/test";

/**
 * Immersive Mushaf mode: one canonical page per screen with physical
 * right-to-advance navigation shared by buttons, keys, and pointer gestures.
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

    const meaningToggle = page.getByRole("switch", { name: "معاني الكلمات" });
    const closeButton = page.getByTestId("mushaf-immersive-close");
    for (const control of [meaningToggle, closeButton]) {
      const box = await control.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await closeButton.focus();
    for (let index = 0; index < 8; index += 1) await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => document.activeElement?.closest('[data-testid="mushaf-immersive"]') !== null),
    ).toBe(true);

    await expect(page.getByTestId("mushaf-immersive-previous")).toBeDisabled();

    await page.getByTestId("mushaf-immersive-next").click();
    // Wait for AnimatePresence to finish: only one indicator should remain visible.
    await expect(page.getByTestId("mushaf-immersive-indicator")).toHaveCount(1);
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("٢");
    await expect(page.getByTestId("mushaf-immersive-previous")).toBeEnabled();

    await page.getByTestId("mushaf-immersive-previous").click();
    await expect(page.getByTestId("mushaf-immersive-indicator")).toHaveCount(1);
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("١");
    await expect(page.getByTestId("mushaf-immersive-previous")).toBeDisabled();
  });

  test("ArrowLeft advances the page and ArrowRight goes back, and Escape closes", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await openImmersive(page);

    // Physical direction stays consistent across both Mushaf readers.
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("mushaf-immersive-indicator")).toHaveCount(1);
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("٢");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("mushaf-immersive-indicator")).toHaveCount(1);
    await expect(page.getByTestId("mushaf-immersive-indicator")).toContainText("١");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("mushaf-immersive-indicator")).toHaveCount(1);
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
