import { expect, test, type Page } from "@playwright/test";

/** Fresh guest at Home, Arabic, with the prayer tracker on screen. */
async function openHome(page: Page) {
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
  await page.goto("/#/home");
  await expect(page.getByTestId("prayer-tracker-cards")).toBeVisible();
}

/**
 * The first card on screen, whichever prayer that is.
 *
 * Narrow viewports render only the two most actionable cards, so which prayers
 * exist in the DOM depends on the clock and the viewport. Naming one prayer
 * makes the test pass or fail on the time of day.
 */
async function firstTrackedPrayer(page: Page): Promise<string> {
  const prayer = await page
    .getByTestId("prayer-tracker-cards")
    .locator("article[data-prayer]")
    .first()
    .getAttribute("data-prayer");
  expect(prayer).toBeTruthy();
  return prayer!;
}

test.describe("after-prayer tracking", () => {
  test("fills the completion circle with the theme colour when ticked", async ({ page }) => {
    await openHome(page);

    const prayer = await firstTrackedPrayer(page);
    const circle = page.locator(`label:has(#prayer-${prayer}-mosque) .tracking-check`);
    const primary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim(),
    );
    expect(primary).not.toBe("");

    /* Alpha, not the colour string. Chromium serialises the same transparent
       value as `rgba(0, 0, 0, 0)` or `oklab(0 0 0 / 0)` depending on whether a
       transition is in flight, so comparing strings let a pure formatting
       change read as a fill and the assertion passed on CI while the circle
       was still empty. */
    const isOpaque = () =>
      circle.evaluate((el) => {
        const value = getComputedStyle(el).backgroundColor;
        return !/\/\s*0\s*\)/.test(value) && !/rgba\([^)]*,\s*0\s*\)/.test(value) && value !== "transparent";
      });

    expect(await isOpaque()).toBe(false);

    await page.locator(`#prayer-${prayer}-mosque`).check();

    await expect(circle).toHaveAttribute("data-checked", "true");
    // The state was previously announced but invisible: the circle kept a
    // transparent fill, so "completed" and "not completed" looked identical.
    await expect.poll(isOpaque, { timeout: 10_000 }).toBe(true);

    const filled = await circle.evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      border: getComputedStyle(el).borderTopColor,
    }));
    expect(filled.bg).toBe(filled.border);
  });

  test("shows the prayer's virtue after recording it at the mosque, and not on undo", async ({ page }) => {
    await openHome(page);
    const prayer = await firstTrackedPrayer(page);
    await page.locator(`#prayer-${prayer}-mosque`).check();

    const modal = page.getByTestId("prayer-virtue-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId("prayer-virtue-item")).toHaveCount(3);
    await expect(modal.getByTestId("prayer-virtue-closing")).toContainText("تَقَبَّلَ اللهُ");

    await page.getByTestId("prayer-virtue-close").click();
    await expect(modal).toBeHidden();

    // Clearing a mistake must stay silent.
    await page.locator(`#prayer-${prayer}-mosque`).uncheck();
    await expect(modal).toBeHidden();
  });

  test("scrolls rather than squeezing the cards where five columns do not fit", async ({ page }) => {
    await openHome(page);
    const grid = page.getByTestId("prayer-tracker-cards");
    const cards = grid.locator("article[data-prayer]");

    // The tightest tier: five columns just turned on, with the least room.
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(cards).toHaveCount(5);

    const tight = await grid.evaluate((el) => ({
      cardWidth: el.querySelector("article")!.getBoundingClientRect().width,
      scrollable: el.scrollWidth > el.clientWidth,
    }));
    /* Equal columns squeezed each card to 151px here, which left the tracking
       labels exactly as much room as they needed and nothing to spare. */
    expect(tight.cardWidth).toBeGreaterThanOrEqual(175);
    expect(tight.scrollable).toBe(true);

    // Nothing may leave its own card at any width.
    const escaped = await grid.evaluate((el) => {
      let count = 0;
      for (const card of el.querySelectorAll("article")) {
        const box = card.getBoundingClientRect();
        for (const child of card.querySelectorAll("*")) {
          const r = child.getBoundingClientRect();
          if (r.width && (r.left < box.left - 2 || r.right > box.right + 2)) count += 1;
        }
      }
      return count;
    });
    expect(escaped).toBe(0);

    // Wide viewports still fit all five without a scrollbar.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(async () => grid.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(false);
  });

  test("shows every prayer on desktop and two with a reveal below it on mobile", async ({ page }) => {
    await openHome(page);
    const cards = page.getByTestId("prayer-tracker-cards").locator("article");

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(cards).toHaveCount(5);
    await expect(page.getByTestId("prayer-show-upcoming")).toHaveCount(0);

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(cards).toHaveCount(2);
    await page.getByTestId("prayer-show-upcoming").click();
    await expect(cards).toHaveCount(5);
  });
});
