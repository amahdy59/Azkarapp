import { expect, test, type Page } from "@playwright/test";

/**
 * Home carries the whole prayer card while a prayer is live, and only then.
 *
 * The point of the card is that recording a prayer happening right now costs
 * no navigation. The point of "only then" is that the `now` phase runs until
 * the next adhan — Fajr is `now` until Dhuhr — so a card keyed on the phase
 * alone would sit on Home all day.
 */
async function openHomeAt(page: Page, isoTime: string) {
  await page.clock.setFixedTime(new Date(isoTime));
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight" },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto("/");
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 15000 });
}

test("the prayer card is on Home inside the window, and gone outside it", async ({ page }) => {
  // Half an hour after the Dhuhr adhan: in the window.
  await openHomeAt(page, "2026-09-05T13:30:00");
  const card = page.getByTestId("home-prayer-moment");
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-prayer", "dhuhr");

  // Its parts are the prayer screen's, not a second copy of them.
  await expect(card.getByTestId("prayer-moment-hero")).toBeVisible();
  await expect(card.getByTestId("prayer-action-location")).toBeVisible();
});

test("recording where the prayer was prayed works without leaving Home", async ({ page }) => {
  await openHomeAt(page, "2026-09-05T13:30:00");
  const card = page.getByTestId("home-prayer-moment");
  const mosque = card.getByTestId("prayer-location-mosque");
  await expect(mosque).toHaveAttribute("aria-checked", "false");

  await mosque.click();

  await expect(mosque).toHaveAttribute("aria-checked", "true");
  // The adhkar the prayer unlocks are offered on the spot, not behind a screen.
  await expect(card.getByTestId("prayer-open-adhkar")).toBeVisible();
  await expect(page).toHaveURL(/\/?$/);
});

test("a quiet stretch between prayers keeps Home to the compact five", async ({ page }) => {
  // Mid-morning: Fajr is hours past and Dhuhr is not close.
  await openHomeAt(page, "2026-09-05T09:30:00");
  await expect(page.getByTestId("home-prayer-moment")).toHaveCount(0);
  // The day's five are still there, as they always are.
  await expect(page.getByTestId("after-prayer-trackers")).toBeVisible();
});

/**
 * Every control on the card owns the point a reader aims at.
 *
 * The rawatib card's evidence trigger used to sit in its footer, which on a
 * card that short is the card's own centre — so `elementFromPoint` in the
 * middle of the card returned the button rather than the checkbox that covers
 * the surface, and clicking the middle of the card did not tick it. The
 * keyboard checklist caught it, but only at hours when a prayer happened to be
 * live: Home's content varies with the clock, so the suite's verdict varied
 * with the hour it ran. This holds the case at every hour.
 */
test("each control on the card owns its own centre", async ({ page }) => {
  await openHomeAt(page, "2026-09-05T13:30:00");
  const card = page.getByTestId("home-prayer-moment");
  await expect(card).toBeVisible();

  const obscured = await card.evaluate((root) => {
    const controls = [...root.querySelectorAll<HTMLElement>("input, button, [role='radio']")];
    return controls
      .map((element) => {
        // elementFromPoint reads viewport coordinates, so a control still below
        // the fold would be reported obscured however correct it is.
        element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
        const rect = element.getBoundingClientRect();
        const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        const owned = Boolean(top && (element.contains(top) || top.contains(element)));
        return owned ? null : `${element.tagName}#${element.id || element.dataset.testid || "?"}`;
      })
      .filter(Boolean);
  });

  expect(obscured).toEqual([]);
});
