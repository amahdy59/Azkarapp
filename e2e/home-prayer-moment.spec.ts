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

test("recording the prayer as congregational works without leaving Home", async ({ page }) => {
  /* This pressed one of two places, mosque or home. Recording "at home"
     changed no outcome — the palm and the day's path both count congregation —
     so the question is now the one that matters, asked once. */
  await openHomeAt(page, "2026-09-05T13:30:00");
  const card = page.getByTestId("home-prayer-moment");
  const mosque = card.getByTestId("prayer-action-location").locator("input[type=checkbox]");
  await expect(mosque).not.toBeChecked();

  await mosque.check();

  await expect(mosque).toBeChecked();
  await expect(card.getByTestId("prayer-location-home")).toHaveCount(0);
  // Offered on the spot, and no longer only once something has been recorded:
  // reading the adhkar was never something to earn.
  await expect(card.getByTestId("prayer-open-adhkar")).toBeVisible();
  await expect(page).toHaveURL(/\/?$/);
});

test("a quiet stretch between prayers keeps Home to the compact five", async ({ page }) => {
  // Late evening: Isha is hours past and Fajr is not close.
  await openHomeAt(page, "2026-09-05T22:30:00");
  await expect(page.getByTestId("home-prayer-moment")).toHaveCount(0);
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

/**
 * The English app reads its narrations in English.
 *
 * Everything else was already English — the zikr translation, the benefit, the
 * grading, the reference — while the narration itself stayed Arabic, so an
 * English reader met an Arabic paragraph under an English heading in the one
 * place the app quotes its evidence.
 */
test("the virtue is in English for an English reader, and marked as English", async ({ page }) => {
  await openHomeAt(page, "2026-09-05T13:30:00");
  const virtue = page.getByTestId("home-prayer-moment").getByTestId("prayer-moment-virtue");
  await expect(virtue).toBeVisible();

  const narration = virtue.locator("p[lang]").last();
  await expect(narration).toHaveAttribute("lang", "en");
  await expect(narration).toHaveAttribute("dir", "ltr");
  await expect(narration).toContainText(/congregation|prayers|mosque|Paradise/i);
});
