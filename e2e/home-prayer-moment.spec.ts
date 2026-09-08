import { expect, test, type Page } from "@playwright/test";

/**
 * Home carries the whole prayer card while a prayer is live, and only then.
 *
 * The point of the card is that recording a prayer happening right now costs
 * no navigation. The point of "only then" is that the `now` phase runs until
 * the next adhan — Fajr is `now` until Dhuhr — so a card keyed on the phase
 * alone would sit on Home all day.
 */
async function openHomeAt(page: Page, isoTime: string, language: "ar" | "en" = "en") {
  // Append +03:00 to ensure the time evaluates correctly relative to Africa/Cairo (the playwright timezoneId).
  await page.clock.setFixedTime(new Date(`${isoTime}+03:00`));
  await page.addInitScript((selectedLanguage) => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: selectedLanguage, themeMode: "midnight" },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  }, language);
  await page.goto("/");
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 15000 });
}

test("the prayer card is on Home inside the window, and gone outside it", async ({ page }) => {
  await openHomeAt(page, "2026-09-05T13:20:00");
  const card = page.getByTestId("home-prayer-moment");
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-prayer", "dhuhr");

  // Its parts are the prayer screen's, not a second copy of them.
  await expect(card.getByTestId("prayer-moment-hero")).toBeVisible();
  await expect(card.getByTestId("prayer-action-location")).toBeVisible();

  const strip = page.getByTestId("home-prayer-strip");
  await expect(strip).toBeVisible();
  expect(
    await strip.evaluate((element) => {
      const contextElement = document.querySelector('[data-testid="home-context-grid"]');
      return Boolean(
        contextElement && element.compareDocumentPosition(contextElement) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }),
  ).toBe(true);
  await expect(card).toHaveClass(/hero-glass/);
  await expect(card.locator(".hero-glass")).toHaveCount(0);
});

test("recording the prayer as congregational works without leaving Home", async ({ page }) => {
  /* This pressed one of two places, mosque or home. Recording "at home"
     changed no outcome — the palm and the day's path both count congregation —
     so the question is now the one that matters, asked once. */
  await openHomeAt(page, "2026-09-05T13:20:00");
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

  // A recorded prayer confirms in place, then yields Home to its routine.
  await page.clock.setFixedTime(new Date("2026-09-05T13:26:00+03:00"));
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(card).toHaveCount(0);
});

test("the contextual prayer closes thirty minutes after the adhan", async ({ page }) => {
  await openHomeAt(page, "2026-09-05T13:40:00");
  await expect(page.getByTestId("home-prayer-moment")).toHaveCount(0);
  await expect(page.getByTestId("home-prayer-strip")).toBeVisible();
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
  await openHomeAt(page, "2026-09-05T13:20:00");
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
  await openHomeAt(page, "2026-09-05T13:20:00");
  const virtue = page.getByTestId("home-prayer-moment").getByTestId("prayer-moment-virtue");
  await expect(virtue).toBeVisible();

  const narration = virtue.locator("p[lang]").last();
  await expect(narration).toHaveAttribute("lang", "en");
  await expect(narration).toHaveAttribute("dir", "ltr");
  await expect(narration).toContainText(/congregation|prayers|mosque|Paradise/i);
});

test("tracking uses a circular keyboard focus indicator and mirrors in RTL", async ({ page }) => {
  await openHomeAt(page, "2026-09-05T13:20:00", "ar");
  const row = page.getByTestId("prayer-action-location");
  const input = row.locator("input[type=checkbox]");
  const indicator = row.locator(".tracking-check");
  const copy = row.locator("div").first();

  await input.click();
  expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
  await input.click();
  await expect(indicator).not.toHaveAttribute("data-checked");
  await page.waitForTimeout(250);
  expect(await indicator.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");

  await page.keyboard.press("Tab");
  await input.focus();
  expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
  expect(await indicator.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");

  const indicatorBox = await indicator.boundingBox();
  const copyBox = await copy.boundingBox();
  expect(indicatorBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  expect(indicatorBox!.x).toBeLessThan(copyBox!.x);
});
