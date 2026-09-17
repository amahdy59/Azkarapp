import { expect, test, type Page } from "@playwright/test";

/**
 * Progress charts on a phone.
 *
 * The existing responsive checks assert on `document.documentElement`, which
 * is why this went unnoticed: the year chart overflowed its own card by 37px
 * and pushed that through four ancestors, but the page itself never scrolled
 * sideways, so nothing failed. These measure the elements instead.
 */
async function openProgress(page: Page) {
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
  await page.goto("/#/progress");
  await expect(page.getByTestId("today-garden-card")).toBeVisible();
}

/** Elements whose content is wider than the box they are drawn in. */
async function overflowingElements(page: Page) {
  return page.evaluate(() => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll(".page-content-center *")) {
      const style = getComputedStyle(el);
      if (style.overflowX !== "visible") continue;
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) {
        bad.push(`${el.className.toString().slice(0, 40)} (${el.scrollWidth} in ${el.clientWidth})`);
      }
    }
    return bad;
  });
}

for (const tab of ["يوم", "أسبوع", "شهر", "سنة"]) {
  test(`Progress "${tab}" fits a 375px phone without content spilling`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openProgress(page);

    await page.getByRole("tab", { name: tab, exact: true }).click();
    // The chart is the slowest thing to settle; wait on the panel, not a timer.
    await expect(page.getByTestId("today-garden-card")).toBeVisible();

    await expect.poll(() => overflowingElements(page), { timeout: 10_000 }).toEqual([]);

    const pageScrolls = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(pageScrolls).toBe(false);
  });
}
