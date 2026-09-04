import { expect, test, type Page } from "@playwright/test";

/**
 * The Mushaf view a multi-page surah opens in.
 *
 * It no longer has a presentation of its own: it carries the Mushaf's rail, its
 * spread and its page furniture, differing only in the span it may show. It
 * also opens without being asked, so these no longer reach for a menu item —
 * the surah is already showing its pages.
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

/** A multi-page surah arrives in the Mushaf; nothing has to open it. */
async function expectMushafShowing(page: Page) {
  await expect(page.getByTestId("mushaf-immersive")).toBeVisible();
}

/** The page the reader is on, which the rail no longer states in text. */
function currentPages(page: Page) {
  return page.locator("[data-mushaf-page]");
}

test.describe("immersive mushaf mode", () => {
  test("carries the Mushaf's own toolbar and pages within the surah", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await expectMushafShowing(page);

    // Every control still clears the 44px target the bars had to.
    for (const control of [
      page.getByTestId("mushaf-rail-back"),
      page.getByTestId("mushaf-difficult-words-switch"),
      page.getByTestId("mushaf-rail-next"),
    ]) {
      const box = await control.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    // Focus is deliberately not trapped any more. This was a modal, and a modal
    // must hold focus; it is now a mode of the reader, and trapping a keyboard
    // user inside a region of the page — away from the app's own navigation —
    // would be a defect rather than a feature. What matters is that every rail
    // control is reachable in order.
    await page.getByTestId("mushaf-rail-back").focus();
    const reached: string[] = [];
    for (let index = 0; index < 9; index += 1) {
      reached.push(await page.evaluate(() => document.activeElement?.getAttribute("data-testid") ?? ""));
      await page.keyboard.press("Tab");
    }
    for (const id of [
      "mushaf-rail-back",
      "mushaf-rail-index",
      "mushaf-rail-next",
      "mushaf-rail-page-bookmark",
      "mushaf-settings-trigger",
    ]) {
      expect(reached, id).toContain(id);
    }
    // Previous is absent from that list on purpose: the surah opens on its
    // first page, where it is disabled and therefore not focusable.
    expect(reached).not.toContain("mushaf-rail-previous");

    // Al-Kahf opens on 293, the first page of its span.
    await expect(page.getByTestId("mushaf-rail-previous")).toBeDisabled();
    await expect(currentPages(page).first()).toHaveAttribute("data-mushaf-page", "293");

    await page.getByTestId("mushaf-rail-next").click();
    await expect(currentPages(page).first()).not.toHaveAttribute("data-mushaf-page", "293");
    await expect(page.getByTestId("mushaf-rail-previous")).toBeEnabled();

    await page.getByTestId("mushaf-rail-previous").click();
    await expect(currentPages(page).first()).toHaveAttribute("data-mushaf-page", "293");
    await expect(page.getByTestId("mushaf-rail-previous")).toBeDisabled();
  });

  test("ArrowLeft advances the page and ArrowRight goes back, and Escape closes", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await expectMushafShowing(page);

    const firstPage = currentPages(page).first();
    // Physical direction stays consistent across both Mushaf readers.
    await expect(firstPage).toHaveAttribute("data-mushaf-page", "293");
    await page.keyboard.press("ArrowLeft");
    await expect(firstPage).not.toHaveAttribute("data-mushaf-page", "293");
    await page.keyboard.press("ArrowRight");
    await expect(firstPage).toHaveAttribute("data-mushaf-page", "293");
    await page.keyboard.press("ArrowLeft");
    await expect(firstPage).not.toHaveAttribute("data-mushaf-page", "293");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mushaf-immersive")).toBeHidden();
  });

  test("PageUp/PageDown page the same way as the arrow keys, and Home/End jump to the ends", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expectMushafShowing(page);

    const firstPage = currentPages(page).first();
    await expect(firstPage).toHaveAttribute("data-mushaf-page", "293");

    await page.keyboard.press("PageDown");
    await expect(firstPage).not.toHaveAttribute("data-mushaf-page", "293");
    await page.keyboard.press("PageUp");
    await expect(firstPage).toHaveAttribute("data-mushaf-page", "293");

    await page.keyboard.press("End");
    // The rail swaps its next-page button for the completion button once the
    // last page is reached — the surest sign End actually landed there.
    await expect(page.getByTestId("mushaf-immersive-return")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(firstPage).toHaveAttribute("data-mushaf-page", "293");
    await expect(page.getByTestId("mushaf-rail-previous")).toBeDisabled();
  });

  test("F toggles focus mode, and Escape leaves focus mode before leaving the surah", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expectMushafShowing(page);

    await page.keyboard.press("f");
    await expect(page.getByTestId("mushaf-tool-rail")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mushaf-tool-rail")).toBeVisible();
    await expect(page.getByTestId("mushaf-immersive")).toBeVisible();
  });

  test("is offered only for surahs that span multiple mushaf pages", async ({ page }) => {
    await openReaderAt(page, "/#/azkar/morning/1");
    // A zikr that fits on one screen has no Mushaf pages to show, so it neither
    // opens in that view nor offers it.
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await expect(page.getByTestId("mushaf-immersive")).toHaveCount(0);
    await page.getByRole("button", { name: "خيارات القارئ" }).click();
    await expect(page.getByRole("menuitem").first()).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "وضع المصحف" })).toHaveCount(0);
  });

  test("stands alone: the app navigation steps aside while the Mushaf is the body", async ({ page }) => {
    // The Mushaf keeps a page-navigation landmark of its own, so this counts the
    // app's navigation by its label rather than counting landmarks.
    const appNav = page.getByRole("navigation", { name: /التنقل (السفلي|الرئيسي)/ });

    // Tablet width, where the reader normally keeps its navigation — on a phone
    // the reader hides it anyway, so this tier is the one that proves the rule.
    await page.setViewportSize({ width: 834, height: 1112 });
    await openReaderAt(page, "/#/azkar/morning/1");
    // A zikr that is not a Mushaf surah still gets its navigation here.
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await expect(appNav).toHaveCount(1);

    await openReaderAt(page, "/#/azkar/friday-kahf/1");
    await expectMushafShowing(page);
    // The page is the whole surface: no tab bar, rail or sidebar beside it.
    await expect(appNav).toHaveCount(0);

    // Leaving gives it straight back, so the Mushaf cannot strand a reader.
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mushaf-immersive")).toBeHidden();
    await expect(appNav).toHaveCount(1);
  });
});
